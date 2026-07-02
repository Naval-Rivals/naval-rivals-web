# Naval Rivals — Especificação da API Backend

## Visão Geral

Este documento descreve todos os endpoints necessários no backend para suportar o frontend do Naval Rivals. O backend deve expor uma API REST (HTTP) para operações CRUD e autenticação, e usar WebSocket (STOMP sobre SockJS) para comunicação em tempo real durante as partidas.

**Base URL:** `{VITE_API_BASE}` (ex: `http://localhost:8080/api`)  
**WebSocket URL:** `ws://localhost:8080/ws`  
**Autenticação:** JWT Bearer Token via header `Authorization: Bearer <token>`

---

## Sumário

| Protocolo | Área | Endpoints |
|-----------|------|-----------|
| HTTP | Autenticação | Register, Login |
| HTTP | Usuário/Perfil | Get Profile, Update Name, Update Password |
| HTTP | Ranking | Get Ranking |
| HTTP | Sala/Batalha | Create Room, Join Room (by code), Join Random Queue, Leave Queue, Get Room Info |
| HTTP | Jogo | Submit Ship Placement, Get Game Result, Get Match History |
| WebSocket | Sala de Espera | Player joined, Room full |
| WebSocket | Posicionamento | Player ready, Both ready |
| WebSocket | Jogo em Andamento | Attack, Attack result, Turn change, Timer, Ship sunk, Game over |
| WebSocket | Chat | Send message, Receive message |

---

## 1. Autenticação (HTTP)

### 1.1 POST `/auth/register`

Cria uma nova conta de usuário.

**Request:**
```json
{
  "nickname": "CaptainCaio",
  "email": "caio@email.com",
  "password": "senhaSegura123",
  "passwordConfirmation": "senhaSegura123"
}
```

**Response (201 Created):**
```json
{
  "id": "uuid",
  "nickname": "CaptainCaio",
  "email": "caio@email.com",
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Erros:**
- `400` — Validação falhou (email duplicado, senhas não conferem, etc.)
- `409` — Email ou nickname já em uso

---

### 1.2 POST `/auth/login`

Autentica um usuário existente.

**Request:**
```json
{
  "email": "caio@email.com",
  "password": "senhaSegura123"
}
```

**Response (200 OK):**
```json
{
  "id": "uuid",
  "nickname": "CaptainCaio",
  "email": "caio@email.com",
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Erros:**
- `401` — Credenciais inválidas

---

## 2. Usuário / Perfil (HTTP)

### 2.1 GET `/users/me`

Retorna dados do usuário logado.

**Headers:** `Authorization: Bearer <token>`

**Response (200 OK):**
```json
{
  "id": "uuid",
  "nickname": "CaptainCaio",
  "email": "caio@email.com",
  "stats": {
    "totalGames": 25,
    "victories": 18,
    "defeats": 7,
    "winRate": "72%"
  }
}
```

---

### 2.2 PUT `/users/me/name`

Atualiza o nickname/nome do usuário.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "nickname": "NovoNickname"
}
```

**Response (200 OK):**
```json
{
  "id": "uuid",
  "nickname": "NovoNickname",
  "email": "caio@email.com"
}
```

**Erros:**
- `400` — Nome inválido ou vazio
- `409` — Nickname já em uso

---

### 2.3 PUT `/users/me/password`

Altera a senha do usuário.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "currentPassword": "senhaAtual123",
  "newPassword": "novaSenha456",
  "passwordConfirmation": "novaSenha456"
}
```

**Response (204 No Content)**

**Erros:**
- `400` — Senhas não conferem ou senha fraca
- `401` — Senha atual incorreta

---

## 3. Ranking (HTTP)

### 3.1 GET `/ranking`

Retorna o ranking global dos jogadores.

**Headers:** `Authorization: Bearer <token>`

**Query Params (opcionais):**
- `page` (default: 0)
- `size` (default: 20)

**Response (200 OK):**
```json
{
  "content": [
    {
      "position": 1,
      "userId": "uuid",
      "nickname": "CommanderX",
      "victories": 312,
      "totalGames": 358,
      "winRate": "87%"
    },
    {
      "position": 2,
      "userId": "uuid",
      "nickname": "SeaWolf",
      "victories": 245,
      "totalGames": 331,
      "winRate": "74%"
    }
  ],
  "totalElements": 150,
  "totalPages": 8,
  "currentPage": 0
}
```

