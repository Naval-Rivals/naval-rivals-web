import { useState, useRef } from "react";
import { Client } from "@stomp/stompjs";

function App() {
  const [name, setName] = useState("Matheus");
  const [room, setRoom] = useState("geral");
  const [msg, setMsg] = useState("");
  const [messages, setMessages] = useState([]);
  const [online, setOnline] = useState(false);

  const clientRef = useRef(null);

  function addLog(line) {
    setMessages((prev) => [...prev, line]);
  }

  function connect() {
    const client = new Client({
      brokerURL: "ws://localhost:8080/ws",
      reconnectDelay: 5000,
      onConnect: () => {
        setOnline(true);
        addLog("✅ Conectado em /topic/chat/" + room);

        client.subscribe(`/topic/chat/${room}`, (frame) => {
          const m = JSON.parse(frame.body);
          addLog(`[${m.sentAt}] ${m.from ?? "anon"}: ${m.content}`);
        });
      },
      onStompError: (frame) => {
        setOnline(false);
        addLog("❌ Erro: " + frame.headers["message"]);
      },
      onDisconnect: () => setOnline(false),
    });

    client.activate();
    clientRef.current = client;
  }

  function disconnect() {
    if (clientRef.current) {
      clientRef.current.deactivate();
      setOnline(false);
      addLog("🔌 Desconectado.");
    }
  }

  function send() {
    if (!clientRef.current?.active) {
      return addLog("⚠️ Não conectado.");
    }

    clientRef.current.publish({
      destination: `/app/chat.send/${room}`,
      body: JSON.stringify({
        from: name || "anon",
        content: msg,
        type: "CHAT",
      }),
    });

    setMsg("");
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center p-6">
      <h1 className="text-2xl font-bold mb-6">⚓ Naval Rivals Chat</h1>

      <div className="w-full max-w-2xl space-y-4">
        {/* Controles */}
        <div className="flex flex-wrap gap-3 items-center">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome"
            className="bg-gray-800 border border-gray-700 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
          />
          <input
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            placeholder="Sala"
            className="bg-gray-800 border border-gray-700 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={connect}
            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded font-medium"
          >
            Conectar
          </button>
          <button
            onClick={disconnect}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded font-medium"
          >
            Desconectar
          </button>
          <span
            className={`text-sm font-semibold ${online ? "text-green-400" : "text-red-400"}`}
          >
            {online ? "● online" : "● offline"}
          </span>
        </div>

        {/* Input de mensagem */}
        <div className="flex gap-3">
          <input
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Escreva sua mensagem..."
            className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={send}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded font-medium"
          >
            Enviar
          </button>
        </div>

        {/* Mensagens */}
        <div className="bg-gray-800 border border-gray-700 rounded p-4 h-80 overflow-y-auto space-y-1 font-mono text-sm">
          {messages.length === 0 && (
            <p className="text-gray-500">Nenhuma mensagem ainda...</p>
          )}
          {messages.map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
