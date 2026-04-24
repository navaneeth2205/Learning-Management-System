# LMS Frontend

Frontend client for the Learning Management System (LMS), built with React + Vite + Tailwind.

## Current Status

- Base role-based routing is implemented for learner, instructor, and admin flows.
- Redux store and feature slices are wired.
- UI is currently using mock/demo data in selected pages until backend API integration is completed.

## Run Locally

```bash
npm install
npm run dev
```

## Scripts

- `npm run dev` - start development server
- `npm run build` - production build
- `npm run preview` - preview production build
- `npm run lint` - run ESLint

## Frontend Flow (High-Level)

- `src/main.jsx` bootstraps app
- `src/App.jsx` provides Redux + Router wrappers
- `src/AppRouter.jsx` defines role-based route trees
- `src/layouts/*` contains role-specific shell layouts
- `src/pages/*` contains page-level modules
- `src/features/*` contains Redux slices/state
- `src/components/*` contains shared and quiz UI components

## Notes for Next Step

Backend integration can now start by replacing mock data usage in pages/features with API calls (Axios), beginning from auth and course/quiz modules.
