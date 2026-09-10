import { Badge, Button, Icon, PageTitle } from "../../App";

export function Documents() {
  return (
    <>
      <PageTitle
        title="Documents"
        sub="All your case documents in one secure place."
        action={
          <Button>
            <Icon name="Upload" /> Upload Document
          </Button>
        }
      />
      <section className="panel">
        <div className="filters">
          <div className="top-search">
            <Icon name="Search" />
            <input placeholder="Search documents..." />
          </div>
          <Button variant="secondary">
            <Icon name="SlidersHorizontal" /> Filters
          </Button>
        </div>
        <div className="data-table doc-table">
          <div className="tr th">
            <span>Document Name</span>
            <span>Case</span>
            <span>Date</span>
            <span>Status</span>
            <span>Action</span>
          </div>
          {[
            ["Reply to petition.pdf", "ABC vs XYZ", "30 Aug 2026", "Uploaded"],
            ["Evidence bundle.pdf", "DEF vs GHI", "29 Aug 2026", "Verified"],
            ["Hearing notes.docx", "JKL vs MNO", "26 Aug 2026", "Draft"],
          ].map((x) => (
            <div className="tr">
              <strong>
                <Icon name="FileText" size={16} /> {x[0]}
              </strong>
              <span>{x[1]}</span>
              <span>{x[2]}</span>
              <Badge>{x[3]}</Badge>
              <span>
                <button className="icon-btn">
                  <Icon name="Eye" />
                </button>
                <button className="icon-btn">
                  <Icon name="Download" />
                </button>
              </span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
