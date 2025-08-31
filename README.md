# Respublica Leadership Application Portal

## Project Overview

This is a professional application portal for Respublica leadership position applications. The application streamlines the process of collecting and processing leadership applications with document upload and data extraction capabilities.

## Features

- Multi-step application form
- Document upload and processing
- Data extraction from CVs
- Responsive design for all devices
- Secure data submission

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm (v7 or later)

### Installation

1. Clone the repository:
   ```sh
   git clone <YOUR_GIT_URL>
   cd <PROJECT_DIRECTORY>
   ```

2. Install dependencies:
   ```sh
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

4. Start the development server:
   ```sh
   npm run dev
   ```
   The application will be available at `http://localhost:3000`

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Project Structure

- `/src/components` - Reusable UI components
- `/src/app` - Application pages and API routes
- `/public` - Static assets

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Technologies Used

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **Build Tool**: Vite
- **Form Handling**: React Hook Form
- **State Management**: React Context API
- **API**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)

## Deployment

### Local Development
```bash
# Build the application
npm run build

# Start the production server
npm start
```

### Production Deployment
For production deployment, you can use services like:
- Vercel
- Netlify
- AWS Amplify
- Any static hosting service that supports Vite/React applications

Ensure you set up the required environment variables in your deployment platform.

### Environment Variables
Create a `.env.production` file in the root directory with the following variables:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```
