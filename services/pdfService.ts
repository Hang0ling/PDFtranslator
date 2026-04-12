
import { PDFSettings, PageSize } from '../types';

declare const html2pdf: any;
declare const renderMathInElement: any;
declare global {
  interface Window {
    katex: any;
  }
}

export const generatePDF = async (element: HTMLElement, settings: PDFSettings, filename: string = 'document.pdf', themeStyle: string = '') => {
  const isAdaptive = settings.pageSize === PageSize.ADAPTIVE;
  
  // Base options for html2pdf
  const opt: any = {
    margin: [settings.marginTop, settings.marginLeft, settings.marginBottom, settings.marginRight],
    filename: filename,
    image: { type: 'jpeg', quality: 0.98 },
    enableLinks: true,
    html2canvas: { 
      scale: 2, // 降低缩放比例以提高稳定性和性能，避免大图白屏
      useCORS: true,
      letterRendering: true,
      scrollY: 0,
      scrollX: 0,
      windowWidth: 1200 // 强制指定窗口宽度，确保布局一致
    },
    jsPDF: { 
      unit: 'mm', 
      compress: true
    }
  };

  // Configure page breaking and format
  if (isAdaptive) {
    // 自适应模式下，我们先给一个默认格式，稍后在渲染后根据内容高度修正
    const widthMm = settings.orientation === 'portrait' ? 210 : 297;
    opt.jsPDF.format = [widthMm, 297]; 
    opt.jsPDF.orientation = settings.orientation;
    opt.pagebreak = { mode: [] }; // 禁用分页
  } else {
    opt.pagebreak = { mode: ['avoid-all', 'css', 'legacy'] };
    opt.jsPDF.format = settings.pageSize;
    opt.jsPDF.orientation = settings.orientation;
  }

  // 创建临时容器
  const wrapper = document.createElement('div');
  // 关键修复：不要将元素移出屏幕 (-9999px)，这会导致 html2canvas 渲染空白
  // 改为固定定位在左上角，但透明度极低，这样对用户不可见但对截图引擎可见
  wrapper.style.position = 'fixed';
  wrapper.style.top = '0';
  wrapper.style.left = '0';
  wrapper.style.width = '100%'; 
  wrapper.style.zIndex = '-9999';
  wrapper.style.opacity = '0.01'; 
  wrapper.style.pointerEvents = 'none';
  wrapper.style.backgroundColor = '#ffffff'; // 确保背景是白色的

  try {
    // 注入主题样式
    const styleTag = document.createElement('style');
    const basePrintStyles = `
      .pdf-export-container {
         font-variant-ligatures: no-common-ligatures;
      }
      p, h1, h2, h3, h4, h5, h6, li, tr, td, th, img, pre, blockquote, figure {
        page-break-inside: avoid;
        break-inside: avoid;
      }
      table, pre {
        page-break-inside: auto;
      }
      tr {
        page-break-inside: avoid;
        page-break-after: auto;
      }
      img {
        max-width: 100% !important;
      }
    `;
    styleTag.textContent = basePrintStyles + themeStyle;
    wrapper.appendChild(styleTag);

    // 创建内容容器
    const inner = document.createElement('div');
    inner.className = 'preview-content pdf-export-container';
    
    // 计算可打印区域宽度
    const pageWidthMm = settings.orientation === 'portrait' ? 210 : 297; 
    const printableWidthMm = pageWidthMm - settings.marginLeft - settings.marginRight;
    
    // 应用尺寸限制
    inner.style.width = `${printableWidthMm}mm`;
    inner.style.maxWidth = `${printableWidthMm}mm`;
    inner.style.padding = '0'; // 内边距由 PDF margin 参数控制
    inner.style.margin = '0';
    inner.style.lineHeight = settings.lineHeight.toString();
    inner.style.fontSize = `${settings.fontSize}px`;
    inner.style.backgroundColor = 'white';
    
    if (isAdaptive) {
        inner.style.minHeight = '100mm'; 
    }
    
    // 复制内容
    // 使用 innerHTML 复制而非 cloneNode，避免外层容器类名重复导致的样式问题
    inner.innerHTML = element.innerHTML;
    
    wrapper.appendChild(inner);
    document.body.appendChild(wrapper);

    // 等待图片加载和布局稳定
    await new Promise(resolve => setTimeout(resolve, 800));

    // 自适应模式下，计算实际内容高度并更新 jsPDF 配置
    if (isAdaptive) {
        const pixelToMm = 0.264583;
        const renderedHeightPx = inner.scrollHeight;
        const mmHeight = renderedHeightPx * pixelToMm;
        
        // 总高度 = 内容高度 + 上下边距
        const totalHeight = mmHeight + settings.marginTop + settings.marginBottom;
        
        // 更新页面格式
        opt.jsPDF.format = [
            settings.orientation === 'portrait' ? 210 : 297, 
            totalHeight
        ];
    }

    // 生成 PDF
    await html2pdf().set(opt).from(inner).save();
    
  } catch (error) {
    console.error("PDF Export Error:", error);
    throw error;
  } finally {
    // 清理 DOM
    if (document.body.contains(wrapper)) {
      document.body.removeChild(wrapper);
    }
  }
};