---

## 4. Sala / Batalha (HTTP)

### 4.1 POST `/rooms`

Cria uma nova sala de batalha.

**Headers:** `Authorization: Bearer <token>`

**Request:** (body vazio)

**Response (201 Created):**
```json
{
  "id": "uuid",
  "code": "NR-7X3K",
  "shareLink": "https://navalrivals.com/join/NR-7X3K",
  "status": "WAITING",
  "host": {
    "id": "uuid",
    "nickname": "CaptainCaio"
  },
  "opponent": null,
  "createdAt": "2026-07-02T10:00:00Z"
}
```

---

### 4.2 POST `/rooms/join`

Entra em uma sala existente pelo código.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "code": "NR-7X3K"
}
```

**Response (200 OK):**
```json
{
  "id": "uuid",
  "code": "NR-7X3K",
  "status": "FULL",
  "host": {
    "id": "uuid",
    "nickname": "CaptainCaio"
  },
  "opponent": {
    "id": "uuid",
    "nickname": "RivalPlayer"
  }
}
```

**Erros:**
- `404` — Sala não encontrada
- `409` — Sala já está cheia
- `400` — Não pode entrar na própria sala

---

### 4.3 POST `/matchmaking/queue`

Entra na fila de matchmaking para batalha aleatória.

**Headers:** `Authorization: Bearer <token>`

**Request:** (body vazio)

**Response (200 OK):**
```json
{
  "status": "QUEUED",
  "message": "Adicionado à fila. Aguardando oponente...",
  "queuedAt": "2026-07-02T10:00:00Z"
}
```

---

### 4.4 DELETE `/matchmaking/queue`

Sai da fila de matchmaking.

**Headers:** `Authorization: Bearer <token>`

**Response (204 No Content)**

---

### 4.5 GET `/rooms/:roomId`

Retorna informações de uma sala específica.

**Headers:** `Authorization: Bearer <token>`

**Response (200 OK):**
```json
{
  "id": "uuid",
  "code": "NR-7X3K",
  "shareLink": "https://navalrivals.com/join/NR-7X3K",
  "status": "WAITING | FULL | PLACING_SHIPS | IN_PROGRESS | FINISHED",
  "host": {
    "id": "uuid",
    "nickname": "CaptainCaio"
  },
  "opponent": {
    "id": "uuid",
    "nickname": "RivalPlayer"
  },
  "createdAt": "2026-07-02T10:00:00Z"
}
```

---

### 4.6 DELETE `/rooms/:roomId`

Cancela/sai de uma sala (host cancela, oponente sai).

**Headers:** `Authorization: Bearer <token>`

**Response (204 No Content)**

---

## 5. Jogo (HTTP)

### 5.1 POST `/games/:gameId/ships`

Submete o posicionamento dos navios.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "ships": [
    {
      "type": "CARRIER",
      "cells": ["B1", "C1", "D1", "E1", "F1"]
    },
    {
      "type": "BATTLESHIP",
      "cells": ["A6", "B6", "C6", "D6"]
    },
    {
      "type": "CRUISER",
      "cells": ["H3", "H4", "H5"]
    },
    {
      "type": "SUBMARINE",
      "cells": ["E9", "F9", "G9"]
    },
    {
      "type": "DESTROYER",
      "cells": ["B9", "C9"]
    }
  ]
}
```

**Tipos de navio:**
| Tipo | Nome PT | Tamanho |
|------|---------|---------|
| CARRIER | Porta-aviões | 5 |
| BATTLESHIP | Navio-tanque | 4 |
| CRUISER | Contratorpedeiro | 3 |
| SUBMARINE | Submarino | 3 |
| DESTROYER | Destroyer | 2 |

**Response (200 OK):**
```json
{
  "status": "SHIPS_PLACED",
  "message": "Navios posicionados com sucesso. Aguardando oponente..."
}
```

**Erros:**
- `400` — Posicionamento inválido (sobreposição, fora do grid, tamanho incorreto)
- `409` — Navios já foram posicionados

---

### 5.2 GET `/games/:gameId/result`

Retorna o resultado final de uma partida concluída.

**Headers:** `Authorization: Bearer <token>`

