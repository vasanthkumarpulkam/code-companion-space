import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { QuickQuoteDialog } from './QuickQuoteDialog';

const insertMock = vi.fn(async () => ({ error: null }));
const orderMock = vi.fn(async () => ({
  data: [{ id: 'cat-1', name: 'Cleaning' }],
  error: null,
}));
const selectMock = vi.fn(() => ({ order: orderMock }));

const mockFrom = vi.fn((table: string) => {
  if (table === 'categories') {
    return { select: selectMock };
  }
  if (table === 'quote_requests') {
    return { insert: insertMock };
  }
  return { select: vi.fn(async () => ({ data: [], error: null })) };
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

describe('QuickQuoteDialog', () => {
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

    await waitFor(() => expect(orderMock).toHaveBeenCalled());

    const categorySelect = screen.getByRole('combobox');
    fireEvent.mouseDown(categorySelect);
    fireEvent.click(await screen.findByText('Cleaning'));

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
      expect(insertMock).toHaveBeenCalledWith(
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
