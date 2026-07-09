# YU

YU é uma aplicação mobile de bem-estar que combina objetivos do usuário, localização, clima, tempo de tela e progresso diário para gerar sugestões personalizadas. A experiência é acompanhada por um mascote que reage ao estado atual do usuário e torna as recomendações mais leves e convidativas.

## Funcionalidades

- Cadastro e consulta de objetivos de bem-estar.
- Coleta de localização do usuário, com permissão via Expo Location.
- Registro de dados de clima e consulta do último clima salvo.
- Simulação/consulta de tempo de tela para compor o contexto do usuário.
- Motor de sugestões baseado em contexto.
- Registro de sugestões concluídas no dia.
- Indicadores de progresso diário e histórico semanal.
- Mascote com estados, reações e balão de fala com sugestões.
- Cache local no app para apoiar cenários offline.

## Tecnologias

**Backend**

- Node.js
- Express
- TypeScript
- Prisma
- PostgreSQL
- Firebase Admin
- Jest

**Frontend**

- Expo
- React Native
- TypeScript
- Firebase Auth
- React Navigation
- AsyncStorage
- Expo Location

## Estrutura

```txt
YU/
├── backend/          # API, Prisma, controllers, serviços e testes
├── front-end/        # App Expo/React Native
├── .env.example      # Exemplo de variáveis de ambiente
└── README.md
```

## Pré-requisitos

- Node.js compatível com o projeto.
- npm.
- PostgreSQL rodando localmente ou em ambiente remoto.
- Projeto Firebase configurado.
- Expo Go ou emulador Android/iOS para testar o app.

## Configuração Inicial

Clone o projeto e instale as dependências separadamente:

```bash
cd backend
npm install
```

```bash
cd ../front-end
npm install
```

Crie um arquivo `.env` na raiz do projeto com base no `.env.example`:

```bash
cp .env.example .env
```

Preencha as variáveis necessárias:

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/nome_do_banco"

FIREBASE_PROJECT_ID=""
FIREBASE_CLIENT_EMAIL=""
FIREBASE_PRIVATE_KEY=""

EXPO_PUBLIC_API_URL="http://seu-ip:3000"
EXPO_PUBLIC_OPENWEATHER_API_KEY=""
EXPO_PUBLIC_FIREBASE_API_KEY=""
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=""
EXPO_PUBLIC_FIREBASE_PROJECT_ID=""
```

No celular físico, `EXPO_PUBLIC_API_URL` deve apontar para o IP da máquina na rede, não para `localhost`. Exemplo:

```env
EXPO_PUBLIC_API_URL="http://192.168.0.10:3000"
```

## Backend

Entre na pasta do backend:

```bash
cd backend
```

Gere o Prisma Client:

```bash
npm run prisma:generate
```

Aplique as migrations:

```bash
npm run prisma:migrate
```

Cadastre os objetivos iniciais:

```bash
npm run prisma:seed
```

Inicie a API:

```bash
npm run dev
```

A API ficará disponível em:

```txt
http://localhost:3000
```

Para verificar se o servidor está online:

```bash
curl http://localhost:3000
```

## Frontend

Entre na pasta do app:

```bash
cd front-end
```

Inicie o Expo:

```bash
npm start
```

Também é possível abrir diretamente em uma plataforma:

```bash
npm run android
npm run ios
npm run web
```

## Autenticação

As rotas principais do backend exigem token Firebase no header:

```txt
Authorization: Bearer <token>
```

Para gerar um token anônimo para testes manuais:

```bash
cd backend
npm run token
```

## Endpoints Principais

| Método | Rota | Descrição |
| --- | --- | --- |
| `GET` | `/` | Health check da API |
| `GET` | `/users/goals` | Lista objetivos do usuário |
| `POST` | `/users/goals` | Salva objetivos escolhidos |
| `GET` | `/users/screen-time` | Retorna dados mockados de tempo de tela |
| `POST` | `/users/location` | Salva localização do usuário |
| `GET` | `/users/location` | Retorna a última localização salva |
| `POST` | `/users/weather` | Salva dados de clima |
| `GET` | `/users/weather` | Retorna o último clima salvo |
| `POST` | `/users/suggestions` | Gera sugestões com base no contexto |
| `POST` | `/users/suggestions/:suggestionId/complete` | Registra conclusão de uma sugestão |
| `GET` | `/users/progress` | Retorna indicadores de progresso |

## Banco de Dados

Os principais modelos Prisma são:

- `WellnessGoal`: objetivos disponíveis no app.
- `UserGoal`: objetivos selecionados pelo usuário.
- `UserLocation`: histórico de localização.
- `WeatherData`: dados de clima salvos.
- `SuggestionProgress`: sugestões concluídas por usuário e data.

Para resetar o banco em ambiente local:

```bash
cd backend
npx prisma migrate reset
```

Use esse comando com cuidado, pois ele apaga os dados locais e reaplica as migrations.

## Testes

Backend:

```bash
cd backend
npm test
```

Frontend:

```bash
cd front-end
npm test
npm run test:reaction
```

Checagem TypeScript:

```bash
cd backend
npm run build
```

```bash
cd front-end
npx tsc --noEmit
```

## Fluxo de Desenvolvimento

1. Crie uma branch a partir da `dev`.
2. Faça alterações pequenas e relacionadas à issue.
3. Rode os testes e a checagem TypeScript antes do PR.
4. Atualize migrations, seeds e documentação quando alterar contrato de dados.
5. Abra o PR para `dev` descrevendo o que foi implementado e como foi testado.

Exemplo:

```bash
git checkout dev
git pull
git checkout -b kayke#numero-da-issue
```

## Solução de Problemas

**O app não consegue chamar o backend no celular**

Verifique se `EXPO_PUBLIC_API_URL` usa o IP da máquina na rede. `localhost` no celular aponta para o próprio celular, não para o computador.

**Erro de módulo no CI por maiúsculas/minúsculas**

O CI roda em Linux, onde `MascotReactionTypes` e `mascotReactionTypes` são caminhos diferentes. Use sempre o mesmo nome real do arquivo nos imports.

**Expo falha com `TypeError: fetch failed` ao iniciar**

Geralmente é falha temporária de rede ao buscar metadados do Expo. Verifique conexão, DNS, proxy/VPN e tente iniciar novamente.

**Tabela não existe no PostgreSQL**

Rode as migrations no backend:

```bash
cd backend
npm run prisma:migrate
```

## Licença

Projeto desenvolvido para fins acadêmicos.
