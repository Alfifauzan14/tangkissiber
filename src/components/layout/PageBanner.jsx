// Banner kepala halaman fitur yang seragam (gaya Hero Cyber Ocean + cyber grid).
import Container from "./Container";

export default function PageBanner({ eyebrow, judul, deskripsi }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#0c4a6e] via-[#0369a1] to-[#0ea5e9] pb-16 pt-8 text-white lg:pb-20 lg:pt-11">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-15"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.22) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.22) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <Container className="relative z-10">
        {eyebrow ? (
          <p className="text-xs font-bold uppercase tracking-widest text-[#bae6fd]">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-1.5 text-2xl font-bold text-white md:text-3xl">{judul}</h1>
        {deskripsi ? (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/90 md:text-base">
            {deskripsi}
          </p>
        ) : null}
      </Container>

      {/* Wave divider seperti Hero */}
      <svg
        viewBox="0 0 1440 90"
        preserveAspectRatio="none"
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-0 -mb-px h-8 w-full text-bg md:h-12"
      >
        <path
          fill="currentColor"
          d="M0,48 C240,96 480,0 720,42 C960,84 1200,18 1440,54 L1440,90 L0,90 Z"
        />
      </svg>
    </section>
  );
}
