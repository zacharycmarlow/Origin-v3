import type { Editor } from '@tiptap/react';

/* ═══════════════════════════════════════════════════════════════
   FileTextExtractor — extract text from uploaded files and insert
   it into the TipTap editor.

   Supports:
   - Images (JPG, PNG, etc.) → OCR via tesseract.js (Apache 2.0)
   - PDF → text extraction via pdfjs-dist (Apache 2.0)
   - DOCX → text extraction via mammoth (BSD-2-Clause)
   - Plain text files → direct read

   All processing happens in-browser. No files leave the device.
   ═══════════════════════════════════════════════════════════════ */

export type ExtractStatus = 'idle' | 'extracting' | 'done' | 'error';

export interface ExtractResult {
  text: string;
  images?: string[]; // data URLs for embedded images (PDF pages, etc.)
}

/** Extract text from an image using Tesseract.js (OCR). */
async function extractFromImage(file: File): Promise<ExtractResult> {
  const { createWorker } = await import('tesseract.js');
  const worker = await createWorker('eng');
  try {
    const { data } = await worker.recognize(file);
    return { text: data.text.trim() };
  } finally {
    await worker.terminate();
  }
}

/** Extract text from a PDF using pdfjs-dist. */
async function extractFromPdf(file: File): Promise<ExtractResult> {
  const pdfjs = await import('pdfjs-dist');
  // Use the worker bundled by Vite
  const workerUrl = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
  ).toString();
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  const textParts: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item: any) => item.str)
      .join(' ')
      .trim();
    if (pageText) textParts.push(pageText);
  }

  return { text: textParts.join('\n\n') };
}

/** Extract text from a DOCX using mammoth. */
async function extractFromDocx(file: File): Promise<ExtractResult> {
  const mammoth = await import('mammoth');
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return { text: result.value.trim() };
}

/** Extract text from a plain text file. */
async function extractFromText(file: File): Promise<ExtractResult> {
  const text = await file.text();
  return { text: text.trim() };
}

/** Main entry point — detects file type and routes to the right extractor. */
export async function extractTextFromFile(file: File): Promise<ExtractResult> {
  const name = file.name.toLowerCase();
  const type = file.type;

  if (type.startsWith('image/') || /\.(jpg|jpeg|png|gif|bmp|webp|tiff?)$/.test(name)) {
    return extractFromImage(file);
  }
  if (type === 'application/pdf' || name.endsWith('.pdf')) {
    return extractFromPdf(file);
  }
  if (
    type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    name.endsWith('.docx')
  ) {
    return extractFromDocx(file);
  }
  if (name.endsWith('.doc')) {
    throw new Error('Legacy .doc files are not supported. Please convert to .docx.');
  }
  // Fallback: try as plain text
  return extractFromText(file);
}

/** Insert extracted text into the TipTap editor at the cursor position. */
export function insertTextIntoEditor(editor: Editor, text: string) {
  if (!text) return;
  editor.chain().focus().insertContent(text).run();
}
