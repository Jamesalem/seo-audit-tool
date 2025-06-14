// chrome-extension/popup.js

const runBtn     = document.getElementById('runBtn');
const loadingDiv = document.getElementById('loading');
const resultsDiv = document.getElementById('results');
const ridSpan    = document.getElementById('rid');
const perfSpan   = document.getElementById('perf');
const seoSpan    = document.getElementById('seo');
const accessSpan = document.getElementById('access');
const fullBtn    = document.getElementById('fullBtn');

runBtn.addEventListener('click', () => {
  runBtn.disabled = true;
  loadingDiv.classList.remove('hidden');

  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    fetch('http://localhost:5000/api/audit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: tab.url })
    })
      .then(res => res.json())
      .then(({ report_id, categories }) => {
        loadingDiv.classList.add('hidden');
        resultsDiv.classList.remove('hidden');

        // Populate summary fields
        ridSpan.textContent = report_id;
        perfSpan.textContent = categories.performance?.score
          ? Math.round(categories.performance.score * 100)
          : 'N/A';
        seoSpan.textContent = categories.seo?.score
          ? Math.round(categories.seo.score * 100)
          : 'N/A';
        accessSpan.textContent = categories.accessibility?.score
          ? Math.round(categories.accessibility.score * 100)
          : 'N/A';

        // === HERE is your integrated handler ===
        fullBtn.onclick = () => {
          chrome.tabs.create({
            url: `http://localhost:3000/report/${report_id}`
          });
        };
      })
      .catch(err => {
        loadingDiv.textContent = 'Audit failed.';
        console.error(err);
      });
  });
});

// Re-enable the Run button if it was previously disabled
document.addEventListener('DOMContentLoaded', () => {
  if (runBtn.disabled) {
    runBtn.disabled = false;
  }
});
