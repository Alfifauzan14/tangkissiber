import { Poppins } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

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
    <html lang="id" className={`${poppins.variable} light`}>
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
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
