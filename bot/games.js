import { getActiveGame, startGameSession, clearGameSession, addCoin } from './db.js';

const BANK_SOAL = {
  tebakhewan: [
    { q: 'Hewan berkantung asli Australia yang suka melompat?', a: 'kanguru' },
    { q: 'Hewan laut bertentakel delapan yang bisa menyemprotkan tinta?', a: 'gurita' },
    { q: 'Mamalia darat tercepat di dunia dengan tubuh berbintik?', a: 'cheetah' },
    { q: 'Hewan nokturnal bersayap yang tidur terbalik di gua?', a: 'kelelawar' },
    { q: 'Reptil yang bisa mengubah warna kulitnya sesuai lingkungan?', a: 'bunglon' },
    { q: 'Burung terbesar di dunia yang tidak bisa terbang?', a: 'burung unta' },
    { q: 'Hewan penghasil madu yang hidup berkoloni di sarang?', a: 'lebah' },
    { q: 'Hewan kutub berbulu putih tebal yang jago berenang?', a: 'beruang kutub' },
  ],
  tebakkota: [
    { q: 'Kota di Jawa Barat yang dijuluki Kota Hujan?', a: 'bogor' },
    { q: 'Kota di Jawa Timur yang dijuluki Kota Pahlawan?', a: 'surabaya' },
    { q: 'Kota di Jawa Tengah yang terkenal dengan lumpia dan Lawang Sewu?', a: 'semarang' },
    { q: 'Kota di Sumatera Barat yang terkenal dengan Jam Gadang?', a: 'bukittinggi' },
    { q: 'Kota di Kalimantan Selatan yang dijuluki Kota Seribu Sungai?', a: 'banjarmasin' },
    { q: 'Kota di Jawa Barat yang dijuluki Paris van Java?', a: 'bandung' },
    { q: 'Kota di Sulawesi Selatan yang terkenal dengan Pantai Losari?', a: 'makassar' },
    { q: 'Kota pelajar yang terkenal dengan Malioboro dan Gudeg?', a: 'yogyakarta' },
  ],
  tebakbendera: [
    { q: '🇯🇵 Bendera negara manakah ini?', a: 'jepang' },
    { q: '🇰🇷 Bendera negara manakah ini?', a: 'korea selatan' },
    { q: '🇧🇷 Bendera negara manakah ini?', a: 'brasil' },
    { q: '🇬🇧 Bendera negara manakah ini?', a: 'inggris' },
    { q: '🇸🇬 Bendera negara manakah ini?', a: 'singapura' },
    { q: '🇹🇭 Bendera negara manakah ini?', a: 'thailand' },
    { q: '🇩🇪 Bendera negara manakah ini?', a: 'jerman' },
    { q: '🇫🇷 Bendera negara manakah ini?', a: 'prancis' },
  ],
  caklontong: [
    { q: 'Matahari tenggelam di sebelah... (Kunci Cak Lontong: 5 huruf)', a: 'gaada' },
    { q: 'Orang yang biasanya memotong rambut orang lain disebut?', a: 'lupa' },
    { q: 'Burung adalah hewan yang bisa?', a: 'temenan' },
    { q: 'Biasanya orang makan memakai?', a: 'tangan' },
    { q: 'Kalau lampu merah kita harus?', a: 'lihat' },
    { q: 'Yang sering dibawa tukang sate selain daging adalah?', a: 'pulang' },
    { q: 'Hewan yang sering bangun pagi adalah?', a: 'ngantuk' },
    { q: 'Sebelum tidur sebaiknya kita?', a: 'merem' },
  ],
  kuisrandom: [
    { q: 'Planet terdekat dengan Matahari adalah?', a: 'merkurius' },
    { q: 'Gas terbanyak di atmosfer Bumi adalah?', a: 'nitrogen' },
    { q: 'Siapa penemu lampu pijar yang paling terkenal?', a: 'thomas edison' },
    { q: 'Apa nama samudra terbesar di dunia?', a: 'pasifik' },
    { q: 'Logam apa yang berwujud cair pada suhu ruangan?', a: 'raksa' },
    { q: 'Berapa jumlah provinsi di Indonesia saat ini?', a: '38' },
  ],
  kuisislami: [
    { q: 'Siapakah nabi terakhir dalam ajaran Islam?', a: 'muhammad' },
    { q: 'Kitab suci umat Islam yang diturunkan kepada Nabi Muhammad SAW?', a: 'alquran' },
    { q: 'Bulan kesembilan dalam kalender Hijriah di mana umat Islam berpuasa?', a: 'ramadan' },
    { q: 'Jumlah rakaat salat Subuh adalah?', a: '2' },
    { q: 'Malaikat yang bertugas menyampaikan wahyu adalah?', a: 'jibril' },
    { q: 'Kota tempat berdirinya Ka\'bah disebut?', a: 'mekkah' },
  ],
  siapakahaku: [
    { q: 'Aku punya gigi banyak tapi tidak pernah menggigit. Aku digunakan untuk merapikan rambut. Siapakah aku?', a: 'sisir' },
    { q: 'Aku selalu basah saat bekerja mengeringkan sesuatu. Siapakah aku?', a: 'handuk' },
    { q: 'Aku punya jarum tapi tidak bisa menjahit, aku selalu berputar menunjukkan waktu. Siapakah aku?', a: 'jam' },
    { q: 'Semakin banyak aku diambil, semakin besar aku jadinya. Siapakah aku?', a: 'lubang' },
    { q: 'Aku punya leher tapi tidak punya kepala. Siapakah aku?', a: 'botol' },
  ],
  susunkata: [
    { q: 'Susun huruf ini menjadi kata: K - U - P - U - K - U - P - U', a: 'kupukupu' },
    { q: 'Susun huruf ini menjadi kata: M - A - T - A - H - A - R - I', a: 'matahari' },
    { q: 'Susun huruf ini menjadi kata: K - O - M - P - U - T - E - R', a: 'komputer' },
    { q: 'Susun huruf ini menjadi kata: I - N - D - O - N - E - S - I - A', a: 'indonesia' },
    { q: 'Susun huruf ini menjadi kata: P - E - S - A - W - A - T', a: 'pesawat' },
  ],
  family100: [
    { q: 'Sebutkan benda yang sering tertinggal saat buru-buru keluar rumah! (1 jawaban paling umum)', a: 'kunci' },
    { q: 'Sebutkan makanan yang sering dijual di pinggir jalan malam hari!', a: 'nasigoreng' },
    { q: 'Sebutkan alasan orang datang terlambat ke sekolah/kantor!', a: 'macet' },
    { q: 'Sebutkan aplikasi yang paling sering dibuka saat bangun tidur!', a: 'whatsapp' },
  ],
  tebaknegara: [
    { q: 'Negara dengan Menara Eiffel sebagai ikon utamanya?', a: 'prancis' },
    { q: 'Negara yang terkenal dengan Piramida Giza dan Sungai Nil?', a: 'mesir' },
    { q: 'Negara kincir angin yang terkenal dengan bunga tulip?', a: 'belanda' },
    { q: 'Negara asal pizza dan menara miring Pisa?', a: 'italia' },
  ],
  tebakanime: [
    { q: 'Anime tentang bocah ninja berambut pirang yang bercita-cita jadi Hokage?', a: 'naruto' },
    { q: 'Anime tentang bajak laut bertopi jerami bernama Monkey D. Luffy?', a: 'one piece' },
    { q: 'Anime tentang pembasmi iblis bernama Tanjiro Kamado?', a: 'demon slayer' },
    { q: 'Anime tentang Titan raksasa dan Eren Yeager?', a: 'attack on titan' },
  ],
  tebakkpop: [
    { q: 'Boyband K-Pop yang populer dengan lagu Dynamite dan Butter?', a: 'bts' },
    { q: 'Girlband K-Pop dengan anggota Jisoo, Jennie, Rosé, Lisa?', a: 'blackpink' },
    { q: 'Girlband K-Pop yang populer dengan lagu Hype Boy dan OMG?', a: 'newjeans' },
    { q: 'Boyband K-Pop agensi SM Entertainment dengan lagu Growl?', a: 'exo' },
  ],
  tebaklagukpop: [
    { q: 'Lirik: "How you like that? You gon\' like that..." Lagu milik grup mana?', a: 'blackpink' },
    { q: 'Lirik: "Smooth like butter, like a criminal undercover..." Judul lagunya?', a: 'butter' },
    { q: 'Lirik: "I\'m super shy, super shy..." Judul lagunya?', a: 'super shy' },
  ],
  tebaklagu: [
    { q: 'Lirik: "Balonku ada lima, rupa-rupa warnanya..." Apa warna balon yang meletus?', a: 'hijau' },
    { q: 'Lirik: "Bintang kecil di langit yang tinggi..." Lagu ciptaan siapa?', a: 'daljono' },
    { q: 'Lirik: "Pelangi-pelangi alangkah indahmu..." Warna yang disebut pertama kali?', a: 'merah' },
  ],
  tebakgambar: [
    { q: '🖼️ [JAM] + [TANGAN] = Benda yang dipakai di pergelangan?', a: 'jam tangan' },
    { q: '🖼️ [KAKI] + [LIMA] = Pedagang di pinggir jalan disebut?', a: 'kaki lima' },
    { q: '🖼️ [MEJA] + [HIJAU] = Istilah untuk pengadilan adalah?', a: 'meja hijau' },
    { q: '🖼️ [BUAH] + [TANGAN] = Oleh-oleh disebut juga?', a: 'buah tangan' },
  ],
  tebakaktorindo: [
    { q: 'Aktor Indonesia pemeran Dilan dalam film Dilan 1990?', a: 'iqbaal ramadhan' },
    { q: 'Aktor Indonesia pemeran Habibie dalam Habibie & Ainun?', a: 'reza rahadian' },
    { q: 'Aktor laga Indonesia yang membintangi film The Raid?', a: 'iko uwais' },
  ],
};

