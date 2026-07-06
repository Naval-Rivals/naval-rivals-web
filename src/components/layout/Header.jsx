import { CircleUserRound, House } from "lucide-react";
import NavButton from "../ui/NavButton";
import { useNavigate } from "react-router";
import { RankingIcon } from "@phosphor-icons/react";

function Header({ minimal = false }) {
  const navigate = useNavigate();
  return (
    <header className="flex bg-blue-dark-900 border-b-2 border-blue-300 w-full justify-center p-2">
      <div className="flex w-full max-w-250 items-center justify-between px-4">
        <h1
          className={`text-2xl font-anybody font-extrabold tracking-wide text-orange-300 ${!minimal ? "cursor-pointer" : ""}`}
          onClick={!minimal ? () => navigate("/") : undefined}
        >
          NAVAL RIVALS
        </h1>
        {!minimal && (
          <div className="hidden md:flex items-center gap-8">
            <NavButton router="/">
              <House size={34} />
            </NavButton>
            <NavButton router="/ranking">
              <RankingIcon size={34} />
            </NavButton>
            <NavButton router="/profile">
              <CircleUserRound size={34} />
            </NavButton>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
