"use client";

// Hook sesi: satu sumber data pengguna login untuk semua halaman
// (ARCHITECTURE.md §5). Tamu mendapat pengguna null, tanpa error.
import { useEffect, useState } from "react";
import { supabase } from "./supabase";

export function useSesi() {
  const [status, setStatus] = useState({ memuat: true, pengguna: null, profil: null });

  useEffect(() => {
    let aktif = true;
    let langganan;

    async function muat() {
      const { data } = await supabase.auth.getSession();
      const pengguna = data.session?.user ?? null;
      let profil = null;
      if (pengguna) {
        const { data: baris } = await supabase
          .from("profiles")
          .select("id, nama_tampil")
          .eq("id", pengguna.id)
          .single();
        profil = baris ?? null;
      }
      if (aktif) setStatus({ memuat: false, pengguna, profil });

      langganan = supabase.auth.onAuthStateChange((_acara, sesi) => {
        if (aktif) {
          setStatus({ memuat: false, pengguna: sesi?.user ?? null, profil: null });
        }
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
