/** Browser-storage keys and permitted submission values. */
export const SUBMISSIONS_KEY = 'hirehub_submissions';
export const DEPARTMENTS = [
  'Engineering',
  'Design',
  'Marketing',
  'Human Resources',
  'Finance',
  'Operations',
  'Sales',
  'Data Science',
];

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const namePattern = /^[A-Za-z ]+$/;

/**
 * Validates user-supplied interest fields without trusting browser input types.
 *
 * Args:
 *   values: Candidate form values.
 * Returns:
 *   Field-keyed validation messages, or an empty object when valid.
 */
export function validateSubmission(values) {
  const errors = {};
  const fullName = (values.fullName || '').trim();
  const email = (values.email || '').trim();
  const mobile = (values.mobile || '').trim();

  if (!fullName) {
    errors.fullName = 'Full name is required.';
  } else if (fullName.length > 100 || !namePattern.test(fullName)) {
    errors.fullName = 'Use alphabets and spaces only (up to 100 characters).';
  }
  if (!email) {
    errors.email = 'Email address is required.';
  } else if (!emailPattern.test(email)) {
    errors.email = 'Enter a valid email address.';
  }
  if (!/^\d{10}$/.test(mobile)) {
    errors.mobile = 'Enter a 10-digit mobile number.';
  }
  if (!DEPARTMENTS.includes(values.department)) {
    errors.department = 'Select a department of interest.';
  }
  return errors;
}

/**
 * Reads persisted submissions and repairs malformed storage without breaking the interface.
 *
 * Returns:
 *   A safe array of submission records.
 */
export function getSubmissions() {
  try {
    const stored = window.localStorage.getItem(SUBMISSIONS_KEY);
    if (!stored) {
      return [];
    }
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) {
      window.localStorage.setItem(SUBMISSIONS_KEY, '[]');
      return [];
    }
    return parsed;
  } catch {
    window.localStorage.setItem(SUBMISSIONS_KEY, '[]');
    return [];
  }
}

/**
 * Writes the authoritative submission collection to local storage.
 *
 * Args:
 *   submissions: Complete submission collection to persist.
 */
export function saveSubmissions(submissions) {
  window.localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(submissions));
}

/**
 * Persists a validated unique candidate interest record.
 *
 * Args:
 *   values: Candidate form values that passed field validation.
 * Returns:
 *   Created submission record.
 * Raises:
 *   Error: When the submitted email already exists.
 */
export function createSubmission(values) {
  const submissions = getSubmissions();
  const normalizedEmail = values.email.trim().toLowerCase();
  if (submissions.some((submission) => submission.email.toLowerCase() === normalizedEmail)) {
    throw new Error('This email has already been submitted.');
  }

  const submission = {
    id: window.crypto.randomUUID(),
    fullName: values.fullName.trim(),
    email: normalizedEmail,
    mobile: values.mobile.trim(),
    department: values.department,
    submittedAt: new Date().toISOString(),
  };
  saveSubmissions([...submissions, submission]);
  return submission;
}

/**
 * Replaces permitted fields on one existing submission.
 *
 * Args:
 *   id: Submission identifier to update.
 *   updates: Validated editable fields.
 * Returns:
 *   Updated submission record, or null when no record exists.
 */
export function updateSubmission(id, updates) {
  let updated = null;
  const next = getSubmissions().map((submission) => {
    if (submission.id !== id) {
      return submission;
    }
    updated = { ...submission, ...updates };
    return updated;
  });
  if (updated) {
    saveSubmissions(next);
  }
  return updated;
}

/**
 * Removes a submission by identifier.
 *
 * Args:
 *   id: Submission identifier to remove.
 * Returns:
 *   The updated collection.
 */
export function deleteSubmission(id) {
  const next = getSubmissions().filter((submission) => submission.id !== id);
  saveSubmissions(next);
  return next;
}
