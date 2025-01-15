import React from 'react';
import { render } from '@testing-library/react';
import Homepage from '../pages/Homepage/Homepage';
import Sidebar from '../components/Sidebar';
import MainContent from '../components/MainContent';

jest.mock('../components/Sidebar', () => () => <div>Sidebar Mock</div>);
jest.mock('../components/MainContent', () => () => <div>MainContent Mock</div>);

describe('Homepage', () => {
  test('renders Homepage with Sidebar and MainContent', () => {
    const { getByText } = render(<Homepage />);

    expect(getByText('Sidebar Mock')).toBeInTheDocument();
    expect(getByText('MainContent Mock')).toBeInTheDocument();
  });
});
