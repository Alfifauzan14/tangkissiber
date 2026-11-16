// Seed Demo Script (Post-v1.0 #6)
// Idempoten: bisa dijalanin berkali-kali tanpa duplikat
// Butuh SUPABASE_SERVICE_ROLE_KEY di env
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL || "https://fpmlbnhckvwsxtzzhmcn.supabase.co";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error("❌ SUPABASE_SERVICE_ROLE_KEY tidak diset di environment");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  console.log("🌱 Memulai seed demo...");

  // 1. Buat user demo (jika belum ada)
  console.log("\n1. Memastikan user demo@juri.com...");
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const demoUser = existingUsers.users.find((u) => u.email === "demo@juri.com");

  let userId;
  if (demoUser) {
    userId = demoUser.id;
    console.log(`   ✓ User sudah ada: ${userId}`);
  } else {
    const { data: newUser, error } = await supabase.auth.admin.createUser({
      email: "demo@juri.com",
      password: "demo123456",
      email_confirm: true,
      user_metadata: { nama_tampil: "Demo Juri" },
    });
    if (error) throw error;
    userId = newUser.user.id;
    console.log(`   ✓ User dibuat: ${userId}`);
  }

  // 2. Pastikan profil Demo User (peran: user)
  console.log("\n2. Memastikan profil Demo User...");
  const { error: profilError } = await supabase
    .from("profiles")
    .upsert({ id: userId, nama_tampil: "Demo User", peran: "user" }, { onConflict: "id" });
  if (profilError) throw profilError;
  console.log("   ✓ Profil Demo User OK");

  // 2b. Pastikan Akun Demo Admin (admin@tangkissiber.id)
  console.log("\n2b. Memastikan akun admin@tangkissiber.id...");
  const adminExisting = existingUsers.users.find((u) => u.email === "admin@tangkissiber.id");
  let adminId;
  if (adminExisting) {
    adminId = adminExisting.id;
  } else {
    const { data: newAdmin, error: adminErr } = await supabase.auth.admin.createUser({
      email: "admin@tangkissiber.id",
      password: "admin123456",
      email_confirm: true,
      user_metadata: { nama_tampil: "Demo Admin" },
    });
    if (adminErr) throw adminErr;
    adminId = newAdmin.user.id;
  }
  const { error: adminProfilErr } = await supabase
    .from("profiles")
    .upsert({ id: adminId, nama_tampil: "Demo Admin", peran: "admin" }, { onConflict: "id" });
  if (adminProfilErr) throw adminProfilErr;
  console.log("   ✓ Profil Demo Admin OK");

  // 3. Bersihkan riwayat lama Demo User lalu isi data bersih
  await supabase.from("kuis_hasil").delete().eq("user_id", userId);
  await supabase.from("simulasi_hasil").delete().eq("user_id", userId);

  console.log("\n3. Seed kuis_hasil...");
  console.log("\n3. Seed kuis_hasil...");
  const kuisData = [
    { user_id: userId, skor: 70, ai_curiga: false, created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
    { user_id: userId, skor: 80, ai_curiga: false, created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
    { user_id: userId, skor: 90, ai_curiga: false, created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
  ];

  for (const k of kuisData) {
    const { error } = await supabase.from("kuis_hasil").upsert(k, { onConflict: "user_id,created_at" });
    if (error) throw error;
  }
  console.log(`   ✓ ${kuisData.length} kuis_hasil OK`);

  // 4. Seed simulasi_hasil (4 skenario x 1 riwayat)
  console.log("\n4. Seed simulasi_hasil...");
  const skenarioIds = ["kurir-apk", "hadiah-palsu", "otp-bank", "lowongan-palsu"];
  const simulasiData = skenarioIds.map((sid, i) => ({
    user_id: userId,
    skenario_id: sid,
    skor: 75 + i * 5, // 75, 80, 85, 90
    ai_curiga: false,
    created_at: new Date(Date.now() - (4 - i) * 24 * 60 * 60 * 1000).toISOString(),
  }));

  for (const s of simulasiData) {
    const { error } = await supabase.from("simulasi_hasil").upsert(s, { onConflict: "user_id,skenario_id,created_at" });
    if (error) throw error;
  }
  console.log(`   ✓ ${simulasiData.length} simulasi_hasil OK`);

  // 5. Verifikasi total poin di view peringkat
  console.log("\n5. Verifikasi peringkat...");
  const { data: ranking } = await supabase.from("peringkat").select("total_poin").eq("id", userId).single();
  console.log(`   ✓ Total poin demo: ${ranking?.total_poin ?? 0}`);

  console.log("\n🎉 Seed demo selesai!");
  console.log("   Email: demo@juri.com");
  console.log("   Password: demo123456");
}

main().catch((e) => {
  console.error("❌ Seed gagal:", e);
  process.exit(1);
});