import { render, screen } from '@testing-library/react';
import Navbar from './Navbar';
import { useAuth } from '../../context/AuthContext';

// Jest 27 (react-scripts 5) cannot resolve react-router v7's package "exports",
// so the two router pieces Navbar uses are replaced with plain stand-ins.
jest.mock(
  'react-router-dom',
  () => {
    const React = require('react');
    return {
      Link: React.forwardRef(({ to, ...rest }, ref) =>
        React.createElement('a', { ref, href: to, ...rest })
      ),
      useNavigate: () => () => {},
    };
  },
  { virtual: true }
);
jest.mock('../../context/AuthContext', () => ({ useAuth: jest.fn() }));
jest.mock('../../context/CartContext', () => ({
  useCart: () => ({ cartCount: 0 }),
}));
jest.mock('../../context/ThemeContext', () => ({
  useThemeMode: () => ({ mode: 'light', toggleMode: () => {} }),
}));

function renderNavbar(auth) {
  useAuth.mockReturnValue({ user: null, loading: false, logout: jest.fn(), ...auth });
  render(<Navbar />);
}

test('shows no account buttons while the sign-in check is running', () => {
  renderNavbar({ loading: true });

  expect(screen.queryByRole('link', { name: 'Login' })).toBeNull();
  expect(screen.queryByRole('link', { name: 'Sign up' })).toBeNull();
  expect(screen.queryByRole('button', { name: 'Logout' })).toBeNull();
});

test('shows Login and Sign up when signed out', () => {
  renderNavbar({ user: null });

  expect(screen.getByRole('link', { name: 'Login' })).toBeTruthy();
  expect(screen.getByRole('link', { name: 'Sign up' })).toBeTruthy();
  expect(screen.queryByRole('button', { name: 'Logout' })).toBeNull();
});

test('shows the display name and Logout when signed in', () => {
  renderNavbar({ user: { id: 1, email: 'ada@example.com', displayName: 'Ada' } });

  expect(screen.getByText('Hi, Ada')).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Logout' })).toBeTruthy();
  expect(screen.queryByRole('link', { name: 'Login' })).toBeNull();
});
