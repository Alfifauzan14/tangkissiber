// Beranda TangkisSiber: ritme visual modern terinspirasi Skoolia dengan palet khas
// Cyber Ocean Blue (#0c4a6e -> #0369a1 -> #0ea5e9), spotlight Fitur Utama Cek Pesan,
// kartu flip interaktif, perbandingan, dan band rujukan glassmorphic.
import Link from "next/link";
import Image from "next/image";
import Container from "@/components/layout/Container";
import Ikon from "@/components/ui/Ikon";

const LATIHAN = [
  {
    href: "/cek-pesan",
    ikon: "content_paste_search",
    judul: "Cek Pesan & Tautan",
    isi: "Tempel pesan atau tautan mencurigakan untuk melihat tingkat risiko, alasan awam, dan saran tindakan.",
    aksi: "Periksa Pesan",
  },
  {
    href: "/simulasi",
    ikon: "forum",
    judul: "Simulasi Percakapan",
    isi: "Latih diri membalas chat penipu langkah demi langkah dengan umpan balik langsung di setiap pilihan.",
    aksi: "Mulai Simulasi",
  },
  {
    href: "/kuis",
    ikon: "quiz",
    judul: "Kuis 10 Soal",
    isi: "Uji wawasan anti penipuan dari bank soal terkurasi lengkap dengan penjelasan di tiap jawaban.",
    aksi: "Kerjakan Kuis",
  },
];

const TANPA_LATIHAN = [
  "Panik saat menerima telepon atau chat yang mengaku dari bank atau kurir",
  "Sulit membedakan tautan resmi dengan tautan phishing atau file APK berbahaya",
  "Tidak tahu langkah pertama yang harus dilakukan jika data atau uang terlanjur terkirim",
];

const DENGAN_TANGKIS = [
  "Terbiasa mengenali pola desakan waktu, permintaan OTP, dan iming-iming hadiah",
  "Bisa mengecek pesan mencurigakan secara instan sebelum mengklik tautan apa pun",
  "Punya panduan darurat terstruktur beserta kanal pelaporan resmi yang siap diakses",
];

const RUJUKAN = [
  {
    href: "/pustaka",
    ikon: "menu_book",
    judul: "Pustaka Modus",
    isi: "Pelajari 8 modus penipuan paling umum: ciri-ciri, contoh pesan, cara kerja, dan pencegahannya.",
  },
  {
    href: "/peringkat",
    ikon: "leaderboard",
    judul: "Peringkat Komunitas",
    isi: "Kumpulkan hingga 500 poin dari skor terbaik kuis dan simulasi, lalu lihat posisi Anda di Top 20.",
  },
  {
    href: "/darurat",
    ikon: "sos",
    judul: "Sudah Terlanjur?",
    isi: "Uang terlanjur terkirim atau OTP bocor? Ikuti 6 langkah pertolongan pertama dan kontak resmi.",
    bahaya: true,
  },
];

function OceanDivider({ terang = false, flip = false, center = false }) {
  return (
    <div className={`my-3 flex gap-1.5 ${center ? "justify-center" : ""}`} aria-hidden="true">
      <span
        className={`h-[3px] w-16 rounded-full transition-colors duration-300 ${
          terang
            ? "bg-white"
            : flip
            ? "bg-primary group-hover:bg-white"
            : "bg-primary"
        }`}
      />
      <span
        className={`h-[3px] w-5 rounded-full transition-colors duration-300 ${
          terang
            ? "bg-[#7dd3fc]"
            : flip
            ? "bg-accent group-hover:bg-[#7dd3fc]"
            : "bg-accent"
        }`}
      />
    </div>
  );
}

