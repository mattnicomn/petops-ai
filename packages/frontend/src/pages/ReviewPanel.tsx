import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface ReviewData {
  originalText: string;
  extractionResult: Record<string, unknown>;
  correlationId: string;
  processingTimeMs: number;
  validationResult: { status: string; errors: Array<{ fieldPath: string; message: string }> };
  attentionFlags: Array<{
    id: string;
    severity: string;
    category: string;
    title: string;
    explanation: string;
    sourceText: string;
  }>;
  proposedCarePlan: Record<string, unknown>;
}

export function ReviewPanel() {
  const navigate = useNavigate();
  const [data, setData] = useState<ReviewData | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem('petops-review-data');
    if (!stored) {
      navigate('/app');
      return;
    }
    setData(JSON.parse(stored));
  }, [navigate]);

  const handleApprove = async () => {
    if (!data) return;
    setSaving(true);

    try {
      const res = await fetch('/api/care-plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Correlation-Id': data.correlationId,
        },
        body: JSON.stringify({
          originalRequest: data.originalText,
          extractionResult: data.extractionResult,
          attentionFlags: data.attentionFlags,
          carePlan: data.proposedCarePlan,
          status: 'approved',
          correlationId: data.correlationId,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to save care plan');
      }

      setSaved(true);
      sessionStorage.removeItem('petops-review-data');
    } catch {
      alert('Unable to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleReject = () => {
    sessionStorage.setItem('petops-intake-text', data?.originalText || '');
    sessionStorage.removeItem('petops-review-data');
    navigate('/app');
  };

  if (!data) return null;

  if (saved) {
    return (
      <main className="review-page">
        <div className="success-message">
          <h2>✓ Care Plan Approved</h2>
          <p>The care plan has been saved successfully.</p>
          <div className="success-actions">
            <button className="btn btn-primary" onClick={() => navigate('/app')}>
              New Request
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/app/plans')}>
              View History
            </button>
          </div>
        </div>
      </main>
    );
  }

  const plan = data.proposedCarePlan as Record<string, unknown>;
  const sections = plan.sections as Record<string, unknown>;
  const pet = sections?.petInformation as Record<string, unknown>;
  const services = sections?.services as Array<Record<string, unknown>>;
  const medications = sections?.medications as Array<Record<string, unknown>>;
  const flags = data.attentionFlags;
  const specialInstructions = sections?.specialInstructions as string[];
  const uncertainCount = (plan.uncertainFieldCount as number) || 0;
  const missingFields = (plan.missingFields as Array<Record<string, unknown>>) || [];

  return (
    <main className="review-page">
      <header className="review-header">
        <h2>Review Proposed Care Plan</h2>
        <p className="review-meta">
          Correlation: <code>{data.correlationId}</code> •
          Processed in {data.processingTimeMs}ms
        </p>
        {uncertainCount > 0 && (
          <div className="uncertainty-banner" role="alert">
            ⚠ {uncertainCount} field{uncertainCount > 1 ? 's' : ''} marked as uncertain — please verify
          </div>
        )}
      </header>

      <div className="review-layout">
        {/* Left: Original Request */}
        <section className="review-original" aria-label="Original customer request">
          <h3>Original Request</h3>
          <blockquote className="original-text">{data.originalText}</blockquote>
        </section>

        {/* Right: Proposed Care Plan */}
        <section className="review-plan" aria-label="Proposed care plan">
          <h3>Proposed Care Plan</h3>

          {/* Attention Flags */}
          {flags.length > 0 && (
            <div className="flags-section">
              <h4>Attention Flags ({flags.length})</h4>
              {flags.map((flag) => (
                <div key={flag.id} className={`flag flag-${flag.severity}`}>
                  <span className="flag-badge">{flag.severity.toUpperCase()}</span>
                  <strong>{flag.title}</strong>
                  <p>{flag.explanation}</p>
                  <details>
                    <summary>Source text</summary>
                    <blockquote className="flag-source">...{flag.sourceText}...</blockquote>
                  </details>
                </div>
              ))}
            </div>
          )}

          {/* Validation Errors */}
          {data.validationResult.errors.length > 0 && (
            <div className="validation-errors">
              <h4>Missing Information</h4>
              {data.validationResult.errors.map((err, i) => (
                <div key={i} className="validation-error">
                  <span className="error-path">{err.fieldPath}</span>: {err.message}
                </div>
              ))}
            </div>
          )}

          {/* Pet Information */}
          <div className="plan-section">
            <h4>Pet Information</h4>
            <dl className="plan-details">
              <dt>Name</dt><dd>{(pet?.name as string) || '—'}</dd>
              <dt>Species</dt><dd>{(pet?.species as string) || '—'}</dd>
              <dt>Breed</dt><dd>{(pet?.breed as string) || '—'}</dd>
              <dt>Age</dt><dd>{(pet?.age as string) || '—'}</dd>
              <dt>Weight</dt><dd>{(pet?.weight as string) || '—'}</dd>
            </dl>
          </div>

          {/* Services */}
          {services && services.length > 0 && (
            <div className="plan-section">
              <h4>Services</h4>
              {services.map((svc, i) => (
                <div key={i} className="service-item">
                  <strong>{String((svc.type as string) || '').toUpperCase()}</strong>
                  {svc.startDate ? <span> • {String(svc.startDate)}</span> : null}
                  {svc.endDate ? <span> to {String(svc.endDate)}</span> : null}
                </div>
              ))}
            </div>
          )}

          {/* Medications */}
          {medications && medications.length > 0 && (
            <div className="plan-section">
              <h4>Medications</h4>
              {medications.map((med, i) => (
                <div key={i} className="medication-item">
                  <strong>{med.medicationName as string}</strong>
                  <span> — {med.time as string}</span>
                  <span> • {med.dosage as string}</span>
                  {med.instructions ? <p className="med-instructions">{String(med.instructions)}</p> : null}
                </div>
              ))}
            </div>
          )}

          {/* Special Instructions */}
          {specialInstructions && specialInstructions.length > 0 && (
            <div className="plan-section">
              <h4>Special Instructions</h4>
              <ul>
                {specialInstructions.map((inst, i) => (
                  <li key={i}>{inst}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Missing Fields */}
          {missingFields.length > 0 && (
            <div className="plan-section missing-fields">
              <h4>Information Needed</h4>
              {missingFields.map((field, i) => (
                <div key={i} className="missing-field">
                  📋 <strong>{field.label as string}</strong>
                  <span className="missing-context"> (required for {field.requiredFor as string})</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Actions */}
      <div className="review-actions">
        <button
          className="btn btn-primary"
          onClick={handleApprove}
          disabled={saving}
        >
          {saving ? 'Saving...' : '✓ Approve Care Plan'}
        </button>
        <button
          className="btn btn-danger"
          onClick={handleReject}
          disabled={saving}
        >
          ✕ Reject & Edit
        </button>
      </div>
    </main>
  );
}
