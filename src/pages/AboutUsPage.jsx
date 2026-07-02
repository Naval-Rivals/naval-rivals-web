import Header from "../components/layout/Header";
import LayoutPage from "../components/layout/LayoutPage";
import BottomNav from "../components/layout/BottomNav";
import Card from "../components/ui/Card";
import SectionTitle from "../components/ui/SectionTitle";
import InfoCard from "../components/ui/InfoCard";
import Footer from "../components/layout/Footer";
import { Target, Trophy, Shield, Crosshair, Anchor, Waves } from "lucide-react";
import logo from "../assets/logo-naval-rivals.png";

function AboutUsPage() {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header />
      <LayoutPage interClassName="p-4 pb-20 md:pb-8">
        <div className="flex flex-col items-center gap-4 pt-4 pb-2 w-full">
          <div className="w-20 shadow-md rounded-2xl shadow-orange-500/30">
            <img src={logo} alt="Logo Naval Rivals" className="rounded-2xl" />
          </div>
          <h2 className="font-anybody font-extrabold text-2xl md:text-3xl text-white text-center">
            Sobre o <span className="text-orange-300">Naval Rivals</span>
          </h2>
        </div>

        <Card className="flex flex-col gap-4 w-full p-6">
          <div className="flex items-center gap-3">
            <Anchor size={24} className="text-blue-300 shrink-0" />
            <SectionTitle>O que é o Naval Rivals?</SectionTitle>
          </div>
          <p className="font-poppins font-light text-sm text-white/80 leading-relaxed">
            Naval Rivals é um jogo de estratégia naval online onde dois capitães
            se enfrentam em batalhas táticas no mar. Posicione sua frota,
            escolha seus alvos com precisão e afunde os navios inimigos antes
            que eles afundem os seus.
          </p>
          <p className="font-poppins font-light text-sm text-white/80 leading-relaxed">
            Cada decisão conta — a vitória pertence ao comandante mais astuto.
            Suba no ranking, prove seu valor e conquiste a glória nos mares!
          </p>
        </Card>

        <Card className="flex flex-col gap-4 w-full p-6">
          <div className="flex items-center gap-3">
            <Waves size={24} className="text-orange-300 shrink-0" />
            <SectionTitle>Por que jogar?</SectionTitle>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InfoCard
              icon={<Target size={24} />}
              title="Estratégia em Tempo Real"
              description="Ataques alternados com tempo limitado para decidir. Pense rápido!"
            />
            <InfoCard
              icon={<Trophy size={24} />}
              title="Sistema de Ranking"
              description="Suba de posição a cada vitória e prove que é o melhor capitão."
            />
            <InfoCard
              icon={<Shield size={24} />}
              title="Frotas Personalizáveis"
              description="Posicione seus navios da forma que preferir. Sua estratégia, suas regras."
            />
            <InfoCard
              icon={<Crosshair size={24} />}
              title="Mira Precisa"
              description="Acerte os navios inimigos com tiros calculados e afunde a frota rival."
            />
          </div>
        </Card>

        <Card className="flex flex-col gap-4 w-full p-6">
          <SectionTitle>Como funciona?</SectionTitle>
          <div className="flex flex-col gap-3">
            <StepItem
              step="1"
              title="Crie ou entre numa sala"
              description="Gere um código de sala para desafiar um amigo ou entre numa batalha aleatória."
            />
            <StepItem
              step="2"
              title="Posicione sua frota"
              description="Organize estrategicamente seus 5 navios no tabuleiro 10x10."
            />
            <StepItem
              step="3"
              title="Batalhe!"
              description="Alterne ataques com seu oponente até um dos capitães dominar o mar."
            />
          </div>
        </Card>

        <Footer />
      </LayoutPage>
      <BottomNav />
    </div>
  );
}

function StepItem({ step, title, description }) {
  return (
    <div className="flex gap-3 items-start">
      <span className="flex items-center justify-center min-w-9 h-9 rounded-full bg-linear-to-b from-orange-400 to-orange-600 text-white font-anybody font-bold text-sm shadow-md shadow-orange-500/30">
        {step}
      </span>
      <div className="flex flex-col gap-0.5">
        <span className="font-poppins font-semibold text-sm text-white">
          {title}
        </span>
        <span className="font-poppins font-light text-sm text-white/60">
          {description}
        </span>
      </div>
    </div>
  );
}

export default AboutUsPage;
