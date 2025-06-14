/**
 * Runs a Lighthouse audit programmatically and writes JSON to disk.
 * Usage: node runLighthouse.js <url> <outputPath>
 */

const fs = require('fs');
const path = require('path');
const chromeLauncher = require('chrome-launcher');

// Import Lighthouse – handle both CommonJS and ES module shapes
let lighthouseModule = require('lighthouse');
const lighthouse = typeof lighthouseModule === 'function'
  ? lighthouseModule
  : (lighthouseModule.lighthouse || lighthouseModule.default || lighthouseModule);

async function run(url, outputPath) {
  // Ensure output directory exists
  const outDir = path.dirname(outputPath);
  fs.mkdirSync(outDir, { recursive: true });

  // Launch Chrome in headless mode
  const chrome = await chromeLauncher.launch({
    chromeFlags: ['--headless', '--no-sandbox', '--disable-gpu']
  });

  // Lighthouse options to connect to the launched Chrome
  const options = {
    logLevel: 'info',
    output: 'json',
    port: chrome.port,
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo']
  };

  console.log(`Running Lighthouse for ${url}...`);
  try {
    // Run the audit
    const runnerResult = await lighthouse(url, options);
    const reportJson = runnerResult.report;

    // Write JSON report to disk
    fs.writeFileSync(outputPath, reportJson);
    console.log(`Report saved to ${outputPath}`);
  } catch (err) {
    console.error('Lighthouse failed:', err);
    process.exit(1);
  } finally {
    await chrome.kill();
  }
}

// Entry point
if (require.main === module) {
  const [,, url, outputPath] = process.argv;
  if (!url || !outputPath) {
    console.error('Usage: node runLighthouse.js <url> <outputPath>');
    process.exit(1);
  }
  run(url, outputPath);
}
