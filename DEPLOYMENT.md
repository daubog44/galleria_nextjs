# Deployment Guide

This guide describes how to deploy the application to an Oracle Cloud VM (or any Ubuntu server) using **Ansible** and **GitHub Actions**.

## Prerequisites

1.  **Oracle Cloud Account** (or other VPS provider).
2.  **Domain Name** pointing to your server's IP.
3.  **Docker Hub Account**.

## 1. Server Setup (Manual)

You need to manually- **Server**: A Virtual Machine (VM) on Oracle Cloud (or any other provider).
    - **OS**: Oracle Linux 9 (or compatible RHEL 9 based distro).
    - **Specs**: Minimum 1GB RAM (2GB recommended).
    - **Ports**: 80 (HTTP), 443 (HTTPS), 22 (SSH) open.
    -   **SSH Keys**: Generate a key pair and upload the **Public Key** to the instance. Save the **Private Key** securely.

2.  **Network Configuration**:
    -   Ensure the Security List / Firewall allows Ingress traffic on:
        -   **22** (SSH)
        -   **80** (HTTP)
        -   **443** (HTTPS)

3.  **Get Public IP**: Note down the Public IP address of your instance.

## 2. GitHub Secrets

Go to your GitHub Repository -> Settings -> Secrets and variables -> Actions -> New repository secret.

Add the following secrets:

### Server Access
-   `HOST_IP`: The Public IP address of your server.
-   `SSH_KEY`: The **Private SSH Key** content (open your `.key` or `.pem` file and copy the entire content).
    -   *Note*: Ensure the key corresponds to the Public Key on the server.

### Docker Hub
-   `DOCKER_USERNAME`: Your Docker Hub username.
-   `DOCKER_PASSWORD`: Your Docker Hub access token (or password).

### Application Environment (`ENV_FILE_CONTENT`)
Create a secret named `ENV_FILE_CONTENT` and paste the content of your production `.env` file.
**Crucial Variables**:
-   `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`
-   `NEXT_PUBLIC_SITE_URL` (e.g., `https://tuo-sito.com`)
-   `NEXT_PUBLIC_API_URL` (e.g., `https://tuo-sito.com/api`)
-   `DOMAIN_NAME` (e.g., `tuo-sito.com`) - **Required for Traefik**
-   `ACME_EMAIL` (your email for Let's Encrypt) - **Required for Traefik**
-   `UMAMI_HOST` (e.g., `tuo-sito.com`) - **Required for Umami**
-   `NEXT_PUBLIC_UMAMI_WEBSITE_ID` (UUID from Umami)

## 3. Deployment Flow

The deployment is automated via GitHub Actions:

1.  **Push to `main`**: Triggers the workflow.
2.  **Build**: Docker image is built and pushed to Docker Hub.
3.  **Ansible**:
    -   Connects to the server using `HOST_IP` and `SSH_KEY`.
    -   Installs Docker and dependencies (if missing).
    -   Configures Firewall.
    -   Clones/Updates the repository.
    -   Creates the `.env` file.
    -   Runs `./start.sh` to pull the new image and restart containers.

## 4. First Run

On the first deployment, Ansible will provision the server.
After deployment, wait a few minutes for Traefik to obtain SSL certificates.

Access your site at `https://tuo-sito.com`.
