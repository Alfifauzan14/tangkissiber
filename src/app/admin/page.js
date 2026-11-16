// Halaman Admin (/admin) — terpisah dari landing page dan navigasi publik.
// Hanya bisa diakses oleh user dengan peran 'admin' di profiles.
export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import Container from "@/components/layout/Container";
import Tombol from "@/components/ui/Tombol";
import Ikon from "@/components/ui/Ikon";
import AdminContent from "./AdminContent";

async function cekAdmin() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { status: "unauthenticated", user: null, profil: null };

  const { data: profil } = await supabase
    .from("profiles")
    .select("peran, nama_tampil")
    .eq("id", user.id)
    .single();

  if (profil?.peran !== "admin") {
    return { status: "forbidden", user, profil };
  }

  return { status: "admin", user, profil };
}

export default async function HalamanAdmin() {
  const { status, user, profil } = await cekAdmin();

  if (status === "unauthenticated") {
    redirect("/admin/masuk");
  }

  if (status === "forbidden") {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-bg px-5 py-10">
        <div className="w-full max-w-[420px] rounded-xl border border-line bg-surface p-6 text-center shadow-[var(--shadow-card)] md:p-8">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-bahaya-soft text-bahaya">
            <Ikon nama="lock" ukuran={24} />
          </div>
          <h1 className="text-xl font-bold text-ink">Akses Ditolak</h1>
          <p className="mt-2 text-sm text-muted">
            Halaman ini khusus untuk administrator. Akun Anda saat ini tidak memiliki hak akses admin.
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <Tombol gaya="primary" href="/admin/masuk" className="w-full">
              Masuk dengan Akun Admin
            </Tombol>
            <Tombol gaya="tonal" href="/" className="w-full">
              Kembali ke Beranda
            </Tombol>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={<AdminSkeleton />}>
      <AdminContent user={user} profil={profil} />
    </Suspense>
  );
}

function AdminSkeleton() {
  return (
    <Container className="max-w-[1120px] py-8 lg:py-10">
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-primary-soft rounded w-1/4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-24 bg-primary-soft rounded" />
          <div className="h-24 bg-primary-soft rounded" />
          <div className="h-24 bg-primary-soft rounded" />
        </div>
        <div className="h-64 bg-primary-soft rounded" />
      </div>
    </Container>
  );
}
