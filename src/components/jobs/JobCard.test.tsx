import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import JobCard from './JobCard';

describe('JobCard', () => {
  it('renders job details', () => {
    const job = {
      id: 'job-123',
      title: 'House cleaning needed',
      description: 'Please clean a 2-bedroom apartment.',
      budget: 150,
      location: 'Austin, TX',
      created_at: new Date('2025-01-01').toISOString(),
      categories: { name: 'Cleaning' },
      profiles: { full_name: 'Jamie Customer' },
    };

    render(
      <MemoryRouter>
        <JobCard job={job} />
      </MemoryRouter>
    );

    expect(screen.getByText('House cleaning needed')).toBeInTheDocument();
    expect(screen.getByText('Cleaning')).toBeInTheDocument();
    expect(screen.getByText('Austin, TX')).toBeInTheDocument();
    expect(screen.getByText('Jamie Customer')).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute('href', '/jobs/job-123');
  });
});
