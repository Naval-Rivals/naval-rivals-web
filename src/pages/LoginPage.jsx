import { useState } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "../contexts/AuthContext";
import LayoutPage from "../components/layout/LayoutPage";
import Card from "../components/ui/Card";
import AlertCard from "../components/ui/AlertCard";
import logo from "../assets/logo-naval-rivals.png";
import Input from "../components/ui/Input";
import Label from "../components/ui/Label";
import ErrorField from "../components/ui/ErrorField";
import Button from "../components/ui/Button";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "E-mail é obrigatório")
    .email("Formato de e-mail inválido"),
  password: z
    .string()
    .min(1, "Senha é obrigatória")
    .min(6, "Precisa ter no mínimo 6 caracteres"),
});

function LoginPage() {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const [apiError, setApiError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data) {
    setApiError("");
    try {
      await login(data);
      navigate("/");
    } catch (error) {
      if (error.status === 401) {
        setApiError("E-mail ou senha incorretos");
      } else {
        setApiError(error.message || "Erro ao fazer login");
      }
    }
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden relative">
      <AlertCard
        show={!!apiError}
        onClose={() => setApiError("")}
        type="error"
      >
        {apiError}
      </AlertCard>

      <LayoutPage className="p-4">
        <Card className="flex flex-col items-center gap-6 w-full max-w-120 p-6">
          <div className="w-40 sm:w-30 md:w-42 lg:w-50 shadow-md rounded-2xl shadow-orange-500">
            <img
              src={logo}
              alt="Logo da Naval Rivals"
              className="rounded-2xl"
            />
          </div>
          <div className="flex flex-col w-full items-center gap-2">
            <h3 className="text-xl font-anybody font-extrabold tracking-wide text-orange-300">
              BEM-VINDO DE VOLTA
            </h3>
            <span className="font-poppins font-light text-white">
              Acesse seu comando
            </span>
          </div>
          <form
            className="flex flex-col w-full gap-4"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div>
              <Label>E-MAIL</Label>
              <Input
                placeholder="Digite seu e-mail"
                error={!!errors.email}
                {...register("email")}
              />
              <ErrorField error={errors.email} />
            </div>
            <div>
              <Label>SENHA</Label>
              <Input
                placeholder="Digite sua senha"
                type="password"
                error={!!errors.password}
                {...register("password")}
              />
              <ErrorField error={errors.password} />
            </div>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? "ENTRANDO..." : "ENTRAR EM COMBATE"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate("/register")}
            >
              CRIAR CONTA
            </Button>
          </form>
        </Card>
      </LayoutPage>
    </div>
  );
}

export default LoginPage;
