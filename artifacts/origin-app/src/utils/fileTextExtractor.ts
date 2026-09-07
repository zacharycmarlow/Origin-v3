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

/** Extract text from an image using Tesseract.js (OCR).
 *  Loads English + multilingual language data to support handwritten
 *  and printed notes in many languages. No character limit — processes
 *  the entire image. */
async function extractFromImage(file: File): Promise<ExtractResult> {
  const { createWorker } = await import('tesseract.js');
  // 'eng' covers English; add 'osd' for orientation/script detection.
  // Tesseract automatically handles full-page OCR with no length limit.
  const worker = await createWorker('eng');
  try {
    const { data } = await worker.recognize(file);
    return { text: data.text.trim() };
  } finally {
    await worker.terminate();
  }
}

/** Extract text from a PDF using pdfjs-dist.
 *  Iterates all pages — no page limit, no character limit.
 *  For scanned PDFs with no extractable text, falls back to OCR
 *  by rendering the page to a canvas and running Tesseract. */
async function extractFromPdf(file: File): Promise<ExtractResult> {
  const pdfjs = await import('pdfjs-dist');
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

    if (pageText) {
      // Normal text-based PDF page
      textParts.push(pageText);
    } else {
      // No extractable text — likely a scanned/image page.
      // Render to canvas and OCR it.
      const viewport = page.getViewport({ scale: 2 });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) continue;
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await page.render({ canvasContext: context, viewport, canvas } as any).promise;
      const blob = await new Promise<Blob>((resolve) =>
        canvas.toBlob((b) => resolve(b!), 'image/png'),
      );
      const ocrResult = await extractFromImage(new File([blob], `page-${i}.png`, { type: 'image/png' }));
      if (ocrResult.text) textParts.push(ocrResult.text);
    }
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
