import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DEPARTMENTS, createSubmission, validateSubmission } from '../submissions/submissionStore.js';

const initialValues = { fullName: '', email: '', mobile: '', department: '' };

/** Collects, validates, and persists a candidate interest record in browser storage. */
export default function InterestForm() {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!success) {
      return undefined;
    }
    const timer = window.setTimeout(() => setSuccess(false), 4000);
    return () => window.clearTimeout(timer);
  }, [success]);

  /** Updates one controlled field and removes only its stale validation message. */
  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined, form: undefined }));
  };

  /** Validates and saves an interest record, surfacing duplicate emails as form feedback. */
  const handleSubmit = (event) => {
    event.preventDefault();
    const fieldErrors = validateSubmission(values);
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      setSuccess(false);
      return;
    }
    try {
      createSubmission(values);
      setValues(initialValues);
      setErrors({});
      setSuccess(true);
    } catch (error) {
      setErrors({ form: error.message });
      setSuccess(false);
    }
  };

  /** Renders consistent accessible error metadata for a field. */
  const getFieldProps = (name) => ({
    'aria-invalid': Boolean(errors[name]),
    'aria-describedby': errors[name] ? `${name}-error` : undefined,
  });

  return (
    <main className="form-page">
      <section className="form-intro" aria-labelledby="apply-title">
        <p className="eyebrow">CANDIDATE INTEREST</p>
        <h1 id="apply-title">Join Our Team</h1>
        <p>Express your interest in working with us.</p>
      </section>
      <form className="form-card" noValidate onSubmit={handleSubmit}>
        {success && (
          <div className="success-banner" role="status">
            Thank you! Your interest has been submitted successfully.
          </div>
        )}
        {errors.form && <div className="form-error" role="alert">{errors.form}</div>}
        <div className="field-group">
          <label htmlFor="fullName">Full Name</label>
          <input id="fullName" name="fullName" type="text" maxLength="100" value={values.fullName} onChange={handleChange} required {...getFieldProps('fullName')} />
          {errors.fullName && <p className="field-error" id="fullName-error" role="alert">{errors.fullName}</p>}
        </div>
        <div className="field-group">
          <label htmlFor="email">Email Address</label>
          <input id="email" name="email" type="email" value={values.email} onChange={handleChange} required {...getFieldProps('email')} />
          {errors.email && <p className="field-error" id="email-error" role="alert">{errors.email}</p>}
        </div>
        <div className="field-group">
          <label htmlFor="mobile">Mobile Number</label>
          <input id="mobile" name="mobile" type="tel" inputMode="numeric" maxLength="10" value={values.mobile} onChange={handleChange} required {...getFieldProps('mobile')} />
          {errors.mobile && <p className="field-error" id="mobile-error" role="alert">{errors.mobile}</p>}
        </div>
        <div className="field-group">
          <label htmlFor="department">Department of Interest</label>
          <select id="department" name="department" value={values.department} onChange={handleChange} required {...getFieldProps('department')}>
            <option value="">Select a department</option>
            {DEPARTMENTS.map((department) => <option key={department} value={department}>{department}</option>)}
          </select>
          {errors.department && <p className="field-error" id="department-error" role="alert">{errors.department}</p>}
        </div>
        <button className="button submit-button" type="submit">Submit Application</button>
      </form>
      <Link className="back-link" to="/">← Back to Home</Link>
    </main>
  );
}
