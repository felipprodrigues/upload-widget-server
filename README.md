# Upload Widget Server

## Description
The server handles image uploads using Node.js, PostgreSQL, and Cloudflare R2. It provides routes for uploading, listing, and exporting files in CSV format, leveraging PostgreSQL cursors and Node.js streams for efficient data handling. The system includes validation, error management, testing, and CI workflows to ensure reliability and scalability.

## Overview
This project is a web application that runs using `pnpm` as a package manager and can be containerized using Docker. It includes Fastify for handling HTTP requests and Drizzle ORM for database management.

## Prerequisites
Before running the project, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (Recommended version: LTS)
- [pnpm](https://pnpm.io/) (Package Manager)
- [Docker](https://www.docker.com/) (For containerization)
- [Docker Compose](https://docs.docker.com/compose/) (For easier container management)

### Node.js Version
This project requires Node.js version **20.18.2**. The `.nvmrc` file ensures the correct version is used. If you use `nvm`, you can run the following command to automatically switch to the required version:

```sh
nvm use
```

If you don’t have the correct version installed, run:

```sh
nvm install 20.18.2
```

## Installation
Clone the repository and install dependencies using `pnpm`:

```sh
pnpm install
```

## Running the Server
To start the development server, use:

```sh
pnpm run dev
```

## Running with Docker GUI or Docker Compose
### Using Docker Compose
To run the project inside a Docker container using Docker Compose, follow these steps:

1. Ensure Docker and Docker Compose are installed.
2. Create a `docker-compose.yml` file with the following content:

   ```yaml
   services:
     pg:
       image: bitnami/postgresql:latest
       ports:
         - "5433:5432"
       environment:
         - POSTGRES_USER=docker
         - POSTGRES_PASSWORD=docker
         - POSTGRES_DB=upload_test
       volumes:
         - "./docker:/docker-entrypoint-initdb.d"
   ```

3. Run the container with:

   ```sh
   docker-compose up
   ```

4. Stop the container with:

   ```sh
   docker-compose down
   ```

### Using Docker GUI
If using Docker Desktop, follow these steps:

1. Open Docker Desktop.
2. Click on **Containers** > **Add Container**.
3. Select **Build from Source** and point it to your project directory.
4. Configure the necessary ports (e.g., `3333:3333`).
5. Start the container.

## Environment Variables
The project uses the following environment variables:

```ini
PORT=3333
NODE_ENV=development

# Database
DATABASE_URL="postgresql://docker:docker@localhost:5432/upload"

# CloudFlare R2
CLOUDFLARE_ACCOUNT_ID=""
CLOUDFLARE_ACCESS_KEY_ID=""
CLOUDFLARE_SECRET_ACCESS_KEY=""
CLOUDFLARE_BUCKET=""
CLOUDFLARE_PUBLIC_URL="https://pub-secret"
```

Ensure you create a `.env` file with these variables before running the project.

## Database Management
The project includes Drizzle ORM for database migrations. Use the following commands:

- Generate migration files:
  ```sh
  pnpm run db:generate
  ```
- Apply migrations:
  ```sh
  pnpm run db:migrate
  ```
- Start Drizzle Studio (visual tool):
  ```sh
  pnpm run db:studio
  ```

## Testing
Run tests using Vitest:

```sh
pnpm run test
```

For watch mode:

```sh
pnpm run test:watch
```

## Contributing
Feel free to open issues or submit pull requests.

## License
This project is licensed under [Your License].

