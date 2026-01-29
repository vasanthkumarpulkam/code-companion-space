import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import NewJob from './NewJob';

const mockFrom = vi.fn((table: string) => {
  if (table === 'categories') {
    return {
      select: vi.fn(async () => ({
        data: [{ id: 'cat-1', name: 'Cleaning' }],
        error: null,
      })),
    };
  }

  return {
    select: vi.fn(async () => ({ data: [], error: null })),
  };
});

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: mockFrom,
  },
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'user-1' },
  }),
}));

describe('NewJob', () => {
  it('blocks step advance when required fields are missing', async () => {
    render(
      <MemoryRouter>
        <NewJob />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    expect(
      await screen.findByText('Title must be at least 20 characters')
    ).toBeInTheDocument();
  });
});
