# Polling System - React Frontend

A modern React frontend for the Polling System application, built with Vite, React Router, and modern React hooks.

## Features

### Authentication
- **Login/Register**: Secure authentication with form validation
- **Protected Routes**: Role-based access control
- **User Management**: Profile management and session handling

### Polling System
- **Dashboard**: Overview of all polls with filtering options
- **Poll Creation**: Admin-only poll creation with rich form validation
- **Voting Interface**: Intuitive voting system with real-time feedback
- **Results Display**: Beautiful charts and statistics
- **My Votes**: Personal voting history and tracking

### UI/UX
- **Modern Design**: Clean, responsive interface with glassmorphism effects
- **Mobile-First**: Fully responsive design for all devices
- **Real-time Updates**: Live poll status and voting updates
- **Accessibility**: Keyboard navigation and screen reader support

## Technology Stack

- **React 18**: Modern React with hooks and functional components
- **Vite**: Fast build tool and development server
- **React Router**: Client-side routing and navigation
- **Axios**: HTTP client for API communication
- **React Hook Form**: Form handling and validation
- **Yup**: Schema validation
- **Lucide React**: Beautiful icon library
- **CSS3**: Modern styling with gradients and animations

##  Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🏗️ Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Navbar.jsx      # Navigation component
│   │   └── PollCard.jsx    # Poll display component
│   ├── contexts/           # React Context providers
│   │   ├── AuthContext.jsx # Authentication state
│   │   └── PollContext.jsx # Poll data management
│   ├── pages/              # Page components
│   │   ├── Login.jsx       # Login page
│   │   ├── Register.jsx    # Registration page
│   │   ├── Dashboard.jsx   # Main dashboard
│   │   ├── CreatePoll.jsx  # Poll creation (Admin)
│   │   ├── PollDetails.jsx # Individual poll view
│   │   └── MyVotes.jsx     # User voting history
│   ├── App.jsx             # Main app component
│   ├── App.css             # Global styles
│   └── main.jsx            # App entry point
├── public/                 # Static assets
├── package.json           # Dependencies and scripts
└── vite.config.js         # Vite configuration
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the frontend directory:

```env
VITE_API_BASE_URL=http://localhost:3001/api
```

### API Integration
The frontend communicates with the Express.js backend through:
- **Base URL**: `http://localhost:3001/api`
- **Authentication**: JWT tokens stored in localStorage
- **Error Handling**: Comprehensive error handling and user feedback

## Design System

### Colors
- **Primary**: Linear gradient from #667eea to #764ba2
- **Success**: #28a745
- **Warning**: #ffc107
- **Danger**: #dc3545
- **Info**: #17a2b8

### Typography
- **Font Family**: Inter, system fonts
- **Headings**: 700 weight, various sizes
- **Body**: 400 weight, 1.6 line height

### Components
- **Cards**: Rounded corners, subtle shadows
- **Buttons**: Gradient backgrounds, hover effects
- **Forms**: Clean inputs with validation states
- **Navigation**: Sticky header with backdrop blur

## Development

### Available Scripts
```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### Code Structure
- **Functional Components**: All components use React hooks
- **Context API**: State management with React Context
- **Custom Hooks**: Reusable logic extraction
- **Form Validation**: React Hook Form with Yup schemas
- **Error Boundaries**: Graceful error handling

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Protected Routes**: Role-based access control
- **Input Validation**: Client-side and server-side validation
- **XSS Protection**: Sanitized user inputs
- **CSRF Protection**: Secure API communication

##  Responsive Design

The application is fully responsive with breakpoints:
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## Testing

```bash
# Run tests
npm run test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## Deployment

### Production Build
```bash
npm run build
```

### Deployment Options
- **Static Hosting**: Vercel, Netlify, GitHub Pages
- **CDN**: CloudFlare, AWS CloudFront
- **Server**: Nginx, Apache

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Author

**Sreejith Thalappilly**
- GitHub: [@Sreejith-Thalappilly](https://github.com/Sreejith-Thalappilly)

---

**Note**: This React frontend is part of the Polling System project. Make sure the Express.js backend is running on port 3001 for full functionality.