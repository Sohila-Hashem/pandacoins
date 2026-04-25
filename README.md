# PandaCoins

![CI](https://img.shields.io/github/actions/workflow/status/sohila-hashem/pandacoins/ci.yml?branch=main&label=CI%20%7C%20Tests&style=flat-square)
![Coverage](https://img.shields.io/codecov/c/github/sohila-hashem/pandacoins?style=flat-square)

![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black&style=flat-square)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white&style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white&style=flat-square)
![Vitest](https://img.shields.io/badge/Vitest-6E9F18?logo=vitest&logoColor=white&style=flat-square)
![Playwright](https://img.shields.io/badge/Playwright-2EAD33?logo=playwright&logoColor=white&style=flat-square)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-06B6D4?logo=tailwindcss&logoColor=white&style=flat-square)
![PWA](https://img.shields.io/badge/PWA-5A0FC8?logo=pwa&logoColor=white&style=flat-square)

A minimalistic expense tracker and analyzer that turns your spending into clear monthly and month-to-month insights, so you can finally answer: "Where does it all go?" PandaCoins helps you track your coins!

## Demo

**Live website:** https://pandacoins.vercel.app/


## Problem

I have always struggled by the end of every month because I don’t know _where my money went_. PandaCoins was born to solve this. Existing expense-tracking apps and platforms are either too complex or not free.

## Solution

I built a minimalistic expense tracker and analyzer that allows users to:

- Track expenses in a clean, table-based format
- Categorize transactions
- Generate natural-language explanations of spending behavior
- quickly skim through monthly expense summaries
- Support multiple currencies and custom categories
- **Import/Export**: Easily move your data in and out via CSV for backups or migrations.
- **Installable PWA**: Access PandaCoins instantly from your home screen with offline support.

## Tech Stack

### Frontend

- **React + Vite**  
  Chose Vite over Next.js for its simplicity, faster development experience, and because the app does not require SSR or advanced routing features.

- **React Hook Form + Zod**  
  Chosen over Formik due to better type safety, less boilerplate, reusable schemas for future validation, and improved performance.

- **TanStack Router (file-based)**  
  Chosen over React Router to take advantage of built-in file-based routing.

- **Tailwind CSS**  
  Chosen over vanilla CSS to ensure design consistency and rapid development.

- **Shadcn UI**  
  Used to speed up UI development while maintaining consistency and focusing on core features.

- **Vite PWA Plugin**  
  Used to transform the app into a Progressive Web App, enabling installation and offline capabilities.

- **Web Workers**  
  Used to handle CSV parsing and generation off the main thread, ensuring a smooth UI even when processing thousands of rows.

### Testing

- **Vitest (Unit)**  
  Chosen because it integrates seamlessly with Vite.

- **Vitest + React Testing Library (Integration)**  
  Used for integration testing due to excellent compatibility with React and Vite.

- **Playwright (E2E)**  
  Chosen for end-to-end testing because of its simplicity and reliability.

### Backend

No backend is currently implemented due to the simplicity of the app and the lack of complex business logic.

## Architecture Overview (High Level)

- The frontend handles the UI and user-triggered actions.
- Triggered actions are handled by the domain layer.
- The domain layer performs any necessary business logic.
- The data layer manages data persistence when needed (e.g., local storage).
- Results are passed back to the frontend for display.
- The testing layer covers unit, integration, and end-to-end tests.
- A CI/CD pipeline runs tests, performs security checks using `npm audit`, builds the app, and automatically deploys to Vercel.

## Getting Started (Dev Setup)

### Prerequisites

- Node.js **v22.17.0** or higher
- npm **v11.8.0** or higher

### Installation

1. Clone the repository:

```bash
git clone https://github.com/sohila-hashem/pandacoins.git
```

2. Navigate to the project directory:

```bash
cd pandacoins
```

3. Install dependencies:

```bash
npm install
```

4. Run the development server:

```bash
npm run dev
```

5. Open http://localhost:5000 in your browser to see the app.

## Roadmap / Features to Be Added

- [x] Support for custom categories
- [x] Allow filtering by category
- [x] **PWA Support**: App is now installable and works offline.
- [x] **Import/Export**: Import expenses from CSV and export your data for backups.
- [ ] Export reports as PDF
- [ ] Optionally sync expenses and preferences (custom categories, currency, etc.) across devices by creating an account.
