"use client";

// Hook sesi: satu sumber data pengguna login untuk semua halaman
// (ARCHITECTURE.md §5). Tamu mendapat pengguna null, tanpa error.
// Klien Supabase dimuat lewat import() dinamis di dalam efek: bundel
// auth (~240KB) tidak lagi menghalangi thread utama saat halaman pertama
// dibuka tamu, tapi tetap tersedia untuk halaman yang memang memakainya
// (kuis, simulasi, riwayat, peringkat, masuk) lewat import statis mereka.
import { useEffect, useState } from "react";

async function ambilProfil(supabase, uid) {
  // Poin/nama dari view publik peringkat; peran dari tabel profiles.
  // Dua query paralel: view tidak punya kolom peran, profiles tidak punya
  // total_poin (kolom itu hasil agregasi view).
  const [{ data: poin }, { data: peranRow }] = await Promise.all([
    supabase
      .from("peringkat")
      .select("id, nama_tampil, total_poin")
      .eq("id", uid)
      .single(),
    supabase.from("profiles").select("peran").eq("id", uid).single(),
  ]);
  if (!poin && !peranRow) return null;
  return {
    ...(poin ?? { id: uid, nama_tampil: null, total_poin: null }),
    peran: peranRow?.peran ?? "user",
  };
}

export function useSesi() {
  const [status, setStatus] = useState({ memuat: true, pengguna: null, profil: null });

  useEffect(() => {
    let aktif = true;
    let langganan;

    async function muat() {
      const { supabase } = await import("./supabase");
      const { data } = await supabase.auth.getSession();
      const pengguna = data.session?.user ?? null;
      const profil = pengguna ? await ambilProfil(supabase, pengguna.id) : null;
      if (aktif) setStatus({ memuat: false, pengguna, profil });

      langganan = supabase.auth.onAuthStateChange(async (_acara, sesi) => {
        if (!aktif) return;
        const pengguna = sesi?.user ?? null;
        const profil = pengguna ? await ambilProfil(supabase, pengguna.id) : null;
        if (aktif) setStatus({ memuat: false, pengguna, profil });
      }).data;
    }

    muat();
    return () => {
      aktif = false;
      langganan?.subscription?.unsubscribe();
    };
  }, []);

  return status;
}
