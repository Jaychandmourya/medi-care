export default function StepEmergency({ data, onChange }) {
  return (
    <div className="space-y-4">

      <input
        value={data.contactName || ""}
        onChange={(e) =>
          onChange({ ...data, contactName: e.target.value })
        }
        placeholder="Contact Name"
        className="input"
      />

      <input
        value={data.emergencyPhone || ""}
        onChange={(e) =>
          onChange({ ...data, emergencyPhone: e.target.value })
        }
        placeholder="Emergency Phone"
        className="input"
      />

    </div>
  );
}