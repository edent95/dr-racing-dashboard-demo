/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Blog articles targeting high-intent, low-competition Malay search queries:
 *   "cara loan motor senang lulus" / "loan motor tanpa slip gaji" /
 *   "blacklist boleh loan motor" / "apa itu loan kedai motor" /
 *   "motor tak boleh tukar nama sebab loan"
 * plus model-level "<model> loan kedai" guides (Y15ZR, NVX, LC135), picked on
 * 2026-09-22 because Google autocomplete shows steady demand and the Malaysian
 * results are only Facebook posts, Mudah ads and dealer product pages.
 * 2026-10-19 added more popular models (Dash 125, RS150R, Y16ZR, EX5, Vario 160)
 * and "y15zr vs rs150r" / "lc135 vs y15zr" comparisons to widen the model-keyword surface.
 * 2026-10-20 added low-competition long-tail posts on less common brands (Benelli
 * RFS150i, Benelli 250cc, Modenas Kriss, SYM VF3i 185, and a brand round-up).
 *
 * Shared by the React client and server.mjs (per-URL meta, Article + FAQPage
 * schema, and the server-rendered crawler body).
 *
 * Per-post fields:
 *   date         — first published (datePublished)
 *   dateModified — last substantive update; bump when content changes
 *   image        — optional, unique og:image path that must be one of our
 *                  stock photos (WhatsApp previews; never share one image
 *                  across posts). Omit it for a model we have no photo of —
 *                  the post then previews with the generic banner rather than
 *                  a different bike.
 *   faq          — [question, answer] pairs; rendered on-page and emitted as
 *                  FAQPage structured data
 *
 * Content is intentionally advisory, never a guarantee of approval. Rate
 * figures are worked examples, not quotes.
 */

