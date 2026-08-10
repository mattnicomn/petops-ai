import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DEMO_SCENARIOS } from '../data/scenarios';

const MAX_LENGTH = 5000;

export function IntakeForm() {
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Load pre-populated text from demo scenario selection
  useEffect(() => {
    const saved = sessionStorage.getItem('petops-intake-text');
    if (saved) {
      setText(saved);
      sessionStorage.removeItem('petops-intake-text');
    }
  }, []);

  const handleSubmit = async () => {
    const trimmed = text.trim();
    if (trimmed.length === 0) {
      setError('Please enter a customer request');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const extractRes = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: trimmed }),
      });

      if (!extractRes.ok) {
        const err = await extractRes.json();
        throw new Error(err.error || `HTTP ${extractRes.status}`);
      }

      const extractData = await extractRes.json();

      // Now validate and flag
      const validateRes = await fetch('/api/validate-and-flag', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Correlation-Id': extractData.correlationId,
        },
        body: JSON.stringify({
          extractionResult: extractData.extractionResult,
          originalText: trimmed,
          correlationId: extractData.correlationId,
        }),
      });

      if (!validateRes.ok) {
        const err = await validateRes.json();
        throw new Error(err.error || `HTTP ${validateRes.status}`);
      }

      const validateData = await validateRes.json();

      // Store results for review panel
      sessionStorage.setItem('petops-review-data', JSON.stringify({
        originalText: trimmed,
        extractionResult: extractData.extractionResult,
        correlationId: extractData.correlationId,
        processingTimeMs: extractData.processingTimeMs,
        ...validateData,
      }));

      navigate('/app/review');
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || 'An error occurred. Please try again.');
      setLoading(false);
    }
  };

  const loadScenario = (scenarioId: string) => {
    const scenario = DEMO_SCENARIOS.find((s) => s.id === scenarioId);
    if (scenario) {
      setText(scenario.text);
      setError(null);
    }
  };

  return (
    <main className="intake-page">
      <h2>Customer Request Intake</h2>
      <p className="intake-instructions">
        Enter or paste the customer's request below. PetOps AI will extract structured
        information and create a proposed care plan for your review.
      </p>

      <div className="scenario-buttons">
        {DEMO_SCENARIOS.map((s) => (
          <button
            key={s.id}
            className="btn btn-sm"
            onClick={() => loadScenario(s.id)}
            disabled={loading}
          >
            {s.icon} {s.name}
          </button>
        ))}
      </div>

      <div className="textarea-wrapper">
        <textarea
          value={text}
          onChange={(e) => {
            if (e.target.value.length <= MAX_LENGTH) {
              setText(e.target.value);
              setError(null);
            }
          }}
          placeholder="Enter customer request here..."
          rows={10}
          disabled={loading}
          aria-label="Customer request text"
        />
        <span className="char-counter" aria-live="polite">
          {text.length} / {MAX_LENGTH}
        </span>
      </div>

      {error && (
        <div className="error-message" role="alert">
          ⚠ {error}
        </div>
      )}

      {loading && (
        <div className="loading-indicator" role="status" aria-live="polite">
          <span className="spinner" />
          Processing with AI... This may take a few seconds.
        </div>
      )}

      <button
        className="btn btn-primary btn-submit"
        onClick={handleSubmit}
        disabled={loading || text.trim().length === 0}
      >
        {loading ? 'Processing...' : 'Analyze Request'}
      </button>
    </main>
  );
}
