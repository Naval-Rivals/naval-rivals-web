import Header from "../components/layout/Header";
import LayoutPage from "../components/layout/LayoutPage";
import BottomNav from "../components/layout/BottomNav";
import Card from "../components/ui/Card";
import SectionTitle from "../components/ui/SectionTitle";
import RuleItem from "../components/ui/RuleItem";
import Footer from "../components/layout/Footer";
import {
  BookOpen,
  Ship,
  Crosshair,
  Trophy,
  Zap,
  Rocket,
  Radar,
  Shield,
  Radio,
} from "lucide-react";
import { Helmet } from "react-helmet-async";

function GameRulesPage() {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Helmet>
        <title>Regras - Naval Rivals</title>
      </Helmet>
      <Header />
      <LayoutPage interClassName="p-4 pb-20 md:pb-8">
        <div className="flex flex-col items-center gap-2 pt-4 pb-2 w-full">
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-blue-dark-900 border-2 border-orange-300/50">
            <BookOpen size={28} className="text-orange-300" />
          </div>
          <h2 className="font-anybody font-extrabold text-2xl md:text-3xl text-white text-center">
            Regras do <span className="text-orange-300">Jogo</span>
          </h2>
          <p className="font-poppins font-light text-white/60 text-center text-sm max-w-sm">
            Aprenda como dominar os mares e se tornar o melhor capitão
          </p>
        </div>

        <Card className="flex flex-col gap-5 w-full p-6">
          <div className="flex items-center gap-3">
            <Ship size={22} className="text-blue-300 shrink-0" />
            <SectionTitle>Como Jogar</SectionTitle>
          </div>
          <div className="flex flex-col gap-4">
            <RuleItem
              number={1}
              title="Posicione sua frota"
              description="Antes da batalha começar, organize seus navios no tabuleiro 10×10. Eles podem ser posicionados na horizontal ou vertical, sem sobreposição."
            />
            <RuleItem
              number={2}
              title="Ataques alternados"
              description="Cada jogador ataca uma coordenada por turno. Se acertar um navio, o turno continua com você. Se errar, passa a vez."
            />
            <RuleItem
              number={3}
              title="Afunde todos os navios"
              description="O objetivo é afundar toda a frota inimiga. Um navio é afundado quando todas as suas coordenadas são atingidas."
            />
            <RuleItem
              number={4}
              title="Tempo limitado"
              description="Cada jogador tem um tempo máximo por turno. Se o tempo acabar, o turno é passado automaticamente para o oponente."
            />
            <RuleItem
              number={5}
              title="Vitória"
              description="O primeiro capitão a destruir completamente a frota inimiga vence a batalha e sobe no ranking!"
            />
          </div>
        </Card>

        {/* Navios */}
        <Card className="flex flex-col gap-4 w-full p-6">
          <div className="flex items-center gap-3">
            <Crosshair size={22} className="text-orange-300 shrink-0" />
            <SectionTitle>Sua Frota</SectionTitle>
          </div>
          <p className="font-poppins font-light text-xs text-white/60">
            Cada jogador possui 5 navios para posicionar no tabuleiro:
          </p>
          <div className="flex flex-col gap-2.5">
            <ShipRow name="Porta-aviões" size={5} />
            <ShipRow name="Navio-tanque" size={4} />
            <ShipRow name="Cruzador" size={3} />
            <ShipRow name="Submarino" size={3} />
            <ShipRow name="Destroyer" size={2} />
          </div>
        </Card>

        {/* Dicas */}
        <Card className="flex flex-col gap-4 w-full p-6">
          <div className="flex items-center gap-3">
            <Trophy size={22} className="text-yellow-400 shrink-0" />
            <SectionTitle>Dicas de Capitão</SectionTitle>
          </div>
          <div className="flex flex-col gap-3">
            <TipItem text="Espalhe seus navios pelo tabuleiro — agrupá-los facilita a vida do inimigo." />
            <TipItem text="Se acertar um tiro, ataque as coordenadas adjacentes para encontrar o restante do navio." />
            <TipItem text="Preste atenção ao padrão de ataques do oponente para prever seus próximos movimentos." />
            <TipItem text="Use o tempo do turno com sabedoria — decisões apressadas custam batalhas." />
          </div>
        </Card>

        {/* Modo Tático */}
        <Card className="flex flex-col gap-5 w-full p-6">
          <div className="flex items-center gap-3">
            <Zap size={22} className="text-yellow-300 shrink-0" />
            <SectionTitle>Modo Tático</SectionTitle>
          </div>
          <p className="font-poppins font-light text-xs text-white/60">
            O modo tático adiciona 4 habilidades especiais à batalha clássica.
            Cada habilidade tem usos limitados — use com estratégia!
          </p>

          <div className="flex flex-col gap-3">
            <AbilityRow
              icon={<Rocket size={16} className="text-red-400" />}
              name="Torpedo"
              uses="1 uso"
              turnCost="Consome turno"
              description="Tiro devastador: se acertar qualquer parte de um navio, ele afunda inteiro. Se errar, funciona como tiro normal."
            />
            <AbilityRow
              icon={<Radar size={16} className="text-green-400" />}
              name="Radar"
              uses="1 uso"
              turnCost="Consome turno"
              description="Escaneia uma área 3×3 no tabuleiro inimigo e revela quais células possuem navios (sem revelar o tipo)."
            />
            <AbilityRow
              icon={<Shield size={16} className="text-blue-400" />}
              name="Escudo"
              uses="2 usos"
              turnCost="Não consome turno"
              description="Ativa uma barreira protetora. O próximo tiro recebido (normal ou torpedo) é bloqueado. Você ainda pode atacar no mesmo turno."
            />
            <AbilityRow
              icon={<Radio size={16} className="text-yellow-400" />}
              name="EMP Naval"
              uses="1 uso"
              turnCost="Consome turno"
              description="Desativa todas as habilidades do oponente por 2 turnos dele. Ele só poderá disparar tiros normais durante esse período."
            />
          </div>

          <div className="flex flex-col gap-2 p-3 rounded-lg bg-white/5 border border-white/10">
            <span className="font-poppins font-semibold text-[11px] text-white/80">
              Como funciona o turno no modo tático:
            </span>
            <div className="flex flex-col gap-1">
              <span className="font-poppins text-[10px] text-white/50 leading-relaxed">
                1. Você pode ativar o{" "}
                <span className="text-blue-300">Escudo</span> (não gasta o
                turno)
              </span>
              <span className="font-poppins text-[10px] text-white/50 leading-relaxed">
                2. Depois, escolha UMA ação: tiro normal, torpedo, radar ou EMP
              </span>
              <span className="font-poppins text-[10px] text-white/50 leading-relaxed">
                3. Se acertar um tiro (normal ou torpedo), você joga novamente!
              </span>
            </div>
          </div>
        </Card>

        <Footer />
      </LayoutPage>
      <BottomNav />
    </div>
  );
}