export default function Beranda() {
  return (
    <div>
      {/* 1. HERO: Gradien Cyber Ocean + cyber grid khas TangkisSiber + wave divider */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0c4a6e] via-[#0369a1] to-[#0ea5e9] pb-16 pt-8 text-white sm:pb-20 sm:pt-10 lg:pb-32 lg:pt-20">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-15"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.22) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.22) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <Container className="relative z-10 grid grid-cols-1 items-center gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#7dd3fc]">
              Perisai Digital Masyarakat Indonesia
            </p>
            <h1 className="mt-3 text-3xl font-bold leading-tight text-white md:text-4xl lg:text-[42px]">
              Kenali Modusnya, Tangkis Sebelum Terlanjur.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/90 md:text-base">
              Banyak korban tertipu bukan karena tidak peduli, melainkan karena belum pernah
              berlatih menghadapi situasinya. TangkisSiber melatih kepekaan Anda lewat cek pesan
              cerdas, simulasi chat nyata, dan kuis interaktif.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/cek-pesan"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-bold text-[#0369a1] shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl"
              >
                <Ikon nama="content_paste_search" ukuran={18} />
                Cek Pesan Sekarang
              </Link>
              <Link
                href="/simulasi"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border-2 border-white/80 px-7 py-3 text-sm font-bold text-white transition-all duration-200 hover:bg-white/15"
              >
                <Ikon nama="forum" ukuran={18} />
                Coba Simulasi Chat
              </Link>
            </div>

            <ul className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-medium text-white/95 sm:text-sm">
              {[
                "Gratis tanpa wajib daftar",
                "Analisis pesan instan",
              ].map((item) => (
                <li key={item} className="inline-flex items-center gap-1.5 whitespace-nowrap">
                  <Ikon nama="check_circle" ukuran={16} className="shrink-0 text-[#7dd3fc]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Kolom kanan: Ilustrasi Karakter TangkisSiber tanpa background kartu */}
          <div className="mx-auto w-full max-w-[260px] sm:max-w-[340px] lg:max-w-[440px]">
            <Image
              src="/images/hero-karakter.png"
              alt="Ilustrasi karakter pelajar Indonesia menggunakan perisai siber untuk menangkis pesan penipuan di ponsel"
              width={640}
              height={640}
              priority
              className="h-auto w-full drop-shadow-2xl"
            />
          </div>
        </Container>

        {/* Wave divider */}
        <svg
          viewBox="0 0 1440 90"
          preserveAspectRatio="none"
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-0 -mb-px h-10 w-full text-bg md:h-16"
        >
          <path
            fill="currentColor"
            d="M0,48 C240,96 480,0 720,42 C960,84 1200,18 1440,54 L1440,90 L0,90 Z"
          />
        </svg>
      </section>

      {/* 2. SPOTLIGHT FITUR UTAMA + 3 KARTU FLIP INTERAKTIF */}
      <section aria-labelledby="judul-latihan" className="relative overflow-hidden bg-bg py-12 lg:py-16">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            backgroundImage: "radial-gradient(var(--color-line) 1.2px, transparent 1.2px)",
            backgroundSize: "24px 24px",
          }}
        />
        <Container className="relative z-10">
          {/* Spotlight Cek Pesan — warna solid tanpa gradasi */}
          <div className="mb-10 flex flex-col justify-between gap-6 rounded-2xl bg-primary p-6 text-white shadow-lg md:flex-row md:items-center md:p-8">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-widest text-[#7dd3fc]">
                Fitur Utama
              </p>
              <h2 className="mt-1.5 text-xl font-bold text-white md:text-2xl">
                Ragu dengan Pesan WhatsApp atau Tautan yang Baru Masuk?
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-white/85">
                Tempelkan teks pesan atau URL di halaman Cek Pesan untuk mendeteksi 5 sinyal teks
                berbahaya dan 6 pola tautan phishing dalam hitungan detik.
              </p>
            </div>
            <Link
              href="/cek-pesan"
              className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-white px-7 text-sm font-bold text-[#0369a1] shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl"
            >
              <Ikon nama="content_paste_search" ukuran={18} />
              Buka Cek Pesan
            </Link>
          </div>

          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-widest text-primary">
              Latihan Interaktif
            </p>
            <h2 id="judul-latihan" className="mt-1.5 text-2xl font-bold text-ink md:text-3xl">
              Tiga Cara Praktis Melatih Kepekaan Digital
            </h2>
            <OceanDivider />
            <p className="text-sm leading-relaxed text-muted md:text-base">
              Pilih latihan yang sesuai dengan situasi Anda — mulai dari memeriksa pesan masuk,
              simulasi chat penipu, hingga menguji pemahaman lewat kuis.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {LATIHAN.map((k) => (
              <Link
                key={k.href}
                href={k.href}
                className="group flex flex-col rounded-2xl border border-line bg-surface p-6 shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1.5 hover:border-primary hover:bg-primary hover:text-white hover:shadow-[var(--shadow-card-hover)] md:p-7"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft text-primary transition-colors duration-300 group-hover:bg-white/15 group-hover:text-white">
                  <Ikon nama={k.ikon} ukuran={24} />
                </span>
                <h3 className="mt-5 text-lg font-bold text-ink transition-colors duration-300 group-hover:text-white">
                  {k.judul}
                </h3>
                <OceanDivider flip />
                <p className="flex-1 text-sm leading-relaxed text-muted transition-colors duration-300 group-hover:text-white/85">
                  {k.isi}
                </p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-primary transition-colors duration-300 group-hover:text-white">
                  {k.aksi}
                  <Ikon nama="arrow_right" ukuran={18} />
                </span>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* 3. PERBANDINGAN: Tanpa Latihan vs Dengan TangkisSiber */}
      <section aria-labelledby="judul-banding" className="border-y border-line bg-primary-soft/35 py-12 lg:py-16">
        <Container>
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-widest text-primary">
              Mengapa Perlu Berlatih?
            </p>
            <h2 id="judul-banding" className="mt-1.5 text-2xl font-bold text-ink md:text-3xl">
              Membaca Artikel Saja Tidak Cukup Saat Panik
            </h2>
            <OceanDivider />
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-bahaya/30 bg-surface p-6 shadow-[var(--shadow-card)] md:p-8">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-bahaya-soft text-bahaya">
                  <Ikon nama="warning" ukuran={22} />
                </span>
                <h3 className="text-lg font-bold text-bahaya">Tanpa Latihan Menghadapi Modus</h3>
              </div>
              <ul className="mt-5 space-y-3 text-sm text-ink/90">
                {TANPA_LATIHAN.map((t) => (
                  <li key={t} className="flex items-start gap-2.5">
                    <Ikon nama="cancel" ukuran={18} className="mt-0.5 shrink-0 text-bahaya" />
                    <span className="leading-relaxed">{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-primary/30 bg-surface p-6 shadow-[var(--shadow-card)] md:p-8">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white">
                  <Ikon nama="verified_user" ukuran={22} />
                </span>
                <h3 className="text-lg font-bold text-primary">Terlatih Bersama TangkisSiber</h3>
              </div>
              <ul className="mt-5 space-y-3 text-sm text-ink/90">
                {DENGAN_TANGKIS.map((t) => (
                  <li key={t} className="flex items-start gap-2.5">
                    <Ikon nama="check_circle" ukuran={18} className="mt-0.5 shrink-0 text-aman" />
                    <span className="leading-relaxed">{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </section>

      {/* 4. BAND RUJUKAN & DARURAT: latar sama seperti Hero + cyber grid */}
      <section
        aria-labelledby="judul-rujukan"
        className="relative overflow-hidden bg-gradient-to-br from-[#0c4a6e] via-[#0369a1] to-[#0ea5e9] py-12 text-white lg:py-16"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-15"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.22) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.22) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <Container className="relative z-10">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-widest text-[#7dd3fc]">
              Rujukan & Penyelamatan
            </p>
            <h2 id="judul-rujukan" className="mt-1.5 text-2xl font-bold text-white md:text-3xl">
              Pustaka Lengkap & Langkah Darurat Resmi
            </h2>
            <OceanDivider terang />
          </div>

          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {RUJUKAN.map((k) => (
              <Link
                key={k.href}
                href={k.href}
                className={`group flex flex-col rounded-2xl border border-line bg-surface p-6 text-ink shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1.5 hover:text-white hover:shadow-2xl md:p-7 ${
                  k.bahaya
                    ? "hover:border-bahaya hover:bg-bahaya"
                    : "hover:border-white/40 hover:bg-[#0c4a6e]"
                }`}
              >
                <span
                  className={`flex h-12 w-12 items-center justify-center rounded-xl transition-colors duration-300 ${
                    k.bahaya
                      ? "bg-bahaya-soft text-bahaya group-hover:bg-white/15 group-hover:text-white"
                      : "bg-primary-soft text-primary group-hover:bg-white/15 group-hover:text-white"
                  }`}
                >
                  <Ikon nama={k.ikon} ukuran={24} />
                </span>
                <h3
                  className={`mt-5 text-lg font-bold transition-colors duration-300 group-hover:text-white ${
                    k.bahaya ? "text-bahaya" : "text-ink"
                  }`}
                >
                  {k.judul}
                </h3>
                <OceanDivider flip />
                <p className="flex-1 text-sm leading-relaxed text-muted transition-colors duration-300 group-hover:text-white/85">
                  {k.isi}
                </p>
                <span
                  className={`mt-5 inline-flex items-center gap-1.5 text-sm font-bold transition-colors duration-300 group-hover:text-white ${
                    k.bahaya ? "text-bahaya" : "text-primary"
                  }`}
                >
                  Buka halaman
                  <Ikon nama="arrow_right" ukuran={18} />
                </span>
              </Link>
            ))}
          </div>
        </Container>
      </section>
    </div>
  );
}
