import HalamanPenanda from "@/components/HalamanPenanda";

export const metadata = { title: "Kuis | TangkisSiber" };

export default function Page() {
  return (
    <HalamanPenanda
      judul="Kuis"
      deskripsi="10 soal pilihan ganda tentang penipuan digital, dengan penjelasan di setiap jawaban dan skor akhir."
      jadwal="Hari 2"
    />
  );
}
