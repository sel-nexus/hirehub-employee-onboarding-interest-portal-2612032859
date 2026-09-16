import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
  deleteSubmission,
  getSubmissions,
  updateSubmission,
} from '../submissions/submissionStore.js';
import EditSubmissionModal from './EditSubmissionModal.jsx';
import { logout } from './adminSession.js';

/** Formats an ISO timestamp for the dashboard without mutating stored data. */
function formatDate(isoDate) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(isoDate));
}

/** Renders storage-backed submission insight and management controls. */
export default function AdminDashboard({ onLogout }) {
  const [submissions, setSubmissions] = useState([]);
  const [isHydrating, setIsHydrating] = useState(true);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    const hydrationTimer = window.setTimeout(() => {
      setSubmissions(getSubmissions());
      setIsHydrating(false);
    }, 0);

    return () => window.clearTimeout(hydrationTimer);
  }, []);

  const metrics = useMemo(() => {
    const latest = submissions.reduce(
      (current, submission) => (
        !current || new Date(submission.submittedAt) > new Date(current.submittedAt)
          ? submission
          : current
      ),
      null,
    );

    return {
      total: submissions.length,
      departments: new Set(submissions.map((submission) => submission.department)).size,
      latest: latest ? formatDate(latest.submittedAt) : 'N/A',
    };
  }, [submissions]);

  /** Persists permitted edits, refreshes the displayed collection, and closes the dialog. */
  const handleSave = (updates) => {
    updateSubmission(editing.id, updates);
    setSubmissions(getSubmissions());
    setEditing(null);
  };

  /** Confirms intent before removing a record from browser storage. */
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this submission?')) {
      setSubmissions(deleteSubmission(id));
    }
  };

  /** Ends the demo session and delegates navigation to the protected route owner. */
  const handleLogout = () => {
    logout();
    onLogout();
  };

  return (
    <main className="dashboard-page">
      <div className="dashboard-heading">
        <div>
          <p className="eyebrow">LOCAL INTEREST PIPELINE</p>
          <h1>Submissions Dashboard</h1>
        </div>
        <button
          className="logout-button dashboard-logout"
          type="button"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
      {isHydrating ? (
        <section aria-busy="true" aria-live="polite" aria-label="Loading submissions">
          <p role="status">Loading submissions…</p>
        </section>
      ) : (
        <>
          <section className="stats-grid" aria-label="Submission statistics">
            <article className="stat-card stat-total">
              <span>Total Submissions</span>
              <strong>{metrics.total}</strong>
            </article>
            <article className="stat-card stat-departments">
              <span>Departments</span>
              <strong>{metrics.departments}</strong>
            </article>
            <article className="stat-card stat-latest">
              <span>Latest Submission</span>
              <strong>{metrics.latest}</strong>
            </article>
          </section>
          <section className="table-card" aria-labelledby="submissions-table-title">
            <div className="table-card-header">
              <h2 id="submissions-table-title">Candidate interest</h2>
              <span>
                {submissions.length} record{submissions.length === 1 ? '' : 's'}
              </span>
            </div>
            {submissions.length === 0 ? (
              <p className="empty-state">No submissions yet.</p>
            ) : (
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th scope="col">#</th>
                      <th scope="col">Full Name</th>
                      <th scope="col">Email</th>
                      <th scope="col">Mobile</th>
                      <th scope="col">Department</th>
                      <th scope="col">Submitted On</th>
                      <th scope="col">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.map((submission, index) => (
                      <tr key={submission.id}>
                        <td>{index + 1}</td>
                        <td>{submission.fullName}</td>
                        <td>{submission.email}</td>
                        <td>{submission.mobile}</td>
                        <td>
                          <span className="department-pill">{submission.department}</span>
                        </td>
                        <td>{formatDate(submission.submittedAt)}</td>
                        <td className="action-cell">
                          <button
                            className="table-action edit-action"
                            type="button"
                            onClick={() => setEditing(submission)}
                          >
                            Edit
                          </button>
                          <button
                            className="table-action delete-action"
                            type="button"
                            onClick={() => handleDelete(submission.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
      {editing && (
        <EditSubmissionModal
          submission={editing}
          onCancel={() => setEditing(null)}
          onSave={handleSave}
        />
      )}
    </main>
  );
}

AdminDashboard.propTypes = {
  onLogout: PropTypes.func.isRequired,
};
