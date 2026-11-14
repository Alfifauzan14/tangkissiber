"use client";

// Hook sesi: satu sumber data pengguna login untuk semua halaman
// (ARCHITECTURE.md §5). Tamu mendapat pengguna null, tanpa error.
import { useEffect, useState } from "react";
import { supabase } from "./supabase";

async function ambilProfil(uid) {
  const { data } = await supabase
    .from("peringkat")
    .select("id, nama_tampil, total_poin")
    .eq("id", uid)
    .single();
  return data ?? null;
}

export function useSesi() {
  const [status, setStatus] = useState({ memuat: true, pengguna: null, profil: null });

  useEffect(() => {
    let aktif = true;
    let langganan;

    async function muat() {
      const { data } = await supabase.auth.getSession();
      const pengguna = data.session?.user ?? null;
      const profil = pengguna ? await ambilProfil(pengguna.id) : null;
      if (aktif) setStatus({ memuat: false, pengguna, profil });

      langganan = supabase.auth.onAuthStateChange(async (_acara, sesi) => {
        if (!aktif) return;
        const pengguna = sesi?.user ?? null;
        const profil = pengguna ? await ambilProfil(pengguna.id) : null;
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
