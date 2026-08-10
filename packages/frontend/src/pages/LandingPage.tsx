import { Link } from 'react-router-dom';

export function LandingPage() {
  return (
    <main className="landing">
      <div className="landing-hero">
        <h1>PetOps AI</h1>
        <p className="landing-tagline">
          AI-powered operations assistance for pet-care businesses.
        </p>
        <p className="landing-description">
          Transform unstructured customer requests into structured, validated care plans
          with intelligent extraction, operational attention flags, and human-in-the-loop review.
        </p>
        <div className="landing-actions">
          <Link to="/demo" className="btn btn-primary">
            Try the Demo
          </Link>
          <Link to="/app" className="btn btn-secondary">
            Go to App
          </Link>
        </div>
      </div>
      <footer className="landing-footer">
        <p>
          Built for the 2026 Ready, Spec, Ship Hackathon — powered by{' '}
          <a href="https://kiro.dev" target="_blank" rel="noopener noreferrer">Kiro</a>
        </p>
      </footer>
    </main>
  );
}
