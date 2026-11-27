import { useEffect, useState } from 'react';
import { Check, Copy, ExternalLink, RefreshCw, Smartphone, Terminal } from 'lucide-react';

interface BotStatus {
  botName: string;
  botNumber: string;
  status: string;
  totalUser: number;
  totalGroup: number;
  totalCoin: number;
  supabaseConnected: boolean;
}

interface PairingInfo {
  code: string | null;
  phoneNumber: string;
  status: string;
}

interface MenuEntry {
  id: string;
  label: string;
  content: string;
}

function formatCode(code: string | null, status: string): string {
  if (status === 'Online') return 'SUDAH TERTAUT';
  if (!code) return 'MENUNGGU KODE';
  const clean = code.replace(/[^A-Za-z0-9]/g, '');
  if (clean.length === 8) return `${clean.slice(0, 4)}-${clean.slice(4)}`;
  return code;
}

export default function App() {
  const [statusData, setStatusData] = useState<BotStatus>({
    botName: 'SPIVER BOT',
    botNumber: '-',
    status: 'Offline',
    totalUser: 0,
    totalGroup: 0,
    totalCoin: 0,
    supabaseConnected: false,
  });
  const [pairingData, setPairingData] = useState<PairingInfo>({
    code: null,
    phoneNumber: '',
    status: 'Offline',
  });
  const [menus, setMenus] = useState<MenuEntry[]>([]);
  const [selectedMenuId, setSelectedMenuId] = useState<string>('main');
  const [loading, setLoading] = useState<boolean>(true);
  const [copiedPairing, setCopiedPairing] = useState<boolean>(false);
  const [copiedGithub, setCopiedGithub] = useState<boolean>(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statusRes, pairingRes, menuRes] = await Promise.all([
        fetch('/api/status'),
        fetch('/api/pairing'),
        fetch('/api/menus'),
      ]);
      if (statusRes.ok) {
        setStatusData(await statusRes.json());
      }
      if (pairingRes.ok) {
        setPairingData(await pairingRes.json());
      }
      if (menuRes.ok) {
        const parsed = await menuRes.json();
        setMenus(parsed.items || []);
      }
    } catch {
      // Tetap tampilkan state terakhir bila koneksi terputus
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const timer = setInterval(loadData, 8000);
    return () => clearInterval(timer);
  }, []);

  const displayedCode = formatCode(pairingData.code, pairingData.status);
  const activeMenu = menus.find((m) => m.id === selectedMenuId) || menus[0];

  const handleCopyPairing = async () => {
    try {
      await navigator.clipboard.writeText(displayedCode);
      setCopiedPairing(true);
      setTimeout(() => setCopiedPairing(false), 2000);
    } catch {
      // Clipboard tidak tersedia
    }
  };

  const handleCopyGithub = async () => {
    try {
      await navigator.clipboard.writeText('https://github.com/username/spiver-bot');
      setCopiedGithub(true);
      setTimeout(() => setCopiedGithub(false), 2000);
    } catch {
      // Clipboard tidak tersedia
    }
  };

  const statusTone =
    statusData.status === 'Online'
      ? 'text-emerald-400'
      : statusData.status === 'Connecting'
        ? 'text-amber-400'
        : 'text-rose-400';

  return (
    <div className="min-h-screen bg-[#0b1120] text-slate-50 flex flex-col">
      {/* Top Bar Contract: 3 zones separated by gap-8 */}
      <header className="sticky top-0 z-20 border-b border-slate-800/80 bg-[#0b1120]/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
          <a
            href="#overview"
            className="text-lg font-bold tracking-tight text-slate-50 whitespace-nowrap shrink-0"
          >
            SPIVER BOT
          </a>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
            <a href="#overview" className="hover:text-slate-50 transition-colors whitespace-nowrap shrink-0">
              Overview
            </a>
            <a href="#pairing" className="hover:text-slate-50 transition-colors whitespace-nowrap shrink-0">
              Pairing
            </a>
            <a href="#menus" className="hover:text-slate-50 transition-colors whitespace-nowrap shrink-0">
              Daftar Menu
            </a>
            <a href="#deploy" className="hover:text-slate-50 transition-colors whitespace-nowrap shrink-0">
              Deploy
            </a>
          </nav>

          <button
            type="button"
            onClick={loadData}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Perbarui Data
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-10 space-y-10">
        {/* Hero & Metric Strip */}
        <section id="overview" className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <p className="text-xs font-semibold text-emerald-400">
                WhatsApp Grup Bot · Pairing Code 8 Digit · Supabase
              </p>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-50 [text-wrap:balance]">
                SPIVER BOT Control Center
              </h1>
              <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
                Pantau status bot, kode pairing 8 digit untuk satu perangkat, serta statistik pengguna, grup, dan perolehan coin secara langsung.
              </p>
            </div>

            <div className="bg-[#111827] border border-slate-800 rounded-xl px-5 py-3.5 min-w-[160px] md:text-right shrink-0">
              <span className="block text-xs text-slate-400 mb-1">Status Bot</span>
              <span className={`text-base font-bold ${statusTone}`}>{statusData.status}</span>
            </div>
          </div>

          {/* 5-Column Tabular Stats Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 bg-[#111827] border border-slate-800 rounded-xl overflow-hidden divide-y sm:divide-y-0 sm:divide-x divide-slate-800">
            <div className="p-5 space-y-1.5">
              <span className="block text-xs text-slate-400">Nama Bot</span>
              <span className="block text-lg font-bold text-slate-50 truncate">{statusData.botName}</span>
            </div>
            <div className="p-5 space-y-1.5">
              <span className="block text-xs text-slate-400">Nomor Bot</span>
              <span className="block text-lg font-bold text-slate-50 font-mono-tabular truncate">
                {statusData.botNumber}
              </span>
            </div>
            <div className="p-5 space-y-1.5">
              <span className="block text-xs text-slate-400">Total User</span>
              <span className="block text-lg font-bold text-slate-50 font-mono-tabular">
                {statusData.totalUser.toLocaleString('id-ID')}
              </span>
            </div>
            <div className="p-5 space-y-1.5">
              <span className="block text-xs text-slate-400">Total Grup</span>
              <span className="block text-lg font-bold text-slate-50 font-mono-tabular">
                {statusData.totalGroup.toLocaleString('id-ID')}
              </span>
            </div>
            <div className="p-5 space-y-1.5">
              <span className="block text-xs text-slate-400">Total Coin</span>
              <span className="block text-lg font-bold text-emerald-400 font-mono-tabular">
                {statusData.totalCoin.toLocaleString('id-ID')}
              </span>
            </div>
          </div>
        </section>

        {/* Pairing Section */}
        <section id="pairing" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-7 bg-[#111827] border border-slate-800 rounded-xl p-7 flex flex-col justify-between gap-6">
            <div>
              <p className="text-xs font-semibold text-emerald-400 mb-1">Tautkan Perangkat WhatsApp</p>
              <h2 className="text-xl font-semibold text-slate-50">Kode Pairing 8 Digit</h2>
              <p className="text-sm text-slate-400 mt-1">
                Nomor target:{' '}
                <span className="font-mono-tabular text-slate-200">
                  {pairingData.phoneNumber || 'Belum diisi di .env'}
                </span>
              </p>
            </div>

            <div className="bg-[#182235] border border-slate-700/70 rounded-xl py-7 px-5 text-center">
              <span className="block text-xs font-medium tracking-wider text-slate-400 mb-2">
                KODE PAIRING
              </span>
              <div className="text-3xl sm:text-4xl font-bold tracking-[0.16em] text-emerald-400 font-mono-tabular">
                {displayedCode}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={handleCopyPairing}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                {copiedPairing ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copiedPairing ? 'Kode Disalin' : 'Salin Kode Pairing'}
              </button>
              <span className="text-xs text-slate-400">
                Diperbarui otomatis dari endpoint /api/pairing
              </span>
            </div>
          </div>

          <div className="lg:col-span-5 bg-[#111827] border border-slate-800 rounded-xl p-7 flex flex-col justify-between gap-5">
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 text-slate-50">
                <Smartphone className="w-5 h-5 text-emerald-400 shrink-0" />
                <h3 className="text-base font-semibold">Cara Tautkan Perangkat (1 HP)</h3>
              </div>
              <ol className="list-decimal list-inside space-y-3 text-sm text-slate-400 leading-relaxed">
                <li>
                  Buka aplikasi <strong className="text-slate-100">WhatsApp</strong> di HP kamu.
                </li>
                <li>
                  Ketuk ikon <strong className="text-slate-100">Titik 3</strong> di pojok kanan atas.
                </li>
                <li>
                  Pilih <strong className="text-slate-100">Perangkat Tertaut</strong> lalu tekan{' '}
                  <strong className="text-slate-100">Tautkan Perangkat</strong>.
                </li>
                <li>
                  Pilih <strong className="text-slate-100">Tautkan dengan Nomor Telepon</strong>.
                </li>
                <li>Masukkan kode 8 digit yang tampil pada kotak KODE PAIRING.</li>
              </ol>
            </div>

            <div className="pt-4 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
              <span>Endpoint Bot</span>
              <span className="font-mono-tabular text-slate-300">node bot/index.js</span>
            </div>
          </div>
        </section>

        {/* Quick Deploy Actions */}
        <section id="deploy" className="bg-[#111827] border border-slate-800 rounded-xl p-7 space-y-5">
          <div>
            <h2 className="text-lg font-semibold text-slate-50">Tautan & Infrastruktur</h2>
            <p className="text-sm text-slate-400 mt-1">
              Akses cepat repositori GitHub, hosting bot Railway, dan database Supabase PostgreSQL.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleCopyGithub}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg bg-[#182235] border border-slate-700 text-slate-100 hover:border-slate-500 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {copiedGithub ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              {copiedGithub ? 'Link GitHub Disalin' : 'Copy Link GitHub'}
            </button>

            <a
              href="https://railway.app/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg bg-[#182235] border border-slate-700 text-slate-100 hover:border-slate-500 transition-colors whitespace-nowrap shrink-0"
            >
              <ExternalLink className="w-4 h-4" />
              Buka Railway
            </a>

            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg bg-[#182235] border border-slate-700 text-slate-100 hover:border-slate-500 transition-colors whitespace-nowrap shrink-0"
            >
              <ExternalLink className="w-4 h-4" />
              Buka Supabase
            </a>
          </div>
        </section>

        {/* Interactive Menu Preview */}
        <section id="menus" className="bg-[#111827] border border-slate-800 rounded-xl p-7 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-50">Pratinjau Format Menu WhatsApp</h2>
              <p className="text-sm text-slate-400 mt-0.5">
                Menang game = +50 coin · Pakai command = +1 coin · Kalah / menyerah = +1 coin
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>10 Modul Menu Aktif</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 p-1.5 bg-[#0b1120] border border-slate-800 rounded-lg">
            {menus.map((menu) => (
              <button
                key={menu.id}
                type="button"
                onClick={() => setSelectedMenuId(menu.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  selectedMenuId === menu.id
                    ? 'bg-emerald-500 text-slate-950 font-semibold'
                    : 'text-slate-400 hover:text-slate-100'
                }`}
              >
                {menu.label}
              </button>
            ))}
          </div>

          <pre className="bg-[#0b1120] border border-slate-800 rounded-xl p-5 text-xs sm:text-sm text-slate-200 font-mono-tabular whitespace-pre-wrap overflow-x-auto leading-relaxed max-h-[420px]">
            {activeMenu ? activeMenu.content : 'Memuat daftar menu...'}
          </pre>
        </section>
      </main>

      <footer className="border-t border-slate-800/80 py-6">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <span>SPIVER BOT</span>
          <span>Node.js · Baileys Pairing · Supabase · Railway & Vercel</span>
        </div>
      </footer>
    </div>
  );
}
