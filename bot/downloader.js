import axios from 'axios';

const BASE = 'https://api.siputzx.my.id/api/d';

const mapping = {
  '.instagram': 'instagram',
  '.tiktok': 'tiktok',
  '.spotify': 'spotify',
  '.youtube': 'youtube',
  '.facebook': 'facebook',
  '.threads': 'threads',
  '.x': 'twitter',
  '.capcut': 'capcut',
  '.am': 'applemusic',
  '.pinterest': 'pinterest',
};

function extractAudioUrl(payload) {
  if (!payload) return null;
  if (Array.isArray(payload)) {
    for (const item of payload) {
      const found = extractAudioUrl(item);
      if (found) return found;
    }
    return null;
  }
  if (typeof payload !== 'object') return null;

  const candidate = payload.audio || payload.music || payload.mp3;
  if (typeof candidate === 'string' && candidate.startsWith('http')) {
    return candidate;
  }
  if (candidate && typeof candidate === 'object') {
    const nested = candidate.url || candidate.link || candidate.download;
    if (typeof nested === 'string' && nested.startsWith('http')) {
      return nested;
    }
  }
  return null;
}

async function download(type, url) {
  try {
    const res = await axios.get(`${BASE}/${type}?url=${encodeURIComponent(url)}`, {
      timeout: 30000,
    });
    if (res.data && res.data.status !== false) {
      return res.data;
    }
    if (type === 'applemusic') {
      const fallbackRes = await axios.get(`${BASE}/spotify?url=${encodeURIComponent(url)}`, {
        timeout: 30000,
      });
      return fallbackRes.data || null;
    }
    return res.data || null;
  } catch (err) {
    console.log(`[Downloader ${type} error]`, err?.message || err);
    if (type === 'applemusic') {
      try {
        const fallbackRes = await axios.get(`${BASE}/spotify?url=${encodeURIComponent(url)}`, {
          timeout: 30000,
        });
        return fallbackRes.data || null;
      } catch (fallbackErr) {
        console.log('[Downloader applemusic->spotify fallback error]', fallbackErr?.message || fallbackErr);
      }
    }
    return null;
  }
}

async function getAudio(type, url) {
  const data = await download(type, url);
  if (!data) return null;

  const root = data.data || data.result || data;
  return extractAudioUrl(root) || extractAudioUrl(data);
}

export { download, getAudio, BASE, mapping };
