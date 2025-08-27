# AAMUSTED Chat Application

A modern, real-time chat application built with React, TypeScript, and Supabase, featuring user authentication, profile management, and secure messaging.

## 🚀 Features

### Core Functionality
- **Real-time Messaging**: Send and receive messages instantly
- **User Authentication**: Secure sign-up and login with Supabase Auth
- **Profile Management**: Customizable user profiles with avatar uploads
- **Message Management**: Delete your own messages with hover controls
- **Online Status**: See who's currently active
- **Responsive Design**: Works seamlessly on desktop and mobile

### User Interface
- **Modern Design**: Clean, intuitive interface with AAMUSTED brand colors
- **Dark/Light Mode**: Automatic theme adaptation
- **Profile Pictures**: Upload and manage your avatar
- **Message Timestamps**: Track conversation history
- **User List**: Browse all available users to chat with

## 🎨 Design System

The application uses AAMUSTED's official brand colors:
- **Primary Green**: For main actions and branding
- **Accent Gold**: For highlights and secondary elements
- **Elegant Gradients**: Smooth transitions and overlays

## 📱 How to Use

### Getting Started
1. **Sign Up/Login**: Create an account or sign in with existing credentials
2. **Complete Profile**: Add your name and upload a profile picture
3. **Start Chatting**: Select a user from the list to begin messaging

### Managing Your Profile
1. Click your profile picture in the user list
2. Update your name and personal information
3. Upload a new avatar (supports JPG, PNG, GIF up to 2MB)
4. Remove your current picture if desired

### Messaging Features
- **Send Messages**: Type your message and press Enter or click Send
- **Delete Messages**: Hover over your messages to reveal the delete button
- **View History**: Scroll through previous conversations
- **Online Status**: Green dot indicates active users

## 🛠 Technical Stack

### Frontend
- **React 18**: Modern React with hooks and functional components
- **TypeScript**: Full type safety and better developer experience
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens
- **shadcn/ui**: High-quality, accessible UI components

### Backend & Database
- **Supabase**: Backend-as-a-Service with real-time capabilities
- **PostgreSQL**: Robust relational database
- **Row Level Security (RLS)**: Secure data access policies
- **Supabase Storage**: File storage for profile pictures

### Key Libraries
- **React Router**: Client-side routing
- **React Hook Form**: Form state management
- **Lucide React**: Beautiful, consistent icons
- **Date-fns**: Date formatting and manipulation

## 🔧 Development Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager
- Supabase account

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd chat-app

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your Supabase credentials to .env

# Start development server
npm run dev
```

### Environment Variables
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📊 Database Schema

### Tables
- **profiles**: User profile information and settings
- **auth.users**: Supabase authentication (managed)

### Storage
- **avatars**: Public bucket for profile pictures

### Security
- Row Level Security (RLS) enabled on all tables
- Users can only access their own data
- Profile pictures stored in public, secure bucket

## 🚀 Deployment

### Using Lovable (Recommended)
1. Open your [Lovable Project](https://lovable.dev/projects/038dbee9-a6a9-4724-b951-136880f73ae0)
2. Click "Share" → "Publish"
3. Your app will be deployed automatically

### Manual Deployment
```bash
# Build for production
npm run build

# Deploy the dist/ folder to your hosting service
```

## 🔒 Security Features

- **Authentication**: Secure user registration and login
- **Data Protection**: Row Level Security on all database operations
- **File Upload Security**: Validated file types and size limits
- **Real-time Security**: Secure WebSocket connections

## 🧪 Testing

```bash
# Run type checking
npm run type-check

# Run linting
npm run lint

# Build production version
npm run build
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit your changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📞 Support

For issues and questions:
1. Check the existing issues on GitHub
2. Create a new issue with detailed information
3. Contact the development team

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

Built with ❤️ using [Lovable](https://lovable.dev) - The fastest way to build web applications