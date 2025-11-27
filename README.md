# OmniKit - Multi-Tool Admin System

A robust, extensible admin system built with Next.js 15, designed to manage multiple tools with a unified interface.

## 🚀 Features

- **Core Framework**: Next.js 15 (App Router) + React 19
- **Database**: SQLite (Default) with Prisma ORM
- **UI/UX**: Tailwind CSS + ShadcnUI + Lucide Icons
- **Authentication**: Secure session management via `iron-session`
- **Initialization**: Built-in setup wizard for first-time configuration
- **Internationalization**: Full i18n support (English & Chinese) via `next-intl`
- **State Management**: Zustand

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/omnikit.git
   cd omnikit
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Setup Database**
   Initialize the SQLite database and create tables:
   ```bash
   npx prisma db push
   ```

4. **Run Development Server**
   ```bash
   pnpm dev
   ```

5. **Access the System**
   Open [http://localhost:3000](http://localhost:3000) in your browser.
   - You will be redirected to the **Initialization Wizard** (`/init`) on first run.
   - Follow the steps to set up the admin account.

## 📂 Project Structure

- `src/app`: App Router pages & layouts
  - `(auth)`: Login/Register routes
  - `(init)`: Initialization wizard
  - `(admin)`: Main dashboard (Coming soon)
- `src/actions`: Server Actions (Auth, Init)
- `src/lib`: Core utilities (DB, Session, Init check)
- `src/components`: Reusable UI components
- `src/messages`: i18n translation files
- `prisma`: Database schema & seed data

## 🔐 Authentication

The system uses a secure, database-backed authentication system.
- **Admin Account**: Created during the initialization process.
- **Session**: Encrypted HTTP-only cookies.

## 🌍 Internationalization

Support for multiple languages is built-in.
- Default: Auto-detects browser language
- Supported: English (`en`), Chinese (`zh`)
- Configuration: `src/i18n/routing.ts`

## 📚 Documentation

- [Requirements Specification](docs/requirements.md)
- [Dependencies](docs/dependencies.md)

