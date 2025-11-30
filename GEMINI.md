# Progetto: Sito Web Portfolio Artista (Next.js Refactor)

## Obiettivo Generale
Sito web portfolio moderno e performante per un artista indipendente, sviluppato con Next.js 16, React 19 e Tailwind CSS v4. Il sito presenta le opere dell'artista, la sua biografia, recensioni e contatti, con un focus su design minimale, accessibilità e velocità.

## Stack Tecnologico
- **Framework:** Next.js 16.0.3 (App Router)
- **Linguaggio:** TypeScript
- **Styling:** Tailwind CSS v4
- **Database:** PostgreSQL
- **ORM:** Drizzle ORM
- **Font:** Google Fonts (Montserrat, Cormorant Garamond) via `next/font`
- **Deployment:** Vercel (Ready) / Locale

## Struttura del Progetto

### Core (`src/app`)
- **`page.tsx`**: Homepage (Galleria). Recupera e mostra le opere dal database.
- **`layout.tsx`**: Root layout che include `Navbar`, `Footer` e la gestione dei font.
- **`globals.css`**: Configurazione Tailwind v4 e variabili CSS per il tema (Light/Dark mode).
- **`opera/[id]/page.tsx`**: Pagina di dettaglio statica per un'opera (visualizzata se si accede direttamente al link o si ricarica la pagina).
- **`@modal/(.)opera/[id]/page.tsx`**: Route intercettata. Mostra il dettaglio dell'opera in una modale sovrapposta alla galleria mantenendo il contesto.
- **`biografia/page.tsx`**: Pagina dedicata alla biografia dell'artista.
- **`stile/page.tsx`**: Pagina "Dicono di me", raccoglie recensioni e articoli con un layout masonry.
- **`contatti/page.tsx`**: Pagina con informazioni di contatto e form (placeholder).

### Componenti Principali (`src/components`)
- **`Navbar.tsx`**: Barra di navigazione responsive con menu hamburger e toggle per la Dark Mode.
- **`Footer.tsx`**: Footer con link ai social network e informazioni di contatto.
- **`Modal.tsx`**: Componente wrapper per la modale. Gestisce l'overlay, il blocco dello scroll del body e la navigazione `router.back()` alla chiusura.
- **`PaintingCard.tsx`**: Componente per la visualizzazione dell'anteprima di un'opera nella griglia.
- **`PaintingDetail.tsx`**: Componente riutilizzabile per mostrare i dettagli dell'opera. Accetta una prop `isModal` per adattare il layout (es. immagine a sinistra e testo a destra nella modale).
- **`BackToTop.tsx`**: Pulsante flottante per tornare rapidamente a inizio pagina.

### Database (`src/db`)
- **`schema.ts`**: Definizione dello schema del database usando Drizzle ORM. Tabelle principali: `paintings`, `biography`, `reviews`.
- **`index.ts`**: Configurazione della connessione al database PostgreSQL.
- **`seed.ts`**: Script per popolare il database con dati iniziali di test (opere, biografia, recensioni).

## Funzionalità Implementate

### 1. Galleria (Homepage)
- Griglia responsive che si adatta a diverse dimensioni di schermo.
- **Interazione Modale**: Cliccando su un'opera, l'URL viene aggiornato (`/opera/ID`) ma la pagina non viene ricaricata completamente; il dettaglio si apre in una modale.

### 2. Dettaglio Opera
- Immagine ottimizzata con `next/image`.
- Visualizzazione condizionale dei metadati: Titolo, Descrizione, Prezzo, Stato (Venduto).
- Pulsante "Acquista" o etichetta "Venduto".

### 3. UI/UX Avanzata
- **Dark Mode**: Supporto completo per tema chiaro e scuro, con persistenza della preferenza utente.
- **Layout Masonry**: La pagina "Dicono di me" utilizza un layout a colonne per gestire testi di lunghezza variabile in modo armonioso.
- **Animazioni**: Transizioni fluide per hover, apertura modale e cambio tema.

## Istruzioni per lo Sviluppo

### Installazione Dipendenze
```bash
npm install
```

### Configurazione Database
Creare un file `.env` nella root del progetto con la stringa di connessione al database:
```env
DATABASE_URL=postgres://user:password@host:port/dbname
```

### Gestione Database (Drizzle)
```bash
# Generazione dei file di migrazione basati sullo schema
npx drizzle-kit generate

# Applicazione delle migrazioni al database
npx drizzle-kit migrate

# Popolamento del database con dati di test
npx tsx src/db/seed.ts
```
