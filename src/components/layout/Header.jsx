import { CircleUserRound, Podium } from "lucide-react";
import NavButton from "../ui/NavButton";
import { useNavigate } from "react-router";

function Header() {
  const navigate = useNavigate();
  return (
    <header className="flex bg-blue-dark-900 border-b-2 border-blue-300 w-full justify-center p-2">
      <div className="flex w-full max-w-250 items-center justify-between">
        <h1
          className="text-2xl font-anybody font-extrabold tracking-wide text-orange-300 cursor-pointer"
          onClick={() => navigate("/")}
        >
          NAVAL RIVALS
        </h1>
        <div className="flex items-center gap-6">
          <NavButton router="/ranking">
            <Podium size={34} />
          </NavButton>
          <NavButton router="/profile">
            <CircleUserRound size={34} />
          </NavButton>
        </div>
      </div>
    </header>
  );
}

export default Header;
