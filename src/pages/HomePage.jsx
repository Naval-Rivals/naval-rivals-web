import Header from "../components/layout/Header";
import LayoutPage from "../components/layout/LayoutPage";
import BottomNav from "../components/layout/BottomNav";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { Swords, LogIn, Users, Anchor } from "lucide-react";
import { useState } from "react";
import logo from "../assets/logo-naval-rivals.png";
import Footer from "../components/layout/Footer";

function HomePage() {
  const [roomCode, setRoomCode] = useState("");

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header />
      <LayoutPage interClassName="p-4 pb-20 md:pb-8">
        <div className="flex flex-col items-center gap-3 pt-4 pb-2 w-full">
          <div className="w-28 shadow-lg rounded-2xl shadow-orange-500/40">
            <img src={logo} alt="Logo Naval Rivals" className="rounded-2xl" />
          </div>
          <h2 className="font-anybody font-extrabold text-3xl md:text-4xl text-white text-center leading-tight">
            Prepare-se para o <span className="text-orange-300">Combate</span>
          </h2>
          <p className="font-poppins font-light text-white/60 text-center text-sm max-w-md">
            Desafie outros capitães em batalhas navais épicas. Posicione sua
            frota, mire com precisão e domine os mares.
          </p>
        </div>

        <Card className="flex flex-col items-center gap-5 w-full p-6">
          <div className="flex items-center gap-2">
            <span className="font-poppins font-semibold text-white text-sm uppercase tracking-wider">
              Iniciar Batalha
            </span>
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

          <div className="flex items-center w-full gap-3">
            <div className="flex-1 h-px bg-white/20" />
            <span className="font-poppins text-xs text-white/40 uppercase tracking-wider">
              ou entre com código
            </span>
            <div className="flex-1 h-px bg-white/20" />
          </div>

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
        </Card>

        <div className="grid grid-cols-3 gap-3 w-full">
          <div className="flex flex-col items-center gap-1 p-4 rounded-xl bg-blue-dark-900/60 border border-white/10">
            <Anchor size={22} className="text-blue-300" />
            <span className="font-anybody font-bold text-lg text-white">5</span>
            <span className="font-poppins text-[10px] text-white/50 uppercase tracking-wide text-center">
              Navios por frota
            </span>
          </div>
          <div className="flex flex-col items-center gap-1 p-4 rounded-xl bg-blue-dark-900/60 border border-white/10">
            <Swords size={22} className="text-orange-300" />
            <span className="font-anybody font-bold text-lg text-white">
              10×10
            </span>
            <span className="font-poppins text-[10px] text-white/50 uppercase tracking-wide text-center">
              Tabuleiro
            </span>
          </div>
          <div className="flex flex-col items-center gap-1 p-4 rounded-xl bg-blue-dark-900/60 border border-white/10">
            <Users size={22} className="text-green-300" />
            <span className="font-anybody font-bold text-lg text-white">
              1v1
            </span>
            <span className="font-poppins text-[10px] text-white/50 uppercase tracking-wide text-center">
              Tempo real
            </span>
          </div>
        </div>

        <Footer />
      </LayoutPage>
      <BottomNav />
    </div>
  );
}

export default HomePage;
