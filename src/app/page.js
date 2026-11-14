// Beranda: pintasan ke semua tujuan (DESIGN.md §8.3: kartu fitur ikon + judul
// + satu kalimat; ukuran mengikuti isi, bukan grid kembar paksa).
import Link from "next/link";
import Container from "@/components/layout/Container";
import Ikon from "@/components/ui/Ikon";
import Tombol from "@/components/ui/Tombol";
import Badge from "@/components/ui/Badge";

const KARTU = [
  {
    href: "/cek-pesan",
    ikon: "content_paste_search",
    judul: "Cek Pesan",
    isi: "Tempel pesan atau tautan yang mencurigakan, lihat tingkat risikonya dan saran tindakannya.",
    utama: true,
  },
  {
    href: "/simulasi",
    ikon: "forum",
    judul: "Simulasi Percakapan",
    isi: "Balas chat penipu langkah demi langkah dan lihat umpan balik dari setiap jawaban Anda.",
    utama: true,
  },
  {
    href: "/kuis",
    ikon: "quiz",
    judul: "Kuis 10 Soal",
    isi: "Uji wawasan anti penipuan dengan soal pilihan ganda dan penjelasan di tiap jawaban.",
    utama: true,
  },
  {
    href: "/pustaka",
    ikon: "menu_book",
    judul: "Pustaka Modus",
    isi: "8 modus penipuan paling umum di Indonesia: ciri-cirinya, contoh pesannya, dan cara menangkisnya.",
  },
  {
    href: "/darurat",
    ikon: "sos",
    judul: "Sudah Terlanjur?",
    isi: "Uang sudah terkirim atau data sudah diberi? Ikuti 6 langkah pertolongan pertama ini secepatnya.",
    bahaya: true,
  },
  {
    href: "/peringkat",
    ikon: "leaderboard",
    judul: "Peringkat",
    isi: "Lihat 20 pengguna dengan poin tertinggi dan posisi Anda di antara mereka.",
  },
];

export default function Beranda() {
  return (
    <Container className="py-8 lg:py-12">
      {/* Sambutan singkat: satu fokus, tanpa dekorasi berlebih */}
      <section className="max-w-xl">
        <Badge warna="primary" ikon="verified_user">
          Website edukasi anti penipuan
        </Badge>
        <h1 className="mt-4 text-3xl font-bold text-ink md:text-4xl">
          Kenali modusnya, tangkis sebelum terlanjur.
        </h1>
        <p className="mt-3 text-sm text-muted md:text-base">
          TangkisSiber melatih Anda mengenali penipuan digital lewat latihan nyata:
          memeriksa pesan, membalas chat penipu, dan kuis wawasan. Gratis, tanpa perlu akun.
        </p>
        <div className="mt-6">
          <Tombol gaya="primary" ikon="content_paste_search" href="/cek-pesan" className="w-full md:w-auto">
            Periksa Pesan Sekarang
          </Tombol>
        </div>
      </section>

      {/* Tiga latihan inti */}
      <section aria-labelledby="judul-latihan" className="mt-10">
        <h2 id="judul-latihan" className="text-lg font-bold text-ink">
          Mulai latihan
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          {KARTU.slice(0, 3).map((k) => (
            <Link
              key={k.href}
              href={k.href}
              className="rounded-lg border border-line bg-surface p-4 shadow-[0_1px_2px_rgba(21,22,42,0.06)] transition-transform duration-200 ease-out hover:-translate-y-0.5 md:p-6"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary-soft text-primary">
                <Ikon nama={k.ikon} ukuran={22} />
              </span>
              <h3 className="mt-3 font-semibold text-ink">{k.judul}</h3>
              <p className="mt-1 text-sm text-muted">{k.isi}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Rujukan: pustaka, darurat, peringkat */}
      <section aria-labelledby="judul-rujukan" className="mt-10">
        <h2 id="judul-rujukan" className="text-lg font-bold text-ink">
          Rujukan penting
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          {KARTU.slice(3).map((k) => (
            <Link
              key={k.href}
              href={k.href}
              className={`flex items-start gap-3 rounded-lg border p-4 transition-transform duration-200 ease-out hover:-translate-y-0.5 ${
                k.bahaya ? "border-bahaya/30 bg-bahaya-soft/50" : "border-line bg-surface"
              }`}
            >
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${
                  k.bahaya ? "bg-bahaya-soft text-bahaya" : "bg-primary-soft text-primary"
                }`}
              >
                <Ikon nama={k.ikon} ukuran={20} />
              </span>
              <span>
                <h3 className={`font-semibold ${k.bahaya ? "text-bahaya" : "text-ink"}`}>{k.judul}</h3>
                <p className="mt-0.5 text-sm text-muted">{k.isi}</p>
              </span>
            </Link>
          ))}
        </div>
      </section>
    </Container>
  );
}
