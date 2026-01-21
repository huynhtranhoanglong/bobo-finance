<p align="center">
  <img src="public/icon-512.png" alt="Bobo Finance Logo" width="120" height="120">
</p>

<h1 align="center">Bobo Finance</h1>

<p align="center">
  <strong>Personal Finance Tracker for Financial Freedom</strong>
</p>

<p align="center">
  A modern, intuitive personal finance management app built with Next.js and Supabase. Track your income, expenses, debts, and journey toward financial independence.
</p>

<p align="center">
  <a href="https://bobo-finance-red.vercel.app/">🌐 Live Demo</a> •
  <a href="#features">✨ Features</a> •
  <a href="#quick-start">🚀 Quick Start</a> •
  <a href="#tech-stack">🛠️ Tech Stack</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/license-MIT-green.svg" alt="License">
  <img src="https://img.shields.io/badge/version-1.6.4-blue.svg" alt="Version">
  <img src="https://img.shields.io/badge/Next.js-16-black.svg" alt="Next.js">
  <img src="https://img.shields.io/badge/TypeScript-5.0-blue.svg" alt="TypeScript">
</p>

---

## ✨ Features

### 💰 Financial Tracking
- **Multi-Wallet Management** - Track cash, bank accounts, e-wallets separately
- **Income & Expense Logging** - Categorize transactions with spending levels
- **Smart Transfers** - Move money between wallets with automatic balance updates

### 📊 Financial Health Insights
- **Net Worth Calculation** - Real-time total assets minus liabilities
- **Financial Freedom Progress** - Track your journey based on the 4% rule (25x annual expenses)
- **Monthly Statistics** - Visual breakdown of spending by category (Must-have, Nice-to-have, Waste)

### 💳 Debt Management
- **Payable & Receivable** - Track both money you owe and money owed to you
- **Interest Level Indicators** - Prioritize high-interest debts
- **Repayment Tracking** - Visual progress bars for each debt

### 👨‍👩‍👧 Family Mode
- **Shared Finances** - Invite family members to share a single financial view
- **Private Wallets** - Keep personal wallets hidden from family totals
- **Member Management** - Easy invitation and role management

### 🌍 Internationalization
- **Multi-Language Support** - Vietnamese and English
- **Locale-Aware Formatting** - Currency and dates adapt to your locale

### 📱 Mobile-First Design
- **PWA Support** - Install as a native app on mobile devices
- **Pull-to-Refresh** - Native-like refresh gesture
- **Responsive UI** - Optimized for all screen sizes

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com/) account
- (Optional) [Resend](https://resend.com/) account for email features

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/bobo-finance.git
   cd bobo-finance
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Fill in your Supabase credentials in `.env.local`

4. **Set up the database**
   - Create a new Supabase project
   - Run the SQL scripts in `sql_backup/` folder in order (by date prefix)
   - Enable Row Level Security (RLS) policies

5. **Run the development server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript, React 19 |
| **Styling** | Tailwind CSS v4 |
| **UI Components** | Radix UI, Lucide Icons |
| **Backend/Database** | Supabase (PostgreSQL) |
| **Authentication** | Supabase Auth (Email, Google OAuth) |
| **Email** | Resend |
| **Deployment** | Vercel |

---

## 📁 Project Structure

```
bobo-finance/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Dashboard (main page)
│   ├── actions.ts         # Server Actions
│   ├── login/             # Authentication pages
│   ├── transactions/      # Transaction history
│   ├── family/            # Family management
│   ├── account/           # User profile settings
│   └── private/           # Private wallets dashboard
├── components/            # React components
│   ├── ui/               # Base UI components (Button, Dialog, etc.)
│   └── *.tsx             # Feature components
├── utils/                 # Utility functions
│   ├── colors.ts         # Centralized color palette
│   ├── constants.ts      # App-wide constants
│   ├── labels.ts         # UI text labels
│   └── i18n/             # Internationalization
├── sql_backup/            # Database migration scripts
└── docs/                  # Documentation
```

---

## 📖 Documentation

- [Color System Guide](./COLOR_GUIDE.md) - Design system and color palette
- [Calculation Logic](./LOGIC_CALCULATIONS.md) - Financial formulas and business logic
- [Changelog](./CHANGELOG.md) - Version history and updates

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [Supabase](https://supabase.com/) for the backend infrastructure
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Radix UI](https://www.radix-ui.com/) for accessible UI primitives

---

<p align="center">
  Made with ❤️ for better personal finance management
</p>
