# Wave Care - Backend

API desenvolvida com NestJS, Prisma ORM e MySQL.

## Tecnologias

- NestJS
- Prisma ORM
- MySQL
- JWT
- Passport
- Bcrypt

---

## Pré-requisitos

Antes de começar, tenha instalado:

- Node.js 20+
- npm
- MySQL Server 8+
- Git

---

## 1. Clonar o projeto

git clone https://github.com/Vivi-codep/back-wavecare.git

cd back-wavecare

---

## 2. Instalar as dependências

npm install

---

## 3. Criar o banco de dados

No MySQL execute:

CREATE DATABASE wavecare;

---

## 4. Configurar o arquivo .env

Crie um arquivo chamado:

.env

com o seguinte conteúdo:

DATABASE_URL="mysql://root:SUA_SENHA@localhost:3306/wavecare"

JWT_SECRET=sua_chave_jwt

(Adicione outras variáveis caso existam.)

---

## 5. Gerar o Prisma Client

npx prisma generate

---

## 6. Criar as tabelas

Caso queira utilizar migrations:

npx prisma migrate dev

ou apenas sincronizar o banco:

npx prisma db push

---

## 7. Iniciar o servidor

npm run start:dev

API disponível em:

http://localhost:3001

---

## 8. Criar usuário administrador

Cadastre um usuário normalmente.

Depois execute:

UPDATE User
SET role='admin'
WHERE email='seuemail@email.com';

---

## Scripts

npm run start:dev

npm run build

npm run test

---

## Estrutura

src/
prisma/
uploads/
