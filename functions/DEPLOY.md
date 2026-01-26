# Guia de Deploy - Firebase Cloud Functions

## Pré-requisitos

1. **Firebase CLI instalado:**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login no Firebase:**
   ```bash
   firebase login
   ```

3. **Blaze Plan habilitado:**
   - Acesse [Firebase Console](https://console.firebase.google.com/)
   - Selecione seu projeto **thothv0001-4**
   - Vá em **Upgrade** → **Blaze Plan**
   - Configure limite de gastos (recomendado: $10/mês)

## Passo 1: Instalar Dependências

```bash
cd functions
npm install
```

## Passo 2: Build

```bash
npm run build
```

## Passo 3: Deploy

```bash
firebase deploy --only functions
```

Ou deploy de função específica:
```bash
firebase deploy --only functions:sendConnectionNotification
```

## Passo 4: Testar

### Teste Automático (via HTTP):

```bash
# Substitua USER_ID pelo UID de um usuário real
curl "https://us-central1-thothv0001-4.cloudfunctions.net/testPushNotification?userId=USER_ID"
```

### Teste Real:

1. Faça login em duas contas diferentes
2. Envie pedido de conexão de uma para outra
3. **Feche o app** na conta que recebeu
4. Verifique se a notificação push chegou

## Logs e Debug

Ver logs em tempo real:
```bash
firebase functions:log
```

Ver logs no console:
- Firebase Console → Functions → Logs

## Custos Estimados

- **Primeiros 2 milhões de invocações:** GRÁTIS
- **Após:** $0.40 por milhão
- **Estimativa para app pequeno:** $0-2/mês

## Troubleshooting

### Erro: "Billing account not configured"
- Habilite Blaze Plan no Firebase Console

### Erro: "Permission denied"
- Execute `firebase login` novamente

### Notificações não chegam:
1. Verifique logs: `firebase functions:log`
2. Verifique se usuário tem tokens FCM salvos
3. Teste com função HTTP de teste

### Tokens inválidos:
- A função remove automaticamente tokens inválidos

## Estrutura de Arquivos

```
functions/
├── src/
│   └── index.ts          # Cloud Functions
├── package.json          # Dependências
├── tsconfig.json         # Config TypeScript
└── .gitignore           # Ignora node_modules
```

## Comandos Úteis

```bash
# Instalar dependências
cd functions && npm install

# Build
npm run build

# Deploy todas as functions
firebase deploy --only functions

# Deploy função específica
firebase deploy --only functions:sendConnectionNotification

# Ver logs
firebase functions:log

# Testar localmente (emulador)
firebase emulators:start --only functions

# Deletar função
firebase functions:delete sendConnectionNotification
```

## Próximos Passos

Após deploy bem-sucedido:

1. ✅ Teste enviando pedido de conexão
2. ✅ Feche o app
3. ✅ Verifique se notificação chegou
4. ✅ Monitore logs para erros

## Suporte

Se tiver problemas:
1. Verifique logs: `firebase functions:log`
2. Verifique Firebase Console → Functions
3. Teste com função HTTP de teste
