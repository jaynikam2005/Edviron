# Edviron Frontend - React + Vite + TypeScript

🚀 A modern React frontend application for the Edviron payment gateway system, built with Vite, TypeScript, and Tailwind CSS.

## 🌟 Features

- ⚡ **Vite** - Lightning fast build tool and dev server
- ⚛️ **React 18** - Latest React with TypeScript support
- 🎨 **Tailwind CSS** - Utility-first CSS framework
- 🧭 **React Router** - Client-side routing
- 📡 **Axios** - HTTP client for API communication
- 🔐 **JWT Authentication** - Secure authentication flow
- 📱 **Responsive Design** - Mobile-first responsive UI
- 🎯 **TypeScript** - Type-safe development

## 📁 Project Structure

```
src/
├── components/
│   └── Layout.tsx              # Main layout with navigation
├── pages/
│   ├── Login.tsx               # Login page
│   └── Dashboard.tsx           # Dashboard with analytics
├── services/
│   └── api.ts                  # Axios API service
├── App.tsx                     # Main app with routing
├── main.tsx                    # Application entry point
└── index.css                   # Tailwind CSS imports
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Backend API** running on `http://localhost:3000`

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Configuration

The `.env` file is already configured with:

```env
# Backend API Configuration
VITE_API_BASE_URL=http://localhost:3000
VITE_API_TIMEOUT=10000

# Environment
VITE_NODE_ENV=development
```

## 🔧 Available Scripts

```bash
# Development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run type-check

# Linting
npm run lint
```

## 🌐 API Integration

### Authentication Flow

1. **Login**: User enters credentials on `/login`
2. **Token Storage**: JWT token stored in localStorage
3. **API Requests**: Token automatically added to request headers
4. **Route Protection**: Protected routes redirect to login if no token

### API Service Usage

```typescript
import { apiService } from './services/api';

// Login
const response = await apiService.auth.login({
  email: 'user@example.com',
  password: 'password123'
});

// Get transactions
const transactions = await apiService.transactions.getAll({
  page: 1,
  limit: 10,
  sort: 'payment_time',
  order: 'desc'
});
```

## 🎨 UI Components

### Custom Tailwind Classes

```css
.btn-primary     /* Blue primary button */
.btn-secondary   /* Gray secondary button */
.input-field     /* Styled input field */
.card           /* White card with shadow */
```

## 🔐 Authentication

### Protected Routes
- `/dashboard` - Main dashboard
- `/transactions` - Transaction management
- `/payments` - Payment creation
- `/users` - User management

### Public Routes
- `/` - Home page
- `/login` - Login page
- `/register` - Registration page

## 🚀 Getting Started

1. **Start Backend**: Ensure the NestJS backend is running on `http://localhost:3000`
2. **Install Dependencies**: Run `npm install`
3. **Start Frontend**: Run `npm run dev`
4. **Open Browser**: Navigate to `http://localhost:5173`
5. **Test Login**: Use the login page to authenticate

## 📚 Built With

- [Vite](https://vitejs.dev/) - Build tool
- [React](https://react.dev/) - UI library
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [React Router](https://reactrouter.com/) - Routing
- [Axios](https://axios-http.com/) - HTTP client
