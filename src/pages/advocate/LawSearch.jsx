import { useState } from "react";
import { Badge, Button, Icon, PageTitle } from "../../App";

export function LawSearch() {
  const [searched, setSearched] = useState(false);
  return (
    <>
      <PageTitle
        title="Case Law Search"
        sub="Find relevant case laws with natural-language search."
      />
      <section className="law-hero">
        <h2>What legal question are you researching?</h2>
        <textarea placeholder="Describe your legal question or search for a case...">
          Cases related to delay in filing an appeal due to sufficient cause
        </textarea>
        <Button onClick={() => setSearched(true)}>
          <Icon name="Search" /> Search Case Laws
        </Button>
      </section>
      {searched && (
        <section className="law-results">
          <p className="eyebrow">SUGGESTED RESULTS</p>
          {[
            [
              "Collector, Land Acquisition v. Mst. Katiji",
              "Supreme Court",
              "1987",
              "Limitation Act, Section 5",
              "94%",
            ],
            [
              "N. Balakrishnan v. M. Krishnamurthy",
              "Supreme Court",
              "1998",
              "Limitation Act, Section 5",
              "89%",
            ],
          ].map((x) => (
            <article className="panel">
              <div>
                <h2>{x[0]}</h2>
                <p>
                  {x[1]} Ã‚Â· {x[2]} Ã‚Â· Relevant: {x[3]}
                </p>
                <q>
                  The length of delay is not decisive; acceptability of the
                  explanation is the criterion.
                </q>
              </div>
              <div>
                <Badge>{x[4]} Match</Badge>
                <Button variant="secondary">View Case</Button>
                <button className="link-btn">Save</button>
                <button className="link-btn">Add to Case</button>
              </div>
            </article>
          ))}
        </section>
      )}
    </>
  );
}
