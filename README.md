# AI Flashcards MVP

A web application that reduces the friction of creating high-quality study flashcards by combining manual authoring with AI-assisted generation and an intuitive review queue.

[![Node Version](https://img.shields.io/badge/node-22.14.0-brightgreen.svg)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Table of Contents

- [About](#about)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [Project Scope](#project-scope)
- [Project Status](#project-status)
- [License](#license)

## About

AI Flashcards MVP targets students, professionals, and lifelong learners who value spaced repetition but are discouraged by the time cost of card creation. The application addresses common pain points in flashcard creation:

- **High time cost** to create and curate cards from raw study material
- **Inconsistent quality** when drafting cards without a review structure
- **Frustration** when tools either overcomplicate setup or lose draft work
- **Lack of clear error feedback** that slows down correction and iteration

### Key Features

- **Email/password authentication** with secure session management
- **Manual flashcard CRUD** with inline validation (front: 200 chars, back: 500 chars)
- **AI-assisted candidate generation** triggered manually by the user
- **Review queue** to accept, edit, or discard AI-generated candidates
- **Session-only persistence** for AI candidates until accepted
- **PostgreSQL database** for storing user accounts and accepted flashcards

## Tech Stack

### Frontend

- **[Astro 5](https://astro.build/)** - Fast, efficient web framework with minimal JavaScript
- **[React 19](https://react.dev/)** - UI library for interactive components
- **[TypeScript 5](https://www.typescriptlang.org/)** - Static type checking
- **[Tailwind CSS 4](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Shadcn/ui](https://ui.shadcn.com/)** - Accessible React component library

### Backend

- **[Supabase](https://supabase.com/)** - Comprehensive backend solution providing:
  - PostgreSQL database
  - Built-in user authentication
  - Backend-as-a-Service SDKs
  - Open-source and self-hostable

### AI Integration

- **[OpenRouter.ai](https://openrouter.ai/)** - Access to multiple AI models (OpenAI, Anthropic, Google) with:
  - High efficiency and cost optimization
  - Financial limits on API keys
  - Wide model selection

### CI/CD and Hosting

- **GitHub Actions** - CI/CD pipelines
- **DigitalOcean** - Application hosting via Docker

## Getting Started

### Prerequisites

Ensure you have the following installed:

- **Node.js** v22.14.0 (use [nvm](https://github.com/nvm-sh/nvm) to manage versions)
- **npm** (comes with Node.js)
- **Git**

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd 10xDevs
   ```

2. **Set the correct Node.js version**

   ```bash
   nvm use
   ```

3. **Install dependencies**

   ```bash
   npm install
   ```

4. **Set up environment variables**

   Copy the example environment file and configure your settings:

   ```bash
   cp .env.example .env
   ```

   Update `.env` with your:
   - Supabase URL and API keys
   - OpenRouter.ai API key
   - Other required configuration

5. **Start the development server**

   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:4321` (or the port specified by Astro).

## Available Scripts

| Script             | Description                                  |
| ------------------ | -------------------------------------------- |
| `npm run dev`      | Start the development server with hot reload |
| `npm run build`    | Build the application for production         |
| `npm run preview`  | Preview the production build locally         |
| `npm run astro`    | Run Astro CLI commands                       |
| `npm run lint`     | Run ESLint to check code quality             |
| `npm run lint:fix` | Run ESLint and automatically fix issues      |
| `npm run format`   | Format code with Prettier                    |

## Project Scope

### In Scope (MVP)

✅ **Authentication & User Management**

- Email/password signup, login, logout
- Password change and account deletion
- Session management with expiration

✅ **Flashcard Management**

- Create, read, update, delete flashcards
- Character limits: front (200 chars), back (500 chars)
- Inline validation with clear error messages

✅ **AI-Assisted Generation**

- Manual trigger for AI flashcard generation
- Review queue for candidate management
- Accept, edit, or discard candidates
- Session-only persistence until acceptance
- Retry on AI generation failures

✅ **Data & Security**

- PostgreSQL database via Supabase
- Password hashing
- Authenticated access enforcement
- Duplicate save prevention

### Out of Scope (MVP)

❌ Mobile apps (iOS/Android) and browser extensions  
❌ Analytics and usage tracking  
❌ Flashcard sets, tags, or grouping  
❌ Automatic AI generation  
❌ Spaced repetition algorithm integration (planned for future)  
❌ Collaboration and sharing features  
❌ Localization and advanced accessibility

## Project Status

🚧 **MVP Development** - Internal Demo Phase

This project is currently in active development as an MVP for internal demonstration purposes. The focus is on:

- Demonstrating end-to-end flashcard creation (manual + AI-assisted)
- Validating the review queue UX
- Ensuring data persistence and security
- Providing reliable error handling

### Database Schema

```sql
-- Users table
users:
  - id (PK)
  - email (unique)
  - password_hash
  - created_at
  - updated_at

-- Flashcards table
flashcards:
  - id (PK)
  - user_id (FK → users.id)
  - front (max 200 chars)
  - back (max 500 chars)
  - created_at
  - updated_at
```

### Planned Features

- Integration with open-source spaced repetition algorithm
- Enhanced review and practice sessions
- Advanced card organization (sets, tags)
- Mobile applications

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Note:** This is an MVP internal demo. Features and functionality are subject to change as the project evolves.
