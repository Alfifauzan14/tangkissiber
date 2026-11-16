// Halaman percakapan /simulasi/[skenario]. Data dari Supabase `konten_aplikasi` (fallback JSON).
export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { ambilKontenServer, KONTEN_DEFAULT } from "@/lib/konten";
import Container from "@/components/layout/Container";
import ChatSkenario from "@/components/simulasi/ChatSkenario";

const VALID_IDS = ["kurir-apk", "hadiah-palsu", "otp-bank", "lowongan-palsu"];

export function generateStaticParams() {
  return VALID_IDS.map((skenario) => ({ skenario }));
}

export async function generateMetadata({ params }) {
  const { skenario } = await params;
  const data = VALID_IDS.includes(skenario)
    ? KONTEN_DEFAULT[`skenario-${skenario}`]
    : null;
  return { title: data ? `${data.judul} | Simulasi TangkisSiber` : "Simulasi | TangkisSiber" };
}

export default async function HalamanSkenario({ params }) {
  const { skenario } = await params;
  if (!VALID_IDS.includes(skenario)) notFound();
  const data = await ambilKontenServer(`skenario-${skenario}`);
  if (!data) notFound();

  return (
    <div className="flex h-dvh items-center justify-center overflow-hidden bg-bg sm:h-auto sm:min-h-dvh sm:px-4 sm:py-8">
      <ChatSkenario data={data} />
    </div>
  );
}
