import HalamanPenanda from "@/components/HalamanPenanda";

export const metadata = { title: "Cek Pesan | TangkisSiber" };

export default function Page() {
  return (
    <HalamanPenanda
      judul="Cek Pesan"
      deskripsi="Tempelkan pesan atau tautan yang dicurigai, lalu lihat tingkat risikonya beserta saran tindakannya."
      jadwal="Hari 2"
    />
  );
}
