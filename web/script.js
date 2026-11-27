const STORAGE_KEY = 'spiver_api_base';

function getApiBase() {
  const params = new URLSearchParams(window.location.search);
  const fromParam = params.get('api');
  if (fromParam) {
    const clean = fromParam.replace(/\/+$/, '');
    localStorage.setItem(STORAGE_KEY, clean);
    return clean;
  }
  return (localStorage.getItem(STORAGE_KEY) || '').replace(/\/+$/, '');
}

function formatPairingCode(code) {
  if (!code) return 'TERHUBUNG / MENUNGGU';
  const clean = String(code).replace(/[^A-Za-z0-9]/g, '');
  if (clean.length === 8) {
    return `${clean.slice(0, 4)}-${clean.slice(4)}`;
  }
  return code;
}

function setStatusBadge(el, status) {
  el.textContent = status || 'Offline';
  el.classList.remove('status-online', 'status-connecting', 'status-offline');
  if (status === 'Online') {
    el.classList.add('status-online');
  } else if (status === 'Connecting') {
    el.classList.add('status-connecting');
  } else {
    el.classList.add('status-offline');
  }
}

let currentExpiresAt = null;
let currentStatus = 'Offline';

function updateCountdownText() {
  const countdownEl = document.getElementById('pairingCountdown');
  if (!countdownEl) return;
  if (currentStatus === 'Online') {
    countdownEl.textContent = 'Perangkat sudah tertaut';
    return;
  }
  if (!currentExpiresAt) {
    countdownEl.textContent = 'Masa berlaku: 05:00';
    return;
  }
  const diffSec = Math.max(0, Math.floor((currentExpiresAt - Date.now()) / 1000));
  const mins = String(Math.floor(diffSec / 60)).padStart(2, '0');
  const secs = String(diffSec % 60).padStart(2, '0');
  countdownEl.textContent = diffSec > 0 ? `Berlaku ${mins}:${secs}` : 'Kode habis, membuat kode baru...';
}

async function fetchDashboardData() {
  const base = getApiBase();
  const statusEl = document.getElementById('botStatusText');
  const botNameEl = document.getElementById('botName');
  const botNumberEl = document.getElementById('botNumber');
  const totalUserEl = document.getElementById('totalUser');
  const totalGroupEl = document.getElementById('totalGroup');
  const totalCoinEl = document.getElementById('totalCoin');
  const pairingCodeEl = document.getElementById('pairingCodeDisplay');
  const pairingPhoneEl = document.getElementById('pairingPhone');

  try {
    const [statusRes, pairingRes] = await Promise.all([
      fetch(`${base}/api/status`),
      fetch(`${base}/api/pairing`),
    ]);

    if (statusRes.ok) {
      const s = await statusRes.json();
      setStatusBadge(statusEl, s.status);
      botNameEl.textContent = s.botName || 'SPIVER BOT';
      botNumberEl.textContent = s.botNumber || '-';
      totalUserEl.textContent = Number(s.totalUser || 0).toLocaleString('id-ID');
      totalGroupEl.textContent = Number(s.totalGroup || 0).toLocaleString('id-ID');
      totalCoinEl.textContent = Number(s.totalCoin || 0).toLocaleString('id-ID');
    }

    if (pairingRes.ok) {
      const p = await pairingRes.json();
      currentStatus = p.status || 'Offline';
      currentExpiresAt = p.expiresAt || (p.remainingSeconds ? Date.now() + p.remainingSeconds * 1000 : null);
      pairingPhoneEl.textContent = p.phoneNumber || '-';
      if (p.status === 'Online') {
        pairingCodeEl.textContent = 'SUDAH TERTAUT';
      } else {
        pairingCodeEl.textContent = p.code ? formatPairingCode(p.code) : 'MENUNGGU KODE';
      }
      updateCountdownText();
    }
  } catch {
    setStatusBadge(statusEl, 'Offline');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const apiInput = document.getElementById('apiBaseInput');
  const saveApiBtn = document.getElementById('saveApiBtn');
  const refreshBtn = document.getElementById('refreshBtn');
  const copyPairingBtn = document.getElementById('copyPairingBtn');
  const refreshPairingBtn = document.getElementById('refreshPairingBtn');
  const copyGithubBtn = document.getElementById('copyGithubBtn');
  const feedbackEl = document.getElementById('copyFeedback');

  apiInput.value = getApiBase();

  saveApiBtn.addEventListener('click', () => {
    const val = apiInput.value.trim().replace(/\/+$/, '');
    if (val) {
      localStorage.setItem(STORAGE_KEY, val);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
    fetchDashboardData();
  });

  refreshBtn.addEventListener('click', fetchDashboardData);

  if (refreshPairingBtn) {
    refreshPairingBtn.addEventListener('click', async () => {
      const base = getApiBase();
      feedbackEl.textContent = 'Membuat kode baru...';
      try {
        const res = await fetch(`${base}/api/pairing/refresh`, { method: 'POST' });
        if (res.ok) {
          await fetchDashboardData();
          feedbackEl.textContent = 'Kode baru berlaku 5 menit.';
        } else {
          feedbackEl.textContent = 'Gagal membuat ulang kode.';
        }
      } catch {
        feedbackEl.textContent = 'Server belum terhubung.';
      }
      setTimeout(() => {
        feedbackEl.textContent = '';
      }, 3000);
    });
  }

  copyPairingBtn.addEventListener('click', async () => {
    const codeText = document.getElementById('pairingCodeDisplay').textContent.trim();
    try {
      await navigator.clipboard.writeText(codeText);
      feedbackEl.textContent = 'Kode disalin.';
      setTimeout(() => {
        feedbackEl.textContent = '';
      }, 2500);
    } catch {
      feedbackEl.textContent = 'Gagal menyalin.';
    }
  });

  copyGithubBtn.addEventListener('click', async () => {
    const repoUrl = 'https://github.com/username/spiver-bot';
    try {
      await navigator.clipboard.writeText(repoUrl);
      copyGithubBtn.textContent = 'Link GitHub Disalin';
      setTimeout(() => {
        copyGithubBtn.textContent = 'Copy Link GitHub';
      }, 2500);
    } catch {
      copyGithubBtn.textContent = 'Salin Manual: github.com';
    }
  });

  fetchDashboardData();
  setInterval(fetchDashboardData, 5000);
  setInterval(updateCountdownText, 1000);
});
