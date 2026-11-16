"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { KONTEN_DEFAULT } from "@/lib/konten";
import Ikon from "@/components/ui/Ikon";
import Tombol from "@/components/ui/Tombol";
import { KeadaanMemuat } from "@/components/ui/Keadaan";

const DAFTAR_DATASET = [
  { kunci: "modus", label: "Pustaka Modus" },
  { kunci: "soal", label: "Bank Soal Kuis" },
  { kunci: "darurat", label: "Panduan Darurat" },
  { kunci: "aturan-cek", label: "Aturan Cek Pesan" },
  { kunci: "skenario-kurir-apk", label: "Skenario: Kurir APK" },
  { kunci: "skenario-hadiah-palsu", label: "Skenario: Hadiah Palsu" },
  { kunci: "skenario-otp-bank", label: "Skenario: OTP Bank" },
  { kunci: "skenario-lowongan-palsu", label: "Skenario: Lowongan Palsu" },
];

const KELAS_INPUT =
  "w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink outline-none transition-colors duration-150 focus:border-accent focus:ring-2 focus:ring-accent/30";

export default function KontenEditor({ tampilPesan, kunciAktif = null }) {
  const awal = kunciAktif === "skenario" ? "skenario-kurir-apk" : kunciAktif || "modus";
  const [kunci, setKunci] = useState(awal);
  const [editSkenario, setEditSkenario] = useState(false);
  const [data, setData] = useState(() => structuredClone(KONTEN_DEFAULT[awal]));
  const [teksJson, setTeksJson] = useState("");
  const [memuat, setMemuat] = useState(true);
  const [menyimpan, setMenyimpan] = useState(false);
  const [sumberDb, setSumberDb] = useState(false);
  const [perluMigrasi, setPerluMigrasi] = useState(false);

  useEffect(() => {
    if (!kunciAktif) return;
    setEditSkenario(false);
    if (kunciAktif === "skenario") {
      setKunci((prev) => (prev.startsWith("skenario-") ? prev : "skenario-kurir-apk"));
    } else {
      setKunci(kunciAktif);
    }
  }, [kunciAktif]);

  useEffect(() => {
    let aktif = true;
    async function muat() {
      setMemuat(true);
      setPerluMigrasi(false);
      const { data: row, error } = await supabase
        .from("konten_aplikasi")
        .select("data")
        .eq("kunci", kunci)
        .maybeSingle();

      if (!aktif) return;
      if (error) {
        setPerluMigrasi(true);
        const def = structuredClone(KONTEN_DEFAULT[kunci]);
        setData(def);
        setTeksJson(JSON.stringify(def, null, 2));
        setSumberDb(false);
      } else if (row?.data != null) {
        setData(row.data);
        setTeksJson(JSON.stringify(row.data, null, 2));
        setSumberDb(true);
      } else {
        const def = structuredClone(KONTEN_DEFAULT[kunci]);
        setData(def);
        setTeksJson(JSON.stringify(def, null, 2));
        setSumberDb(false);
      }
      setMemuat(false);
    }
    muat();
    return () => {
      aktif = false;
    };
  }, [kunci]);

  const pakaiEditorJson =
    kunci === "aturan-cek" || kunci.startsWith("skenario-");

  async function simpan(payload = data) {
    if (menyimpan) return;
    let finalData = payload;
    if (pakaiEditorJson) {
      try {
        finalData = JSON.parse(teksJson);
      } catch {
        tampilPesan("Format JSON tidak valid. Periksa tanda kurung/koma.", false);
        return;
      }
    }

    setMenyimpan(true);
    const { error } = await supabase.from("konten_aplikasi").upsert(
      {
        kunci,
        data: finalData,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "kunci" }
    );
    setMenyimpan(false);

    if (error) {
      tampilPesan("Gagal menyimpan: " + error.message, false);
      return;
    }
    setData(finalData);
    setTeksJson(JSON.stringify(finalData, null, 2));
    setSumberDb(true);
    tampilPesan("Konten berhasil disimpan ke Supabase.");
  }

  async function resetDefault() {
    if (!confirm("Kembalikan dataset ini ke isi bawaan?")) return;
    const def = structuredClone(KONTEN_DEFAULT[kunci]);
    setData(def);
    setTeksJson(JSON.stringify(def, null, 2));
    await simpan(def);
  }

  const opsiSkenario = DAFTAR_DATASET.filter((d) => d.kunci.startsWith("skenario-"));
  const labelAktif = DAFTAR_DATASET.find((d) => d.kunci === kunci)?.label || kunci;

  const aksiSimpan = (
    <div className="flex flex-wrap items-center gap-2">
      <Tombol gaya="tonal" type="button" onClick={resetDefault} disabled={memuat || menyimpan}>
        Reset
      </Tombol>
      <Tombol gaya="primary" ikon="save" type="button" onClick={() => simpan()} disabled={memuat || menyimpan || perluMigrasi}>
        {menyimpan ? "Menyimpan..." : "Simpan"}
      </Tombol>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Untuk Skenario / Darurat / Aturan: tampilkan bilah atas tunggal */}
      {kunci !== "modus" && kunci !== "soal" ? (
        <div className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-4 shadow-[var(--shadow-card)] sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-sm font-bold text-ink">
              {kunciAktif === "skenario" && !editSkenario ? "Daftar Skenario" : labelAktif}
            </span>
            <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
              {sumberDb ? "Database" : "Bawaan JSON"}
            </span>
          </div>
          {aksiSimpan}
        </div>
      ) : null}

      {perluMigrasi ? (
        <p role="alert" className="rounded-xl border border-waspada/30 bg-waspada-soft px-4 py-2.5 text-xs text-waspada">
          Tabel <code>konten_aplikasi</code> belum ada di Supabase. Jalankan{" "}
          <code>supabase/migration-admin-crud.sql</code> di SQL Editor agar perubahan bisa disimpan.
        </p>
      ) : null}

      {kunciAktif === "skenario" && !editSkenario ? (
        <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-[var(--shadow-card)]">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-line bg-bg/70 text-left text-xs font-bold uppercase tracking-wider text-muted">
                <th className="w-14 px-5 py-3.5">#</th>
                <th className="px-5 py-3.5">Nama Skenario</th>
                <th className="hidden px-5 py-3.5 sm:table-cell">Penipu</th>
                <th className="w-28 px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {opsiSkenario.map((s, idx) => {
                const def = KONTEN_DEFAULT[s.kunci];
                return (
                  <tr key={s.kunci} className="hover:bg-bg/50">
                    <td className="angka px-5 py-4 font-bold text-muted">{idx + 1}</td>
                    <td className="px-5 py-4 font-semibold text-ink">
                      {def?.judul || s.label.replace(/^Skenario:\s*/, "")}
                    </td>
                    <td className="hidden px-5 py-4 text-muted sm:table-cell">
                      {def?.penipu?.nama || "-"} ({def?.penipu?.peran || "-"})
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setKunci(s.kunci);
                          setEditSkenario(true);
                        }}
                        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-bg px-3 text-xs font-semibold text-primary hover:border-primary/40 hover:bg-primary-soft/50"
                      >
                        <Ikon nama="edit" ukuran={15} />
                        Edit
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : memuat ? (
        <KeadaanMemuat />
      ) : kunci === "modus" ? (
        <EditorModus data={data} setData={setData} aksiSimpan={aksiSimpan} sumberDb={sumberDb} />
      ) : kunci === "soal" ? (
        <EditorSoal data={data} setData={setData} aksiSimpan={aksiSimpan} sumberDb={sumberDb} />
      ) : kunci === "darurat" ? (
        <EditorDarurat data={data} setData={setData} />
      ) : (
        <div className="space-y-4 rounded-2xl border border-line bg-surface p-6 shadow-[var(--shadow-card)]">
          {kunciAktif === "skenario" ? (
            <button
              type="button"
              onClick={() => setEditSkenario(false)}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-line bg-bg px-3 text-xs font-semibold text-ink hover:bg-primary-soft hover:text-primary"
            >
              ← Kembali ke Daftar Skenario
            </button>
          ) : null}
          <div>
            <label htmlFor="editor-json" className="mb-2 block text-sm font-semibold text-ink">
              Editor JSON ({labelAktif})
            </label>
            <textarea
              id="editor-json"
              value={teksJson}
              onChange={(e) => setTeksJson(e.target.value)}
              rows={18}
              spellCheck={false}
              className={`${KELAS_INPUT} font-mono text-xs leading-relaxed`}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function EditorModus({ data, setData, aksiSimpan }) {
  const [pilihIdx, setPilihIdx] = useState(null);
  const [cari, setCari] = useState("");
  const [katFilter, setKatFilter] = useState("Semua");
  const [katBuka, setKatBuka] = useState(false);
  const m = pilihIdx !== null ? data[pilihIdx] : null;

  const daftarKat = ["Semua", ...Array.from(new Set(data.map((d) => d.kategori).filter(Boolean)))];

  const tersaring = data
    .map((item, i) => ({ item, i }))
    .filter(({ item }) => {
      if (katFilter !== "Semua" && item.kategori !== katFilter) return false;
      const q = cari.trim().toLowerCase();
      if (!q) return true;
      return (
        (item.judul || "").toLowerCase().includes(q) ||
        (item.kategori || "").toLowerCase().includes(q)
      );
    });

  function ubah(idx, field, val) {
    const salinan = [...data];
    salinan[idx] = { ...salinan[idx], [field]: val };
    setData(salinan);
  }
  function tambah() {
    const baru = [
      ...data,
      {
        id: `modus-${Date.now()}`,
        judul: "Modus Baru",
        kategori: "Pesan & Tautan",
        ringkas: "",
        ciri: [""],
        contoh_pesanan: "",
        cara_kerja: [""],
        tindakan: [""],
      },
    ];
    setData(baru);
    setPilihIdx(baru.length - 1);
  }
  function hapus(idx) {
    if (!confirm("Hapus kartu modus ini?")) return;
    setData(data.filter((_, i) => i !== idx));
    setPilihIdx(null);
  }

  if (m) {
    return (
      <div className="space-y-5 rounded-2xl border border-line bg-surface p-6 shadow-[var(--shadow-card)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
          <button
            type="button"
            onClick={() => setPilihIdx(null)}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-line bg-bg px-3 text-xs font-semibold text-ink hover:bg-primary-soft hover:text-primary"
          >
            ← Kembali ke Daftar Modus
          </button>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-bold text-ink">Edit Modus #{pilihIdx + 1}</span>
            <button
              type="button"
              onClick={() => hapus(pilihIdx)}
              className="inline-flex h-10 items-center gap-1 rounded-lg border border-bahaya/30 px-3 text-xs font-semibold text-bahaya hover:bg-bahaya-soft"
            >
              <Ikon nama="delete" ukuran={15} />
              Hapus
            </button>
            {aksiSimpan}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-muted">Judul</label>
            <input
              value={m.judul}
              onChange={(e) => ubah(pilihIdx, "judul", e.target.value)}
              className={KELAS_INPUT}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-muted">Kategori</label>
            <input
              value={m.kategori}
              onChange={(e) => ubah(pilihIdx, "kategori", e.target.value)}
              className={KELAS_INPUT}
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-xs font-semibold text-muted">Ringkasan</label>
            <textarea
              rows={2}
              value={m.ringkas}
              onChange={(e) => ubah(pilihIdx, "ringkas", e.target.value)}
              className={KELAS_INPUT}
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-xs font-semibold text-muted">Contoh Pesan</label>
            <textarea
              rows={2}
              value={m.contoh_pesanan || ""}
              onChange={(e) => ubah(pilihIdx, "contoh_pesanan", e.target.value)}
              className={KELAS_INPUT}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-muted">
              Ciri-ciri (1 per baris)
            </label>
            <textarea
              rows={4}
              value={(m.ciri || []).join("\n")}
              onChange={(e) => ubah(pilihIdx, "ciri", e.target.value.split("\n"))}
              className={KELAS_INPUT}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-muted">
              Tindakan Aman (1 per baris)
            </label>
            <textarea
              rows={4}
              value={(m.tindakan || []).join("\n")}
              onChange={(e) => ubah(pilihIdx, "tindakan", e.target.value.split("\n"))}
              className={KELAS_INPUT}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2.5 rounded-2xl border border-line bg-surface p-3.5 shadow-[var(--shadow-card)] lg:flex-row lg:items-center">
        <input
          type="search"
          value={cari}
          onChange={(e) => setCari(e.target.value)}
          placeholder="Cari judul atau kategori modus..."
          aria-label="Cari modus"
          className="h-11 w-full flex-1 rounded-xl border border-line bg-bg px-4 text-sm text-ink outline-none focus:border-accent"
        />
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <button
              type="button"
              onClick={() => setKatBuka((v) => !v)}
              aria-expanded={katBuka}
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-line bg-bg px-3.5 text-xs font-semibold text-ink transition-colors hover:border-primary/40"
            >
              <span>{katFilter === "Semua" ? "Semua Kategori" : katFilter}</span>
              <Ikon nama="keyboard_arrow_down" ukuran={16} className="text-muted" />
            </button>
            {katBuka ? (
              <div className="absolute right-0 z-20 mt-1.5 w-48 overflow-hidden rounded-xl border border-line bg-surface py-1 shadow-lg">
                {daftarKat.map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => {
                      setKatFilter(k);
                      setKatBuka(false);
                    }}
                    className={`flex w-full items-center px-3.5 py-2 text-left text-xs font-medium transition-colors ${
                      katFilter === k
                        ? "bg-primary-soft font-semibold text-primary"
                        : "text-ink hover:bg-bg"
                    }`}
                  >
                    {k === "Semua" ? "Semua Kategori" : k}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          <Tombol gaya="tonal" ikon="add" type="button" onClick={tambah}>
            Tambah
          </Tombol>
          {aksiSimpan}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-[var(--shadow-card)]">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-line bg-bg/70 text-left text-xs font-bold uppercase tracking-wider text-muted">
              <th className="w-12 px-5 py-3.5">#</th>
              <th className="px-5 py-3.5">Judul Modus</th>
              <th className="hidden px-5 py-3.5 sm:table-cell">Kategori</th>
              <th className="w-36 px-5 py-3.5 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {tersaring.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-sm text-muted">
                  Tidak ada modus yang cocok.
                </td>
              </tr>
            ) : (
              tersaring.map(({ item, i }) => (
                <tr key={item.id || i} className="hover:bg-bg/50">
                  <td className="angka px-5 py-3.5 font-bold text-muted">{i + 1}</td>
                  <td className="px-5 py-3.5 font-semibold text-ink">
                    {item.judul || "(Tanpa judul)"}
                  </td>
                  <td className="hidden px-5 py-3.5 text-muted sm:table-cell">{item.kategori}</td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setPilihIdx(i)}
                        className="inline-flex h-9 items-center gap-1 rounded-lg border border-line bg-bg px-3 text-xs font-semibold text-primary hover:border-primary/40 hover:bg-primary-soft/50"
                      >
                        <Ikon nama="edit" ukuran={14} />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => hapus(i)}
                        aria-label={`Hapus ${item.judul}`}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-bahaya hover:bg-bahaya-soft"
                      >
                        <Ikon nama="delete" ukuran={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EditorSoal({ data, setData, aksiSimpan }) {
  const [pilihIdx, setPilihIdx] = useState(null);
  const [cari, setCari] = useState("");
  const q = pilihIdx !== null ? data[pilihIdx] : null;

  const tersaring = data
    .map((item, i) => ({ item, i }))
    .filter(({ item }) => {
      const teks = cari.trim().toLowerCase();
      if (!teks) return true;
      return (item.pertanyaan || "").toLowerCase().includes(teks);
    });

  function ubah(idx, field, val) {
    const salinan = [...data];
    salinan[idx] = { ...salinan[idx], [field]: val };
    setData(salinan);
  }
  function ubahPilihan(idx, pIdx, val) {
    const salinan = [...data];
    const pilihan = [...(salinan[idx].pilihan || [])];
    pilihan[pIdx] = val;
    salinan[idx] = { ...salinan[idx], pilihan };
    setData(salinan);
  }
  function tambah() {
    const baru = [
      ...data,
      {
        id: `s${Date.now()}`,
        pertanyaan: "Pertanyaan baru...",
        pilihan: ["Pilihan A", "Pilihan B", "Pilihan C", "Pilihan D"],
        jawaban: 0,
        penjelasan: "",
      },
    ];
    setData(baru);
    setPilihIdx(baru.length - 1);
  }
  function hapus(idx) {
    if (!confirm("Hapus soal ini?")) return;
    setData(data.filter((_, i) => i !== idx));
    setPilihIdx(null);
  }

  if (q) {
    return (
      <div className="space-y-5 rounded-2xl border border-line bg-surface p-6 shadow-[var(--shadow-card)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
          <button
            type="button"
            onClick={() => setPilihIdx(null)}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-line bg-bg px-3 text-xs font-semibold text-ink hover:bg-primary-soft hover:text-primary"
          >
            ← Kembali ke Daftar Soal
          </button>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-bold text-ink">Edit Soal #{pilihIdx + 1}</span>
            <button
              type="button"
              onClick={() => hapus(pilihIdx)}
              className="inline-flex h-10 items-center gap-1 rounded-lg border border-bahaya/30 px-3 text-xs font-semibold text-bahaya hover:bg-bahaya-soft"
            >
              <Ikon nama="delete" ukuran={15} />
              Hapus
            </button>
            {aksiSimpan}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-muted">Pertanyaan</label>
          <textarea
            rows={2}
            value={q.pertanyaan}
            onChange={(e) => ubah(pilihIdx, "pertanyaan", e.target.value)}
            className={KELAS_INPUT}
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {(q.pilihan || []).map((p, pIdx) => (
            <div key={pIdx}>
              <label className="mb-1.5 block text-xs font-semibold text-muted">
                Pilihan {String.fromCharCode(65 + pIdx)}
                {q.jawaban === pIdx ? " (Benar)" : ""}
              </label>
              <input
                value={p}
                onChange={(e) => ubahPilihan(pilihIdx, pIdx, e.target.value)}
                className={KELAS_INPUT}
              />
            </div>
          ))}
        </div>

        <div>
          <span className="mb-1.5 block text-xs font-semibold text-muted">Jawaban Benar</span>
          <div className="flex flex-wrap gap-2">
            {(q.pilihan || []).map((_, pIdx) => (
              <button
                key={pIdx}
                type="button"
                onClick={() => ubah(pilihIdx, "jawaban", pIdx)}
                className={`h-10 min-w-12 rounded-lg px-4 text-xs font-bold transition-colors ${
                  q.jawaban === pIdx
                    ? "bg-aman text-white"
                    : "border border-line bg-bg text-muted hover:text-ink"
                }`}
              >
                {String.fromCharCode(65 + pIdx)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-muted">Penjelasan</label>
          <textarea
            rows={2}
            value={q.penjelasan || ""}
            onChange={(e) => ubah(pilihIdx, "penjelasan", e.target.value)}
            className={KELAS_INPUT}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2.5 rounded-2xl border border-line bg-surface p-3.5 shadow-[var(--shadow-card)] lg:flex-row lg:items-center">
        <input
          type="search"
          value={cari}
          onChange={(e) => setCari(e.target.value)}
          placeholder="Cari pertanyaan kuis..."
          aria-label="Cari soal"
          className="h-11 w-full flex-1 rounded-xl border border-line bg-bg px-4 text-sm text-ink outline-none focus:border-accent"
        />
        <div className="flex flex-wrap items-center gap-2">
          <Tombol gaya="tonal" ikon="add" type="button" onClick={tambah}>
            Tambah
          </Tombol>
          {aksiSimpan}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-[var(--shadow-card)]">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-line bg-bg/70 text-left text-xs font-bold uppercase tracking-wider text-muted">
              <th className="w-12 px-5 py-3.5">#</th>
              <th className="px-5 py-3.5">Pertanyaan</th>
              <th className="hidden w-24 px-5 py-3.5 text-center sm:table-cell">Kunci</th>
              <th className="w-36 px-5 py-3.5 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {tersaring.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-sm text-muted">
                  Tidak ada soal yang cocok.
                </td>
              </tr>
            ) : (
              tersaring.map(({ item, i }) => (
                <tr key={item.id || i} className="hover:bg-bg/50">
                  <td className="angka px-5 py-3.5 font-bold text-muted">{i + 1}</td>
                  <td className="max-w-md truncate px-5 py-3.5 font-medium text-ink">
                    {item.pertanyaan || "(Pertanyaan kosong)"}
                  </td>
                  <td className="hidden px-5 py-3.5 text-center sm:table-cell">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-aman-soft text-xs font-bold text-aman">
                      {String.fromCharCode(65 + (item.jawaban ?? 0))}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setPilihIdx(i)}
                        className="inline-flex h-9 items-center gap-1 rounded-lg border border-line bg-bg px-3 text-xs font-semibold text-primary hover:border-primary/40 hover:bg-primary-soft/50"
                      >
                        <Ikon nama="edit" ukuran={14} />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => hapus(i)}
                        aria-label={`Hapus soal ${i + 1}`}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-bahaya hover:bg-bahaya-soft"
                      >
                        <Ikon nama="delete" ukuran={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EditorDarurat({ data, setData }) {
  const [bagian, setBagian] = useState("info"); // info | langkah | kanal

  function ubahLangkah(idx, field, val) {
    const langkah = [...(data.langkah || [])];
    langkah[idx] = { ...langkah[idx], [field]: val };
    setData({ ...data, langkah });
  }
  function ubahKanal(idx, field, val) {
    const kanal = [...(data.kanal || [])];
    kanal[idx] = { ...kanal[idx], [field]: val };
    setData({ ...data, kanal });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Bagian panduan darurat">
        {[
          { id: "info", label: "Info Halaman" },
          { id: "langkah", label: `Langkah Penanganan (${(data.langkah || []).length})` },
          { id: "kanal", label: `Kanal Resmi (${(data.kanal || []).length})` },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={bagian === t.id}
            onClick={() => setBagian(t.id)}
            className={`min-h-10 rounded-full px-4 text-xs font-semibold transition-colors ${
              bagian === t.id
                ? "bg-primary text-white shadow-xs"
                : "border border-line bg-surface text-muted hover:border-primary/40 hover:text-primary"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {bagian === "info" ? (
        <div className="space-y-4 rounded-2xl border border-line bg-surface p-6 shadow-[var(--shadow-card)]">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-muted">Judul Halaman</label>
            <input
              value={data.judul || ""}
              onChange={(e) => setData({ ...data, judul: e.target.value })}
              className={KELAS_INPUT}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-muted">Pengantar</label>
            <textarea
              rows={3}
              value={data.pengantar || ""}
              onChange={(e) => setData({ ...data, pengantar: e.target.value })}
              className={KELAS_INPUT}
            />
          </div>
        </div>
      ) : bagian === "langkah" ? (
        <div className="space-y-4">
          {(data.langkah || []).map((l, i) => (
            <div key={l.urutan || i} className="space-y-3 rounded-2xl border border-line bg-surface p-5 shadow-[var(--shadow-card)]">
              <p className="text-xs font-bold uppercase tracking-wider text-primary">
                Langkah #{i + 1}
              </p>
              <input
                value={l.judul}
                onChange={(e) => ubahLangkah(i, "judul", e.target.value)}
                className={`${KELAS_INPUT} font-semibold`}
              />
              <textarea
                rows={2}
                value={l.isi}
                onChange={(e) => ubahLangkah(i, "isi", e.target.value)}
                className={KELAS_INPUT}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {(data.kanal || []).map((k, i) => (
            <div key={k.nama || i} className="grid grid-cols-1 gap-3 rounded-2xl border border-line bg-surface p-5 shadow-[var(--shadow-card)] md:grid-cols-2">
              <input
                value={k.nama}
                onChange={(e) => ubahKanal(i, "nama", e.target.value)}
                placeholder="Nama kanal"
                className={KELAS_INPUT}
              />
              <input
                value={k.kontak || ""}
                onChange={(e) => ubahKanal(i, "kontak", e.target.value)}
                placeholder="Nomor/Kontak"
                className={KELAS_INPUT}
              />
              <input
                value={k.keterangan || ""}
                onChange={(e) => ubahKanal(i, "keterangan", e.target.value)}
                placeholder="Keterangan"
                className={`${KELAS_INPUT} md:col-span-2`}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
