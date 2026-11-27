export function buildMainMenu({ botName, botNumber, user }) {
  const limitText = user.prem ? 'Unlimited' : `${user.limit_count} / 100`;
  const statusText = user.prem ? 'prem' : 'biasa';

  return `PROFIL BOT
nama: ${botName}
nomor: ${botNumber}
limit: ${limitText}
status: ${statusText}
coin: ${user.coin}

DAFTAR MENU SPIVER BOT:
.menu download
.menu game
.menu grup
.menu fun
.menu stiker
.menu ai
.menu owner faiz
.menu buy`;
}

export function buildUserProfile({ name, number, user }) {
  const limitText = user.prem ? 'Unlimited' : `${user.limit_count} / 100`;
  const statusText = user.prem ? 'prem' : 'biasa';

  return `PROFIL BOT
nama: ${name}
nomor: ${number}
limit: ${limitText}
status: ${statusText}
coin: ${user.coin}`;
}

export const MENU_DOWNLOAD = `MENU DOWNLOAD

.instagram (link)
.tiktok (link)
.spotify (link)
.youtube (link)
.facebook (link)
.threads (link)
.x (link)
.capcut (link)
.am (link)
.pinterest (link)

Cara pakai: .tiktok <link>
Bisa foto, video, reels, sesuai link yang dikirim.
Tanpa watermark semua.
Untuk video, reply video dengan .toaudio untuk download audionya.`;

export const MENU_GAME = `MENU GAME

.uno
.ulartangga
.ww
.family100
.susunkata
.sambungkata
.truthordare
.akinator
.caklontong
.ludo
.abclimadasar
.mejikuhibiniu
.monopoli
.tebakkpop
.tebaklagukpop
.tebaklagu
.tebaknegara
.tebakkota
.tebakanime
.tebakbom
.tebakbendera
.tebakgambar
.tebakhewan
.tebakaktorindo

Menang game = +50 coin
Kalah = +1 coin
Jawab langsung di chat, ketik .nyerah kalau menyerah.`;

export const MENU_GRUP = `MENU GRUP

.afk
.kick (bisa tag nomor orangnya atau reply chat orangnya)
.ban (bisa tag nomor orangnya atau reply chat orangnya)
.mute (bisa tag nomor orangnya atau reply chat orangnya) (bisain atur jam, hari atau bulan buat mute)
.setwelcome <teks>
.setleft <teks>
.enable setwelcome
.disable setwelcome
.add (ketik nomornya langsung bisa di masukin ke grup, kalo misalnya gabisa di masukin berarti send link grup aja melalui pribadi)
.acc (ketik nomornya yg mau di acc di permintaan anggota grup)
.absen
.cekabsen
.mulaiabsen
.enable closegc
.disable closegc
.setclosegc (buat kata kata waktu grup close)
.enable opengc
.disable opengc
.setopengc (buat kata kata waktu grup open)
.setdeskripsi
.setprofilgrup
.setnamagrup
.unmute (bisa tag nomor orangnya atau reply chat orangnya)
.unban (bisa tag nomor orangnya atau reply chat orangnya)
.linkgrup
.listadmin
.revoke (buat liat foto yang di kirim sekali liat)
.tagall
.tagme
.me (buat profil bot, tapi ini cantumkan foto profilnya juga)
.tagadmin
.upswgc
.totalchatgrup
.totalmember
.totaladmin
.sider
.keluargrup
.infogrup
.enable antitagsw
.disable antitagsw
.enable antilink
.disable antilink
.enable antibadword
.disable antibadword
.enable antifoto
.disable antifoto
.enable antistiker
.disable antistiker
.enable antivideo
.disable antivideo
.antinsfw
.cekidgrup
.ceksewa
.clearchatgrup
.daftarultah
.hidetag
.listbadword
.pinchat`;

export const MENU_FUN = `MENU FUN

.jadian
.pasangantoday (tag 2 pasangan random)
.cekkhodam (bisa tag)
.kuisrandom
.kuismatematika
.kuisislami
.santet
.siapakahaku
.tfbalance
.alay @user (bisa tag, dan itu buat sebutin seberapa alay)
.menfess
.couplegc (ini nanti kita bisa setting sendiri couple kita sama siapa)
.listcouplegc
.tarot
.artinama
.ramalancinta
.ramalanjodoh
.zodiak`;

export const MENU_STIKER = `MENU STIKER

.brat
.bratvid
.qc
.qc 1 (ini kaya bot stiker quotly di tele)
.telestiker
.stikerip
.emojimix
.stiker (ini buat jadiin foto jadi stiker)
.aistiker <prompt>
.wm (buat namain stiker)
.toimage (buat jadiin stiker jadi foto)
.stikersuara (stiker yg ada suaranya, kan sekarang wa update ada stiker bisa suara)
.attp
.ttp`;

export const MENU_ANONYMOUS = `MENU ANONYMOUS

.start
.leave
.stop
.next

Sistemnya kaya bot anonymous di Telegram.
Khusus chat pribadi bot aja.
Ketik .start untuk cari pasangan, chat kamu diteruskan tanpa nama.
Ketik .leave / .stop untuk berhenti, .next untuk ganti pasangan.`;

export const MENU_AI = `MENU AI

.toanime
.buatlagu (nanti nyuru bikin lirik sendiri atau lirik di buatin ai)
.ngobrolai
.aifoto <prompt> (bisa buatin foto, logo, atau apapun sesuai prompt)`;

export const MENU_OWNER = `MENU OWNER FAIZ

.addprem @user (ini nanti cantumkan kaya tanggal mulai prem sama selesai prem, cantumkan durasi prem, kalo misalnya waktunya udah habis langsung otomatis ga prem lagi)
.broadcastpribadi (buat broadcast masuk ke chat pribadi semua user yg pake bot)
.broadcastgrup (buat broadcast maauk ke grup semua grup yg masukin bot ke grup)
.deleteprem
.addbalance
.addcoin
.anticallbot
.enable botpribadi (ini maksudnya yg bisa chat pribadi bot khusus yang prem doang)
.disable botpribadi (ini bebas siapa aja yg bisa chat pribadi bot)`;

export const MENU_BUY = `MENU BUY

.buyprem (harganya sebulan 10k, dua bulan 20k dan seterusnya, minimal sebulan)
.buybalance
.buylimit (1k 100 limit, 2k 200 limit, 3k 300 limit)
.buycoin (1k 100 coin, 2k 200 coin, 3k 300 coin)`;
