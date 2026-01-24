# Thoth Creative Suite 🦉

![Status](https://img.shields.io/badge/status-development-orange)
![Version](https://img.shields.io/badge/version-1.6-blue)

**Thoth Creative Suite** é uma plataforma acadêmica e social integrada, projetada para conectar estudantes, professores e pesquisadores. O sistema oferece desde rede social acadêmica até ferramentas de produtividade e gestão de impressões.

## 🎯 Objetivo do Sistema

Criar um ecossistema digital que centralize a vida acadêmica, facilitando:
- Networking entre estudantes e mentores.
- Compartilhamento de conteúdo (portfólios, artigos, perguntas).
- Acesso a serviços do campus (impressão 3D e 2D, reservas).
- Gestão de estudos e produtividade.

## 🚀 Tecnologias Utilizadas

- **Frontend Framework**: React 19 (via Vite)
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS + Pure CSS (Glassmorphism)
- **Ícones**: Lucide React
- **Backend / Infra**: Google Firebase (Auth, Firestore, Storage)
- **Roteamento**: React Router DOM 6

## 📦 Como Rodar Localmente

Certifique-se de ter o Node.js v18+ instalado.

1. **Clone o repositório**
   ```bash
   git clone https://github.com/seu-usuario/thoth-creative-suite.git
   cd thoth-creative-suite
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente**
   Crie um arquivo `.env` na raiz e adicione suas credenciais do Firebase:
   ```env
   VITE_API_KEY=sua_api_key
   VITE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
   VITE_PROJECT_ID=seu_projeto
   ...
   ```

4. **Inicie o servidor de desenvolvimento**
   ```bash
   npm run dev
   ```
   Acesse `http://localhost:5173`.

## 📂 Estrutura de Pastas

```
/
├── src/
│   ├── components/    # Componentes reutilizáveis (UI Kit)
│   ├── contexts/      # Context API (Auth, Theme)
│   ├── modules/       # Lógica de negócios e Services (Firebase Calls)
│   ├── pages/         # Telas da aplicação
│   ├── routes/        # Rotas e guardas de rota (Protected/Admin)
│   ├── types.ts       # Definições de tipos TypeScript globais
│   └── ...
├── public/            # Assets estáticos
└── ...
```

## 🔐 Funcionalidades Principais

- **Feed Acadêmico**: Posts, likes, comentários e compartilhamento.
- **Conexões**: Sistema de seguidores e sugestões de networking.
- **Thoth Print**: Sistema de submissão de arquivos para impressão no campus.
- **Gamificação**: Badges e conquistas exibidas no perfil.
- **Chat IA**: Assistente virtual integrado (Thoth AI).

---
*Desenvolvido com ❤️ pela equipe Thoth.*
