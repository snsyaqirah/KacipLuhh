# 💬 KacipLuhh

> Bilik sembang sementara — kacip, settle, hilang. Tak payah buat group baru.

![Status](https://img.shields.io/badge/status-in%20progress-yellow)
![Version](https://img.shields.io/badge/version-0.1.0-blue)
![License](https://img.shields.io/badge/license-MIT-lightgrey)
![Brand](https://img.shields.io/badge/brand-Luhh%20Series-black)

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [User Flow](#-user-flow)
- [Database / Storage](#-storage-redis)
- [API Structure](#-api-structure)
- [Frontend Components](#-frontend-components)
- [Feature Flows](#-feature-specific-flows)
- [Security & Privacy](#-security--privacy)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Project Structure](#-project-structure)
- [Roadmap](#-roadmap)
- [License](#-license)

---

## 🧭 Overview

KacipLuhh is a no-login, temporary web chat room built for quick, private group discussions that don't need to exist forever. Create a room, share the link, kacip dengan kawan-kawan, done — bilik hilang sendiri. No WhatsApp group needed. No accounts. No receipts.

Built for situations like: planning a surprise gift when the person is in your main group chat, quick team sync, throwaway discussion threads.

**Type:** `Solo`
**Brand:** `Luhh Series`
**Built with:** Independent

---

## ✨ Features

- ✅ Buat bilik dalam 10 saat — nama bilik sendiri, dapat link pendek terus
- ✅ Join tanpa akaun — pilih nickname, masuk terus
- ✅ Real-time chat dengan WebSocket (Socket.io)
- ✅ Tahu siapa online, siapa offline dalam bilik
- ✅ Bilik auto-delete — pilih 6, 12, 24, atau 48 jam
- ✅ Owner boleh extend masa bilik
- ✅ End-to-end encryption (E2EE) — server langsung tak boleh baca mesej
- ✅ Dual language UI — BM / EN dengan animated slide toggle
- ✅ Nickname persistent via localStorage token — tak perlu login semula
- ✅ Owner recovery link — owner identity survive tanpa akaun
- ✅ Zero message logging — tiada rekod, tiada jejak
- 🚧 Attach image dalam chat *(in progress)*
- 🚧 Poll / quick vote dalam bilik *(in progress)*

---

## 🛠 Tech Stack

```mermaid
graph TD
    subgraph Frontend
        FE["React + Vite"]
        UI["Tailwind CSS"]
        SK["Socket.io-client"]
        CR["Crypto API (E2EE)"]
    end
    subgraph Backend
        BE["Node.js + Express"]
        WS["Socket.io Server"]
        MW["Token Middleware"]
    end
    subgraph Infrastructure
        RD[("Redis (TTL-based storage)")]
        HOST["Vercel (FE) + Railway (BE)"]
    end
    FE --> BE
    SK --> WS
    CR --> SK
    WS --> RD
    BE --> RD
    MW --> WS
```

| Layer | Tech | Sebab |
|---|---|---|
| Frontend | React + Vite | Ringan, fast dev, no SSR needed untuk chat app |
| Styling | Tailwind CSS | Utility-first, senang maintain, consistent design |
| Real-time | Socket.io | Industry standard untuk WebSocket, handle reconnection auto |
| Encryption | Web Crypto API | Built-in browser API, E2EE tanpa library tambahan |
| Backend | Node.js + Express | Event-driven — perfect untuk WebSocket, same language as FE |
| Storage | Redis | Purpose-built untuk ephemeral data + TTL auto-expire |
| Hosting | Vercel + Railway | Free tier cukup untuk MVP, deploy semudah push to main |

---

## 📌 Architecture

### High-level Architecture

```mermaid
graph TD
    A["User / Browser"] --> B["React Frontend (Vercel)"]
    B -->|"REST (room create/join)"| C["Express Backend (Railway)"]
    B -->|"WebSocket (chat)"| D["Socket.io Server"]
    C --> E[("Redis (TTL rooms + messages)")]
    D --> E
    B -->|"E2EE encrypt/decrypt"| B
```

### System Architecture

```mermaid
graph TD
    subgraph Frontend
        P["Pages (Home, Room, Join)"]
        CM["Components (ChatWindow, MessageBubble, UserList)"]
        CL["Crypto Layer (encrypt / decrypt)"]
        SH["Socket Hook (useSocket)"]
        AP["API Client (axios)"]
    end
    subgraph Backend
        RT["Routes (/api/room)"]
        MW["Middleware (token validation)"]
        CT["Controllers (RoomController)"]
        SV["Services (RoomService)"]
        SO["Socket.io Handlers"]
    end
    subgraph Storage
        RD[("Redis")]
        RM["room:{id} — metadata, TTL"]
        MS["room:{id}:messages — message list"]
        US["room:{id}:users — active users"]
    end

    P --> CM
    CM --> CL
    CM --> SH
    CM --> AP
    AP --> RT
    RT --> MW --> CT --> SV --> RD
    SH --> SO --> RD
    RD --> RM
    RD --> MS
    RD --> US
```

---

## 👤 User Flow

```mermaid
flowchart TD
    A([Bukak kacipluhh.app]) --> B{Nak buat atau join?}

    B -->|Buat Bilik| C["Isi nama bilik + pilih tempoh\n(6h / 12h / 24h / 48h)"]
    C --> D["Server generate Room ID + Owner Token"]
    D --> E["Dapat 2 links:\n🔗 Share Link → kawan-kawan\n🔐 Owner Link → simpan sendiri"]
    E --> F["Pick nickname → masuk bilik"]

    B -->|Ada link| G["Bukak share link"]
    G --> H{Token dalam localStorage?}
    H -->|Ada| I["Auto-join dengan nickname lama"]
    H -->|Takda| J["Pick nickname baru → dapat member token"]
    J --> I

    F --> K["💬 Chat dalam bilik"]
    I --> K

    K --> L{Bilik expired?}
    L -->|Belum| K
    L -->|Dah expired| M["🚨 Room auto-deleted\nAll messages gone"]
    M --> N([End])
```

### Page Map

```mermaid
graph TD
    subgraph Public ["🌐 Public Routes"]
        ROOT["/\nLanding — Buat Bilik"]
        JOIN["/join/:roomId\nJoin page — pick nickname"]
        ROOM["/:roomSlug/:roomId\nChat room"]
    end

    subgraph Owner ["🔐 Owner Route"]
        OWN["/owner/:roomId?token=xxx\nOwner view — extend / close room"]
    end

    ROOT --> JOIN
    JOIN --> ROOM
    ROOT -->|"Owner link"| OWN
    OWN --> ROOM

    style Public fill:#e8f5e9,stroke:#4caf50
    style Owner fill:#fff3e0,stroke:#ff9800
```

---

## 🗄️ Storage (Redis)

KacipLuhh guna **Redis** sebagai satu-satunya storage. Tiada SQL database. Tiada persistent storage. Semua data ada TTL — bila expired, hilang automatik.

```mermaid
erDiagram
    ROOM {
        string id PK
        string slug
        string name
        string owner_token
        number expires_at
        number created_at
        string status
    }
    MESSAGE {
        string id PK
        string room_id FK
        string sender_nickname
        string encrypted_content
        number timestamp
    }
    USER_SESSION {
        string token PK
        string room_id FK
        string nickname
        string role
        number last_ping
    }
    ROOM ||--o{ MESSAGE : "contains"
    ROOM ||--o{ USER_SESSION : "has"
```

### Redis Key Structure

| Key | Type | TTL | Purpose |
|---|---|---|---|
| `room:{id}` | Hash | sama dengan expiry bilik | Metadata bilik |
| `room:{id}:messages` | List | sama dengan expiry bilik | Senarai mesej (encrypted) |
| `room:{id}:users` | Hash | sama dengan expiry bilik | Active users + last ping |
| `token:{token}` | Hash | 48h | Session token untuk nickname persistence |

> ⚠️ Semua key delete sendiri bila TTL habis. Tiada cron job diperlukan. Tiada manual cleanup.

---

## 🔌 API Structure

```mermaid
graph TD
    API["REST API\n/api"]
    API --> RM["/api/room"]

    RM --> R1["POST /\nBuat bilik baru"]
    RM --> R2["GET /:id\nSemak bilik wujud + metadata"]
    RM --> R3["POST /:id/join\nJoin bilik, dapat member token"]
    RM --> R4["POST /:id/extend\nExtend masa (owner only)"]
    RM --> R5["DELETE /:id\nClose bilik awal (owner only)"]
```

### WebSocket Events

| Event | Direction | Purpose |
|---|---|---|
| `room:join` | Client → Server | User masuk bilik |
| `room:leave` | Client → Server | User keluar bilik |
| `message:send` | Client → Server | Hantar mesej (encrypted) |
| `message:receive` | Server → Client | Terima mesej dari user lain |
| `presence:update` | Server → Client | Broadcast sapa online/offline |
| `ping` | Client → Server | Heartbeat tiap 10 saat |
| `room:expired` | Server → Client | Notify semua user bilik nak delete |

---

## 🧩 Frontend Components

```mermaid
graph TD
    App --> Layout
    Layout --> LangToggle["LangToggle\n(BM/EN slide animation)"]
    Layout --> Router

    Router --> HomePage
    Router --> JoinPage
    Router --> RoomPage
    Router --> OwnerPage

    HomePage --> CreateRoomForm
    JoinPage --> NicknamePicker

    RoomPage --> ChatWindow
    RoomPage --> UserList
    RoomPage --> RoomHeader["RoomHeader\n(nama bilik + countdown timer)"]

    ChatWindow --> MessageBubble
    ChatWindow --> MessageInput
    MessageInput --> EmojiPicker

    OwnerPage --> ExpiryExtender
    OwnerPage --> RoomStats
```

| Component | Purpose |
|---|---|
| `LangToggle` | Animated BM/EN slide toggle, persist pilihan dalam localStorage |
| `CreateRoomForm` | Nama bilik + pilih tempoh + generate links |
| `NicknamePicker` | Pick nama, semak duplicate dalam bilik |
| `ChatWindow` | Main chat area, render messages, auto-scroll |
| `MessageBubble` | Bubble mesej — own vs others, timestamp |
| `UserList` | Sidebar — tunjuk siapa online (hijau) dan offline (kelabu) |
| `RoomHeader` | Nama bilik + countdown timer live |
| `ExpiryExtender` | Owner extend masa bilik (tambah 6/12/24 jam) |

---

## ⚙️ Feature-specific Flows

### Room Creation Flow

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Frontend
    participant API as Backend
    participant RD as Redis

    U->>FE: Isi nama bilik + pilih tempoh
    FE->>FE: Generate E2EE keypair (public + private)
    FE->>API: POST /api/room {name, duration, publicKey}
    API->>API: Generate roomId, slug, ownerToken
    API->>RD: SET room:{id} {metadata} EX {duration}
    RD-->>API: OK
    API-->>FE: {roomId, slug, shareLink, ownerLink}
    FE->>FE: Simpan ownerToken + privateKey dalam localStorage
    FE-->>U: Tunjuk dua link — Share Link + Owner Link
```

### Chat & E2EE Flow

```mermaid
sequenceDiagram
    participant SA as Sender (Browser)
    participant SV as Socket.io Server
    participant RB as Redis
    participant RB2 as Receiver (Browser)

    SA->>SA: Encrypt mesej dengan room public key
    SA->>SV: emit message:send {encrypted_content}
    SV->>RB: RPUSH room:{id}:messages {encrypted_content}
    SV->>RB2: emit message:receive {encrypted_content}
    RB2->>RB2: Decrypt dengan room private key (stored locally)
    RB2-->>RB2: Render mesej
    Note over SV,RB: Server hanya nampak ciphertext.<br/>Tak boleh baca kandungan mesej.
```

### Online/Offline Presence Flow

```mermaid
flowchart TD
    A([User bukak bilik]) --> B["WebSocket connect\nServer mark ONLINE"]
    B --> C["Start heartbeat ping\nevery 10 seconds"]
    C --> D{Ping received?}
    D -->|Ya| E["Update last_ping timestamp\nKekal ONLINE"]
    E --> C
    D -->|Miss 2 pings (20s)| F["Mark OFFLINE\nBroadcast presence:update"]
    F --> G{User reconnect?}
    G -->|Ya| B
    G -->|Tidak| H["Remove from user list\nafter 5 minit"]

    I([User tutup tab]) --> J["WebSocket disconnect event\nImmediate OFFLINE"]
    J --> F
```

### Expiry & Extension Flow

```mermaid
flowchart TD
    A["Bilik dicipta\nTTL set dalam Redis"] --> B["Countdown timer jalan\ndi semua client"]
    B --> C{10 minit sebelum expired}
    C --> D["Server emit room:expired warning\nkepada semua user"]
    D --> E{Owner nak extend?}
    E -->|Ya| F["POST /api/room/:id/extend\n+ ownerToken"]
    F --> G["Validate ownerToken"]
    G --> H["Redis TTL dipanjangkan\nCountdown reset"]
    H --> B
    E -->|Tidak| I{TTL = 0?}
    I --> J["Redis auto-delete semua keys\nServer emit room:deleted"]
    J --> K["Semua user redirect ke landing\n'Bilik dah hilang ✌️'"]
```

---

## 🔐 Security & Privacy

Ini bahagian paling kritikal untuk KacipLuhh — sebab value proposition utama dia adalah *privacy dan ephemeral*.

### Threat Model & Mitigations

| Ancaman | Mitigation |
|---|---|
| Owner server/database baca mesej | E2EE — server hanya simpan ciphertext |
| Database kena hack / leak | Semua data ada TTL, max 48h, content encrypted |
| Man-in-the-middle intercept | WSS (WebSocket Secure) + HTTPS enforced |
| Session hijack / impersonation | Token signed, tidak boleh forge |
| Brute force room ID | Room ID = UUID random (128-bit entropy) |
| User share link ke orang tak diundang | Room owner boleh close bilik manual |

### E2EE Implementation

```mermaid
sequenceDiagram
    participant FE as Creator (Browser)
    participant SV as Server
    participant JO as Joiner (Browser)

    FE->>FE: Generate AES-256 symmetric key
    FE->>FE: Simpan key dalam localStorage
    FE->>SV: POST /api/room (tanpa key — key tidak pernah ke server)
    SV-->>FE: roomId + shareLink

    Note over FE: Key diembed dalam URL hash fragment\n(contoh: /room/xyz#key=abc123)\nHash fragment tidak dihantar ke server

    FE->>JO: Share full URL (dengan #key)
    JO->>JO: Extract key dari URL hash
    JO->>JO: Simpan key dalam localStorage
    JO->>SV: Join room (tanpa menghantar key)

    Note over SV: Server langsung tidak pernah nampak key
```

> **Key point:** URL hash fragment (`#`) tidak dihantar dalam HTTP request. Server tak pernah nampak encryption key. Ini adalah cara Signal dan ProtonMail buat E2EE dalam browser.

### Legal Protection (CYA)

- **Zero-knowledge architecture** — secara teknikal mustahil untuk operator baca kandungan mesej
- **No logs** — tiada request logging untuk content mesej
- **Auto-delete** — data tidak wujud lebih dari 48 jam
- **Terms of Service** wajib ada: users agree to no illegal content
- **No IP logging** untuk mesej (boleh log untuk abuse prevention sahaja)

---

## 🚀 Getting Started

### Prerequisites

- Node.js `>=18`
- Redis (local atau upstash.io untuk cloud)
- npm atau pnpm

### Installation

```bash
git clone https://github.com/[username]/kacipluhh.git
cd kacipluhh

# Install backend
cd backend && npm install

# Install frontend
cd ../frontend && npm install
```

### Running locally

```bash
# Terminal 1 — Redis (kalau guna local)
redis-server

# Terminal 2 — Backend
cd backend && npm run dev

# Terminal 3 — Frontend
cd frontend && npm run dev
```

---

## 🔑 Environment Variables

### Backend (`backend/.env`)

```env
PORT=3001
NODE_ENV=development

# Redis
REDIS_URL=redis://localhost:6379

# Security
TOKEN_SECRET=your-random-secret-here
CORS_ORIGIN=http://localhost:5173

# Room limits
MAX_ROOM_DURATION_HOURS=48
MAX_MESSAGES_PER_ROOM=500
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001
```

> Copy `.env.example` ke `.env` dan isi values.

---

## 📁 Project Structure

```
kacipluhh/
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── chat/          # ChatWindow, MessageBubble, MessageInput
│       │   ├── room/          # RoomHeader, UserList, ExpiryExtender
│       │   └── ui/            # LangToggle, Button, Input (shared)
│       ├── pages/             # HomePage, JoinPage, RoomPage, OwnerPage
│       ├── hooks/             # useSocket, useRoom, useCrypto, usePresence
│       ├── lib/               # crypto.js, api.js, token.js
│       └── i18n/              # bm.js, en.js (translation strings)
│
└── backend/
    └── src/
        ├── routes/            # room.routes.js
        ├── controllers/       # room.controller.js
        ├── services/          # room.service.js, presence.service.js
        ├── socket/            # handlers/ (message, presence, room)
        ├── middleware/        # token.middleware.js
        └── lib/               # redis.js, token.js
```

> **Kenapa struktur ni?** Setiap folder ada satu tanggungjawab. `hooks/` untuk logic, `components/` untuk UI, `services/` untuk business logic, `lib/` untuk utilities. Bila project besar, kau tahu exactly mana nak cari apa.

---

## 🗺 Roadmap

- [x] Core room creation + join flow
- [x] Real-time WebSocket chat
- [x] E2EE dengan AES-256
- [x] Presence (online/offline detection)
- [x] Auto-expiry + Redis TTL
- [x] Owner extend functionality
- [x] Dual language BM/EN
- [ ] Image attachment dalam chat
- [ ] Quick poll / vote feature
- [ ] Room passcode (optional protection)
- [ ] Mobile PWA support

---

## 📄 License

[MIT](LICENSE) © 2025 Luhh Series
