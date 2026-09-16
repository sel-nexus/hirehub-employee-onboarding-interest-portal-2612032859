import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import {
  DEPARTMENTS,
  validateSubmission,
} from '../submissions/submissionStore.js';

/** Allows validated editing of the fields the administrator is permitted to change. */
export default function EditSubmissionModal({ submission, onCancel, onSave }) {
  const [values, setValues] = useState({
    fullName: submission.fullName,
    mobile: submission.mobile,
    department: submission.department,
  });
  const [errors, setErrors] = useState({});
  const dialogRef = useRef(null);
  const cancelRef = useRef(null);

  useEffect(() => {
    const previousFocus = document.activeElement;
    cancelRef.current?.focus();
    document.body.classList.add('dialog-open');

    /** Closes on escape and keeps keyboard focus inside the dialog. */
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onCancel();
      }
      if (event.key === 'Tab' && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll(
          'button, input, select, [href]',
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.classList.remove('dialog-open');
      previousFocus?.focus?.();
    };
  }, [onCancel]);

  /** Updates an editable value and clears its old validation feedback. */
  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  };

  /** Validates editable fields using the same policy as the public candidate form. */
  const handleSubmit = (event) => {
    event.preventDefault();
    const validation = validateSubmission({ ...values, email: submission.email });
    const editableErrors = {
      fullName: validation.fullName,
      mobile: validation.mobile,
      department: validation.department,
    };

    if (Object.values(editableErrors).some(Boolean)) {
      setErrors(editableErrors);
      return;
    }

    onSave({
      fullName: values.fullName.trim(),
      mobile: values.mobile.trim(),
      department: values.department,
    });
  };

  /** Closes only when the backdrop, rather than dialog content, is activated. */
  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      onCancel();
    }
  };

  return (
    <div className="modal-backdrop" onMouseDown={handleBackdropClick}>
      <section
        className="edit-modal"
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-title"
      >
        <div className="modal-heading">
          <div>
            <p className="eyebrow">REVIEW RECORD</p>
            <h2 id="edit-title">Edit Submission</h2>
          </div>
          <button
            className="icon-button"
            type="button"
            onClick={onCancel}
            aria-label="Close edit dialog"
          >
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} noValidate>
          <div className="field-group">
            <label htmlFor="edit-fullName">Name</label>
            <input
              id="edit-fullName"
              name="fullName"
              maxLength="100"
              value={values.fullName}
              onChange={handleChange}
              aria-invalid={Boolean(errors.fullName)}
              aria-describedby={errors.fullName ? 'edit-fullName-error' : undefined}
            />
            {errors.fullName && (
              <p className="field-error" id="edit-fullName-error" role="alert">
                {errors.fullName}
              </p>
            )}
          </div>
          <div className="field-group">
            <label htmlFor="edit-email">Email</label>
            <input id="edit-email" value={submission.email} readOnly disabled />
          </div>
          <div className="field-group">
            <label htmlFor="edit-mobile">Mobile</label>
            <input
              id="edit-mobile"
              name="mobile"
              inputMode="numeric"
              maxLength="10"
              value={values.mobile}
              onChange={handleChange}
              aria-invalid={Boolean(errors.mobile)}
              aria-describedby={errors.mobile ? 'edit-mobile-error' : undefined}
            />
            {errors.mobile && (
              <p className="field-error" id="edit-mobile-error" role="alert">
                {errors.mobile}
              </p>
            )}
          </div>
          <div className="field-group">
            <label htmlFor="edit-department">Department</label>
            <select
              id="edit-department"
              name="department"
              value={values.department}
              onChange={handleChange}
              aria-invalid={Boolean(errors.department)}
              aria-describedby={errors.department ? 'edit-department-error' : undefined}
            >
              {DEPARTMENTS.map((department) => (
                <option key={department} value={department}>
                  {department}
                </option>
              ))}
            </select>
            {errors.department && (
              <p className="field-error" id="edit-department-error" role="alert">
                {errors.department}
              </p>
            )}
          </div>
          <div className="modal-actions">
            <button
              className="button secondary-button"
              ref={cancelRef}
              type="button"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button className="button" type="submit">Save Changes</button>
          </div>
        </form>
      </section>
    </div>
  );
}

EditSubmissionModal.propTypes = {
  submission: PropTypes.shape({
    id: PropTypes.string.isRequired,
    fullName: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    mobile: PropTypes.string.isRequired,
    department: PropTypes.string.isRequired,
  }).isRequired,
  onCancel: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};