export const BLOG_POSTS = [
  {
    slug: 'cara-loan-motor-senang-lulus',
    date: '2026-07-28',
    dateModified: '2026-08-20',
    readMinutes: 11,
    title: 'Cara Loan Motor Senang Lulus — Panduan Lengkap 2026',
    description:
      'Cara loan motor senang lulus: dokumen yang perlu, apa yang dinilai, kesilapan biasa yang buat permohonan ditolak, dan langkah kalau pernah gagal.',
    keywords: 'cara loan motor senang lulus, loan motor senang lulus, syarat loan motor, dokumen loan motor, tips lulus loan motor, loan motor Penang',
    image: '/stock/y15zr-kfq6960.jpg',
    intro:
      'Ramai orang hantar permohonan loan motor, lepas tu tunggu — dan tertanya-tanya kenapa gagal. Sebenarnya kebanyakan permohonan ditolak bukan sebab pemohon "tak layak", tetapi sebab maklumat tak lengkap atau tak padan. Kami proses permohonan loan motor setiap hari di kedai kami di Simpang Ampat, jadi panduan ini ditulis dari pengalaman sebenar: apa yang dinilai, dokumen yang perlu disediakan mengikut jenis pekerjaan anda, kesilapan yang paling kerap kami nampak, dan apa langkah seterusnya kalau anda pernah ditolak.',
    sections: [
      {
        h: '1. Faham dulu: apa yang sebenarnya dinilai',
        p: [
          'Sama ada anda mohon melalui bank atau melalui kedai, penilaian berkisar pada tiga soalan asas: siapa anda, berapa kemampuan bayar anda, dan apa rekod bayaran anda sebelum ini.',
          'Soalan pertama dijawab dengan pengesahan identiti — kad pengenalan yang sah, umur yang mencukupi, dan alamat yang boleh disahkan. Soalan kedua dijawab dengan bukti pendapatan: bukan sahaja berapa anda dapat sebulan, tetapi sama ada pendapatan itu konsisten dan sama ada ansuran motor yang dipohon munasabah berbandingnya. Soalan ketiga dijawab dengan rekod kredit — CCRIS daripada Bank Negara Malaysia dan laporan CTOS — yang menunjukkan bagaimana anda menguruskan bayaran sebelum ini.',
          'Kalau salah satu daripada tiga ini kabur atau tak konsisten, permohonan jadi lambat atau terus ditolak. Contoh biasa: pendapatan yang diisytiharkan RM3,000 tetapi penyata bank hanya menunjukkan kemasukan RM1,800 sebulan. Bukan soal jujur atau tidak — mungkin sebahagian gaji diterima tunai — tetapi bagi penilai, angka yang tak padan adalah tanda tanya, dan tanda tanya melambatkan semua benda.',
          'Berita baiknya: dua daripada tiga perkara ini boleh anda kemas sendiri sebelum mohon. Identiti dan dokumen boleh disiapkan dalam sehari. Bukti pendapatan boleh dikemaskan dalam masa beberapa bulan. Hanya rekod kredit yang mengambil masa lebih lama untuk pulih — dan dalam banyak kes, ia tidak seteruk yang disangka.'
        ]
      },
      {
        h: '2. Syarat asas loan motor di Malaysia',
        p: [
          'Syarat minimum yang hampir sama di mana-mana: warganegara Malaysia dengan kad pengenalan yang sah, umur sekurang-kurangnya 18 tahun, dan ada sumber pendapatan. Sesetengah pembiaya menetapkan pendapatan minimum sekitar RM1,000 hingga RM1,500 sebulan; ada yang lebih fleksibel dan menilai kes demi kes.',
          'Lesen motosikal bukan syarat kelulusan loan — loan dinilai atas kemampuan bayar, bukan kelayakan menunggang. Tetapi anda tetap perlukan lesen yang sah untuk menunggang di jalan raya, dan kami galakkan selesaikan lesen dahulu supaya motor yang dibeli boleh terus digunakan.',
          'Untuk pemohon bawah 21 tahun atau yang baru mula bekerja, kebanyakan pembiaya akan minta penjamin atau deposit lebih tinggi, kerana tempoh rekod pendapatan masih pendek. Ini bukan halangan — cuma faktor tambahan yang perlu dirancang awal.',
          'Satu lagi syarat yang jarang disebut: komitmen sedia ada. Kalau anda sudah ada loan kereta, loan peribadi dan baki kad kredit, jumlah semua ansuran bulanan berbanding pendapatan (nisbah khidmat hutang) akan diambil kira. Ansuran motor RM200 nampak kecil, tetapi kalau 70% pendapatan anda sudah pergi ke komitmen lain, itu yang jadi masalah — bukan motor itu sendiri.'
        ]
      },
      {
        h: '3. Dokumen yang perlu disediakan — ikut jenis pekerjaan',
        p: [
          'Kebanyakan kelewatan berlaku sebab dokumen dihantar sikit-sikit. Kumpul semuanya dahulu, baru mohon. Asasnya untuk semua orang: salinan kad pengenalan (depan dan belakang), bukti pendapatan, dan bukti alamat semasa seperti bil utiliti atau penyata bank yang tertera alamat.',
          'Pekerja bergaji tetap (ada slip gaji): slip gaji 1 hingga 3 bulan terkini dan penyata bank 3 bulan yang menunjukkan gaji masuk. Ini kombinasi paling mudah — selagi angka slip dan angka bank sepadan, proses biasanya pantas.',
          'Kerja sendiri atau berniaga: pendaftaran SSM jika ada, penyata bank 3 hingga 6 bulan yang menunjukkan kemasukan perniagaan, dan borang cukai (B/BE) atau penyata LHDN jika pernah failkan. Tanpa slip gaji, penyata bank menjadi dokumen utama — kami terangkan lebih lanjut dalam panduan khusus loan motor tanpa slip gaji.',
          'Pemandu e-hailing dan penghantar (Grab, Foodpanda, Lalamove dan seumpamanya): tangkap layar pendapatan mingguan atau bulanan dari aplikasi, bersama penyata bank yang menunjukkan pembayaran masuk daripada platform. Dua dokumen ini bersama-sama memberi gambaran yang cukup jelas.',
          'Pekerja bergaji tunai: ini paling mencabar tetapi bukan mustahil — surat pengesahan majikan membantu, dan penyata bank yang menunjukkan simpanan konsisten adalah kunci. Kalau gaji tak pernah masuk bank, mulakan sekarang; tiga bulan rekod yang teratur sudah mengubah keadaan.',
          'Petua kecil yang menjimatkan banyak masa: pastikan nama dan nombor kad pengenalan sama ejaan pada semua dokumen. Perbezaan kecil — nama singkatan di bank, nama penuh di IC — pun boleh menimbulkan soalan dan melambatkan proses.'
        ]
      },
      {
        h: '4. Pilih motor yang munasabah dengan pendapatan',
        p: [
          'Ini faktor yang paling kerap diabaikan. Ansuran bulanan yang terlalu tinggi berbanding pendapatan adalah sebab penolakan yang biasa, walaupun rekod kredit anda bersih.',
          'Sebagai panduan kasar: kira semua komitmen bulanan anda selepas menambah ansuran motor baharu — sewa rumah, loan lain, kad kredit, dan ansuran motor itu sendiri. Kalau jumlahnya melebihi separuh pendapatan bersih, permohonan akan dinilai dengan lebih ketat. Bawah satu pertiga, kedudukan anda selesa.',
          'Contoh mudah: gaji bersih RM2,000, sewa bilik RM400, tiada komitmen lain. Ansuran motor RM200 sebulan meletakkan jumlah komitmen pada RM600 — 30% pendapatan. Itu profil yang mudah diluluskan. Pemohon yang sama memohon motor dengan ansuran RM450 sebulan akan menghadapi soalan yang lebih banyak.',
          'Kalau permohonan untuk model yang lebih mahal ditolak, memilih model atau tahun yang lebih rendah selalunya mengubah keputusan sepenuhnya. Y15ZR tahun lebih awal, atau kapcai 125cc berbanding 150cc, boleh menurunkan ansuran sehingga cukup untuk melepasi penilaian. Motor terpakai yang lebih murah dengan deposit lebih tinggi juga meningkatkan peluang — dan anda sentiasa boleh naik taraf kemudian apabila rekod bayaran anda sudah terbina.'
        ]
      },
      {
        h: '5. Deposit lebih tinggi = peluang lebih baik',
        p: [
          'Deposit bukan sekadar mengurangkan jumlah pinjaman. Ia menunjukkan komitmen dan mengurangkan risiko pihak yang membiayai, jadi permohonan jadi lebih mudah diluluskan.',
          'Kesannya berganda: deposit RM1,000 pada motor RM6,000 bukan sahaja mengurangkan jumlah dibiayai kepada RM5,000, ia juga menurunkan ansuran bulanan — yang seterusnya memperbaiki nisbah komitmen anda. Satu tindakan, dua kesan positif pada penilaian.',
          'Kalau anda mampu tambah sedikit deposit, itu selalunya cara paling cepat untuk menaikkan peluang lulus — lebih cepat daripada menunggu rekod kredit pulih, dan lebih murah daripada membayar faedah atas jumlah penuh selama bertahun-tahun.',
          'Untuk pemohon yang rekod kreditnya kurang baik, deposit tinggi kadangkala menjadi faktor penentu antara tolak dan lulus. Pembiaya melihat deposit sebagai bukti anda serius dan mempunyai disiplin simpanan — dua perkara yang rekod lama anda mungkin tidak tunjukkan.'
        ]
      },
      {
        h: '6. Kesilapan biasa yang buat permohonan ditolak',
        p: [
          'Mohon di banyak tempat serentak dalam masa singkat. Setiap semakan kredit meninggalkan jejak dalam rekod anda, dan corak permohonan bertalu-talu dalam seminggu dua boleh nampak seperti anda terdesak — walaupun niat sebenar cuma nak bandingkan tawaran. Pilih satu dua tempat yang paling sesuai, dan mohon di situ dahulu.',
          'Maklumat tidak tepat atau dibesar-besarkan. Pendapatan yang tidak sepadan dengan penyata bank akan ketara semasa semakan, dan ia menjejaskan kredibiliti keseluruhan permohonan. Lebih baik nyatakan angka sebenar dan biarkan kami cari jalan, daripada angka cantik yang runtuh bila disemak.',
          'Ada tunggakan kecil yang belum selesai. Bil telefon tertunggak, ansuran barangan elektrik yang tertinggal dua bulan — perkara kecil ini muncul dalam rekod dan menimbulkan soalan. Selesaikan dahulu jika boleh, walaupun jumlahnya kecil; kesannya pada penilaian jauh lebih besar daripada nilainya.',
          'Tiada rekod kredit langsung. Kalau anda tidak pernah ada sebarang pinjaman atau kad kredit, tiada rekod untuk dinilai — penilai tidak tahu sama ada anda pembayar yang baik atau tidak. Ini bukan halangan mutlak, tetapi penjamin atau deposit lebih tinggi boleh membantu mengimbanginya.',
          'Dokumen tidak lengkap atau gambar tidak jelas. Bunyinya remeh, tetapi gambar IC yang kabur atau penyata bank yang terpotong adalah antara sebab kelewatan paling biasa yang kami lihat. Pastikan setiap dokumen boleh dibaca penuh sebelum dihantar.'
        ]
      },
      {
        h: '7. Apa berlaku selepas anda mohon — garis masa sebenar',
        p: [
          'Supaya anda tahu apa yang normal dan apa yang tidak, ini garis masa tipikal permohonan melalui kedai kami. Hari pertama: anda hantar maklumat asas — nama, telefon, IC, model yang diminati — dan kami balas dengan senarai dokumen mengikut jenis pekerjaan anda. Kalau dokumen anda sudah sedia, semakan bermula hari itu juga.',
          'Hari pertama hingga kedua: kami semak dokumen dan rekod, kemudian balas dengan keputusan atau soalan susulan. Kalau lulus, kami berikan angka penuh secara bertulis — deposit, ansuran bulanan, tempoh, dan jumlah keseluruhan. Tiada angka tersembunyi, dan anda tidak perlu bayar apa-apa untuk tahu angka ini.',
          'Selepas anda setuju: bayar deposit, tandatangan perjanjian, dan kami uruskan insurans, cukai jalan dan urusan JPJ. Kebanyakan pelanggan ambil motor dalam beberapa hari dari pertanyaan pertama — halangan paling biasa bukan proses kami, tetapi dokumen yang tiba sikit-sikit.',
          'Permohonan melalui bank mengikut rentak yang berbeza: borang lebih formal, semakan lebih lama, dan keputusan biasanya dalam beberapa hari bekerja hingga seminggu lebih. Tidak salah pergi jalan bank — kalau anda layak, kadarnya lebih murah. Cuma rancang masa dengan betul kalau anda perlukan motor segera untuk kerja.'
        ]
      },
      {
        h: '8. Kalau pernah gagal — apa langkah seterusnya',
        p: [
          'Permohonan yang ditolak bukan penamat. Langkah pertama ialah tahu sebab sebenar penolakan, kerana penyelesaiannya berbeza mengikut sebab. Tanya terus pihak yang menolak — anda berhak tahu.',
          'Kalau isunya pendapatan atau nisbah komitmen: pertimbangkan model lebih murah, deposit lebih tinggi, atau tunggu sehingga komitmen lain berkurangan. Ini isu matematik, dan matematik boleh diubah.',
          'Kalau isunya rekod kredit: dapatkan laporan CCRIS anda daripada Bank Negara Malaysia melalui portal eCCRIS (percuma), dan semak laporan CTOS anda. Kadangkala terdapat rekod lama yang sudah selesai tetapi belum dikemas kini, atau tunggakan kecil yang anda sendiri terlupa. Kedua-duanya boleh diperbaiki — kami tulis panduan penuh tentang loan motor dengan rekod CTOS/CCRIS.',
          'Bila nak mohon semula? Selepas keadaan berubah — bukan sekadar selepas masa berlalu. Kalau anda mohon semula dengan profil yang sama, keputusannya biasanya sama. Tetapi selepas tiga hingga enam bulan rekod bayaran bersih, deposit yang lebih besar, atau pendapatan yang kini boleh dibuktikan, permohonan kedua adalah cerita yang berbeza.',
          'Kalau anda sukar lulus di bank, pembiayaan melalui kedai adalah pilihan yang patut dipertimbangkan. Penilaiannya lebih fleksibel dan mengambil kira keadaan sebenar anda, bukan hanya skor. Kami terangkan perbezaan penuh — termasuk kekurangannya — dalam panduan apa itu loan kedai motor.'
        ]
      },
      {
        h: 'Ringkasnya',
        p: [
          'Loan motor "senang lulus" bukan tentang mencari jalan pintas. Ia tentang menghantar permohonan yang lengkap, jujur dan munasabah — dokumen kemas, motor yang sepadan dengan kemampuan, dan deposit yang memadai. Tiga perkara itu dalam kawalan anda sepenuhnya.',
          'Kalau anda di sekitar Simpang Ampat, Bukit Tambun, Batu Kawan, Bukit Mertajam atau Seberang Perai dan tidak pasti anda layak atau tidak, hantar pertanyaan kepada kami. Kami semak keadaan anda dan beritahu dengan jujur pilihan yang ada — termasuk kalau jawapannya belum sesuai buat masa ini.'
        ]
      }
    ],
    faq: [
      ['Berapa lama loan motor lulus?', 'Kalau dokumen lengkap dan padan, kelulusan melalui kedai boleh diketahui dalam sehari dua; melalui bank biasanya beberapa hari bekerja. Kelewatan hampir selalu berpunca daripada dokumen tidak lengkap, jadi sediakan semuanya sebelum mohon.'],
      ['Gaji RM1,500 boleh loan motor tak?', 'Boleh dipertimbangkan, terutama untuk model dengan ansuran rendah dan jika komitmen lain anda sedikit. Yang dinilai bukan gaji semata-mata tetapi baki kemampuan selepas semua komitmen. Deposit lebih tinggi banyak membantu pada tahap gaji ini.'],
      ['Umur 18 tahun boleh mohon loan motor?', 'Boleh — 18 tahun ialah umur minimum. Tetapi kerana rekod pendapatan biasanya masih pendek, pembiaya lazimnya minta penjamin atau deposit lebih tinggi bagi pemohon termuda.'],
      ['Perlu ke penjamin untuk loan motor?', 'Tidak semestinya. Penjamin biasanya diminta apabila pendapatan sukar dibuktikan, rekod kredit tiada atau kurang baik, atau pemohon terlalu muda. Profil yang kukuh selalunya tidak memerlukan penjamin.'],
      ['Kenapa loan motor tak lulus walaupun gaji cukup?', 'Sebab paling biasa: jumlah komitmen bulanan sudah terlalu tinggi berbanding pendapatan, maklumat yang tidak sepadan antara borang dan penyata bank, atau tunggakan kecil dalam rekod CCRIS/CTOS yang belum diselesaikan.'],
      ['Loan kedai dengan loan bank, mana lebih senang lulus?', 'Loan kedai lebih fleksibel kerana penilaian dibuat kes demi kes oleh kedai sendiri, termasuk untuk pemohon tanpa slip gaji atau dengan rekod kurang baik. Kos pembiayaannya biasanya lebih tinggi daripada bank — baca panduan kami tentang beza loan kedai dan loan bank sebelum memilih.']
    ]
  },
  {
    slug: 'loan-motor-tanpa-slip-gaji',
    date: '2026-07-28',
    dateModified: '2026-08-20',
    readMinutes: 10,
    title: 'Loan Motor Tanpa Slip Gaji — Boleh Ke? Ini Caranya',
    description:
      'Tiada slip gaji tapi nak loan motor? Dokumen alternatif ikut jenis kerja, apa yang dilihat dalam penyata bank, dan langkah kalau permohonan ditolak.',
    keywords: 'loan motor tanpa slip gaji, loan motor kerja sendiri, loan motor gaji tunai, loan motor rider grab, loan motor Simpang Ampat',
    image: '/stock/y15zr-mdn7025.jpg',
    intro:
      'Soalan ini kami terima hampir setiap hari: "Saya kerja sendiri / gaji tunai, tak ada slip gaji — boleh buat loan motor tak?" Jawapan ringkasnya: boleh cuba, dan ramai yang berjaya. Yang penting bukan slip gaji itu sendiri, tetapi bukti bahawa anda ada pendapatan tetap dan mampu bayar ansuran. Panduan ini menyenaraikan dokumen alternatif yang boleh digunakan mengikut jenis pekerjaan anda, menerangkan apa sebenarnya yang dilihat dalam penyata bank, dan memberi contoh pengiraan supaya anda tahu apa yang munasabah untuk dipohon.',
    sections: [
      {
        h: 'Kenapa slip gaji diminta pada mulanya',
        p: [
          'Slip gaji hanyalah cara paling mudah untuk mengesahkan dua perkara: anda ada pendapatan, dan pendapatan itu masuk secara tetap.',
          'Kalau anda boleh tunjukkan dua perkara yang sama melalui dokumen lain, tujuan asalnya tetap tercapai. Itulah sebabnya pekerja sendiri, peniaga kecil, pemandu e-hailing dan pekerja bergaji tunai masih boleh mohon — dan setiap minggu ada sahaja pemohon jenis ini yang lulus melalui kedai kami.',
          'Perkara yang perlu difahami awal: tanpa slip gaji, beban bukti berpindah ke dokumen lain, terutamanya penyata bank. Semakin kemas jejak kewangan anda, semakin mudah prosesnya. Panduan ini menunjukkan cara bina jejak itu — walaupun anda bermula dari kosong hari ini.'
        ]
      },
      {
        h: 'Dokumen alternatif — ikut jenis pekerjaan anda',
        p: [
          'Kerja sendiri / peniaga kecil: pendaftaran SSM atau lesen perniagaan jika ada, penyata bank 3–6 bulan yang menunjukkan kemasukan perniagaan, dan borang cukai (B/BE) atau penyata LHDN jika pernah failkan. Tak pernah daftar SSM dan tak pernah failkan cukai? Penyata bank sahaja masih boleh dipertimbangkan — ia cuma perlu bekerja lebih keras.',
          'Pemandu e-hailing / penghantar (Grab, Foodpanda, Lalamove): tangkap layar pendapatan mingguan atau bulanan dari aplikasi selama 2–3 bulan, bersama penyata bank yang menunjukkan pembayaran masuk daripada platform. Padanan antara angka aplikasi dan angka bank adalah bukti yang kuat.',
          'Pekerja bergaji tunai (kedai makan, bengkel, pembinaan, pasar): surat pengesahan pekerjaan dan gaji daripada majikan (tulisan tangan yang ditandatangani pun lebih baik daripada tiada), ditambah penyata bank yang menunjukkan simpanan konsisten. Kalau majikan tak boleh beri surat, rekod simpanan bank yang teratur menjadi dokumen utama anda.',
          'Penerima komisen (ejen jualan, ejen hartanah, ejen insurans): penyata komisen daripada syarikat prinsipal dan penyata bank 3–6 bulan. Pendapatan komisen naik turun — itu normal dan difahami — yang dinilai ialah purata dan konsistensi kemasukan.',
          'Pemilik akaun e-dompet: sesetengah peniaga kecil terima bayaran melalui TnG eWallet atau seumpamanya. Penyata transaksi e-dompet boleh menjadi dokumen sokongan, tetapi pindahkan baki ke akaun bank secara berkala — penyata bank tetap dokumen yang paling dipercayai.',
          'Untuk semua kategori: penyata KWSP atau caruman SOCSO/PERKESO, jika ada, menunjukkan sejarah pekerjaan walaupun majikan tidak mengeluarkan slip rasmi. Ia bukan pengganti bukti pendapatan semasa, tetapi ia menambah keyakinan.'
        ]
      },
      {
        h: 'Penyata bank: apa sebenarnya yang dilihat',
        p: [
          'Penyata bank ialah dokumen paling penting bagi pemohon tanpa slip gaji, jadi berbaloi faham apa yang dinilai padanya. Bukan baki akhir yang besar — tetapi corak.',
          'Pertama, kekerapan dan konsistensi kemasukan. Duit masuk setiap minggu atau setiap bulan pada kadar yang hampir sama adalah tanda pendapatan sebenar. Kemasukan sekali sekala dalam jumlah besar kurang meyakinkan, kerana ia tidak menunjukkan kemampuan membayar ansuran setiap bulan.',
          'Kedua, tempoh. Tiga bulan ialah minimum yang biasa diminta; enam bulan memberi gambaran yang lebih kukuh. Kalau anda baru mula memasukkan pendapatan ke bank, jangan tunggu "sempurna" — tiga bulan rekod yang teratur sudah cukup untuk mula berbincang.',
          'Ketiga, baki selepas perbelanjaan. Akaun yang sentiasa kembali ke sifar sebelum hujung bulan menimbulkan soalan tentang ruang untuk ansuran baharu. Cuba tinggalkan baki yang konsisten — walaupun kecil — sebagai bukti ada lebihan setiap bulan.',
          'Satu kesilapan yang kami sering nampak: pemohon "menggemukkan" akaun dengan memasukkan pinjaman kawan sehari dua sebelum cetak penyata. Kemasukan sekali harung yang tiada sejarah sangat mudah dikenal pasti, dan ia merosakkan kepercayaan pada keseluruhan penyata. Jangan buat — corak tiga bulan yang jujur jauh lebih bernilai.'
        ]
      },
      {
        h: 'Kalau pendapatan masuk secara tunai',
        p: [
          'Ini keadaan yang paling mencabar, tetapi bukan mustahil. Masalahnya mudah: kalau duit tak pernah masuk bank, tiada jejak untuk ditunjukkan.',
          'Cara paling berkesan ialah mula masukkan pendapatan ke akaun bank secara konsisten dari sekarang. Masuk jumlah yang sama atau hampir sama setiap minggu — contohnya setiap malam Jumaat — supaya corak yang terbentuk jelas. Walaupun anda baru mula, tiga bulan rekod kemasukan yang teratur sudah memberi gambaran yang jauh lebih baik daripada tiada langsung.',
          'Sementara membina rekod itu, dua perkara boleh mengimbangi kekurangan bukti pendapatan: deposit yang lebih tinggi, atau penjamin yang mempunyai pendapatan tetap. Kalau anda mahu motor segera dan tidak boleh tunggu tiga bulan, ini laluan yang realistik.',
          'Perlu jujur: ada kes gaji tunai yang memang belum boleh dibantu lagi — contohnya tiada sebarang jejak kewangan dan tiada penjamin. Dalam kes itu kami akan beritahu terus terang, dan beritahu juga apa yang perlu dibina dahulu supaya tiga bulan dari sekarang jawapannya berbeza.'
        ]
      },
      {
        h: 'Contoh pengiraan sebenar',
        p: [
          'Supaya perbincangan ini konkrit, ambil contoh biasa di kedai kami: Y15ZR terpakai berharga RM6,000, deposit RM500, baki dibiayai RM5,500, tempoh 36 bulan.',
          'Pembiayaan motor di Malaysia lazimnya dikira menggunakan kadar rata (flat rate). Pada contoh kadar 10% setahun rata: faedah = RM5,500 × 10% × 3 tahun = RM1,650. Jumlah bayaran balik RM7,150, ansuran bulanan sekitar RM199.',
          'Nota penting tentang kadar rata: 10% setahun "rata" tidak sama dengan 10% kadar efektif. Oleh sebab faedah dikira atas jumlah asal dan bukan baki berkurangan, kadar efektifnya hampir dua kali ganda angka rata. Ini bukan helah sesiapa — ia cara standard pembiayaan sewa beli motor dikira di Malaysia, di bank mahupun kedai — tetapi anda patut faham apa yang anda tandatangani. Kami sediakan kalkulator ansuran motor yang menunjukkan jumlah kos sebenar.',
          'Untuk pemohon tanpa slip gaji, contoh ini juga menunjukkan apa yang perlu dibuktikan: kemampuan membayar RM199 sebulan secara konsisten. Penyata bank yang menunjukkan lebihan RM300–400 sebulan selepas perbelanjaan sudah menjawab soalan itu dengan sendirinya.'
        ]
      },
      {
        h: 'Penjamin — bila ia membantu, bila tidak',
        p: [
          'Penjamin ialah orang yang bersetuju menanggung tanggungjawab jika anda gagal bayar. Kehadiran penjamin yang mempunyai pendapatan tetap dan rekod kredit baik boleh mengubah keputusan permohonan — terutamanya bagi pemohon tanpa bukti pendapatan formal.',
          'Bila penjamin benar-benar membantu: pemohon muda yang baru bekerja, pemohon gaji tunai yang belum ada jejak bank, dan pemohon yang pendapatannya cukup tetapi tidak dapat dibuktikan sepenuhnya. Dalam kes-kes ini penjamin mengisi lompang bukti, dan permohonan yang tadinya tergantung boleh lulus.',
          'Bila penjamin kurang membantu: kalau isu sebenar ialah kemampuan — ansuran yang dipohon memang terlalu tinggi untuk pendapatan anda — penjamin tidak menyelesaikan masalah itu, cuma memindahkan risikonya kepada orang lain. Dalam kes ini, model yang lebih murah adalah jawapan yang betul.',
          'Fikirkan ini dengan serius dan berbincang secara jujur dengan bakal penjamin. Ia komitmen sebenar, bukan sekadar tandatangan: kalau anda gagal bayar, dia yang akan dikejar. Jangan minta sesiapa jadi penjamin tanpa mereka faham sepenuhnya risikonya — dan kalau anda diminta menjadi penjamin orang lain, timbang dengan piawai yang sama.'
        ]
      },
      {
        h: 'Kalau ditolak — dan bila patut mohon semula',
        p: [
          'Penolakan bukan penamat, tetapi mohon semula esoknya dengan profil yang sama akan membawa keputusan yang sama. Yang penting ialah tahu sebabnya dan ubah apa yang boleh diubah.',
          'Kalau sebabnya bukti pendapatan tidak mencukupi: bina rekod bank selama tiga bulan seperti di atas, kemudian mohon semula. Ini sebab penolakan yang paling mudah dipulihkan.',
          'Kalau sebabnya rekod kredit: dapatkan laporan CCRIS anda (percuma melalui eCCRIS) dan laporan CTOS, semak apa yang sebenarnya tercatat, dan selesaikan tunggakan yang masih terbuka. Bank Negara Malaysia sendiri menyatakan dalam soalan lazim rasmi CCRIS: "It is not a blacklist system as perceived by some people" — CCRIS bukan senarai hitam, ia rekod fakta yang boleh diperbaiki dengan masa dan bayaran konsisten.',
          'Elakkan menghantar permohonan ke banyak tempat serentak selepas ditolak. Setiap semakan meninggalkan jejak, dan corak itu memburukkan lagi profil anda. Satu penolakan, satu diagnosis, satu pembetulan — kemudian cuba semula.'
        ]
      },
      {
        h: 'Senarai semak sebelum anda hubungi mana-mana kedai',
        p: [
          'Untuk menjimatkan masa anda (dan menaikkan peluang jawapan cepat), sediakan perkara ini sebelum menghantar pertanyaan pertama — kepada kami atau mana-mana pembiaya.',
          'Dokumen asas: gambar kad pengenalan depan dan belakang yang jelas, penyata bank 3 bulan terkini (muat turun PDF dari aplikasi bank lebih baik daripada tangkap layar), dan bukti pendapatan mengikut kategori anda dari senarai di atas. Simpan semuanya dalam satu folder di telefon supaya boleh hantar sekali gus.',
          'Maklumat yang perlu anda tahu sendiri: pendapatan purata sebulan (angka jujur, bukan bulan terbaik), jumlah komitmen bulanan sedia ada, berapa deposit yang anda mampu, dan model motor yang diminati berserta bajet ansuran yang selesa.',
          'Soalan yang patut anda tanya kami balik: berapa jumlah keseluruhan sampai habis, apa caj kalau lewat bayar, dan bila tukar nama dibuat. Pembiaya yang jujur akan jawab ketiga-tiganya secara bertulis tanpa berdolak-dalik.',
          'Dengan persediaan ini, kebanyakan pertanyaan boleh dijawab dalam hari yang sama — dan anda akan nampak dengan cepat kedai mana yang telus dan kedai mana yang berselindung.'
        ]
      },
      {
        h: 'Apa yang kami boleh dan tak boleh buat',
        p: [
          'Yang kami boleh buat: menilai permohonan tanpa slip gaji menggunakan dokumen alternatif di atas, menerima kes yang bank biasanya tolak terus, memberi jawapan cepat, dan menguruskan semua urusan tukar nama dan JPJ selepas lulus. Kami buat penilaian sendiri, jadi kami boleh pertimbangkan konteks — bukan sekadar skor.',
          'Yang kami tak boleh buat: meluluskan semua orang, atau menjanjikan kelulusan sebelum menyemak dokumen anda. Sesiapa yang berjanji "confirm lulus" tanpa melihat apa-apa bukti patut anda ragui — di mana-mana kedai pun.',
          'Langkah seterusnya mudah: kumpulkan apa yang anda ada sekarang — kad pengenalan, penyata bank terkini, dan sebarang bukti pendapatan lain — kemudian hubungi kami dan beritahu keadaan sebenar anda. Kami di Simpang Ampat, Pulau Pinang dan berkhidmat untuk kawasan sekitar termasuk Bukit Tambun, Batu Kawan, Juru, Bukit Mertajam dan Nibong Tebal. Beritahu kami model motor yang anda minati, kami semak dan beri jawapan jujur tentang pilihan yang ada.'
        ]
      }
    ],
    faq: [
      ['Betul ke boleh loan motor tanpa slip gaji?', 'Boleh. Slip gaji hanyalah satu cara membuktikan pendapatan. Penyata bank 3–6 bulan, rekod pendapatan aplikasi e-hailing, penyata komisen atau surat pengesahan majikan boleh mengambil alih fungsinya, bergantung pada jenis kerja anda.'],
      ['Berapa bulan penyata bank diperlukan?', 'Tiga bulan ialah minimum yang biasa; enam bulan memberi gambaran lebih kukuh. Yang dinilai ialah corak kemasukan yang konsisten, bukan baki yang besar.'],
      ['Kerja Grab / penghantar makanan boleh loan motor?', 'Boleh. Tangkap layar pendapatan dari aplikasi selama 2–3 bulan bersama penyata bank yang menunjukkan bayaran masuk daripada platform adalah kombinasi bukti yang biasa kami terima.'],
      ['Gaji tunai, duit tak pernah masuk bank — macam mana?', 'Mula masukkan pendapatan ke bank secara konsisten dari sekarang; tiga bulan rekod sudah banyak membantu. Sementara itu, deposit lebih tinggi atau penjamin boleh mengimbangi kekurangan bukti.'],
      ['Perlu penjamin ke kalau tiada slip gaji?', 'Tidak semestinya. Kalau penyata bank anda menunjukkan pendapatan yang jelas dan konsisten, penjamin biasanya tidak diperlukan. Penjamin diminta apabila bukti pendapatan terlalu tipis.'],
      ['Berapa lama proses kelulusan tanpa slip gaji?', 'Kalau dokumen alternatif lengkap, prosesnya tidak jauh berbeza daripada permohonan biasa — melalui kedai, selalunya dalam sehari dua. Yang melambatkan ialah dokumen yang tidak lengkap, bukan ketiadaan slip gaji itu sendiri.']
    ]
  },
  {
    slug: 'blacklist-ctos-boleh-loan-motor',
    date: '2026-07-28',
    dateModified: '2026-08-20',
    readMinutes: 10,
    title: 'Blacklist / CTOS — Boleh Buat Loan Motor Ke?',
    description:
      'Beza blacklist, CTOS dan CCRIS, cara semak rekod anda secara percuma, apa yang boleh diperbaiki, dan pilihan loan motor yang masih terbuka.',
    keywords: 'blacklist boleh loan motor, loan motor CTOS, loan motor CCRIS, loan motor blacklist Penang, semak CCRIS percuma',
    image: '/stock/y15zr-ppg1542.jpg',
    intro:
      'Perkataan "blacklist" sering digunakan secara longgar, dan ia menakutkan ramai orang daripada mencuba langsung. Hakikatnya lebih bernuansa daripada itu — malah Bank Negara Malaysia sendiri menegaskan CCRIS bukan senarai hitam. Dalam banyak kes, pilihan masih terbuka. Artikel ini menerangkan apa yang sebenarnya berlaku di sebalik istilah tersebut, cara menyemak rekod anda sendiri secara percuma, apa yang boleh diperbaiki dan berapa lama, serta pilihan yang realistik untuk mendapatkan motor sementara rekod anda pulih.',
    sections: [
      {
        h: 'Blacklist, CTOS dan CCRIS bukan perkara yang sama',
        p: [
          'CCRIS (Central Credit Reference Information System) ialah sistem Bank Negara Malaysia yang merekodkan pinjaman anda dengan institusi kewangan dan status bayaran dua belas bulan terkini. Ia merekodkan fakta — pinjaman apa, baki berapa, bayaran lancar atau tertunggak — termasuk rekod yang baik.',
          'Penting untuk difahami: CCRIS bukan senarai hitam. Ini bukan pendapat kami — soalan lazim rasmi Bank Negara sendiri menyatakan, "It is not a blacklist system as perceived by some people." Tiada senarai "orang yang dilarang buat loan" dalam sistem perbankan Malaysia. Yang ada hanyalah rekod, dan setiap pembiaya membuat keputusan sendiri berdasarkan rekod itu.',
          'CTOS pula ialah agensi pelaporan kredit swasta, berdaftar di bawah Akta Agensi Pelaporan Kredit 2010. Ia mengumpul maklumat daripada sumber awam — tindakan undang-undang, kes muflis, pengarah syarikat — dan menjana skor kredit. Skor CTOS yang rendah bermakna risiko yang dinilai lebih tinggi, bukan larangan automatik.',
          '"Blacklist" pula bukan istilah rasmi dalam sistem kredit. Kebanyakan orang yang kata mereka "kena blacklist" sebenarnya mempunyai rekod tunggakan dalam CCRIS atau skor CTOS yang rendah — dan itu perkara yang boleh diuruskan. Senarai hitam sebenar yang wujud adalah perkara berasingan: contohnya senarai imigresen, atau senarai dalaman sesebuah bank untuk bekas pelanggan bermasalah — dan senarai dalaman satu bank tidak mengikat kedai atau pembiaya lain.'
        ]
      },
      {
        h: 'Semak rekod anda sendiri dahulu — percuma',
        p: [
          'Sebelum membuat andaian, dapatkan rekod sebenar. Ramai yang menyangka rekod mereka teruk sedangkan hakikatnya boleh diurus — dan sesetengahnya pula terkejut menemui tunggakan kecil yang langsung tidak disedari.',
          'Laporan CCRIS boleh diperoleh secara percuma daripada Bank Negara Malaysia melalui portal eCCRIS (eccris.bnm.gov.my) — pendaftaran kali pertama boleh dibuat dalam talian — atau di kaunter BNM. Laporan CTOS pula boleh disemak melalui portal atau aplikasi rasmi CTOS; laporan asas disediakan percuma.',
          'Bila dapat laporan, semak tiga perkara: akaun yang masih tertunggak (ini keutamaan), rekod yang sudah selesai tetapi belum dikemas kini, dan maklumat yang salah. Kalau ada maklumat yang tidak tepat, anda berhak membuat pertikaian dan meminta pembetulan — melalui institusi berkenaan untuk CCRIS, atau terus dengan CTOS untuk laporan mereka.',
          'Bawa laporan ini bila anda berbincang dengan mana-mana pembiaya, termasuk kami. Perbincangan berasaskan rekod sebenar sentiasa lebih produktif daripada perbincangan berasaskan "rasanya saya blacklist".'
        ]
      },
      {
        h: 'Cara baca laporan CCRIS anda — dalam 5 minit',
        p: [
          'Laporan CCRIS kelihatan teknikal pada pandangan pertama, tetapi hanya tiga bahagian yang penting untuk tujuan anda. Bahagian pertama: senarai kemudahan kredit yang masih aktif (outstanding credit) — setiap pinjaman dan kad kredit anda, dengan baki dan had. Semak senarai ini dahulu: ada akaun yang anda tak ingat? Ada akaun yang bukan milik anda? Itu perkara pertama yang perlu diselesaikan.',
          'Bahagian kedua, yang paling diteliti pembiaya: rekod ansuran 12 bulan bagi setiap akaun. Ia dipaparkan sebagai barisan angka bulan demi bulan — 0 bermakna bayaran mengikut jadual, dan angka lebih besar menunjukkan berapa bulan tertunggak. Barisan penuh 0 ialah profil yang cantik; angka yang membesar dari bulan ke bulan (1, 2, 3...) ialah corak yang menimbulkan kebimbangan.',
          'Bahagian ketiga: permohonan kredit yang belum selesai (pending applications) — permohonan baharu anda dalam tempoh terkini. Kalau bahagian ini panjang, itu tanda anda memohon merata-rata, dan lebih baik berhenti seketika sebelum mencuba lagi.',
          'Untuk laporan CTOS pula, fokus pada bahagian rekod mahkamah dan status muflis (kalau ada), dan skor keseluruhan. Ingat: skor rendah tanpa sebarang kes undang-undang selalunya hanya bermakna rekod nipis atau tunggakan kecil — dua perkara yang paling mudah diperbaiki dalam senarai ini.'
        ]
      },
      {
        h: 'Apa yang boleh diperbaiki, dan berapa lama',
        p: [
          'Selesaikan tunggakan yang masih terbuka. Ini memberi kesan paling besar. Walaupun jumlahnya kecil, akaun yang masih tertunggak jauh lebih memudaratkan daripada akaun yang sudah diselesaikan. Kalau tidak mampu selesaikan sekali gus, hubungi pemiutang dan bincang pelan bayaran — akaun yang sedang dibayar semula lebih baik daripada akaun yang disenyapkan.',
          'Bayar ansuran sedia ada tepat pada masa selama beberapa bulan berturut-turut. CCRIS memaparkan corak dua belas bulan terkini, jadi setiap bulan bayaran bersih akan menolak keluar rekod lama secara beransur. Enam bulan bayaran konsisten sudah mengubah rupa laporan anda dengan ketara.',
          'Elakkan membuat permohonan baharu bertalu-talu dalam tempoh singkat semasa anda sedang memulihkan rekod. Setiap permohonan dicatat, dan corak permohonan kerap kelihatan seperti tekanan kewangan.',
          'Untuk kes yang melibatkan tindakan undang-undang atau kebankrapan, selesaikan status di peringkat berkenaan dahulu — rekod penyelesaian mengambil masa untuk dikemas kini, jadi simpan semua surat pelepasan sebagai bukti.',
          'Perlu jujur di sini: pemulihan mengambil masa beberapa bulan, bukan beberapa hari. Sesiapa yang menjanjikan "pembersihan rekod segera" dengan bayaran patut diragui — tiada sesiapa boleh memadamkan rekod yang sah, dan perkhidmatan "wipe CTOS" berbayar adalah antara penipuan yang paling biasa dalam bidang ini.'
        ]
      },
      {
        h: 'Pilihan yang masih terbuka sekarang',
        p: [
          'Sementara rekod pulih, ada beberapa cara realistik untuk permohonan motor tetap berjaya.',
          'Deposit yang lebih tinggi mengurangkan risiko pihak pembiaya secara langsung, dan ia sering menjadi faktor penentu bagi pemohon berekod. Deposit 20–30% daripada harga motor meletakkan permohonan dalam kedudukan yang jauh lebih baik.',
          'Model yang lebih murah atau tahun lebih rendah bermakna ansuran lebih kecil dan permohonan lebih mudah diterima. Mulakan dengan unit yang mampu diluluskan hari ini; bina rekod bayaran bersih dengannya; naik taraf kemudian dengan profil yang sudah pulih — laluan dua langkah ini hampir selalu lebih cepat daripada menunggu kelulusan unit mahal.',
          'Penjamin yang mempunyai rekod kredit baik boleh mengimbangi rekod anda, terutamanya jika isu anda adalah rekod lama yang sudah selesai tetapi masih kelihatan dalam tempoh paparan.',
          'Pembiayaan melalui kedai menilai keadaan anda secara menyeluruh dan bukan semata-mata berdasarkan skor. Kami boleh ambil kira konteks — tunggakan lama yang sudah selesai, punca masalah yang sudah berlalu, pendapatan semasa yang stabil — yang sistem penilaian automatik bank tidak pertimbangkan. Inilah sebabnya ramai pelanggan yang ditolak bank berjaya melalui kedai. Kos pembiayaan kedai biasanya lebih tinggi; kami terangkan perbandingan penuh dalam panduan loan kedai kami.'
        ]
      },
      {
        h: 'Tiga situasi biasa — dan langkah yang berkesan untuk setiap satu',
        p: [
          'Situasi pertama: tunggakan lama yang sudah diselesaikan, tetapi masih kelihatan dalam laporan. Ini situasi paling ringan. Rekod CCRIS memaparkan 12 bulan terkini, jadi kalau penyelesaian sudah lama, corak semasa anda sebenarnya bersih — yang perlu anda buat hanyalah membuktikannya. Bawa laporan terkini dan resit penyelesaian; bagi kebanyakan pembiaya termasuk kami, ini bukan penghalang kelulusan.',
          'Situasi kedua: masih ada tunggakan aktif yang kecil — bil telefon tertunggak, baki ansuran barangan yang tinggal beberapa ratus ringgit. Langkah paling berkesan: langsaikan dahulu sebelum mohon, dan simpan bukti bayaran. Menyelesaikan tunggakan RM300 minggu ini boleh mengubah keputusan permohonan RM6,000 — nisbah pulangan yang sukar dicari di tempat lain.',
          'Situasi ketiga: skor CTOS rendah kerana tindakan undang-undang atau kes yang lebih berat. Ini memerlukan masa dan langkah rasmi — selesaikan di peringkat berkenaan, simpan surat pelepasan, dan bina semula rekod bayaran. Sementara itu, pilihan yang realistik ialah unit murah dengan deposit tinggi, atau penjamin. Kami tidak akan berpura-pura semua kes boleh diselesaikan serta-merta; yang kami boleh buat ialah menilai kes sebenar anda dan beri jalan yang jujur.',
          'Perhatikan coraknya: dalam ketiga-tiga situasi, langkah pertama sentiasa sama — dapatkan laporan sebenar, jangan bergantung pada andaian. Kos untuk tahu ialah sifar ringgit dan satu petang. Kos untuk tidak tahu selalunya beberapa bulan tertangguh atas masalah yang sebenarnya boleh diselesaikan minggu itu juga.'
        ]
      },
      {
        h: 'Berhati-hati dengan janji "100% lulus"',
        p: [
          'Tiada sesiapa boleh menjamin kelulusan sebelum menyemak keadaan anda. Sesiapa yang menjanjikan kelulusan pasti, meminta bayaran pendahuluan untuk "menjamin" kelulusan, atau menawarkan khidmat "padam rekod CTOS", patut dielakkan — ketiga-tiganya adalah corak penipuan yang biasa menyasarkan orang yang terdesak.',
          'Tanda-tanda lain yang patut membuatkan anda berundur: diminta menandatangani borang kosong, kadar yang tidak dinyatakan secara bertulis, atau "yuran proses" yang perlu dibayar sebelum sebarang penilaian dibuat.',
          'Kami sendiri tidak menjanjikan kelulusan. Apa yang kami janjikan ialah semakan yang jujur dan jawapan yang jelas — termasuk memberitahu anda kalau jawapannya tidak, dan apa yang perlu diubah supaya jawapannya menjadi ya di masa hadapan.'
        ]
      },
      {
        h: 'Kalau anda tak pasti — tanya sahaja',
        p: [
          'Ramai orang menangguhkan bertanya kerana menyangka mereka pasti ditolak. Selalunya keadaan sebenar mereka lebih baik daripada yang disangka — rekod lama yang sudah selesai, tunggakan kecil yang boleh dilangsaikan minggu ini, atau skor yang rendah atas sebab yang boleh diterangkan.',
          'Beritahu kami keadaan anda secara jujur — termasuk rekod yang kurang baik. Semakin awal kami tahu, semakin tepat nasihat yang boleh kami beri. Kami di Simpang Ampat, Pulau Pinang, dan kami memang biasa membantu pelanggan yang sukar lulus di bank. Kami akan semak dan beritahu pilihan sebenar yang ada untuk anda.'
        ]
      }
    ],
    faq: [
      ['CCRIS tu blacklist ke?', 'Bukan. Bank Negara Malaysia sendiri menyatakan CCRIS bukan sistem senarai hitam — ia rekod fakta pinjaman dan bayaran 12 bulan terkini, termasuk rekod yang baik. Setiap pembiaya membuat keputusan sendiri berdasarkan rekod itu.'],
      ['Macam mana nak semak CCRIS dan CTOS? Berbayar ke?', 'Laporan CCRIS percuma melalui portal eCCRIS Bank Negara atau di kaunter BNM. Laporan asas CTOS juga boleh didapati percuma melalui portal/aplikasi rasmi CTOS.'],
      ['Berapa lama rekod tunggakan hilang dari CCRIS?', 'CCRIS memaparkan status bayaran 12 bulan terkini, jadi setiap bulan bayaran bersih menolak keluar sebulan rekod lama. Selepas tunggakan diselesaikan dan beberapa bulan bayaran konsisten, laporan anda kelihatan jauh lebih baik.'],
      ['Ada kes mahkamah / pernah muflis — masih boleh cuba?', 'Keadaan ini lebih berat dan setiap kes berbeza. Selesaikan status undang-undang dahulu dan simpan surat pelepasan. Hubungi kami dengan dokumen sebenar — kami beritahu terus terang sama ada boleh dibantu atau belum.'],
      ['Boleh ke bayar orang untuk "cuci" rekod CTOS?', 'Tidak. Rekod yang sah tidak boleh dipadam oleh sesiapa. Khidmat "wipe CTOS" berbayar adalah penipuan biasa. Yang boleh dibuat: betulkan maklumat yang salah (percuma, melalui pertikaian rasmi) dan bina semula rekod dengan bayaran konsisten.'],
      ['Kalau ditolak bank sebab CTOS, apa peluang di kedai?', 'Lebih baik daripada yang anda sangka. Kedai menilai kes demi kes dan boleh ambil kira konteks — rekod lama yang sudah selesai atau pendapatan semasa yang stabil. Deposit lebih tinggi dan pilihan model yang munasabah menaikkan lagi peluang.']
    ]
  },
  {
    slug: 'apa-itu-loan-kedai-motor',
    date: '2026-08-20',
    dateModified: '2026-08-20',
    readMinutes: 12,
    title: 'Apa Itu Loan Kedai Motor? Panduan Jujur Dari Kedai Sendiri',
    description:
      'Apa itu loan kedai motor, beza dengan loan bank, kelebihan, keburukan yang kedai lain tak cakap, dan contoh pengiraan sebenar — ditulis oleh kedai sendiri.',
    keywords: 'loan kedai motor, apa itu loan kedai, beza loan bank dan loan kedai, keburukan loan kedai, loan kedai senang lulus',
    image: '/stock/y15zr-v1-vee4989.jpg',
    intro:
      'Kami DR Racing di Simpang Ampat, dan kami memang menawarkan loan kedai. Jadi artikel ini bukan tulisan blogger yang tak pernah proses satu permohonan pun — ia penerangan dari dalam, termasuk bahagian yang kurang manis. Loan kedai ada tempatnya: ia menyelamatkan ramai pembeli yang bank tolak. Tetapi ia juga lebih mahal daripada loan bank, dan ada perkara yang anda patut faham sebelum tandatangan — di kedai kami atau di mana-mana kedai. Ini panduan penuhnya, dalam bahasa mudah.',
    sections: [
      {
        h: 'Apa itu loan kedai, dalam bahasa mudah',
        p: [
          'Loan kedai (atau pembiayaan dalaman / in-house financing) bermaksud kedai motor itu sendiri yang membiayai pembelian anda, bukannya bank. Anda bayar deposit, ambil motor, dan bayar ansuran bulanan terus kepada kedai sehingga selesai.',
          'Bezanya dengan loan bank: dalam loan bank, kedai hanya menjual motor — bank yang menilai permohonan anda, mengeluarkan wang kepada kedai, dan mengutip ansuran daripada anda. Dalam loan kedai, kedai memegang kedua-dua peranan: penjual dan pembiaya. Sebab itulah kedai boleh membuat keputusan sendiri tentang siapa yang diluluskan.',
          'Praktik biasa dalam loan kedai: geran motor (Sijil Pemilikan Kenderaan) kekal atas urusan kedai sehingga ansuran selesai, sebagai jaminan. Selepas bayaran penuh, tukar nama dibuat kepada anda. Tanyakan perkara ini secara spesifik di mana-mana kedai — bila tukar nama dibuat, dan apa dokumen yang anda dapat sebagai bukti bayaran.',
          'Loan kedai wujud kerana ada jurang sebenar dalam pasaran: ramai orang mampu bayar ansuran motor tetapi tidak dapat memenuhi syarat dokumen bank — kerja sendiri, gaji tunai, rekod kredit berparut, atau umur terlalu muda. Bagi kumpulan ini, loan kedai selalunya satu-satunya laluan formal untuk memiliki motor.'
        ]
      },
      {
        h: 'Beza loan bank vs loan kedai — perbandingan terus terang',
        p: [
          'Kadar faedah: loan bank hampir selalu lebih murah. Kadar pembiayaan motosikal bank dan syarikat kredit berlesen di Malaysia biasanya sekitar 0.3% hingga 0.9% sebulan rata bergantung pada profil dan model; loan kedai biasanya lebih tinggi daripada itu, kerana kedai menanggung risiko pemohon yang bank tidak sanggup ambil. Kalau anda layak lulus bank, loan bank ialah pilihan yang lebih jimat — kami cakap terus terang.',
          'Kelulusan: di sinilah loan kedai menang. Bank menilai dengan sistem automatik dan senarai semak dokumen yang tegar; tiada slip gaji bermakna tiada kelulusan di kebanyakan bank. Kedai menilai kes demi kes — penyata bank, pendapatan aplikasi, konteks rekod lama — dan boleh kata ya di mana sistem bank kata tidak.',
          'Kelajuan: loan kedai biasanya lulus dalam sehari dua kerana keputusan dibuat di kedai itu sendiri. Loan bank mengambil beberapa hari bekerja untuk proses yang lancar, lebih lama kalau dokumen berulang-alik.',
          'Dokumen: bank memerlukan set dokumen penuh dan tepat. Kedai lebih fleksibel tentang bentuk bukti pendapatan, seperti yang kami terangkan dalam panduan loan tanpa slip gaji.',
          'Perlindungan undang-undang: ini bahagian yang jarang diterangkan. Pembiayaan sewa beli yang dibuat mengikut Akta Sewa Beli 1967 datang dengan perlindungan berkanun untuk pembeli — dokumen perjanjian yang ditetapkan, prosedur sebelum pemilikan semula, dan penyata baki yang boleh diminta. Perjanjian loan kedai tidak semestinya berada di bawah kerangka yang sama; bentuk perjanjian berbeza antara kedai. Maksudnya: baca perjanjian anda, pastikan semua terma penting bertulis, dan simpan salinan. Di kedai yang jujur ini bukan masalah — tetapi anda hanya tahu kedai itu jujur selepas membaca dokumennya.'
        ]
      },
      {
        h: 'Bila loan kedai masuk akal — dan bila tidak',
        p: [
          'Loan kedai masuk akal kalau: anda tiada slip gaji atau bukti pendapatan formal; rekod CCRIS/CTOS anda menyebabkan bank menolak; anda perlukan motor segera untuk bekerja dan tidak boleh tunggu proses bank; atau jumlah pembiayaan kecil sehingga bank kurang berminat memprosesnya.',
          'Loan kedai tidak masuk akal kalau: anda ada slip gaji, rekod bersih dan tidak tergesa-gesa — pergi ke bank, kadar lebih murah; atau anda sebenarnya belum mampu bayar ansuran mana-mana pun. Loan kedai yang diluluskan bukan bukti anda mampu — kedai yang baik akan tolak kes yang jelas tidak mampu, tetapi penilaian terbaik tetap penilaian anda sendiri terhadap poket sendiri.',
          'Ada satu lagi kumpulan yang patut fikir dua kali: yang hampir-hampir layak bank. Kalau anda cuma perlukan tiga bulan untuk kemaskan penyata bank atau langsaikan satu tunggakan kecil, tunggu tiga bulan itu selalunya berbaloi — bezanya boleh jadi beberapa ratus hingga beribu ringgit sepanjang tempoh loan.',
          'Prinsip kami: loan kedai ialah alat untuk keadaan tertentu, bukan jawapan untuk semua orang. Kami untung apabila pelanggan bayar lancar sampai habis, bukan apabila pelanggan tersekat — jadi kami lebih rela tolak permohonan yang nampak akan bermasalah daripada meluluskannya.'
        ]
      },
      {
        h: 'Keburukan loan kedai yang kedai lain tak cakap',
        p: [
          'Pertama, ia lebih mahal. Kadar loan kedai lebih tinggi daripada bank, noktah. Mana-mana kedai yang menafikan ini tidak jujur dengan anda. Anda membayar untuk akses — kelulusan yang bank tidak beri — dan akses itu ada harganya. Persoalannya cuma sama ada harga itu berbaloi untuk keadaan anda.',
          'Kedua, perlindungan bergantung pada perjanjian. Seperti dinyatakan di atas, kerangka Akta Sewa Beli 1967 tidak semestinya terpakai. Kalau perjanjian anda tidak menyatakan apa berlaku bila anda lewat bayar, berapa caj lewat, dan bagaimana pemilikan semula dibuat — itu tanda amaran. Terma yang baik ialah terma yang bertulis.',
          'Ketiga, geran belum atas nama anda sepanjang tempoh loan (praktik biasa). Ini bermakna anda tidak boleh jual motor itu sendiri sehingga selesai — dan kalau anda beli motor terpakai yang masih dalam loan kedai orang lain, urusan tukar nama jadi rumit. Kami tulis panduan berasingan tentang motor yang tak boleh tukar nama sebab loan.',
          'Keempat, tidak semua kedai sama. Ada kedai yang telus, dan ada yang mengambil kesempatan atas pemohon terdesak: kadar tidak bertulis, caj tersembunyi, deposit "hangus" tanpa sebab jelas. Cara membezakannya mudah — kedai yang baik memberi semua angka secara bertulis sebelum anda bayar apa-apa, dan tidak tersinggung bila anda bertanya soalan.',
          'Senarai semak sebelum tandatangan di mana-mana kedai: harga penuh motor, jumlah deposit, jumlah dibiayai, kadar dan cara kiraan, ansuran bulanan, bilangan bulan, jumlah keseluruhan yang akan dibayar, caj lewat bayar, dan bila tukar nama dibuat. Sembilan angka ini bertulis — barulah tandatangan.'
        ]
      },
      {
        h: 'Contoh pengiraan sebenar (RM6,000, deposit RM500, 36 bulan)',
        p: [
          'Ambil contoh unit biasa di kedai kami: Y15ZR terpakai RM6,000, deposit RM500, baki dibiayai RM5,500, tempoh 36 bulan.',
          'Pembiayaan motor di Malaysia — bank atau kedai — lazimnya dikira dengan kadar rata: faedah dikira atas jumlah asal, bukan baki berkurangan. Pada contoh kadar 10% setahun rata: faedah = RM5,500 × 10% × 3 = RM1,650. Jumlah bayaran balik RM7,150. Ansuran bulanan ≈ RM199.',
          'Dua perkara penting dalam angka ini. Satu: jumlah kos sebenar motor itu bagi anda ialah RM7,650 (deposit + semua ansuran), bukan RM6,000 — sentiasa kira jumlah keseluruhan, bukan ansuran sahaja. Dua: kadar "10% rata" bersamaan kira-kira 18–19% setahun kadar efektif, kerana anda membayar faedah atas RM5,500 penuh walaupun baki hutang anda menurun setiap bulan. Ini standard industri sewa beli, bukan helah — tetapi ramai pembeli tidak sedar, dan kami rasa anda patut tahu.',
          'Bandingkan tempoh juga: unit sama pada 24 bulan = faedah RM1,100, ansuran ≈ RM275; pada 48 bulan = faedah RM2,200, ansuran ≈ RM160. Tempoh panjang bermakna ansuran ringan tetapi jumlah faedah lebih besar. Pilih tempoh terpendek yang ansurannya masih selesa untuk anda — itu formula paling jimat.',
          'Nak kira untuk model dan bajet anda sendiri? Guna kalkulator ansuran motor kami — ia tunjukkan bukan sahaja ansuran bulanan tetapi jumlah kos keseluruhan, termasuk anggaran insurans dan cukai jalan.'
        ]
      },
      {
        h: 'Mitos tentang loan kedai yang patut diperbetulkan',
        p: [
          'Mitos pertama: "loan kedai untuk orang yang kena tipu sahaja." Tidak benar — tetapi asal-usul mitos ini nyata: memang wujud kedai yang mengambil kesempatan, dan mangsanya paling kuat bersuara. Loan kedai yang telus, dengan semua terma bertulis, ialah produk kewangan yang sah dan berfungsi. Bezakan produk daripada pengendali yang buruk.',
          'Mitos kedua: "kalau bank tolak, memang tak layak mana-mana." Bank menolak atas sebab sistem — tiada slip gaji bermakna tiada kelulusan, walau pendapatan sebenar anda cukup. Kedai menilai bukti yang bank tidak terima. Ditolak bank bukan ukuran muktamad kemampuan anda.',
          'Mitos ketiga: "loan kedai tiada rekod, jadi tak bantu bina kredit." Sebahagiannya benar — kebanyakan pembiayaan kedai tidak dilaporkan ke CCRIS, jadi bayaran lancar anda tidak menaikkan skor rasmi. Tetapi ia tetap membina sesuatu: sejarah dengan kedai itu sendiri, resit bayaran yang boleh ditunjukkan, dan motor yang selesai hutangnya — aset sebenar atas nama anda.',
          'Mitos keempat: "deposit hangus kalau loan tak lulus." Di kedai yang betul, penilaian dibuat sebelum sebarang bayaran — anda tidak sepatutnya membayar apa-apa untuk tahu sama ada anda lulus. Mana-mana kedai yang minta "yuran booking" sebelum kelulusan patut disoal dengan teliti: bertanya itu percuma, dan jawapannya memberitahu anda segalanya tentang kedai itu.'
        ]
      },
      {
        h: 'Soalan yang patut anda tanya mana-mana kedai (termasuk kami)',
        p: [
          'Berapa jumlah keseluruhan yang saya akan bayar sampai habis? Kedai yang jujur jawab dengan satu angka, bukan "tengok nanti".',
          'Boleh saya dapat semua terma secara bertulis sebelum bayar deposit? Jawapan selain "boleh" adalah tanda amaran.',
          'Apa berlaku kalau saya lewat bayar sebulan? Anda mahu tahu caj dan proses sebelum ia berlaku, bukan selepas.',
          'Boleh saya selesaikan awal, dan ada rebat faedah tak? Sesetengah kedai beri rebat untuk penyelesaian awal, sesetengah tidak — tanya dahulu.',
          'Bila dan bagaimana tukar nama dibuat? Pastikan jawapannya spesifik: selepas bayaran penuh, oleh siapa, dalam tempoh berapa lama.',
          'Kalau jawapan-jawapan ini jelas dan bertulis, anda berurusan dengan kedai yang boleh dipercayai. Kalau berbelit, pergi tempat lain — walaupun tempat lain itu bukan kami.'
        ]
      },
      {
        h: 'Cara mohon dengan kami',
        p: [
          'Prosesnya ringkas. Pertama, pilih motor — lihat stok semasa kami atau beritahu model yang anda cari. Kedua, hantar maklumat asas: nama, nombor telefon, IC dan model yang diminati. Ketiga, kami semak dan berbincang terus tentang deposit, ansuran dan dokumen yang anda ada.',
          'Kami akan beri anda semua angka secara bertulis — harga, deposit, ansuran, tempoh, jumlah keseluruhan — sebelum anda membayar apa-apa. Kalau keadaan anda lebih sesuai dengan loan bank, kami akan cakap begitu. Kalau belum sesuai untuk mana-mana pembiayaan, kami akan cakap itu juga, dan beritahu apa yang perlu dibina dahulu.',
          'Kedai kami di Simpang Ampat, Pulau Pinang — berkhidmat untuk Bukit Tambun, Batu Kawan, Juru, Bukit Mertajam, Nibong Tebal dan seluruh Seberang Perai. WhatsApp kami untuk mula.'
        ]
      }
    ],
    faq: [
      ['Apa itu loan kedai motor?', 'Pembiayaan yang diberikan oleh kedai motor itu sendiri, bukan bank. Anda bayar deposit dan ansuran bulanan terus kepada kedai. Kelulusan lebih fleksibel daripada bank, tetapi kadarnya biasanya lebih tinggi.'],
      ['Loan kedai ke loan bank yang lebih baik?', 'Kalau anda layak lulus bank, loan bank hampir selalu lebih murah — pilih itu. Loan kedai masuk akal bila bank menolak: tiada slip gaji, rekod kredit berparut, atau perlukan kelulusan segera.'],
      ['Kenapa kadar loan kedai lebih tinggi daripada bank?', 'Kerana kedai menanggung risiko yang bank tidak sanggup ambil — pemohon tanpa bukti pendapatan formal atau dengan rekod tertunggak. Kadar lebih tinggi itu ialah harga akses kepada kelulusan.'],
      ['Geran motor atas nama siapa masa loan kedai?', 'Praktik biasa: geran kekal dengan kedai sebagai jaminan sehingga ansuran selesai, kemudian tukar nama dibuat kepada anda. Pastikan perkara ini dinyatakan bertulis dalam perjanjian anda.'],
      ['Loan kedai selamat ke?', 'Bergantung pada kedai. Tanda kedai yang boleh dipercayai: semua angka diberi bertulis sebelum anda bayar apa-apa, caj lewat dan proses dinyatakan jelas, dan mereka tidak tersinggung bila anda bertanya. Perjanjian bertulis ialah perlindungan utama anda.'],
      ['Blacklist / tiada slip gaji boleh mohon loan kedai?', 'Boleh cuba — inilah sebenarnya kes yang loan kedai wujud untuknya. Kami nilai kes demi kes menggunakan penyata bank dan dokumen alternatif lain. Deposit lebih tinggi menaikkan peluang.']
    ]
  },
  {
    slug: 'motor-tak-boleh-tukar-nama-sebab-loan',
    date: '2026-08-20',
    dateModified: '2026-08-20',
    readMinutes: 8,
    title: 'Motor Under Loan Tak Boleh Tukar Nama — Apa Yang Perlu Buat',
    description:
      'Motor masih loan memang tak boleh tukar nama selagi hutang belum selesai. Ini sebabnya, cara dapat surat pelepasan, dan langkah selamat beli atau jual.',
    keywords: 'motor tak boleh tukar nama sebab loan, motor under loan tukar nama, surat pelepasan bank motor, beli motor masih loan, settle loan motor tukar nama',
    image: '/stock/honda-dash-125-pqh2961.jpg',
    intro:
      'Situasi ini sangat biasa: anda nak beli motor terpakai, harga cantik, tapi penjual kata "geran takde lagi, motor ni masih loan". Atau anda sendiri nak jual motor yang ansurannya belum habis. Boleh ke tukar nama? Jawapan pendek: tidak — selagi loan belum diselesaikan, motor itu tidak boleh ditukar nama, kerana pembiaya masih memegang hak ke atasnya. Tetapi ada cara yang betul (dan selamat) untuk mengurusnya, dan itulah yang artikel ini terangkan langkah demi langkah.',
    sections: [
      {
        h: 'Kenapa motor under loan tak boleh tukar nama',
        p: [
          'Apabila motor dibiayai secara sewa beli, pembiaya — bank atau kedai — memegang kepentingan ke atas motor itu sebagai jaminan hutang. Dalam rekod JPJ, kenderaan itu ditanda dengan hak pembiaya (biasanya disebut "claim" atau tuntutan pemilikan), dan geran (Sijil Pemilikan Kenderaan) memaparkan tuntutan tersebut.',
          'Selagi tanda itu wujud, JPJ tidak akan memproses pertukaran hak milik. Ini bukan karenah birokrasi — ia perlindungan. Tanpa sekatan ini, peminjam boleh menjual motor yang masih berhutang dan menghilang, meninggalkan pembiaya tanpa jaminan dan pembeli baharu dengan motor yang boleh dituntut balik.',
          'Maksud praktikalnya: sesiapa yang "menjual" motor yang masih dalam loan hanya menjual kunci, bukan pemilikan. Pemilikan hanya boleh berpindah selepas hutang diselesaikan dan tanda tuntutan dilepaskan.'
        ]
      },
      {
        h: 'Surat pelepasan: apa itu, cara dapat, berapa lama',
        p: [
          'Surat pelepasan (release letter / surat pelepasan hak) ialah pengesahan bertulis daripada pembiaya bahawa hutang ke atas kenderaan itu telah diselesaikan sepenuhnya dan pembiaya melepaskan tuntutannya. Inilah dokumen yang membuka jalan untuk tukar nama di JPJ.',
          'Cara mendapatkannya: pemilik (peminjam) memohon penyata penyelesaian (settlement statement) daripada pembiaya untuk tahu baki tepat, menjelaskan baki itu, kemudian meminta surat pelepasan. Selepas pelepasan difailkan, tanda tuntutan pada rekod JPJ digugurkan dan tukar nama boleh dibuat.',
          'Berapa lama: penyata penyelesaian biasanya siap dalam beberapa hari bekerja; selepas bayaran, surat pelepasan dan pengemaskinian rekod lazimnya mengambil dari beberapa hari hingga beberapa minggu bergantung pada institusi. Rancang masa dengan realistik — ini bukan urusan yang selesai petang itu juga.',
          'Nota untuk motor dalam loan kedai: proses sama secara prinsip, tetapi lebih pantas kerana keputusan dibuat di kedai. Di kedai kami, penyelesaian dan tukar nama diuruskan sekali gus sebagai satu pakej — pelanggan tidak perlu berulang ke JPJ sendiri.'
        ]
      },
      {
        h: 'Kalau anda pembeli: penjual masih ada baki loan',
        p: [
          'Ini konfigurasi yang paling berisiko, jadi ikut urutan yang betul. Prinsip utamanya satu: jangan bayar harga penuh selagi laluan pelepasan belum jelas dan bertulis.',
          'Langkah selamat: pertama, minta penjual dapatkan penyata penyelesaian supaya baki sebenar diketahui — bukan angka agakan. Kedua, persetujui secara bertulis bagaimana bayaran anda dibahagikan: bahagian untuk melangsaikan baki loan (idealnya dibayar terus kepada pembiaya, bukan ke tangan penjual), dan bakinya kepada penjual selepas pelepasan disahkan. Ketiga, tukar nama dibuat sebaik tanda tuntutan digugurkan — dan hanya selepas itu urusan dianggap selesai.',
          'Tanda bahaya yang patut membuatkan anda berundur: penjual tidak mahu dedahkan baki loan, mahu bayaran penuh tunai "dulu, lepas tu saya settle", atau menawarkan "sambung bayar" tanpa pengetahuan pembiaya — anda membayar ansuran motor yang secara undang-undang bukan milik anda, dan kalau penjual berhenti bekerjasama, anda tiada apa-apa.',
          'Jalan yang lebih mudah: buat urusan melalui kedai yang boleh menguruskan penyelesaian. Kedai boleh menyemak geran, mengesahkan baki dengan pembiaya, memegang bayaran mengikut urutan yang betul, dan menyiapkan tukar nama — itulah sebenarnya sebahagian besar kerja kami dalam setiap pembelian motor terpakai.'
        ]
      },
      {
        h: 'Kalau anda penjual: settlement penuh vs refinance',
        p: [
          'Pilihan pertama, paling bersih: selesaikan baki loan sendiri dahulu (settlement penuh), dapatkan surat pelepasan, kemudian jual motor yang sudah bebas. Harga jualan anda lebih kuat kerana pembeli tidak menanggung sebarang kerumitan.',
          'Pilihan kedua: guna wang pembeli untuk penyelesaian, dengan bayaran dibuat terus kepada pembiaya seperti dalam bahagian pembeli di atas. Ini lazim dan sah — kuncinya ialah ketelusan dan urutan yang betul, dengan persetujuan bertulis.',
          'Pilihan ketiga untuk sesetengah keadaan: refinance atau ambil alih pembiayaan, iaitu pembeli membuat loan baharu (bank atau kedai) yang menyelesaikan loan lama anda. Ini perlu dibuat secara rasmi melalui pembiaya — "sambung bayar" tidak rasmi bukan refinance, ia risiko untuk kedua-dua pihak.',
          'Apa pun pilihan anda, elakkan satu perkara: menyerahkan motor kepada pembeli sebelum status loan jelas. Selagi nama anda pada hutang itu, tunggakan adalah tunggakan anda — walaupun motor sudah lama bukan di tangan anda.'
        ]
      },
      {
        h: 'Risiko beli motor yang geran masih "tersangkut"',
        p: [
          'Untuk pembeli yang tergoda dengan harga murah motor "geran sangkut", ini senarai risiko sebenar: motor boleh dituntut semula oleh pembiaya jika ansuran asal tertunggak — anda hilang motor walaupun sudah bayar penjual. Anda tidak boleh memperbaharui insurans dan cukai jalan atas nama sendiri. Kalau berlaku kemalangan, tuntutan insurans jadi rumit kerana anda bukan pemilik berdaftar. Dan bila anda sendiri mahu jual nanti, anda mewarisi masalah yang sama — dengan penjual asal yang mungkin sudah tidak dapat dihubungi.',
          'Harga murah itu bukan diskaun — ia harga risiko. Dalam hampir semua kes, lebih baik bayar sedikit lebih untuk unit yang gerannya bersih atau yang penyelesaiannya diuruskan dengan betul.',
          'Sebelum membeli mana-mana motor terpakai, semak geran dan pastikan butiran sepadan: nombor casis dan enjin, nama pemilik berdaftar, dan sama ada masih ada tuntutan pembiaya. Semakan lima minit ini mengelakkan masalah lima tahun.'
        ]
      },
      {
        h: 'Dokumen yang perlu disediakan untuk tukar nama',
        p: [
          'Bila laluan pelepasan sudah jelas, urusan tukar nama sendiri memerlukan dokumen berikut: kad pengenalan penjual dan pembeli, geran (Sijil Pemilikan Kenderaan), surat pelepasan daripada pembiaya jika kenderaan baru sahaja dilepaskan, dan borang pindah milik JPJ yang berkaitan. Kenderaan juga perlu mempunyai perlindungan insurans atas nama pemilik baharu sebelum pindahan boleh disempurnakan.',
          'Urutan praktikalnya: selesaikan pelepasan dahulu, kemudian insurans atas nama pembeli, kemudian pindah milik di JPJ, dan akhirnya cukai jalan diperbaharui atas nama baharu. Buat mengikut urutan ini dan setiap langkah menyokong langkah seterusnya; buat lompat-lompat dan anda akan berulang-alik.',
          'Kalau semua ini bunyi seperti banyak kerja — memang pun, kalau dibuat sendiri kali pertama. Sebab itulah pembeli dan penjual sama-sama lebih senang bila urusan dibuat melalui kedai yang memang menguruskannya setiap minggu.'
        ]
      },
      {
        h: 'Kami boleh bantu settle dan tukar nama',
        p: [
          'Urusan pelepasan loan dan tukar nama ialah kerja harian kami. Kalau anda mahu menjual motor yang masih berbaki loan, mahu membeli unit yang gerannya belum bebas, atau sekadar mahu tahu baki penyelesaian dan langkah seterusnya — hubungi kami dan terangkan keadaannya.',
          'Kami boleh semak geran, sahkan baki dengan pembiaya, uruskan urutan bayaran yang selamat untuk kedua-dua pihak, dan siapkan tukar nama di JPJ. Untuk motor yang kami jual, semua ini termasuk dalam urusan standard — setiap unit diserahkan dengan urusan hak milik yang beres.',
          'Kedai kami di Simpang Ampat, Pulau Pinang, berkhidmat untuk seluruh Seberang Perai. WhatsApp kami — beritahu model motor dan keadaan loan, kami balas dengan langkah yang jelas.'
        ]
      }
    ],
    faq: [
      ['Motor masih loan boleh tukar nama ke?', 'Tidak, selagi hutang belum diselesaikan. Rekod JPJ menandakan tuntutan pembiaya ke atas kenderaan, dan tukar nama hanya boleh dibuat selepas baki dilangsaikan dan surat pelepasan dikeluarkan.'],
      ['Apa itu surat pelepasan dan macam mana nak dapat?', 'Pengesahan bertulis daripada pembiaya bahawa hutang telah selesai dan tuntutan dilepaskan. Mohon penyata penyelesaian untuk tahu baki tepat, jelaskan baki itu, kemudian minta surat pelepasan — selepas itu tukar nama boleh diproses.'],
      ['Berapa lama proses pelepasan dan tukar nama?', 'Penyata penyelesaian biasanya beberapa hari bekerja; selepas bayaran, pelepasan dan kemas kini rekod mengambil beberapa hari hingga beberapa minggu bergantung institusi. Melalui kedai yang menguruskan sekali gus, prosesnya lebih pantas.'],
      ['Boleh ke beli motor "sambung bayar"?', 'Sangat tidak digalakkan tanpa pengetahuan pembiaya. Anda membayar ansuran motor yang bukan milik anda di sisi undang-undang — kalau penjual bermasalah atau ansuran asal tertunggak, motor boleh ditarik dan anda tiada perlindungan.'],
      ['Nak jual motor yang masih ada baki loan — macam mana?', 'Sama ada selesaikan baki dahulu kemudian jual bersih, atau guna wang pembeli untuk penyelesaian dengan bayaran terus kepada pembiaya dan persetujuan bertulis. Kedai seperti kami boleh menguruskan keseluruhan urutan ini dengan selamat.'],
      ['Macam mana nak semak geran motor sebelum beli?', 'Padankan nombor casis dan enjin pada motor dengan geran, pastikan nama pemilik berdaftar sepadan dengan penjual, dan semak sama ada masih ada tuntutan pembiaya. Kalau ragu-ragu, bawa unit itu kepada kami — kami semak sebelum anda bayar.']
    ]
  },
  {
    slug: 'y15zr-loan-kedai',
    date: '2026-09-22',
    dateModified: '2026-10-26',
    readMinutes: 10,
    title: 'Y15ZR Loan Kedai — Deposit, Ansuran & Syarat (Panduan 2026)',
    description:
      'Nak ambil Y15ZR guna loan kedai? Cara deposit dan ansuran bulanan dikira, kos bulanan sebenar, dokumen, V1 atau V2, dan semakan unit terpakai.',
    keywords: 'y15zr loan kedai, loan kedai y15, deposit y15zr loan kedai, deposit motor y15, harga motor y15 bulanan, harga y15zr loan, ansuran y15zr, y15zr second hand, y15zr terpakai Penang, y15zr v1 v2',
    image: '/stock/y15zr-pqe9734.jpg',
    intro:
      'Y15ZR ialah model yang paling kerap ditanya di kedai kami, dan soalan pertama hampir selalu sama: boleh ambil guna loan kedai tak, dan berapa deposit? Jawapan ringkasnya: boleh. Y15ZR antara motor yang paling mudah dibiayai melalui kedai, kerana permintaannya tinggi dan nilai jualan semulanya kukuh. Tetapi deposit dan ansuran bulanan tidak sama untuk semua orang — ia bergantung pada unit yang anda pilih dan profil anda sendiri. Panduan ini terangkan bagaimana angka itu dikira, dokumen yang perlu, beza memilih V1 atau V2, dan perkara yang wajib disemak sebelum anda ambil Y15ZR terpakai.',
    sections: [
      {
        h: 'Kenapa Y15ZR paling ramai ambil dengan loan kedai',
        p: [
          'Y15ZR ialah kapcai 150cc yang digunakan untuk segala-galanya — ulang-alik ke tempat kerja, hantar barang, dan ronda hujung minggu. Alat ganti ada di mana-mana kedai motor, kos servis rendah, dan hampir setiap mekanik biasa dengan enjinnya. Bagi pembiaya, itu bermaksud satu perkara: motor ini mudah dijual semula, jadi risikonya lebih rendah.',
          'Pembeli Y15ZR pula ramai yang baru mula bekerja, bekerja sendiri, atau menerima gaji tunai — kumpulan yang sering sukar lulus loan bank kerana tiada slip gaji atau rekod kredit masih nipis. Loan kedai wujud untuk kes begini: penilaian dibuat oleh kedai sendiri, kes demi kes, menggunakan dokumen yang anda memang ada.',
          'Gabungan dua perkara ini — motor yang mudah dibiayai dan pembeli yang perlukan fleksibiliti — menjadikan Y15ZR loan kedai antara carian yang paling biasa dalam kalangan pembeli motor di Malaysia.'
        ]
      },
      {
        h: 'Macam mana deposit Y15ZR loan kedai ditentukan',
        p: [
          'Deposit bukan angka tetap untuk sesuatu model. Ia ditentukan oleh tiga perkara: harga unit itu sendiri (tahun, versi dan keadaan), profil pemohon (pendapatan, komitmen sedia ada dan rekod bayaran), dan tempoh pembiayaan yang dipilih.',
          'Anda akan nampak iklan "deposit serendah" pelbagai angka di media sosial. Sebelum teruja, tanya tiga soalan: angka itu OTR atau belum termasuk insurans, cukai jalan dan tukar nama? Ada yuran pemprosesan berasingan? Dan angka itu untuk profil yang macam mana? Deposit yang rendah di iklan kadangkala hanya untuk pemohon yang profilnya paling kukuh.',
          'Sebagai contoh sebenar dari stok kami, unit Y15ZR V1 2019 (VEE4989) disenaraikan dengan deposit RM2,500 OTR. Setiap unit lain mempunyai angka sendiri kerana harga dan keadaannya berbeza. Kami tidak menyiarkan harga unit di laman web — WhatsApp kami dengan model dan tahun yang anda minat, dan kami berikan angka penuh secara bertulis.',
          'Satu prinsip yang sentiasa benar: deposit lebih tinggi menurunkan jumlah dibiayai, menurunkan ansuran bulanan, dan menaikkan peluang lulus. Kalau anda boleh tambah sedikit, kesannya berganda.',
          'Tetapi jangan habiskan semua simpanan untuk deposit. Simpan sedikit untuk kecemasan dan untuk kos awal yang selalu terlupa — insurans, cukai jalan dan servis pertama, kalau harga unit belum OTR. Ansuran yang ringan tidak banyak membantu kalau sebulan selepas ambil motor anda tiada wang untuk tukar tayar.'
        ]
      },
      {
        h: 'Ansuran bulanan Y15ZR: contoh kiraan',
        p: [
          'Pembiayaan motor di Malaysia, sama ada melalui bank atau kedai, lazimnya dikira dengan kadar rata (flat rate). Faedah dikira atas jumlah pinjaman asal untuk seluruh tempoh, kemudian dibahagi sama rata setiap bulan.',
          'Contoh angka kalkulator kami (bukan harga unit kami): motor RM6,000, deposit RM500, kadar rata 10% setahun. Untuk tempoh 36 bulan, faedahnya RM1,650 dan ansuran kira-kira RM199 sebulan, jumlah bayaran balik RM7,150. Untuk tempoh 60 bulan, ansuran turun kepada kira-kira RM138 sebulan, tetapi faedah naik kepada RM2,750 dan jumlah bayaran balik RM8,250.',
          'Itulah pertukaran yang perlu anda faham: tempoh panjang menjadikan ansuran lebih ringan dan lebih mudah lulus, tetapi jumlah yang anda bayar keseluruhannya lebih tinggi. Pilih tempoh yang ansurannya selesa, bukan yang paling panjang semata-mata.',
          'Satu lagi perkara yang jarang diterangkan: kadar rata 10% bersamaan kadar efektif hampir 20% setahun untuk tempoh 36 bulan, kerana anda membayar faedah atas jumlah asal walaupun baki pinjaman semakin berkurang. Masukkan angka anda sendiri dalam kalkulator ansuran motor kami untuk lihat ansuran, jumlah faedah dan kos sebenar sekali gus.'
        ]
      },
      {
        h: 'Harga Y15ZR bulanan sebenar — bukan ansuran sahaja',
        p: [
          'Bila orang tanya "harga motor Y15 bulanan berapa", jawapan yang jujur ada dua bahagian: ansuran kepada pembiaya, dan kos memiliki motor itu sendiri. Ramai hanya kira bahagian pertama, kemudian rasa sesak bila bil bahagian kedua sampai.',
          'Kos memiliki termasuk insurans dan cukai jalan yang dibayar setiap tahun — bahagikan jumlahnya dengan 12 untuk dapat angka bulanan — serta minyak, servis berkala, minyak hitam, tayar, rantai dan sproket yang perlu diganti dari semasa ke semasa. Unit terpakai yang lama tidak diservis mungkin perlukan belanja lebih pada bulan-bulan pertama, jadi tanya rekod servisnya sebelum membeli.',
          'Cara mudah untuk tahu berapa ansuran yang selamat: tulis gaji bersih anda, tolak sewa, bil, makan dan hutang lain, kemudian tolak anggaran kos memiliki motor tadi. Baki itulah ruang sebenar untuk ansuran. Kalau ansuran yang dicadangkan memakan hampir semua baki itu, pilih unit yang lebih murah, tambah deposit, atau bandingkan tempoh lain dalam kalkulator ansuran motor kami.',
          'Bila bertanya kedai, minta empat perkara secara bertulis: ansuran sebulan, tempoh, jumlah bayaran balik keseluruhan, dan apa yang sudah termasuk dalam harga (insurans, cukai jalan, tukar nama). Dengan empat angka itu anda boleh bandingkan tawaran dengan adil, bukan hanya memilih angka bulanan yang paling kecil.'
        ]
      },
      {
        h: 'Y15ZR V1 atau V2 — mana satu untuk bajet anda',
        p: [
          'Kedua-dua versi berkongsi asas yang sama: kapcai 150cc penyejukan cecair yang tahan lasak dan mudah dijaga. V2 datang dengan rekaan yang lebih baharu dan beberapa penambahbaikan, dan harganya di pasaran terpakai biasanya lebih tinggi. V1 pula ialah pilihan paling berbaloi untuk yang mahu masuk Y15ZR dengan bajet lebih rendah.',
          'Dari sudut loan, soalannya mudah: unit yang lebih murah bermaksud jumlah dibiayai lebih kecil, deposit lebih rendah dan ansuran lebih ringan — dan itu semua menaikkan peluang lulus. Kalau permohonan untuk V2 tahun terkini sukar, V1 atau V2 tahun lebih awal selalunya menukar keputusan sepenuhnya.',
          'Tahun motor juga penting kepada pembiaya. Unit yang lebih muda lazimnya boleh dibiayai untuk tempoh yang lebih panjang, manakala unit yang lebih lama mungkin dihadkan kepada tempoh yang lebih pendek. Tanya kedai berapa tempoh maksimum untuk unit yang anda pilih sebelum membuat keputusan.'
        ]
      },
      {
        h: 'Dokumen untuk Y15ZR loan kedai',
        p: [
          'Iklan "IC sahaja" bermaksud dokumennya minimum, bukan tiada penilaian langsung. Kedai tetap perlu tahu anda mampu membayar. Sediakan salinan kad pengenalan depan dan belakang, bukti pendapatan, dan bukti alamat semasa seperti bil utiliti atau penyata bank.',
          'Bukti pendapatan ikut jenis kerja anda: slip gaji dan penyata bank untuk pekerja bergaji; penyata bank 3 hingga 6 bulan untuk yang bekerja sendiri; tangkap layar pendapatan aplikasi bersama penyata bank untuk penunggang e-hailing dan penghantar makanan.',
          'Tiada slip gaji, atau ada rekod CTOS/CCRIS? Itu bukan penamat. Kami tulis panduan khusus untuk kedua-dua keadaan — loan motor tanpa slip gaji, dan loan motor dengan rekod blacklist — yang menerangkan dokumen alternatif dan cara menaikkan peluang lulus.'
        ]
      },
      {
        h: 'Semak ini sebelum ambil Y15ZR terpakai',
        p: [
          'Geran dahulu. Pastikan nombor casis dan enjin pada motor sepadan dengan geran, nama pemilik sepadan, dan tiada tuntutan pembiaya yang masih aktif. Motor yang gerannya "tersangkut" boleh ditarik balik walaupun anda sudah bayar.',
          'Y15ZR ialah motor yang sangat popular untuk diubah suai, jadi semak dengan teliti: ekzos, pendawaian, lampu dan sistem elektrik yang pernah diusik, serta tanda-tanda kemalangan pada rangka dan fork. Unit yang masih hampir standard biasanya lebih selamat untuk jangka panjang.',
          'Semasa pandu uji, dengar bunyi enjin semasa sejuk dan panas, rasa klac dan pertukaran gear, dan periksa rantai, sproket, brek dan tayar. Tanya bila kali terakhir minyak hitam dan servis dibuat.',
          'Di kedai kami, setiap unit Y15ZR disemak geran dan sejarahnya sebelum diambil masuk, dan urusan tukar nama serta JPJ kami uruskan sepenuhnya. Anda boleh lihat semua Y15ZR yang sedia ada di halaman stok, lengkap dengan tahun, warna dan nombor plat.'
        ]
      },
      {
        h: 'Ringkasnya',
        p: [
          'Y15ZR memang boleh diambil melalui loan kedai, dan ia antara model yang paling mudah dibiayai. Yang menentukan deposit dan ansuran anda ialah unit yang dipilih, profil anda, dan tempoh pembiayaan — bukan angka iklan.',
          'Kalau anda di Simpang Ampat, Bukit Tambun, Batu Kawan, Bukit Mertajam atau sekitar Seberang Perai, WhatsApp kami dengan Y15ZR yang anda minat. Kami semak kelayakan anda dan berikan angka penuh secara bertulis — tanpa sebarang komitmen.'
        ]
      }
    ],
    faq: [
      ['Y15ZR loan kedai perlu deposit berapa?', 'Bergantung pada harga unit, tahun dan versi, profil anda, serta tempoh pembiayaan. Contohnya unit Y15ZR V1 2019 dalam stok kami disenaraikan dengan deposit RM2,500 OTR. WhatsApp kami untuk angka unit lain secara bertulis.'],
      ['Y15ZR loan kedai boleh guna IC sahaja?', 'IC ialah dokumen utama, tetapi kedai tetap perlu menilai kemampuan anda membayar. Bukti pendapatan seperti penyata bank atau tangkap layar pendapatan aplikasi biasanya diperlukan, walaupun tanpa slip gaji.'],
      ['Ansuran Y15ZR sebulan berapa?', 'Ia bergantung pada jumlah dibiayai, kadar dan tempoh. Sebagai contoh kalkulator, pembiayaan RM5,500 pada kadar rata 10% ialah kira-kira RM199 sebulan untuk 36 bulan atau RM138 sebulan untuk 60 bulan. Guna kalkulator ansuran kami untuk angka anda sendiri.'],
      ['Harga motor Y15 bulanan berapa, termasuk semua kos?', 'Ansuran hanyalah sebahagian. Tambah insurans dan cukai jalan tahunan yang dibahagi 12, minyak, dan servis berkala seperti minyak hitam, tayar dan rantai. Kira baki gaji selepas semua komitmen dahulu, kemudian pilih ansuran yang muat dalam baki itu.'],
      ['Patut ke guna semua simpanan untuk deposit Y15ZR?', 'Tidak digalakkan. Deposit tinggi menurunkan ansuran, tetapi simpan sedikit untuk kecemasan dan kos awal seperti insurans, cukai jalan dan servis pertama, kalau harga unit belum OTR.'],
      ['Blacklist CTOS boleh ambil Y15ZR loan kedai?', 'Boleh dipertimbangkan. Loan kedai menilai kes demi kes, dan deposit yang lebih tinggi atau unit yang lebih murah boleh mengimbangi rekod yang kurang baik. Tiada kelulusan dijamin, tetapi ramai pelanggan kami dengan rekod CTOS berjaya.'],
      ['Y15ZR V1 atau V2, mana lebih senang lulus loan?', 'Unit yang lebih murah — biasanya V1 atau V2 tahun lebih awal — lebih mudah lulus kerana jumlah dibiayai dan ansurannya lebih rendah. Pilih versi yang ansurannya selesa dengan pendapatan anda.'],
      ['Berapa lama tempoh loan kedai untuk Y15ZR?', 'Lazimnya beberapa tahun, dan tempoh maksimum bergantung pada pembiaya serta umur motor — unit yang lebih muda biasanya boleh dibiayai lebih lama. Tempoh panjang menurunkan ansuran tetapi menaikkan jumlah faedah.']
    ]
  },
  {
    slug: 'nvx-loan-kedai',
    date: '2026-09-22',
    dateModified: '2026-09-22',
    readMinutes: 7,
    title: 'NVX Loan Kedai — Deposit, Ansuran & Syarat Yang Perlu Tahu',
    description:
      'NVX loan kedai: kenapa deposit dan ansuran skuter lebih tinggi daripada kapcai, cara kira ansuran NVX, dokumen, dan apa nak semak pada NVX terpakai.',
    keywords: 'nvx loan kedai, loan kedai nvx, deposit nvx, nvx ansuran, harga ansuran nvx, yamaha nvx 155 loan, nvx second hand Penang, nvx terpakai',
    intro:
      'Yamaha NVX ialah skuter 155cc yang ramai idamkan — selesa untuk jarak jauh, ruang simpanan besar, dan rupa yang garang. Tetapi harganya lebih tinggi daripada kapcai, dan itu mengubah cara loan dinilai. Jadi soalan "NVX loan kedai deposit berapa" tidak boleh dijawab dengan satu angka. Panduan ini terangkan apa yang sebenarnya menentukan deposit dan ansuran NVX, cara mengira sendiri tanpa perlu tunggu sesiapa, dokumen yang perlu, dan apa yang wajib disemak kalau anda mengambil NVX terpakai.',
    sections: [
      {
        h: 'Kenapa loan NVX lain sikit daripada loan kapcai',
        p: [
          'Beza utamanya mudah: jumlah dibiayai lebih besar. Skuter 155cc seperti NVX berharga lebih tinggi daripada kapcai 150cc, jadi walaupun kadar dan tempohnya sama, ansuran bulanannya lebih tinggi.',
          'Ansuran yang lebih tinggi bermaksud nisbah komitmen anda — jumlah semua ansuran berbanding pendapatan — naik. Itulah angka yang paling diperhatikan oleh pembiaya. Pemohon yang sama mungkin lulus dengan selesa untuk kapcai tetapi disoal lebih banyak untuk NVX, bukan kerana profilnya berubah, tetapi kerana matematiknya berubah.',
          'Ini tidak bermaksud NVX sukar dibiayai. Ia cuma bermaksud deposit dan pilihan unit lebih penting. Deposit yang sedikit lebih tinggi, atau unit tahun lebih awal, selalunya cukup untuk membawa ansuran ke tahap yang selesa.'
        ]
      },
      {
        h: 'Deposit NVX: apa yang menentukannya',
        p: [
          'Tiga faktor sama seperti mana-mana motor: harga unit (versi, tahun dan keadaan), profil anda (pendapatan, komitmen dan rekod bayaran), dan tempoh pembiayaan. Untuk NVX, faktor pertama memberi kesan paling besar kerana jurang harga antara versi dan tahun agak ketara.',
          'Iklan deposit rendah untuk NVX memang banyak di media sosial. Baca dengan teliti: sama ada angka itu OTR, sama ada termasuk insurans dan cukai jalan, dan sama ada ada yuran pemprosesan yang belum disebut. Minta pecahan penuh secara bertulis sebelum membayar apa-apa.',
          'Kami tidak menyiarkan harga unit di laman web. Beritahu kami versi dan tahun NVX yang anda minat melalui WhatsApp, dan kami balas dengan deposit, ansuran dan jumlah keseluruhan yang sebenar untuk profil anda.'
        ]
      },
      {
        h: 'Cara kira ansuran NVX sendiri',
        p: [
          'Pembiayaan motor di Malaysia lazimnya menggunakan kadar rata: faedah dikira atas jumlah asal untuk seluruh tempoh. Ini membolehkan satu jalan pintas yang berguna untuk menganggar ansuran tanpa kalkulator.',
          'Pada kadar rata 10% setahun, setiap RM1,000 yang dibiayai menambah kira-kira RM36 sebulan untuk tempoh 36 bulan, atau kira-kira RM25 sebulan untuk tempoh 60 bulan. Tolak deposit daripada harga unit, bahagikan dengan 1,000, dan darabkan — anda dapat anggaran ansuran yang cukup dekat untuk merancang bajet.',
          'Jalan pintas yang sama menunjukkan kenapa deposit sangat berkesan untuk NVX: setiap RM1,000 deposit tambahan menurunkan ansuran kira-kira RM36 sebulan untuk tempoh 36 bulan. Untuk angka yang tepat, termasuk jumlah faedah dan kos insurans serta cukai jalan, guna kalkulator ansuran motor kami.',
          'Ingat juga bahawa kadar rata 10% bersamaan kadar efektif hampir 20% setahun, kerana faedah dikenakan atas jumlah asal walaupun baki semakin berkurang. Tempoh yang lebih panjang menurunkan ansuran tetapi menaikkan jumlah faedah keseluruhan.'
        ]
      },
      {
        h: 'Siapa yang biasanya ambil NVX dengan loan kedai',
        p: [
          'Ramai pembeli NVX ialah penunggang yang menggunakan motor untuk mencari rezeki — penghantar makanan dan barang, serta mereka yang berulang-alik jauh setiap hari. Kumpulan ini sering tiada slip gaji walaupun pendapatannya stabil, dan itulah sebabnya loan kedai menjadi pilihan.',
          'Untuk penunggang e-hailing dan penghantar, dokumen yang paling membantu ialah tangkap layar pendapatan dari aplikasi bersama penyata bank yang menunjukkan bayaran masuk daripada platform. Dua dokumen ini bersama-sama membuktikan pendapatan dengan lebih jelas daripada slip gaji pun.',
          'Pekerja bergaji pula cukup sediakan slip gaji dan penyata bank, manakala yang bekerja sendiri gunakan penyata bank beberapa bulan. Kalau ada rekod CTOS atau CCRIS, baca panduan kami tentang loan motor dengan rekod blacklist sebelum memohon.'
        ]
      },
      {
        h: 'Semak ini sebelum ambil NVX terpakai',
        p: [
          'Sistem CVT ialah perkara pertama. Tali sawat, roller dan klac CVT haus mengikut penggunaan, dan NVX yang digunakan untuk penghantaran mungkin sudah menempuh jarak yang jauh. Dengar bunyi dari kotak CVT semasa memecut, dan tanya bila kali terakhir set CVT diservis atau ditukar.',
          'Periksa badan skuter: plastik fairing yang retak atau berbeza warna boleh menandakan kemalangan. Semak brek, tayar, lampu, dan semua fungsi elektrik. Hidupkan enjin semasa sejuk dan dengar sama ada ia lancar.',
          'Dan seperti mana-mana motor terpakai, semak geran dengan teliti: nombor casis dan enjin sepadan, nama pemilik sepadan, dan tiada tuntutan pembiaya yang masih aktif. Kalau motor itu masih dalam loan penjual, baca panduan kami tentang motor yang tidak boleh tukar nama sebab loan.'
        ]
      },
      {
        h: 'Kalau NVX terlalu tinggi untuk bajet sekarang',
        p: [
          'Jujurnya, bukan semua orang patut ambil NVX sekarang. Kalau ansuran NVX membawa jumlah komitmen anda melebihi separuh pendapatan bersih, anda akan hidup dalam keadaan tertekan setiap bulan — walaupun permohonan itu lulus.',
          'Ada tiga jalan yang lebih bijak: pilih NVX tahun lebih awal, kumpul deposit lebih besar untuk beberapa bulan, atau mulakan dengan kapcai yang lebih murah dan naik taraf kemudian apabila rekod bayaran anda sudah terbina. Rekod bayaran yang bersih untuk loan pertama menjadikan loan kedua jauh lebih mudah.',
          'Kami di Simpang Ampat, Pulau Pinang, berkhidmat untuk seluruh Seberang Perai. WhatsApp kami — beritahu NVX yang anda minat dan keadaan anda, dan kami beritahu dengan jujur pilihan yang paling masuk akal.'
        ]
      }
    ],
    faq: [
      ['NVX loan kedai deposit berapa?', 'Bergantung pada versi, tahun dan keadaan unit, profil anda, serta tempoh pembiayaan. Kerana harga NVX lebih tinggi daripada kapcai, deposit biasanya memainkan peranan lebih besar. WhatsApp kami untuk angka bertulis bagi unit yang anda minat.'],
      ['Berapa ansuran NVX sebulan?', 'Sebagai anggaran pada kadar rata 10%, setiap RM1,000 yang dibiayai ialah kira-kira RM36 sebulan untuk 36 bulan atau RM25 sebulan untuk 60 bulan. Tolak deposit daripada harga, kemudian darab — atau guna kalkulator ansuran kami untuk angka tepat.'],
      ['Rider Foodpanda atau Grab boleh ambil NVX loan kedai?', 'Boleh. Tangkap layar pendapatan dari aplikasi bersama penyata bank yang menunjukkan bayaran masuk daripada platform ialah bukti pendapatan yang kukuh, walaupun tanpa slip gaji.'],
      ['NVX lebih susah lulus loan berbanding Y15ZR?', 'Bukan lebih susah secara prinsip, tetapi ansurannya lebih tinggi kerana harganya lebih tinggi, jadi nisbah komitmen anda naik. Deposit lebih tinggi atau unit tahun lebih awal biasanya menyelesaikan perkara ini.'],
      ['Apa yang perlu disemak pada NVX terpakai?', 'Sistem CVT (tali sawat, roller dan klac), plastik badan untuk tanda kemalangan, brek, tayar dan fungsi elektrik, serta geran — pastikan nombor casis dan enjin sepadan dan tiada tuntutan pembiaya aktif.'],
      ['Ada rekod CTOS, boleh ambil NVX loan kedai?', 'Boleh dipertimbangkan kes demi kes. Deposit lebih tinggi atau unit yang lebih murah membantu mengimbangi rekod yang kurang baik. Tiada kelulusan dijamin, tetapi rekod CTOS bukan penamat.']
    ]
  },
  {
    slug: 'lc135-loan-kedai',
    date: '2026-09-22',
    dateModified: '2026-09-22',
    readMinutes: 7,
    title: 'LC135 Loan Kedai — Deposit, Ansuran & Tips Beli LC Terpakai',
    description:
      'LC135 loan kedai: kenapa LC antara motor paling mudah lulus loan, versi karburetor atau FI (V8), cara kira ansuran, dan apa nak semak pada LC135 terpakai.',
    keywords: 'lc135 loan kedai, loan kedai lc v8, lc135 v8 loan, lc135 second hand, harga lc135 second hand, yamaha 135lc terpakai Penang, lc135 ansuran',
    intro:
      'Yamaha LC135 sudah lama berada di jalan raya Malaysia, dan ia masih antara motor yang paling dicari — terutamanya melalui loan kedai. Sebabnya mudah: harganya lebih rendah daripada kapcai 150cc, alat gantinya murah dan ada di mana-mana, dan ansurannya ringan. Bagi ramai pembeli, LC135 ialah motor pertama yang dibeli dengan loan. Panduan ini terangkan kenapa LC135 mudah dibiayai, beza memilih versi karburetor atau FI, cara mengira ansuran sendiri, dan perkara yang wajib disemak sebelum anda ambil LC135 terpakai.',
    sections: [
      {
        h: 'Kenapa LC135 antara motor paling mudah lulus loan',
        p: [
          'Faktor terbesar dalam kelulusan loan motor ialah kemampuan bayar: berapa ansuran berbanding pendapatan anda. LC135 berharga lebih rendah daripada Y15ZR dan skuter 155cc, jadi jumlah dibiayai lebih kecil dan ansurannya lebih ringan. Untuk pemohon yang pendapatannya sederhana, itulah yang selalunya membezakan antara lulus dan ditolak.',
          'LC135 juga motor yang pembiaya kenal dengan baik. Permintaannya kekal, nilai jualan semulanya stabil, dan hampir setiap bengkel boleh membaikinya. Motor yang mudah dijual semula ialah motor yang lebih rendah risikonya kepada pembiaya.',
          'Sebab itulah LC135 sering menjadi pilihan untuk loan pertama. Bayar ansuran LC135 dengan bersih selama beberapa tahun, dan anda membina rekod bayaran yang menjadikan loan motor seterusnya jauh lebih mudah.'
        ]
      },
      {
        h: 'Karburetor atau FI (V8) — mana satu',
        p: [
          'LC135 telah melalui banyak versi. Versi-versi lama menggunakan karburetor, manakala V8 menggunakan suntikan bahan api (FI). Kedua-duanya berkongsi asas enjin 135cc penyejukan cecair yang terkenal tahan lasak.',
          'Versi FI biasanya lebih mudah dihidupkan, lebih konsisten dalam cuaca berbeza, dan lebih jimat minyak. Versi karburetor pula lebih ringkas untuk dibaiki sendiri dan lazimnya lebih murah di pasaran terpakai. Tiada jawapan yang betul untuk semua orang — ia bergantung pada bajet dan cara anda menggunakan motor.',
          'Dari sudut loan, peraturannya sama seperti model lain: unit yang lebih murah bermaksud deposit lebih rendah dan ansuran lebih ringan. Tetapi unit yang terlalu lama mungkin hanya boleh dibiayai untuk tempoh yang pendek, yang menaikkan ansuran semula. Tanya tempoh maksimum untuk unit yang anda pilih sebelum membuat keputusan.'
        ]
      },
      {
        h: 'Deposit dan ansuran LC135: cara kira',
        p: [
          'Deposit LC135 ditentukan oleh harga unit, profil anda dan tempoh pembiayaan. Kerana harganya lebih rendah, deposit untuk LC135 biasanya lebih mudah dicapai berbanding model 150cc. Kami tidak menyiarkan harga unit di laman web — WhatsApp kami dan kami berikan angka penuh secara bertulis.',
          'Untuk anggaran ansuran, gunakan jalan pintas kadar rata: pada kadar rata 10% setahun, setiap RM1,000 yang dibiayai menambah kira-kira RM36 sebulan untuk tempoh 36 bulan, atau kira-kira RM25 sebulan untuk tempoh 60 bulan. Tolak deposit daripada harga, bahagikan dengan 1,000, dan darabkan.',
          'Kadar rata kelihatan rendah di atas kertas, tetapi 10% rata bersamaan kadar efektif hampir 20% setahun kerana faedah dikira atas jumlah asal sepanjang tempoh. Untuk jumlah faedah dan kos sebenar termasuk insurans dan cukai jalan, guna kalkulator ansuran motor kami.'
        ]
      },
      {
        h: 'Semak ini sebelum ambil LC135 terpakai',
        p: [
          'Kerana LC135 sudah lama dipasarkan, banyak unit terpakai telah melalui beberapa pemilik dan banyak yang telah diubah suai. Semak geran dengan teliti: nombor casis dan enjin mesti sepadan dengan geran, nama pemilik mesti sepadan dengan penjual, dan tiada tuntutan pembiaya yang masih aktif.',
          'Semak sistem penyejukan — radiator, paip dan paras air — kerana enjin yang pernah terlalu panas boleh membawa masalah jangka panjang. Hidupkan enjin semasa sejuk dan perhatikan asap dari ekzos; asap putih kebiruan yang berterusan ialah tanda bahaya.',
          'Semasa pandu uji, rasa klac dan pertukaran gear, dengar bunyi enjin pada kelajuan berbeza, dan periksa rantai, sproket, brek dan tayar. Untuk unit yang diubah suai, tanya apa yang telah ditukar dan sama ada bahagian asal masih ada.',
          'Unit yang kami ambil masuk disemak geran dan sejarahnya dahulu, dan tukar nama serta urusan JPJ kami uruskan sepenuhnya. Lihat halaman stok kami untuk unit yang sedia ada sekarang.'
        ]
      },
      {
        h: 'Dokumen yang perlu',
        p: [
          'Sediakan salinan kad pengenalan depan dan belakang, bukti pendapatan, dan bukti alamat semasa. Bukti pendapatan bergantung pada jenis kerja: slip gaji dan penyata bank untuk pekerja bergaji; penyata bank beberapa bulan untuk yang bekerja sendiri; tangkap layar pendapatan aplikasi bersama penyata bank untuk penunggang e-hailing dan penghantar.',
          'Tiada slip gaji atau ada rekod CTOS/CCRIS tidak semestinya menghalang. Loan kedai menilai kes demi kes, dan LC135 — dengan ansurannya yang ringan — ialah antara model yang paling realistik untuk pemohon dalam keadaan begini.'
        ]
      },
      {
        h: 'Ringkasnya',
        p: [
          'LC135 ialah pilihan paling masuk akal untuk ramai pembeli yang mahu motor harian yang boleh dipercayai dengan ansuran yang ringan, terutamanya untuk loan pertama. Pilih unit yang gerannya bersih dan keadaannya jujur, dan pilih tempoh yang ansurannya selesa.',
          'Kami di Simpang Ampat, Pulau Pinang, berkhidmat untuk Bukit Tambun, Batu Kawan, Bukit Mertajam, Juru, Nibong Tebal dan seluruh Seberang Perai. WhatsApp kami dengan LC135 yang anda minat — kami semak kelayakan anda dan berikan angka bertulis tanpa sebarang komitmen.'
        ]
      }
    ],
    faq: [
      ['LC135 loan kedai deposit berapa?', 'Bergantung pada versi, tahun dan keadaan unit, profil anda, serta tempoh pembiayaan. Kerana LC135 lebih murah daripada model 150cc, depositnya biasanya lebih mudah dicapai. WhatsApp kami untuk angka bertulis.'],
      ['LC135 V8 boleh loan kedai?', 'Boleh. V8 (versi FI) lazimnya lebih tinggi harganya daripada versi karburetor, jadi ansurannya sedikit lebih tinggi, tetapi ia masih antara model yang paling mudah dibiayai.'],
      ['Ansuran LC135 sebulan berapa?', 'Sebagai anggaran pada kadar rata 10%, setiap RM1,000 yang dibiayai ialah kira-kira RM36 sebulan untuk 36 bulan atau RM25 sebulan untuk 60 bulan. Guna kalkulator ansuran kami untuk angka tepat mengikut harga dan deposit anda.'],
      ['LC135 karburetor atau FI, mana lebih bagus?', 'FI lebih mudah dihidupkan, lebih konsisten dan lebih jimat minyak; karburetor lebih ringkas dibaiki dan lazimnya lebih murah. Pilih mengikut bajet dan cara anda menggunakan motor.'],
      ['Kenapa LC135 senang lulus loan?', 'Harganya lebih rendah, jadi jumlah dibiayai dan ansurannya lebih ringan berbanding pendapatan anda. Ia juga mudah dijual semula, yang menjadikannya kurang berisiko kepada pembiaya.'],
      ['Apa nak semak pada LC135 terpakai?', 'Geran (nombor casis dan enjin sepadan, tiada tuntutan pembiaya), sistem penyejukan, asap ekzos semasa sejuk, klac dan gear, serta rantai, brek dan tayar. Untuk unit yang diubah suai, tanya apa yang telah ditukar.']
    ]
  },
  {
    slug: 'kedai-motor-simpang-ampat-tips-loan',
    date: '2026-10-12',
    dateModified: '2026-10-26',
    readMinutes: 6,
    title: 'Kedai Motor Simpang Ampat: Tip Pilih Kedai & Urus Loan',
    description:
      'Cari kedai motor di Simpang Ampat? Cara pilih kedai yang telus, beza loan bank dan loan kedai, dan cara semak ansuran sebelum anda tandatangan.',
    keywords: 'kedai motor Simpang Ampat, motor ansuran Simpang Ampat, loan motor senang lulus, loan motor tanpa slip gaji, loan kedai Simpang Ampat, DR Racing',
    intro:
      'Bila anda taip "kedai motor Simpang Ampat" di Google, biasanya anda bukan sekadar cari motor paling murah. Ramai sebenarnya cari kedai yang boleh bantu urus loan — terutamanya selepas bank tolak, atau bila tiada slip gaji. Jadi jangan pilih kedai berdasarkan harga motor sahaja. Pilih kedai yang ada pembiayaan fleksibel seperti loan kedai, memberi semua angka secara bertulis, dan jujur tentang kemampuan bayar anda. Kami DR Racing, kedai motor terpakai dan loan kedai di Simpang Ampat, Pulau Pinang. Ini panduan ringkas dari pengalaman kami di kedai.',
    sections: [
      {
        h: 'Kenapa ramai cari kedai motor di Simpang Ampat',
        p: [
          'Simpang Ampat dikelilingi kawasan perumahan dan kawasan industri di Seberang Perai Selatan, jadi ramai yang perlukan pengangkutan harian yang jimat: pekerja kilang, pelajar dan penghantar makanan. Motor ialah pilihan paling praktikal untuk ulang-alik ke tempat kerja.',
          'Cabaran utamanya selalunya bukan mencari motor, tetapi cara membayarnya. Ramai sudah cuba loan bank dan ditolak kerana rekod CTOS atau CCRIS, atau kerana tiada slip gaji tetap. Sebab itulah loan kedai menjadi antara perkara yang paling banyak ditanya di kawasan ini.'
        ]
      },
      {
        h: 'Beza loan bank dan loan kedai',
        p: [
          'Loan bank: bank biasanya meminta dokumen yang lengkap dan tepat — slip gaji, penyata bank beberapa bulan, dan rekod kredit yang bersih. Kalau anda bekerja sendiri atau dibayar tunai tanpa dokumen rasmi, proses ini boleh jadi sukar. Tetapi kalau anda layak, kadar bank hampir selalu lebih murah.',
          'Loan kedai (pembiayaan dalaman): kedai itu sendiri yang membiayai pembelian, dan permohonan dinilai kes demi kes. Fokusnya ialah kemampuan anda membayar ansuran bulanan, bukan hanya sejarah kredit. Ini alternatif untuk yang ada kekangan dokumen, tetapi kadarnya lebih tinggi daripada bank, dan syarat deposit berbeza mengikut kedai dan profil pemohon. Kami terangkan kelebihan dan keburukannya dengan terperinci dalam panduan apa itu loan kedai motor.',
          'Kadar, deposit dan ansuran bergantung pada profil anda dan unit yang dipilih. Sebab itu kami tidak menyiarkan harga unit atau kadar di laman web — angka sebenar kami berikan secara bertulis selepas menyemak dokumen anda. Bincang secara terbuka dengan kedai tentang jumlah yang anda mampu tanggung setiap bulan.'
        ]
      },
      {
        h: 'Tip pilih kedai motor supaya tidak menyesal',
        p: [
          'Jangan mudah terpedaya dengan iklan "motor murah" atau "lulus segera". Tiada kedai yang boleh menjanjikan kelulusan sebelum menyemak permohonan anda. Gunakan senarai semak ini sebelum membuat keputusan.',
          'Semak ketelusan harga: tanya sama ada harga termasuk insurans, cukai jalan dan yuran tukar nama. Jangan sampai harga nampak rendah, tetapi bila mahu ambil motor, muncul banyak kos tersembunyi. Minta semua angka secara bertulis — harga, deposit, ansuran, tempoh dan jumlah keseluruhan — sebelum anda membayar apa-apa. Bandingkan jumlah keseluruhan, bukan ansuran bulanan sahaja: ansuran yang nampak kecil dengan tempoh yang panjang boleh menjadikan jumlah bayaran balik jauh lebih tinggi.',
          'Tanya tentang syarat loan: kalau anda ada masalah CTOS atau tiada slip gaji, tanya terus sama ada kedai menyediakan loan kedai atau hanya menguruskan loan bank. Panduan loan motor tanpa slip gaji dan panduan blacklist CTOS kami menerangkan dokumen alternatif yang boleh membantu.',
          'Kira ansuran dahulu: sebelum berjumpa kedai, buat simulasi bayaran sendiri dengan kalkulator ansuran motor kami. Sebagai contoh sahaja: motor RM6,000, deposit RM500, tempoh 36 bulan, pada contoh kadar 10% setahun rata — ansuran sekitar RM199 sebulan, dan jumlah bayaran balik RM7,150. Ini contoh pengiraan, bukan sebut harga. Pastikan ansuran sebegini masih selesa selepas belanja makan, minyak dan sewa.',
          'Periksa keadaan motor terpakai: semak geran (nombor casis dan enjin mesti sepadan, tiada tuntutan pembiaya yang masih aktif), hidupkan enjin, dan periksa brek, tayar dan rantai. Kalau unit itu masih dalam loan orang lain, urusan tukar nama boleh jadi rumit. Tanya juga sama ada cukai jalan masih sah dan sama ada terdapat saman tertunggak atas motor itu, kerana saman yang belum selesai boleh melambatkan urusan tukar nama.'
        ]
      },
      {
        h: 'Bagaimana DR Racing boleh membantu',
        p: [
          'Kami menjual motor terpakai — kebanyakannya Yamaha Y15ZR — dan menawarkan loan kedai. Unit yang kami ambil masuk disemak geran dan sejarahnya dahulu, dan urusan tukar nama serta JPJ kami uruskan. Lihat halaman stok kami untuk unit yang sedia ada sekarang.',
          'Kami tidak dapat menjanjikan kelulusan, kerana setiap permohonan tertakluk pada penilaian. Apa yang kami janjikan: kami semak dokumen yang anda ada, beri angka penuh secara bertulis tanpa sebarang komitmen, dan berterus terang kalau loan bank lebih sesuai untuk anda. Sama ada anda bekerja tetap atau bekerja sendiri, WhatsApp kami dengan situasi anda.',
          'Kedai kami di Jalan Tasek SS1, Bandar Tasek Mutiara, 14120 Simpang Ampat, dibuka setiap hari dari 10 pagi hingga 7 malam. Kami berkhidmat untuk Bukit Tambun, Batu Kawan, Bukit Mertajam, Juru, Nibong Tebal dan seluruh Seberang Perai.'
        ]
      }
    ],
    faq: [
      ['Saya ada rekod CTOS, boleh beli motor di sini?', 'Boleh cuba. Rekod kredit yang kurang baik memang menyukarkan loan bank, tetapi loan kedai menilai kes demi kes. Kami semak dokumen anda dahulu untuk melihat pilihan yang ada; kelulusan tidak dijamin, dan deposit yang lebih tinggi biasanya membantu.'],
      ['Saya bekerja sendiri dan tiada slip gaji, boleh mohon?', 'Boleh cuba. Bukti pendapatan lain seperti penyata bank beberapa bulan, pendaftaran SSM atau tangkap layar pendapatan aplikasi e-hailing boleh dinilai. Semakin konsisten rekod pendapatan anda, semakin jelas gambaran untuk penilaian.'],
      ['Berapa lama proses loan kedai?', 'Bergantung pada kelengkapan dokumen. Kalau dokumen lengkap dan angka sepadan, semakan boleh dibuat dengan cepat, tetapi kami tidak menetapkan tempoh tetap kerana setiap kes dinilai dengan teliti supaya ansuran tidak membebankan anda.'],
      ['Harga motor ada dipaparkan di laman web?', 'Tidak. Kami tidak menyiarkan harga unit di laman web. WhatsApp kami dengan unit yang anda minat, dan kami berikan harga, deposit, ansuran dan jumlah keseluruhan secara bertulis.'],
      ['Waktu buka kedai DR Racing di Simpang Ampat?', 'Setiap hari, 10 pagi hingga 7 malam, di Jalan Tasek SS1, Bandar Tasek Mutiara, 14120 Simpang Ampat, Pulau Pinang.']
    ]
  },
  {
    slug: 'honda-dash-125-loan-kedai',
    date: '2026-10-19',
    dateModified: '2026-10-19',
    readMinutes: 6,
    title: 'Dash 125 Loan Kedai — Deposit, Ansuran & Tips Beli Terpakai',
    description:
      'Honda Dash 125 loan kedai: kenapa ansurannya antara paling ringan, cara kira deposit dan ansuran, dokumen yang perlu, dan apa nak semak pada Dash terpakai.',
    keywords: 'honda dash 125 loan kedai, dash 125 loan kedai, loan kedai dash, deposit dash 125, ansuran dash 125, honda dash second hand, dash 125 terpakai Penang',
    intro:
      'Honda Dash 125 ialah pilihan ramai yang mahu kapcai sport tetapi tidak mahu ansuran setinggi motor 150cc. Enjin 125cc PGM-FI Honda terkenal jimat minyak, kos servisnya rendah, dan harganya di pasaran terpakai lebih rendah daripada Y15ZR atau RS150R. Bagi pembeli yang menggunakan loan kedai, itu bermaksud satu perkara penting: jumlah dibiayai lebih kecil, jadi deposit dan ansuran lebih ringan. Panduan ini terangkan kenapa Dash 125 mudah dibiayai, cara mengira ansuran sendiri, dokumen yang perlu, dan perkara yang wajib disemak pada unit terpakai.',
    sections: [
      {
        h: 'Kenapa Dash 125 sesuai untuk loan kedai',
        p: [
          'Pembiaya melihat dua perkara pada motor: berapa besar jumlah yang dibiayai, dan berapa mudah motor itu dijual semula. Dash 125 kuat pada kedua-duanya. Harganya sederhana, dan permintaan untuk kapcai Honda yang jimat minyak sentiasa ada — terutamanya dalam kalangan pekerja kilang, pelajar dan penghantar makanan.',
          'Untuk pemohon pula, ansuran yang lebih rendah bermaksud nisbah komitmen terhadap pendapatan juga lebih rendah. Inilah angka yang paling diperhatikan semasa penilaian. Pemohon yang sukar lulus untuk motor 150cc kadangkala lulus dengan selesa untuk Dash 125, tanpa apa-apa perubahan pada profilnya.'
        ]
      },
      {
        h: 'Deposit dan ansuran Dash 125: cara kira sendiri',
        p: [
          'Deposit ditentukan oleh harga unit (tahun dan keadaan), profil anda, dan tempoh pembiayaan — bukan angka tetap untuk model. Kami tidak menyiarkan harga unit di laman web; WhatsApp kami untuk angka penuh secara bertulis.',
          'Untuk anggaran pantas: pada kadar rata 10% setahun, setiap RM1,000 yang dibiayai menambah kira-kira RM36 sebulan untuk tempoh 36 bulan, atau kira-kira RM25 sebulan untuk tempoh 60 bulan. Tolak deposit daripada harga unit, bahagi dengan 1,000, kemudian darab. Ini contoh pengiraan, bukan sebut harga.',
          'Kerana jumlah dibiayai untuk Dash 125 biasanya lebih kecil, ramai pembeli boleh memilih tempoh yang lebih pendek dan masih mendapat ansuran yang selesa — dan tempoh pendek bermaksud jumlah faedah keseluruhan lebih rendah. Guna kalkulator ansuran motor kami untuk melihat ansuran, jumlah faedah dan kos sebenar sekali gus.'
        ]
      },
      {
        h: 'Dash 125 atau Y15ZR — yang mana untuk anda',
        p: [
          'Kalau kegunaan anda ulang-alik harian dan penghantaran, Dash 125 memberi penjimatan dua kali: ansuran lebih rendah dan penggunaan minyak lebih jimat. Kalau anda mahukan kuasa lebih untuk lebuh raya atau suka mengubah suai, Y15ZR atau RS150R mungkin lebih sesuai — tetapi bersedia untuk ansuran yang lebih tinggi.',
          'Satu cara yang bijak: mulakan dengan motor yang ansurannya ringan, bina rekod bayaran yang bersih, dan naik taraf kemudian. Rekod bayaran yang baik untuk loan pertama menjadikan loan kedua jauh lebih mudah.'
        ]
      },
      {
        h: 'Semak ini sebelum ambil Dash 125 terpakai',
        p: [
          'Geran dahulu: nombor casis dan enjin mesti sepadan dengan geran, nama pemilik sepadan, dan tiada tuntutan pembiaya yang masih aktif.',
          'Dash 125 banyak digunakan untuk penghantaran, jadi semak jarak tempuh dan tanda-tanda penggunaan berat: rantai dan sproket, pad brek, tayar, dan bunyi enjin semasa sejuk. Rasa klac dan pertukaran gear semasa pandu uji. Periksa juga lampu dan sistem elektrik, terutamanya kalau pernah dipasang aksesori tambahan.',
          'Di kedai kami, setiap unit disemak geran dan sejarahnya sebelum diambil masuk, dan urusan tukar nama serta JPJ kami uruskan. Lihat halaman stok untuk unit Honda yang sedia ada sekarang.'
        ]
      },
      {
        h: 'Dokumen yang perlu',
        p: [
          'Salinan kad pengenalan depan dan belakang, bukti pendapatan, dan bukti alamat semasa. Bukti pendapatan ikut jenis kerja: slip gaji dan penyata bank untuk pekerja bergaji; penyata bank 3 hingga 6 bulan untuk yang bekerja sendiri; tangkap layar pendapatan aplikasi bersama penyata bank untuk penghantar makanan dan e-hailing.',
          'Tiada slip gaji atau ada rekod CTOS? Baca panduan kami tentang loan motor tanpa slip gaji dan loan motor dengan rekod blacklist. Kami di Simpang Ampat, Pulau Pinang — WhatsApp kami dengan Dash 125 yang anda minat dan kami semak kelayakan anda tanpa sebarang komitmen.'
        ]
      }
    ],
    faq: [
      ['Honda Dash 125 loan kedai deposit berapa?', 'Bergantung pada tahun dan keadaan unit, profil anda, serta tempoh pembiayaan. Kerana harga Dash 125 lebih rendah daripada kapcai 150cc, depositnya biasanya lebih ringan. WhatsApp kami untuk angka bertulis.'],
      ['Ansuran Dash 125 sebulan berapa?', 'Sebagai anggaran pada kadar rata 10%, setiap RM1,000 yang dibiayai ialah kira-kira RM36 sebulan untuk 36 bulan atau RM25 sebulan untuk 60 bulan. Guna kalkulator ansuran kami untuk angka tepat.'],
      ['Dash 125 lebih senang lulus loan berbanding Y15ZR?', 'Selalunya ya, kerana jumlah dibiayai lebih kecil dan ansurannya lebih rendah, jadi nisbah komitmen anda juga lebih rendah. Tiada kelulusan dijamin, tetapi unit lebih murah memang menaikkan peluang.'],
      ['Rider penghantar makanan boleh ambil Dash 125 loan kedai?', 'Boleh. Tangkap layar pendapatan aplikasi bersama penyata bank yang menunjukkan bayaran masuk daripada platform ialah bukti pendapatan yang kukuh walaupun tanpa slip gaji.'],
      ['Apa nak semak pada Dash 125 terpakai?', 'Geran (casis dan enjin sepadan, tiada tuntutan pembiaya aktif), rantai dan sproket, brek, tayar, klac, bunyi enjin semasa sejuk, serta sistem elektrik.']
    ]
  },
  {
    slug: 'rs150r-loan-kedai',
    date: '2026-10-19',
    dateModified: '2026-10-19',
    readMinutes: 6,
    title: 'RS150R Loan Kedai — Deposit, Ansuran & Semakan Unit Terpakai',
    description:
      'Honda RS150R loan kedai: apa yang menentukan deposit dan ansuran, beza dengan RS-X, cara kira ansuran sendiri, dan apa nak semak pada RS150R terpakai.',
    keywords: 'rs150r loan kedai, loan kedai rs150, honda rs150r loan, deposit rs150r, ansuran rs150r, rs150 second hand, rs150r terpakai Penang, rs150 v2 v3',
    intro:
      'Honda RS150R ialah lawan utama Y15ZR di jalan raya Malaysia — kapcai sport 150cc dengan enjin DOHC penyejukan cecair dan kotak gear 6 kelajuan. Walaupun Honda kini menjual RS-X sebagai penggantinya, RS150R masih sangat dicari di pasaran terpakai kerana harganya lebih mudah dicapai. Soalan yang paling kerap kami terima: boleh ambil RS150R guna loan kedai, dan berapa depositnya? Panduan ini menjawabnya dengan jujur.',
    sections: [
      {
        h: 'RS150R dan loan kedai: apa yang pembiaya lihat',
        p: [
          'RS150R ialah model yang popular dan mudah dijual semula, jadi ia tergolong motor yang mudah dibiayai. Yang membezakan satu permohonan dengan yang lain ialah unit yang dipilih — tahun, versi dan keadaan — dan profil pemohon.',
          'Unit yang lebih muda biasanya lebih mahal tetapi boleh dibiayai untuk tempoh yang lebih panjang. Unit yang lebih lama lebih murah, tetapi tempoh maksimumnya mungkin lebih pendek. Tanya kedai tempoh maksimum untuk unit yang anda pilih sebelum membandingkan ansuran.'
        ]
      },
      {
        h: 'Deposit dan ansuran RS150R',
        p: [
          'Iklan "deposit serendah" untuk RS150R banyak di media sosial. Sebelum teruja, tanya: angka itu OTR atau belum termasuk insurans, cukai jalan dan tukar nama? Ada yuran pemprosesan? Dan angka itu untuk profil yang macam mana?',
          'Untuk anggaran sendiri pada kadar rata 10% setahun: setiap RM1,000 yang dibiayai kira-kira RM36 sebulan untuk 36 bulan, atau RM25 sebulan untuk 60 bulan. Setiap RM1,000 deposit tambahan pula menurunkan ansuran dengan jumlah yang sama. Ini contoh pengiraan, bukan sebut harga.',
          'Ingat bahawa kadar rata 10% bersamaan kadar efektif hampir 20% setahun untuk tempoh 36 bulan, kerana faedah dikira atas jumlah asal. Kalkulator ansuran motor kami menunjukkan kedua-dua angka itu.'
        ]
      },
      {
        h: 'RS150R atau RS-X',
        p: [
          'RS-X ialah model yang lebih baharu, jadi harganya lebih tinggi dan ansurannya juga lebih tinggi. RS150R pula memberi rasa kapcai sport Honda yang sama pada harga yang lebih rendah, dan alat gantinya mudah didapati.',
          'Kalau bajet bulanan anda ketat, RS150R terpakai yang dijaga baik selalunya lebih masuk akal daripada RS-X dengan ansuran yang menekan. Pilih motor yang ansurannya selesa, bukan yang paling baharu semata-mata.'
        ]
      },
      {
        h: 'Semak ini sebelum ambil RS150R terpakai',
        p: [
          'RS150R ialah motor yang ramai tunggang dengan laju dan ubah suai, jadi semak dengan teliti: tanda kemalangan pada rangka, fork dan handle; ekzos dan pendawaian yang pernah diusik; serta keadaan radiator dan paras air penyejuk.',
          'Semasa pandu uji, dengar enjin semasa sejuk dan panas, rasa klac dan semua enam gear, dan periksa rantai, sproket, brek serta tayar. Tanya bila kali terakhir servis dan tukar minyak hitam dibuat.',
          'Geran mesti bersih: nombor casis dan enjin sepadan, nama pemilik sepadan, dan tiada tuntutan pembiaya yang masih aktif. Kalau motor masih dalam loan penjual, baca panduan kami tentang motor yang tidak boleh tukar nama sebab loan.'
        ]
      },
      {
        h: 'Ringkasnya',
        p: [
          'RS150R boleh diambil melalui loan kedai, dan deposit serta ansurannya bergantung pada unit, profil anda dan tempoh. Stok kami berubah setiap minggu — WhatsApp kami dengan versi dan tahun RS150R yang anda cari, dan kami beritahu sama ada ada unit yang sesuai serta angka penuh secara bertulis.'
        ]
      }
    ],
    faq: [
      ['RS150R loan kedai deposit berapa?', 'Bergantung pada tahun, versi dan keadaan unit, profil anda, serta tempoh pembiayaan. Minta pecahan penuh secara bertulis — harga, deposit, ansuran, tempoh dan jumlah keseluruhan — sebelum membayar apa-apa.'],
      ['Ansuran RS150R sebulan berapa?', 'Pada kadar rata 10%, setiap RM1,000 yang dibiayai ialah kira-kira RM36 sebulan untuk 36 bulan atau RM25 sebulan untuk 60 bulan. Guna kalkulator ansuran kami untuk angka tepat.'],
      ['RS150R atau RS-X, mana senang lulus loan?', 'Unit yang lebih murah lebih mudah lulus kerana jumlah dibiayai dan ansurannya lebih rendah. RS150R terpakai biasanya lebih murah daripada RS-X.'],
      ['Ada rekod CTOS, boleh ambil RS150R loan kedai?', 'Boleh dipertimbangkan kes demi kes. Deposit lebih tinggi atau unit yang lebih murah membantu mengimbangi rekod yang kurang baik. Kelulusan tidak dijamin.'],
      ['Apa nak semak pada RS150R terpakai?', 'Tanda kemalangan pada rangka dan fork, ubah suai pada ekzos dan pendawaian, radiator, klac dan gear, rantai, brek, tayar, serta geran yang bersih.']
    ]
  },
  {
    slug: 'y16zr-loan-kedai',
    date: '2026-10-19',
    dateModified: '2026-10-19',
    readMinutes: 6,
    title: 'Y16ZR Loan Kedai — Deposit, Ansuran & Beza Dengan Y15ZR',
    description:
      'Y16ZR loan kedai: kenapa ansurannya lebih tinggi daripada Y15ZR, cara kira deposit dan ansuran, siapa patut ambil, dan apa nak semak pada unit terpakai.',
    keywords: 'y16zr loan kedai, loan kedai y16, deposit y16zr, ansuran y16zr, y16zr vs y15zr, y16zr second hand, y16zr terpakai Penang, harga y16 loan',
    intro:
      'Yamaha Y16ZR ialah generasi seterusnya selepas Y15ZR — enjin 155cc dengan VVA, rekaan yang lebih tajam, dan ciri-ciri yang lebih moden. Ramai peminat Y15 mahu naik taraf ke Y16, dan soalan pertama mereka selalunya sama: berapa deposit dan ansuran kalau guna loan kedai? Jawapannya bergantung pada satu perkara yang ramai terlepas pandang: Y16ZR lebih mahal, jadi matematik loannya berbeza.',
    sections: [
      {
        h: 'Kenapa ansuran Y16ZR lebih tinggi daripada Y15ZR',
        p: [
          'Y16ZR lebih baharu dan harganya di pasaran terpakai lebih tinggi daripada Y15ZR. Dengan kadar dan tempoh yang sama, jumlah dibiayai yang lebih besar bermaksud ansuran bulanan yang lebih tinggi.',
          'Ansuran yang lebih tinggi menaikkan nisbah komitmen anda — jumlah semua ansuran berbanding pendapatan. Pemohon yang lulus dengan selesa untuk Y15ZR mungkin perlu deposit lebih tinggi untuk Y16ZR. Ini bukan kerana Y16ZR sukar dibiayai; ia motor yang popular dan mudah dijual semula. Ia cuma soal angka.'
        ]
      },
      {
        h: 'Cara kira deposit dan ansuran Y16ZR',
        p: [
          'Pada kadar rata 10% setahun, setiap RM1,000 yang dibiayai menambah kira-kira RM36 sebulan untuk tempoh 36 bulan, atau kira-kira RM25 sebulan untuk tempoh 60 bulan. Tolak deposit daripada harga unit, bahagi dengan 1,000, dan darab untuk anggaran. Ini contoh pengiraan, bukan sebut harga.',
          'Kerana unit Y16ZR masih tergolong muda, ia biasanya boleh dibiayai untuk tempoh yang lebih panjang. Tempoh panjang menurunkan ansuran, tetapi jumlah faedah keseluruhan naik. Bandingkan kedua-duanya dalam kalkulator ansuran motor kami sebelum memilih.',
          'Kami tidak menyiarkan harga unit di laman web. WhatsApp kami dengan tahun dan warna Y16ZR yang anda minat untuk angka penuh secara bertulis.'
        ]
      },
      {
        h: 'Y16ZR atau Y15ZR — yang mana patut anda ambil',
        p: [
          'Ambil Y16ZR kalau ansurannya masih selesa dengan pendapatan anda dan anda mahukan model yang lebih baharu untuk disimpan lama. Ambil Y15ZR kalau anda mahu ansuran lebih ringan, peluang lulus lebih tinggi, dan alat ganti yang paling mudah didapati.',
          'Peraturan mudah dari kedai: kalau ansuran membawa jumlah komitmen anda melebihi separuh pendapatan bersih, pilih unit yang lebih murah. Motor yang lulus tetapi menekan setiap bulan bukan pembelian yang baik. Baca juga panduan Y15ZR loan kedai kami untuk perbandingan.'
        ]
      },
      {
        h: 'Semak ini sebelum ambil Y16ZR terpakai',
        p: [
          'Geran mesti bersih — nombor casis dan enjin sepadan dan tiada tuntutan pembiaya aktif. Ramai pemilik Y16ZR yang masih membayar loan, jadi pastikan urusan pelepasan dan tukar nama dibuat dengan betul.',
          'Semak tanda kemalangan pada rangka, fork dan fairing; ubah suai pada ekzos dan pendawaian; serta radiator dan paras air penyejuk. Semasa pandu uji, rasa klac dan pertukaran gear, dengar enjin semasa sejuk dan panas, dan periksa rantai, brek serta tayar.'
        ]
      },
      {
        h: 'Ringkasnya',
        p: [
          'Y16ZR boleh diambil melalui loan kedai. Deposit biasanya memainkan peranan lebih besar berbanding Y15ZR kerana harganya lebih tinggi. Kami di Simpang Ampat, Pulau Pinang — WhatsApp kami dengan keadaan anda, dan kami beritahu dengan jujur sama ada Y16ZR atau Y15ZR lebih masuk akal untuk bajet anda.'
        ]
      }
    ],
    faq: [
      ['Y16ZR loan kedai deposit berapa?', 'Bergantung pada tahun dan keadaan unit, profil anda, serta tempoh pembiayaan. Kerana Y16ZR lebih mahal daripada Y15ZR, deposit biasanya lebih tinggi. WhatsApp kami untuk angka bertulis.'],
      ['Ansuran Y16ZR sebulan berapa?', 'Pada kadar rata 10%, setiap RM1,000 yang dibiayai ialah kira-kira RM36 sebulan untuk 36 bulan atau RM25 sebulan untuk 60 bulan. Guna kalkulator ansuran kami untuk angka tepat.'],
      ['Y16ZR lebih susah lulus loan berbanding Y15ZR?', 'Bukan lebih susah secara prinsip, tetapi ansurannya lebih tinggi, jadi nisbah komitmen anda naik. Deposit lebih tinggi biasanya menyelesaikan perkara ini.'],
      ['Boleh trade-in Y15ZR untuk ambil Y16ZR?', 'Tanya kedai sama ada mereka menerima trade-in. Nilai trade-in boleh digunakan sebagai sebahagian deposit, tetapi kalau Y15ZR anda masih dalam loan, baki pinjaman perlu diselesaikan dahulu.'],
      ['Apa beza utama Y16ZR dan Y15ZR?', 'Y16ZR menggunakan enjin 155cc dengan VVA dan rekaan yang lebih baharu, manakala Y15ZR menggunakan enjin 150cc. Y16ZR lebih mahal; Y15ZR lebih murah dan alat gantinya paling mudah didapati.']
    ]
  },
  {
    slug: 'ex5-loan-kedai',
    date: '2026-10-19',
    dateModified: '2026-10-19',
    readMinutes: 5,
    title: 'Honda EX5 Loan Kedai — Motor Pertama, Ansuran Paling Ringan',
    description:
      'Honda EX5 loan kedai: kenapa EX5 antara motor paling mudah lulus loan, cara kira ansuran, siapa yang sesuai, dan apa nak semak pada EX5 terpakai.',
    keywords: 'ex5 loan kedai, honda ex5 loan kedai, loan kedai ex5, deposit ex5, ansuran ex5, ex5 dream second hand, ex5 terpakai Penang, motor murah loan kedai',
    intro:
      'Honda EX5 ialah motor yang hampir semua orang Malaysia kenal. Ia kapcai bebek tanpa klac tangan, sangat jimat minyak, dan hampir mustahil rosak kalau dijaga. Bagi ramai pembeli, EX5 ialah motor pertama — dan kerana harganya rendah, ia juga antara motor yang paling mudah lulus melalui loan kedai. Panduan ringkas ini terangkan sebabnya, cara mengira ansuran, dan perkara yang wajib disemak pada EX5 terpakai.',
    sections: [
      {
        h: 'Kenapa EX5 mudah lulus loan kedai',
        p: [
          'Harga EX5 rendah, jadi jumlah dibiayai kecil dan ansurannya ringan. Ansuran yang ringan bermaksud nisbah komitmen terhadap pendapatan rendah — faktor yang paling diperhatikan semasa penilaian.',
          'EX5 juga mudah dijual semula di mana-mana sahaja di Malaysia, jadi risikonya rendah bagi pembiaya. Gabungan ini menjadikan EX5 pilihan yang baik untuk pemohon yang baru mula bekerja, pelajar, atau sesiapa yang rekod kreditnya masih nipis.'
        ]
      },
      {
        h: 'Cara kira ansuran EX5',
        p: [
          'Pada kadar rata 10% setahun, setiap RM1,000 yang dibiayai kira-kira RM36 sebulan untuk 36 bulan. Untuk motor berharga rendah seperti EX5, ramai pembeli memilih tempoh yang pendek kerana ansurannya masih selesa — dan tempoh pendek bermaksud faedah keseluruhan yang jauh lebih rendah. Ini contoh pengiraan, bukan sebut harga.',
          'Kalau anda boleh bayar deposit yang lebih tinggi, jumlah dibiayai menjadi sangat kecil dan loan selesai lebih cepat. Cuba beberapa kombinasi deposit dan tempoh dalam kalkulator ansuran motor kami.'
        ]
      },
      {
        h: 'EX5 sebagai langkah pertama membina rekod',
        p: [
          'Loan pertama yang dibayar tepat pada masanya ialah rekod bayaran yang bernilai. Ia menjadikan permohonan seterusnya — sama ada untuk motor lebih besar atau komitmen lain — jauh lebih mudah.',
          'Jadi kalau anda sebenarnya mahu Y15ZR atau RS150R tetapi permohonan sukar sekarang, EX5 dengan ansuran ringan selama setahun dua boleh menjadi jalan yang lebih bijak daripada memaksa permohonan untuk motor yang lebih mahal.'
        ]
      },
      {
        h: 'Semak ini sebelum ambil EX5 terpakai',
        p: [
          'EX5 tahan lasak, tetapi unit lama mungkin sudah menempuh jarak yang sangat jauh. Dengar bunyi enjin semasa sejuk, rasa pertukaran gear, dan periksa rantai, sproket, brek, tayar dan lampu.',
          'Geran adalah paling penting untuk motor yang sudah berpindah tangan beberapa kali: nombor casis dan enjin mesti sepadan, nama pemilik sepadan, dan tiada tuntutan pembiaya aktif. Kami di Simpang Ampat — WhatsApp kami untuk tanya unit Honda yang sedia ada sekarang.'
        ]
      }
    ],
    faq: [
      ['Honda EX5 loan kedai deposit berapa?', 'Bergantung pada tahun dan keadaan unit, profil anda, serta tempoh. Kerana harga EX5 rendah, depositnya biasanya antara yang paling ringan. WhatsApp kami untuk angka bertulis.'],
      ['EX5 senang lulus loan kedai?', 'Selalunya ya, kerana jumlah dibiayai kecil dan ansurannya ringan. Tiada kelulusan dijamin, tetapi EX5 antara model yang paling mudah dibiayai.'],
      ['Pelajar boleh ambil EX5 loan kedai?', 'Boleh dipertimbangkan kalau ada pendapatan yang boleh dibuktikan, atau dengan penjamin yang mempunyai pendapatan. Tanya kami dokumen yang sesuai untuk keadaan anda.'],
      ['Berapa tempoh loan untuk EX5?', 'Bergantung pada pembiaya dan umur motor. Untuk motor berharga rendah, tempoh pendek selalunya masih memberi ansuran yang selesa dan menjimatkan faedah.'],
      ['Apa nak semak pada EX5 terpakai?', 'Bunyi enjin semasa sejuk, pertukaran gear, rantai, brek, tayar dan lampu, serta geran yang bersih tanpa tuntutan pembiaya aktif.']
    ]
  },
  {
    slug: 'vario-160-loan-kedai',
    date: '2026-10-19',
    dateModified: '2026-10-19',
    readMinutes: 6,
    title: 'Honda Vario 160 Loan Kedai — Deposit, Ansuran & Tips Skuter',
    description:
      'Honda Vario 160 loan kedai: kenapa ansuran skuter lebih tinggi daripada kapcai, cara kira deposit dan ansuran, dan apa nak semak pada Vario terpakai.',
    keywords: 'vario 160 loan kedai, honda vario loan kedai, loan kedai vario, deposit vario 160, ansuran vario 160, vario 160 second hand, vario terpakai Penang, skuter loan kedai',
    intro:
      'Honda Vario 160 ialah antara skuter yang paling laris di Malaysia sekarang — enjin 160cc penyejukan cecair, selesa untuk ulang-alik jauh, dan ruang simpanan bawah tempat duduk yang praktikal. Ramai yang beralih daripada kapcai ke skuter kerana tidak perlu tukar gear dalam kesesakan. Tetapi skuter 160cc lebih mahal daripada kapcai, dan itu mengubah cara loan dinilai. Panduan ini terangkan apa yang perlu anda tahu sebelum memohon.',
    sections: [
      {
        h: 'Kenapa loan Vario 160 lain daripada loan kapcai',
        p: [
          'Harga Vario 160 lebih tinggi daripada kapcai 125cc hingga 150cc, jadi jumlah dibiayai lebih besar dan ansuran bulanan lebih tinggi pada kadar dan tempoh yang sama.',
          'Ansuran yang lebih tinggi menaikkan nisbah komitmen anda. Ini tidak bermaksud Vario sukar dibiayai — ia skuter popular yang mudah dijual semula — tetapi deposit dan pilihan unit menjadi lebih penting.'
        ]
      },
      {
        h: 'Cara kira deposit dan ansuran Vario 160',
        p: [
          'Pada kadar rata 10% setahun, setiap RM1,000 yang dibiayai kira-kira RM36 sebulan untuk 36 bulan, atau RM25 sebulan untuk 60 bulan. Setiap RM1,000 deposit tambahan menurunkan ansuran dengan jumlah yang sama. Ini contoh pengiraan, bukan sebut harga.',
          'Jangan lupa kos selain ansuran: insurans dan cukai jalan, serta servis CVT yang berkala. Masukkan angka anda dalam kalkulator ansuran motor kami untuk melihat kos sebenar setiap bulan.',
          'Kami tidak menyiarkan harga unit di laman web. WhatsApp kami untuk angka penuh secara bertulis bagi unit yang anda minat.'
        ]
      },
      {
        h: 'Vario 160 atau NVX',
        p: [
          'Kedua-duanya skuter yang popular untuk ulang-alik dan penghantaran. Vario 160 terkenal dengan rekaan yang ramping dan penggunaan minyak yang jimat; NVX pula lebih besar dan berotot. Dari sudut loan, soalannya sama: unit mana yang ansurannya selesa untuk anda. Baca panduan NVX loan kedai kami untuk perbandingan.'
        ]
      },
      {
        h: 'Semak ini sebelum ambil Vario 160 terpakai',
        p: [
          'Sistem CVT ialah perkara pertama: tali sawat, roller dan klac haus mengikut penggunaan. Dengar bunyi dari kotak CVT semasa memecut dan tanya bila kali terakhir set CVT diservis.',
          'Periksa plastik badan untuk retak atau warna berbeza yang menandakan kemalangan, serta brek, tayar, lampu dan semua fungsi elektrik termasuk sistem kunci. Geran mesti bersih — nombor casis dan enjin sepadan dan tiada tuntutan pembiaya aktif.'
        ]
      },
      {
        h: 'Ringkasnya',
        p: [
          'Vario 160 boleh diambil melalui loan kedai; deposit memainkan peranan lebih besar kerana harganya lebih tinggi daripada kapcai. Stok kami berubah setiap minggu — WhatsApp kami di Simpang Ampat dengan skuter yang anda cari, dan kami beritahu pilihan yang sesuai serta angka penuh secara bertulis.'
        ]
      }
    ],
    faq: [
      ['Vario 160 loan kedai deposit berapa?', 'Bergantung pada tahun dan keadaan unit, profil anda, serta tempoh. Kerana harga Vario 160 lebih tinggi daripada kapcai, deposit biasanya memainkan peranan lebih besar. WhatsApp kami untuk angka bertulis.'],
      ['Ansuran Vario 160 sebulan berapa?', 'Pada kadar rata 10%, setiap RM1,000 yang dibiayai ialah kira-kira RM36 sebulan untuk 36 bulan atau RM25 sebulan untuk 60 bulan. Guna kalkulator ansuran kami untuk angka tepat.'],
      ['Rider e-hailing boleh ambil Vario 160 loan kedai?', 'Boleh. Tangkap layar pendapatan aplikasi bersama penyata bank yang menunjukkan bayaran masuk daripada platform ialah bukti pendapatan yang kukuh.'],
      ['Vario 160 atau NVX, mana senang lulus loan?', 'Unit yang lebih murah lebih mudah lulus kerana ansurannya lebih rendah. Bandingkan harga unit sebenar, bukan model semata-mata.'],
      ['Apa nak semak pada Vario 160 terpakai?', 'Sistem CVT, plastik badan untuk tanda kemalangan, brek, tayar, fungsi elektrik, serta geran yang bersih.']
    ]
  },
  {
    slug: 'y15zr-vs-rs150r-loan',
    date: '2026-10-19',
    dateModified: '2026-10-19',
    readMinutes: 6,
    title: 'Y15ZR vs RS150R — Mana Lebih Berbaloi Kalau Ambil Loan?',
    description:
      'Y15ZR atau RS150R? Perbandingan dari sudut pembeli loan: harga terpakai, ansuran, kos jaga, alat ganti dan nilai jual semula, dari kedai di Simpang Ampat.',
    keywords: 'y15zr vs rs150r, y15 vs rs150, y15zr atau rs150r, mana lagi bagus y15 rs150, beza y15zr rs150r, kapcai 150cc terbaik, loan kedai y15zr rs150r',
    intro:
      'Y15ZR atau RS150R? Ini antara perdebatan paling lama di kalangan penunggang kapcai Malaysia. Kebanyakan perbandingan di internet bercakap tentang kuasa dan kelajuan. Kami di kedai melihatnya dari sudut lain — sudut pembeli yang mengambil loan, yang perlu bayar ansuran setiap bulan untuk beberapa tahun. Dari sudut itu, soalannya bukan motor mana lebih laju, tetapi motor mana lebih berbaloi untuk duit anda.',
    sections: [
      {
        h: 'Beza asas kedua-dua motor',
        p: [
          'Kedua-duanya kapcai sport 150cc penyejukan cecair. Y15ZR menggunakan enjin SOHC dengan kotak gear 5 kelajuan, dan terkenal dengan tork yang kuat di kelajuan rendah — sesuai untuk tunggangan bandar dan membawa beban. RS150R menggunakan enjin DOHC dengan kotak gear 6 kelajuan, yang lebih bertenaga di putaran tinggi.',
          'Untuk kegunaan harian — ulang-alik kerja, hantar barang, ronda hujung minggu — kedua-duanya lebih daripada cukup. Perbezaan prestasi jarang menjadi faktor penentu bagi pembeli loan.'
        ]
      },
      {
        h: 'Harga terpakai dan ansuran',
        p: [
          'Harga terpakai kedua-dua model bergantung pada tahun, versi dan keadaan, dan jurangnya berubah mengikut pasaran. Yang penting ialah ini: untuk kadar dan tempoh yang sama, setiap RM1,000 perbezaan harga ialah kira-kira RM36 sebulan perbezaan ansuran untuk tempoh 36 bulan pada kadar rata 10%.',
          'Jadi bandingkan unit sebenar, bukan model. Y15ZR 2020 yang bersih dan RS150R 2020 yang bersih mungkin mempunyai ansuran yang hampir sama. Minta angka bertulis untuk kedua-dua unit dan bandingkan jumlah keseluruhan, bukan ansuran sahaja.'
        ]
      },
      {
        h: 'Kos jaga dan alat ganti',
        p: [
          'Y15ZR ialah antara kapcai yang paling banyak di jalan raya Malaysia, jadi alat ganti asli dan pasaran sekunder ada di hampir setiap kedai motor, dan hampir setiap mekanik biasa dengan enjinnya. Ini menjadikan kos servis dan baik pulih sangat mudah dijangka.',
          'Alat ganti RS150R juga mudah didapati, tetapi enjin DOHC lebih kompleks, jadi servis tertentu mungkin lebih mahal sedikit. Bagi pembeli loan, kos jaga yang mudah dijangka sama penting dengan ansuran — kerana kedua-duanya keluar daripada poket yang sama setiap bulan.'
        ]
      },
      {
        h: 'Nilai jual semula',
        p: [
          'Kedua-dua model mempunyai nilai jual semula yang kukuh. Y15ZR mempunyai permintaan yang paling luas, jadi ia biasanya paling cepat dijual atau ditrade-in. Ini penting kalau anda merancang untuk naik taraf selepas beberapa tahun, atau kalau keadaan kewangan berubah dan anda perlu menjual.',
          'Unit yang dijaga hampir standard, dengan rekod servis dan geran bersih, sentiasa mendapat harga terbaik — tidak kira model.'
        ]
      },
      {
        h: 'Jadi, mana satu?',
        p: [
          'Pilih Y15ZR kalau anda mahukan kos jaga yang paling mudah dijangka, alat ganti di mana-mana, dan nilai jual semula yang paling luas. Pilih RS150R kalau anda suka kuasa di putaran tinggi dan enam gear, dan unit yang anda jumpa ansurannya selesa.',
          'Kebanyakan stok kami ialah Y15ZR, setiap satu disemak geran dan sejarahnya. Lihat halaman stok kami, atau baca panduan Y15ZR loan kedai dan RS150R loan kedai untuk butiran deposit dan ansuran. Kami di Simpang Ampat, Pulau Pinang — WhatsApp kami untuk angka bertulis.'
        ]
      }
    ],
    faq: [
      ['Y15ZR atau RS150R, mana lebih jimat untuk loan?', 'Bergantung pada harga unit sebenar. Untuk tahun dan keadaan yang sama, perbezaan ansuran biasanya kecil. Bandingkan jumlah keseluruhan bayaran secara bertulis untuk kedua-dua unit.'],
      ['Apa beza enjin Y15ZR dan RS150R?', 'Kedua-duanya 150cc penyejukan cecair. Y15ZR menggunakan enjin SOHC dengan 5 gear dan tork kuat di kelajuan rendah; RS150R menggunakan enjin DOHC dengan 6 gear yang lebih bertenaga di putaran tinggi.'],
      ['Mana lebih murah kos servis?', 'Y15ZR biasanya lebih mudah dan murah dijaga kerana alat ganti ada di mana-mana dan enjinnya lebih ringkas. Kos RS150R juga munasabah, tetapi servis tertentu mungkin lebih mahal sedikit.'],
      ['Mana lebih senang jual semula?', 'Kedua-duanya kukuh. Y15ZR mempunyai permintaan paling luas, jadi biasanya lebih cepat dijual atau ditrade-in.'],
      ['Boleh ambil kedua-dua model guna loan kedai?', 'Boleh. Kedua-duanya model popular yang mudah dibiayai. Deposit dan ansuran bergantung pada unit, profil anda dan tempoh pembiayaan.']
    ]
  },
  {
    slug: 'lc135-vs-y15zr-loan',
    date: '2026-10-19',
    dateModified: '2026-10-19',
    readMinutes: 6,
    title: 'LC135 vs Y15ZR — Mana Lebih Berbaloi Kalau Ambil Loan?',
    description:
      'LC135 atau Y15ZR? Perbandingan dari sudut pembeli loan: harga terpakai, ansuran, kos servis, alat ganti dan nilai jual semula, dari kedai di Simpang Ampat.',
    keywords: 'lc135 vs y15zr, lc vs y15, lc135 atau y15zr, beza lc135 dan y15zr, mana lagi bagus lc atau y15, naik taraf lc135 ke y15zr, loan kedai lc135 y15zr',
    intro:
      'LC135 atau Y15ZR? Kedua-duanya kapcai Yamaha yang paling terkenal di Malaysia, dan ramai pembeli tersepit antara dua pilihan ini. LC135 ialah legenda yang sudah lama di jalan raya — murah, tahan lasak dan alat gantinya ada di mana-mana. Y15ZR pula penggantinya yang lebih berkuasa dan lebih moden. Kebanyakan perbandingan bercakap tentang kuasa. Kami di kedai melihatnya dari sudut pembeli loan: motor mana yang lebih berbaloi untuk ansuran yang anda bayar setiap bulan.',
    sections: [
      {
        h: 'Beza asas kedua-dua motor',
        p: [
          'LC135 menggunakan enjin 135cc penyejukan cecair dengan kotak gear 4 kelajuan; versi lama berkarburetor, manakala V8 menggunakan suntikan bahan api (FI). Y15ZR menggunakan enjin 150cc penyejukan cecair dengan kotak gear 5 kelajuan, lebih bertenaga dan lebih selesa untuk jalan besar dan lebuh raya.',
          'Untuk ulang-alik bandar, ke kilang atau ke kelas, LC135 sudah cukup. Kalau anda selalu menunggang jauh, membawa pembonceng, atau menghantar barang sepanjang hari, kuasa tambahan Y15ZR lebih terasa.'
        ]
      },
      {
        h: 'Harga terpakai dan ansuran',
        p: [
          'LC135 terpakai biasanya lebih murah daripada Y15ZR untuk keadaan yang setanding, jadi jumlah dibiayai lebih kecil dan ansuran lebih ringan. Pada kadar rata 10% setahun, setiap RM1,000 perbezaan harga ialah kira-kira RM36 sebulan perbezaan ansuran untuk tempoh 36 bulan. Ini contoh pengiraan, bukan sebut harga.',
          'Tetapi umur motor juga penting. Banyak LC135 di pasaran sudah berusia, dan unit yang lebih lama mungkin hanya boleh dibiayai untuk tempoh yang lebih pendek — yang menaikkan semula ansuran bulanan. Y15ZR tahun yang lebih muda kadangkala boleh dibiayai lebih lama. Bandingkan angka bertulis untuk unit sebenar, bukan model semata-mata.'
        ]
      },
      {
        h: 'Kos minyak, servis dan alat ganti',
        p: [
          'Kedua-duanya antara motor yang paling murah dijaga di Malaysia. Alat ganti LC135 sangat murah dan ada di hampir setiap kedai motor, dan hampir semua mekanik pernah membuka enjinnya. Y15ZR pun sama mudah, cuma sesetengah alat gantinya lebih mahal sedikit.',
          'Untuk LC135 yang sudah berusia, peruntukkan bajet untuk baik pulih yang biasa pada motor lama: getah, kabel, bearing, set rantai dan sistem penyejukan. Kos ini kecil satu demi satu, tetapi perlu dikira bersama ansuran.'
        ]
      },
      {
        h: 'Nilai jual semula dan naik taraf',
        p: [
          'Kedua-duanya mudah dijual semula. Y15ZR biasanya mengekalkan nilai yang lebih tinggi kerana lebih baharu dan permintaannya paling luas. LC135 pula sentiasa ada pembeli kerana harganya mampu milik.',
          'Ramai pelanggan kami bermula dengan LC135, membina rekod bayaran yang bersih, kemudian naik taraf ke Y15ZR. Itu jalan yang bijak kalau ansuran Y15ZR terasa berat sekarang.'
        ]
      },
      {
        h: 'Jadi, mana satu?',
        p: [
          'Pilih LC135 kalau anda mahu ansuran paling ringan, kegunaan anda kebanyakannya dalam bandar, dan anda selesa dengan motor yang lebih ringkas. Pilih Y15ZR kalau anda menunggang jauh atau setiap hari untuk mencari rezeki, mahu motor yang lebih muda, dan ansurannya masih selesa dengan pendapatan anda.',
          'Kebanyakan stok kami ialah Y15ZR, setiap satu disemak geran dan sejarahnya. Baca panduan LC135 loan kedai dan Y15ZR loan kedai kami untuk butiran deposit dan ansuran, atau WhatsApp kami di Simpang Ampat untuk angka bertulis.'
        ]
      }
    ],
    faq: [
      ['LC135 atau Y15ZR, mana lebih jimat untuk loan?', 'LC135 biasanya lebih murah, jadi ansurannya lebih ringan. Tetapi unit LC135 yang sudah berusia mungkin hanya boleh dibiayai untuk tempoh pendek, jadi bandingkan angka bertulis untuk unit sebenar.'],
      ['Apa beza enjin LC135 dan Y15ZR?', 'LC135 menggunakan enjin 135cc penyejukan cecair dengan 4 gear; Y15ZR menggunakan enjin 150cc penyejukan cecair dengan 5 gear yang lebih bertenaga untuk jalan jauh.'],
      ['LC135 masih berbaloi dibeli sekarang?', 'Ya, untuk yang mahu ansuran ringan dan kegunaan harian dalam bandar. Pilih unit yang dijaga baik dengan geran bersih, dan peruntukkan bajet untuk baik pulih biasa pada motor lama.'],
      ['Boleh trade-in LC135 untuk ambil Y15ZR?', 'Tanya kedai sama ada mereka menerima trade-in. Nilai trade-in boleh menjadi sebahagian deposit; kalau LC135 anda masih dalam loan, baki perlu diselesaikan dahulu.'],
      ['Mana lebih senang jual semula?', 'Kedua-duanya mudah dijual. Y15ZR biasanya mengekalkan nilai lebih tinggi; LC135 sentiasa ada pembeli kerana harganya mampu milik.']
    ]
  },
  {
    slug: 'benelli-rfs150i-loan-kedai',
    date: '2026-10-20',
    dateModified: '2026-10-20',
    readMinutes: 5,
    title: 'Benelli RFS150i Loan Kedai — Berbaloi Ke Beli Terpakai?',
    description:
      'Benelli RFS150i terpakai guna loan kedai: kenapa harganya lebih rendah daripada Y15ZR, apa kesannya pada loan dan jual semula, dan apa nak semak sebelum beli.',
    keywords: 'benelli rfs150i loan kedai, benelli rfs150 loan, rfs150i second hand, benelli rfs150i terpakai, harga rfs150i terpakai, benelli kapcai, loan motor benelli',
    intro:
      'Benelli RFS150i ialah kapcai 150cc yang ramai pandang kerana harganya lebih rendah daripada Y15ZR atau RS150R. Di pasaran terpakai, perbezaan itu lebih ketara lagi. Tetapi kalau anda mengambil motor ini melalui loan kedai, harga yang rendah bukan satu-satunya perkara yang perlu difikirkan. Panduan jujur ini terangkan kelebihan dan risikonya dari sudut pembeli loan.',
    sections: [
      {
        h: 'Kenapa RFS150i lebih murah',
        p: [
          'Motor daripada jenama yang kurang dominan di Malaysia biasanya turun nilai lebih cepat berbanding Yamaha dan Honda, kerana bilangan pembeli di pasaran terpakai lebih kecil. Bagi pembeli, itu bermaksud anda boleh mendapat kapcai 150cc dengan harga yang lebih rendah.',
          'Dari sudut ansuran, harga lebih rendah bermaksud jumlah dibiayai lebih kecil. Pada kadar rata 10% setahun, setiap RM1,000 yang dibiayai kira-kira RM36 sebulan untuk 36 bulan. Ini contoh pengiraan, bukan sebut harga.'
        ]
      },
      {
        h: 'Apa kesannya pada loan dan jual semula',
        p: [
          'Pembiaya melihat berapa mudah sesebuah motor dijual semula. Motor jenama yang kurang biasa mungkin dinilai lebih berhati-hati — contohnya tempoh pembiayaan yang lebih pendek atau deposit yang lebih tinggi. Ia berbeza mengikut pembiaya dan unit, jadi tanya terus sebelum membuat keputusan.',
          'Fikir juga tentang hari anda mahu menjual atau trade-in. Kalau anda merancang naik taraf dalam dua tiga tahun, nilai yang tinggal pada RFS150i mungkin lebih rendah daripada Y15ZR yang dibeli pada masa yang sama. Kalau anda mahu simpan motor itu lama, perkara ini kurang penting.'
        ]
      },
      {
        h: 'Alat ganti dan servis',
        p: [
          'Sebelum membeli, pastikan ada pusat servis atau bengkel berhampiran yang biasa dengan Benelli, dan tanya berapa lama alat ganti biasa seperti pad brek, set rantai dan penapis mengambil masa untuk sampai. Alat ganti Yamaha dan Honda ada di hampir setiap kedai; untuk jenama lain, anda mungkin perlu menunggu.',
          'Semasa pandu uji, semak perkara yang sama seperti mana-mana kapcai: bunyi enjin semasa sejuk, klac dan pertukaran gear, rantai, brek, tayar, lampu dan sistem elektrik.'
        ]
      },
      {
        h: 'Ringkasnya',
        p: [
          'RFS150i boleh jadi pilihan berbaloi kalau anda mahu kapcai 150cc dengan bajet rendah dan berniat menyimpannya lama. Kalau anda mahu nilai jual semula yang kukuh dan alat ganti di mana-mana, Y15ZR masih lebih selamat. Stok kami kebanyakannya Y15ZR — WhatsApp kami di Simpang Ampat dan kami bantu bandingkan angka bertulis.'
        ]
      }
    ],
    faq: [
      ['Benelli RFS150i boleh ambil guna loan kedai?', 'Boleh dipertimbangkan. Pembiaya mungkin menilai jenama yang kurang biasa dengan lebih berhati-hati, contohnya tempoh lebih pendek atau deposit lebih tinggi. Tanya angka bertulis untuk unit sebenar.'],
      ['Kenapa harga RFS150i terpakai lebih rendah?', 'Pembeli di pasaran terpakai lebih sedikit berbanding Yamaha dan Honda, jadi nilainya turun lebih cepat. Ini baik untuk pembeli, tetapi bermaksud nilai jual semula juga lebih rendah.'],
      ['Alat ganti Benelli senang cari?', 'Tidak semudah Yamaha atau Honda. Pastikan ada bengkel berhampiran yang biasa dengan Benelli dan tanya tempoh menunggu alat ganti biasa sebelum membeli.'],
      ['RFS150i atau Y15ZR untuk loan?', 'RFS150i biasanya lebih murah, jadi ansurannya lebih ringan. Y15ZR lebih mahal tetapi lebih mudah dibiayai, diservis dan dijual semula.']
    ]
  },
  {
    slug: 'benelli-250cc-loan-kedai',
    date: '2026-10-20',
    dateModified: '2026-10-20',
    readMinutes: 6,
    title: 'Benelli TRK 251 & Leoncino 250 Loan Kedai — Panduan Terpakai',
    description:
      'Benelli TRK 251 atau Leoncino 250 terpakai guna loan: lesen B2, ansuran motor 250cc, insurans dan cukai jalan, alat ganti, dan apa nak semak sebelum beli.',
    keywords: 'benelli trk 251 loan kedai, leoncino 250 loan, benelli 250cc loan kedai, trk 251 second hand, leoncino 250 terpakai, motor 250cc loan kedai, loan motor besar lesen b2',
    intro:
      'Benelli TRK 251 dan Leoncino 250 ialah antara cara paling murah untuk masuk ke kelas motor 250cc di Malaysia. TRK 251 bergaya adventure, Leoncino 250 pula gaya scrambler bandar. Ramai penunggang kapcai yang mahu naik taraf bertanya: boleh ambil guna loan kedai tak, dan apa yang perlu disediakan? Panduan ini menjawabnya dari sudut kedai.',
    sections: [
      {
        h: 'Lesen dahulu: B2 untuk motor 250cc',
        p: [
          'Motor sehingga 250cc memerlukan lesen B2. Kalau anda hanya ada lesen untuk kapcai, pastikan lesen anda sesuai sebelum memohon loan — pembiaya dan insurans akan bertanya, dan menunggang tanpa lesen yang betul boleh membatalkan perlindungan insurans.'
        ]
      },
      {
        h: 'Ansuran motor 250cc: kira semua kos',
        p: [
          'Harga motor 250cc lebih tinggi daripada kapcai, jadi jumlah dibiayai dan ansuran lebih besar. Pada kadar rata 10% setahun, setiap RM1,000 yang dibiayai kira-kira RM36 sebulan untuk 36 bulan atau RM25 sebulan untuk 60 bulan. Ini contoh pengiraan, bukan sebut harga.',
          'Selain ansuran, kira kos lain yang naik bersama saiz enjin: insurans, cukai jalan, tayar yang lebih besar, dan servis. Masukkan semuanya dalam bajet bulanan anda, bukan ansuran sahaja. Kalkulator ansuran motor kami membantu untuk bahagian ansuran.'
        ]
      },
      {
        h: 'Kenapa pembiaya berhati-hati dengan motor besar jenama kurang biasa',
        p: [
          'Motor 250cc mempunyai bilangan pembeli yang lebih kecil daripada kapcai, dan jenama yang kurang dominan menambah lagi faktor itu. Pembiaya mungkin meminta deposit yang lebih tinggi atau menawarkan tempoh yang lebih pendek. Tiada jawapan tetap; ia bergantung pada unit dan profil anda.',
          'Deposit yang lebih tinggi ialah cara paling berkesan untuk menurunkan ansuran dan menaikkan peluang lulus. Kalau anda sedang membayar loan kapcai, menyelesaikannya dahulu juga banyak membantu.'
        ]
      },
      {
        h: 'Semak ini sebelum ambil TRK 251 atau Leoncino 250 terpakai',
        p: [
          'Tanya rekod servis dan siapa yang menservis motor itu. Pastikan ada bengkel berhampiran yang biasa dengan Benelli, dan tanya tempoh menunggu alat ganti biasa.',
          'TRK 251 sering dibawa berkelah dan touring, jadi semak tanda jatuh pada handle, pemegang kaki, rangka dan bekas sisi. Untuk kedua-dua model, periksa rantai dan sproket, brek, fork, tayar, sistem penyejukan dan elektrik. Geran mesti bersih — nombor casis dan enjin sepadan dan tiada tuntutan pembiaya aktif.'
        ]
      },
      {
        h: 'Ringkasnya',
        p: [
          'TRK 251 dan Leoncino 250 boleh dibiayai, tetapi sediakan lesen B2, bajet untuk semua kos dan deposit yang lebih tinggi daripada kapcai. Kedai kami di Simpang Ampat kebanyakannya menjual kapcai, tetapi kami boleh bantu kira angka dan beritahu dengan jujur sama ada naik taraf sekarang masuk akal untuk anda.'
        ]
      }
    ],
    faq: [
      ['Benelli TRK 251 perlu lesen apa?', 'Motor sehingga 250cc memerlukan lesen B2. Pastikan lesen anda sesuai sebelum memohon loan dan insurans.'],
      ['TRK 251 boleh ambil guna loan kedai?', 'Boleh dipertimbangkan. Kerana harganya lebih tinggi dan pembelinya lebih sedikit, pembiaya mungkin meminta deposit lebih tinggi atau tempoh lebih pendek.'],
      ['Ansuran Leoncino 250 sebulan berapa?', 'Bergantung pada harga unit, deposit dan tempoh. Pada kadar rata 10%, setiap RM1,000 yang dibiayai kira-kira RM36 sebulan untuk 36 bulan. Kira juga insurans, cukai jalan dan servis.'],
      ['TRK 251 atau Leoncino 250?', 'TRK 251 sesuai untuk touring dan jalan jauh; Leoncino 250 lebih ringan dan bergaya untuk bandar. Dari sudut loan, pilih unit yang jumlah kos bulanannya selesa.']
    ]
  },
  {
    slug: 'modenas-kriss-loan-kedai',
    date: '2026-10-20',
    dateModified: '2026-10-20',
    readMinutes: 5,
    title: 'Modenas Kriss Loan Kedai — Motor Murah Untuk Ansuran Ringan',
    description:
      'Modenas Kriss guna loan kedai: kenapa ansurannya antara paling ringan, untuk siapa ia sesuai, alat ganti, jual semula, dan apa nak semak pada Kriss terpakai.',
    keywords: 'modenas kriss loan kedai, kriss loan kedai, modenas kriss terpakai, kriss second hand, harga modenas kriss terpakai, loan motor modenas, motor murah loan kedai Penang',
    intro:
      'Modenas Kriss ialah kapcai buatan Malaysia yang sudah lama menjadi motor kerja harian — ringkas, ringan dan murah. Untuk pembeli yang mahu ansuran paling ringan, Kriss terpakai sering muncul sebagai pilihan. Panduan ringkas ini terangkan apa yang perlu anda tahu kalau mengambilnya melalui loan kedai.',
    sections: [
      {
        h: 'Kenapa Kriss sesuai untuk bajet ketat',
        p: [
          'Harga Kriss terpakai rendah, jadi jumlah dibiayai kecil dan ansurannya ringan. Untuk motor berharga rendah, ramai pembeli memilih tempoh pendek kerana ansurannya masih selesa — dan tempoh pendek menjimatkan faedah. Pada kadar rata 10% setahun, setiap RM1,000 yang dibiayai kira-kira RM36 sebulan untuk 36 bulan. Ini contoh pengiraan, bukan sebut harga.',
          'Kriss sesuai untuk ulang-alik dekat, ke kilang, ke sekolah atau ke pasar. Kalau anda menunggang jauh setiap hari atau membawa beban berat, kapcai yang lebih besar mungkin lebih selesa.'
        ]
      },
      {
        h: 'Alat ganti dan nilai jual semula',
        p: [
          'Sebagai jenama tempatan, alat ganti Modenas mudah didapati di banyak kedai, dan enjinnya ringkas untuk dibaiki. Nilai jual semulanya lebih rendah daripada Yamaha dan Honda, jadi ia lebih sesuai untuk yang mahu simpan motor lama atau sekadar perlukan pengangkutan murah.',
          'Pembiaya mungkin mengehadkan tempoh untuk unit yang sudah berusia. Kalau unit itu murah, perkara ini jarang menjadi masalah kerana ansurannya tetap ringan.'
        ]
      },
      {
        h: 'Semak ini sebelum ambil Kriss terpakai',
        p: [
          'Banyak Kriss di pasaran sudah berusia dan digunakan untuk kerja berat. Dengar enjin semasa sejuk, rasa pertukaran gear, dan periksa rantai, brek, tayar, lampu dan pendawaian.',
          'Geran paling penting untuk motor yang sudah berpindah tangan beberapa kali: nombor casis dan enjin mesti sepadan, nama pemilik sepadan, dan tiada tuntutan pembiaya aktif. Motor murah yang gerannya bermasalah akhirnya menjadi motor yang paling mahal.'
        ]
      },
      {
        h: 'Ringkasnya',
        p: [
          'Kriss ialah pilihan jujur untuk pengangkutan harian dengan ansuran paling ringan. Kalau bajet anda boleh naik sedikit, LC135 atau Honda EX5 menawarkan nilai jual semula yang lebih kukuh. WhatsApp kami di Simpang Ampat untuk bandingkan angka bertulis.'
        ]
      }
    ],
    faq: [
      ['Modenas Kriss boleh ambil guna loan kedai?', 'Boleh dipertimbangkan. Kerana harganya rendah, ansurannya ringan dan nisbah komitmen anda rendah. Tempoh mungkin dihadkan untuk unit yang sudah berusia.'],
      ['Alat ganti Modenas Kriss senang cari?', 'Ya, sebagai jenama tempatan alat gantinya mudah didapati di banyak kedai, dan enjinnya ringkas untuk dibaiki.'],
      ['Kriss atau EX5 untuk loan?', 'Kriss biasanya lebih murah, jadi ansurannya lebih ringan. EX5 lebih mahal sedikit tetapi nilai jual semulanya lebih kukuh.'],
      ['Apa nak semak pada Kriss terpakai?', 'Bunyi enjin semasa sejuk, gear, rantai, brek, tayar, lampu dan pendawaian, serta geran yang bersih tanpa tuntutan pembiaya aktif.']
    ]
  },
  {
    slug: 'sym-vf3i-185-loan-kedai',
    date: '2026-10-20',
    dateModified: '2026-10-20',
    readMinutes: 5,
    title: 'SYM VF3i 185 Loan Kedai — Skuter Besar, Ansuran Sederhana',
    description:
      'SYM VF3i 185 terpakai guna loan kedai: kenapa harganya lebih rendah daripada skuter Yamaha dan Honda, kesan pada loan dan jual semula, dan apa nak semak.',
    keywords: 'sym vf3i loan kedai, vf3i 185 loan, sym vf3i terpakai, vf3i second hand, harga vf3i terpakai, loan skuter sym, skuter 185cc loan kedai',
    intro:
      'SYM VF3i 185 ialah skuter sport yang menarik perhatian kerana enjin 185cc dan rupanya yang garang, pada harga yang sering lebih rendah daripada skuter Yamaha atau Honda yang setanding. Di pasaran terpakai, harganya lebih menarik lagi. Ini yang perlu anda tahu kalau mengambilnya melalui loan kedai.',
    sections: [
      {
        h: 'Harga rendah, tetapi fikir tentang jual semula',
        p: [
          'Seperti kebanyakan jenama yang kurang dominan di Malaysia, VF3i turun nilai lebih cepat di pasaran terpakai. Itu bermaksud anda boleh mendapat skuter berkuasa pada harga yang rendah, dan ansuran yang lebih ringan. Pada kadar rata 10% setahun, setiap RM1,000 yang dibiayai kira-kira RM36 sebulan untuk 36 bulan. Ini contoh pengiraan, bukan sebut harga.',
          'Sisi lainnya: nilai yang tinggal apabila anda mahu jual atau trade-in juga lebih rendah, dan pembiaya mungkin menilai unit dengan lebih berhati-hati — contohnya tempoh lebih pendek atau deposit lebih tinggi.'
        ]
      },
      {
        h: 'Alat ganti, CVT dan servis',
        p: [
          'Pastikan ada pengedar atau bengkel SYM berhampiran sebelum membeli, dan tanya tempoh menunggu alat ganti biasa. Sebagai skuter, sistem CVT perlu diservis berkala: tali sawat, roller dan klac haus mengikut penggunaan. Tanya bila kali terakhir set CVT diservis.',
          'Semasa pandu uji, dengar bunyi dari kotak CVT semasa memecut, semak plastik badan untuk tanda kemalangan, dan periksa brek, tayar, lampu serta sistem elektrik. Geran mesti bersih dan tiada tuntutan pembiaya aktif.'
        ]
      },
      {
        h: 'Ringkasnya',
        p: [
          'VF3i 185 berbaloi kalau anda mahu skuter berkuasa dengan bajet rendah dan berniat menyimpannya lama. Kalau nilai jual semula dan alat ganti di mana-mana lebih penting, NVX atau Vario 160 lebih selamat — baca panduan loan kedai kami untuk kedua-duanya. WhatsApp kami di Simpang Ampat untuk angka bertulis.'
        ]
      }
    ],
    faq: [
      ['SYM VF3i boleh ambil guna loan kedai?', 'Boleh dipertimbangkan. Pembiaya mungkin menilai jenama yang kurang biasa dengan lebih berhati-hati, contohnya tempoh lebih pendek atau deposit lebih tinggi.'],
      ['Kenapa VF3i terpakai murah?', 'Pembeli di pasaran terpakai lebih sedikit berbanding skuter Yamaha dan Honda, jadi nilainya turun lebih cepat.'],
      ['VF3i atau NVX untuk loan?', 'VF3i terpakai biasanya lebih murah, jadi ansurannya lebih ringan. NVX lebih mahal tetapi lebih mudah dibiayai, diservis dan dijual semula.'],
      ['Apa nak semak pada VF3i terpakai?', 'Sistem CVT, plastik badan, brek, tayar, elektrik, ketersediaan alat ganti berhampiran, dan geran yang bersih.']
    ]
  },
  {
    slug: 'motor-jenama-kurang-popular-loan-kedai',
    date: '2026-10-20',
    dateModified: '2026-10-20',
    readMinutes: 6,
    title: 'Motor Benelli, SYM, WMoto Terpakai — Berbaloi Ke Ambil Loan?',
    description:
      'Motor jenama kurang popular seperti Benelli, SYM, Modenas, WMoto dan Keeway terpakai: kenapa murah, kesan pada loan kedai, alat ganti dan nilai jual semula.',
    keywords: 'motor benelli terpakai, motor wmoto loan, keeway loan kedai, motor jenama cina berbaloi ke, motor murah terpakai loan, loan motor jenama lain, motor bukan yamaha honda loan kedai',
    intro:
      'Iklan motor Benelli, SYM, Modenas, WMoto atau Keeway terpakai selalunya menarik — spesifikasi yang tinggi pada harga yang jauh lebih rendah daripada Yamaha atau Honda. Soalannya: berbaloi ke, terutamanya kalau anda ambil guna loan? Kami di kedai menerima soalan ini setiap minggu. Ini jawapan jujur kami.',
    sections: [
      {
        h: 'Kenapa motor jenama ini lebih murah di pasaran terpakai',
        p: [
          'Harga motor terpakai ditentukan oleh permintaan. Yamaha dan Honda mempunyai pembeli yang paling ramai, rangkaian servis paling luas, dan alat ganti di setiap kedai. Jenama lain mempunyai pembeli yang lebih sedikit, jadi nilainya turun lebih cepat.',
          'Ini bukan bermaksud motornya tidak bagus. Ia bermaksud anda membayar lebih sedikit untuk spesifikasi yang sama — dan menerima lebih sedikit apabila anda menjualnya nanti.'
        ]
      },
      {
        h: 'Kesan pada loan kedai',
        p: [
          'Pembiaya melihat berapa mudah motor dijual semula kalau sesuatu berlaku. Untuk jenama yang kurang biasa, mereka mungkin meminta deposit lebih tinggi, menawarkan tempoh lebih pendek, atau menilai unit dengan lebih teliti. Ia berbeza mengikut pembiaya, unit dan profil anda.',
          'Pada masa yang sama, harga yang lebih rendah bermaksud jumlah dibiayai lebih kecil. Pada kadar rata 10% setahun, setiap RM1,000 yang dibiayai kira-kira RM36 sebulan untuk 36 bulan. Kadangkala dua kesan ini saling membatalkan — jadi bandingkan angka bertulis untuk unit sebenar, bukan anggapan. Ini contoh pengiraan, bukan sebut harga.'
        ]
      },
      {
        h: 'Lima soalan sebelum membeli',
        p: [
          'Satu: ada pengedar atau bengkel jenama itu berhampiran rumah atau tempat kerja anda? Dua: berapa lama alat ganti biasa — pad brek, rantai, penapis, tali sawat CVT — mengambil masa untuk sampai? Tiga: berapa lama anda merancang menyimpan motor ini?',
          'Empat: kalau motor ini rosak, adakah anda ada pengangkutan lain sementara menunggu alat ganti? Lima: kalau anda perlu menjualnya dalam setahun dua, berapa yang anda sanggup rugi? Kalau jawapannya selesa, motor jenama ini boleh jadi pilihan yang sangat berbaloi.'
        ]
      },
      {
        h: 'Bila Yamaha atau Honda lebih masuk akal',
        p: [
          'Kalau motor ini ialah sumber rezeki anda — penghantaran atau e-hailing — masa rosak menunggu alat ganti ialah pendapatan yang hilang. Dalam kes ini, model seperti Y15ZR, LC135, EX5 atau Dash 125 yang alat gantinya ada di mana-mana biasanya lebih selamat walaupun harganya lebih tinggi.',
          'Kalau anda merancang naik taraf tidak lama lagi, nilai jual semula Yamaha dan Honda yang kukuh membantu deposit motor seterusnya.'
        ]
      },
      {
        h: 'Ringkasnya',
        p: [
          'Motor Benelli, SYM, Modenas, WMoto atau Keeway terpakai boleh jadi pembelian yang bijak kalau anda simpan lama dan ada bengkel berhampiran. Untuk motor kerja dan pembeli yang mahu jual semula, Yamaha dan Honda masih lebih selamat. Kami di Simpang Ampat, Pulau Pinang — WhatsApp kami dan kami bantu bandingkan angka bertulis dengan jujur.'
        ]
      }
    ],
    faq: [
      ['Motor jenama Cina terpakai berbaloi ke?', 'Boleh berbaloi kalau anda simpan lama, ada bengkel berhampiran dan alat ganti mudah dipesan. Nilai jual semulanya lebih rendah daripada Yamaha dan Honda.'],
      ['Motor Benelli atau WMoto boleh ambil guna loan kedai?', 'Boleh dipertimbangkan. Pembiaya mungkin meminta deposit lebih tinggi atau tempoh lebih pendek kerana pembelinya di pasaran terpakai lebih sedikit.'],
      ['Kenapa motor jenama ini cepat turun harga?', 'Permintaan di pasaran terpakai lebih kecil dan rangkaian servis lebih terhad, jadi pembeli membayar lebih rendah.'],
      ['Untuk rider penghantaran, jenama mana lebih selamat?', 'Model Yamaha dan Honda yang popular seperti Y15ZR, LC135, EX5 atau Dash 125, kerana alat gantinya ada di mana-mana dan masa rosak lebih singkat.']
    ]
  }
];

export const findPostBySlug = (slug) => BLOG_POSTS.find((post) => post.slug === slug) || null;

// <title> for a post. Search results cut titles at about 60 characters, and
// Ahrefs Site Audit (2026-10-19) flagged "Title too long" on posts whose
// "<title> | DR Racing" ran to 71. The keyword-first post title is kept whole
// and the brand suffix is dropped only when it would push past the limit —
// Google shows the site name next to the result anyway. The on-page H1 stays
// post.title in every case.
export const BLOG_TITLE_MAX = 60;
export const blogSeoTitle = (post) => {
  const branded = `${post.title} | DR Racing`;
  return branded.length <= BLOG_TITLE_MAX ? branded : post.title;
};
