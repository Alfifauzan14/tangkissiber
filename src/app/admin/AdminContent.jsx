"use client";

// Konten Halaman Admin (Post-v1.0 #4)
// Statistik ringkas + tabel user + aksi admin
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Container from "@/components/layout/Container";
import Badge from "@/components/ui/Badge";
import Ikon from "@/components/ui/Ikon";
import { KeadaanMemuat, KeadaanKosong } from "@/components/ui/Keadaan";

const WARNA_PERAN = { user: "primary", admin: "bahaya" };
const LABEL_PERAN = { user: "Pengguna", admin: "Admin" };

export default function AdminContent({ user, profil }) {
  const [statistik, setStatistik] = useState(null);
  const [users, setUsers] = useState([]);
  const [memuat, setMemuat] = useState(true);
  const [galat, setGalat] = useState(null);

  useEffect(() => {
    async function ambilData() {
      try {
        setMemuat(true);
        
        // Statistik agregat
        const [{ count: totalUser }, { count: totalKuis }, { count: totalSimulasi }] = await Promise.all([
          supabase.from("profiles").select("*", { count: "exact", head: true }),
          supabase.from("kuis_hasil").select("*", { count: "exact", head: true }),
          supabase.from("simulasi_hasil").select("*", { count: "exact", head: true }),
        ]);

        setStatistik({ totalUser: totalUser ?? 0, totalKuis: totalKuis ?? 0, totalSimulasi: totalSimulasi ?? 0 });

        // Daftar user dengan peran
        const { data: profilData, error: profilError } = await supabase
          .from("profiles")
          .select("id, nama_tampil, peran, created_at")
          .order("created_at", { ascending: false });

        if (profilError) throw profilError;

        // Tambah skor tertinggi per user
        const usersDenganSkor = await Promise.all(
          (profilData || []).map(async (p) => {
            const [{ data: kuisMax }, { data: simuMax }] = await Promise.all([
              supabase.from("kuis_hasil").select("skor").eq("user_id", p.id).order("skor", { ascending: false }).limit(1),
              supabase.from("simulasi_hasil").select("skor, skenario_id").eq("user_id", p.id).order("skor", { ascending: false }),
            ]);
            
            // Hitung total poin seperti view peringkat
            const kuisBest = kuisMax?.[0]?.skor ?? 0;
            const simuBest = simuMax?.reduce((acc, s) => {
              if (!acc[s.skenario_id] || s.skor > acc[s.skenario_id]) acc[s.skenario_id] = s.skor;
              return acc;
            }, {}) ?? {};
            const simuTotal = Object.values(simuBest).reduce((a, b) => a + b, 0);

            return { ...p, total_poin: kuisBest + simuTotal, kuis_terbaik: kuisBest, simulasi_terbaik: simuTotal };
          })
        );

        setUsers(usersDenganSkor);
      } catch (e) {
        console.error("Gagal ambil data admin:", e);
        setGalat("Gagal memuat data admin");
      } finally {
        setMemuat(false);
      }
    }
    ambilData();
  }, []);

  async function ubahPeran(userId, peranBaru) {
    const { error } = await supabase.from("profiles").update({ peran: peranBaru }).eq("id", userId);
    if (error) {
      alert("Gagal mengubah peran: " + error.message);
      return;
    }
    setUsers(users.map((u) => (u.id === userId ? { ...u, peran: peranBaru } : u)));
  }

  if (memuat) return <KeadaanMemuat />;
  if (galat) return <KeadaanKosong ikon="error" judul={galat} deskripsi="Coba refresh halaman" />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink md:text-3xl">Panel Admin</h1>
          <p className="mt-1 text-sm text-muted">Kelola pengguna dan lihat statistik platform</p>
        </div>
        <Badge warna="bahaya" ikon="admin_panel_settings">
          Admin: {profil.nama_tampil}
        </Badge>
      </header>

      {/* Kartu Statistik */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatistikCard ikon="group" label="Total Pengguna" nilai={statistik.totalUser} warna="primary" />
        <StatistikCard ikon="quiz" label="Total Kuis Diselesaikan" nilai={statistik.totalKuis} warna="aman" />
        <StatistikCard ikon="chat" label="Total Simulasi Diselesaikan" nilai={statistik.totalSimulasi} warna="waspada" />
      </div>

      {/* Tabel Pengguna */}
      <section>
        <h2 className="text-lg font-semibold text-ink">Daftar Pengguna</h2>
        <div className="mt-3 rounded-lg border border-line bg-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-primary-soft/50 border-b border-line text-left text-xs font-semibold text-muted uppercase tracking-wider">
                  <th className="px-4 py-3">Nama</th>
                  <th className="px-4 py-3 hidden md:table-cell">Peran</th>
                  <th className="px-4 py-3 hidden lg:table-cell">Total Poin</th>
                  <th className="px-4 py-3 hidden lg:table-cell">Kuis Terbaik</th>
                  <th className="px-4 py-3 hidden lg:table-cell">Simulasi Terbaik</th>
                  <th className="px-4 py-3 hidden lg:table-cell">Bergabung</th>
                  <th className="px-4 py-3">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-muted">
                      <KeadaanKosong ikon="group_off" judul="Belum ada pengguna" deskripsi="Pengguna akan muncul setelah mendaftar" />
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id} className="border-b border-line/50 last:border-0 hover:bg-primary-soft/30">
                      <td className="px-4 py-3 font-medium text-ink">{u.nama_tampil}</td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <Badge warna={WARNA_PERAN[u.peran]}>{LABEL_PERAN[u.peran]}</Badge>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell text-muted">{u.total_poin}</td>
                      <td className="px-4 py-3 hidden lg:table-cell text-muted">{u.kuis_terbaik}</td>
                      <td className="px-4 py-3 hidden lg:table-cell text-muted">{u.simulasi_terbaik}</td>
                      <td className="px-4 py-3 hidden lg:table-cell text-muted">
                        {new Date(u.created_at).toLocaleDateString("id-ID")}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={u.peran}
                          onChange={(e) => ubahPeran(u.id, e.target.value)}
                          className="min-w-[140px] rounded-md border border-line bg-surface px-2 py-1.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent"
                          disabled={u.id === user.id} // Admin tidak bisa ganti peran diri sendiri
                        >
                          <option value="user">Pengguna</option>
                          <option value="admin">Admin</option>
                        </select>
                        {u.id === user.id && <span className="ml-2 text-xs text-muted">(Anda)</span>}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}

function StatistikCard({ ikon, label, nilai, warna }) {
  return (
    <div className="rounded-lg border border-line bg-surface p-4 shadow-[var(--shadow-card)] transition-shadow duration-200 hover:shadow-[var(--shadow-card-hover)]">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary">
          <Ikon nama={ikon} ukuran={22} />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-muted">{label}</p>
          <p className="angka text-2xl font-bold text-ink">{nilai.toLocaleString("id-ID")}</p>
        </div>
      </div>
      <div className="mt-2 h-1.5 w-full rounded-full bg-primary-soft">
        <div className="h-full rounded-full bg-primary" style={{ width: "60%" }} />
      </div>
    </div>
  );
}