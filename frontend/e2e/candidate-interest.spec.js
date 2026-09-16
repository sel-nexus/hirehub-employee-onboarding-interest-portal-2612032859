import { expect, test } from '@playwright/test';

/** Fails a browser journey when the page produces a client-side error. */
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

test('candidate navigates from the landing page and submits one durable interest record', async ({ page }) => {
  const errors = collectBrowserErrors(page);
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Build Your Future With Us' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Why Join Us?' })).toBeVisible();
  await page.getByRole('link', { name: 'Express Your Interest' }).click();

  await page.getByLabel('Full Name').fill('Alex Morgan');
  await page.getByLabel('Email Address').fill('alex@example.com');
  await page.getByLabel('Mobile Number').fill('9876543210');
  await page.getByLabel('Department of Interest').selectOption('Engineering');
  await page.getByRole('button', { name: 'Submit Application' }).click();

  await expect(page.getByRole('status')).toHaveText('Thank you! Your interest has been submitted successfully.');
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('hirehub_submissions') || '[]').length)).toBe(1);
  await page.reload();
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('hirehub_submissions') || '[]')[0]?.email)).toBe('alex@example.com');
  expect(errors).toEqual([]);
});

test('candidate sees field feedback and duplicate-email protection', async ({ page }) => {
  const errors = collectBrowserErrors(page);
  await page.goto('/apply');
  await page.getByRole('button', { name: 'Submit Application' }).click();
  await expect(page.getByText('Full name is required.')).toBeVisible();
  await expect(page.getByText('Email address is required.')).toBeVisible();

  await page.evaluate(() => localStorage.setItem('hirehub_submissions', JSON.stringify([{
    id: 'unique', fullName: 'Existing Person', email: 'exists@example.com', mobile: '9876543210', department: 'Design', submittedAt: '2026-03-04T00:00:00.000Z',
  }])));
  await page.getByLabel('Full Name').fill('Alex Morgan');
  await page.getByLabel('Email Address').fill('exists@example.com');
  await page.getByLabel('Mobile Number').fill('9876543210');
  await page.getByLabel('Department of Interest').selectOption('Engineering');
  await page.getByRole('button', { name: 'Submit Application' }).click();
  await expect(page.getByRole('alert')).toHaveText('This email has already been submitted.');
  expect(errors).toEqual([]);
});
