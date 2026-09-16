import { describe, expect, it } from 'vitest';
import {
  deleteSubmission,
  getSubmissions,
  saveSubmissions,
  SUBMISSIONS_KEY,
  updateSubmission,
} from './submissionStore.js';

const storedSubmission = {
  id: 'candidate-1',
  fullName: 'Alex Morgan',
  email: 'alex@example.com',
  mobile: '9876543210',
  department: 'Engineering',
  submittedAt: '2026-03-04T00:00:00.000Z',
};

describe('submissionStore browser-storage boundary', () => {
  it('returns an empty collection when submission storage is absent', () => {
    expect(getSubmissions()).toEqual([]);
    expect(window.localStorage.getItem(SUBMISSIONS_KEY)).toBeNull();
  });

  it('reads a valid persisted submission array', () => {
    window.localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify([storedSubmission]));

    expect(getSubmissions()).toEqual([storedSubmission]);
  });

  it('resets malformed JSON storage to an empty array', () => {
    window.localStorage.setItem(SUBMISSIONS_KEY, '{not-json');

    expect(getSubmissions()).toEqual([]);
    expect(window.localStorage.getItem(SUBMISSIONS_KEY)).toBe('[]');
  });

  it('resets non-array storage to an empty array', () => {
    window.localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(storedSubmission));

    expect(getSubmissions()).toEqual([]);
    expect(window.localStorage.getItem(SUBMISSIONS_KEY)).toBe('[]');
  });

  it('saves a collection that can be read back from localStorage', () => {
    saveSubmissions([storedSubmission]);

    expect(getSubmissions()).toEqual([storedSubmission]);
    expect(JSON.parse(window.localStorage.getItem(SUBMISSIONS_KEY))).toEqual([storedSubmission]);
  });

  it('updates an existing submission and persists its permitted changes', () => {
    saveSubmissions([storedSubmission]);

    const updated = updateSubmission('candidate-1', {
      fullName: 'Alexandra Morgan',
      mobile: '9123456789',
      department: 'Data Science',
    });

    expect(updated).toMatchObject({
      ...storedSubmission,
      fullName: 'Alexandra Morgan',
      mobile: '9123456789',
      department: 'Data Science',
    });
    expect(getSubmissions()).toEqual([updated]);
  });

  it('returns null for a missing update ID without changing persisted data', () => {
    saveSubmissions([storedSubmission]);

    expect(updateSubmission('missing-id', { fullName: 'Changed Name' })).toBeNull();
    expect(getSubmissions()).toEqual([storedSubmission]);
  });

  it('preserves persisted data when deleting a missing ID', () => {
    saveSubmissions([storedSubmission]);

    expect(deleteSubmission('missing-id')).toEqual([storedSubmission]);
    expect(getSubmissions()).toEqual([storedSubmission]);
  });
});
