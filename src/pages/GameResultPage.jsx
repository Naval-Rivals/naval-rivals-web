import Header from "../components/layout/Header";
import LayoutPage from "../components/layout/LayoutPage";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import {
  Trophy,
  CircleUserRound,
  Clock,
  Target,
  Flame,
  Droplets,
  Home,
  Swords,
} from "lucide-react";
import { useNavigate } from "react-router";

// Dados mockados do resultado
const RESULT = {
  victory: true,
  duration: "12:34",
  player: {
    name: "user123456",
    totalShots: 42,
    hits: 17,
    misses: 25,
    shipsDestroyed: 5,
  },
  opponent: {
    name: "rivalPlayer",
    totalShots: 38,
    hits: 12,
    misses: 26,
    shipsDestroyed: 3,
  },
};

function GameResultPage() {
  const navigate = useNavigate();

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header />
      <LayoutPage interClassName="p-4 pb-8 justify-center">
        {/* Resultado */}
        <Card className="flex flex-col items-center gap-6 w-full max-w-lg p-6">
          {/* Ícone + Título */}
          <div className="flex flex-col items-center gap-3">
            <div className="w-20 h-20 rounded-full bg-orange-500/20 border-2 border-orange-400 flex items-center justify-center">
              <Trophy size={40} className="text-orange-300" />
            </div>
            <h2 className="font-anybody font-extrabold text-3xl text-orange-300 uppercase tracking-wider">
              Vitória!
            </h2>
            <p className="font-poppins font-light text-white/60 text-sm text-center">
              Você dominou os mares e afundou toda a frota inimiga!
            </p>
          </div>

          {/* Placar */}
          <div className="flex items-center justify-center gap-6 w-full py-3 border-y border-white/10">
            {/* Você */}
            <div className="flex flex-col items-center gap-1">
              <div className="w-11 h-11 rounded-full bg-blue-dark-900 border-2 border-blue-300 flex items-center justify-center">
                <CircleUserRound size={20} className="text-blue-300" />
              </div>
              <span className="font-poppins font-semibold text-xs text-white">
                {RESULT.player.name}
              </span>
              <span className="font-anybody font-bold text-2xl text-green-400">
                {RESULT.player.shipsDestroyed}
              </span>
              <span className="font-poppins text-[10px] text-white/40">
                navios afundados
              </span>
            </div>

            {/* VS */}
            <span className="font-anybody font-extrabold text-xl text-white/20">
              ×
            </span>

            {/* Oponente */}
            <div className="flex flex-col items-center gap-1">
              <div className="w-11 h-11 rounded-full bg-blue-dark-900 border-2 border-orange-300/50 flex items-center justify-center">
                <CircleUserRound size={20} className="text-orange-300/50" />
              </div>
              <span className="font-poppins font-semibold text-xs text-white/60">
                {RESULT.opponent.name}
              </span>
              <span className="font-anybody font-bold text-2xl text-red-400">
                {RESULT.opponent.shipsDestroyed}
              </span>
              <span className="font-poppins text-[10px] text-white/40">
                navios afundados
              </span>
            </div>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-2 gap-3 w-full">
            <StatCard
              icon={<Clock size={18} className="text-blue-300" />}
              label="Tempo de Batalha"
              value={RESULT.duration}
            />
            <StatCard
              icon={<Target size={18} className="text-white/70" />}
              label="Tiros Totais"
              value={RESULT.player.totalShots}
            />
            <StatCard
              icon={<Flame size={18} className="text-orange-400" />}
              label="Acertos"
              value={RESULT.player.hits}
            />
            <StatCard
              icon={<Droplets size={18} className="text-blue-300/70" />}
              label="Erros"
              value={RESULT.player.misses}
            />
          </div>

          {/* Botões */}
          <div className="flex flex-col gap-3 w-full">
            <Button
              variant="primary"
              className="flex items-center justify-center gap-2"
              onClick={() => navigate("/game/waiting-room")}
            >
              <Swords size={18} />
              JOGAR NOVAMENTE
            </Button>
            <Button
              variant="secondary"
              className="flex items-center justify-center gap-2"
              onClick={() => navigate("/")}
            >
              <Home size={18} />
              VOLTAR AO MENU
            </Button>
          </div>
        </Card>
      </LayoutPage>
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-blue-dark-900/60 border border-white/10">
      {icon}
      <span className="font-anybody font-bold text-lg text-white">
        {value}
      </span>
      <span className="font-poppins text-[10px] text-white/50 uppercase tracking-wide text-center">
        {label}
      </span>
    </div>
  );
}

export default GameResultPage;
