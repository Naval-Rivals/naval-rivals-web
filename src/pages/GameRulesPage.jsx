import Header from "../components/layout/Header";
import LayoutPage from "../components/layout/LayoutPage";
import BottomNav from "../components/layout/BottomNav";
import Card from "../components/ui/Card";
import SectionTitle from "../components/ui/SectionTitle";
import RuleItem from "../components/ui/RuleItem";
import Footer from "../components/layout/Footer";
import { BookOpen, Ship, Crosshair, Trophy } from "lucide-react";

function GameRulesPage() {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header />
      <LayoutPage interClassName="p-4 pb-20 md:pb-8">
        {/* Header da página */}
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

        {/* Regras principais */}
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
            <ShipRow name="Contratorpedeiro" size={3} />
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

export default GameRulesPage;
