import { useEffect, useState } from 'react';

interface HealthResponse {
  status: string;
  service: string;
  environment: string;
  correlationId: string;
  timestamp: string;
}

export function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/health')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: HealthResponse) => {
        setHealth(data);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <main className="container">
      <header>
        <h1>PetOps AI</h1>
        <p className="tagline">
          AI-powered operations assistance for pet-care businesses.
        </p>
      </header>

      <section className="status-card" aria-label="System status">
        <h2>Development Status</h2>
        {loading && <p className="status-indicator loading">Checking API connection...</p>}
        {error && (
          <p className="status-indicator error">
            ⚠ API unavailable: {error}
          </p>
        )}
        {health && (
          <dl className="health-details">
            <div>
              <dt>Status</dt>
              <dd className="status-ok">✓ {health.status}</dd>
            </div>
            <div>
              <dt>Service</dt>
              <dd>{health.service}</dd>
            </div>
            <div>
              <dt>Environment</dt>
              <dd>{health.environment}</dd>
            </div>
            <div>
              <dt>Correlation ID</dt>
              <dd><code>{health.correlationId}</code></dd>
            </div>
          </dl>
        )}
      </section>

      <footer>
        <p>
          Built for the 2026 Ready, Spec, Ship Hackathon — powered by{' '}
          <a href="https://kiro.dev" target="_blank" rel="noopener noreferrer">
            Kiro
          </a>
        </p>
      </footer>
    </main>
  );
}
