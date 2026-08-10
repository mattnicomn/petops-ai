import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

export function CarePlanDetail() {
  const { id } = useParams<{ id: string }>();
  const [plan, setPlan] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/care-plans/${id}`)
      .then((res) => {
        if (res.status === 404) throw new Error('Care plan not found');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setPlan(data.carePlan);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <main className="history-page">
        <div className="loading-indicator" role="status">Loading care plan...</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="history-page">
        <h2>Care Plan</h2>
        <div className="error-message" role="alert">⚠ {error}</div>
        <Link to="/app/plans" className="btn btn-secondary" style={{ marginTop: '1rem', display: 'inline-block' }}>
          ← Back to History
        </Link>
      </main>
    );
  }

  if (!plan) return null;

  return (
    <main className="history-page">
      <h2>Care Plan Detail</h2>
      <div className="plan-detail-card">
        <dl className="plan-details">
          <dt>Pet</dt><dd>{String(plan.petName || '—')}</dd>
          <dt>Service</dt><dd>{String(plan.serviceType || '—')}</dd>
          <dt>Status</dt><dd><span className={`status-badge status-${plan.status}`}>{String(plan.status)}</span></dd>
          <dt>Created</dt><dd>{plan.createdAt ? new Date(String(plan.createdAt)).toLocaleString() : '—'}</dd>
          <dt>Correlation ID</dt><dd><code>{String(plan.correlationId || '—')}</code></dd>
        </dl>

        {plan.originalRequest ? (
          <div className="plan-section">
            <h4>Original Request</h4>
            <blockquote className="original-text">{String(plan.originalRequest)}</blockquote>
          </div>
        ) : null}
      </div>

      <Link to="/app/plans" className="btn btn-secondary" style={{ marginTop: '1rem', display: 'inline-block' }}>
        ← Back to History
      </Link>
    </main>
  );
}
