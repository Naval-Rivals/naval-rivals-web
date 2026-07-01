import { CircleUserRound, House } from "lucide-react";
import { RankingIcon } from "@phosphor-icons/react";
import { NavLink } from "react-router";

function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 md:hidden bg-blue-dark-900 border-t-2 border-blue-300 z-50">
      <div className="flex items-center justify-around py-3 px-4">
        <BottomNavItem router="/" label="Início">
          <House size={24} />
        </BottomNavItem>
        <BottomNavItem router="/ranking" label="Ranking">
          <RankingIcon size={24} />
        </BottomNavItem>
        <BottomNavItem router="/profile" label="Perfil">
          <CircleUserRound size={24} />
        </BottomNavItem>
      </div>
    </nav>
  );
}

function BottomNavItem({ children, router, label }) {
  return (
    <NavLink to={router} className="flex flex-col items-center gap-1">
      {({ isActive }) => (
        <>
          <span className={isActive ? "text-orange-300" : "text-blue-300"}>
            {children}
          </span>
          <span
            className={`font-poppins text-[10px] tracking-wide ${isActive ? "text-orange-300 font-medium" : "text-blue-300/70"}`}
          >
            {label}
          </span>
        </>
      )}
    </NavLink>
  );
}

export default BottomNav;