function ShipRow({ name, size }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-blue-dark-900/60 border border-white/10">
      <div className="flex items-center gap-2">
        <Ship size={16} className="text-blue-300" />
        <span className="font-poppins font-medium text-sm text-white">
          {name}
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="flex gap-0.5">
          {Array.from({ length: size }).map((_, i) => (
            <div
              key={i}
              className="w-5 h-5 rounded-sm bg-blue-400/80 border border-blue-300/50"
            />
          ))}
        </div>
        <span className="font-poppins text-xs text-white/50 ml-1">
          ({size})
        </span>
      </div>
    </div>
  );
}

function TipItem({ text }) {
  return (
    <div className="flex gap-2 items-start">
      <span className="text-orange-300 mt-0.5 shrink-0">•</span>
      <span className="font-poppins font-light text-sm text-white/70">
        {text}
      </span>
    </div>
  );
}

function AbilityRow({ icon, name, uses, turnCost, description }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-dark-900/60 border border-white/10">
      <div className="mt-0.5 shrink-0">{icon}</div>
      <div className="flex flex-col gap-1 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-poppins font-semibold text-sm text-white">
            {name}
          </span>
          <span className="font-poppins text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-white/60">
            {uses}
          </span>
          <span
            className={`font-poppins text-[9px] px-1.5 py-0.5 rounded ${
              turnCost === "Não consome turno"
                ? "bg-green-400/10 text-green-300/70"
                : "bg-orange-400/10 text-orange-300/70"
            }`}
          >
            {turnCost}
          </span>
        </div>
        <span className="font-poppins font-light text-xs text-white/55 leading-relaxed">
          {description}
        </span>
      </div>
    </div>
  );
}

export default GameRulesPage;
