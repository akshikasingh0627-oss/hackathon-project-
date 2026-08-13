if (!window.__vibeshield_requests) {
  window.__vibeshield_requests = [];
}

function vibeshieldFetch(url, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  const body = options.body ? JSON.parse(options.body) : undefined;
  window.__vibeshield_requests.push({
    method,
    url,
    body,
    timestamp: Date.now(),
  });
  return fetch(url, options);
}

async function loadTables() {
  const res = await fetch('/api/tables');
  const data = await res.json();
  document.getElementById('mode').textContent = `Mode: ${data.mode}`;

  const list = document.getElementById('tables');
  list.innerHTML = '';
  data.tables.forEach((tableId) => {
    const li = document.createElement('li');
    li.textContent = `Table ${tableId} `;
    const btn = document.createElement('button');
    btn.textContent = 'Reserve';
    btn.addEventListener('click', () => reserve(tableId));
    li.appendChild(btn);
    list.appendChild(li);
  });
}

async function reserve(tableId) {
  const status = document.getElementById('status');
  status.textContent = 'Reserving…';
  try {
    const res = await vibeshieldFetch('/api/reservation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tableId }),
    });
    const data = await res.json();
    if (!res.ok) {
      status.textContent = `Failed (${res.status}): ${data.error || JSON.stringify(data)}`;
      return;
    }
    status.textContent = `Reserved table ${data.tableId}`;
  } catch (err) {
    status.textContent = `Error: ${err.message}`;
  }
}

loadTables();
