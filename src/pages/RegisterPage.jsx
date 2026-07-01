import LayoutPage from "../components/layout/LayoutPage";
import Card from "../components/ui/Card";
import logo from "../assets/logo-naval-rivals.png";
import Input from "../components/ui/Input";

function RegisterPage() {
  return (
    <LayoutPage>
      <Card className="flex flex-col items-center gap-6 w-full max-w-120">
        <div className="w-40 sm:w-30 md:w-42 lg:w-50 shadow-md rounded-2xl  shadow-orange-500">
          <img src={logo} alt="Logo da Naval Rivals" className="rounded-2xl" />
        </div>
        <div className="flex flex-col w-full items-center gap-2">
          <h3 className="text-xl font-anybody font-extrabold tracking-wide text-orange-300">
            PRONTO PARA A BATALHA?
          </h3>
          <span className="font-poppins font-light text-white">
            Estabeleça o seu comando
          </span>
        </div>
        <form className="flex flex-col w-full gap-6">
          <Input />
          <Input />
          <Input />
          <Input />
        </form>
      </Card>
    </LayoutPage>
  );
}

export default RegisterPage;
