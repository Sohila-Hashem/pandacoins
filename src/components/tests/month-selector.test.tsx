import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MonthSelector } from '@/components/month-selector';
import userEvent, { type UserEvent } from '@testing-library/user-event';

// ─── Mock setSelectedMonth ──────────────────────────────────────────────────────
const mockSetSelectedMonth = vi.fn();

// ─── helpers ──────────────────────────────────────────────────────────────────
const renderMonthSelector = (availableMonths: string[], selectedMonth: string) => {
  render(<MonthSelector availableMonths={availableMonths} selectedMonth={selectedMonth} setSelectedMonth={mockSetSelectedMonth} />);
};

const openMonthSelector = async (user: UserEvent) => {
  await user.click(screen.getByLabelText(/Select a month/i));
};

const availableMonths = ['2022-01', '2022-02', '2022-03'];
const selectedMonth = '2022-02';

describe('MonthSelector', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the selected month', () => {
    renderMonthSelector(availableMonths, selectedMonth);
    expect(screen.getByText('February 2022')).toBeInTheDocument();
  });

  it('opens the month selector when the trigger is clicked', async () => {
    renderMonthSelector(availableMonths, selectedMonth);
    await openMonthSelector(userEvent.setup());
    expect(screen.getByText('January 2022')).toBeInTheDocument();
  });

  it('closes the month selector when a month is selected', async () => {
    const user = userEvent.setup();
    renderMonthSelector(availableMonths, selectedMonth);
    await openMonthSelector(user);
    const option = await screen.findByRole('option', { name: /February 2022/i });
    await user.click(option);
    expect(screen.queryByRole('option', { name: /February 2022/i })).not.toBeInTheDocument();
  });

  it('calls setSelectedMonth with the selected month', async () => {
    const user = userEvent.setup();
    renderMonthSelector(availableMonths, selectedMonth);
    await openMonthSelector(user);
    const option = await screen.findByRole('option', { name: /January 2022/i });
    await user.click(option);
    expect(mockSetSelectedMonth).toHaveBeenCalledWith('2022-01');
  });

  it('renders "No expenses yet" when no months are available', async () => {
    const user = userEvent.setup();
    const availableMonths: string[] = [];
    const selectedMonth = '';
    renderMonthSelector(availableMonths, selectedMonth);
    await openMonthSelector(user);
    expect(screen.getByText(/No expenses yet/i)).toBeInTheDocument();
  });
});