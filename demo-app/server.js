const express = require('express');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
const path = require('path');

const MODE = process.env.MODE === 'fixed' ? 'fixed' : 'vulnerable';
const PORT = process.env.PORT || 3000;
const TABLES = [1, 2, 3, 4, 5];

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

/** @type {Map<string, { shownTables: number[] }>} */
const sessions = new Map();

/** @type {{ tableId: *, at: string }[]} */
const reservations = [];

function getOrCreateSession(req, res) {
  let sessionId = req.cookies.sessionId;
  if (!sessionId || !sessions.has(sessionId)) {
    sessionId = crypto.randomUUID();
    sessions.set(sessionId, { shownTables: [] });
    res.cookie('sessionId', sessionId, { httpOnly: true, sameSite: 'lax' });
  }
  return { sessionId, session: sessions.get(sessionId) };
}

app.get('/api/tables', (req, res) => {
  const { session } = getOrCreateSession(req, res);
  session.shownTables = [...TABLES];
  res.json({ mode: MODE, tables: TABLES });
});

app.post('/api/reservation', (req, res) => {
  const { session } = getOrCreateSession(req, res);
  const { tableId } = req.body || {};

  if (MODE === 'fixed') {
    const allowed = session.shownTables || [];
    const numericId = Number(tableId);
    const ok = allowed.includes(numericId);
    if (!ok) {
      return res.status(403).json({
        error: 'Forbidden: tableId is not in the list shown to this session',
        tableId,
      });
    }
  }

  reservations.push({ tableId, at: new Date().toISOString() });
  res.json({ success: true, tableId, mode: MODE });
});

app.get('/api/reservations', (_req, res) => {
  res.json({ reservations, mode: MODE });
});

app.listen(PORT, () => {
  console.log(`VibeShield demo-app running in MODE=${MODE} on http://localhost:${PORT}`);
});
