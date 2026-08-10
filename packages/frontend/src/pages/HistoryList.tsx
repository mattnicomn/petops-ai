import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

interface CarePlanSummary {
  id: string;
  petName: string;
  serviceType: string;
  status: string;
  createdAt: string;
}

export function HistoryList() {
  const [items, setItems] = useState<CarePlanSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/care-plans')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setItems(data.items || []);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <main className="history-page">
        <h2>Care Plan History</h2>
        <div className="loading-indicator" role="status">Loading...</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="history-page">
        <h2>Care Plan History</h2>
        <div className="error-message" role="alert">
          ⚠ Unable to load history: {error}
        </div>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="history-page">
        <h2>Care Plan History</h2>
        <div className="empty-state">
          <p>No care plans yet.</p>
          <Link to="/app" className="btn btn-primary">Create Your First Care Plan</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="history-page">
      <h2>Care Plan History</h2>
      <div className="history-list">
        {items.map((item) => (
          <Link key={item.id} to={`/app/plans/${item.id}`} className="history-item" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="history-item-info">
              <strong>{item.petName}</strong>
              <span className="history-service">{item.serviceType}</span>
              <span className="history-date">
                {new Date(item.createdAt).toLocaleDateString()}
              </span>
            </div>
            <span className={`status-badge status-${item.status}`}>{item.status}</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
