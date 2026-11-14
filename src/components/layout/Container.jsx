// Wadah halaman: lebar mengikuti breakpoint DESIGN.md §10
// (720px tablet, 1120px desktop) dengan gutter aman di 320px.
export default function Container({ className = "", children }) {
  return (
    <div className={`mx-auto w-full max-w-[720px] px-4 md:px-6 lg:max-w-[1120px] ${className}`}>
      {children}
    </div>
  );
}
