import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { QuickQuoteDialog } from './QuickQuoteDialog';

const mocks = vi.hoisted(() => ({
  insert: vi.fn(),
  order: vi.fn(),
  select: vi.fn(),
  from: vi.fn(),
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: mocks.from,
  },
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'user-1' },
  }),
}));

describe('QuickQuoteDialog', () => {
  beforeEach(() => {
    mocks.order.mockResolvedValue({
      data: [{ id: 'cat-1', name: 'Cleaning' }],
      error: null,
    });
    mocks.select.mockReturnValue({ order: mocks.order });
    mocks.insert.mockResolvedValue({ error: null });
    mocks.from.mockImplementation((table: string) => {
      if (table === 'categories') {
        return { select: mocks.select };
      }
      if (table === 'quote_requests') {
        return { insert: mocks.insert };
      }
      return { select: vi.fn(async () => ({ data: [], error: null })) };
    });
  });

  it('submits a quote request with required fields', async () => {
    render(
      <MemoryRouter>
        <QuickQuoteDialog providerId="provider-1" providerName="Pro Helper" />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: /request quick quote/i }));

    expect(
      await screen.findByText('Request Quick Quote from Pro Helper')
    ).toBeInTheDocument();

    await waitFor(() => expect(mocks.order).toHaveBeenCalled());

    const hiddenSelects = document.querySelectorAll('select');
    fireEvent.change(hiddenSelects[0], { target: { value: 'cat-1' } });

    fireEvent.change(screen.getByLabelText(/project title/i), {
      target: { value: 'Need cleaning help' },
    });
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: 'Clean a two-bedroom apartment this weekend.' },
    });
    fireEvent.change(screen.getByLabelText(/location/i), {
      target: { value: 'Austin, TX' },
    });

    fireEvent.click(screen.getByRole('button', { name: /send quote request/i }));

    await waitFor(() => {
      expect(mocks.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          customer_id: 'user-1',
          provider_id: 'provider-1',
          category_id: 'cat-1',
          title: 'Need cleaning help',
          location: 'Austin, TX',
        })
      );
    });
  });
});
