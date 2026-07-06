import { useState, useEffect, useCallback } from "react";
import { Trophy, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { MedalIcon } from "@phosphor-icons/react";
import Header from "../components/layout/Header";
import LayoutPage from "../components/layout/LayoutPage";
import BottomNav from "../components/layout/BottomNav";
import Card from "../components/ui/Card";
import Footer from "../components/layout/Footer";
import { api } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

const PAGE_SIZE = 10;

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
  const { user } = useAuth();
  const [ranking, setRanking] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRanking = useCallback(async (pageNumber) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get(
        `/ranking?page=${pageNumber}&size=${PAGE_SIZE}`,
      );
      setRanking(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
      setPage(data.number);
    } catch (err) {
      setError(err.message || "Erro ao carregar ranking");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRanking(0);
  }, [fetchRanking]);

  function handlePrevPage() {
    if (page > 0) {
      fetchRanking(page - 1);
    }
  }

  function handleNextPage() {
    if (page < totalPages - 1) {
      fetchRanking(page + 1);
    }
  }

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

          {/* Table header */}
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
            <span className="font-poppins text-xs text-white/40 uppercase tracking-wider w-14 text-center hidden sm:block ml-4 lg:ml-10">
              Jogos
            </span>
            <span className="font-poppins text-xs text-white/40 uppercase tracking-wider w-14 md:w-32 text-center ml-4 lg:ml-10">
              Taxa
            </span>
          </div>

          {/* Content */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-orange-400 animate-spin" />
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <p className="text-red-400 font-poppins text-sm">{error}</p>
              <button
                onClick={() => fetchRanking(page)}
                className="text-orange-400 hover:text-orange-300 font-poppins text-sm underline cursor-pointer"
              >
                Tentar novamente
              </button>
            </div>
          )}

          {!loading && !error && ranking.length === 0 && (
            <div className="flex items-center justify-center py-12">
              <p className="text-white/50 font-poppins text-sm">
                Nenhum jogador no ranking ainda.
              </p>
            </div>
          )}

          {!loading && !error && ranking.length > 0 && (
            <>
              <div className="flex flex-col gap-3">
                {ranking.map((player) => {
                  const isCurrentUser = player.userId === user?.id;
                  return (
                    <div
                      key={player.userId}
                      className={`flex items-center p-3 rounded-xl bg-blue-dark-900 border text-white/80 transition-all duration-200 ${
                        isCurrentUser
                          ? "border-orange-400/70 bg-orange-400/5"
                          : "border-blue-300/30 hover:border-orange-400/50 hover:text-white"
                      }`}
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

                      <span
                        className={`flex-1 ml-6 lg:ml-10 font-poppins font-medium text-sm truncate ${
                          isCurrentUser ? "text-orange-300" : ""
                        }`}
                      >
                        {player.nickname}
                        {isCurrentUser && (
                          <span className="ml-2 text-xs text-orange-400/70">
                            (você)
                          </span>
                        )}
                      </span>
                      <span className="font-poppins font-semibold text-sm text-white w-14 text-center ">
                        {player.victories}
                      </span>
                      <span className="font-poppins font-semibold text-sm text-white/60 w-14 text-center hidden sm:block ml-4 lg:ml-8">
                        {player.totalGames}
                      </span>

                      <div className="flex items-center gap-2 w-14 md:w-32 justify-center md:justify-end ml-2 lg:ml-10">
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
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <span className="font-poppins text-xs text-white/40">
                    {totalElements} jogadores no total
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePrevPage}
                      disabled={page === 0}
                      className="p-2 rounded-lg border border-white/10 text-white/60 hover:text-white hover:border-orange-400/50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all"
                      aria-label="Página anterior"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <span className="font-poppins text-sm text-white/70 px-2">
                      {page + 1} / {totalPages}
                    </span>
                    <button
                      onClick={handleNextPage}
                      disabled={page >= totalPages - 1}
                      className="p-2 rounded-lg border border-white/10 text-white/60 hover:text-white hover:border-orange-400/50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all"
                      aria-label="Próxima página"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </Card>
        <Footer />
      </LayoutPage>
      <BottomNav />
    </div>
  );
}

export default RankingPage;
