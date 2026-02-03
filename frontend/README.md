# Nirpalo Notes Frontend

A modern, production-ready React frontend for real-time collaborative note-taking.

## Features

- **Real-time Collaboration**: Live editing with Socket.io
- **Authentication**: JWT-based login/register
- **Modern UI**: Tailwind CSS with reusable components
- **Responsive Design**: Mobile-first approach
- **Activity Tracking**: Monitor note changes and user activity
- **Search**: Find notes quickly
- **Shareable Links**: Public read-only sharing
- **Production Ready**: Optimized build and error handling

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Socket.io Client** - Real-time communication
- **React Hot Toast** - Toast notifications
- **Lucide React** - Icon library

## Project Structure

```
src/
├── api/                    # API layer
│   ├── axios.js           # Axios configuration
│   ├── auth.js            # Authentication API
│   ├── notes.js           # Notes API
│   ├── activity.js        # Activity tracking API
│   ├── share.js           # Sharing API
│   └── index.js           # API exports
├── components/
│   ├── auth/              # Authentication components
│   │   ├── LoginForm.jsx
│   │   └── RegisterForm.jsx
│   ├── common/            # Reusable UI components
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   ├── Card.jsx
│   │   └── LoadingSpinner.jsx
│   ├── layout/            # Layout components
│   │   └── DashboardLayout.jsx
│   └── notes/             # Note-related components
├── contexts/              # React contexts
│   ├── AuthContext.jsx    # Authentication state
│   └── SocketContext.jsx  # Socket.io state
├── hooks/                 # Custom hooks
├── utils/                 # Utility functions
├── App.jsx               # Main app component
├── main.jsx              # App entry point
└── index.css             # Global styles and Tailwind
```

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

4. Preview production build:
```bash
npm run preview
```

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

## Component Architecture

### Reusable Components

All UI components are built with reusability in mind:

- **Button**: Multiple variants (primary, secondary, success, error, ghost)
- **Input**: Form inputs with validation states
- **Card**: Flexible card component with header/footer
- **LoadingSpinner**: Consistent loading states

### CSS Architecture

- **Tailwind CSS**: Utility-first approach
- **Component Classes**: Reusable CSS classes in `index.css`
- **Design System**: Consistent colors, spacing, and typography
- **Responsive**: Mobile-first design

### State Management

- **AuthContext**: Authentication state and user data
- **SocketContext**: Real-time collaboration state
- **Local State**: Component-level state with useState/useReducer

## API Integration

### Authentication
- Login/Register with JWT tokens
- Automatic token refresh
- Protected routes

### Real-time Features
- Socket.io integration for live collaboration
- User presence tracking
- Conflict resolution
- Activity logging

### Error Handling
- Global error interceptors
- User-friendly error messages
- Automatic logout on 401 errors

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Netlify

1. Build command: `npm run build`
2. Publish directory: `dist`
3. Set environment variables in Netlify dashboard

### Docker

```dockerfile
FROM node:16-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## Development Guidelines

### Code Style

- Use functional components with hooks
- Follow React best practices
- Implement proper error boundaries
- Use TypeScript for type safety (optional)

### Component Naming

- Use PascalCase for components
- Use descriptive names
- Group related components in folders

### Performance

- Use React.memo for expensive components
- Implement proper loading states
- Optimize bundle size
- Use lazy loading for routes

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details
