# AdaptiveLearn - Personalized Learning Platform

An AI-powered learning platform that adapts to individual learning styles and provides personalized educational content.

## Features

- 🧠 **AI-Powered Personalization**: Adapts content based on learning style assessment
- 📊 **Real-time Analytics**: Track learning progress and engagement
- 🎥 **Interactive Video Player**: YouTube integration with advanced analytics
- 📈 **Progress Tracking**: Comprehensive learning path visualization
- 🎯 **Smart Recommendations**: AI-driven content suggestions
- 📱 **Responsive Design**: Works seamlessly across all devices

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (Database, Auth, Real-time)
- **Video**: YouTube API integration
- **Analytics**: Custom learning analytics engine
- **Deployment**: Vercel

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account (optional - runs in demo mode without)

### Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd adaptive-learning-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables** (Optional)
   ```bash
   cp .env.example .env
   # Add your Supabase credentials to .env
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## Deployment to Vercel

### Method 1: Vercel CLI (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Set Environment Variables** (if using Supabase)
   ```bash
   vercel env add VITE_SUPABASE_URL
   vercel env add VITE_SUPABASE_ANON_KEY
   ```

### Method 2: GitHub Integration

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Configure environment variables in Vercel dashboard

3. **Environment Variables** (Add in Vercel Dashboard)
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key

### Method 3: Direct Upload

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Upload dist folder**
   - Drag and drop the `dist` folder to vercel.com
   - Configure domain and environment variables

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Supabase project URL | No (demo mode) |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | No (demo mode) |

## Demo Mode

The application runs in demo mode without Supabase configuration:
- Uses mock authentication
- Stores data in browser localStorage
- All features work except real-time sync

## Production Features

- ✅ Responsive design for all devices
- ✅ Progressive Web App (PWA) ready
- ✅ SEO optimized
- ✅ Performance optimized with code splitting
- ✅ Error boundaries and fallbacks
- ✅ Accessibility compliant
- ✅ Real-time learning analytics

## Project Structure

```
src/
├── components/          # React components
│   ├── Auth/           # Authentication components
│   ├── Dashboard/      # Dashboard views
│   ├── Video/          # Video player components
│   └── ...
├── context/            # React context providers
├── data/               # Static data and course content
├── services/           # API services and utilities
├── types/              # TypeScript type definitions
└── lib/                # External library configurations

supabase/
├── migrations/         # Database migrations
└── ...

backend/                # Node.js backend (optional)
├── src/
└── ...
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support, please open an issue on GitHub or contact the development team.

---

Built with ❤️ using React, TypeScript, and Supabase