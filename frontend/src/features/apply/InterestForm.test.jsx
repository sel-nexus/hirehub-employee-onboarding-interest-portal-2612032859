import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import InterestForm from './InterestForm.jsx';
import { SUBMISSIONS_KEY } from '../submissions/submissionStore.js';

/** Renders the interest form inside its routing dependency. */
function renderForm() {
  return render(<BrowserRouter><InterestForm /></BrowserRouter>);
}

/** Completes each required candidate field with a valid unique record. */
async function completeValidForm(user, email = 'alex@example.com') {
  await user.type(screen.getByLabelText('Full Name'), 'Alex Morgan');
  await user.type(screen.getByLabelText('Email Address'), email);
  await user.type(screen.getByLabelText('Mobile Number'), '9876543210');
  await user.selectOptions(screen.getByLabelText('Department of Interest'), 'Engineering');
}

describe('InterestForm', () => {
  it('shows field-level feedback and does not persist invalid candidate input', async () => {
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText('Full Name'), 'Alex123');
    await user.type(screen.getByLabelText('Email Address'), 'not-an-email');
    await user.type(screen.getByLabelText('Mobile Number'), '123');
    await user.click(screen.getByRole('button', { name: 'Submit Application' }));

    expect(screen.getByText(/alphabets and spaces only/i)).toBeInTheDocument();
    expect(screen.getByText(/valid email address/i)).toBeInTheDocument();
    expect(screen.getByText(/10-digit mobile/i)).toBeInTheDocument();
    expect(screen.getByText('Select a department of interest.')).toBeInTheDocument();
    expect(window.localStorage.getItem(SUBMISSIONS_KEY)).toBeNull();
  });

  it('accepts a 100-character full name and persists the valid candidate', async () => {
    const user = userEvent.setup();
    const fullName = 'A'.repeat(100);
    renderForm();

    await user.type(screen.getByLabelText('Full Name'), fullName);
    await user.type(screen.getByLabelText('Email Address'), 'boundary@example.com');
    await user.type(screen.getByLabelText('Mobile Number'), '9876543210');
    await user.selectOptions(screen.getByLabelText('Department of Interest'), 'Engineering');
    await user.click(screen.getByRole('button', { name: 'Submit Application' }));

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(JSON.parse(window.localStorage.getItem(SUBMISSIONS_KEY))[0]).toMatchObject({ fullName });
  });

  it('rejects a 101-character full name and does not persist it', async () => {
    const user = userEvent.setup();
    renderForm();

    fireEvent.change(screen.getByLabelText('Full Name'), {
      target: { name: 'fullName', value: 'A'.repeat(101) },
    });
    await user.type(screen.getByLabelText('Email Address'), 'too-long@example.com');
    await user.type(screen.getByLabelText('Mobile Number'), '9876543210');
    await user.selectOptions(screen.getByLabelText('Department of Interest'), 'Engineering');
    await user.click(screen.getByRole('button', { name: 'Submit Application' }));

    expect(screen.getByText(/alphabets and spaces only/i)).toBeInTheDocument();
    expect(window.localStorage.getItem(SUBMISSIONS_KEY)).toBeNull();
  });

  it('persists a valid unique record, clears the fields, and shows the required confirmation', async () => {
    const user = userEvent.setup();
    renderForm();

    await completeValidForm(user);
    await user.click(screen.getByRole('button', { name: 'Submit Application' }));

    expect(screen.getByRole('status')).toHaveTextContent('Thank you! Your interest has been submitted successfully.');
    expect(screen.getByLabelText('Full Name')).toHaveValue('');
    expect(screen.getByLabelText('Department of Interest')).toHaveValue('');
    const stored = JSON.parse(window.localStorage.getItem(SUBMISSIONS_KEY));
    expect(stored).toHaveLength(1);
    expect(stored[0]).toMatchObject({ fullName: 'Alex Morgan', email: 'alex@example.com', mobile: '9876543210', department: 'Engineering' });
    expect(stored[0].id).toBeTruthy();
    expect(stored[0].submittedAt).toMatch(/T/);
  });

  it('rejects a duplicate email with the exact required message', async () => {
    const user = userEvent.setup();
    window.localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify([{
      id: 'existing-id', fullName: 'Existing Person', email: 'alex@example.com', mobile: '9876543210', department: 'Engineering', submittedAt: '2026-03-04T00:00:00.000Z',
    }]));
    renderForm();

    await completeValidForm(user, 'ALEX@example.com');
    await user.click(screen.getByRole('button', { name: 'Submit Application' }));

    expect(screen.getByRole('alert')).toHaveTextContent('This email has already been submitted.');
    expect(JSON.parse(window.localStorage.getItem(SUBMISSIONS_KEY))).toHaveLength(1);
  });
});
