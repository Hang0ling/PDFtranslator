
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Toolbar } from './components/Toolbar';
import { CodeEditor } from './components/CodeEditor';
import { PDFSettings, PageSize, Orientation, ThemeType } from './types';
import { generatePDF } from './services/pdfService';
import { marked } from 'marked';

declare const renderMathInElement: any;
declare global {
  interface Window {
    katex: any;
  }
}

const THEME_STYLES: Record<ThemeType, string> = {
  default: `
    .preview-content { font-family: 'Inter', sans-serif; color: #334155; }
    .preview-content h1 { color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.3em; }
    .preview-content blockquote { border-left: 4px solid #cbd5e1; padding-left: 1em; color: #64748b; font-style: italic; }
  `,
  professional: `
    .preview-content { font-family: 'Inter', sans-serif; color: #1e293b; }
    .preview-content h1 { color: #1d4ed8; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 2px solid #1d4ed8; padding-bottom: 10px; }
    .preview-content h2 { color: #1e40af; border-left: 4px solid #1d4ed8; padding-left: 12px; }
    .preview-content table th { background-color: #f8fafc; color: #1e40af; }
    .preview-content blockquote { background: #eff6ff; border-left: 4px solid #1d4ed8; padding: 1em; border-radius: 0 8px 8px 0; }
  `,
  academic: `
    .preview-content { font-family: 'Noto Sans SC', serif; color: #000; text-align: justify; }
    .preview-content h1 { text-align: center; font-size: 2.2em; margin-bottom: 1.5em; font-weight: 700; }
    .preview-content h2 { border-bottom: 1px solid #000; padding-bottom: 5px; margin-top: 1.5em; }
    .preview-content p { text-indent: 2em; margin-bottom: 0.8em; }
    .preview-content table { border: 2px solid #000; }
    .preview-content th, .preview-content td { border: 1px solid #000; }
  `,
  modern: `
    .preview-content { font-family: 'Inter', sans-serif; color: #111; }
    .preview-content h1 { font-size: 3.5em; font-weight: 900; letter-spacing: -0.05em; line-height: 1; margin-bottom: 0.5em; background: linear-gradient(to right, #000, #666); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .preview-content h2 { font-size: 1.8em; font-weight: 800; margin-top: 2em; color: #000; }
    .preview-content hr { border: 0; height: 4px; background: #000; margin: 2em 0; }
    .preview-content blockquote { font-size: 1.2em; border: 0; padding: 1.5em; background: #f3f4f6; font-weight: 500; }
  `,
  elegant: `
    .preview-content { font-family: 'Inter', sans-serif; color: #444; }
    .preview-content h1 { font-weight: 300; font-size: 2.8em; text-align: center; color: #111; margin-bottom: 1em; }
    .preview-content h1::after { content: ''; display: block; width: 40px; height: 1px; background: #999; margin: 20px auto; }
    .preview-content h2 { font-weight: 400; color: #666; font-style: italic; border-bottom: 1px solid #eee; }
    .preview-content blockquote { text-align: center; border: 0; font-style: italic; color: #888; padding: 2em; }
  `
};

const INITIAL_MD = `# 数学公式支持测试报告

您可以直接输入 LaTeX 公式，系统将自动渲染。

### 1. 行内公式
这是一段包含数学公式的文本。例如，勾股定理可以表示为 $a^2 + b^2 = c^2$。

### 2. 块级公式
以下是著名的欧拉恒等式：

$$e^{i\pi} + 1 = 0$$

更复杂的矩阵或积分也没问题：

$$
\\int_{a}^{b} f(x) \\,dx = F(b) - F(a)
$$

### 3. 矩阵测试 (Matrix)
$$
\\begin{bmatrix}
a & b \\\\
c & d
\\end{bmatrix}
$$

### 4. 表格与公式结合
| 公式名称 | 表达式 |
| :--- | :--- |
| 质能方程 | $E = mc^2$ |
| 熵增定律 | $\\Delta S \\geq 0$ |

> 提示：行内公式请使用单美元符号 \`$\` 包裹，块级公式请使用双美元符号 \`$$\` 包裹。

### 5. 长文档测试
为了测试多页效果，这里添加一些占位文本。

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
`;

