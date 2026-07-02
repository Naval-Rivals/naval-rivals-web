import Header from "../components/layout/Header";
import LayoutPage from "../components/layout/LayoutPage";
import Card from "../components/ui/Card";
import GameBoard from "../components/game/GameBoard";
import { CircleUserRound, Clock, Ship, Flame, Droplets } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";

// ============ DADOS MOCKADOS ============

// Seu tabuleiro (navios + ataques recebidos do oponente)
const MY_BOARD = {
  // Seus navios
  B1: "ship",
  C1: "ship",
  D1: "ship",
  E1: "ship",
  F1: "ship", // Porta-aviões
  A6: "ship",
  B6: "ship",
  C6: "ship",
  D6: "ship", // Navio-tanque
  H3: "ship",
  H4: "ship",
  H5: "ship", // Contratorpedeiro
  E9: "ship",
  F9: "ship",
  G9: "ship", // Submarino
  B9: "ship",
  C9: "ship", // Destroyer
  // Ataques recebidos do oponente
  A1: "miss",
  D4: "miss",
  F7: "miss",
  J10: "miss",
  C1: "hit",
  D1: "hit", // Acertou parte do porta-aviões
  B9: "sunk",
  C9: "sunk", // Destroyer afundado
};

// Tabuleiro inimigo (seus ataques - sem mostrar navios)
const ENEMY_BOARD = {
  // Seus acertos
  C3: "hit",
  C4: "hit",
  C5: "hit", // Acertou 3 de um navio
  G7: "hit",
  H7: "hit", // Acertou 2 de outro navio
  E2: "sunk",
  F2: "sunk",
  G2: "sunk", // Navio afundado
  // Seus erros
  A1: "miss",
  B5: "miss",
  D8: "miss",
  F4: "miss",
  I9: "miss",
  J1: "miss",
  H2: "miss",
  A10: "miss",
};

// Frota do jogador com status
const MY_FLEET = [
  { name: "Porta-aviões", size: 5, status: "damaged" },
  { name: "Navio-tanque", size: 4, status: "intact" },
  { name: "Contratorpedeiro", size: 3, status: "intact" },
  { name: "Submarino", size: 3, status: "intact" },
  { name: "Destroyer", size: 2, status: "sunk" },
];

// Frota do inimigo com status
const ENEMY_FLEET = [
  { name: "Porta-aviões", size: 5, status: "unknown" },
  { name: "Navio-tanque", size: 4, status: "unknown" },
  { name: "Contratorpedeiro", size: 3, status: "sunk" },
  { name: "Submarino", size: 3, status: "damaged" },
  { name: "Destroyer", size: 2, status: "damaged" },
];

