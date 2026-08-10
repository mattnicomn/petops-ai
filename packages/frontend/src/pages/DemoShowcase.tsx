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
        <p>Select a scenario to see PetOps AI in action, or enter your own request.</p>
      </header>

      <div className="scenario-grid">
        {DEMO_SCENARIOS.map((scenario) => (
          <button
            key={scenario.id}
            className="scenario-card"
            onClick={() => handleScenario(scenario.text)}
            aria-label={`Load ${scenario.name} scenario`}
          >
            <span className="scenario-icon">{scenario.icon}</span>
            <h3>{scenario.name}</h3>
            <p className="scenario-description">{scenario.description}</p>
            <span className="scenario-tags">
              {scenario.tags.map((tag) => (
                <span key={tag} className="tag">{tag}</span>
              ))}
            </span>
          </button>
        ))}

        <button
          className="scenario-card scenario-blank"
          onClick={() => navigate('/app')}
          aria-label="Start with blank intake form"
        >
          <span className="scenario-icon">✏️</span>
          <h3>Blank Intake</h3>
          <p className="scenario-description">Enter your own customer request</p>
        </button>
      </div>
    </main>
  );
}
