# VendorMate - Street Vendor Management Platform

## Overview

VendorMate is a comprehensive web application designed specifically for street vendors to manage their inventory, communicate with other vendors, and receive real-time alerts. The platform combines modern web technologies with multilingual support and voice input capabilities to create an accessible and user-friendly experience for vendors worldwide.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library (New York style)
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state management
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with WebSocket support for real-time features
- **Session Management**: Express sessions with PostgreSQL session store (connect-pg-simple)

### Database Architecture
- **Primary Database**: PostgreSQL via Neon Database serverless
- **ORM**: Drizzle ORM with type-safe schema definitions
- **Migration Strategy**: Drizzle Kit for schema migrations

## Key Components

### 1. Vendor Management System
- **Auto-generated Vendor IDs**: Format VM1234 stored in localStorage
- **Profile Management**: Name, language preferences, location data
- **Online Status Tracking**: Real-time presence indicators

### 2. Inventory Management
- **Real-time Stock Tracking**: Live updates with low stock alerts
- **Voice Input Integration**: Speech recognition for hands-free inventory updates
- **Multi-language Item Names**: Support for localized item descriptions
- **Threshold-based Alerts**: Configurable low stock warnings

### 3. Communication System
- **WebSocket Chat**: Real-time messaging between vendors
- **Auto-translation**: Automatic language detection and translation
- **Nearby Vendor Discovery**: Location-based vendor connections
- **Message History**: Persistent chat storage with translation caching

### 4. Multi-language Support
- **Language Detection**: Automatic detection of user input language
- **Voice Recognition**: Configurable voice language settings
- **UI Localization**: Support for English, Spanish, French, and Portuguese
- **Translation Service**: Mock translation with production-ready architecture

### 5. Accessibility Features
- **Voice Input**: Browser-based speech recognition
- **Mobile-first Design**: Responsive layout optimized for mobile devices
- **Keyboard Navigation**: Full keyboard accessibility support
- **Screen Reader Support**: Semantic HTML with proper ARIA labels

## Data Flow

### Inventory Updates
1. Vendor inputs item usage via voice or text
2. Frontend sends API request to update inventory
3. Backend validates and updates database
4. Real-time stock levels refreshed via React Query
5. Low stock alerts triggered if thresholds exceeded

### Real-time Chat
1. WebSocket connection established on vendor registration
2. Messages sent through WebSocket with vendor identification
3. Language detection applied to incoming messages
4. Translation performed for recipients with different languages
5. Messages stored in database with translation cache

### Vendor Discovery
1. Location permission requested from browser
2. GPS coordinates sent to backend
3. Spatial queries find nearby vendors within configurable radius
4. Connection requests sent through WebSocket system
5. Vendor networks established for enhanced communication

## External Dependencies

### Core Runtime Dependencies
- **@neondatabase/serverless**: PostgreSQL serverless database connection
- **drizzle-orm**: Type-safe database ORM
- **express**: Web server framework
- **ws**: WebSocket server implementation

### Frontend Libraries
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Accessible UI component primitives
- **lucide-react**: Icon library
- **date-fns**: Date formatting utilities
- **wouter**: Lightweight routing

### Development Tools
- **tsx**: TypeScript execution for development
- **esbuild**: Fast JavaScript bundler for production
- **tailwindcss**: Utility-first CSS framework
- **vite**: Build tool and development server

### Browser APIs
- **Web Speech API**: Voice recognition capabilities
- **Geolocation API**: Location-based vendor discovery
- **WebSocket API**: Real-time communication
- **Local Storage**: Vendor ID persistence

## Deployment Strategy

### Development Environment
- **Hot Module Replacement**: Vite HMR for instant updates
- **TypeScript Checking**: Real-time type validation
- **Error Overlay**: Runtime error display in browser
- **Cartographer Integration**: Replit-specific development tools

### Production Build Process
1. **Frontend Build**: Vite compiles React app to static assets
2. **Backend Bundle**: esbuild bundles server code to single file
3. **Asset Optimization**: CSS/JS minification and tree-shaking
4. **Static Serving**: Express serves built frontend assets

### Database Strategy
- **Connection Pooling**: Neon serverless connection management
- **Schema Migrations**: Drizzle Kit push commands for deployment
- **Environment Variables**: DATABASE_URL for connection configuration
- **Session Storage**: PostgreSQL-backed session persistence

### Scalability Considerations
- **Serverless Database**: Auto-scaling PostgreSQL via Neon
- **Stateless Server**: Session data in database, not memory
- **WebSocket Clustering**: Ready for horizontal scaling with Redis adapter
- **CDN-ready Assets**: Static files optimized for CDN deployment

## Recent Changes - Static Website Conversion

### July 27, 2025 - Static Deployment Ready
- **Converted to static website** for Vercel deployment compatibility
- **Created StaticApiService** to replace backend with localStorage persistence
- **Implemented MockData services** with realistic vendor, inventory, and chat data
- **Updated all React components** to work with static data layer
- **Configured vercel.json** for static hosting with proper routing
- **Fixed all TypeScript errors** and removed backend dependencies
- **Ready for Vercel deployment** - no server or database required

### Static Architecture Benefits
- **Zero backend costs** - runs entirely in browser
- **Instant global deployment** via Vercel CDN
- **Perfect for demos** - pre-populated with realistic data
- **localStorage persistence** - data survives browser sessions
- **No maintenance required** - no servers to monitor

The architecture now prioritizes demo-ready functionality and static deployment while maintaining the complete VendorMate user experience through browser-based storage and mock services.