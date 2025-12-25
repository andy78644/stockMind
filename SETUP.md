# Setup Instructions

## Prerequisites
- Node.js 18+ installed
- npm or yarn

## Quick Start

1. **Install dependencies**:
   ```bash
   cd /Users/andy78644/Project/StockInfoAggregation
   npm install
   ```

2. **Configure environment variables**:
   
   The `.env` file has been partially configured. You need to add your **Gemini API key**:
   
   ```bash
   # Open .env and add:
   GEMINI_API_KEY=your_api_key_here
   ```
   
   Get your API key from: https://aistudio.google.com/app/apikey

3. **Run database migrations** (already done):
   ```bash
   npx prisma migrate dev
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

5. **Open in browser**:
   Visit http://localhost:3000

6. **Sign in**:
   - Enter any email (e.g., test@example.com)
   - Account will be auto-created

## Environment Variables

```bash
# Database (auto-configured)
DATABASE_URL="file:./dev.db"

# NextAuth (already configured)
AUTH_SECRET="[auto-generated]"

# Gemini API (YOU NEED TO ADD THIS)
GEMINI_API_KEY="your_key_here"
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Create production build
- `npm run start` - Run production server
- `npx prisma studio` - Open database GUI
