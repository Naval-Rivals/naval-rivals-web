import LayoutPage from "../components/layout/LayoutPage";
import Card from "../components/ui/Card";
import logo from "../assets/logo-naval-rivals.png";
import Input from "../components/ui/Input";
import Label from "../components/ui/Label";
import ErrorField from "../components/ui/ErrorField";
import Button from "../components/ui/Button";

function LoginPage() {
  return (
    <LayoutPage>
      <Card className="flex flex-col items-center gap-6 w-full max-w-120 p-6">
        <div className="w-40 sm:w-30 md:w-42 lg:w-50 shadow-md rounded-2xl shadow-orange-500">
          <img src={logo} alt="Logo da Naval Rivals" className="rounded-2xl" />
        </div>
        <div className="flex flex-col w-full items-center gap-2">
          <h3 className="text-xl font-anybody font-extrabold tracking-wide text-orange-300">
            BEM-VINDO DE VOLTA
          </h3>
          <span className="font-poppins font-light text-white">
            Acesse seu comando
          </span>
        </div>
        <form className="flex flex-col w-full gap-4">
          <div>
            <Label required={true}>E-MAIL</Label>
            <Input placeholder="Digite seu e-mail" />
            <ErrorField />
          </div>
          <div>
            <Label required={true}>SENHA</Label>
            <Input placeholder="Digite sua senha" type="password" />
            <ErrorField />
          </div>
          <Button type="submit" variant="primary">
            ENTRAR EM COMBATE
          </Button>
          <Button type="button" variant="secondary">
            CRIAR CONTA
          </Button>
        </form>
      </Card>
    </LayoutPage>
  );
}

export default LoginPage;
