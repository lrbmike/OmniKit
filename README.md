# OmniKit - Multi-Tool Admin System

A robust, extensible admin system built with Next.js 15, designed to manage multiple tools with a unified interface.

## 🚀 Core Technologies

- **Framework**: Next.js 15 (App Router) + React 19
- **Database**: SQLite + Prisma ORM
- **UI**: Tailwind CSS + ShadcnUI + Lucide Icons
- **Authentication**: `iron-session` for secure session management
- **Internationalization**: `next-intl` (English & Chinese)
- **State Management**: Zustand

## 🧰 Available Tools (24)

### Developer Tools (8)
- **JSON Formatter**: Format, minify, and validate JSON data
- **Base64 Encoder**: Encode and decode Base64 text
- **URL Encoder**: Encode and decode URL parameters
- **Markdown Preview**: Real-time Markdown editor and preview
- **Regex Tester**: Test regular expressions against text
- **Timestamp Converter**: Convert between Unix timestamp and date
- **UUID Generator**: Generate random UUIDs (v4)
- **Path Converter**: Convert between Windows and Unix/Linux file paths

### Security Tools (3)
- **Password Generator**: Generate secure random passwords with customizable options
- **Hash Calculator**: Calculate MD5, SHA1, SHA256 hashes
- **JWT Decoder**: Decode and inspect JSON Web Tokens

### Color Tools (3)
- **Color Picker**: Select and convert colors between HEX, RGB, HSL formats
- **Gradient Generator**: Create CSS linear and radial gradients
- **Contrast Checker**: Check WCAG color contrast accessibility standards

### Image Tools (4)
- **QR Code Generator**: Generate and download QR codes
- **Image Compressor**: Compress and optimize images
- **Image to Base64**: Convert images to Base64 strings and vice-versa
- **TinyPNG Compressor**: High-quality image compression using TinyPNG API

### Text Tools (2)
- **Text Diff**: Compare two texts and highlight differences
- **Word Counter**: Count characters, words, lines, and paragraphs

### AI Tools (2)
- **Text Translator**: Intelligent English-Chinese bidirectional translation
- **Variable Name Generator**: AI-powered variable naming suggestions for developers

### Storage Tools (2)
- **GitHub Upload**: Upload files to GitHub and get CDN links via jsDelivr
- **Cloudinary Uploader**: Upload images to Cloudinary cloud storage

### Utility Tools (2)
- **Clipboard Notes**: Manage your notes and clipboard content
- **QR Code Scanner**: Scan QR codes from images and extract URLs or text

## Proxy Services

OmniKit now includes a first-pass reverse proxy layer for managing third-party APIs from the admin backend.

- **Implemented provider**: Brave Search
- **Unified endpoint**: `/api/proxy/[serviceCode]/[...path]`
- **Admin capabilities**:
  - Configure service status, base URL, timeout, and failover retries
  - Configure an external API key used to authorize callers
  - Configure multiple upstream API keys with failover and cooldown support
- **Architecture**:
  - The shared route handles auth, key rotation, forwarding, and failure handling
  - A provider registry defines allowed paths, upstream URL construction, and auth headers

### Brave Search Example

1. Configure the following in `Settings -> Proxy Services`:
   - External API key
   - One or more Brave Search upstream API keys
2. Call the unified proxy endpoint:

```bash
curl -X GET \
  'http://localhost:3000/api/proxy/brave-search/web/search?q=nextjs' \
  -H 'Authorization: Bearer your_proxy_api_key'
```

When you add more proxy providers later, you only need to register a new provider module instead of rewriting the core forwarding flow.

## 🛠️ Quick Start

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

3. **Initialize database**
   ```bash
   pnpm prisma migrate deploy
   pnpm prisma db seed
   ```

   Use `DATABASE_URL="file:../data/omnikit.db"` for local SQLite development.

4. **Start development server**
   ```bash
   pnpm dev
   ```

5. **Access the application**
   
   Open [http://localhost:3000](http://localhost:3000) and complete the initialization wizard to set up your admin account.



## 📄 License

MIT License
