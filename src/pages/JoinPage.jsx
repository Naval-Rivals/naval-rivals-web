import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../services/api";
import Header from "../components/layout/Header";
import LayoutPage from "../components/layout/LayoutPage";
import { AlertCircle, Home } from "lucide-react";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Spinner from "../components/ui/Spinner";

function JoinPage() {
  const { code } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      sessionStorage.setItem("joinAfterLogin", code);
      navigate("/login", { replace: true });
      return;
    }

    async function joinRoom() {
      try {
        const room = await api.post("/rooms/join", { code: code.toUpperCase() });
        if (room.gameId) {
          navigate("/game/ship-placement", { state: { gameId: room.gameId, roomId: room.id, opponentNickname: room.host?.nickname }, replace: true });
        } else {
          navigate("/game/waiting-room", { state: { room }, replace: true });
        }
      } catch (err) {
        setError(err.message || "Erro ao entrar na sala");
      } finally {
        setLoading(false);
      }
    }

    joinRoom();
  }, [code, isAuthenticated, navigate]);

  if (loading) {
    return <Spinner />;
  }

  if (error) {
    return (
      <div className="h-screen flex flex-col overflow-hidden">
        <Header />
        <LayoutPage interClassName="p-4 justify-center">
          <Card className="flex flex-col items-center gap-4 p-6 max-w-md">
            <AlertCircle className="w-12 h-12 text-red-400" />
            <p className="font-poppins text-red-400 text-center">{error}</p>
            <Button
              variant="secondary"
              className="flex items-center justify-center gap-2"
              onClick={() => navigate("/")}
            >
              <Home size={18} />
              Voltar ao Menu
            </Button>
          </Card>
        </LayoutPage>
      </div>
    );
  }

  return null;
}

export default JoinPage;
