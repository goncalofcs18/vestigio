# Deploy rápido (Neon + Render + Netlify)

Ordem: base de dados → API → web. Todos têm plano gratuito.

## 1. Base de dados (Neon)

1. Em neon.tech, cria um projeto (região UE) e copia a *connection string* (`postgres://…?sslmode=require`).

## 2. API (Render)

1. Em render.com: **New → Blueprint** e escolhe o repositório. Lê o `render.yaml`.
2. Quando pedir, cola o `DATABASE_URL` do Neon.
3. Espera pelo deploy. O arranque cria as tabelas e carrega o seed sozinho.
4. Testa: abre `https://<nome>.onrender.com/graphql` (GraphiQL). Anota o URL.

O plano gratuito adormece após inatividade: o primeiro pedido pode demorar ~1 min.

## 3. Web (Netlify)

1. Em netlify.com: **Add new site → Import from Git** e escolhe o repositório. Em **Base directory** escreve `app`; o `app/netlify.toml` define o resto do build.
2. Em **Site settings → Environment variables**, cria `EXPO_PUBLIC_API_URL` = `https://<nome>.onrender.com/graphql`.
3. Faz **Deploys → Trigger deploy** (a variável só entra em novos builds).

## 4. Fechar o ciclo

- No GitHub, em **Settings → Secrets and variables → Actions**, cria a variável `EXPO_PUBLIC_API_URL` (mesmo valor) e o secret `EXPO_TOKEN` (expo.dev → Access tokens) para o job de EAS Update.
- Põe os dois links (API e web) no README.

## 5. APK Android

```bash
cd app
npx eas-cli@latest login
EXPO_PUBLIC_API_URL=https://<nome>.onrender.com/graphql npx eas-cli@latest build -p android --profile preview
```

Para o mapa funcionar no APK é preciso uma chave da Google Maps API nas definições do `react-native-maps`.
