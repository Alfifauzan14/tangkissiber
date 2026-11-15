// Halaman Admin (Post-v1.0 #4)
// Hanya aksesible oleh user dengan peran 'admin' di profiles
export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import Container from "@/components/layout/Container";
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
  if (!user) return { admin: false, user: null };

  const { data: profil } = await supabase
    .from("profiles")
    .select("peran, nama_tampil")
    .eq("id", user.id)
    .single();

  return { admin: profil?.peran === "admin", user, profil };
}

export default async function HalamanAdmin() {
  const { admin, user, profil } = await cekAdmin();

  if (!admin) {
    // Bukan admin: redirect ke beranda dengan pesan
    redirect("/?error=unauthorized");
  }

  return (
    <Container className="max-w-[1120px] py-8 lg:py-10">
      <Suspense fallback={<AdminSkeleton />}>
        <AdminContent user={user} profil={profil} />
      </Suspense>
    </Container>
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