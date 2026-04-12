
import React from 'react';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ value, onChange, placeholder }) => {
  return (
    <div className="relative flex flex-1 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-inner">
      <div className="flex flex-col bg-slate-50 border-r border-slate-200 px-3 py-4 text-slate-400 text-sm font-mono select-none">
        {value.split('\n').map((_, i) => (
          <div key={i} className="h-6 leading-6 text-right w-6">
            {i + 1}
          </div>
        ))}
      </div>
      <textarea
        className="flex-1 p-4 font-mono text-sm leading-6 resize-none focus:outline-none bg-transparent"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || "Enter your HTML here..."}
        spellCheck={false}
      />
    </div>
  );
};
