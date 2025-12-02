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
- **Weather Integration**: Real-time weather forecast with configurable API

## 🧰 Available Tools (21)

### Developer Tools
- **JSON Formatter**: Format, minify, and validate JSON.
- **Base64 Encoder**: Encode and decode Base64 text.
- **URL Encoder**: Encode and decode URL parameters.
- **Markdown Preview**: Real-time Markdown editor and preview.
- **Regex Tester**: Test regular expressions against text.
- **Timestamp Converter**: Convert between Unix timestamp and date.
- **UUID Generator**: Generate random UUIDs (v4).

### Security Tools
- **Password Generator**: Generate secure random passwords.
- **Hash Calculator**: Calculate MD5, SHA1, SHA256 hashes.
- **JWT Decoder**: Decode and inspect JSON Web Tokens.

### Color Tools
- **Color Picker**: Select and convert colors (HEX, RGB, HSL).
- **Gradient Generator**: Create CSS linear and radial gradients.
- **Contrast Checker**: Check WCAG color contrast accessibility.

### Image Tools
- **QR Code Generator**: Generate and download QR codes.
- **Image Compressor**: Compress and optimize images.
- **Image to Base64**: Convert images to Base64 strings (and vice-versa).

### Text Tools
- **Text Diff**: Compare two texts and highlight differences.
- **Word Counter**: Count characters, words, lines, and paragraphs.

### AI Tools
- **Text Translator**: Intelligent English-Chinese translation powered by AI.
- **Variable Name Generator**: AI-powered variable name generator for developers.

### Storage Tools
- **GitHub Upload**: Upload files to GitHub and get CDN links (jsDelivr).

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
   Initialize the SQLite database, create tables, and seed default tools:
   ```bash
   npx prisma db push
   npx prisma db seed
   ```
   > **Note:** If you manually delete `data/omnikit.db` to reset the system, you **must** run these commands again to initialize the tables and tools before starting the development server.

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

## 🐳 Docker Deployment

OmniKit can be easily deployed using Docker.

```bash
# Build and start
docker-compose up -d --build

# Stop
docker-compose down

# View logs
docker-compose logs -f
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## ⚙️ Configuration

After initialization, you can configure various settings in the admin panel:

- **Menu Management**: Customize sidebar menu structure
- **Quick Tools**: Select up to 4 tools for dashboard shortcuts
- **System Settings**: Language, theme preferences
- **Weather**: Configure weather API integration
- **AI Providers**: Manage AI service providers for translation and code generation
  - Add OpenAI-compatible API providers
  - Configure API keys and models
- **Translation Settings**: Configure AI-powered translation
  - Select AI provider for translation
  - Customize system prompts
  - Support Chinese-English bidirectional translation
- **Variable Name Generator**: Configure AI for code generation
  - Select AI provider
  - Customize generation prompts
- **GitHub**: Configure Personal Access Token for file uploads

## 📄 License

MIT License
