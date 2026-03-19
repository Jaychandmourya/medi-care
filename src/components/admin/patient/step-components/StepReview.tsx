export default function StepReview({ data }) {
  return (
    <div className="space-y-2">

      <p><b>Name:</b> {data.name}</p>
      <p><b>Phone:</b> {data.phone}</p>
      <p><b>Gender:</b> {data.gender}</p>
      <p><b>Allergies:</b> {data.allergies}</p>

    </div>
  );
}