"use client";

// Halaman Masuk Khusus Admin (/admin/masuk) — terpisah dari halaman masuk pengguna publik.
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Container from "@/components/layout/Container";
import Tombol from "@/components/ui/Tombol";
import Ikon from "@/components/ui/Ikon";

export default function HalamanMasukAdmin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [sandi, setSandi] = useState("");
  const [lihatSandi, setLihatSandi] = useState(false);
  const [galat, setGalat] = useState(null);
  const [proses, setProses] = useState(false);

  async function kirim(e) {
    e.preventDefault();
    if (proses) return;
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setGalat("Format email tidak valid.");
      return;
    }
    if (sandi.length < 6) {
      setGalat("Kata sandi minimal 6 karakter.");
      return;
    }

    setProses(true);
    setGalat(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: sandi,
    });

    if (error) {
      setGalat(
        error.message === "Invalid login credentials"
          ? "Email atau kata sandi salah."
          : "Gagal masuk. Periksa koneksi Anda."
      );
      setProses(false);
      return;
    }

    const { data: profil } = await supabase
      .from("profiles")
      .select("peran")
      .eq("id", data.user.id)
      .single();

    if (profil?.peran !== "admin") {
      await supabase.auth.signOut();
      setGalat("Akun ini tidak memiliki hak akses admin.");
      setProses(false);
      return;
    }

    router.replace("/admin");
    router.refresh();
  }

  return (
    <div className="flex min-h-dvh flex-col bg-bg">
      <header className="border-b border-line bg-surface">
        <Container className="flex h-14 max-w-[1120px] items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-ink">
              Tangkis<span className="text-primary">Siber</span>
            </span>
            <span className="rounded-sm bg-primary-soft px-2 py-0.5 text-xs font-semibold text-primary">
              Admin
            </span>
          </div>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-muted transition-colors duration-150 hover:text-primary"
          >
            <Ikon nama="open_in_new" ukuran={16} />
            Lihat Situs
          </Link>
        </Container>
      </header>

      <main className="flex flex-1 items-center justify-center px-5 py-10">
        <div className="w-full max-w-[420px] rounded-xl border border-line bg-surface p-6 shadow-[var(--shadow-card)] md:p-8">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-primary text-white">
            <Ikon nama="admin_panel_settings" ukuran={24} />
          </div>
          <h1 className="text-center text-2xl font-bold text-ink">Panel Admin</h1>
          <p className="mt-1.5 text-center text-sm text-muted">
            Masuk menggunakan akun administrator untuk mengelola pengguna dan konten.
          </p>

          <form onSubmit={kirim} className="mt-6 flex flex-col gap-4" noValidate>
            <div>
              <label htmlFor="admin-email" className="mb-1.5 block text-sm font-semibold text-ink">
                Email Admin
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">
                  <Ikon nama="mail" ukuran={18} />
                </span>
                <input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@domain.com"
                  autoComplete="email"
                  className="h-12 w-full rounded-md border border-line bg-surface pl-10 pr-3 text-sm text-ink outline-none transition-colors duration-150 placeholder:text-muted/70 focus:border-accent focus:ring-2 focus:ring-accent/30"
                />
              </div>
            </div>

            <div>
              <label htmlFor="admin-sandi" className="mb-1.5 block text-sm font-semibold text-ink">
                Kata sandi
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">
                  <Ikon nama="lock" ukuran={18} />
                </span>
                <input
                  id="admin-sandi"
                  type={lihatSandi ? "text" : "password"}
                  value={sandi}
                  onChange={(e) => setSandi(e.target.value)}
                  placeholder="Masukkan kata sandi"
                  autoComplete="current-password"
                  className="h-12 w-full rounded-md border border-line bg-surface pl-10 pr-11 text-sm text-ink outline-none transition-colors duration-150 placeholder:text-muted/70 focus:border-accent focus:ring-2 focus:ring-accent/30"
                />
                <button
                  type="button"
                  onClick={() => setLihatSandi((v) => !v)}
                  aria-label={lihatSandi ? "Sembunyikan kata sandi" : "Lihat kata sandi"}
                  className="absolute right-1 top-1 flex h-10 w-10 items-center justify-center rounded-md text-muted transition-colors duration-150 hover:text-primary"
                >
                  <Ikon nama={lihatSandi ? "visibility_off" : "visibility"} ukuran={20} />
                </button>
              </div>
            </div>

            {galat ? (
              <p role="alert" className="rounded-md bg-bahaya-soft px-3 py-2 text-sm text-bahaya">
                {galat}
              </p>
            ) : null}

            <Tombol gaya="primary" type="submit" disabled={proses} className="mt-1 w-full">
              {proses ? "Memverifikasi..." : "Masuk ke Panel Admin"}
            </Tombol>
          </form>
        </div>
      </main>
    </div>
  );
}