function GamePage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("enemy"); // "my" ou "enemy"

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header />
      <LayoutPage interClassName="p-4 pb-8">
        {/* Título */}
        <div className="flex flex-col items-center gap-1 w-full">
          <span className="font-poppins font-semibold text-xs text-white/50 uppercase tracking-widest">
            Batalha
          </span>
        </div>

        {/* Jogadores */}
        <Card className="flex items-center justify-between w-full max-w-4xl p-4">
          {/* Jogador 1 - Você */}
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-blue-dark-900 border-2 border-blue-300 flex items-center justify-center">
              <CircleUserRound size={18} className="text-blue-300" />
            </div>
            <div className="flex flex-col">
              <span className="font-poppins font-semibold text-xs text-white">
                user123456
              </span>
              <span className="font-poppins text-[10px] text-white/40">
                Você
              </span>
            </div>
          </div>

          {/* VS */}
          <span className="font-anybody font-extrabold text-lg text-white/30">
            VS
          </span>

          {/* Jogador 2 - Oponente */}
          <div className="flex items-center gap-2">
            <div className="flex flex-col items-end">
              <span className="font-poppins font-semibold text-xs text-white">
                rivalPlayer
              </span>
              <span className="font-poppins text-[10px] text-white/40">
                Oponente
              </span>
            </div>
            <div className="w-9 h-9 rounded-full bg-blue-dark-900 border-2 border-orange-300 flex items-center justify-center">
              <CircleUserRound size={18} className="text-orange-300" />
            </div>
          </div>
        </Card>

        {/* Turno + Timer */}
        <Card className="flex items-center justify-between w-full max-w-4xl p-4 border-orange-400!">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-orange-500/20 border border-orange-400/50 flex items-center justify-center animate-pulse">
              <Flame size={16} className="text-orange-400" />
            </div>
            <span className="font-poppins font-semibold text-sm text-orange-300">
              SUA VEZ DE ATACAR!
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-dark-900 border border-blue-300/30">
            <Clock size={14} className="text-blue-300" />
            <span className="font-anybody font-bold text-lg text-white">
              01:00
            </span>
          </div>
        </Card>

        {/* Tabuleiros - Desktop: lado a lado / Mobile: toggle */}
        {/* Toggle para mobile */}
        <div className="flex md:hidden w-full max-w-4xl">
          <button
            onClick={() => setActiveTab("enemy")}
            className={`flex-1 py-2.5 font-poppins font-semibold text-sm text-center rounded-l-lg border-2 transition-colors cursor-pointer ${
              activeTab === "enemy"
                ? "bg-orange-500/20 border-orange-400 text-orange-300"
                : "bg-blue-dark-900/60 border-white/20 text-white/50"
            }`}
          >
            TABULEIRO INIMIGO
          </button>
          <button
            onClick={() => setActiveTab("my")}
            className={`flex-1 py-2.5 font-poppins font-semibold text-sm text-center rounded-r-lg border-2 border-l-0 transition-colors cursor-pointer ${
              activeTab === "my"
                ? "bg-blue-300/20 border-blue-300 text-blue-300"
                : "bg-blue-dark-900/60 border-white/20 text-white/50"
            }`}
          >
            SEU TABULEIRO
          </button>
        </div>

        {/* Tabuleiros */}
        <div className="flex flex-col md:flex-row gap-4 w-full max-w-4xl">
          {/* Seu Tabuleiro */}
          <Card
            className={`flex flex-col gap-3 w-full md:flex-1 p-4 ${
              activeTab !== "my" ? "hidden md:flex" : "flex"
            }`}
          >
            <span className="font-poppins font-semibold text-xs text-blue-300 uppercase tracking-widest text-center hidden md:block">
              Seu Tabuleiro
            </span>
            <GameBoard cells={MY_BOARD} />
          </Card>

          {/* Tabuleiro Inimigo */}
          <Card
            className={`flex flex-col gap-3 w-full md:flex-1 p-4 ${
              activeTab !== "enemy" ? "hidden md:flex" : "flex"
            }`}
          >
            <span className="font-poppins font-semibold text-xs text-orange-300 uppercase tracking-widest text-center hidden md:block">
              Tabuleiro Inimigo
            </span>
            <GameBoard cells={ENEMY_BOARD} />
          </Card>
        </div>

        {/* Sua Frota */}
        <Card className="flex flex-col gap-3 w-full max-w-4xl p-4">
          <span className="font-poppins font-semibold text-xs text-white/50 uppercase tracking-widest text-center">
            Sua Frota
          </span>
          <div className="flex flex-wrap justify-center gap-2">
            {MY_FLEET.map((ship) => (
              <ShipStatusCard key={ship.name} ship={ship} />
            ))}
          </div>
        </Card>

        {/* Botão mock para finalizar */}
        <button
          onClick={() => navigate("/game/result")}
          className="font-poppins text-xs text-white/30 hover:text-white/60 transition-colors cursor-pointer underline"
        >
          Simular fim de partida
        </button>
      </LayoutPage>
    </div>
  );
}

function ShipStatusCard({ ship, isEnemy = false }) {
  const statusStyles = {
    intact: "border-green-400/40 text-green-400",
    damaged: "border-orange-400/40 text-orange-400",
    sunk: "border-red-400/40 text-red-400 opacity-50",
    unknown: "border-white/20 text-white/50",
  };

  const statusLabels = {
    intact: "Intacto",
    damaged: "Danificado",
    sunk: "Afundado",
    unknown: "???",
  };

  const statusIcons = {
    intact: <Ship size={16} />,
    damaged: <Flame size={16} />,
    sunk: <Droplets size={16} />,
    unknown: <Ship size={16} />,
  };

  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-dark-900/60 border ${statusStyles[ship.status]}`}
    >
      <span className={statusStyles[ship.status]}>
        {statusIcons[ship.status]}
      </span>
      <div className="flex flex-col">
        <span className="font-poppins font-medium text-[11px] text-white">
          {ship.name}
        </span>
        <span
          className={`font-poppins text-[9px] ${statusStyles[ship.status]}`}
        >
          {ship.status === "sunk" ? "Afundado ✕" : statusLabels[ship.status]}
        </span>
      </div>
    </div>
  );
}

export default GamePage;
