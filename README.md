# StockMind - Smart Market Intelligence Platform

StockMind is an intelligent stock market tracking and analysis tool designed to aggregate critical financial information, monitor market catalysts, and provide AI-powered insights using Google Gemini. It moves beyond simple price tracking by focusing on **context**, **financial fundamentals**, and **upcoming catalysts**.

## 🚀 Key Features

- **Smart Watchlist (Tags)**: Track both specific **Companies** (e.g., TSLA, NVDA) and **Industries** (e.g., AI, EV).
- **Catalyst Monitoring**: Define and track specific events (e.g., Earnings dates, Product launches, Regulatory decisions) that could impact your investment thesis.
- **AI-Powered Analysis**:
  - **Daily Reports**: Automated daily news briefings that filter out noise and focus on material updates.
  - **Deep Dive Analysis**: Comprehensive investment memos covering fundamentals, valuation, moats, and risks.
  - **Sentiment Assessment**: Real-time sentiment scoring based on recent news and events.
- **Automated Reporting**: Receive consolidated daily briefings via email (powered by Resend).
- **Modern UI**: Clean, responsive interface built with Next.js and Tailwind CSS.

## 🏗 Project Architecture

StockMind is a full-stack web application built on the **Next.js** framework. It leverages a modern stack to ensure performance, scalability, and type safety.

### Technology Stack

- **Frontend**: [Next.js 16](https://nextjs.org/) (App Router), [React 19](https://react.dev/), [Tailwind CSS 4](https://tailwindcss.com/).
- **Backend**: Next.js API Routes (Serverless functions).
- **Database**: [PostgreSQL](https://www.postgresql.org/) managed via [Prisma ORM](https://www.prisma.io/).
- **AI Engine**: [Google Gemini 2.5 Flash](https://deepmind.google/technologies/gemini/) (via Google Generative AI SDK).
- **Email Service**: [Resend](https://resend.com/).
- **Authentication**: NextAuth.js (configured for secure access).

### System Architecture Diagram

```mermaid
graph TD
    subgraph Client ["Client Layer"]
        Browser["User Browser"]
    end

    subgraph App ["Application Layer (Next.js)"]
        UI["Frontend UI (React/Tailwind)"]
        API["API Routes (/api/*)"]
        Worker["Background Scripts (Cron/Jobs)"]
    end

    subgraph Data ["Data Layer"]
        DB[(PostgreSQL Database)]
        Prisma["Prisma ORM"]
    end

    subgraph External ["External Services"]
        Gemini["Google Gemini AI"]
        Resend["Resend Email Service"]
        GoogleSearch["Google Search Tool"]
    end

    %% Flows
    Browser -->|Interacts| UI
    UI -->|Requests Data| API
    API -->|Queries| Prisma
    Prisma -->|Read/Write| DB
    
    API -->|Generates Content| Gemini
    Gemini -->|News/Search| GoogleSearch
    
    Worker -->|Scheduled Jobs| API
    Worker -->|Direct Access| Prisma
    Worker -->|Generates Reports| Gemini
    Worker -->|Sends Emails| Resend

    %% Styles
    style Gemini fill:#e8f0fe,stroke:#1a73e8,stroke-width:2px
    style DB fill:#e6fffa,stroke:#2c7a7b,stroke-width:2px
    style Resend fill:#fff5f5,stroke:#c53030,stroke-width:2px
```

### Core Components Flow

1.  **User Interaction**: Users manage their watchlist (Tags) and Catalysts through the UI.
2.  **Data Persistence**: All config and generated reports are stored in PostgreSQL using Prisma models (`User`, `Tag`, `Catalyst`, `DailyReport`, `OverallAnalysis`).
3.  **AI Analysis Pipeline**:
    -   The system constructs detailed prompts with user-defined context (Catalysts).
    -   It calls the **Gemini API**, which uses the **Google Search tool** to fetch real-time market data and news.
    -   Gemini processes this information to generate summaries, sentiment scores, and investment memos in Traditional Chinese.
4.  **Automation**: Background scripts (`scripts/`) automate the generation of daily reports and email dispatching, ensuring users start their day with the latest insights.

## 🛠 Getting Started

### Prerequisites

- Node.js (v20+)
- PostgreSQL Database
- Google Gemini API Key
- Resend API Key (for emails)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/stock-mind.git
    cd stock-mind
    ```

2.  **Install dependencies**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Configure Environment Variables**
    Create a `.env` file in the root directory:
    ```env
    DATABASE_URL="postgresql://user:password@localhost:5432/stockmind?schema=StockMind"
    GEMINI_API_KEY="your_gemini_api_key"
    RESEND_API_KEY="your_resend_api_key"
    NEXTAUTH_SECRET="your_nextauth_secret"
    ```

4.  **Setup Database**
    ```bash
    npx prisma generate
    npx prisma db push
    ```

5.  **Run Development Server**
    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📝 License

This project is proprietary and confidential.
