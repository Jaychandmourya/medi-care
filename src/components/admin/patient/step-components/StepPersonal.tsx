export default function StepPersonal({ data, onChange }) {
  return (
    <div className="space-y-4">

      <input
        value={data.name || ""}
        onChange={(e) => onChange({ ...data, name: e.target.value })}
        placeholder="Full Name"
        className="input"
      />

      <input
        type="date"
        value={data.dob || ""}
        onChange={(e) => onChange({ ...data, dob: e.target.value })}
        className="input"
      />

      <select
        value={data.gender || ""}
        onChange={(e) => onChange({ ...data, gender: e.target.value })}
        className="input"
      >
        <option value="">Gender</option>
        <option>Male</option>
        <option>Female</option>
      </select>

      <input
        value={data.phone || ""}
        onChange={(e) => onChange({ ...data, phone: e.target.value })}
        placeholder="Phone"
        className="input"
      />

    </div>
  );
}