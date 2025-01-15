import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SignUp from '../Pages/SignUp/SignUp';
import { supabase } from '../components/supabaseClient';

jest.mock('../components/supabaseClient');

describe('SignUp', () => {
  test('renders SignUp and submits form', async () => {
    supabase.from.mockReturnValue({
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnValue({ maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }) }),
    });

    render(
      <MemoryRouter>
        <SignUp />
      </MemoryRouter>
    );

    // Check if form elements are rendered
    expect(screen.getByPlaceholderText(/enter your username/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter your email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter your password/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/confirm your password/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/date of birth/i)).toBeInTheDocument();

    // Simulate user input
    fireEvent.change(screen.getByPlaceholderText(/enter your username/i), { target: { value: 'hellow' } });
    fireEvent.change(screen.getByPlaceholderText(/enter your email/i), { target: { value: 'hellow@gmail.com' } });
    fireEvent.change(screen.getByPlaceholderText(/enter your password/i), { target: { value: 'hellow' } });
    fireEvent.change(screen.getByPlaceholderText(/confirm your password/i), { target: { value: 'hellow' } });
    fireEvent.change(screen.getByPlaceholderText(/date of birth/i), { target: { value: '2000-01-01' } });

    // Simulate form submission
    fireEvent.submit(screen.getByTestId('signupForm'));

    // Assert supabase insert was called
    expect(supabase.from).toHaveBeenCalled();
  });
});