// Helper to protect math blocks from markdown parsing
const parseMarkdownWithMath = (text: string) => {
  const mathBlocks: string[] = [];
  // Replace display math $$...$$
  let protectedText = text.replace(/\$\$([\s\S]*?)\$\$/g, (match) => {
    mathBlocks.push(match);
    return `%%%MATH_BLOCK_${mathBlocks.length - 1}%%%`;
  });
  // Replace inline math $...$
  protectedText = protectedText.replace(/\$([^\$\n]+?)\$/g, (match) => {
    mathBlocks.push(match);
    return `%%%MATH_INLINE_${mathBlocks.length - 1}%%%`;
  });
  
  // Parse markdown
  let html = marked.parse(protectedText) as string;

  // Restore math blocks
  html = html
    .replace(/%%%MATH_BLOCK_(\d+)%%%/g, (_, index) => mathBlocks[parseInt(index)])
    .replace(/%%%MATH_INLINE_(\d+)%%%/g, (_, index) => mathBlocks[parseInt(index)]);
    
  return html;
};

export default function App() {
  const [content, setContent] = useState(INITIAL_MD);
  const [mode, setMode] = useState<'html' | 'markdown'>('markdown');
  const [settings, setSettings] = useState<PDFSettings>({
    pageSize: PageSize.A4,
    orientation: Orientation.PORTRAIT,
    marginTop: 20,
    marginBottom: 20,
    marginLeft: 20,
    marginRight: 20,
    lineHeight: 1.6,
    fontSize: 16,
    theme: 'default'
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('preview');
  
  const previewRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 渲染 HTML
  const renderedHTML = useMemo(() => {
    if (mode === 'markdown') {
      try {
        return parseMarkdownWithMath(content);
      } catch (e) {
        return '<p style="color:red">Markdown 解析错误</p>';
      }
    }
    return content;
  }, [content, mode]);

  // 处理公式渲染
  useEffect(() => {
    const renderMath = () => {
      // 检查 KaTeX 是否加载
      if (typeof window !== 'undefined' && window.katex && !window.katex.__shimmed) {
        // Monkey-patch katex.render to use renderToString
        // This bypasses the strict "quirks mode" check in katex.render
        const originalRender = window.katex.render;
        window.katex.render = (tex: string, element: HTMLElement, options: any) => {
           element.innerHTML = window.katex.renderToString(tex, options);
        };
        window.katex.__shimmed = true;
      }

      if (previewRef.current && typeof renderMathInElement !== 'undefined') {
        try {
          renderMathInElement(previewRef.current, {
            delimiters: [
              { left: '$$', right: '$$', display: true },
              { left: '$', right: '$', display: false },
              { left: '\\(', right: '\\)', display: false },
              { left: '\\[', right: '\\]', display: true }
            ],
            throwOnError: false
          });
        } catch (err) {
          console.warn("KaTeX rendering encountered an error:", err);
        }
      }
    };

    // Use a small delay to ensure scripts are fully loaded and DOM is ready
    const timeoutId = setTimeout(renderMath, 100);
    return () => clearTimeout(timeoutId);
  }, [renderedHTML, settings.theme]);

  const handleExport = async () => {
    if (!previewRef.current) return;
    setIsProcessing(true);
    try {
      await generatePDF(previewRef.current, settings, 'document.pdf', THEME_STYLES[settings.theme]);
    } catch (err) {
      console.error(err);
      alert('PDF 导出失败: ' + (err instanceof Error ? err.message : '未知错误'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const isMd = file.name.endsWith('.md');
      setMode(isMd ? 'markdown' : 'html');
      const reader = new FileReader();
      reader.onload = (event) => {
        setContent(event.target?.result as string);
        setActiveTab('preview');
      };
      reader.readAsText(file);
    }
  };

  // Determine paper dimensions
  const isAdaptive = settings.pageSize === PageSize.ADAPTIVE;
  const isPortrait = settings.orientation === Orientation.PORTRAIT;
  
  // Standard A4 dimensions
  const standardWidthMm = isPortrait ? 210 : 297;
  const standardHeightMm = isPortrait ? 297 : 210;
  
  // Visual width
  const displayWidthMm = standardWidthMm;
  
  // Background styles
  const backgroundStyle = isAdaptive 
    ? { 
        minHeight: `${standardHeightMm}mm`,
        height: 'auto', // Allow growing indefinitely
        padding: `${settings.marginTop}mm ${settings.marginRight}mm ${settings.marginBottom}mm ${settings.marginLeft}mm`,
      } 
    : {
        minHeight: `${standardHeightMm}mm`,
        // Gradient for page break simulation
        backgroundImage: `linear-gradient(to bottom, transparent calc(${standardHeightMm}mm - 1px), #e2e8f0 calc(${standardHeightMm}mm - 1px), #e2e8f0 ${standardHeightMm}mm)`,
        backgroundSize: `100% ${standardHeightMm}mm`,
        padding: `${settings.marginTop}mm ${settings.marginRight}mm ${settings.marginBottom}mm ${settings.marginLeft}mm`,
      };

  return (
    <div className="min-h-screen flex flex-col h-screen overflow-hidden">
      <style>{THEME_STYLES[settings.theme]}</style>
      
      <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <i className="fa-solid fa-print text-blue-600 text-xl"></i>
          <h1 className="text-lg font-bold text-slate-800 uppercase tracking-tight">PaperFlow <span className="text-slate-400 font-normal">PDF</span></h1>
        </div>
        <div className="flex md:hidden bg-slate-100 p-1 rounded-lg text-xs font-bold">
           <button onClick={() => setActiveTab('editor')} className={`px-3 py-1 rounded ${activeTab === 'editor' ? 'bg-white shadow' : ''}`}>编辑</button>
           <button onClick={() => setActiveTab('preview')} className={`px-3 py-1 rounded ${activeTab === 'preview' ? 'bg-white shadow' : ''}`}>预览</button>
        </div>
      </header>

      <Toolbar 
        settings={settings} 
        onSettingsChange={setSettings} 
        onExport={handleExport}
        onUpload={() => fileInputRef.current?.click()}
        isProcessing={isProcessing}
        mode={mode}
        onModeChange={setMode}
      />
      
      <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".html,.md" className="hidden" />

      <main className="flex-1 flex overflow-hidden">
        <div className={`flex-1 flex flex-col p-4 bg-slate-50 border-r border-slate-200 ${activeTab === 'editor' ? 'flex' : 'hidden md:flex'}`}>
          <CodeEditor 
            value={content} 
            onChange={setContent} 
            placeholder={mode === 'markdown' ? "输入 Markdown 内容..." : "输入 HTML 内容..."} 
          />
        </div>

        <div className={`flex-1 flex flex-col bg-slate-200/50 overflow-auto p-4 md:p-10 ${activeTab === 'preview' ? 'flex' : 'hidden md:flex'}`}>
          <div className="flex justify-center pb-10">
            <div 
              className="bg-white shadow-2xl transition-all duration-300"
              style={{
                width: `${displayWidthMm}mm`,
                lineHeight: settings.lineHeight,
                fontSize: `${settings.fontSize}px`,
                ...backgroundStyle
              }}
            >
              <div 
                ref={previewRef}
                className="preview-content w-full"
                dangerouslySetInnerHTML={{ __html: renderedHTML }}
              />
            </div>
          </div>
        </div>
      </main>

      {isProcessing && (
        <div className="fixed inset-0 bg-white/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-slate-900 text-white px-8 py-5 rounded-2xl shadow-2xl flex flex-col items-center gap-4">
            <i className="fa-solid fa-circle-notch fa-spin text-3xl text-blue-400"></i>
            <span className="font-bold tracking-widest uppercase text-xs">生成高清 PDF 中...</span>
          </div>
        </div>
      )}
    </div>
  );
}
