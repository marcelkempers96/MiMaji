export default function Footer() {
  return (
    <footer className="bg-blue-900 px-5 py-4 flex items-center justify-between">
      <span className="text-white font-display font-bold text-sm">
        💧 MiMaji
      </span>
      <span className="text-blue-200 text-[11px]">
        © {new Date().getFullYear()} mimaji.co.ke
      </span>
      <span className="text-blue-200 text-[11px]">📲 WhatsApp</span>
    </footer>
  );
}
