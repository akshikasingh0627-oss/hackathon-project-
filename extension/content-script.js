(function () {
  if (window.__vibeshieldContentScriptLoaded) {
    return;
  }
  window.__vibeshieldContentScriptLoaded = true;

  function readPageRequests() {
    return new Promise((resolve) => {
      const requestId = `vibeshield-${Date.now()}-${Math.random().toString(16).slice(2)}`;

      function onMessage(event) {
        if (
          event.source !== window ||
          !event.data ||
          event.data.source !== 'vibeshield-bridge' ||
          event.data.requestId !== requestId
        ) {
          return;
        }

        window.removeEventListener('message', onMessage);
        resolve(Array.isArray(event.data.requests) ? event.data.requests : []);
      }

      window.addEventListener('message', onMessage);

     window.postMessage({
  source: 'vibeshield-bridge',
  requestId,
  requests: Array.isArray(window.__vibeshield_requests)
    ? window.__vibeshield_requests
    : []
}, '*');
    });
  }

  async function collectPageData() {
    const html = document.documentElement
      ? document.documentElement.outerHTML
      : '';

    const scriptSrcs = Array.from(document.querySelectorAll('script')).map(
      (el) => el.src || ''
    );

    const requests = await readPageRequests();

    return {
      html,
      scriptSrcs,
      requests,
    };
  }

  chrome.runtime.onMessage.addListener((message) => {
    if (message?.type !== 'SCAN') {
      return;
    }

    collectPageData()
      .then((data) => {
        chrome.runtime.sendMessage({ type: 'SCAN_RESULT', data });
      })
      .catch((error) => {
        chrome.runtime.sendMessage({
          type: 'SCAN_RESULT',
          data: {
            html: '',
            scriptSrcs: [],
            requests: [],
            error: error.message,
          },
        });
      });
  });
})();
