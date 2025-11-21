# Service HUB

A comprehensive marketplace platform that connects customers in Texas with local service providers across multiple categories including cleaning, moving, landscaping, handyman services, and events.

## Features

### For Customers
- Post jobs with detailed descriptions and budget
- Receive competitive bids from verified providers
- Real-time messaging with providers
- In-app notifications for bid updates
- Secure payment processing
- Rate and review completed jobs

### For Providers
- Browse and bid on available jobs
- Build professional profiles with portfolios
- Real-time job notifications
- Secure payment collection
- Build reputation through ratings

### For Administrators
- Comprehensive admin dashboard
- User and job moderation
- Content moderation and reporting
- Fee management and analytics
- Dispute resolution tools

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **React Router** for navigation
- **TanStack Query** for data fetching

### Backend
- **Supabase** for:
  - Authentication (Email, Google OAuth)
  - PostgreSQL database with Row Level Security
  - Real-time subscriptions
  - File storage
  - Edge Functions for serverless logic

### Payment Processing
- **Stripe** for secure payment handling
- Automatic 10% platform fee collection

### Additional Services
- **Google Maps API** for location services
- **Google Translate API** for Spanish translations

## Getting Started

### Prerequisites
- Node.js 18+ or Bun
- Supabase account
- Stripe account (for payments)
- Google Cloud account (for Maps and Translate APIs)

### Installation

```sh
# Step 1: Clone the repository
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory
cd <YOUR_PROJECT_NAME>

# Step 3: Install dependencies
npm install
# or
bun install

# Step 4: Set up environment variables
# Create .env file with:
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Step 5: Start development server
npm run dev
# or
bun dev
```

## Database Schema

### Core Tables
- **profiles** - User profile information
- **user_roles** - User role management (customer, provider, admin)
- **categories** - Service categories
- **jobs** - Job postings
- **bids** - Bids on jobs
- **messages** - In-app messaging
- **reviews** - Ratings and reviews
- **payments** - Payment tracking
- **notifications** - User notifications
- **notification_preferences** - Notification settings
- **saved_searches** - Saved search filters
- **user_reports** - Content moderation reports

## Key Features

### Real-time Features
- Live job updates via Supabase Realtime
- Instant bid notifications
- Real-time messaging
- Notification system
- Live dashboard updates

### Multilingual Support
- English and Spanish interface
- Automatic job description translation
- Browser language detection
- User language preferences

### Security
- Row Level Security on all tables
- Secure authentication via Supabase
- PCI-compliant payments via Stripe
- Content moderation and reporting
- File upload validation

## Documentation
- See `DEPLOYMENT.md` for deployment instructions
- See `ACCESSIBILITY.md` for accessibility guidelines
- See `SECURITY.md` for security policies

## Testing
Run the Supabase linter:
```bash
supabase db lint
```



## Support
For issues or questions:

- Supabase Documentation: https://supabase.com/docs
- Google Maps API Documentation: https://developers.google.com/maps/documentation


