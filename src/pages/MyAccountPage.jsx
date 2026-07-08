import { useState } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../services/api";
import Header from "../components/layout/Header";
import LayoutPage from "../components/layout/LayoutPage";
import BottomNav from "../components/layout/BottomNav";
import Card from "../components/ui/Card";
import Label from "../components/ui/Label";
import Input from "../components/ui/Input";
import ErrorField from "../components/ui/ErrorField";
import Button from "../components/ui/Button";
import Footer from "../components/layout/Footer";
import AlertCard from "../components/ui/AlertCard";
import ModalConfirmation from "../components/ui/ModalConfirmation";
import { Helmet } from "react-helmet-async";

const nicknameSchema = z.object({
  nickname: z
    .string()
    .min(1, "Nickname é obrigatório")
    .max(150, "Máximo 150 caracteres"),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Senha atual é obrigatória"),
    newPassword: z
      .string()
      .min(1, "Nova senha é obrigatória")
      .min(6, "Precisa ter no mínimo 6 caracteres")
      .max(254, "Máximo 254 caracteres"),
    passwordConfirmation: z.string().min(1, "Confirmação é obrigatória"),
  })
  .refine((data) => data.newPassword === data.passwordConfirmation, {
    message: "As senhas não coincidem",
    path: ["passwordConfirmation"],
  });

function MyAccountPage() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [alert, setAlert] = useState({
    show: false,
    message: "",
    type: "error",
  });
  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pendingNicknameData, setPendingNicknameData] = useState(null);
  const [pendingPasswordData, setPendingPasswordData] = useState(null);

  const {
    register: registerNickname,
    handleSubmit: handleSubmitNickname,
    formState: { errors: nicknameErrors },
  } = useForm({
    resolver: zodResolver(nicknameSchema),
    defaultValues: { nickname: user?.nickname || "" },
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm({
    resolver: zodResolver(passwordSchema),
  });

  async function onSubmitNickname(data) {
    setPendingNicknameData(data);
    setShowNicknameModal(true);
  }

  async function confirmNicknameChange() {
    setShowNicknameModal(false);
    const data = pendingNicknameData;
    if (!data) return;
    try {
      const updated = await api.patch("/users/me/nickname", {
        nickname: data.nickname,
      });
      updateUser({ nickname: updated.nickname });
      setAlert({
        show: true,
        message: "Nickname alterado com sucesso!",
        type: "success",
      });
    } catch (error) {
      if (error.status === 409) {
        setAlert({ show: true, message: error.message, type: "error" });
      } else {
        setAlert({
          show: true,
          message: error.message || "Erro ao alterar nickname",
          type: "error",
        });
      }
    }
  }

  async function onSubmitPassword(data) {
    setPendingPasswordData(data);
    setShowPasswordModal(true);
  }

  async function confirmPasswordChange() {
    setShowPasswordModal(false);
    const data = pendingPasswordData;
    if (!data) return;
    try {
      await api.patch("/users/me/password", {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        passwordConfirmation: data.passwordConfirmation,
      });
      resetPassword();
      setAlert({
        show: true,
        message: "Senha alterada com sucesso!",
        type: "success",
      });
    } catch (error) {
      if (error.status === 401) {
        setAlert({ show: true, message: error.message, type: "error" });
      } else if (error.data?.details) {
        const messages = error.data.details.map((d) => d.message).join(". ");
        setAlert({ show: true, message: messages, type: "error" });
      } else {
        setAlert({
          show: true,
          message: error.message || "Erro ao alterar senha",
          type: "error",
        });
      }
    }
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden relative">
      <Helmet>
        <title>Minha Conta - Naval Rivals</title>
      </Helmet>
      {showNicknameModal && (
        <ModalConfirmation
          title="Alterar Nickname"
          description={`Deseja alterar seu nickname para "${pendingNicknameData?.nickname}"?`}
          confirmText="Alterar"
          variant="default"
          handleConfirm={confirmNicknameChange}
          handleCancel={() => setShowNicknameModal(false)}
        />
      )}
      {showPasswordModal && (
        <ModalConfirmation
          title="Alterar Senha"
          description="Tem certeza que deseja alterar sua senha?"
          confirmText="Alterar"
          variant="warning"
          handleConfirm={confirmPasswordChange}
          handleCancel={() => setShowPasswordModal(false)}
        />
      )}
      <AlertCard
        show={alert.show}
        onClose={() => setAlert({ ...alert, show: false })}
        type={alert.type}
      >
        {alert.message}
      </AlertCard>

      <Header />
      <LayoutPage className="p-2 pb-20 md:pb-2">
        <div className="flex flex-col w-full gap-4">
          <button
            onClick={() => navigate("/profile")}
            className="flex items-center gap-2 text-white/70 hover:text-white cursor-pointer self-start"
          >
            <ArrowLeft size={20} />
            <span>Voltar</span>
          </button>

          <h1 className="text-white text-2xl font-semibold">Minha Conta</h1>

          <form
            className="w-full"
            autoComplete="off"
            onSubmit={handleSubmitNickname(onSubmitNickname)}
          >
            <Card className="flex flex-col gap-4 items-start">
              <h2 className="text-white text-lg font-semibold">
                Informações Pessoais
              </h2>

              <div className="flex flex-col w-full gap-1">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={user?.email || ""}
                  disabled
                  className="opacity-60"
                />
              </div>

              <div className="flex flex-col w-full gap-1">
                <Label htmlFor="nickname">Nickname</Label>
                <Input
                  id="nickname"
                  placeholder="Seu nickname"
                  error={!!nicknameErrors.nickname}
                  {...registerNickname("nickname")}
                />
                <ErrorField error={nicknameErrors.nickname} />
              </div>

              <Button
                type="submit"
                className="flex items-center max-w-fit px-4 gap-2 self-end"
              >
                <Save size={18} />
                Salvar Nickname
              </Button>
            </Card>
          </form>

          <form
            className="w-full"
            autoComplete="off"
            onSubmit={handleSubmitPassword(onSubmitPassword)}
          >
            <Card className="flex flex-col gap-4 items-start">
              <h2 className="text-white text-lg font-semibold">
                Alterar Senha
              </h2>

              <div className="flex flex-col w-full gap-1">
                <Label htmlFor="currentPassword">Senha Atual</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  placeholder="Digite sua senha atual"
                  error={!!passwordErrors.currentPassword}
                  {...registerPassword("currentPassword")}
                />
                <ErrorField error={passwordErrors.currentPassword} />
              </div>

              <div className="flex flex-col w-full gap-1">
                <Label htmlFor="newPassword">Nova Senha</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Digite a nova senha"
                  error={!!passwordErrors.newPassword}
                  {...registerPassword("newPassword")}
                />
                <ErrorField error={passwordErrors.newPassword} />
              </div>

              <div className="flex flex-col w-full gap-1">
                <Label htmlFor="passwordConfirmation">
                  Confirmar Nova Senha
                </Label>
                <Input
                  id="passwordConfirmation"
                  type="password"
                  placeholder="Confirme a nova senha"
                  error={!!passwordErrors.passwordConfirmation}
                  {...registerPassword("passwordConfirmation")}
                />
                <ErrorField error={passwordErrors.passwordConfirmation} />
              </div>

              <Button
                type="submit"
                className="flex items-center max-w-fit px-4 gap-2 self-end"
              >
                <Save size={18} />
                Alterar Senha
              </Button>
            </Card>
          </form>
        </div>
        <Footer />
      </LayoutPage>
      <BottomNav />
    </div>
  );
}

export default MyAccountPage;
