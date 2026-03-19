import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { fetchPatients, deletePatient } from "@/features/patient/patientSlice";
import type{ RootState } from "@/app/store";

export default function PatientList() {
  const dispatch = useAppDispatch();
  const patients = useAppSelector((state: RootState) => state.patients.list);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(fetchPatients() as any);
  }, [dispatch]);

  const filtered = patients.filter(
    (p) =>
      p.isActive &&
      (p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.phone.includes(search))
  );

  const perPage = 5;
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold">Patients</h1>
        <button className="btn-primary">+ Add Patient</button>
      </div>

      {/* Search */}
      <input
        placeholder="Search by name or phone"
        className="input border border-gray-300 rounded-lg p-2 text-black"
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Table */}
      <div className="bg-white rounded-2xl shadow">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Blood</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {paginated.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{p.phone}</td>
                <td>{p.bloodGroup}</td>
                <td>
                  <button className="text-blue-500">Edit</button>
                  <button
                    onClick={() => dispatch(deletePatient(p.id) as any)}
                    className="text-red-500 ml-2"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex gap-2">
        {[...Array(Math.ceil(filtered.length / perPage))].map((_, i) => (
          <button key={i} onClick={() => setPage(i + 1)}>
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}