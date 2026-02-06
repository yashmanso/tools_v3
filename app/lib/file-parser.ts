import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

export interface ParsedFile {
  filename: string;
  content: string;
  type: 'pdf' | 'docx' | 'txt' | 'image' | 'other';
}

/**
 * Extract text content from a file buffer
 */
export async function parseFile(file: File): Promise<ParsedFile> {
  const filename = file.name;
  const extension = filename.split('.').pop()?.toLowerCase() || '';
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  try {
    switch (extension) {
      case 'pdf':
        return await parsePDF(buffer, filename);
      
      case 'docx':
      case 'doc':
        return await parseDOCX(buffer, filename);
      
      case 'txt':
      case 'md':
        return await parseTXT(buffer, filename);
      
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
      case 'svg':
      case 'webp':
        // Images: return filename only, OCR can be added later if needed
        return {
          filename,
          content: `[Image file: ${filename}]`,
          type: 'image',
        };
      
      default:
        return {
          filename,
          content: `[Unsupported file type: ${filename}]`,
          type: 'other',
        };
    }
  } catch (error) {
    console.error(`Error parsing file ${filename}:`, error);
    return {
      filename,
      content: `[Error parsing file: ${error instanceof Error ? error.message : 'Unknown error'}]`,
      type: extension === 'pdf' ? 'pdf' : extension === 'docx' || extension === 'doc' ? 'docx' : 'other',
    };
  }
}

/**
 * Parse PDF file
 */
async function parsePDF(buffer: Buffer, filename: string): Promise<ParsedFile> {
  try {
    const data = await pdfParse(buffer);
    return {
      filename,
      content: data.text || `[PDF file: ${filename} - No extractable text]`,
      type: 'pdf',
    };
  } catch (error) {
    throw new Error(`Failed to parse PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Parse DOCX file
 */
async function parseDOCX(buffer: Buffer, filename: string): Promise<ParsedFile> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return {
      filename,
      content: result.value || `[DOCX file: ${filename} - No extractable text]`,
      type: 'docx',
    };
  } catch (error) {
    throw new Error(`Failed to parse DOCX: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Parse TXT file
 */
async function parseTXT(buffer: Buffer, filename: string): Promise<ParsedFile> {
  try {
    const content = buffer.toString('utf-8');
    return {
      filename,
      content: content || `[TXT file: ${filename} - Empty file]`,
      type: 'txt',
    };
  } catch (error) {
    throw new Error(`Failed to parse TXT: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Parse multiple files
 */
export async function parseFiles(files: File[]): Promise<ParsedFile[]> {
  const results = await Promise.all(
    files.map(file => parseFile(file))
  );
  return results;
}
