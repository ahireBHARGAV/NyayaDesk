import { Badge, Button, Icon, PageTitle } from "../../App";

export function Notifications({ clear, authority }) {
  clear();
  const data = authority
    ? [
        "Judge C marked absent for Courtroom 3.",
        "Replacement Judge required.",
        "Case ABC assigned to Courtroom 1.",
      ]
    : [
        "Hearing tomorrow — Case ABC vs XYZ",
        "Filing deadline approaching — Case DEF vs GHI",
        "Courtroom 3 schedule has been updated.",
      ];
  const legacyData = authority
    ? [
        "Judge C marked absent for Courtroom 3.",
        "Replacement Judge required.",
        "Case ABC assigned to Courtroom 1.",
      ]
    : [
        "Hearing tomorrow Ã¢â‚¬â€ Case ABC vs XYZ",
        "Filing deadline approaching Ã¢â‚¬â€ Case DEF vs GHI",
        "Courtroom 3 schedule has been updated.",
      ];
  return (
    <>
      <PageTitle
        title="Notifications"
        sub="Updates that need your attention."
      />
      <section className="panel notifications">
        {data.map((x, i) => (
          <article>
            <span>
              <Icon
                name={
                  i === 0 ? "BellRing" : i === 1 ? "AlertCircle" : "Landmark"
                }
              />
            </span>
            <div>
              <h3>
                {i === 0
                  ? "Hearing Reminder"
                  : i === 1
                    ? "Action Required"
                    : "Court Update"}
              </h3>
              <p>{x}</p>
              <small>
                {i + 1} hour{i ? "s" : ""} ago
              </small>
            </div>
            <Button variant="small secondary">
              {i === 1 ? "Mark as Read" : "View Case"}
            </Button>
          </article>
        ))}
      </section>
    </>
  );
}
