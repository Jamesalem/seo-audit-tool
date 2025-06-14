const fs = require('fs');
const puppeteer = require('puppeteer');

if (process.argv.length < 4) {
  console.error('Usage: node generatePdf.js <reportId> <outputPdfPath>');
  process.exit(1);
}

const reportId = process.argv[2];
const outputPdfPath = process.argv[3];
const jsonPath = `backend/results/${reportId}.json`;

(async () => {
  try {
    const reportData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    const htmlContent = `
      <html><body>
        <h1>Audit Report</h1>
        <pre>${JSON.stringify(reportData, null, 2)}</pre>
      </body></html>
    `;
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    await page.pdf({ path: outputPdfPath, format: 'A4', printBackground: true });
    await browser.close();
    console.log(`PDF generated at ${outputPdfPath}`);
  } catch (err) {
    console.error('Error generating PDF:', err);
    process.exit(1);
  }
})();
