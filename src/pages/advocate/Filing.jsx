import { useState } from "react";
import { Badge, Button, Icon, PageTitle } from "../../App";

export function Filing() {
  const [status, setStatus] = useState("Draft");
  const submit = async () => {
    await fetch((import.meta.env.VITE_API_URL || "") + "/api/filings/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        case: "ABC/2026",
        type: "Reply",
        status: "Submitted",
      }),
    });
    setStatus("Submitted");
  };
  return (
    <>
      <PageTitle
        title="e-Filing"
        sub="Prepare, validate and submit approved court forms."
      />
      <div className="workflow">
        {["Prepare", "Upload", "Validate", "Submit", "Track"].map((x, i) => (
          <div className={status === "Draft" && i === 0 ? "current" : ""}>
            <b>{i + 1}</b>
            {x}
          </div>
        ))}
      </div>
      <section className="panel form">
        <h2>Prepare a filing</h2>
        <label>
          Select Case
          <select>
            <option>ABC/2026 Ã¢â‚¬â€ ABC vs XYZ</option>
          </select>
        </label>
        <label>
          Select Filing Type
          <select>
            <option>Reply</option>
            <option>Petition</option>
            <option>Application</option>
            <option>Adjournment-related Form</option>
          </select>
        </label>
        <label>
          Upload Documents
          <div className="upload">
            <Icon name="UploadCloud" />
            <span>
              Drop files here or <u>browse</u>
            </span>
          </div>
        </label>
        <div className="form-actions">
          <Button variant="secondary" onClick={() => setStatus("Draft")}>
            Save Draft
          </Button>
          <Button
            variant="secondary"
            onClick={() => setStatus("Documents Uploaded")}
          >
            Validate
          </Button>
          <Button onClick={submit}>Submit Filing</Button>
        </div>
        <p className="success">
          Current status: <Badge>{status}</Badge>
        </p>
      </section>
    </>
  );
}
