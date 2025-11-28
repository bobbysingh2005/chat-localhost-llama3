import { render, screen, act } from '@testing-library/react';
import ReminderNotification from '../components/ReminderNotification';
import io from 'socket.io-client';

jest.mock('socket.io-client');

describe('ReminderNotification', () => {
  it('shows reminder when event received', async () => {
    const on = jest.fn();
    const disconnect = jest.fn();
    io.mockReturnValue({ on, disconnect });

    render(<ReminderNotification />);

    // Simulate receiving a reminder event
    act(() => {
      on.mock.calls[0][1]({
        user: 'testuser',
        message: 'Test reminder',
        triggerAt: new Date().toISOString(),
        id: 'abc123',
      });
    });

    expect(screen.getByText(/Test reminder/)).toBeInTheDocument();
    expect(screen.getByText(/Reminder:/)).toBeInTheDocument();
  });
});
