"use client";

// Konten Halaman Admin (Post-v1.0 #4 + CRUD lanjutan)
// Statistik ringkas + tabel user (ubah peran, ubah nama) + panel riwayat
// per user (hapus baris kuis/simulasi, badge "Kemungkinan AI").
// Butuh RLS policy admin CRUD: jalankan supabase/migration-admin-crud.sql.
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { KONTEN_DEFAULT } from "@/lib/konten";
import Badge from "@/components/ui/Badge";
import Ikon from "@/components/ui/Ikon";
import { KeadaanMemuat, KeadaanKosong } from "@/components/ui/Keadaan";
import KontenEditor from "./KontenEditor";

const WARNA_PERAN = { user: "primary", admin: "bahaya" };
const LABEL_PERAN = { user: "Pengguna", admin: "Admin" };

const GRUP_MENU = [
  {
    judul: "Overview",
    item: [{ id: "ringkasan", label: "Ringkasan", ikon: "leaderboard" }],
  },
  {
    judul: "Manajemen",
    item: [{ id: "pengguna", label: "Pengguna & Riwayat", ikon: "group" }],
  },
  {
    judul: "Konten Aplikasi",
    item: [
      { id: "konten-modus", label: "Pustaka Modus", ikon: "menu_book", kunci: "modus" },
      { id: "konten-soal", label: "Bank Soal Kuis", ikon: "quiz", kunci: "soal" },
      { id: "konten-skenario", label: "Skenario Simulasi", ikon: "forum", kunci: "skenario" },
      { id: "konten-darurat", label: "Panduan Darurat", ikon: "sos", kunci: "darurat" },
      { id: "konten-aturan", label: "Aturan Cek Pesan", ikon: "content_paste_search", kunci: "aturan-cek" },
    ],
  },
];

const SEMUA_MENU = GRUP_MENU.flatMap((g) => g.item.map((it) => ({ ...it, grup: g.judul })));

