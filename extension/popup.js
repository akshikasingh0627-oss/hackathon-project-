const scanBtn = document.getElementById('scan-btn');
const resultsEl = document.getElementById('results');

chrome.runtime.onMessage.addListener((message) => {
  if (message?.type !== 'SCAN_RESULT') {
    return;
  }

  resultsEl.textContent = JSON.stringify(message.data, null, 2);
});

scanBtn.addEventListener('click', async () => {
  resultsEl.textContent = 'Scanning...';

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) {
    resultsEl.textContent = 'No active tab found.';
    return;
  }

  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content-script.js'],
    });

    await chrome.tabs.sendMessage(tab.id, { type: 'SCAN' });
  } catch (error) {
    resultsEl.textContent = `Scan failed: ${error.message}`;
  }
});
