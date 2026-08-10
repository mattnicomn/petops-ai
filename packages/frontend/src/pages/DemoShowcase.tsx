import { useNavigate } from 'react-router-dom';
import { DEMO_SCENARIOS } from '../data/scenarios';

export function DemoShowcase() {
  const navigate = useNavigate();

  const handleScenario = (text: string) => {
    sessionStorage.setItem('petops-intake-text', text);
    navigate('/app');
  };

  return (
    <main className="demo-showcase">
      <header className="demo-header">
        <h1>PetOps AI Demo</h1>
        <p>Two ways to create a care plan — one trusted operational pipeline.</p>
      </header>

      {/* Two modes */}
      <div className="demo-modes">
        <div className="demo-mode-card">
          <h2>🤖 AI Quick Intake</h2>
          <p>Describe what the pet needs in natural language. Bedrock AI extracts structured information automatically.</p>
          <div className="scenario-grid-small">
            {DEMO_SCENARIOS.map((scenario) => (
              <button
                key={scenario.id}
                className="scenario-card-small"
                onClick={() => handleScenario(scenario.text)}
                aria-label={`Load ${scenario.name} scenario`}
              >
                <span>{scenario.icon} {scenario.name}</span>
                <span className="scenario-tags">
                  {scenario.tags.map((tag) => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </span>
              </button>
            ))}
          </div>
          <button className="btn btn-secondary" onClick={() => navigate('/app')}>
            ✏️ Blank Intake
          </button>
        </div>

        <div className="demo-mode-card demo-mode-guided">
          <h2>📋 Guided Intake</h2>
          <p>Answer a few smart questions while PetOps builds the care plan in real time. No typing required.</p>
          <button className="btn btn-primary" onClick={() => navigate('/app/guided')}>
            Start Guided Intake →
          </button>
        </div>
      </div>

      <p className="demo-footer-note">
        <strong>Two Intake Modes. One Trusted Operational Pipeline.</strong><br />
        Both paths → Zod validation → attention flags → care plan assembly → human review → DynamoDB.
      </p>

      <div className="demo-video-section">
        <h3>📽️ See It In Action</h3>
        <div className="demo-video-links">
          <a href="https://www.youtube.com/watch?v=C4zRCx_ZyMw" target="_blank" rel="noopener noreferrer" className="btn btn-primary">
            🎬 Watch the Hackathon Demo
          </a>
          <a href="https://www.youtube.com/watch?v=rcYxXv5sq98" target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
            📹 Extended Technical Walkthrough
          </a>
        </div>
      </div>
    </main>
  );
}
