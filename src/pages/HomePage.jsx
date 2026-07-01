import Header from "../components/layout/Header";
import LayoutPage from "../components/layout/LayoutPage";
import BottomNav from "../components/layout/BottomNav";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import SectionTitle from "../components/ui/SectionTitle";
import RuleItem from "../components/ui/RuleItem";
import InfoCard from "../components/ui/InfoCard";
import Input from "../components/ui/Input";
import {
  Swords,
  LogIn,
  Target,
  Trophy,
  Users,
  Shield,
  Crosshair,
} from "lucide-react";
import { useState } from "react";
import logo from "../assets/logo-naval-rivals.png";
import Footer from "../components/layout/Footer";

function HomePage() {
  const [roomCode, setRoomCode] = useState("");

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header />
      <LayoutPage interClassName="p-4 pb-20 md:pb-8">
        <Card className="flex flex-col items-center gap-6 w-full p-6">
          <div className="flex flex-col items-center gap-2">
            <div className="w-24 shadow-md rounded-2xl shadow-orange-500">
              <img src={logo} alt="Logo Naval Rivals" className="rounded-2xl" />
            </div>
            <SectionTitle className="text-2xl text-center">
              Prepare-se para o Combate
            </SectionTitle>
            <p className="font-poppins font-light text-white/70 text-center text-sm">
              Desafie outros capitães ou entre numa batalha já criada
            </p>
          </div>

          <div className="flex flex-col sm:flex-row w-full gap-3">
            <Button
              variant="primary"
              className="flex items-center justify-center gap-2"
            >
              <Swords size={18} />
              CRIAR BATALHA
            </Button>
            <Button
              variant="secondary"
              className="flex items-center justify-center gap-2"
            >
              <Users size={18} />
              BATALHA ALEATÓRIA
            </Button>
          </div>

          <div className="flex flex-col w-full gap-2">
            <span className="font-poppins text-xs text-white/50 uppercase tracking-wider text-center">
              Ou entre com um código de sala
            </span>
            <div className="flex flex-col sm:flex-row w-full gap-2">
              <Input
                placeholder="Digite o código da sala"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
              />
              <Button
                variant="ghost"
                className="flex items-center justify-center gap-2 sm:w-auto sm:min-w-40 border-blue-300! text-blue-300!"
              >
                <LogIn size={18} />
                ENTRAR
              </Button>
            </div>
          </div>
        </Card>

        <Card className="flex flex-col gap-4 w-full p-6">
          <SectionTitle>Sobre o Naval Rivals</SectionTitle>
          <p className="font-poppins font-light text-sm text-white/80 leading-relaxed">
            Naval Rivals é um jogo de estratégia naval online onde dois capitães
            se enfrentam em batalhas táticas no mar. Posicione sua frota,
            escolha seus alvos com precisão e afunde os navios inimigos antes
            que eles afundem os seus. Cada decisão conta — a vitória pertence ao
            comandante mais astuto.
          </p>

          <div className="flex flex-wrap gap-3 mt-2">
            <InfoCard
              icon={<Target size={24} />}
              title="Estratégia em Tempo Real"
              description="Ataques alternados com tempo limitado para decidir"
            />
            <InfoCard
              icon={<Trophy size={24} />}
              title="Sistema de Ranking"
              description="Suba de posição e prove que é o melhor capitão"
            />
            <InfoCard
              icon={<Shield size={24} />}
              title="Frotas Personalizáveis"
              description="Posicione seus navios da forma que preferir"
            />
            <InfoCard
              icon={<Crosshair size={24} />}
              title="Mira Precisa"
              description="Acerte os navios inimigos com tiros calculados"
            />
          </div>
        </Card>

        <Card className="flex flex-col gap-4 w-full p-6">
          <SectionTitle>Regras do Jogo</SectionTitle>
          <div className="flex flex-col gap-4">
            <RuleItem
              number={1}
              title="Posicione sua frota"
              description="Antes da batalha começar, organize seus navios no tabuleiro. Eles podem ser posicionados na horizontal ou vertical."
            />
            <RuleItem
              number={2}
              title="Ataques alternados"
              description="Cada jogador ataca uma coordenada por turno. Se acertar um navio, o turno continua com você."
            />
            <RuleItem
              number={3}
              title="Afunde todos os navios"
              description="O objetivo é afundar toda a frota inimiga. Um navio é afundado quando todas as suas coordenadas são atingidas."
            />
            <RuleItem
              number={4}
              title="Tempo limitado"
              description="Cada jogador tem um tempo máximo por turno. Se o tempo acabar, o turno é passado automaticamente."
            />
            <RuleItem
              number={5}
              title="Vitória"
              description="O primeiro capitão a destruir completamente a frota inimiga vence a batalha e sobe no ranking."
            />
          </div>
        </Card>
        <Footer />
      </LayoutPage>
      <BottomNav />
    </div>
  );
}

export default HomePage;
