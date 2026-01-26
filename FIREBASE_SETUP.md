# Configuração do Firebase Cloud Messaging (FCM)

## Passo 1: Configurar no Firebase Console

1. Acesse o [Firebase Console](https://console.firebase.google.com/)
2. Selecione seu projeto
3. Vá em **Project Settings** (ícone de engrenagem)
4. Clique na aba **Cloud Messaging**
5. Em **Web Push certificates**, clique em **Generate key pair**
6. Copie a chave VAPID gerada

## Passo 2: Adicionar VAPID Key no .env.local

Crie ou edite o arquivo `.env.local` na raiz do projeto:

```env
VITE_FIREBASE_VAPID_KEY=sua_chave_vapid_aqui
```

## Passo 3: Atualizar firebase-messaging-sw.js

Edite o arquivo `public/firebase-messaging-sw.js` e substitua as credenciais do Firebase pelas suas:

```javascript
firebase.initializeApp({
  apiKey: "SUA_API_KEY",
  authDomain: "SEU_PROJECT.firebaseapp.com",
  projectId: "SEU_PROJECT_ID",
  storageBucket: "SEU_PROJECT.appspot.com",
  messagingSenderId: "SEU_SENDER_ID",
  appId: "SEU_APP_ID"
});
```

## Passo 4: Testar Localmente

```bash
npm run dev
```

Faça login e permita notificações quando solicitado.

## Passo 5: Deploy (Opcional - Cloud Functions)

Para enviar push notifications automaticamente, você precisará criar uma Cloud Function.

Consulte o arquivo `implementation_plan.md` para detalhes completos.

## Arquivos Criados/Modificados

✅ `modules/notification/push.service.ts` - Serviço de Push
✅ `public/firebase-messaging-sw.js` - Service Worker
✅ `modules/notification/notification.service.ts` - Método markActionDone
✅ `components/ConnectionCard.tsx` - Botões aceitar/negar
✅ `pages/Notificacoes/Notificacoes.tsx` - Atualizado
✅ `App.tsx` - Integração do serviço

## Funcionalidades Implementadas

1. ✅ Push Notifications para dispositivos móveis
2. ✅ Aceitar/Negar pedido no ConnectionCard
3. ✅ Sistema "já visto" (actionDone)
4. ✅ Toast notifications em foreground
5. ✅ Marcação automática de notificações relacionadas
