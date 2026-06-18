# ProHTML PDF Converter

ProHTML PDF Converter is a browser-based Markdown and HTML to PDF tool. It provides a live editor, themeable preview, math rendering, page controls, and client-side PDF export.

Original AI Studio project:
https://ai.studio/apps/drive/17WVHSPXnxv6rgZEsQxfQo4-x0y3mGXFx

## What It Does

- Edits Markdown or raw HTML in the browser.
- Converts Markdown to HTML with `marked`.
- Preserves and renders math expressions with KaTeX.
- Shows a live document preview.
- Supports document themes such as default, professional, academic, modern, and elegant.
- Exports the preview to PDF with configurable page size, orientation, and margins.
- Supports HTML and Markdown file upload.

## Tech Stack

- React 19
- TypeScript
- Vite
- `marked`
- KaTeX loaded in the browser
- `html2pdf.js` loaded in the browser

## Project Structure

- `App.tsx` - Editor, preview, settings state, math rendering, and export flow.
- `components/CodeEditor.tsx` - Text editor component.
- `components/Toolbar.tsx` - Page size, orientation, margin, mode, and theme controls.
- `services/pdfService.ts` - PDF export logic.
- `services/geminiService.ts` - Placeholder AI service hooks; currently no active Gemini call.
- `types.ts` - PDF settings and theme types.

## Requirements

- Node.js 18 or newer
- No API key is required for the current PDF conversion workflow

The Vite config still supports `GEMINI_API_KEY` because this project originated from AI Studio, but the current app does not require it to run.

## Run Locally

```bash
npm install
npm run dev
```

Then open the local URL printed by Vite.

## Build

```bash
npm run build
npm run preview
```

## Notes

- PDF export is performed in the browser, so output may vary slightly by browser rendering engine.
- Very long documents or large images may take longer to export.
- The default document content in `App.tsx` is a math rendering test and can be replaced.