const TRUTH_LIST = [
  'Siapa orang terakhir yang kamu kepoin profil WhatsApp-nya?',
  'Pernah pura-pura lupa balas chat padahal udah baca dari notifikasi?',
  'Apa hal paling memalukan yang pernah kamu lakukan di depan gebetan?',
  'Kalau harus hapus satu aplikasi selamanya di HP, aplikasi apa yang kamu pilih?',
  'Sebutkan 1 kebiasaan aneh kamu saat sendirian di kamar!',
];

const DARE_LIST = [
  'Kirim voice note nyanyi lagu anak-anak di chat ini sekarang!',
  'Ganti nama profil WA kamu jadi "Anak Baik" selama 1 jam!',
  'Tag 1 orang di grup dan bilang "Makasih udah selalu ada buat aku"!',
  'Kirim stiker paling random yang kamu punya di chat ini!',
  'Tulis status WA bertuliskan "Lagi kangen seseorang nih" selama 15 menit!',
];

const LOBBY_GAMES = new Set([
  'uno',
  'ulartangga',
  'ww',
  'sambungkata',
  'akinator',
  'ludo',
  'abclimadasar',
  'mejikuhibiniu',
  'monopoli',
  'tebakbom',
]);

function generateMathQuestion() {
  const a = Math.floor(Math.random() * 40) + 10;
  const b = Math.floor(Math.random() * 30) + 5;
  const ops = ['+', '-', '*'];
  const op = ops[Math.floor(Math.random() * ops.length)];
  let ans = 0;
  if (op === '+') ans = a + b;
  if (op === '-') ans = a - b;
  if (op === '*') ans = a * b;
  return { q: `Berapa hasil dari ${a} ${op} ${b}?`, a: String(ans) };
}

