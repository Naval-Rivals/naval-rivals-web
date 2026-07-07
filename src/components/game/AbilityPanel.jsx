import { useState } from "react";
import { Zap, Rocket, Radar, Shield, Radio, HelpCircle, X } from "lucide-react";
import HelpItem from "./HelpItem";
import AbilityButton from "./AbilityButton";

/**
 * AbilityPanel - Painel de habilidades do modo tático (sempre visível).
 *
 * Props:
 * - abilities: { radarAvailable, shieldCharges, shieldActive, empNavalAvailable, empDisabledTurns }
 * - isMyTurn: boolean
 * - onUseAbility: (ability) => void
 * - torpedoAvailable: boolean
 * - torpedoMode: boolean
 * - onToggleTorpedo: () => void
 * - radarMode: boolean
 * - onToggleRadar: () => void
 * - disabled: boolean (when attacking/waiting response)
 */
function AbilityPanel({
  abilities = {},
  isMyTurn,
  onUseAbility,
  torpedoAvailable,
  torpedoMode,
  onToggleTorpedo,
  radarMode,
  onToggleRadar,
  disabled,
}) {
  const [showHelp, setShowHelp] = useState(false);

  const {
    radarAvailable = false,
    shieldCharges = 0,
    shieldActive = false,
    empNavalAvailable = false,
    empDisabledTurns = 0,
  } = abilities;

  const isEmpDisabled = empDisabledTurns > 0;

  return (
    <div className="w-full max-w-4xl">
      <div className="relative flex flex-col gap-3 p-4 rounded-xl bg-blue-dark-900/60 border border-white/10">
        {/* EMP Overlay */}
        {isEmpDisabled && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-xl bg-black/60 backdrop-blur-xs">
            <Zap size={28} className="text-yellow-400 mb-2" />
            <span className="font-poppins font-bold text-yellow-300 text-sm">
              ⚡ HABILIDADES DESATIVADAS
            </span>
            <span className="font-poppins text-yellow-300/70 text-xs mt-1">
              {empDisabledTurns}{" "}
              {empDisabledTurns === 1 ? "turno restante" : "turnos restantes"}
            </span>
          </div>
        )}

        {/* Header with help button */}
        <div className="flex items-center justify-between">
          <span className="font-poppins font-semibold text-[10px] text-white/40 uppercase tracking-widest">
            Habilidades
          </span>
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-white/40 hover:text-white/70 hover:bg-white/5 transition-colors cursor-pointer"
            aria-label="Como funcionam as habilidades"
          >
            {showHelp ? <X size={13} /> : <HelpCircle size={13} />}
            <span className="font-poppins text-[10px]">
              {showHelp ? "Fechar" : "Como funciona?"}
            </span>
          </button>
        </div>

        {/* Help panel */}
        {showHelp && (
          <div className="flex flex-col gap-2 p-3 rounded-lg bg-white/5 border border-white/10">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <HelpItem
                icon={<Rocket size={13} className="text-red-400" />}
                name="Torpedo"
                desc="Afunda navio inteiro se acertar"
                meta="1 uso · consome turno"
              />
              <HelpItem
                icon={<Radar size={13} className="text-green-400" />}
                name="Radar"
                desc="Revela navios em área 3×3"
                meta="1 uso · consome turno"
              />
              <HelpItem
                icon={<Shield size={13} className="text-blue-400" />}
                name="Escudo"
                desc="Bloqueia o próximo tiro recebido"
                meta="2 usos · não consome turno"
              />
              <HelpItem
                icon={<Radio size={13} className="text-yellow-400" />}
                name="EMP Naval"
                desc="Desativa habilidades do inimigo por 2 turnos"
                meta="1 uso · consome turno"
              />
            </div>
            <span className="font-poppins text-[9px] text-white/35 text-center mt-1">
              Escudo pode ser ativado antes do ataque. As demais substituem o
              ataque do turno.
            </span>
          </div>
        )}

        {/* Ability buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {/* Torpedo */}
          <AbilityButton
            icon={<Rocket size={18} />}
            label="Torpedo"
            sublabel={torpedoAvailable ? "1 uso" : "Usado"}
            color="red"
            active={torpedoMode}
            disabled={
              !isMyTurn || !torpedoAvailable || isEmpDisabled || disabled
            }
            onClick={onToggleTorpedo}
          />

          {/* Radar */}
          <AbilityButton
            icon={<Radar size={18} />}
            label="Radar"
            sublabel={radarAvailable ? "1 uso" : "Usado"}
            color="green"
            active={radarMode}
            disabled={!isMyTurn || !radarAvailable || isEmpDisabled || disabled}
            onClick={onToggleRadar}
          />

          {/* Escudo */}
          <AbilityButton
            icon={<Shield size={18} />}
            label="Escudo"
            sublabel={shieldActive ? "Ativo" : `${shieldCharges}x`}
            color="blue"
            active={shieldActive}
            disabled={
              !isMyTurn ||
              shieldActive ||
              shieldCharges <= 0 ||
              isEmpDisabled ||
              disabled
            }
            onClick={() => onUseAbility("SHIELD")}
          />

          {/* EMP Naval */}
          <AbilityButton
            icon={<Radio size={18} />}
            label="EMP Naval"
            sublabel={empNavalAvailable ? "1 uso" : "Usado"}
            color="yellow"
            active={false}
            disabled={
              !isMyTurn || !empNavalAvailable || isEmpDisabled || disabled
            }
            onClick={() => onUseAbility("EMP_NAVAL")}
          />
        </div>

        {/* Active mode indicators */}
        {torpedoMode && (
          <span className="font-poppins text-xs text-red-300 text-center animate-pulse">
            Torpedo ativo — clique numa célula para disparar
          </span>
        )}
        {radarMode && (
          <span className="font-poppins text-xs text-green-300 text-center animate-pulse">
            Radar ativo — passe o mouse no tabuleiro inimigo e clique para
            escanear
          </span>
        )}
      </div>
    </div>
  );
}

export default AbilityPanel;
