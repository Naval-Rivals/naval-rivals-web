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
import Spinner from "../components/ui/Spinner";

const registerSchema = z
  .object({
    nickname: z.string().min(1, "Nickname é obrigatório").max(150, "Máximo 150 caracteres"),
    email: z
      .string()
      .min(1, "E-mail é obrigatório")
      .email("Formato de e-mail inválido"),
    password: z
      .string()
      .min(1, "Senha é obrigatória")
      .min(6, "Precisa ter no mínimo 6 caracteres")
      .max(254, "Máximo 254 caracteres"),
    passwordConfirmation: z.string().min(1, "Confirmação é obrigatória"),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "As senhas não coincidem",
    path: ["passwordConfirmation"],
  });

function RegisterPage() {
  const navigate = useNavigate();
  const { register: registerUser, loading } = useAuth();
  const [apiError, setApiError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(data) {
    setApiError("");
    try {
      await registerUser(data);
      navigate("/");
    } catch (error) {
      if (error.status === 409) {
        setApiError(error.message);
      } else if (error.data?.details) {
        setApiError(error.data.details.map((d) => d.message).join(". "));
      } else {
        setApiError(error.message || "Erro ao criar conta");
      }
    }
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden relative">
      {loading && <Spinner />}
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
              PRONTO PARA A BATALHA?
            </h3>
            <span className="font-poppins font-light text-white">
              Estabeleça o seu comando
            </span>
          </div>
          <form
            className="flex flex-col w-full gap-4"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div>
              <Label>NICKNAME</Label>
              <Input
                placeholder="Digite um apelido"
                error={!!errors.nickname}
                {...register("nickname")}
              />
              <ErrorField error={errors.nickname} />
            </div>
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
                placeholder="Digite uma senha"
                type="password"
                error={!!errors.password}
                {...register("password")}
              />
              <ErrorField error={errors.password} />
            </div>
            <div>
              <Label>CONFIRMAÇÃO DE SENHA</Label>
              <Input
                placeholder="Confirme a senha"
                type="password"
                error={!!errors.passwordConfirmation}
                {...register("passwordConfirmation")}
              />
              <ErrorField error={errors.passwordConfirmation} />
            </div>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? "ALISTANDO..." : "ALISTAR-SE"}
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
