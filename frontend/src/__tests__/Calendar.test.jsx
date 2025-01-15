import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Calendar from '../Pages/Calendar/Calendar'; // Adjust the path as necessary
import { supabase } from '../components/supabaseClient'; // Adjust the path as necessary
import { AuthProvider } from '../context/AuthContext'; // Mock your AuthContext

jest.mock('../components/supabaseClient');

const mockUser = {
  id: 'test-user-id',
};

const renderWithProviders = (ui, { providerProps, ...renderOptions } = {}) => {
  return render(
    <AuthProvider value={{ user: mockUser }}>
      {ui}
    </AuthProvider>,
    renderOptions
  );
};

describe('Calendar Component', () => {
  beforeEach(() => {
    supabase.from.mockClear();
  });

  it('renders the Calendar component', async () => {
    supabase.from.mockReturnValue({
      select: jest.fn().mockResolvedValueOnce({ data: [], error: null }),
    });

    renderWithProviders(<Calendar />);

    expect(screen.getByText('Calendar')).toBeInTheDocument();
  });

  it('fetches and displays events', async () => {
    const mockEvents = [
      {
        id: 1,
        title: 'Test Event',
        start: '2023-07-30T10:00:00Z',
        end: '2023-07-30T12:00:00Z',
        allDay: false,
        user_id: '10',
        is_timetable_event: false,
      },
    ];

    supabase.from.mockReturnValueOnce({
      select: jest.fn().mockResolvedValueOnce({ data: mockEvents, error: null }),
    });

    renderWithProviders(<Calendar />);

    await waitFor(() => {
      expect(screen.getByText('Test Event')).toBeInTheDocument();
    });
  });

  it('opens modal on date click', async () => {
    supabase.from.mockReturnValue({
      select: jest.fn().mockResolvedValueOnce({ data: [], error: null }),
    });

    renderWithProviders(<Calendar />);

    fireEvent.click(screen.getByText('Calendar')); // Simulate a date click

    expect(screen.getByText('New Event')).toBeInTheDocument();
  });

  it('submits new event form', async () => {
    supabase.from.mockReturnValue({
      insert: jest.fn().mockResolvedValueOnce({ data: [{ id: 2, title: 'New Event' }], error: null }),
      select: jest.fn().mockResolvedValue({ data: [], error: null }),
    });

    renderWithProviders(<Calendar />);

    fireEvent.click(screen.getByText('Calendar')); // Simulate a date click

    fireEvent.change(screen.getByPlaceholderText('Event Title'), { target: { value: 'New Event' } });
    fireEvent.change(screen.getByPlaceholderText('Description'), { target: { value: 'Event Description' } });

    fireEvent.click(screen.getByText('Save Event'));

    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalled();
      expect(screen.getByText('New Event')).toBeInTheDocument();
    });
  });
});
