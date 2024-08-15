# Sistema

## Setup

- Make sure you have been added to the [UW Blueprint Github Workspace](https://github.com/uwblueprint/).
- Install Docker Desktop ([MacOS](https://docs.docker.com/docker-for-mac/install/) | [Windows](https://docs.docker.com/desktop/install/windows-install/) | [Linux](https://docs.docker.com/engine/install/#server)) and ensure that it is running.

- Clone the [Sistema Github Repository](https://github.com/uwblueprint/sistema) to your local machine and `cd` into the project folder:

```bash
git clone https://github.com/uwblueprint/sistema.git
cd sistema
```

- Create a .env file in the root directory based on the .env.sample file. Update
  the environment variables as needed. Consult the [Secrets](#secrets) section
  for detailed instructions.

```bash
cp .env.sample .env
```

- Build and start the Docker containers

```bash
docker-compose up --build
```

- Install dependencies locally

```bash
npm install
```

## Secrets

- Create A [HashiCorp Clous Cloud Platform Account](https://portal.cloud.hashicorp.com/sign-in?ajs_aid=9085f07d-f411-42b4-855b-72795f4fdbcc&product_intent=vault)
- Install [HashiCorp Vault](https://developer.hashicorp.com/hcp/tutorials/get-started-hcp-vault-secrets/hcp-vault-secrets-install-cli#install-hcp-vault-secrets-cli) in order to pull secrets
- Log in to Vault

```bash
vlt login
```

- Configure the Vault Command Line Interface

```bash
vlt config init
```

- Select the `sistema` Organization and Project

```bash
✔ Organization with name sistema ID 12cd56-88d2-69fb-8cc1-s3sAm3st selected
✔ Project with name sistema ID 12cd56-704c-46af-8ba5-mAtr3x selected
Use the arrow keys to navigate: ↓ ↑ → ←
? Select an application name:
  ▸ sistema
```

- Copy secrets to a `.env` file

```bash
./setup_secrets.sh
```

## Version Control Guide

### Branching

- Branch off of `main` for all feature work and bug fixes, creating a "feature branch". Prefix the feature branch name with your name. The branch name should be in kebab case and it should be short and descriptive. E.g. `chinemerem/readme-update`

- To integrate changes on `main` into your feature branch, **use rebase instead of merge**

```bash
# currently working on feature branch, there are new commits on main
git pull origin main --rebase

# if there are conflicts, resolve them and then:
git add .
git rebase --continue

# force push to remote feature branch
git push -f
```

### Docker Commands

If you’re new to Docker, you can learn more about `docker-compose` commands at
this [docker compose overview](https://docs.docker.com/compose/reference/).

```bash
# build Builds images
docker-compose
```

```bash
# builds images (if they don’t exist) & starts containers
docker-compose up
```

```bash
# builds images & starts containers
docker-compose up --build
```

```bash
# stops the containers
docker-compose down
```

```bash
# get Names & Statuses of Running Containers
docker ps
```

```bash
# Remove all stopped containers, unused networks, dangling images, and build cache
docker system prune -a --volumes
```

### Accessing PostgreSQL Database

```bash
# run a bash shell in the container
docker exec -it sistema-db-1 /bin/bash

# in container now
psql -U sistema -d sistema

# in postgres shell, some common commands:
# display all table names
\dt
# quit
\q
# you can run any SQL query, don't forget the semicolon!
SELECT * FROM <table-name>;
```

### Seeding the Database

Full Command:
```bash
npx prisma generate; npx prisma db push; npx @snaplet/seed sync; npx prisma db seed
```

Local: Ensure the database is running locally
Repull Secrets

Run the following commands:

```bash
npx prisma generate
npx prisma db push
```

```bash
# In the root directory to sync seed.ts to the current data models of the database
npx @snaplet/seed sync

# Seeding the database according to seed.ts
npx prisma db seed

# Check if the tables are seeded correctly
SELECT * FROM public."<Table-name>";

```

## Formatting and Linting

### Prettier

We use Prettier for code formatting. To check for formatting issues:

```bash
npm run prettier:check
```

To automatically fix formatting issues:

```bash
npm run prettier:fix
```

### ESLint

We use ESLint for code linting. To check for linting issues:

```bash
npm run lint
```

To automatically fix linting issues:

```bash
npm run lint:fix
```

### Combined Formatting and Linting

To run both Prettier and ESLint to format and fix linting issues in one command:

```bash
npm run format
```

### Commits

- Commits should be atomic (guideline: the commit is self-contained; a reviewer could make sense of it even if they viewed the commit diff in isolation)

- Trivial commits (e.g. fixing a typo in the previous commit, formatting changes) should be squashed or fixup'd into the last non-trivial commit

```bash
# last commit contained a typo, fixed now
git add .
git commit -m "Fix typo"

# fixup into previous commit through interactive rebase
# x in HEAD~x refers to the last x commits you want to view
git rebase -i HEAD~2
# text editor opens, follow instructions in there to fixup

# force push to remote feature branch
git push -f
```

- Commit messages and PR names are descriptive and written in **imperative tense**. The first word should be capitalized. E.g. "Create user REST endpoints", not "Created user REST endpoints"
- PRs can contain multiple commits, they do not need to be squashed together before merging as long as each commit is atomic. Our repo is configured to only allow squash commits to `main` so the entire PR will appear as 1 commit on `main`, but the individual commits are preserved when viewing the PR.
