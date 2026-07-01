import { ArrowLeft, Save } from "lucide-react";
import Header from "../components/layout/Header";
import LayoutPage from "../components/layout/LayoutPage";
import { useNavigate } from "react-router";
import Card from "../components/ui/Card";
import Label from "../components/ui/Label";
import Input from "../components/ui/Input";
import ErrorField from "../components/ui/ErrorField";
import Button from "../components/ui/Button";

function MyAccountPage() {
  const navigate = useNavigate();
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header />
      <LayoutPage className="p-2">
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
            autoComplete="nope"
            // onSubmit={handleSubmitName((data) => {
            //   setPendingData(data);
            //   handleOpenModalInfoProfile();
            // })}
          >
            <Card className=" flex flex-col gap-4 items-start">
              <h2 className="text-white text-lg font-semibold">
                Informações Pessoais
              </h2>

              <div className="flex flex-col w-full gap-1">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value="teste@email"
                  disabled
                  className="opacity-60"
                />
              </div>

              <div className="flex flex-col w-full gap-1">
                <Label htmlFor="name">Nome</Label>
                <Input id="name" placeholder="Seu nome" />
                <ErrorField />
              </div>

              <Button
                type="submit"
                className="flex items-center max-w-fit px-4 gap-2 self-end"
              >
                <Save size={18} />
                Salvar Nome
              </Button>
            </Card>
          </form>
          <form
            className="w-full"
            autoComplete="nope"
            // onSubmit={handleSubmitPassword((data) => {
            //   setPendingData(data);
            //   handleOpenModalPassword();
            // })}
          >
            <Card className="flex flex-col gap-4 items-start">
              <h2 className="text-white text-lg font-semibold">
                Alterar Senha
              </h2>

              <div className="flex flex-col w-full gap-1">
                <Label htmlFor="currentPassword">Senha Atual</Label>
                <Input
                  id="currentPassword"
                  placeholder="Digite sua senha atual"
                />
                <ErrorField />
              </div>

              <div className="flex flex-col w-full gap-1">
                <Label htmlFor="newPassword">Nova Senha</Label>
                <Input id="newPassword" placeholder="Digite a nova senha" />
                <ErrorField />
              </div>

              <div className="flex flex-col w-full gap-1">
                <Label htmlFor="passwordConfirmation">
                  Confirmar Nova Senha
                </Label>
                <Input
                  id="passwordConfirmation"
                  placeholder="Confirme a nova senha"
                />
                <ErrorField />
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
      </LayoutPage>
    </div>
  );
}

export default MyAccountPage;
