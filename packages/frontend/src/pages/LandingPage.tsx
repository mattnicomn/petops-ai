import { Link } from 'react-router-dom';

export function LandingPage() {
  return (
    <main className="landing">
      <div className="landing-hero">
        <h1>PetOps AI</h1>
        <p className="landing-tagline">
          AI-powered operations assistant for pet-care businesses.
        </p>
        <p className="landing-description">
          Customer requests arrive as unstructured text — phone notes, emails, free-form messages.
          PetOps AI extracts structured care instructions, flags operational concerns, and puts
          humans in control before anything becomes an operational plan.
        </p>
        <div className="landing-actions">
          <Link to="/demo" className="btn btn-primary btn-lg">
            Try the Demo
          </Link>
        </div>
        <p className="landing-note">No account required. Fictional demo data only.</p>
      </div>

      <section className="landing-features">
        <div className="feature-card">
          <span className="feature-icon">🤖</span>
          <h3>AI Extraction</h3>
          <p>Amazon Bedrock identifies pets, services, medications, and behavioral concerns from natural language.</p>
        </div>
        <div className="feature-card">
          <span className="feature-icon">⚠️</span>
          <h3>Operational Flags</h3>
          <p>Deterministic rules detect medication gaps, vaccination timing, and behavioral considerations.</p>
        </div>
        <div className="feature-card">
          <span className="feature-icon">👤</span>
          <h3>Human Review</h3>
          <p>Staff always approve or reject before a care plan becomes operational. AI is never the final authority.</p>
        </div>
      </section>

      <footer className="landing-footer">
        <p>
          Built for the 2026 Ready, Spec, Ship Hackathon — powered by{' '}
          <a href="https://kiro.dev" target="_blank" rel="noopener noreferrer">Kiro</a>
        </p>
      </footer>
    </main>
  );
}
