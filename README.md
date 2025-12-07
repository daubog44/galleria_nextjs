# Galleria d'Arte Portfolio

Sito web portfolio moderno e performante per un artista indipendente, sviluppato con Next.js 16, React 19 e Tailwind CSS v4.

## 🚀 Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Database:** PostgreSQL with Drizzle ORM
- **Deployment:** Docker, Traefik, Oracle Cloud

## 🛠️ Local Development

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd appsite
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Setup Environment Variables:**
    Copy `.env.example` to `.env` and fill in the required values.
    ```bash
    cp .env.example .env
    ```

4.  **Run:**
    ```bash
    ./start_local.sh
    ```

This will start the application, database, and Umami analytics.

## 📦 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions on deploying to Oracle Cloud.
