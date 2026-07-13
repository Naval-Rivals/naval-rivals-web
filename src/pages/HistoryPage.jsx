import { Helmet } from "react-helmet-async";
import Header from "../components/layout/Header";
import LayoutPage from "../components/layout/LayoutPage";
import Footer from "../components/layout/Footer";
import BottomNav from "../components/layout/BottomNav";
import Card from "../components/ui/Card";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
  Swords,
  Trophy,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { api } from "../services/api";
import Spinner from "../components/ui/Spinner";

const PAGE_SIZE = 10;

function formatDuration(seconds) {
  if (!seconds && seconds !== 0) return "--:--";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return (
    date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }) +
    " " +
    date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    })
  );
}

function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHistory = useCallback(async (pageNumber) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get(
        `/users/me/matches?page=${pageNumber}&size=${PAGE_SIZE}`,
      );
      setHistory(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
      setPage(data.number);
    } catch (err) {
      setError(err.message || "Erro ao carregar histórico");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory(0);
  }, [fetchHistory]);

  function handlePrevPage() {
    if (page > 0) {
      fetchHistory(page - 1);
    }
  }

  function handleNextPage() {
    if (page < totalPages - 1) {
      fetchHistory(page + 1);
    }
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden relative">
      <Helmet>
        <title>Histórico - Naval Rivals</title>
      </Helmet>
      <Header />
      <LayoutPage interClassName="p-4 pb-20 md:pb-8">
        <Card className="flex gap-4 flex-col w-full p-6">
          {/* Header */}
          <div className="flex w-full items-center gap-4">
            <div className="rounded-full p-2 bg-blue-dark-900 border-2 border-orange-400">
              <Swords className="text-orange-300 w-12 h-12" />
            </div>
            <div className="flex flex-col gap-0.5">
              <h1 className="text-white font-poppins font-semibold text-2xl">
                HISTÓRICO DE GUERRA
              </h1>
              <span className="font-poppins text-sm text-white/50">
                Todas as suas batalhas
              </span>
            </div>
          </div>

          {/* Loading states */}
          {loading && history.length === 0 && (
            <Spinner message="Carregando batalhas..." />
          )}

          {loading && history.length > 0 && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-orange-400 animate-spin" />
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <p className="text-red-400 font-poppins text-sm">{error}</p>
              <button
                onClick={() => fetchHistory(page)}
                className="text-orange-400 hover:text-orange-300 font-poppins text-sm underline cursor-pointer"
              >
                Tentar novamente
              </button>
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && history.length === 0 && (
            <div className="flex items-center justify-center py-12">
              <p className="text-white/50 font-poppins text-sm">
                Nenhuma batalha travada ainda
              </p>
            </div>
          )}

          {/* Battle cards */}
          {!loading && !error && history.length > 0 && (
            <>
              <div className="flex flex-col gap-3">
                {history.map((match) => {
                  const isVictory = match.victory;
                  const gameModeName =
                    match.gameMode === "CLASSIC" ? "Clássico" : "Tático";
                  const myShips = match.myStats?.shipsDestroyed ?? 0;
                  const opponentShips =
                    match.opponentStats?.shipsDestroyed ?? 0;

                  return (
                    <div
                      key={match.gameId}
                      className={`relative overflow-hidden rounded-xl border transition-all duration-200 ${
                        isVictory
                          ? "border-green-500/30 hover:border-green-400/50"
                          : "border-red-500/30 hover:border-red-400/50"
                      }`}
                    >
                      {/* Gradient accent bar on left */}
                      <div
                        className={`absolute left-0 top-0 bottom-0 w-1 ${
                          isVictory ? "bg-green-500" : "bg-red-500"
                        }`}
                      />

                      <div className="flex items-center gap-3 md:gap-5 p-4 pl-5 bg-blue-dark-900">
                        {/* Result icon */}
                        <div className="flex-shrink-0">
                          {isVictory ? (
                            <div className="w-11 h-11 rounded-full border-2 border-green-500/60 flex items-center justify-center bg-green-500/10">
                              <Trophy className="w-5 h-5 text-green-400" />
                            </div>
                          ) : (
                            <div className="w-11 h-11 rounded-full border-2 border-red-500/60 flex items-center justify-center bg-red-500/10">
                              <XCircle className="w-5 h-5 text-red-400" />
                            </div>
                          )}
                        </div>

                        {/* Main info */}
                        <div className="flex flex-col gap-1 min-w-0 flex-1">
                          {/* Opponent + Badge inline */}
                          <div className="flex items-center gap-2">
                            <span className="font-poppins font-semibold text-sm md:text-base text-white truncate">
                              {match.opponentNickname || "Oponente"}
                            </span>
                            <span
                              className={`flex-shrink-0 px-2 py-0.5 rounded-full font-poppins font-bold text-[10px] ${
                                isVictory
                                  ? "text-green-300 bg-green-500/15"
                                  : "text-red-300 bg-red-500/15"
                              }`}
                            >
                              {isVictory ? "VITÓRIA" : "DERROTA"}
                            </span>
                          </div>

                          {/* Meta info row */}
                          <div className="flex items-center gap-3 font-poppins text-xs text-white/40">
                            <span className="flex items-center gap-1">
                              <Swords className="w-3 h-3" />
                              {gameModeName}
                            </span>
                            <span className="hidden sm:inline">•</span>
                            <span className="hidden sm:flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDuration(match.durationSeconds)}
                            </span>
                            <span>•</span>
                            <span>{formatDate(match.playedAt)}</span>
                          </div>
                        </div>

                        {/* Score */}
                        <div className="flex-shrink-0 flex flex-col items-center">
                          <span className="font-poppins text-[10px] uppercase text-white/30 tracking-wider mb-0.5">
                            Placar
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`font-poppins font-bold text-xl md:text-2xl ${
                                isVictory ? "text-green-400" : "text-white/80"
                              }`}
                            >
                              {myShips}
                            </span>
                            <span className="font-poppins text-white/30 text-lg">
                              :
                            </span>
                            <span
                              className={`font-poppins font-bold text-xl md:text-2xl ${
                                !isVictory ? "text-red-400" : "text-white/80"
                              }`}
                            >
                              {opponentShips}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <span className="font-poppins text-xs text-white/40">
                    Exibindo as últimas {totalElements} batalhas
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

              {/* Footer text for single page */}
              {totalPages <= 1 && totalElements > 0 && (
                <div className="flex items-center justify-center pt-4 border-t border-white/10">
                  <span className="font-poppins text-xs text-white/40 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    Exibindo as últimas {totalElements} batalhas
                  </span>
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

export default HistoryPage;
