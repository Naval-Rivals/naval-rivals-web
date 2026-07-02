import { Info, ScrollText } from "lucide-react";
import { Link } from "react-router";

function Footer() {
  return (
    <footer className="flex flex-col items-center gap-4 py-6 mt-auto border-t border-white/10 w-full">
      <nav aria-label="Links do rodapé" className="flex items-center gap-6">
        <Link
          to="/about-us"
          className="flex items-center gap-1.5 font-poppins text-sm text-white/60 hover:text-orange-300 transition-colors duration-200"
        >
          <Info size={16} />
          Sobre o Naval Rivals
        </Link>
        <Link
          to="/game/rules"
          className="flex items-center gap-1.5 font-poppins text-sm text-white/60 hover:text-orange-300 transition-colors duration-200"
        >
          <ScrollText size={16} />
          Regras do Jogo
        </Link>
      </nav>

      <div className="flex flex-col items-center gap-1">
        <span className="font-anybody font-bold text-orange-300/50 text-sm tracking-wider">
          NAVAL RIVALS
        </span>
        <span className="font-poppins text-xs text-white/30">
          Domine os mares. Conquiste a glória.
        </span>
      </div>

      <span className="font-poppins text-[10px] text-white/20">
        &copy; {new Date().getFullYear()} Naval Rivals. Todos os direitos
        reservados.
      </span>
    </footer>
  );
}

export default Footer;
