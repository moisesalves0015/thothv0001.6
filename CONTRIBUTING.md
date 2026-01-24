# Guia de Contribuição - Thoth Creative Suite 🛠️

Obrigado pelo interesse em contribuir para o Thoth! Siga estas diretrizes para manter o código limpo, consistente e seguro.

## 🔨 Configuração do Ambiente

1. Garanta que você está usando a versão LTS do Node.js.
2. Use `npm` para gerenciar dependências (evite `yarn` ou `pnpm` para não gerar lockfiles conflitantes).
3. Instale as extensões recomendadas do VS Code:
   - ESLint
   - Prettier
   - Tailwind CSS IntelliSense

## 🎨 Padrões de Código

### TypeScript
- **Tipagem Forte**: Evite `any` a todo custo. Crie interfaces em `types.ts` ou localmente se for algo muito específico.
- **Interfaces vs Types**: Prefira `interface` para modelos de dados (Objetos) e `type` para uniões ou tipos funcionais.

### React
- **Componentes Funcionais**: Use sempre `React.FC` ou funções diretas com tipagem de props.
- **Hooks**: Mantenha a lógica de negócio em Custom Hooks (`useAuth`, `usePrinter`) sempre que possível, deixando o componente apenas com a UI.
- **Importações**: Agrupe importações:
  1. React / Libs Externas
  2. Contexts / Hooks / Services
  3. Componentes
  4. Interfaces / Tipos
  5. Assets / Estilos

### Estilização (Tailwind CSS)
- Use classes utilitárias para layout e espaçamento.
- Para componentes complexos, extraia classes comuns usando `@apply` no CSS ou componentes reutilizáveis.
- **Dark Mode**: Sempre teste suas alterações no modo escuro (`dark:` classes).

## 🔏 Processo de Pull Request

1. Crie uma branch a partir de `main` com o padrão: `feature/nome-da-feature` ou `fix/bug-corrigido`.
2. Commit suas mudanças com mensagens claras (em inglês ou português, mas mantenha consistência).
3. Abra um PR descrevendo o que foi feito e anexe screenshots se houver mudança visual.
4. Aguarde a revisão de código de um mantenedor.

## 🐛 Reportando Bugs

Abra uma Issue no GitHub com:
- Passos para reproduzir e comportamento esperado.
- Screenshots ou vídeo.
- Ambiente (Navegador, SO).

---
**Happy Coding!** 🦉