export async function startGame(cmd, chatId, senderId, args = []) {
  const gameName = cmd.toLowerCase();

  if (gameName === 'truthordare') {
    const choice = (args[0] || '').toLowerCase();
    if (choice === 'truth') {
      const truth = TRUTH_LIST[Math.floor(Math.random() * TRUTH_LIST.length)];
      return { handled: true, text: `🎯 *TRUTH*\n\n${truth}` };
    }
    if (choice === 'dare') {
      const dare = DARE_LIST[Math.floor(Math.random() * DARE_LIST.length)];
      return { handled: true, text: `🔥 *DARE*\n\n${dare}` };
    }
    const isTruth = Math.random() > 0.5;
    const picked = isTruth
      ? `🎯 *TRUTH*\n\n${TRUTH_LIST[Math.floor(Math.random() * TRUTH_LIST.length)]}`
      : `🔥 *DARE*\n\n${DARE_LIST[Math.floor(Math.random() * DARE_LIST.length)]}`;
    return {
      handled: true,
      text: `${picked}\n\nKetik *.truthordare truth* atau *.truthordare dare* untuk pilih manual.`,
    };
  }

  if (LOBBY_GAMES.has(gameName)) {
    return {
      handled: true,
      text: `🎮 *${gameName.toUpperCase()}*\n\nGame ini lagi jalan di grup ini!`,
    };
  }

  let selected = null;
  if (gameName === 'kuismatematika') {
    selected = generateMathQuestion();
  } else if (BANK_SOAL[gameName]) {
    const list = BANK_SOAL[gameName];
    selected = list[Math.floor(Math.random() * list.length)];
  }

  if (!selected) return { handled: false };

  await startGameSession({
    chatId,
    playerId: senderId,
    gameType: gameName,
    question: selected.q,
    answer: selected.a.toLowerCase().trim(),
  });

  return {
    handled: true,
    text: `🎮 *${gameName.toUpperCase()}*\n\nPertanyaan:\n${selected.q}\n\nJawab langsung di chat!\nMenang = +50 coin | Kalah = +1 coin\nKetik *.nyerah* kalau menyerah.`,
  };
}

export async function handleGameAnswerOrSurrender({ chatId, senderId, text }) {
  const cleanText = (text || '').trim().toLowerCase();
  if (!cleanText) return null;

  const session = await getActiveGame(chatId);
  if (!session) return null;

  if (cleanText === '.nyerah') {
    await clearGameSession(chatId);
    await addCoin(senderId, 1);
    return `🏳️ Yah menyerah!\nJawabannya adalah: *${session.answer}*\n\nKamu tetap dapat *+1 coin*.`;
  }

  if (cleanText.startsWith('.')) return null;

  const normalizedInput = cleanText.replace(/\s+/g, '');
  const normalizedAnswer = session.answer.toLowerCase().replace(/\s+/g, '');

  if (cleanText === session.answer.toLowerCase() || normalizedInput === normalizedAnswer) {
    await clearGameSession(chatId);
    const updated = await addCoin(senderId, 50);
    return `🎉 *BENAR!*\nJawabannya: *${session.answer}*\n\nSelamat! Kamu menang dan dapat *+50 coin*!\nCoin kamu sekarang: *${updated?.coin ?? '+50'}*`;
  }

  return null;
}
