import { Poppins } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import TabBar from "@/components/layout/TabBar";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata = {
  title: "TangkisSiber: Latihan Menangkis Penipuan Digital",
  description:
    "Website edukasi interaktif untuk melatih mengenali dan menangkis penipuan digital: cek pesan, simulasi percakapan, kuis, dan halaman darurat.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={poppins.variable}>
      <body className="antialiased">
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Ikon Material Symbols Rounded, gaya fill 1, bobot 500 (DESIGN.md §6) */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,500,1,0&display=block"
        />
        <div className="flex min-h-dvh flex-col">
          <Header />
          {/* padding bawah agar konten tak tertutup tab bar 64px (R-03) */}
          <main className="flex-1 pb-28 lg:pb-0">{children}</main>
          <TabBar />
        </div>
      </body>
    </html>
  );
}
