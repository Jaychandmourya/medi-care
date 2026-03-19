export default function StepMedical({ data, onChange }) {
  return (
    <div className="space-y-4">

      <textarea
        value={data.allergies || ""}
        onChange={(e) => onChange({ ...data, allergies: e.target.value })}
        placeholder="Allergies"
        className="input"
      />

      <textarea
        value={data.conditions || ""}
        onChange={(e) => onChange({ ...data, conditions: e.target.value })}
        placeholder="Conditions"
        className="input"
      />

    </div>
  );
}