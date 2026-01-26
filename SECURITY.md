# Guia de Segurança - Thoth Platform

## ✅ Proteção de Dados Sensíveis Implementada

### 1. Variáveis de Ambiente

Todas as credenciais sensíveis foram migradas para variáveis de ambiente:

**Arquivo:** `.env.local` (NÃO commitado no Git)

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=***
VITE_FIREBASE_AUTH_DOMAIN=***
VITE_FIREBASE_PROJECT_ID=***
VITE_FIREBASE_STORAGE_BUCKET=***
VITE_FIREBASE_MESSAGING_SENDER_ID=***
VITE_FIREBASE_APP_ID=***
VITE_FIREBASE_MEASUREMENT_ID=***
VITE_FIREBASE_VAPID_KEY=***
```

### 2. Arquivos Protegidos

✅ `.env.local` - Ignorado pelo Git (via `.gitignore`)
✅ `.env.example` - Template público (sem credenciais reais)
✅ `firebase/index.ts` - Usa `import.meta.env` ao invés de hardcoded
✅ `vite-env.d.ts` - Tipos TypeScript para variáveis de ambiente

### 3. Service Worker

**Arquivo:** `public/firebase-messaging-sw.js`

⚠️ **IMPORTANTE:** Service Workers não podem acessar `import.meta.env` porque são executados fora do contexto do Vite.

**Solução Atual:** Credenciais hardcoded no Service Worker (seguro porque são públicas do lado do cliente)

**Nota de Segurança:** 
- As credenciais do Firebase no frontend são **públicas por design**
- A segurança real vem das **Firestore Security Rules** e **Firebase Auth**
- Nunca coloque chaves de API de backend (Admin SDK) no frontend

### 4. Firestore Security Rules

Certifique-se de que suas regras de segurança estão configuradas corretamente:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Exemplo: Apenas usuários autenticados podem ler/escrever seus próprios dados
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Notificações: apenas o dono pode ler/escrever
    match /notifications/{notifId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
    
    // Conexões: usuários envolvidos podem ler/escrever
    match /connections/{connId} {
      allow read, write: if request.auth != null && 
        request.auth.uid in resource.data.users;
    }
  }
}
```

### 5. Boas Práticas Implementadas

✅ **Separação de Ambientes**
- `.env.local` - Desenvolvimento local
- `.env.production` - Produção (se necessário)
- `.env.example` - Template para novos desenvolvedores

✅ **TypeScript Type Safety**
- `vite-env.d.ts` garante que todas as variáveis estão tipadas
- Erros em tempo de compilação se variável não existir

✅ **Git Ignore**
- `.env.local` nunca será commitado
- Credenciais sensíveis protegidas

### 6. Configuração para Novos Desenvolvedores

1. Clone o repositório
2. Copie `.env.example` para `.env.local`
3. Preencha com suas credenciais do Firebase Console
4. Execute `npm run dev`

```bash
cp .env.example .env.local
# Edite .env.local com suas credenciais
npm run dev
```

### 7. Checklist de Segurança

- [x] Credenciais movidas para `.env.local`
- [x] `.env.local` no `.gitignore`
- [x] `.env.example` criado
- [x] TypeScript types criados
- [x] Service Worker atualizado
- [x] Documentação de segurança criada
- [ ] Firestore Security Rules revisadas
- [ ] Firebase Auth configurado
- [ ] VAPID key gerada no Firebase Console

### 8. Próximos Passos de Segurança

1. **Gerar VAPID Key:**
   - Firebase Console → Project Settings → Cloud Messaging
   - Web Push certificates → Generate key pair
   - Adicionar em `.env.local`

2. **Revisar Firestore Rules:**
   - Garantir que apenas usuários autenticados acessem dados
   - Validar permissões de leitura/escrita

3. **Configurar Firebase App Check (Opcional):**
   - Proteção contra bots e abuso
   - reCAPTCHA v3 para web

4. **Monitoramento:**
   - Firebase Console → Usage and billing
   - Alertas de uso anormal

### 9. O que NÃO fazer

❌ Nunca commite `.env.local`
❌ Nunca coloque chaves de Admin SDK no frontend
❌ Nunca desabilite Firestore Security Rules
❌ Nunca exponha tokens de usuário em logs
❌ Nunca use `allowPublicAccess` em produção

### 10. Recursos Adicionais

- [Firebase Security Rules](https://firebase.google.com/docs/rules)
- [Firebase App Check](https://firebase.google.com/docs/app-check)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)

---

## 🔒 Resumo

A aplicação agora segue as melhores práticas de segurança:
- ✅ Credenciais em variáveis de ambiente
- ✅ Proteção via `.gitignore`
- ✅ Type safety com TypeScript
- ✅ Documentação clara para novos desenvolvedores
- ✅ Service Worker configurado corretamente

**Lembre-se:** A verdadeira segurança vem das **Firestore Security Rules** e **Firebase Authentication**, não da ocultação de credenciais públicas do frontend.
