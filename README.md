# 🎯 Plataforma 360 - Avaliação de Liderados

Plataforma full-stack de avaliação de desempenho hierárquica desenvolvida para o desafio técnico da Jungle Gaming.

## 🏗️ Arquitetura e Decisões Técnicas

O projeto foi orquestrado em **Docker** para garantir que todo o ecossistema rode com um único comando, sem poluir a máquina local. A infraestrutura conta com 3 serviços principais na mesma rede:

1. **Banco de Dados (PostgreSQL 15):** Relacional, robusto, com dump inicial automático.
2. **Backend (Laravel 11 / PHP 8.4):** API RESTful isolada. A busca hierárquica de subordinados (diretos e indiretos) foi construída utilizando uma **CTE Recursiva Pura no SQL**, garantindo máxima performance e escalabilidade e evitando o clássico problema de N+1 do Eloquent ORM em árvores profundas.
3. **Frontend (Vite / React / TypeScript):**
   - **Shadcn UI + Tailwind v4:** Componentes acessíveis e interface moderna utilizando o novo ecossistema Base UI.
   - **TanStack Query:** Gerenciamento inteligente de cache, revalidação e requisições HTTP para o histórico e dashboard.
   - **Zustand:** Gerenciamento de estado global leve (utilizado para o "Fake Login" e injeção automática de Headers).
   - **Clean Code e React Patterns:** Código altamente componentizado e livre de `any` ou `useEffect` mal-aplicados, respeitando as exigências estritas do React 19.

## 🚀 Como Executar o Projeto Passo a Passo

**Pré-requisitos:** Ter o [Docker](https://www.docker.com/) instalado na máquina.

### 1. Clone o repositório
```bash
git clone https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
cd projeto-monks
```

### 2. Suba a Infraestrutura
O comando abaixo irá baixar as imagens (Node 20, PHP 8.4 e Postgres), isolar os binários, instalar as dependências do NPM automaticamente e expor as portas:
```bash
docker compose up -d --build
```

### 3. Prepare o Backend (Rodar as Migrations e Chaves)
O banco de dados já subiu populado com os dados do Dump fornecido. Agora precisamos apenas gerar a chave de criptografia do Laravel e criar as tabelas auxiliares de sessão:
```bash
# Copie o arquivo de ambiente
cp backend/.env.example backend/.env

# Gere a chave de segurança do Laravel
docker compose exec backend php artisan key:generate

# Rode as migrations base do Laravel
docker compose exec backend php artisan migrate
```
*(As credenciais do banco já estão configuradas por padrão no arquivo `docker-compose.yml` e `backend/.env.example` para facilitar a revisão técnica).*

### 4. Acesse a Aplicação
Tudo pronto! O Vite e o Laravel já estão servindo o projeto. Acesse no seu navegador:
- **Frontend (Plataforma):** [http://localhost:5173](http://localhost:5173)

## 📡 Documentação dos Endpoints da API

A comunicação principal entre o Front e o Back exige o header de autenticação fake: `X-User-Id: {id_do_lider}`.

*   `GET /api/employees` 
    * Lista todos os funcionários (usado para popular a escolha do Líder no Front-end).
*   `GET /api/subordinates` 
    * Retorna a árvore hierárquica inteira do líder logado (usando a CTE Recursiva). 
*   `POST /api/evaluations` 
    * Registra uma nova avaliação respeitando o limite e a regra de negócio de 7 dias de cooldown. 
    * O Payload recebe as notas puras (1 a 4) das 6 questões.
    * O cálculo final baseando-se nos pesos é executado e blindado **no backend**.
*   `GET /api/evaluations/{evaluated_id}/history`
    * Retorna todo o histórico de avaliações de um colaborador, revelando as respostas antigas fornecidas pelos avaliadores, suas respectivas datas e a nota final calculada.
