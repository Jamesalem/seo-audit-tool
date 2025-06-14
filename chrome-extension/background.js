// background.js
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'seoAudit',
    title: 'Run Local SEO Audit',
    contexts: ['page']
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'seoAudit') {
    // forward to popup—open popup programmatically
    chrome.action.openPopup();
  }
});
