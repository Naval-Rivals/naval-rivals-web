import Header from "../components/layout/Header";
import LayoutPage from "../components/layout/LayoutPage";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import GameBoard from "../components/game/GameBoard";
import {
  ArrowLeft,
  Check,
  CircleUserRound,
  Ship,
  RotateCw,
  MousePointerClick,
  X,
  CircleCheckBig,
  Loader,
} from "lucide-react";
import { useNavigate } from "react-router";

// Navios mockados já posicionados no tabuleiro
const MOCK_SHIPS = [
  {
    name: "Porta-aviões",
    size: 5,
    cells: [
      ["B", 1],
      ["C", 1],
      ["D", 1],
      ["E", 1],
      ["F", 1],
    ],
  },
  {
    name: "Navio-tanque",
    size: 4,
    cells: [
      ["A", 6],
      ["B", 6],
      ["C", 6],
      ["D", 6],
    ],
  },
  {
    name: "Contratorpedeiro",
    size: 3,
    cells: [
      ["H", 3],
      ["H", 4],
      ["H", 5],
    ],
  },
  {
    name: "Submarino",
    size: 3,
    cells: [
      ["E", 9],
      ["F", 9],
      ["G", 9],
    ],
  },
  {
    name: "Destroyer",
    size: 2,
    cells: [
      ["B", 9],
      ["C", 9],
    ],
  },
];

const FLEET = [
  { name: "Destroyer", size: 2 },
  { name: "Submarino", size: 3 },
  { name: "Contratorpedeiro", size: 3 },
  { name: "Porta-aviões", size: 5 },
  { name: "Navio-tanque", size: 4 },
];

// Converter navios mockados para o formato de cells do GameBoard
function buildCellsMap(ships) {
  const cells = {};
  for (const ship of ships) {
    for (const [col, row] of ship.cells) {
      cells[`${col}${row}`] = "ship";
    }
  }
  return cells;
}

function ShipPlacementPage() {
  const navigate = useNavigate();
  const cells = buildCellsMap(MOCK_SHIPS);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header />
      <LayoutPage interClassName="p-4 pb-8">
        {/* Voltar */}
        <div className="flex w-full">
          <button
            onClick={() => navigate("/game/waiting-room")}
            className="flex items-center gap-2 font-poppins text-sm text-blue-300 hover:text-orange-300 transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} />
            SAIR DA BATALHA
          </button>
        </div>

        {/* Título */}
        <div className="flex flex-col items-center gap-1 w-full">
          <h2 className="font-anybody font-extrabold text-2xl md:text-3xl text-white text-center">
            Posicione seus <span className="text-orange-300">navios</span>
          </h2>
        </div>

        {/* Status da Batalha */}
        <Card className="flex flex-col gap-3 w-full max-w-4xl p-5">
          <span className="font-poppins font-semibold text-xs text-white/50 uppercase tracking-widest text-center">
            Status da Batalha
          </span>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-dark-900/60 border border-green-500/30">
              <CircleCheckBig size={22} className="text-green-400 shrink-0" />
              <div className="flex flex-col">
                <span className="font-poppins font-semibold text-sm text-green-400">
                  VOCÊ
                </span>
                <span className="font-poppins text-xs text-white/60">
                  Pronto
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-dark-900/60 border border-blue-300/20">
              <Loader
                size={22}
                className="text-blue-300 shrink-0 animate-spin"
              />
              <div className="flex flex-col">
                <span className="font-poppins font-semibold text-sm text-blue-300">
                  OPONENTE
                </span>
                <span className="font-poppins text-xs text-white/60">
                  Posicionando...
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Jogador + Tabuleiro + Frota */}
        <div className="flex flex-col md:flex-row gap-6 w-full max-w-4xl">
          {/* Tabuleiro */}
          <Card className="flex flex-col gap-4 w-full md:flex-1 p-5">
            {/* Info do jogador */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-blue-dark-900 border-2 border-blue-300 flex items-center justify-center">
                  <CircleUserRound size={20} className="text-blue-300" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-400 border-2 border-blue-dark" />
              </div>
              <div className="flex flex-col">
                <span className="font-poppins font-semibold text-sm text-orange-300">
                  Você
                </span>
                <span className="font-poppins text-xs text-white/50">
                  user123456
                </span>
              </div>
            </div>

            {/* Tabuleiro */}
            <GameBoard cells={cells} />

            {/* Botão Pronto */}
            <Button
              variant="primary"
              className="flex items-center justify-center gap-2 max-w-xs mx-auto"
              onClick={() => navigate("/game/play")}
            >
              <Check size={18} />
              PRONTO
            </Button>
          </Card>

          {/* Frota */}
          <Card className="flex flex-col gap-4 w-full md:w-64 p-5">
            <span className="font-poppins font-semibold text-xs text-white/50 uppercase tracking-widest text-center">
              Frota
            </span>
            <div className="grid grid-cols-3 md:grid-cols-1 gap-2">
              {FLEET.map((ship) => (
                <FleetCard key={ship.name} ship={ship} />
              ))}
            </div>
          </Card>
        </div>

        {/* Como posicionar */}
        <Card className="flex flex-col gap-3 w-full max-w-4xl p-5">
          <span className="font-poppins font-semibold text-xs text-white/50 uppercase tracking-widest text-center">
            Como Posicionar
          </span>
          <div className="flex flex-col gap-2.5">
            <InstructionItem
              icon={<MousePointerClick size={18} className="text-blue-300" />}
              text="Clique em uma célula para selecionar"
            />
            <InstructionItem
              icon={<RotateCw size={18} className="text-blue-300" />}
              text="Clique no navio para girar"
            />
            <InstructionItem
              icon={<X size={18} className="text-red-400" />}
              text="Clique com o botão direito para remover"
            />
          </div>
        </Card>
      </LayoutPage>
    </div>
  );
}

function FleetCard({ ship }) {
  return (
    <div className="flex flex-col items-center gap-2 p-3 rounded-xl bg-blue-dark-900/60 border border-blue-300/20">
      <Ship size={22} className="text-orange-300" />
      <span className="font-poppins font-medium text-xs text-white text-center">
        {ship.name} ({ship.size})
      </span>
      <div className="flex gap-0.5">
        {Array.from({ length: ship.size }).map((_, i) => (
          <div
            key={i}
            className="w-2.5 h-2.5 rounded-full bg-green-400/70 border border-green-300/50"
          />
        ))}
      </div>
    </div>
  );
}

function InstructionItem({ icon, text }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-dark-900/80 border border-white/10">
        {icon}
      </div>
      <span className="font-poppins text-sm text-white/70">{text}</span>
    </div>
  );
}

export default ShipPlacementPage;
