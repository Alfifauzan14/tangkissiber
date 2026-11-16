import Container from "@/components/layout/Container";
import PageBanner from "@/components/layout/PageBanner";

export const metadata = {
  title: "Kebijakan Privasi | TangkisSiber",
  description:
    "Penjelasan lengkap mengenai pengumpulan, penggunaan, penyimpanan, dan perlindungan data pengguna di platform edukasi TangkisSiber.",
};

const BAGIAN = [
  {
    judul: "1. Informasi yang Kami Kumpulkan",
    isi: [
      "TangkisSiber dapat digunakan secara gratis tanpa wajib login. Jika Anda memilih masuk menggunakan akun Google (Google OAuth melalui Supabase Auth) atau email, kami hanya menerima data dasar profil berupa nama tampilan, alamat email, dan foto profil (jika tersedia).",
      "Selama Anda menggunakan fitur latihan, kami mencatat skor kuis, progres simulasi percakapan, serta riwayat pencapaian Anda agar dapat ditampilkan kembali di halaman Riwayat dan Peringkat.",
      "Untuk fitur Cek Pesan, teks pesan yang Anda kirimkan dianalisis secara langsung menggunakan model AI untuk mendeteksi indikasi penipuan digital. Kami tidak meminta data sensitif seperti kata sandi, PIN, atau kode OTP Anda.",
    ],
  },
  {
    judul: "2. Cara Kami Menggunakan Data",
    isi: [
      "Data profil (nama dan email) digunakan semata-mata untuk mengidentifikasi akun Anda, menyimpan progres latihan, dan menampilkan nama tampilan pada papan peringkat.",
      "Skor kuis dan simulasi digunakan untuk memberikan umpan balik belajar serta menyusun statistik kesiapsiagaan Anda di halaman Riwayat.",
      "TangkisSiber tidak menjual, menyewakan, atau membagikan data pribadi Anda kepada pihak ketiga untuk keperluan iklan maupun pemasaran.",
    ],
  },
  {
    judul: "3. Penyimpanan dan Keamanan Data",
    isi: [
      "Autentikasi dan penyimpanan data akun dikelola melalui layanan Supabase dengan perlindungan Row Level Security (RLS), sehingga setiap pengguna hanya dapat mengakses dan memperbarui data miliknya sendiri.",
      "Seluruh komunikasi antara peramban Anda, server aplikasi di Vercel, dan basis data dienkripsi menggunakan protokol HTTPS/TLS.",
    ],
  },
  {
    judul: "4. Hak Pengguna dan Penghapusan Data",
    isi: [
      "Anda dapat keluar (logout) kapan saja dari menu akun, serta mencabut akses Google OAuth untuk TangkisSiber melalui halaman pengaturan Keamanan Akun Google Anda.",
      "Jika Anda ingin meminta penghapusan akun beserta seluruh riwayat skor yang tersimpan, silakan hubungi pengelola melalui email kontak yang tertera di bawah ini.",
    ],
  },
  {
    judul: "5. Kontak Pengelola",
    isi: [
      "Apabila Anda memiliki pertanyaan mengenai Kebijakan Privasi ini atau pengelolaan data di TangkisSiber, silakan hubungi pengelola melalui alamat email: alfifauzan897@gmail.com.",
    ],
  },
];

export default function PrivasiPage() {
  return (
    <>
      <PageBanner
        eyebrow="Legal & Privasi"
        judul="Kebijakan Privasi TangkisSiber"
        deskripsi="Komitmen kami dalam melindungi data pribadi dan privasi Anda saat belajar menangkis penipuan digital."
      />

      <section className="py-10 lg:py-14">
        <Container className="max-w-3xl">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <p className="text-xs font-medium text-slate-500">
              Terakhir diperbarui: 16 November 2026
            </p>
            <p className="mt-3 text-sm leading-relaxed text-slate-700">
              Kebijakan Privasi ini menjelaskan bagaimana platform edukasi{" "}
              <strong>TangkisSiber</strong> (https://tangkissiber.vercel.app)
              mengumpulkan, menggunakan, dan melindungi informasi Anda.
            </p>

            <div className="mt-8 space-y-6">
              {BAGIAN.map((bagian) => (
                <div key={bagian.judul} className="space-y-2.5">
                  <h2 className="text-base font-bold text-slate-900">
                    {bagian.judul}
                  </h2>
                  {bagian.isi.map((paragraf, idx) => (
                    <p
                      key={idx}
                      className="text-sm leading-relaxed text-slate-700"
                    >
                      {paragraf}
                    </p>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
