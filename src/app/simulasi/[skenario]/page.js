// Halaman percakapan /simulasi/[skenario]. Data dari JSON di repo (FR-F3-05).
import { notFound } from "next/navigation";
import kurir from "@/data/skenario/kurir-apk.json";
import hadiah from "@/data/skenario/hadiah-palsu.json";
import otp from "@/data/skenario/otp-bank.json";
import lowongan from "@/data/skenario/lowongan-palsu.json";
import Container from "@/components/layout/Container";
import ChatSkenario from "@/components/simulasi/ChatSkenario";

const SEMUA = { "kurir-apk": kurir, "hadiah-palsu": hadiah, "otp-bank": otp, "lowongan-palsu": lowongan };

export function generateStaticParams() {
  return Object.keys(SEMUA).map((skenario) => ({ skenario }));
}

export async function generateMetadata({ params }) {
  const { skenario } = await params;
  const data = SEMUA[skenario];
  return { title: data ? `${data.judul} | Simulasi TangkisSiber` : "Simulasi | TangkisSiber" };
}

export default async function HalamanSkenario({ params }) {
  const { skenario } = await params;
  const data = SEMUA[skenario];
  if (!data) notFound();

  return (
    <Container className="py-8 lg:py-10">
      <ChatSkenario data={data} />
    </Container>
  );
}
