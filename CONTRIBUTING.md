# Contributing to Housecal Pro

Thank you for your interest in contributing to Housecal Pro! This document provides guidelines and instructions for contributing.

## Code of Conduct

### Our Pledge
We are committed to providing a welcoming and inspiring community for all. Please be respectful and constructive in your interactions.

### Expected Behavior
- Use welcoming and inclusive language
- Respect differing viewpoints and experiences
- Accept constructive criticism gracefully
- Focus on what's best for the community
- Show empathy towards other community members

## How to Contribute

### Reporting Bugs

Before creating a bug report:
1. Check existing issues to avoid duplicates
2. Gather information about the bug
3. Try to reproduce the issue

When reporting a bug, include:
- Clear, descriptive title
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Environment details (browser, OS, etc.)
- Error messages or console logs

### Suggesting Features

Feature suggestions are welcome! Include:
- Clear description of the feature
- Use case and benefits
- Potential implementation approach
- Any relevant examples or mockups

### Pull Requests

1. **Fork and Clone**
```bash
git clone https://github.com/your-username/service-hub.git
cd service-hub
npm install
```

2. **Create a Branch**
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

3. **Make Changes**
- Follow existing code style
- Write clear commit messages
- Add tests if applicable
- Update documentation

4. **Test Your Changes**
```bash
npm run dev
# Test thoroughly in browser
# Run linter
npm run lint
```

5. **Commit Changes**
```bash
git add .
git commit -m "feat: add new feature description"
# Use conventional commits format
```

6. **Push and Create PR**
```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub with:
- Clear title and description
- Reference related issues
- Screenshots/videos if UI changes
- Checklist of completed items

## Development Guidelines

### Code Style

#### TypeScript
- Use TypeScript for all new code
- Define proper interfaces and types
- Avoid `any` type when possible
- Use meaningful variable names

```typescript
// Good
interface JobData {
  title: string;
  description: string;
  budget: number;
}

const createJob = async (data: JobData): Promise<Job> => {
  // Implementation
};

// Avoid
const createJob = async (data: any) => {
  // Implementation
};
```

#### React Components
- Use functional components with hooks
- Extract reusable logic into custom hooks
- Keep components focused and small
- Use proper TypeScript props

```typescript
// Good
interface JobCardProps {
  job: Job;
  onBidClick?: () => void;
}

export function JobCard({ job, onBidClick }: JobCardProps) {
  // Component implementation
}
```

#### Styling
- Use Tailwind CSS utility classes
- Follow design system tokens
- Avoid inline styles
- Use semantic class names

```tsx
// Good
<Button className="bg-primary hover:bg-primary/90">
  Submit
</Button>

// Avoid
<Button style={{ backgroundColor: '#2563eb' }}>
  Submit
</Button>
```

### Component Organization
```
src/
├── components/
│   ├── ui/           # Reusable UI components (shadcn)
│   ├── jobs/         # Job-specific components
│   ├── layout/       # Layout components
│   └── [feature]/    # Feature-specific components
├── hooks/            # Custom React hooks
├── pages/            # Page components
├── contexts/         # React contexts
├── utils/            # Utility functions
└── types/            # TypeScript types
```

### Git Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add job filtering by location
fix: resolve bid submission error
docs: update README with deployment steps
style: format code with prettier
refactor: simplify job card component
test: add tests for authentication
chore: update dependencies
```

### Testing Guidelines

#### Manual Testing
- Test on different browsers (Chrome, Firefox, Safari)
- Test on mobile devices
- Test different user roles (customer, provider, admin)
- Verify real-time features work correctly
- Check accessibility with screen reader

#### Things to Test
- [ ] User registration and login
- [ ] Job posting and editing
- [ ] Bid submission and management
- [ ] Real-time messaging
- [ ] Notifications
- [ ] Payment flow (test mode)
- [ ] Mobile responsiveness
- [ ] Dark/light mode
- [ ] Language switching

### Documentation

Update documentation when:
- Adding new features
- Changing existing functionality
- Adding new dependencies
- Modifying configuration
- Changing API endpoints

Include:
- Clear descriptions
- Code examples
- Screenshots if relevant
- Updated README if needed

## Project Structure

### Key Files
- `src/App.tsx` - Main application component
- `src/main.tsx` - Application entry point
- `src/integrations/supabase/` - Supabase client and types
- `supabase/migrations/` - Database migrations
- `README.md` - Project documentation
- `DEPLOYMENT.md` - Deployment instructions
- `SECURITY.md` - Security policies

### Database Changes

When modifying the database:
1. Create a new migration file
2. Test migration locally
3. Document changes
4. Update TypeScript types
5. Update RLS policies if needed

### Supabase Migrations
```sql
-- Example migration
-- Description: Add new column to jobs table

ALTER TABLE public.jobs 
ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;

-- Update RLS policies if needed
-- Add indexes if needed
CREATE INDEX IF NOT EXISTS idx_jobs_featured ON public.jobs(featured);
```

## Getting Help

- Check existing documentation
- Search closed issues
- Ask in discussions
- Contact maintainers

## Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md (if we create one)
- Acknowledged in release notes
- Featured in community highlights

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

Thank you for contributing to Housecal Pro! 🎉
