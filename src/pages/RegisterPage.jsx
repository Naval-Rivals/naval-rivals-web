import LayoutPage from "../components/layout/LayoutPage";
import Card from "../components/ui/Card";
import logo from "../assets/logo-naval-rivals.png";
import Input from "../components/ui/Input";
import Label from "../components/ui/Label";
import ErrorField from "../components/ui/ErrorField";
import Button from "../components/ui/Button";
import { useNavigate } from "react-router";

function RegisterPage() {
  const navigate = useNavigate();
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <LayoutPage className="p-4">
        <Card className="flex flex-col items-center gap-6 w-full max-w-120 p-6">
          <div className="w-40 sm:w-30 md:w-42 lg:w-50 shadow-md rounded-2xl  shadow-orange-500">
            <img
              src={logo}
              alt="Logo da Naval Rivals"
              className="rounded-2xl"
            />
          </div>
          <div className="flex flex-col w-full items-center gap-2">
            <h3 className="text-xl font-anybody font-extrabold tracking-wide text-orange-300">
              PRONTO PARA A BATALHA?
            </h3>
            <span className="font-poppins font-light text-white">
              Estabeleça o seu comando
            </span>
          </div>
          <form className="flex flex-col w-full gap-4">
            <div>
              <Label>NICKNAME</Label>
              <Input placeholder="Digite um apelido" />
              <ErrorField />
            </div>
            <div>
              <Label>E-MAIL</Label>
              <Input placeholder="Digite seu e-mail" />
              <ErrorField />
            </div>
            <div>
              <Label>SENHA</Label>
              <Input placeholder="Digite uma senha" type="password" />
              <ErrorField />
            </div>
            <div>
              <Label>CONFIRMAÇÃO DE SENHA</Label>
              <Input placeholder="Confirme a senha" type="password" />
              <ErrorField />
            </div>
            <Button type="submit" variant="primary">
              ALISTAR-SE
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate("/login")}
            >
              JÁ TENHO CONTA
            </Button>
          </form>
        </Card>
      </LayoutPage>
    </div>
  );
}

export default RegisterPage;
