# Arquitetura do Sistema - Thoth Creative Suite 🏛️

Este documento descreve a arquitetura de software adotada no projeto Thoth. O sistema segue uma arquitetura baseada em **Componentes** e **Serviços**, utilizando o Firebase como Backend-as-a-Service (BaaS).

## Diagrama de Camadas

```mermaid
graph TD
    UI[Interface do Usuário (Pages & Components)] --> Contexts[Context API (State Management)]
    Contexts --> Services[Services Modules (Business Logic)]
    UI --> Services
    Services --> Firebase[(Firebase SDK)]
    Firebase --> Firestore[Firestore Database]
    Firebase --> Auth[Firebase Authentication]
    Firebase --> Storage[Firebase Storage]
```

## 1. Camada de Apresentação (View)
Localizada em `src/pages` e `src/components`.
- **Pages**: Atuam como containers principais de cada rota.
- **Components**: Componentes "burros" (presentational) ou "inteligentes" (com lógica local) reutilizáveis.
- **Estilização**: Tailwind CSS é usado para estrutura e utilitários, com CSS Modules ou CSS puro para efeitos complexos (Glassmorphism).

## 2. Gerenciamento de Estado (State)
Localizada em `src/contexts`.
- **AuthContext**: Gerencia sessão do usuário e perfil em memória.
- **ThemeContext**: Gerencia tema (dark/light) e persistência local.
- O estado global é minimizado; estados de dados (ex: lista de posts) são geralmente gerenciados localmente ou via cache de query nos componentes/hooks.

## 3. Camada de Serviços (Modules)
Localizada em `src/modules`.
Esta é a camada mais importante para a lógica de negócios.
- Encapsula chamadas ao Firestore/Auth.
- Transforma dados brutos do DB em interfaces tipadas do TypeScript.
- Exemplo: `UserService.createCompleteProfile` lida com a transação complexa de criar usuário e reservar índices únicos.

## 4. Banco de Dados e Backend
Utilizamos o **Firebase** serverless.
- **Firestore**: Banco NoSQL orientado a documentos.
  - Coleções principais: `users`, `posts`, `usernames`, `emails`, `print_jobs`.
- **Security Rules**: Definem quem pode ler/escrever. (ex: apenas o dono pode editar seu perfil).

## Fluxo de Dados Típico (Ex: Login)
1. Usuário preenche formulário em `Login.tsx`.
2. `Login.tsx` chama `AuthService.login()`.
3. `AuthService` comunica com Firebase Auth.
4. Firebase Auth retorna sucesso e dispara evento `onAuthStateChanged`.
5. `AuthContext` captura o evento, busca o perfil do usuário no Firestore (`UserService.getUserProfile`).
6. `AuthContext` atualiza o estado `user` e `userProfile`.
7. A UI reage à mudança de estado e redireciona para `/home`.