**Response (200 OK):**
```json
{
  "gameId": "uuid",
  "roomCode": "NR-7X3K",
  "status": "FINISHED",
  "winner": {
    "id": "uuid",
    "nickname": "CaptainCaio"
  },
  "loser": {
    "id": "uuid",
    "nickname": "RivalPlayer"
  },
  "duration": "12:34",
  "stats": {
    "player": {
      "totalShots": 42,
      "hits": 17,
      "misses": 25,
      "shipsDestroyed": 5
    },
    "opponent": {
      "totalShots": 38,
      "hits": 12,
      "misses": 26,
      "shipsDestroyed": 3
    }
  },
  "finishedAt": "2026-07-02T10:12:34Z"
}
```

---

### 5.3 GET `/users/me/matches`

Retorna o histórico de partidas do usuário.

**Headers:** `Authorization: Bearer <token>`

**Query Params:**
- `page` (default: 0)
- `size` (default: 10)

**Response (200 OK):**
```json
{
  "content": [
    {
      "gameId": "uuid",
      "opponent": "RivalPlayer",
      "result": "VICTORY",
      "duration": "12:34",
      "shipsDestroyed": 5,
      "finishedAt": "2026-07-02T10:12:34Z"
    }
  ],
  "totalElements": 25,
  "totalPages": 3,
  "currentPage": 0
}
```

---

## 6. WebSocket — Sala de Espera

**Conexão:** `ws://{host}/ws` (SockJS + STOMP)  
**Autenticação:** Enviar token no header STOMP `Authorization` ao conectar.

### 6.1 SUBSCRIBE `/topic/room/{roomId}`

O cliente se inscreve para receber eventos da sala.

**Evento: Jogador entrou na sala**
```json
{
  "type": "PLAYER_JOINED",
  "player": {
    "id": "uuid",
    "nickname": "RivalPlayer"
  },
  "roomStatus": "FULL"
}
```

**Evento: Sala pronta (ambos jogadores presentes)**
```json
{
  "type": "ROOM_READY",
  "gameId": "uuid",
  "message": "Ambos jogadores conectados. Posicione seus navios!"
}
```

**Evento: Jogador saiu da sala**
```json
{
  "type": "PLAYER_LEFT",
  "player": {
    "id": "uuid",
    "nickname": "RivalPlayer"
  },
  "roomStatus": "WAITING"
}
```

---

### 6.2 SUBSCRIBE `/user/queue/match-found`

O cliente recebe quando o matchmaking encontrou um oponente (batalha aleatória).

**Evento: Match encontrado**
```json
{
  "type": "MATCH_FOUND",
  "roomId": "uuid",
  "roomCode": "NR-9Z2A",
  "opponent": {
    "id": "uuid",
    "nickname": "RivalPlayer"
  }
}
```

---

## 7. WebSocket — Posicionamento de Navios

### 7.1 SUBSCRIBE `/topic/game/{gameId}/placement`

Recebe eventos sobre o status de posicionamento dos jogadores.

**Evento: Oponente posicionou navios**
```json
{
  "type": "OPPONENT_READY",
  "message": "Oponente posicionou seus navios!"
}
```

**Evento: Ambos prontos — jogo começa**
```json
{
  "type": "GAME_STARTED",
  "firstTurn": "uuid-do-jogador-que-começa",
  "turnTimeout": 60
}
```

---

## 8. WebSocket — Jogo em Andamento

### 8.1 SEND `/app/game/{gameId}/attack`

O jogador envia um ataque.

**Message (enviada pelo cliente):**
```json
{
  "cell": "C4"
}
```

---

### 8.2 SUBSCRIBE `/topic/game/{gameId}/events`

Recebe todos os eventos do jogo em tempo real.

**Evento: Resultado do ataque**
```json
{
  "type": "ATTACK_RESULT",
  "attacker": "uuid",
  "cell": "C4",
  "result": "HIT | MISS | SUNK",
  "shipType": "CRUISER",
  "sunkShip": {
    "type": "CRUISER",
    "cells": ["C3", "C4", "C5"]
  }
}
```
> `shipType` e `sunkShip` são enviados apenas quando `result` é `HIT` ou `SUNK`.

**Evento: Mudança de turno**
```json
{
  "type": "TURN_CHANGE",
  "currentTurn": "uuid-do-jogador",
  "turnNumber": 15,
  "turnTimeout": 60
}
```

**Evento: Timer update (a cada segundo)**
```json
{
  "type": "TIMER_TICK",
  "remainingSeconds": 45
}
```