export default function AdminContent({ user, profil }) {
  const router = useRouter();
  const [menuAktif, setMenuAktif] = useState("ringkasan");
  const [sidebarBuka, setSidebarBuka] = useState(false);
  const [cariUser, setCariUser] = useState("");
  const [filterPeran, setFilterPeran] = useState("semua");
  const [statistik, setStatistik] = useState(null);
  const [users, setUsers] = useState([]);
  const [memuat, setMemuat] = useState(true);
  const [galat, setGalat] = useState(null);

  // Edit nama tampil
  const [editNamaId, setEditNamaId] = useState(null);
  const [namaBaru, setNamaBaru] = useState("");

  // Panel riwayat per user
  const [riwayatId, setRiwayatId] = useState(null);
  const [riwayat, setRiwayat] = useState({ kuis: [], simulasi: [] });
  const [memuatRiwayat, setMemuatRiwayat] = useState(false);
  const [pesan, setPesan] = useState(null);

  async function muatUlang() {
    try {
      setMemuat(true);
      const [{ count: totalUser }, { count: totalKuis }, { count: totalSimulasi }] =
        await Promise.all([
          supabase.from("profiles").select("*", { count: "exact", head: true }),
          supabase.from("kuis_hasil").select("*", { count: "exact", head: true }),
          supabase.from("simulasi_hasil").select("*", { count: "exact", head: true }),
        ]);
      setStatistik({
        totalUser: totalUser ?? 0,
        totalKuis: totalKuis ?? 0,
        totalSimulasi: totalSimulasi ?? 0,
      });

      const { data: profilData, error: profilError } = await supabase
        .from("profiles")
        .select("id, nama_tampil, peran, created_at")
        .order("created_at", { ascending: false });
      if (profilError) throw profilError;

      // Satu query per tabel lalu pasangkan di klien (tanpa N+1)
      const [{ data: semuaKuis }, { data: semuaSimulasi }] = await Promise.all([
        supabase.from("kuis_hasil").select("user_id, skor"),
        supabase.from("simulasi_hasil").select("user_id, skenario_id, skor"),
      ]);

      const usersDenganSkor = (profilData || []).map((p) => {
        const kuisUser = (semuaKuis || []).filter((k) => k.user_id === p.id);
        const simuUser = (semuaSimulasi || []).filter((s) => s.user_id === p.id);
        const kuisTerbaik = kuisUser.length ? Math.max(...kuisUser.map((k) => k.skor)) : 0;
        const simuTerbaik = {};
        for (const s of simuUser) {
          if (!simuTerbaik[s.skenario_id] || s.skor > simuTerbaik[s.skenario_id]) {
            simuTerbaik[s.skenario_id] = s.skor;
          }
        }
        const simuTotal = Object.values(simuTerbaik).reduce((a, b) => a + b, 0);
        return {
          ...p,
          total_poin: kuisTerbaik + simuTotal,
          kuis_terbaik: kuisTerbaik,
          simulasi_terbaik: simuTotal,
        };
      });

      setUsers(usersDenganSkor);
    } catch (e) {
      console.error("Gagal ambil data admin:", e);
      setGalat("Gagal memuat data admin");
    } finally {
      setMemuat(false);
    }
  }

  useEffect(() => {
    muatUlang();
  }, []);

  function tampilPesan(teks, baik = true) {
    setPesan({ teks, baik });
    setTimeout(() => setPesan(null), 4000);
  }

  async function ubahPeran(userId, peranBaru) {
    const { error } = await supabase.from("profiles").update({ peran: peranBaru }).eq("id", userId);
    if (error) {
      tampilPesan("Gagal mengubah peran: " + error.message, false);
      return;
    }
    setUsers(users.map((u) => (u.id === userId ? { ...u, peran: peranBaru } : u)));
    tampilPesan("Peran diubah.");
  }

  function mulaiEditNama(u) {
    setEditNamaId(u.id);
    setNamaBaru(u.nama_tampil || "");
  }

  async function simpanNama(userId) {
    const bersih = namaBaru.trim();
    if (bersih.length < 2) {
      tampilPesan("Nama tampil minimal 2 huruf.", false);
      return;
    }
    const { error } = await supabase
      .from("profiles")
      .update({ nama_tampil: bersih })
      .eq("id", userId);
    if (error) {
      tampilPesan("Gagal mengubah nama: " + error.message, false);
      return;
    }
    setUsers(users.map((u) => (u.id === userId ? { ...u, nama_tampil: bersih } : u)));
    setEditNamaId(null);
    tampilPesan("Nama diubah.");
  }

  async function bukaRiwayat(userId) {
    if (riwayatId === userId) {
      setRiwayatId(null);
      return;
    }
    setRiwayatId(userId);
    setMemuatRiwayat(true);
    setRiwayat({ kuis: [], simulasi: [] });
    const [{ data: kuis, error: e1 }, { data: simulasi, error: e2 }] = await Promise.all([
      supabase
        .from("kuis_hasil")
        .select("id, skor, ai_curiga, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
      supabase
        .from("simulasi_hasil")
        .select("id, skenario_id, skor, ai_curiga, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
    ]);
    if (e1 || e2) {
      tampilPesan("Gagal memuat riwayat. Pastikan migration-admin-crud.sql sudah dijalankan.", false);
      setRiwayatId(null);
    } else {
      setRiwayat({ kuis: kuis || [], simulasi: simulasi || [] });
    }
    setMemuatRiwayat(false);
  }

  async function hapusHasil(jenis, id) {
    if (!confirm("Hapus hasil ini?")) return;
    const tabel = jenis === "kuis" ? "kuis_hasil" : "simulasi_hasil";
    const { error } = await supabase.from(tabel).delete().eq("id", id);
    if (error) {
      tampilPesan("Gagal menghapus: " + error.message, false);
      return;
    }
    setRiwayat((r) => ({
      ...r,
      [jenis]: r[jenis].filter((x) => x.id !== id),
    }));
    tampilPesan("Hasil dihapus.");
    muatUlang();
  }

  async function hapusSemuaRiwayat(userId) {
    if (!confirm("Hapus SEMUA riwayat kuis dan simulasi pengguna ini?")) return;
    const [{ error: e1 }, { error: e2 }] = await Promise.all([
      supabase.from("kuis_hasil").delete().eq("user_id", userId),
      supabase.from("simulasi_hasil").delete().eq("user_id", userId),
    ]);
    if (e1 || e2) {
      tampilPesan("Gagal menghapus riwayat.", false);
      return;
    }
    setRiwayat({ kuis: [], simulasi: [] });
    tampilPesan("Semua riwayat dihapus.");
    muatUlang();
  }

  async function keluarAdmin() {
    await supabase.auth.signOut();
    router.replace("/admin/masuk");
    router.refresh();
  }

  const infoMenu = SEMUA_MENU.find((m) => m.id === menuAktif) || SEMUA_MENU[0];
  const usersTersaring = users.filter((u) => {
    if (filterPeran !== "semua" && u.peran !== filterPeran) return false;
    const q = cariUser.trim().toLowerCase();
    if (!q) return true;
    return (
      (u.nama_tampil || "").toLowerCase().includes(q) ||
      (u.peran || "").toLowerCase().includes(q)
    );
  });
  const topUsers = [...users].sort((a, b) => b.total_poin - a.total_poin).slice(0, 5);

  function pilihMenu(id) {
    setMenuAktif(id);
    setSidebarBuka(false);
  }

  return (
    <div className="flex min-h-dvh bg-bg">
      {/* Sidebar Desktop + Slide-over Mobile */}
      <AdminSidebar
        nama={profil.nama_tampil}
        menuAktif={menuAktif}
        onPilih={pilihMenu}
        terbuka={sidebarBuka}
        onTutup={() => setSidebarBuka(false)}
        onKeluar={keluarAdmin}
      />

      {/* Area Utama: Topbar Utilitas + Konten Terpisah */}
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader
          infoMenu={infoMenu}
          nama={profil.nama_tampil}
          onBukaSidebar={() => setSidebarBuka(true)}
          onRefresh={muatUlang}
          memuat={memuat}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-[1200px] space-y-6">
            {pesan ? (
              <p
                role="status"
                className={`rounded-xl border px-4 py-2.5 text-sm font-medium ${
                  pesan.baik
                    ? "border-aman/30 bg-aman-soft text-aman"
                    : "border-bahaya/30 bg-bahaya-soft text-bahaya"
                }`}
              >
                {pesan.teks}
              </p>
            ) : null}

            {memuat ? (
              <div className="py-10">
                <KeadaanMemuat />
              </div>
            ) : galat ? (
              <KeadaanKosong ikon="error" judul={galat} deskripsi="Coba muat ulang halaman" />
            ) : menuAktif === "ringkasan" ? (
              <div className="space-y-6">
                {/* 4 Kartu KPI */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <StatistikCard ikon="group" label="Total Pengguna" nilai={statistik.totalUser} warna="primary" />
                  <StatistikCard ikon="quiz" label="Kuis Diselesaikan" nilai={statistik.totalKuis} warna="aman" />
                  <StatistikCard ikon="chat" label="Simulasi Diselesaikan" nilai={statistik.totalSimulasi} warna="waspada" />
                  <StatistikCard
                    ikon="menu_book"
                    label="Artikel Pustaka"
                    nilai={Array.isArray(KONTEN_DEFAULT.modus) ? KONTEN_DEFAULT.modus.length : 0}
                    warna="primary"
                  />
                </div>

                {/* Grid Ringkasan 2 Kolom */}
                <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-12">
                  {/* Pengguna Poin Tertinggi */}
                  <section className="rounded-2xl border border-line bg-surface p-5 shadow-[var(--shadow-card)] lg:col-span-7">
                    <div className="flex items-center justify-between gap-3 border-b border-line pb-3">
                      <h2 className="text-sm font-bold text-ink">Pengguna Teratas</h2>
                      <button
                        type="button"
                        onClick={() => pilihMenu("pengguna")}
                        className="text-xs font-bold text-primary hover:underline"
                      >
                        Lihat Semua →
                      </button>
                    </div>
                    {topUsers.length === 0 ? (
                      <p className="py-6 text-center text-sm text-muted">Belum ada pengguna terdaftar.</p>
                    ) : (
                      <ul className="divide-y divide-line">
                        {topUsers.map((u, idx) => (
                          <li key={u.id} className="flex items-center gap-3 py-3">
                            <span className="angka flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-soft text-xs font-bold text-primary">
                              {idx + 1}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold text-ink">{u.nama_tampil}</p>
                              <p className="text-xs text-muted">
                                Kuis {u.kuis_terbaik} • Simulasi {u.simulasi_terbaik}
                              </p>
                            </div>
                            <Badge warna={WARNA_PERAN[u.peran] || "primary"}>
                              {LABEL_PERAN[u.peran] || u.peran}
                            </Badge>
                            <span className="angka rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-primary">
                              {u.total_poin} poin
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </section>

                  {/* Pintasan Modul Konten */}
                  <section className="rounded-2xl border border-line bg-surface p-5 shadow-[var(--shadow-card)] lg:col-span-5">
                    <div className="border-b border-line pb-3">
                      <h2 className="text-sm font-bold text-ink">Kelola Konten</h2>
                    </div>
                    <ul className="divide-y divide-line">
                      {GRUP_MENU[2].item.map((item) => (
                        <li key={item.id}>
                          <button
                            type="button"
                            onClick={() => pilihMenu(item.id)}
                            className="flex w-full items-center gap-3 py-2.5 text-left transition-colors hover:text-primary"
                          >
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
                              <Ikon nama={item.ikon} ukuran={17} />
                            </span>
                            <span className="flex-1 text-sm font-semibold text-ink">{item.label}</span>
                            <span className="text-xs font-bold text-primary">Edit →</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </section>
                </div>
              </div>
            ) : infoMenu.kunci ? (
              <KontenEditor tampilPesan={tampilPesan} kunciAktif={infoMenu.kunci} />
            ) : (
              <>
                {/* Daftar Pengguna: bilah pencarian penuh + filter peran + tabel */}
                <section className="space-y-4">
                  <div className="flex flex-col gap-2.5 rounded-2xl border border-line bg-surface p-3.5 shadow-[var(--shadow-card)] lg:flex-row lg:items-center">
                    <input
                      type="search"
                      value={cariUser}
                      onChange={(e) => setCariUser(e.target.value)}
                      placeholder="Cari nama atau peran..."
                      aria-label="Cari pengguna"
                      className="h-11 w-full flex-1 rounded-xl border border-line bg-bg px-4 text-sm text-ink outline-none focus:border-accent"
                    />
                    <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filter peran">
                      {[
                        { id: "semua", label: `Semua (${users.length})` },
                        { id: "user", label: "Pengguna" },
                        { id: "admin", label: "Admin" },
                      ].map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setFilterPeran(p.id)}
                          aria-pressed={filterPeran === p.id}
                          className={`h-10 rounded-xl px-3.5 text-xs font-semibold transition-colors ${
                            filterPeran === p.id
                              ? "bg-primary text-white"
                              : "border border-line bg-bg text-muted hover:text-ink"
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

        {/* Mobile Card View (< md) */}
        <div className="space-y-3 md:hidden">
          {usersTersaring.length === 0 ? (
            <div className="rounded-lg border border-line bg-surface p-6 text-center text-muted">
              <KeadaanKosong ikon="group_off" judul="Tidak ada pengguna" deskripsi="Coba ubah kata kunci pencarian" />
            </div>
          ) : (
            usersTersaring.map((u) => (
              <article key={u.id} className="rounded-lg border border-line bg-surface p-4 shadow-[var(--shadow-card)]">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    {editNamaId === u.id ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          value={namaBaru}
                          onChange={(e) => setNamaBaru(e.target.value)}
                          maxLength={40}
                          className="h-10 min-w-0 flex-1 rounded-md border border-line bg-surface px-2.5 text-sm text-ink focus:border-accent focus:ring-2 focus:ring-accent/30"
                          aria-label="Nama tampil baru"
                        />
                        <button
                          type="button"
                          onClick={() => simpanNama(u.id)}
                          aria-label="Simpan nama"
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-aman hover:bg-aman-soft"
                        >
                          <Ikon nama="check" ukuran={18} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditNamaId(null)}
                          aria-label="Batal ubah nama"
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-muted hover:bg-primary-soft"
                        >
                          <Ikon nama="close" ukuran={18} />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => mulaiEditNama(u)}
                        className="flex min-h-11 items-center gap-1.5 text-left font-semibold text-ink hover:text-primary"
                        aria-label={`Ubah nama tampil ${u.nama_tampil}`}
                      >
                        <span className="truncate">{u.nama_tampil}</span>
                        <Ikon nama="edit" ukuran={14} className="shrink-0 text-muted" />
                      </button>
                    )}
                    <p className="text-xs text-muted">
                      Bergabung {new Date(u.created_at).toLocaleDateString("id-ID")}
                      {u.id === user.id ? " • (Anda)" : ""}
                    </p>
                  </div>
                  <Badge warna={WARNA_PERAN[u.peran]}>{LABEL_PERAN[u.peran]}</Badge>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2 rounded-md bg-bg p-2.5 text-center">
                  <div>
                    <p className="text-[11px] text-muted">Total Poin</p>
                    <p className="angka text-sm font-bold text-primary">{u.total_poin}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-muted">Kuis</p>
                    <p className="angka text-sm font-semibold text-ink">{u.kuis_terbaik}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-muted">Simulasi</p>
                    <p className="angka text-sm font-semibold text-ink">{u.simulasi_terbaik}</p>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <select
                    value={u.peran}
                    onChange={(e) => ubahPeran(u.id, e.target.value)}
                    aria-label={`Peran ${u.nama_tampil}`}
                    className="min-h-11 flex-1 rounded-md border border-line bg-surface px-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent"
                    disabled={u.id === user.id}
                  >
                    <option value="user">Pengguna</option>
                    <option value="admin">Admin</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => bukaRiwayat(u.id)}
                    aria-expanded={riwayatId === u.id}
                    className="flex min-h-11 items-center gap-1.5 rounded-md border border-line px-3.5 text-xs font-semibold text-primary transition-colors duration-150 hover:bg-primary-soft"
                  >
                    <Ikon nama="history" ukuran={16} />
                    Riwayat
                  </button>
                </div>
              </article>
            ))
          )}
        </div>

        {/* Desktop Table View (md+) */}
        <div className="mt-3 hidden overflow-hidden rounded-lg border border-line bg-surface md:block">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line bg-primary-soft/50 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                  <th className="px-4 py-3">Nama</th>
                  <th className="px-4 py-3">Peran</th>
                  <th className="px-4 py-3">Total Poin</th>
                  <th className="px-4 py-3">Kuis Terbaik</th>
                  <th className="px-4 py-3">Simulasi Terbaik</th>
                  <th className="px-4 py-3">Bergabung</th>
                  <th className="px-4 py-3">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {usersTersaring.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-muted">
                      <KeadaanKosong ikon="group_off" judul="Tidak ada pengguna" deskripsi="Coba ubah kata kunci pencarian" />
                    </td>
                  </tr>
                ) : (
                  usersTersaring.map((u) => (
                    <tr key={u.id} className="border-b border-line/50 last:border-0 hover:bg-primary-soft/30">
                      <td className="px-4 py-3 font-medium text-ink">
                        {editNamaId === u.id ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              value={namaBaru}
                              onChange={(e) => setNamaBaru(e.target.value)}
                              maxLength={40}
                              className="h-9 w-40 rounded-md border border-line bg-surface px-2 text-sm text-ink focus:border-accent focus:ring-2 focus:ring-accent/30"
                              aria-label="Nama tampil baru"
                            />
                            <button
                              type="button"
                              onClick={() => simpanNama(u.id)}
                              aria-label="Simpan nama"
                              className="flex h-9 w-9 items-center justify-center rounded-md text-aman hover:bg-aman-soft"
                            >
                              <Ikon nama="check" ukuran={18} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditNamaId(null)}
                              aria-label="Batal ubah nama"
                              className="flex h-9 w-9 items-center justify-center rounded-md text-muted hover:bg-primary-soft"
                            >
                              <Ikon nama="close" ukuran={18} />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => mulaiEditNama(u)}
                            className="flex min-h-11 items-center gap-1.5 text-left font-medium text-ink hover:text-primary"
                            aria-label={`Ubah nama tampil ${u.nama_tampil}`}
                          >
                            {u.nama_tampil}
                            <Ikon nama="edit" ukuran={14} className="text-muted" />
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Badge warna={WARNA_PERAN[u.peran]}>{LABEL_PERAN[u.peran]}</Badge>
                      </td>
                      <td className="angka px-4 py-3 text-muted">{u.total_poin}</td>
                      <td className="angka px-4 py-3 text-muted">{u.kuis_terbaik}</td>
                      <td className="angka px-4 py-3 text-muted">{u.simulasi_terbaik}</td>
                      <td className="px-4 py-3 text-muted">
                        {new Date(u.created_at).toLocaleDateString("id-ID")}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <select
                            value={u.peran}
                            onChange={(e) => ubahPeran(u.id, e.target.value)}
                            className="min-w-[120px] rounded-md border border-line bg-surface px-2 py-1.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent"
                            disabled={u.id === user.id}
                          >
                            <option value="user">Pengguna</option>
                            <option value="admin">Admin</option>
                          </select>
                          <button
                            type="button"
                            onClick={() => bukaRiwayat(u.id)}
                            aria-expanded={riwayatId === u.id}
                            className="flex min-h-9 items-center gap-1 rounded-md border border-line px-2.5 text-xs font-semibold text-primary transition-colors duration-150 hover:bg-primary-soft"
                          >
                            <Ikon nama="history" ukuran={16} />
                            Riwayat
                          </button>
                          {u.id === user.id ? (
                            <span className="text-xs text-muted">(Anda)</span>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Panel riwayat per user */}
      {riwayatId ? (
        <section aria-label="Riwayat pengguna" className="rounded-lg border border-line bg-surface p-4 md:p-6">
          {memuatRiwayat ? (
            <KeadaanMemuat />
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg font-semibold text-ink">
                  Riwayat: {users.find((u) => u.id === riwayatId)?.nama_tampil || "Pengguna"}
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => hapusSemuaRiwayat(riwayatId)}
                    className="flex min-h-9 items-center gap-1.5 rounded-md border border-bahaya/40 px-3 text-xs font-semibold text-bahaya transition-colors duration-150 hover:bg-bahaya-soft"
                  >
                    <Ikon nama="delete_sweep" ukuran={16} />
                    Hapus semua riwayat
                  </button>
                  <button
                    type="button"
                    onClick={() => setRiwayatId(null)}
                    aria-label="Tutup panel riwayat"
                    className="flex h-9 w-9 items-center justify-center rounded-md text-muted hover:bg-primary-soft"
                  >
                    <Ikon nama="close" ukuran={18} />
                  </button>
                </div>
              </div>

              <RiwayatBagian
                judul="Kuis"
                kosong="Belum ada hasil kuis"
                baris={riwayat.kuis}
                kolom={(x) => `Skor ${x.skor}`}
                onHapus={(id) => hapusHasil("kuis", id)}
              />
              <RiwayatBagian
                judul="Simulasi"
                kosong="Belum ada hasil simulasi"
                baris={riwayat.simulasi}
                kolom={(x) => `${x.skenario_id} - Skor ${x.skor}`}
                onHapus={(id) => hapusHasil("simulasi", id)}
              />
            </>
          )}
        </section>
      ) : null}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function AdminSidebar({ nama, menuAktif, onPilih, terbuka, onTutup, onKeluar }) {
  const isiSidebar = (
    <div className="flex h-full w-64 flex-col bg-[#0f172a] text-slate-300">
      {/* Brand Sidebar */}
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-800 px-5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0369a1] text-white shadow-sm">
            <Ikon nama="verified_user" ukuran={18} />
          </span>
          <div>
            <p className="text-sm font-bold leading-none text-white">
              Tangkis<span className="text-[#38bdf8]">Siber</span>
            </p>
            <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Admin Panel
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onTutup}
          aria-label="Tutup sidebar"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
        >
          <Ikon nama="close" ukuran={20} />
        </button>
      </div>

      {/* Menu Terkelompok */}
      <nav aria-label="Navigasi panel admin" className="flex-1 space-y-4 overflow-y-auto px-3 py-5">
        {GRUP_MENU.map((grup, gIdx) => (
          <div key={grup.judul} className={gIdx > 0 ? "border-t border-slate-800/80 pt-4" : ""}>
            <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
              {grup.judul}
            </p>
            <ul className="space-y-0.5">
              {grup.item.map((item) => {
                const aktif = menuAktif === item.id;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => onPilih(item.id)}
                      aria-current={aktif ? "page" : undefined}
                      className={`flex min-h-10 w-full items-center gap-3 rounded-r-lg border-l-[3px] px-3 text-left text-sm transition-colors duration-150 ${
                        aktif
                          ? "border-[#38bdf8] bg-slate-800/75 font-semibold text-white"
                          : "border-transparent font-medium text-slate-400 hover:border-slate-700 hover:bg-slate-800/40 hover:text-slate-100"
                      }`}
                    >
                      <Ikon
                        nama={item.ikon}
                        ukuran={18}
                        className={aktif ? "text-[#38bdf8]" : "text-slate-500"}
                      />
                      <span className="flex-1 truncate">{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer Sidebar: Profil Admin + Lihat Situs + Keluar */}
      <div className="shrink-0 space-y-3 border-t border-slate-800 p-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0369a1] text-xs font-bold text-white">
            {(nama || "A").charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold text-white">{nama || "Admin"}</p>
            <p className="text-[11px] text-slate-400">Administrator</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Link
            href="/"
            className="inline-flex min-h-9 items-center justify-center gap-1 rounded-lg border border-slate-700 bg-slate-800/60 px-2.5 text-xs font-semibold text-slate-200 transition-colors hover:bg-slate-800 hover:text-white"
          >
            <Ikon nama="open_in_new" ukuran={14} />
            Situs
          </Link>
          <button
            type="button"
            onClick={onKeluar}
            className="inline-flex min-h-9 items-center justify-center gap-1 rounded-lg border border-bahaya/40 bg-bahaya/15 px-2.5 text-xs font-semibold text-[#fca5a5] transition-colors hover:bg-bahaya hover:text-white"
          >
            <Ikon nama="logout" ukuran={14} />
            Keluar
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop: sidebar tetap */}
      <aside className="hidden shrink-0 lg:sticky lg:top-0 lg:block lg:h-dvh">
        {isiSidebar}
      </aside>

      {/* Mobile & Tablet: slide-over sidebar */}
      {terbuka ? (
        <div
          className="fixed inset-0 z-50 flex bg-ink/50 backdrop-blur-xs lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Sidebar admin"
          onClick={(e) => {
            if (e.target === e.currentTarget) onTutup();
          }}
        >
          {isiSidebar}
        </div>
      ) : null}
    </>
  );
}

function AdminHeader({ infoMenu, nama, onBukaSidebar, onRefresh, memuat }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-3 border-b border-line bg-surface px-4 sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onBukaSidebar}
          aria-label="Buka menu sidebar admin"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-line bg-bg text-ink hover:bg-primary-soft hover:text-primary lg:hidden"
        >
          <Ikon nama="menu" ukuran={20} />
        </button>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
            {infoMenu.grup}
          </p>
          <h1 className="truncate text-base font-bold text-ink sm:text-lg">
            {infoMenu.label}
          </h1>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={onRefresh}
          disabled={memuat}
          className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-line bg-bg px-3 text-xs font-semibold text-ink transition-colors hover:bg-primary-soft hover:text-primary disabled:opacity-50"
        >
          <Ikon nama="replay" ukuran={16} />
          <span className="hidden sm:inline">Muat Ulang</span>
        </button>
        <span className="hidden items-center gap-2 rounded-full bg-primary-soft py-1 pl-1.5 pr-3 text-xs font-semibold text-primary sm:inline-flex">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-white">
            {(nama || "A").charAt(0).toUpperCase()}
          </span>
          {nama || "Admin"}
        </span>
      </div>
    </header>
  );
}

function RiwayatBagian({ judul, kosong, baris, kolom, onHapus }) {
  return (
    <div className="mt-4">
      <h3 className="text-sm font-semibold text-ink">{judul}</h3>
      {baris.length === 0 ? (
        <p className="mt-1.5 text-sm text-muted">{kosong}</p>
      ) : (
        <ul className="mt-1.5 flex flex-col gap-1.5">
          {baris.map((x) => (
            <li
              key={x.id}
              className="flex flex-wrap items-center gap-2 rounded-md border border-line bg-surface px-3 py-2 text-sm"
            >
              <span className="text-ink">{kolom(x)}</span>
              {x.ai_curiga ? (
                <Badge warna="waspada" ikon="smart_toy">
                  Kemungkinan AI
                </Badge>
              ) : null}
              <span className="text-xs text-muted">
                {new Date(x.created_at).toLocaleString("id-ID", { dateStyle: "short", timeStyle: "short" })}
              </span>
              <button
                type="button"
                onClick={() => onHapus(x.id)}
                aria-label={`Hapus hasil ${judul}`}
                className="ml-auto flex h-9 w-9 items-center justify-center rounded-md text-bahaya transition-colors duration-150 hover:bg-bahaya-soft"
              >
                <Ikon nama="delete" ukuran={18} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function StatistikCard({ ikon, label, nilai, warna }) {
  const aksen =
    {
      primary: "bg-primary-soft text-primary",
      aman: "bg-aman-soft text-aman",
      waspada: "bg-waspada-soft text-waspada",
    }[warna] || "bg-primary-soft text-primary";
  return (
    <div className="flex items-center gap-3.5 rounded-2xl border border-line bg-surface p-4 shadow-[var(--shadow-card)]">
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${aksen}`}>
        <Ikon nama={ikon} ukuran={22} />
      </span>
      <div className="min-w-0">
        <p className="truncate text-xs font-semibold text-muted">{label}</p>
        <p className="angka mt-0.5 text-2xl font-bold leading-none text-ink">
          {nilai.toLocaleString("id-ID")}
        </p>
      </div>
    </div>
  );
}
