# Preben Prepper Frontend

A modern user management dashboard built with Next.js, TypeScript, and ShadCN UI components.

## Features

- **Next.js 15** with App Router
- **TypeScript** for type safety
- **ShadCN UI** components with Tailwind CSS
- **Tanstack Query** for data fetching and caching
- **React Hook Form** with Zod validation
- **Modern responsive design**
- **Real-time API health monitoring**
- **Toast notifications** using Sonner

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   copy .env.local.example .env.local
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3001](http://localhost:3001) in your browser

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Features Overview

### User Management
- View all users in a responsive table
- Create new users with form validation
- Edit existing users
- Delete users with confirmation
- Real-time updates using Tanstack Query

### API Integration
- Automatic error handling
- Loading states
- Optimistic updates
- Cache invalidation
- Health status monitoring

### UI Components
- Modern design with ShadCN UI
- Responsive layout
- Accessible forms
- Toast notifications
- Loading animations

## Environment Variables

- `NEXT_PUBLIC_API_URL` - Backend API URL (default: http://localhost:3000/api)

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Homepage
├── components/            # React components
│   ├── ui/               # ShadCN UI components
│   ├── HealthStatus.tsx  # API health monitoring
│   ├── UserForm.tsx      # User creation/editing form
│   └── UserList.tsx      # User management table
├── hooks/                 # Custom React hooks
│   └── useApi.ts         # API hooks with Tanstack Query
├── lib/                   # Utility functions
│   ├── api.ts            # API client
│   └── utils.ts          # General utilities
└── providers/             # React context providers
    └── QueryProvider.tsx  # Tanstack Query setup
```

## API Integration

The frontend connects to the Express.js backend API running on port 3000. It provides:

- User CRUD operations
- Real-time health monitoring
- Error handling and validation
- Automatic retries and caching

## Development Notes

- The app uses the new Next.js 15 App Router
- All components are client-side rendered for real-time updates
- Form validation is handled by React Hook Form + Zod
- State management is handled by Tanstack Query
- UI components follow the ShadCN design system