**Evento: Timeout de turno (jogador não atacou a tempo)**
```json
{
  "type": "TURN_TIMEOUT",
  "player": "uuid",
  "newTurn": "uuid-do-outro-jogador"
}
```

**Evento: Navio afundado**
```json
{
  "type": "SHIP_SUNK",
  "owner": "uuid-do-dono-do-navio",
  "ship": {
    "type": "DESTROYER",
    "cells": ["B9", "C9"]
  }
}
```

**Evento: Fim de jogo**
```json
{
  "type": "GAME_OVER",
  "winner": "uuid",
  "loser": "uuid",
  "reason": "ALL_SHIPS_SUNK | OPPONENT_DISCONNECTED | TIMEOUT",
  "gameId": "uuid"
}
```

**Evento: Oponente desconectou**
```json
{
  "type": "OPPONENT_DISCONNECTED",
  "message": "Oponente desconectou. Aguardando reconexão...",
  "reconnectTimeout": 30
}
```

**Evento: Oponente reconectou**
```json
{
  "type": "OPPONENT_RECONNECTED",
  "message": "Oponente reconectou!"
}
```

---

## 9. WebSocket — Chat da Sala

### 9.1 SEND `/app/game/{gameId}/chat`

Envia uma mensagem no chat da partida.

**Message (enviada pelo cliente):**
```json
{
  "content": "Boa sorte!"
}
```

---

### 9.2 SUBSCRIBE `/topic/game/{gameId}/chat`

Recebe mensagens do chat.

**Evento: Nova mensagem**
```json
{
  "type": "CHAT_MESSAGE",
  "sender": {
    "id": "uuid",
    "nickname": "RivalPlayer"
  },
  "content": "Boa sorte!",
  "timestamp": "2026-07-02T10:05:30Z"
}
```

**Evento: Mensagem do sistema**
```json
{
  "type": "SYSTEM_MESSAGE",
  "content": "RivalPlayer entrou na sala",
  "timestamp": "2026-07-02T10:04:00Z"
}
```

---

## 10. Resumo dos Status

### Status da Sala (`Room.status`)
| Status | Descrição |
|--------|-----------|
| `WAITING` | Aguardando segundo jogador |
| `FULL` | Dois jogadores na sala |
| `PLACING_SHIPS` | Jogadores posicionando navios |
| `IN_PROGRESS` | Jogo em andamento |
| `FINISHED` | Partida finalizada |

### Status do Navio (no frontend)
| Status | Descrição |
|--------|-----------|
| `intact` | Nenhuma célula atingida |
| `damaged` | Pelo menos uma célula atingida |
| `sunk` | Todas as células atingidas |
| `unknown` | Status desconhecido (navio inimigo) |

### Status da Célula (no frontend)
| Status | Descrição |
|--------|-----------|
| `empty` | Água (sem navio, sem ataque) |
| `ship` | Navio posicionado (visível apenas no próprio tabuleiro) |
| `hit` | Ataque que acertou um navio |
| `miss` | Ataque na água |
| `sunk` | Célula de navio afundado |

---

## 11. Considerações Técnicas

### Autenticação WebSocket
- Enviar JWT no header STOMP ao conectar: `{ Authorization: "Bearer <token>" }`
- O backend deve validar o token antes de aceitar a conexão

### Reconexão
- Se o WebSocket cair, o frontend tenta reconectar automaticamente
- O backend deve manter o estado do jogo por até 30s após desconexão
- Ao reconectar, o frontend recebe o estado atual completo do jogo

### Validações no Backend
- **Posicionamento:** Navios não podem se sobrepor, devem estar dentro do grid 10×10, devem ser contíguos (horizontal ou vertical)
- **Ataque:** Só pode atacar na sua vez, não pode atacar a mesma célula duas vezes
- **Timeout:** Se o jogador não atacar em 60s, o turno passa automaticamente
- **Anti-fraude:** O backend nunca deve enviar a posição dos navios do oponente ao cliente

### CORS
- Permitir origem do frontend em dev (`http://localhost:5173`)
- Configurar adequadamente para produção

### Formato de Células
- Colunas: `A` a `J` (letras)
- Linhas: `1` a `10` (números)
- Formato: `"{coluna}{linha}"` — ex: `"A1"`, `"J10"`, `"C4"`
