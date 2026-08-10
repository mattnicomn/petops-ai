import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { GUIDED_PETS, SERVICE_OPTIONS, GUIDED_QUESTIONS, type GuidedIntakeState } from '../data/guided-intake';
import { mapGuidedIntakeToExtraction, generateGuidedSummary } from '../utils/guided-mapper';

export function GuidedIntake() {
  const navigate = useNavigate();
  const [state, setState] = useState<GuidedIntakeState>({ pet: null, service: null, answers: {} });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Derive live care plan from current state
  const liveExtraction = useMemo(() => mapGuidedIntakeToExtraction(state), [state]);

  // Get applicable questions based on selected service
  const applicableQuestions = useMemo(() => {
    if (!state.service) return [];
    return GUIDED_QUESTIONS.filter(q => q.forServices.includes(state.service!.id));
  }, [state.service]);

  const handleAnswer = (questionId: string, value: string) => {
    setState(prev => {
      const newAnswers = { ...prev.answers, [questionId]: value };
      // Clear custom text if switching away from "other"
      if (value !== 'other') delete newAnswers[`${questionId}-custom`];
      return { ...prev, answers: newAnswers };
    });
  };

  const handleCustomText = (questionId: string, text: string) => {
    // Bound to 100 characters
    if (text.length <= 100) {
      setState(prev => ({ ...prev, answers: { ...prev.answers, [`${questionId}-custom`]: text } }));
    }
  };

  const handleContinueToReview = async () => {
    setLoading(true);
    setError(null);

    try {
      const extraction = mapGuidedIntakeToExtraction(state);
      const summary = generateGuidedSummary(state);

      // Call the same validate-and-flag pipeline
      const res = await fetch('/api/validate-and-flag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          extractionResult: extraction,
          originalText: summary,
          correlationId: crypto.randomUUID(),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || `HTTP ${res.status}`);
      }

      const validateData = await res.json();

      sessionStorage.setItem('petops-review-data', JSON.stringify({
        originalText: summary,
        extractionResult: extraction,
        correlationId: validateData.correlationId,
        processingTimeMs: 0,
        ...validateData,
      }));

      navigate('/app/review');
    } catch (err: unknown) {
      setError((err as Error).message || 'An error occurred');
      setLoading(false);
    }
  };

  const canContinue = state.pet && state.service && Object.keys(state.answers).length >= 1;

  return (
    <main className="guided-page">
      <div className="guided-layout">
        {/* Left: Questions */}
        <div className="guided-steps">
          <h2>Guided Intake</h2>
          <p className="guided-subtitle">Answer a few smart questions while PetOps builds the care plan.</p>

          {/* Step 1: Pet */}
          <section className="guided-section">
            <h3>1. Select Pet</h3>
            <div className="guided-options">
              {GUIDED_PETS.map(pet => (
                <button
                  key={pet.id}
                  className={`guided-option ${state.pet?.id === pet.id ? 'selected' : ''}`}
                  onClick={() => setState(prev => ({ ...prev, pet }))}
                  aria-pressed={state.pet?.id === pet.id}
                >
                  <span className="option-icon">{pet.icon}</span>
                  <span className="option-label">{pet.name}</span>
                  <span className="option-detail">{pet.breed}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Step 2: Service */}
          {state.pet && (
            <section className="guided-section">
              <h3>2. Select Service</h3>
              <div className="guided-options">
                {SERVICE_OPTIONS.map(svc => (
                  <button
                    key={svc.id}
                    className={`guided-option ${state.service?.id === svc.id ? 'selected' : ''}`}
                    onClick={() => setState(prev => ({ ...prev, service: svc, answers: {} }))}
                    aria-pressed={state.service?.id === svc.id}
                  >
                    <span className="option-icon">{svc.icon}</span>
                    <span className="option-label">{svc.label}</span>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Step 3: Contextual Questions */}
          {state.service && applicableQuestions.length > 0 && (
            <section className="guided-section">
              <h3>3. Tell Us More</h3>
              {applicableQuestions.map(q => (
                <div key={q.id} className="guided-question">
                  <label className="question-label">{q.label}</label>
                  <div className="question-options">
                    {q.options.map(opt => (
                      <button
                        key={opt.value}
                        className={`question-option ${state.answers[q.id] === opt.value ? 'selected' : ''}`}
                        onClick={() => handleAnswer(q.id, opt.value)}
                        aria-pressed={state.answers[q.id] === opt.value}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  {state.answers[q.id] === 'other' && (
                    <input
                      type="text"
                      className="custom-text-input"
                      placeholder="Please describe (100 chars max)"
                      value={state.answers[`${q.id}-custom`] || ''}
                      onChange={(e) => handleCustomText(q.id, e.target.value)}
                      maxLength={100}
                      aria-label={`Custom answer for: ${q.label}`}
                    />
                  )}
                </div>
              ))}
            </section>
          )}

          {error && <div className="error-message" role="alert">⚠ {error}</div>}

          {canContinue && (
            <button
              className="btn btn-primary btn-submit"
              onClick={handleContinueToReview}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Continue to Review →'}
            </button>
          )}
        </div>

        {/* Right: Live Care Plan */}
        <aside className="live-care-plan" aria-label="Live Care Plan">
          <h3>Live Care Plan</h3>
          {!state.pet && !state.service ? (
            <p className="live-empty">Select a pet and service to see the care plan build in real time.</p>
          ) : (
            <div className="live-content">
              {liveExtraction.pet.name && (
                <div className="live-section">
                  <h4>Pet</h4>
                  <p><strong>{liveExtraction.pet.name}</strong> — {liveExtraction.pet.breed}, {liveExtraction.pet.age}</p>
                </div>
              )}

              {liveExtraction.services.length > 0 && (
                <div className="live-section">
                  <h4>Service</h4>
                  <p>{state.service?.label}</p>
                  {liveExtraction.services[0].startDate && (
                    <p className="live-detail">📅 {liveExtraction.services[0].startDate}{liveExtraction.services[0].checkInTime ? ` at ${liveExtraction.services[0].checkInTime}` : ''}</p>
                  )}
                </div>
              )}

              {liveExtraction.behavioralConcerns.length > 0 && (
                <div className="live-section live-flag">
                  <h4>⚠ Behavioral Notes</h4>
                  {liveExtraction.behavioralConcerns.map((c, i) => (
                    <p key={i} className="live-concern">{c}</p>
                  ))}
                </div>
              )}

              {liveExtraction.medications.length > 0 && (
                <div className="live-section">
                  <h4>💊 Medications</h4>
                  {liveExtraction.medications.map((m, i) => (
                    <p key={i}>{m.name}{m.frequency ? ` — ${m.frequency}` : ''}</p>
                  ))}
                </div>
              )}

              {liveExtraction.allergies.length > 0 && (
                <div className="live-section live-flag-low">
                  <h4>🚫 Allergies / Sensitivities</h4>
                  {liveExtraction.allergies.map((a, i) => (
                    <p key={i}>{a}</p>
                  ))}
                </div>
              )}

              {liveExtraction.specialInstructions && (
                <div className="live-section">
                  <h4>📋 Instructions</h4>
                  <p>{liveExtraction.specialInstructions}</p>
                </div>
              )}
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}
