import { ChevronRight, CircleUserRound, LogOut, UserRound } from "lucide-react";
import LayoutPage from "../components/layout/LayoutPage";
import Card from "../components/ui/Card";
import { useNavigate } from "react-router";
import Button from "../components/ui/Button";
import Header from "../components/layout/Header";
import BottomNav from "../components/layout/BottomNav";
import Footer from "../components/layout/Footer";
import { useAuth } from "../contexts/AuthContext";
import ModalConfirmation from "../components/ui/ModalConfirmation";
import { useState } from "react";

function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {showLogoutModal && (
        <ModalConfirmation
          title="Sair da Conta"
          description="Tem certeza que deseja sair? Você precisará fazer login novamente."
          confirmText="Sair"
          variant="danger"
          handleConfirm={handleLogout}
          handleCancel={() => setShowLogoutModal(false)}
        />
      )}
      <Header />
      <LayoutPage interClassName="p-4 pb-20 md:pb-4">
        <Card className="flex gap-6 flex-col w-full p-6">
          <div className="flex w-full items-center gap-4">
            <div className="rounded-full p-2 bg-blue-dark-900 border-2 border-orange-400 ">
              <CircleUserRound className="text-orange-300 w-12 h-12" />
            </div>
            <div className="flex flex-col gap-0.5">
              <h1 className="text-white font-poppins font-semibold text-2xl">
                Olá, {user?.nickname || "Jogador"}
              </h1>
              <span className="font-poppins text-sm text-white/50">
                Capitão de frota
              </span>
            </div>
          </div>

          <div
            className="flex items-center justify-between p-4 rounded-xl bg-blue-dark-900 border border-blue-300/30 text-white/80 hover:border-orange-400/50 hover:text-white transition-all duration-200 cursor-pointer"
            onClick={() => navigate("/profile/my-account")}
          >
            <div className="flex gap-3 items-center">
              <UserRound size={20} className="text-orange-300" />
              <span className="font-poppins font-medium">Minha Conta</span>
            </div>
            <ChevronRight size={18} className="text-white/50" />
          </div>

          <div className="flex w-full items-center justify-end mt-2">
            <Button
              variant="ghost"
              className="gap-2 max-w-fit flex items-center text-red-400! border-red-400/50! hover:bg-red-400/10!"
              onClick={() => setShowLogoutModal(true)}
            >
              <LogOut size={18} />
              Sair da Conta
            </Button>
          </div>
        </Card>
        <Footer />
      </LayoutPage>
      <BottomNav />
    </div>
  );
}

export default ProfilePage;
