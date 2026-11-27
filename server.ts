import express from 'express';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { getStats } from './bot/db.js';
import {
  buildMainMenu,
  MENU_DOWNLOAD,
  MENU_GAME,
  MENU_GRUP,
  MENU_FUN,
  MENU_STIKER,
  MENU_ANONYMOUS,
  MENU_AI,
  MENU_OWNER,
  MENU_BUY,
} from './bot/menus.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startDevServer() {
  const app = express();
  app.use(express.json());

  app.get('/api/status', async (req, res) => {
    const stats = await getStats();
    const rawPhone = (process.env.PHONE_NUMBER || '').replace(/[^0-9]/g, '');
    res.json({
      botName: 'SPIVER BOT',
      botNumber: rawPhone || '-',
      status: rawPhone ? 'Connecting' : 'Offline',
      totalUser: stats.totalUser,
      totalGroup: stats.totalGroup,
      totalCoin: stats.totalCoin,
      supabaseConnected: stats.supabaseConnected,
    });
  });

  app.get('/api/pairing', (req, res) => {
    const rawPhone = (process.env.PHONE_NUMBER || '').replace(/[^0-9]/g, '');
    res.json({
      code: null,
      phoneNumber: rawPhone || '',
      status: rawPhone ? 'Connecting' : 'Offline',
    });
  });

  app.get('/api/menus', (req, res) => {
    const sampleMain = buildMainMenu({
      botName: 'SPIVER BOT',
      botNumber: (process.env.PHONE_NUMBER || '').replace(/[^0-9]/g, '') || '6281234567890',
      user: { limit_count: 87, prem: false, coin: 50 },
    });
    res.json({
      items: [
        { id: 'main', label: '.menu / .start', content: sampleMain },
        { id: 'download', label: '.menu download', content: MENU_DOWNLOAD },
        { id: 'game', label: '.menu game', content: MENU_GAME },
        { id: 'grup', label: '.menu grup', content: MENU_GRUP },
        { id: 'fun', label: '.menu fun', content: MENU_FUN },
        { id: 'stiker', label: '.menu stiker', content: MENU_STIKER },
        { id: 'anonymous', label: '.menu anonymous', content: MENU_ANONYMOUS },
        { id: 'ai', label: '.menu ai', content: MENU_AI },
        { id: 'owner', label: '.menu owner faiz', content: MENU_OWNER },
        { id: 'buy', label: '.menu buy', content: MENU_BUY },
      ],
    });
  });

  app.get('/qr', (req, res) => {
    res.redirect('/pairing');
  });

  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });

  app.use(vite.middlewares);

  app.use('*', async (req, res, next) => {
    if (req.originalUrl.startsWith('/api')) return next();
    res.sendFile(path.join(__dirname, 'index.html'));
  });

  const port = Number(process.env.PORT) || 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`SPIVER BOT preview server running on http://localhost:${port}`);
  });
}

startDevServer();
