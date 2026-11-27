import axios from 'axios';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

const SUPPORTED_PLATFORMS = {
  instagram: 'Instagram',
  tiktok: 'TikTok',
  spotify: 'Spotify',
  youtube: 'YouTube',
  facebook: 'Facebook',
  threads: 'Threads',
  x: 'X (Twitter)',
  capcut: 'CapCut',
  am: 'Apple Music / Alight Motion',
  pinterest: 'Pinterest',
};

export function isSupportedDownloadCommand(cmd) {
  return Object.prototype.hasOwnProperty.call(SUPPORTED_PLATFORMS, cmd);
}

export async function downloadMediaFromUrl(platform, url) {
  const apiKey = process.env.DOWNLOADER_API_KEY;
  if (!url || (!url.startsWith('http://') && !url.startsWith('https://'))) {
    throw new Error('Link tidak valid. Contoh: .tiktok https://vt.tiktok.com/xxx');
  }

  if (!apiKey) {
    throw new Error('DOWNLOADER_API_KEY belum diisi di .env');
  }

  try {
    // Mendukung endpoint API downloader standar (misal api.ryzendesu / api.betabotz / rapidapi / custom)
    const baseUrl = process.env.DOWNLOADER_API_URL || 'https://api.betabotz.eu.org/api/download';
    const endpointMap = {
      instagram: `${baseUrl}/igdl`,
      tiktok: `${baseUrl}/tiktok`,
      spotify: `${baseUrl}/spotify`,
      youtube: `${baseUrl}/ytmp4`,
      facebook: `${baseUrl}/fbdown`,
      threads: `${baseUrl}/threads`,
      x: `${baseUrl}/twitter`,
      capcut: `${baseUrl}/capcut`,
      am: `${baseUrl}/allinone`,
      pinterest: `${baseUrl}/pinterest`,
    };

    const targetEndpoint = endpointMap[platform] || `${baseUrl}/allinone`;
    const response = await axios.get(targetEndpoint, {
      params: { url, apikey: apiKey },
      timeout: 30000,
    });

    const data = response.data?.result || response.data?.data || response.data;
    if (!data) {
      throw new Error('Gagal download');
    }

    // Normalisasi respons API untuk foto / video / audio tanpa watermark
    const mediaItems = [];

    if (Array.isArray(data)) {
      for (const item of data) {
        const mediaUrl = item.url || item.video || item.image || item.download;
        if (!mediaUrl) continue;
        const type =
          item.type === 'image' || /\.(jpg|jpeg|png|webp)(\?|$)/i.test(mediaUrl)
            ? 'image'
            : item.type === 'audio' || /\.(mp3|m4a|ogg)(\?|$)/i.test(mediaUrl)
              ? 'audio'
              : 'video';
        mediaItems.push({ type, url: mediaUrl });
      }
    } else if (typeof data === 'object') {
      const videoUrl = data.video_nowm || data.nowm || data.video || data.hd || data.sd || data.url;
      const imageList = data.images || (data.image ? [data.image] : []);
      const audioUrl = data.audio || data.music || data.mp3;

      if (Array.isArray(imageList) && imageList.length > 0 && !videoUrl) {
        for (const img of imageList) {
          mediaItems.push({ type: 'image', url: typeof img === 'string' ? img : img.url });
        }
      } else if (platform === 'spotify' && audioUrl) {
        mediaItems.push({ type: 'audio', url: audioUrl, title: data.title || 'Spotify Audio' });
      } else if (videoUrl) {
        const isImg = /\.(jpg|jpeg|png|webp)(\?|$)/i.test(videoUrl);
        mediaItems.push({
          type: isImg ? 'image' : 'video',
          url: videoUrl,
          caption: data.title || data.caption || `${SUPPORTED_PLATFORMS[platform]} Downloader (Tanpa Watermark)`,
        });
      }
    }

    if (mediaItems.length === 0) {
      throw new Error('Gagal download');
    }

    return mediaItems;
  } catch (err) {
    console.error(`[Downloader ${platform} error]`, err?.message || err);
    throw new Error('Gagal download');
  }
}

export async function convertVideoBufferToAudio(videoBuffer) {
  const tmpDir = os.tmpdir();
  const id = `spiver_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const inputPath = path.join(tmpDir, `${id}.mp4`);
  const outputPath = path.join(tmpDir, `${id}.mp3`);

  try {
    await fs.promises.writeFile(inputPath, videoBuffer);
    await execFileAsync('ffmpeg', ['-y', '-i', inputPath, '-vn', '-ab', '192k', '-f', 'mp3', outputPath]);
    const audioBuffer = await fs.promises.readFile(outputPath);
    return audioBuffer;
  } catch {
    // Fallback: jika ffmpeg tidak tersedia di container, kembalikan buffer asli agar tetap dikirim sebagai audio/mp4
    return videoBuffer;
  } finally {
    fs.promises.unlink(inputPath).catch(() => {});
    fs.promises.unlink(outputPath).catch(() => {});
  }
}
