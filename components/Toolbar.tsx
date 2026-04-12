
import React from 'react';
import { PDFSettings, PageSize, ThemeType } from '../types';

interface ToolbarProps {
  settings: PDFSettings;
  onSettingsChange: (settings: PDFSettings) => void;
  onExport: () => void;
  onUpload: () => void;
  isProcessing: boolean;
  mode: 'html' | 'markdown';
  onModeChange: (mode: 'html' | 'markdown') => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({ 
  settings, 
  onSettingsChange, 
  onExport, 
  onUpload,
  isProcessing,
  mode,
  onModeChange
}) => {
  return (
    <div className="bg-white border-b border-slate-200 p-4 sticky top-0 z-20 flex flex-wrap items-center justify-between gap-6 shadow-sm">
      <div className="flex items-center gap-6">
        {/* 模式切换 */}
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button 
            onClick={() => onModeChange('html')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${mode === 'html' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            HTML
          </button>
          <button 
            onClick={() => onModeChange('markdown')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${mode === 'markdown' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Markdown
          </button>
        </div>

        {/* 风格选择 */}
        <div className="flex flex-col">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-1">排版风格</label>
          <select 
            className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs font-bold text-blue-600 focus:outline-none"
            value={settings.theme}
            onChange={(e) => onSettingsChange({ ...settings, theme: e.target.value as ThemeType })}
          >
            <option value="default">简约标准</option>
            <option value="professional">商务办公</option>
            <option value="academic">学术报告</option>
            <option value="modern">现代设计</option>
            <option value="elegant">优雅别致</option>
          </select>
        </div>

        <div className="h-8 w-[1px] bg-slate-200 mx-1 hidden md:block"></div>
        
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-1">纸张</label>
            <select 
              className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs font-medium focus:outline-none"
              value={settings.pageSize}
              onChange={(e) => onSettingsChange({ ...settings, pageSize: e.target.value as PageSize })}
            >
              <option value={PageSize.A4}>A4</option>
              <option value={PageSize.LETTER}>Letter</option>
              <option value={PageSize.ADAPTIVE}>自适应长图</option>
            </select>
          </div>

          {/* 边距设置组 */}
          <div className="flex gap-2 bg-slate-50 p-1 rounded border border-slate-200">
            <div className="flex flex-col items-center">
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mb-0.5">上边距</label>
              <input 
                type="number" 
                className="w-10 bg-white border border-slate-200 rounded px-1 py-0.5 text-xs font-medium text-center"
                value={settings.marginTop}
                onChange={(e) => onSettingsChange({ ...settings, marginTop: parseInt(e.target.value) || 0 })}
                title="Top Margin (mm)"
              />
            </div>
            <div className="flex flex-col items-center">
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mb-0.5">下边距</label>
              <input 
                type="number" 
                className="w-10 bg-white border border-slate-200 rounded px-1 py-0.5 text-xs font-medium text-center"
                value={settings.marginBottom}
                onChange={(e) => onSettingsChange({ ...settings, marginBottom: parseInt(e.target.value) || 0 })}
                title="Bottom Margin (mm)"
              />
            </div>
            <div className="flex flex-col items-center">
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mb-0.5">左右</label>
              <input 
                type="number" 
                className="w-10 bg-white border border-slate-200 rounded px-1 py-0.5 text-xs font-medium text-center"
                value={settings.marginLeft}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 0;
                  onSettingsChange({ ...settings, marginLeft: val, marginRight: val });
                }}
                title="Side Margins (mm)"
              />
            </div>
          </div>

          <div className="flex flex-col">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-1">行高</label>
            <input 
              type="number" 
              step="0.1"
              className="w-12 bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs font-medium"
              value={settings.lineHeight}
              onChange={(e) => onSettingsChange({ ...settings, lineHeight: parseFloat(e.target.value) || 1 })}
            />
          </div>

          <div className="flex flex-col">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-1">字号</label>
            <input 
              type="number" 
              className="w-12 bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs font-medium"
              value={settings.fontSize}
              onChange={(e) => onSettingsChange({ ...settings, fontSize: parseInt(e.target.value) || 12 })}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button 
          onClick={onUpload}
          className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg text-sm font-semibold transition-all border border-slate-200"
        >
          <i className="fa-solid fa-file-import"></i>
          上传
        </button>
        <button 
          onClick={onExport}
          className="flex items-center gap-2 px-6 py-2 bg-slate-900 hover:bg-black text-white rounded-lg text-sm font-semibold transition-all shadow-lg disabled:opacity-50"
          disabled={isProcessing}
        >
          {isProcessing ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-download"></i>}
          导出 PDF
        </button>
      </div>
    </div>
  );
};