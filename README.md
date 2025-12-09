# 🤖 Orryn CLI - AI-Powered Command Line Interface

<div align="center">

**Your AI Companion in the Terminal**

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)](https://www.prisma.io/)

[Features](#-features) • [Installation](#-installation) • [Usage](#-usage) • [Architecture](#-architecture) • [Demo](#-demo)

</div>

---

## 📖 About

Orryn CLI is a full-stack AI-powered command-line tool that brings the power of artificial intelligence directly to your terminal. Built with TypeScript, it provides an interactive, secure, and feature-rich experience for developers who want to leverage AI capabilities without leaving their development environment.

### Key Highlights

- 🔐 **Secure Authentication** - OAuth device flow authentication for CLI tools
- 💬 **Multiple AI Modes** - Standard chat, tool calling, and agentic code generation
- 🎨 **Beautiful Terminal UI** - Rich, interactive prompts with markdown rendering
- 💾 **Conversation Persistence** - Save and resume conversations with full history
- 🛠️ **Tool Integration** - Google Search, Code Execution, and URL Context
- 🤖 **Agent Mode** - Generate complete applications from natural language descriptions

---

## ✨ Features

### Core Features

- **Interactive CLI Interface**
  - Beautiful ASCII art banners and formatted output
  - Real-time streaming AI responses
  - Markdown rendering in terminal
  - Color-coded conversation history

- **Authentication System**
  - OAuth device flow (perfect for CLI tools)
  - Secure token storage and management
  - Session persistence across CLI sessions
  - GitHub OAuth integration

- **Multiple AI Interaction Modes**
  - **Chat Mode**: Simple conversational AI with markdown support
  - **Tool Calling Mode**: AI with access to Google Search, Code Execution, and URL Context
  - **Agent Mode**: Autonomous application generator that creates complete projects

- **Conversation Management**
  - Automatic conversation title generation
  - Message history persistence
  - Resume conversations with full context
  - Multiple conversation support per user

- **Web Dashboard**
  - Modern Next.js frontend for authentication
  - Device code approval interface
  - User profile management
  - Responsive design with Radix UI components

---

## 🏗️ Architecture

### System Architecture Diagram

```mermaid
graph TB
    subgraph "User's Machine"
        CLI[Orryn CLI Tool]
        TokenFile[Token Storage<br/>~/.better-auth/token]
    end
    
    subgraph "Frontend - Next.js"
        WebApp[Web Dashboard<br/>Port 3000]
        AuthUI[Authentication UI]
        DevicePage[Device Approval Page]
    end
    
    subgraph "Backend - Express.js"
        APIServer[API Server<br/>Port 3005]
        AuthHandler[Better Auth Handler]
        ChatService[Chat Service]
        AIService[AI Service]
    end
    
    subgraph "External Services"
        GoogleAI[Google AI SDK]
        GitHubOAuth[GitHub OAuth]
    end
    
    subgraph "Database - PostgreSQL"
        DB[(PostgreSQL Database)]
        UserModel[User Model]
        SessionModel[Session Model]
        ConversationModel[Conversation Model]
        MessageModel[Message Model]
    end
    
    CLI -->|HTTP Requests| APIServer
    CLI -->|Read/Write| TokenFile
    WebApp -->|HTTP Requests| APIServer
    APIServer -->|OAuth Flow| GitHubOAuth
    APIServer -->|CRUD Operations| DB
    APIServer -->|AI Requests| GoogleAI
    ChatService --> DB
    AIService --> GoogleAI
    
    DB --> UserModel
    DB --> SessionModel
    DB --> ConversationModel
    DB --> MessageModel
    
    style CLI fill:#4CAF50,color:#fff
    style WebApp fill:#0070f3,color:#fff
    style APIServer fill:#ff6b6b,color:#fff
    style DB fill:#336791,color:#fff
    style GoogleAI fill:#4285F4,color:#fff
```

### Component Architecture

```mermaid
graph LR
    subgraph "CLI Layer"
        Main[main.ts<br/>Command Router]
        LoginCmd[login.ts<br/>Auth Command]
        WakeUpCmd[wakeUp.ts<br/>AI Command]
        ChatModule[chat-with-ai.ts<br/>Chat Handler]
        ToolChat[chat-with-ai-tool.ts<br/>Tool Handler]
        AgentChat[chat-with-ai-agent.ts<br/>Agent Handler]
    end
    
    subgraph "Service Layer"
        ChatService[ChatService<br/>Conversation Management]
        AIService[AIService<br/>Google AI Integration]
        TokenLib[Token Library<br/>Auth Token Management]
    end
    
    subgraph "Data Layer"
        PrismaClient[Prisma Client<br/>Database ORM]
        Models[Database Models<br/>User, Session, Conversation, Message]
    end
    
    Main --> LoginCmd
    Main --> WakeUpCmd
    WakeUpCmd --> ChatModule
    WakeUpCmd --> ToolChat
    WakeUpCmd --> AgentChat
    
    ChatModule --> ChatService
    ChatModule --> AIService
    ToolChat --> ChatService
    ToolChat --> AIService
    AgentChat --> ChatService
    AgentChat --> AIService
    
    ChatService --> PrismaClient
    LoginCmd --> TokenLib
    TokenLib --> PrismaClient
    PrismaClient --> Models
    
    style Main fill:#9b59b6,color:#fff
    style ChatService fill:#3498db,color:#fff
    style AIService fill:#e74c3c,color:#fff
    style PrismaClient fill:#2ecc71,color:#fff
```

---

## 🔄 Flow Diagrams

### Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant CLI
    participant API
    participant Web
    participant GitHub
    participant DB
    
    User->>CLI: orryn login
    CLI->>API: Request device code
    API->>DB: Create device code record
    API-->>CLI: Return user_code & device_code
    CLI->>CLI: Display user_code
    CLI->>Web: Open browser with user_code
    User->>Web: Approve login
    Web->>GitHub: OAuth authentication
    GitHub-->>Web: Return auth token
    Web->>API: Update device code status
    API->>DB: Update device code (approved)
    CLI->>API: Poll for token (every 5s)
    API->>DB: Check device code status
    DB-->>API: Device code approved
    API->>DB: Create session
    API-->>CLI: Return access_token
    CLI->>CLI: Store token locally
    CLI-->>User: Login successful
```

### Chat Flow

```mermaid
sequenceDiagram
    participant User
    participant CLI
    participant ChatService
    participant AIService
    participant GoogleAI
    participant DB
    
    User->>CLI: orryn wakeup → chat
    CLI->>ChatService: Get or create conversation
    ChatService->>DB: Query/create conversation
    DB-->>ChatService: Return conversation
    ChatService-->>CLI: Conversation loaded
    
    loop Chat Loop
        User->>CLI: Enter message
        CLI->>ChatService: Save user message
        ChatService->>DB: Insert message
        CLI->>ChatService: Get conversation messages
        ChatService->>DB: Fetch messages
        DB-->>ChatService: Return messages
        ChatService-->>CLI: Formatted messages
        CLI->>AIService: Send messages to AI
        AIService->>GoogleAI: Stream request
        GoogleAI-->>AIService: Stream response chunks
        AIService-->>CLI: Render chunks (markdown)
        CLI->>ChatService: Save AI response
        ChatService->>DB: Insert message
        CLI-->>User: Display formatted response
    end
```

### Tool Calling Flow

```mermaid
sequenceDiagram
    participant User
    participant CLI
    participant ToolConfig
    participant AIService
    participant GoogleAI
    participant Tools[Google Tools]
    participant DB
    
    User->>CLI: orryn wakeup → tools
    CLI->>User: Select tools (multiselect)
    User-->>CLI: Selected tools
    CLI->>ToolConfig: Enable selected tools
    CLI->>DB: Create conversation (mode: tool)
    
    User->>CLI: Enter query
    CLI->>AIService: Send message with tools
    AIService->>GoogleAI: Request with tool definitions
    GoogleAI->>GoogleAI: Decide tool usage
    GoogleAI-->>AIService: Tool call request
    AIService->>Tools: Execute tool (Search/Code/URL)
    Tools-->>AIService: Tool result
    AIService->>GoogleAI: Send tool result
    GoogleAI-->>AIService: Final response with context
    AIService-->>CLI: Stream response
    CLI->>DB: Save messages
    CLI-->>User: Display response + tool info
```

### Agent Mode Flow

```mermaid
sequenceDiagram
    participant User
    participant CLI
    participant AgentConfig
    participant AIService
    participant GoogleAI
    participant FileSystem
    participant DB
    
    User->>CLI: orryn wakeup → agent
    CLI->>User: Confirm file system access
    User-->>CLI: Confirm
    CLI->>DB: Create conversation (mode: agent)
    
    User->>CLI: Describe application
    CLI->>AgentConfig: generateApplication()
    AgentConfig->>AIService: Generate structured output
    AIService->>GoogleAI: Request with Zod schema
    GoogleAI-->>AIService: Structured application data
    AIService-->>AgentConfig: Application object
    
    AgentConfig->>AgentConfig: Display file tree
    AgentConfig->>FileSystem: Create directory
    AgentConfig->>FileSystem: Write files (loop)
    FileSystem-->>AgentConfig: Files created
    AgentConfig->>DB: Save generation details
    AgentConfig-->>CLI: Success + location
    CLI-->>User: Application generated
```

---

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js 5.x
- **CLI Framework**: Commander.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Better Auth with OAuth device flow
- **AI Integration**: Google AI SDK (@ai-sdk/google)
- **Terminal UI**: 
  - @clack/prompts (interactive prompts)
  - chalk (colors)
  - boxen (bordered boxes)
  - figlet (ASCII art)
  - marked-terminal (markdown rendering)

### Frontend
- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19
- **Styling**: Tailwind CSS 4
- **Components**: Radix UI (headless components)
- **Authentication**: Better Auth React client
- **Form Handling**: React Hook Form + Zod

### Database
- **Database**: PostgreSQL
- **ORM**: Prisma 6.x
- **Models**: User, Session, Account, Verification, DeviceCode, Conversation, Message

---

## 📁 Project Structure

```
Orryn-Cli/
├── client/                 # Next.js frontend
│   ├── app/               # App router pages
│   │   ├── (auth)/        # Auth routes
│   │   ├── device/        # Device approval page
│   │   └── approve/       # Approval page
│   ├── components/        # React components
│   │   └── ui/           # Radix UI components
│   └── lib/              # Utilities
│       └── auth-client.ts # Better Auth client
│
├── server/                # Express backend + CLI
│   ├── src/
│   │   ├── cli/          # CLI commands
│   │   │   ├── commands/
│   │   │   │   ├── auth/ # Login/logout commands
│   │   │   │   └── ai/  # AI wakeup command
│   │   │   ├── chat/    # Chat handlers
│   │   │   │   ├── chat-with-ai.ts
│   │   │   │   ├── chat-with-ai-tool.ts
│   │   │   │   └── chat-with-ai-agent.ts
│   │   │   └── ai/      # AI service
│   │   ├── config/       # Configuration files
│   │   │   ├── agent.config.ts
│   │   │   ├── google.config.ts
│   │   │   └── tool.config.ts
│   │   ├── lib/          # Core libraries
│   │   │   ├── auth.ts   # Better Auth setup
│   │   │   ├── db.ts     # Prisma client
│   │   │   └── token.ts  # Token management
│   │   ├── service/      # Business logic
│   │   │   └── chat.service.ts
│   │   └── index.ts      # Express server
│   └── prisma/           # Database schema & migrations
│       └── schema.prisma
│
└── README.md
```

---

## 🚀 Installation

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (local or cloud)
- GitHub OAuth App credentials
- Google AI API key

### Step 1: Clone the Repository

```bash
git clone https://github.com/Swarnim-Chandve/Orryn-Cli.git
cd Orryn-Cli
```

### Step 2: Set Up Backend

```bash
cd server
npm install
```

Create a `.env` file in the `server` directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/orryn_db"

# Server
PORT=3005
FRONTEND_URL="http://localhost:3000"

# GitHub OAuth
GITHUB_CLIENT_ID="your_github_client_id"
GITHUB_CLIENT_SECRET="your_github_client_secret"

# Google AI
GOOGLE_API_KEY="your_google_ai_api_key"
```

Run database migrations:

```bash
npx prisma migrate dev
npx prisma generate
```

Start the backend server:

```bash
npm run dev
```

### Step 3: Set Up Frontend

Open a new terminal:

```bash
cd client
npm install
```

Create a `.env.local` file in the `client` directory:

```env
NEXT_PUBLIC_SERVER_URL="http://localhost:3005"
```

Start the frontend:

```bash
npm run dev
```

### Step 4: Install CLI Globally (Optional)

```bash
cd server
npm link
```

Or use directly:

```bash
cd server
node src/cli/main.ts wakeup
```

---

## 💻 Usage

### Authentication

```bash
# Login (first time)
orryn login

# Check current user
orryn whoami

# Logout
orryn logout
```

### Using AI Features

```bash
# Start AI interaction
orryn wakeup

# Select mode:
# 1. Chat - Simple conversation
# 2. Tools - AI with tool access
# 3. Agent - Code generation
```

### Example Interactions

**Chat Mode:**
```
$ orryn wakeup
> Select: Chat
> Enter message: Explain React hooks
🤖 Assistant: [Streaming markdown response...]
```

**Tool Calling Mode:**
```
$ orryn wakeup
> Select: Tool Calling
> Select tools: [Google Search, Code Execution]
> Enter query: What's the weather in San Francisco?
🔧 Tool: google_search
✅ Result: [Search results...]
🤖 Assistant: [Response with real-time data]
```

**Agent Mode:**
```
$ orryn wakeup
> Select: Agentic Mode
> Describe: Build a todo app with React and Tailwind
🤖 Generating application...
✅ Created: todo-app/
📁 Files: 15
📝 Setup: cd todo-app && npm install && npm run dev
```

---

## 🎥 Demo

<!-- Add your demo video here -->
<!-- 
[![Demo Video](https://img.youtube.com/vi/VIDEO_ID/0.jpg)](https://www.youtube.com/watch?v=VIDEO_ID)
-->

**Demo Video Coming Soon!**

<!-- Or embed directly:
<video width="100%" controls>
  <source src="demo.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>
-->

### Screenshots

<!-- Add screenshots here -->
<!-- 
![CLI Login](screenshots/login.png)
![Chat Mode](screenshots/chat.png)
![Tool Calling](screenshots/tools.png)
![Agent Mode](screenshots/agent.png)
-->

---

## 🔧 Configuration

### Environment Variables

#### Backend (`server/.env`)

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `PORT` | Server port (default: 3005) | No |
| `FRONTEND_URL` | Frontend URL for CORS | Yes |
| `GITHUB_CLIENT_ID` | GitHub OAuth app client ID | Yes |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth app secret | Yes |
| `GOOGLE_API_KEY` | Google AI API key | Yes |

#### Frontend (`client/.env.local`)

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SERVER_URL` | Backend API URL | Yes |

### GitHub OAuth Setup

1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Create a new OAuth App
3. Set Authorization callback URL: `http://localhost:3005/api/auth/callback/github`
4. Copy Client ID and Secret to `.env`

### Google AI API Setup

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add to `server/.env` as `GOOGLE_API_KEY`

---

## 🗄️ Database Schema

```mermaid
erDiagram
    User ||--o{ Session : has
    User ||--o{ Account : has
    User ||--o{ Conversation : has
    Conversation ||--o{ Message : contains
    
    User {
        string id PK
        string name
        string email UK
        boolean emailVerified
        string image
        datetime createdAt
        datetime updatedAt
    }
    
    Session {
        string id PK
        string token UK
        datetime expiresAt
        string userId FK
        string ipAddress
        string userAgent
    }
    
    Account {
        string id PK
        string accountId
        string providerId
        string userId FK
        string accessToken
        string refreshToken
    }
    
    Conversation {
        string id PK
        string userId FK
        string title
        string mode
        datetime createdAt
        datetime updatedAt
    }
    
    Message {
        string id PK
        string conversationId FK
        string role
        string content
        datetime createdAt
    }
    
    DeviceCode {
        string id PK
        string deviceCode
        string userCode
        string userId
        datetime expiresAt
        string status
    }
```

---

## 🧪 Development

### Running in Development Mode

**Backend:**
```bash
cd server
npm run dev  # Uses nodemon for auto-reload
```

**Frontend:**
```bash
cd client
npm run dev  # Next.js dev server with hot reload
```

### Database Migrations

```bash
# Create a new migration
cd server
npx prisma migrate dev --name migration_name

# Apply migrations
npx prisma migrate deploy

# Open Prisma Studio (GUI)
npx prisma studio
```

### Building for Production

**Backend:**
```bash
cd server
npm run build  # Compile TypeScript
npm start      # Run production server
```

**Frontend:**
```bash
cd client
npm run build  # Build Next.js app
npm start      # Run production server
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use meaningful commit messages
- Add comments for complex logic
- Test your changes thoroughly
- Update documentation as needed

---

## 📝 License

This project is licensed under the ISC License.

---

## 🙏 Acknowledgments

- [Better Auth](https://www.better-auth.com/) - Authentication library
- [Google AI SDK](https://ai.google.dev/) - AI capabilities
- [Prisma](https://www.prisma.io/) - Database ORM
- [Next.js](https://nextjs.org/) - React framework
- [Commander.js](https://github.com/tj/commander.js) - CLI framework
- [@clack/prompts](https://github.com/natemoo-re/clack) - Terminal UI

---

## 📧 Contact

- **GitHub**: [@Swarnim-Chandve](https://github.com/Swarnim-Chandve)
- **Project Link**: [https://github.com/Swarnim-Chandve/Orryn-Cli](https://github.com/Swarnim-Chandve/Orryn-Cli)

---

<div align="center">

**Made with ❤️ using TypeScript, Node.js, and Next.js**

⭐ Star this repo if you find it helpful!

</div>

