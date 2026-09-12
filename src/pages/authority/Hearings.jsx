import { PageTitle } from "../../App";
export function Hearings() {
  // Keeping this simple for MVP as hearings are mostly managed inside CaseDetail
  return (
    <>
      <PageTitle title="Hearings" sub="Global hearing schedule" />
      <section className="panel">
        <p className="text-secondary">Global hearing view is simplified for MVP. Please go to <b>Cases</b> to schedule and manage hearings for individual cases.</p>
      </section>
    </>
  );
}
