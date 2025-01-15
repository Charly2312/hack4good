import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from '../pages/LoginPage/LoginPage';
import { AuthContext } from '../context/AuthContext';
import { supabase } from '../components/supabaseClient';
import bcrypt from 'bcryptjs';

jest.mock('../components/supabaseClient');
jest.mock('bcryptjs');

const mockLogin = jest.fn();

const authContextValue = {
  login: mockLogin,
};

describe('LoginPage', () => {
  test('renders LoginPage and submits form', async () => {
    supabase.from.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnValue({ maybeSingle: jest.fn().mockResolvedValue({ data: { id: 1, username: 'testuser', password_hash: 'hashedpassword' }, error: null }) }),
    });

    bcrypt.compare.mockResolvedValue(true);

    render(
      <AuthContext.Provider value={authContextValue}>
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'testpassword' } });

    fireEvent.submit(screen.getByTestId('loginForm'));

    expect(mockLogin).toHaveBeenCalled();
  });
});
