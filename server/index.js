import express from 'express';
import cors from 'cors';
import path from 'path';
import os from 'os';
import apiRouter from './routes/api.js';

const app = express();
const PORT = process.env.PORT || 3004;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend assets
app.use(express.static(path.join(process.cwd(), 'public')));

// API Routes
app.use('/api', apiRouter);

// Dedicated route for Engineering & Client Portal
app.get('/portal', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'public', 'portal.html'));
});

// Fallback for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
});

// Helper to get local network IP address
function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

app.listen(PORT, () => {
  const localIp = getLocalIp();
  console.log('=======================================================');
  console.log('🌀 Veltha 2026 — Purificação de Ar & Precipitadores VTD');
  console.log(`💻 No seu computador:     http://localhost:${PORT}`);
  console.log(`📱 No celular/Tablet:     http://${localIp}:${PORT}`);
  console.log('=======================================================');
});
