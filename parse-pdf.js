import { PDFExtract } from 'pdf.js-extract';
import fs from 'fs';

const pdfExtract = new PDFExtract();
const pdfPath = './attached_assets/GE_SLOs_Requirements.pdf';

async function extractText() {
  try {
    const data = await pdfExtract.extract(pdfPath, {});
    
    // Combine text from all pages
    const text = data.pages
      .map(page => page.content.map(item => item.str).join(' '))
      .join('\n\n');
      
    fs.writeFileSync('pdf-content.txt', text);
    console.log('PDF content extracted to pdf-content.txt');
  } catch (error) {
    console.error('Error extracting PDF:', error);
  }
}

extractText();