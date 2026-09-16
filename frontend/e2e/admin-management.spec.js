import { expect, test } from '@playwright/test';

/** Fails the journey if rendered application code emits browser-side errors. */
function collectBrowserErrors(page) {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') {
      errors.push(message.text());
    }
  });
  return errors;
}

test('administrator authenticates, manages a browser-persisted candidate, and logs out', async ({ page }) => {
  const errors = collectBrowserErrors(page);
  await page.goto('/admin');
  await page.getByLabel('Username').fill('admin');
  await page.getByLabel('Password').fill('incorrect');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page.getByRole('alert')).toHaveText('Invalid credentials. Please try again.');

  await page.getByLabel('Password').fill('admin');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page.getByText('No submissions yet.')).toBeVisible();
  await page.evaluate(() => localStorage.setItem('hirehub_submissions', JSON.stringify([{
    id: 'candidate-1', fullName: 'Alex Morgan', email: 'alex@example.com', mobile: '9876543210', department: 'Engineering', submittedAt: '2026-03-04T00:00:00.000Z',
  }])));
  await page.reload();
  await expect(page.getByText('Alex Morgan')).toBeVisible();
  await expect(page.getByLabel('Submission statistics')).toContainText('Total Submissions1');

  await page.getByRole('button', { name: 'Edit' }).click();
  await expect(page.getByRole('dialog', { name: 'Edit Submission' })).toBeVisible();
  await expect(page.getByLabel('Email')).toBeDisabled();
  await page.getByLabel('Mobile').fill('9123456789');
  await page.getByLabel('Department').selectOption('Data Science');
  await page.getByRole('button', { name: 'Save Changes' }).click();
  await expect(page.getByText('Data Science')).toBeVisible();
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('hirehub_submissions') || '[]')[0]?.mobile)).toBe('9123456789');

  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Delete' }).click();
  await expect(page.getByText('No submissions yet.')).toBeVisible();
  await page.getByRole('button', { name: 'Logout' }).click();
  await expect(page).toHaveURL('/');
  await expect.poll(() => page.evaluate(() => sessionStorage.getItem('hirehub_admin_auth'))).toBeNull();
  expect(errors).toEqual([]);
});
