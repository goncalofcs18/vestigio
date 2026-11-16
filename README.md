# Vestígio

App mobile para explorar o património de Aveiro. Cada lugar visitado (com check-in no local) pinta um azulejo do teu painel; completar coleções desbloqueia conquistas.

- **App:** React Native com Expo (iOS, Android e web), Expo Router, Apollo Client
- **API:** Node.js, GraphQL (GraphQL Yoga), PostgreSQL
- **Infra:** Docker Compose, GitHub Actions (CI + EAS Update), Render, Netlify, EAS Build

Os dados vêm da Wikidata (coordenadas e imagens do Wikimedia Commons), com curadoria própria das coleções e descrições.

## Estrutura

```
api/      API GraphQL (src/schema.ts, src/setup.ts, dados em src/data/seed.json)
app/      App Expo (ecrãs em app/, componentes e lógica em src/)
.github/  Pipeline de CI/CD
```

## Correr em local

**1. API e base de dados**

```bash
docker compose up --build
```

A API fica em http://localhost:4000/graphql (com o GraphiQL para testar queries).
Para testar check-ins fora de Aveiro: `CHECKIN_RADIUS_M=100000 docker compose up --build`.

Sem Docker: cria uma base de dados PostgreSQL, copia `api/.env.example` para `api/.env` e corre
`cd api && npm install && npm run db:setup && npm run dev`.

**2. App**

```bash
cd app
npm install
cp .env.example .env   # ajusta EXPO_PUBLIC_API_URL
npx expo start
```

No telemóvel (Expo Go), `localhost` não funciona: usa o IP do computador na rede, por exemplo
`EXPO_PUBLIC_API_URL=http://192.168.1.20:4000/graphql`.

## Qualidade

```bash
cd api && npm run typecheck && npm test
cd app && npm run typecheck && npm run lint
```

## Deploy

| Parte | Onde | Como |
|---|---|---|
| Base de dados | Neon (PostgreSQL) | Criar projeto e copiar a connection string |
| API | Render | Blueprint `render.yaml`; definir `DATABASE_URL` |
| Web | Netlify | Base directory `app`; definir `EXPO_PUBLIC_API_URL` |
| Android (APK) | EAS Build | `npx eas-cli@latest build -p android --profile preview` |
| Atualizações | EAS Update | Automático no push para `main` (secret `EXPO_TOKEN`) |

O mapa nativo usa o react-native-maps: funciona no Expo Go sem configuração, mas para o APK em Android
é preciso uma chave da Google Maps API (ver a documentação do react-native-maps na Expo).
Na web, a app mostra a lista de lugares em vez do mapa.

### Kubernetes

A pasta `k8s/` tem os manifests para correr a API e o PostgreSQL num cluster (pensados para `kind` ou `minikube`):

```bash
docker build -t vestigio-api:latest api
kind load docker-image vestigio-api:latest      # ou minikube image load
cp k8s/secret.example.yaml k8s/secret.yaml      # e muda a palavra-passe
kubectl apply -f k8s/namespace.yaml -f k8s/secret.yaml -f k8s/postgres.yaml -f k8s/api.yaml -f k8s/ingress.yaml
kubectl -n vestigio port-forward svc/vestigio-api 4000:80
```

A API cria as tabelas e carrega o seed no arranque (`src/setup.ts`), por isso não precisa de passos extra.

## Decisões técnicas

- **GraphQL em vez de REST.** Cada ecrã pede exatamente os campos de que precisa (por exemplo, `places` com `visited` numa só chamada), e o Apollo Client trata da cache.
- **Check-in validado no servidor.** A distância (Haversine, `api/src/geo.ts`) é calculada na API e o raio é configurável (`CHECKIN_RADIUS_M`), para a app não poder ser enganada por um cliente alterado.
- **Conquistas sem estado.** `computeAchievements` deriva tudo dos check-ins; não há tabela de conquistas para manter sincronizada, e o resultado é testável como função pura.
- **Sem contas.** Cada dispositivo gera um identificador (`x-device-id`), o que mantém a app sem fricção; o preço é não haver sincronização entre dispositivos.
- **Expo + Expo Router.** Um só código para iOS, Android e web, com navegação por ficheiros. O mapa nativo tem um equivalente web (`PlacesMap.web.tsx`) com a lista de lugares.
- **Testes.** Funções puras (geografia, conquistas) e testes de integração do check-in contra um PostgreSQL real, que correm no CI com um serviço PostgreSQL.

## Licença

Código sob licença MIT (ver `LICENSE`).

## Licenças dos dados

Imagens do Wikimedia Commons, cada uma com a respetiva licença e autoria na página de origem.
