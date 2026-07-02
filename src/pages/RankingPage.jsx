import { Trophy } from "lucide-react";
import Header from "../components/layout/Header";
import LayoutPage from "../components/layout/LayoutPage";
import BottomNav from "../components/layout/BottomNav";
import Card from "../components/ui/Card";
import { MedalIcon } from "@phosphor-icons/react";
import Footer from "../components/layout/Footer";

const rankingData = [
  { position: 1, name: "CommanderX", victories: 312, winRate: "87%" },
  { position: 2, name: "SeaWolf", victories: 245, winRate: "74%" },
  { position: 3, name: "NavalKing", victories: 189, winRate: "68%" },
  { position: 4, name: "DarkTide", victories: 142, winRate: "61%" },
  { position: 5, name: "CaiobaTeste", victories: 142, winRate: "62%" },
];

function getMedalColor(position) {
  switch (position) {
    case 1:
      return "fill-yellow-400 text-yellow-400";
    case 2:
      return "fill-gray-300 text-gray-300";
    case 3:
      return "fill-orange-600 text-orange-600";
    default:
      return "fill-blue-300 text-blue-300";
  }
}

function RankingPage() {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header />
      <LayoutPage interClassName="p-4 pb-20 md:pb-4">
        <Card className="flex gap-4 flex-col w-full p-6">
          <div className="flex w-full items-center gap-4">
            <div className="rounded-full p-2 bg-blue-dark-900 border-2 border-orange-400">
              <Trophy className="text-orange-300 w-12 h-12" />
            </div>
            <div className="flex flex-col gap-0.5">
              <h1 className="text-white font-poppins font-semibold text-2xl">
                RANKING
              </h1>
              <span className="font-poppins text-sm text-white/50">
                Os melhores capitães dos 7 mares
              </span>
            </div>
          </div>

          <div className="flex items-center px-2 py-2">
            <span className="min-w-10 text-center font-poppins text-xs text-white/40 uppercase tracking-wider">
              Posição
            </span>
            <span className="flex-1 ml-6 lg:ml-10 font-poppins text-xs text-white/40 uppercase tracking-wider">
              Jogador
            </span>
            <span className="font-poppins text-xs text-white/40 uppercase tracking-wider w-14 text-center">
              Vitórias
            </span>
            <span className="font-poppins text-xs text-white/40 uppercase tracking-wider w-14 md:w-32 text-center ml-4 lg:ml-10">
              Taxa
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {rankingData.map((player) => (
              <div
                key={player.position}
                className="flex items-center p-3 rounded-xl bg-blue-dark-900 border border-blue-300/30 text-white/80 hover:border-orange-400/50 hover:text-white transition-all duration-200"
              >
                {player.position <= 3 ? (
                  <div className="relative min-w-10 h-10">
                    <MedalIcon
                      className={`w-full h-full ${getMedalColor(player.position).split(" ")[0]}`}
                      weight="light"
                    />
                    <span
                      className={`absolute inset-0 flex items-center justify-center -translate-y-1 lg:-translate-y-1.5 font-bold text-xs ${getMedalColor(player.position).split(" ")[1]}`}
                    >
                      {player.position}
                    </span>
                  </div>
                ) : (
                  <div className="min-w-10 h-10 flex items-center justify-center">
                    <span className="font-anybody font-bold text-lg text-white/50">
                      {player.position}
                    </span>
                  </div>
                )}

                <span className="flex-1 ml-6 lg:ml-10 font-poppins font-medium text-sm truncate">
                  {player.name}
                </span>
                <span className="font-poppins font-semibold text-sm text-white w-14 text-center">
                  {player.victories}
                </span>

                <div className="flex items-center gap-2 w-14 md:w-32 justify-center md:justify-end ml-4 lg:ml-10">
                  <div className="hidden md:block flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-orange-400"
                      style={{ width: player.winRate }}
                    />
                  </div>
                  <span className="font-poppins font-semibold text-sm text-orange-300 min-w-10 text-center">
                    {player.winRate}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Footer />
      </LayoutPage>
      <BottomNav />
    </div>
  );
}

export default RankingPage;
