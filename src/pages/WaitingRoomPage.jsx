import Header from "../components/layout/Header";
import LayoutPage from "../components/layout/LayoutPage";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import SectionTitle from "../components/ui/SectionTitle";
import { Copy, Link, Users, CircleUserRound, Loader, X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";

const MOCK_ROOM_CODE = "NR-7X3K";
const MOCK_SHARE_LINK = "https://navalrivals.com/join/NR-7X3K";

function WaitingRoomPage() {
  const navigate = useNavigate();
  const [codeCopied, setCodeCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const handleCopy = (text, setCopied) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header />
      <LayoutPage interClassName="p-4  justify-center">
        <Card className="flex flex-col items-center gap-6 w-full max-w-lg p-6">
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-orange-500/20 border-2 border-orange-400 flex items-center justify-center animate-pulse">
                <Users size={28} className="text-orange-300" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-4 w-4 bg-orange-500" />
              </span>
            </div>
            <SectionTitle className="text-xl text-center">
              Aguardando Oponente...
            </SectionTitle>
            <p className="font-poppins font-light text-white/60 text-center text-sm">
              Compartilhe o código ou link abaixo para convidar um amigo
            </p>
          </div>

          <div className="flex items-center justify-center gap-6 w-full py-4">
            <div className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-full bg-blue-dark-900 border-2 border-blue-300 flex items-center justify-center">
                <CircleUserRound size={28} className="text-blue-300" />
              </div>
              <span className="font-poppins font-medium text-sm text-white">
                Capitão Caio
              </span>
              <span className="font-poppins text-[10px] text-green-400 uppercase tracking-wider font-semibold">
                Pronto
              </span>
            </div>

            <div className="flex flex-col items-center gap-1">
              <span className="font-anybody font-extrabold text-2xl text-white/30">
                VS
              </span>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-full bg-blue-dark-900 border-2 border-white/20 flex items-center justify-center animate-pulse">
                <Loader size={24} className="text-white/30 animate-spin" />
              </div>
              <span className="font-poppins font-medium text-sm text-white/40">
                ???
              </span>
              <span className="font-poppins text-[10px] text-white/30 uppercase tracking-wider">
                Aguardando...
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2 w-full">
            <label className="font-poppins text-xs text-white/50 uppercase tracking-wider">
              Código da Batalha
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center justify-center px-4 py-3 rounded-lg bg-blue-dark-900 border-2 border-blue-300/40">
                <span className="font-anybody font-extrabold text-xl text-orange-300 tracking-widest select-all">
                  {MOCK_ROOM_CODE}
                </span>
              </div>
              <Button
                variant="ghost"
                className="w-auto! px-3! border-blue-300/40!"
                onClick={() => handleCopy(MOCK_ROOM_CODE, setCodeCopied)}
              >
                <Copy
                  size={18}
                  className={codeCopied ? "text-green-400" : "text-blue-300"}
                />
              </Button>
            </div>
            {codeCopied && (
              <span className="font-poppins text-xs text-green-400 text-center">
                Código copiado!
              </span>
            )}
          </div>

          <div className="flex flex-col gap-2 w-full">
            <label className="font-poppins text-xs text-white/50 uppercase tracking-wider">
              Link de Compartilhamento
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center px-4 py-3 rounded-lg bg-blue-dark-900 border-2 border-blue-300/40 overflow-hidden">
                <Link size={14} className="text-white/40 shrink-0 mr-2" />
                <span className="font-poppins text-sm text-white/70 truncate select-all">
                  {MOCK_SHARE_LINK}
                </span>
              </div>
              <Button
                variant="ghost"
                className="w-auto! px-3! border-blue-300/40!"
                onClick={() => handleCopy(MOCK_SHARE_LINK, setLinkCopied)}
              >
                <Copy
                  size={18}
                  className={linkCopied ? "text-green-400" : "text-blue-300"}
                />
              </Button>
            </div>
            {linkCopied && (
              <span className="font-poppins text-xs text-green-400 text-center">
                Link copiado!
              </span>
            )}
          </div>

          <Button
            variant="danger"
            className="flex items-center justify-center gap-2 border-red-500/50!"
            onClick={() => navigate("/")}
          >
            <X size={18} />
            CANCELAR BATALHA
          </Button>
        </Card>
      </LayoutPage>
    </div>
  );
}

export default WaitingRoomPage;
