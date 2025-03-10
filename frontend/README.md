# Prompts.KitchenAI Frontend

This is the frontend application for Prompts.KitchenAI, a platform for managing AI prompts. It's built with Next.js, TypeScript, Tailwind CSS, and shadcn/ui.

## Features

- View, create, edit, and delete prompts
- Manage prompt versions
- User-friendly interface
- Responsive design

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn

### Installation

1. Clone the repository
2. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
3. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

### Development

Run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Environment Variables

Create a `.env.local` file in the root of the frontend directory with the following variables:

```
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

Adjust the API URL as needed to match your backend server.

## Project Structure

- `src/app`: Next.js App Router pages
- `src/components`: React components
  - `layout`: Layout components
  - `prompts`: Prompt-related components
  - `ui`: UI components from shadcn/ui
- `src/lib`: Utility functions and API services

## API Integration

The frontend communicates with the Go backend API. The API service is defined in `src/lib/api.ts`.

## Deployment

Build the application for production:

```bash
npm run build
# or
yarn build
```

Start the production server:

```bash
npm start
# or
yarn start
```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
