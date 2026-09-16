import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import AdminPage from './AdminPage.jsx';
import { AUTH_KEY } from './adminSession.js';
import { SUBMISSIONS_KEY } from '../submissions/submissionStore.js';

const seededSubmissions = [
  {
    id: 'first',
    fullName: 'Alex Morgan',
    email: 'alex@example.com',
    mobile: '9876543210',
    department: 'Engineering',
    submittedAt: '2026-03-04T00:00:00.000Z',
  },
  {
    id: 'second',
    fullName: 'Jamie Reed',
    email: 'jamie@example.com',
    mobile: '9876543211',
    department: 'Design',
    submittedAt: '2026-03-06T00:00:00.000Z',
  },
];

/** Renders the protected route with a real browser-storage boundary. */
function renderAdmin() {
  return render(
    <BrowserRouter>
      <AdminPage />
    </BrowserRouter>,
  );
}

beforeEach(() => {
  vi.stubGlobal('confirm', vi.fn(() => true));
});

afterEach(() => {
  vi.useRealTimers();
});

describe('AdminPage', () => {
  it('fails closed and displays the exact feedback for invalid static credentials', async () => {
    const user = userEvent.setup();
    renderAdmin();

    expect(screen.getByRole('heading', { name: 'Admin Login' })).toBeInTheDocument();
    await user.type(screen.getByLabelText('Username'), 'admin');
    await user.type(screen.getByLabelText('Password'), 'incorrect');
    await user.click(screen.getByRole('button', { name: 'Login' }));

    expect(screen.getByRole('alert')).toHaveTextContent('Invalid credentials. Please try again.');
    expect(window.sessionStorage.getItem(AUTH_KEY)).toBeNull();
  });

  it('shows an accessible hydration state before rendering persisted submissions', () => {
    vi.useFakeTimers();
    window.sessionStorage.setItem(AUTH_KEY, 'true');
    window.localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(seededSubmissions));
    renderAdmin();

    expect(screen.getByRole('status')).toHaveTextContent('Loading submissions…');
    expect(screen.getByLabelText('Loading submissions')).toHaveAttribute('aria-busy', 'true');
    expect(screen.queryByText('Alex Morgan')).not.toBeInTheDocument();

    act(() => {
      vi.runAllTimers();
    });

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.getByText('Alex Morgan')).toBeInTheDocument();
    expect(screen.getByLabelText('Submission statistics')).toHaveTextContent('Total Submissions2');
  });

  it('creates the required session and derives totals, departments, and latest date from persisted records', async () => {
    const user = userEvent.setup();
    window.localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(seededSubmissions));
    renderAdmin();

    await user.type(screen.getByLabelText('Username'), 'admin');
    await user.type(screen.getByLabelText('Password'), 'admin');
    await user.click(screen.getByRole('button', { name: 'Login' }));

    expect(window.sessionStorage.getItem(AUTH_KEY)).toBe('true');
    expect(screen.getByRole('heading', { name: 'Submissions Dashboard' })).toBeInTheDocument();
    expect(await screen.findByText('alex@example.com')).toBeInTheDocument();
    expect(screen.getByLabelText('Submission statistics')).toHaveTextContent('Total Submissions2');
    expect(screen.getByLabelText('Submission statistics')).toHaveTextContent('Departments2');
    expect(screen.getByLabelText('Submission statistics')).toHaveTextContent('Latest SubmissionMar 6, 2026');
  });

  it('accepts a 100-character edit name, rejects 101 characters, and preserves the saved record', async () => {
    const user = userEvent.setup();
    const validName = 'A'.repeat(100);
    window.sessionStorage.setItem(AUTH_KEY, 'true');
    window.localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(seededSubmissions));
    renderAdmin();

    await screen.findByText('Alex Morgan');
    await user.click(screen.getAllByRole('button', { name: 'Edit' })[0]);
    await user.clear(screen.getByLabelText('Name'));
    await user.type(screen.getByLabelText('Name'), validName);
    await user.click(screen.getByRole('button', { name: 'Save Changes' }));
    expect(JSON.parse(window.localStorage.getItem(SUBMISSIONS_KEY))[0]).toMatchObject({ fullName: validName });

    await user.click(screen.getAllByRole('button', { name: 'Edit' })[0]);
    fireEvent.change(screen.getByLabelText('Name'), {
      target: { name: 'fullName', value: 'A'.repeat(101) },
    });
    await user.click(screen.getByRole('button', { name: 'Save Changes' }));

    expect(screen.getByText(/alphabets and spaces only/i)).toBeInTheDocument();
    expect(JSON.parse(window.localStorage.getItem(SUBMISSIONS_KEY))[0]).toMatchObject({ fullName: validName });
    expect(screen.getByRole('dialog', { name: 'Edit Submission' })).toBeInTheDocument();
  });

  it('validates and persists an editable record, retains read-only email, then deletes after confirmation', async () => {
    const user = userEvent.setup();
    window.sessionStorage.setItem(AUTH_KEY, 'true');
    window.localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(seededSubmissions));
    renderAdmin();

    await screen.findByText('Alex Morgan');
    await user.click(screen.getAllByRole('button', { name: 'Edit' })[0]);
    expect(screen.getByRole('dialog', { name: 'Edit Submission' })).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeDisabled();
    await user.clear(screen.getByLabelText('Mobile'));
    await user.type(screen.getByLabelText('Mobile'), '123');
    await user.click(screen.getByRole('button', { name: 'Save Changes' }));
    expect(screen.getByText('Enter a 10-digit mobile number.')).toBeInTheDocument();

    await user.clear(screen.getByLabelText('Mobile'));
    await user.type(screen.getByLabelText('Mobile'), '9123456789');
    await user.selectOptions(screen.getByLabelText('Department'), 'Data Science');
    await user.click(screen.getByRole('button', { name: 'Save Changes' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(JSON.parse(window.localStorage.getItem(SUBMISSIONS_KEY))[0]).toMatchObject({
      mobile: '9123456789',
      department: 'Data Science',
      email: 'alex@example.com',
    });

    await user.click(screen.getAllByRole('button', { name: 'Delete' })[0]);
    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this submission?');
    expect(JSON.parse(window.localStorage.getItem(SUBMISSIONS_KEY))).toHaveLength(1);
  });
});
