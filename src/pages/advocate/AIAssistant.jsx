import { useState } from "react";
import { Button, Icon, PageTitle } from "../../App";

export function AIAssistant() {
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState(false);
  return (
    <>
      <PageTitle
        title="AI Document Assistant"
        sub="Create a starting draft from case information and approved templates."
      />
      <div className="ai-layout">
        <section className="panel ai-steps">
          {[
            "Select Case",
            "Select Document / Form",
            "Review Case Information",
            "Generate Draft",
            "Review Draft",
          ].map((x, i) => (
            <button
              className={
                step === i + 1 ? "current" : step > i + 1 ? "done" : ""
              }
              onClick={() => setStep(i + 1)}
            >
              <b>{i + 1}</b>
              {x}
            </button>
          ))}
        </section>
        <section className="panel ai-main">
          {!draft ? (
            <>
              <p className="eyebrow">STEP {step} OF 5</p>
              <h2>
                {
                  [
                    "Select a case",
                    "Select a document or form",
                    "Review retrieved case information",
                    "Generate your draft",
                    "Review your draft",
                  ][step - 1]
                }
              </h2>
              {step === 1 && (
                <select>
                  <option>ABC/2026 — ABC vs XYZ</option>
                </select>
              )}
              {false && step === 1 && (
                <select>
                  <option>ABC/2026 — ABC vs XYZ</option>
                  <option>ABC/2026 Ã¢â‚¬â€ ABC vs XYZ</option>
                </select>
              )}
              {step === 2 && (
                <div className="template-options">
                  {[
                    "Petition",
                    "Reply",
                    "Application",
                    "Adjournment-related Form",
                    "Other Approved Template",
                  ].map((x) => (
                    <button>{x}</button>
                  ))}
                </div>
              )}
              {step === 3 && (
                <div className="review-box">
                  ABC/2026 Ã‚Â· Civil Appeal
                  <br />
                  High Court of Delhi Ã‚Â· Justice A. Mehra
                  <br />
                  Next hearing: 03 September 2026
                </div>
              )}
              {step >= 4 && (
                <div className="generate">
                  <Icon name="Sparkles" />
                  <p>
                    Use the verified case information to prepare a draft for
                    review.
                  </p>
                </div>
              )}
              <Button
                onClick={() =>
                  step === 4 ? setDraft(true) : setStep(Math.min(4, step + 1))
                }
              >
                {step === 4 ? "Generate Draft" : "Continue"}{" "}
                <Icon name="ArrowRight" size={16} />
              </Button>
            </>
          ) : (
            <>
              <p className="eyebrow">DRAFT FOR REVIEW</p>
              <h2>Reply Ã¢â‚¬â€ ABC vs XYZ</h2>
              <div className="draft">
                IN THE HIGH COURT OF DELHI
                <br />
                <br />
                In the matter of ABC versus XYZ, the respondent respectfully
                submits this reply to the petitionÃ¢â‚¬Â¦
                <br />
                <br />
                The statements made are denied save and except those expressly
                admitted herein.
              </div>
              <p className="ai-warning">
                <Icon name="Info" /> AI-generated draft. Please review and
                verify before submission. The advocate remains responsible for
                all submitted content.
              </p>
              <div className="form-actions">
                <Button variant="secondary">Edit</Button>
                <Button variant="secondary" onClick={() => setDraft(false)}>
                  Regenerate
                </Button>
                <Button>Save Draft</Button>
                <Button variant="secondary">
                  <Icon name="Download" /> Download
                </Button>
              </div>
            </>
          )}
        </section>
      </div>
    </>
  );
}
