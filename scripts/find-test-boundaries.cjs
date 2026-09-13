const { PDFDocument } = require('pdf-lib');
const fs = require('fs');

async function findTestBoundaries() {
  const srcBytes = fs.readFileSync('D:\\READING 2026.pdf');
  const srcDoc = await PDFDocument.load(srcBytes);
  const count = srcDoc.getPageCount();
  console.log('Total pages in doc:', count);

  // We know the last few pages:
  // Let's check page count and inspect structure
}
findTestBoundaries().catch(console.error);
