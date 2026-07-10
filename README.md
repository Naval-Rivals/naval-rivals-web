# ⚓ Naval Rivals — Frontend Web

Aplicação web do jogo **Naval Rivals**, uma releitura moderna do clássico Batalha Naval com modo tático, sistema de habilidades especiais e ranking competitivo.

---

## Sumário

- [Stack Tecnológica](#-stack-tecnológica)
- [Arquitetura](#-arquitetura)
- [Justificativas Técnicas](#-justificativas-técnicas)
- [Estrutura de Diretórios](#-estrutura-de-diretórios)
- [Funcionalidades](#-funcionalidades)
- [Como Executar](#-como-executar)
- [Variáveis de Ambiente](#-variáveis-de-ambiente)

---

## Stack Tecnológica

| Camada                    | Tecnologia                            | Versão     |
| ------------------------- | ------------------------------------- | ---------- |
| **Runtime/Linguagem**     | JavaScript (ES Modules)               | ES2022+    |
| **Framework UI**          | React                                 | 19.x       |
| **Bundler**               | Vite                                  | 8.x        |
| **Estilização**           | Tailwind CSS                          | 4.x        |
| **Componentes UI**        | Material UI (MUI)                     | 9.x        |
| **Roteamento**            | React Router                          | 8.x        |
| **Formulários**           | React Hook Form + Zod                 | 7.x / 3.x  |
| **Comunicação Real-time** | STOMP.js (WebSocket)                  | 7.x        |
| **Drag & Drop**           | @dnd-kit/react                        | 0.5.x      |
| **Animações**             | Motion (Framer Motion) + Lottie React | 12.x / 2.x |
| **Ícones**                | Phosphor Icons + Lucide React         | —          |
| **Linting**               | ESLint                                | 10.x       |

---

## Arquitetura

A aplicação segue uma **arquitetura baseada em páginas (page-driven)** com separação clara de responsabilidades:

```
┌─────────────────────────────────────────────────────┐
│                    App (Root)                       │
│         AuthProvider (Context Global)               │
├─────────────────────────────────────────────────────┤
│                  React Router                       │
│        Rotas Públicas / Rotas Protegidas            │
├────────────┬────────────────────────────────────────┤
│   Pages    │  Contém lógica de negócio e estado     │
│            │  da tela (HomePage, GamePage, etc.)    │
├────────────┼────────────────────────────────────────┤
│ Components │  UI reutilizáveis (Button, Modal...)   │
│            │  Game-specific (GameBoard, ShipSvg...) │
│            │  Layout (Header, Footer, BottomNav)    │
├────────────┼────────────────────────────────────────┤
│  Services  │  api.js → REST (fetch nativo)          │
│            │  auth.js → Autenticação JWT            │
│            │  websocket.js → STOMP/WebSocket        │
├────────────┼────────────────────────────────────────┤
│  Contexts  │  AuthContext (estado de autenticação)  │
└────────────┴────────────────────────────────────────┘
```

---

## Justificativas Técnicas

### React + Vite

Vite garante um ambiente de desenvolvimento rápido, com recarregamento instantâneo e builds otimizados — ideal para iterar rápido em uma UI de jogo com muitas interações.

### Tailwind CSS

Estilização utilitária que acelera a construção de interfaces consistentes, sem sair do JSX para escrever CSS separado.

### STOMP.js (WebSocket)

O jogo depende de comunicação em tempo real — turnos, ataques e status de sala precisam refletir instantaneamente para os dois jogadores. STOMP se integra nativamente com o WebSocket do Spring Boot no backend, dispensando soluções externas de sincronização.

### React Hook Form + Zod

Combinação leve para formulários com validação client-side clara e mensagens de erro consistentes, sem verbosidade.

### @dnd-kit/react

Escolhido para o posicionamento de navios por oferecer drag & drop acessível e com bom suporte a toque, essencial para jogar no celular.

### Motion + Lottie

Motion cuida das transições e microinterações da interface. Lottie renderiza animações mais elaboradas (como explosões) de forma leve, exportadas prontas do After Effects.

---

## Estrutura de Diretórios

```
src/
├── assets/              # Imagens, logos e animações Lottie (JSON)
│   └── animations/      # Arquivos .json de animação (explosion, ship)
├── components/
│   ├── game/            # Componentes específicos do jogo (GameBoard, AbilityPanel, ShipSvg...)
│   ├── layout/          # Layout compartilhado (Header, Footer, BottomNav)
│   └── ui/              # Componentes UI genéricos (Button, Modal, Input, Card...)
├── contexts/            # React Contexts (AuthContext)
├── pages/               # Páginas da aplicação (uma por rota)
├── routes/              # Definição de rotas (AppRoutes)
├── services/            # Camada de serviços (api, auth, websocket)
├── App.jsx              # Componente raiz
├── main.jsx             # Entry point
└── index.css            # Estilos globais (Tailwind imports)
```

---

## Funcionalidades

### Fluxo do Jogo

1. **Registro/Login** — autenticação com JWT
2. **Lobby** — criação/entrada em sala via código
3. **Waiting Room** — aguardando oponente (WebSocket)
4. **Ship Placement** — posicionamento de navios com drag & drop
5. **Batalha** — turnos alternados com ataques e habilidades especiais
6. **Resultado** — tela de vitória/derrota com estatísticas

### Outras Features

- Ranking competitivo
- Perfil do jogador com estatísticas
- Link de convite para partida
- Animações de explosão e feedback visual
- Layout responsivo (mobile-first com BottomNav)

---

## Como Executar

### Pré-requisitos

- Node.js 18+
- npm ou yarn

### Instalação

```bash
# Clonar o repositório
git clone https://github.com/Naval-Rivals/naval-rivals-web.git
cd navalrivals-web

# Instalar dependências
npm install

# Iniciar em modo desenvolvimento
npm run dev
```

---

## Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_API_BASE=http://localhost:8080
```

| Variável        | Descrição                                  | Padrão                  |
| --------------- | ------------------------------------------ | ----------------------- |
| `VITE_API_BASE` | URL base da API backend (REST + WebSocket) | `http://localhost:8080` |

> O endereço WebSocket é derivado automaticamente substituindo `http` por `ws` e adicionando `/ws`.
