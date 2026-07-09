import { Users, Swords, Zap, LogIn, Loader2, Inbox } from "lucide-react";
import Card from "../ui/Card";

/**
 * LobbyPanel - Lista de salas disponíveis para entrar.
 *
 * Props:
 * - rooms: array de salas com status WAITING
 * - onJoinRoom: (code: string) => void
 * - joiningCode: string | null (código da sala que está sendo acessada)
 * - loading: boolean (carregando lista inicial)
 */
function LobbyPanel({ rooms = [], onJoinRoom, joiningCode, loading }) {
  return (
    <Card className="flex flex-col gap-4 w-full p-5">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Users size={18} className="text-green-300" />
        <span className="font-poppins font-semibold text-white text-sm uppercase tracking-wider">
          Salas Disponíveis
        </span>
        {rooms.length > 0 && (
          <span className="ml-auto font-poppins text-[11px] text-white/40">
            {rooms.length} {rooms.length === 1 ? "sala" : "salas"}
          </span>
        )}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-6">
          <Loader2 size={20} className="text-white/40 animate-spin" />
        </div>
      )}

      {/* Empty state */}
      {!loading && rooms.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-6">
          <Inbox size={28} className="text-white/20" />
          <span className="font-poppins text-sm text-white/40 text-center">
            Nenhuma sala disponível. Crie a sua!
          </span>
        </div>
      )}

      {/* Room list */}
      {!loading && rooms.length > 0 && (
        <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
          {rooms.map((room) => (
            <RoomItem
              key={room.id}
              room={room}
              onJoin={() => onJoinRoom(room.code)}
              joining={joiningCode === room.code}
            />
          ))}
        </div>
      )}
    </Card>
  );
}

function RoomItem({ room, onJoin, joining }) {
  const isTactical = room.gameMode === "TACTICAL";

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-blue-dark-900/60 border border-white/10 hover:border-white/20 transition-colors">
      {/* Host info */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-full bg-blue-dark-900 border-2 border-blue-300/50 flex items-center justify-center shrink-0">
          <span className="font-poppins font-bold text-[11px] text-blue-300">
            {room.host?.nickname?.charAt(0)?.toUpperCase() || "?"}
          </span>
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-poppins font-medium text-sm text-white truncate">
            {room.host?.nickname || "Jogador"}
          </span>
          <span className="font-poppins text-[10px] text-white/40">
            {room.code}
          </span>
        </div>
      </div>

      {/* Game mode badge + Join button */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Mode badge */}
        <div
          className={`flex items-center gap-1 px-2 py-1 rounded-md border ${
            isTactical
              ? "border-yellow-400/30 bg-yellow-400/5"
              : "border-blue-300/30 bg-blue-300/5"
          }`}
        >
          {isTactical ? (
            <Zap size={11} className="text-yellow-300" />
          ) : (
            <Swords size={11} className="text-blue-300" />
          )}
          <span
            className={`font-poppins font-semibold text-[9px] uppercase ${
              isTactical ? "text-yellow-300" : "text-blue-300"
            }`}
          >
            {isTactical ? "Tático" : "Clássico"}
          </span>
        </div>

        {/* Join button */}
        <button
          onClick={onJoin}
          disabled={joining}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/20 border border-green-400/50 text-green-300 hover:bg-green-500/30 hover:border-green-400/70 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {joining ? (
            <Loader2 size={13} className="animate-spin" />
          ) : (
            <LogIn size={13} />
          )}
          <span className="font-poppins font-semibold text-[11px]">
            {joining ? "..." : "Entrar"}
          </span>
        </button>
      </div>
    </div>
  );
}

export default LobbyPanel;
