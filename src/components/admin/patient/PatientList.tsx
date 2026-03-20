import { useEffect, useState, useMemo, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { getAllPatients, deletePatient } from "@/features/patient/patientThunk";
import type { RootState } from "@/app/store";
import AddPatientDialog from "./AddEditPatientDialog";
import DeleteDialog from "@/components/ui/dialog/DeleteDialog";
import { Button } from "@/components/ui/Button";
import { Plus, Search, Filter, Phone, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react";

export default function PatientList() {
  const dispatch = useAppDispatch();
  const patients = useAppSelector((state: RootState) => state.patients.list);

  const [isOpenDialog, setIsOpenDialog] = useState<boolean>(false);
  const [isOpenDelete, setIsOpenDelete] = useState<boolean>(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [search, setSearch] = useState<string>("");
  const [page, setPage] = useState<number>(1);

  // Filter states
  const [genderFilter, setGenderFilter] = useState<string>("");
  const [bloodGroupFilter, setBloodGroupFilter] = useState<string>("");
  const [ageRange, setAgeRange] = useState<{ min: string; max: string }>({ min: "", max: "" });
  const [registrationDateRange, setRegistrationDateRange] = useState<{ start: string; end: string }>({ start: "", end: "" });
  const [showFilters, setShowFilters] = useState<boolean>(false);

  useEffect(() => {
    dispatch(getAllPatients());
  }, [dispatch]);

  // Calculate age from date of birth
  const calculateAge = useCallback((dob: string): number => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }, []);

  // Filter patients based on search and filter criteria
  const filtered = useMemo(() => {
    return patients.filter((p) => {
      if (!p.isActive) return false;

      // Search filter
      const searchMatch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.phone.includes(search) ||
        p.patientId?.toLowerCase().includes(search.toLowerCase()) ||
        p.bloodGroup?.toLowerCase().includes(search.toLowerCase());

      if (!searchMatch) return false;

      // Gender filter
      if (genderFilter && p.gender !== genderFilter) return false;

      // Blood group filter
      if (bloodGroupFilter && p.bloodGroup !== bloodGroupFilter) return false;

      // Age range filter
      if (ageRange.min || ageRange.max) {
        const patientAge = calculateAge(p.dob);
        if (ageRange.min && patientAge < parseInt(ageRange.min)) return false;
        if (ageRange.max && patientAge > parseInt(ageRange.max)) return false;
      }

      // Registration date range filter
      if (registrationDateRange.start || registrationDateRange.end) {
        const registrationDate = new Date(p.createdAt || "");
        if (registrationDateRange.start && registrationDate < new Date(registrationDateRange.start)) return false;
        if (registrationDateRange.end && registrationDate > new Date(registrationDateRange.end)) return false;
      }

      return true;
    });
  }, [patients, search, genderFilter, bloodGroupFilter, ageRange, registrationDateRange, calculateAge]);

  const perPage = 5;

  const paginated = useMemo(() => {
    return filtered.slice((page - 1) * perPage, page * perPage);
  }, [filtered, page]);

  const handleEdit = useCallback((patient: any) => {
    setSelectedPatient(patient);
    setIsOpenDialog(true);
  }, []);

  const handleDelete = useCallback((patient: any) => {
    setSelectedPatient(patient);
    setIsOpenDelete(true);
  }, []);

  const confirmDelete = useCallback(() => {
    if (selectedPatient) {
      dispatch(deletePatient(selectedPatient.id) as any);
      setIsOpenDelete(false);
      setSelectedPatient(null);
    }
  }, [selectedPatient, dispatch]);

  const clearFilters = useCallback(() => {
    setGenderFilter("");
    setBloodGroupFilter("");
    setAgeRange({ min: "", max: "" });
    setRegistrationDateRange({ start: "", end: "" });
    setSearch("");
    setPage(1);
  }, []);

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 backdrop-blur-sm bg-opacity-95">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Patients
              </h1>
              <p className="text-gray-600 mt-1">Manage your patient records</p>
            </div>
            <Button
              onClick={() => setIsOpenDialog(true)}
              className="flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Patient
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 backdrop-blur-sm bg-opacity-95 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              placeholder="Search by name, phone, patient ID, or blood group..."
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 placeholder-gray-400 transition-all duration-200"
              onChange={(e) => setSearch(e.target.value)}
              value={search}
            />
          </div>

          {/* Filter Toggle */}
          <div className="flex justify-between items-center">
            <Button
              variant="ghost"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
            >
              <Filter className="w-4 h-4" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
              {(genderFilter || bloodGroupFilter || ageRange.min || ageRange.max || registrationDateRange.start || registrationDateRange.end) && (
                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  Active
                </span>
              )}
            </Button>
            {(genderFilter || bloodGroupFilter || ageRange.min || ageRange.max || registrationDateRange.start || registrationDateRange.end) && (
              <Button
                variant="ghost"
                onClick={clearFilters}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Clear All Filters
              </Button>
            )}
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
              {/* Gender Filter */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Gender</label>
                <select
                  value={genderFilter}
                  onChange={(e) => setGenderFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Genders</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Blood Group Filter */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Blood Group</label>
                <select
                  value={bloodGroupFilter}
                  onChange={(e) => setBloodGroupFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Blood Groups</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>

              {/* Age Range Filter */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Age Range</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={ageRange.min}
                    onChange={(e) => setAgeRange(prev => ({ ...prev, min: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={ageRange.max}
                    onChange={(e) => setAgeRange(prev => ({ ...prev, max: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Registration Date Range Filter */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Registration Date</label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={registrationDateRange.start}
                    onChange={(e) => setRegistrationDateRange(prev => ({ ...prev, start: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="date"
                    value={registrationDateRange.end}
                    onChange={(e) => setRegistrationDateRange(prev => ({ ...prev, end: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Responsive Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden backdrop-blur-sm bg-opacity-95">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Patient ID</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Gender</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Blood Group</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Age</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginated.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-mono text-blue-600 font-semibold">{p.patientId}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {p.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-semibold text-gray-900">{p.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-700">
                        <Phone className="w-4 h-4 mr-2 text-gray-400" />
                        {p.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {p.gender}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                        {p.bloodGroup}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-700">{calculateAge(p.dob)} years</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(p)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(p)}
                        className="text-red-600 hover:text-red-800 ml-2"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="bg-white rounded-2xl shadow-lg p-6 backdrop-blur-sm bg-opacity-95">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-600">
              Showing {((page - 1) * perPage) + 1} to {Math.min(page * perPage, filtered.length)} of {filtered.length} patients
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
              <div className="flex items-center px-3 py-2 text-sm text-gray-700">
                Page {page} of {Math.ceil(filtered.length / perPage) || 1}
              </div>
              <Button
                variant="outline"
                onClick={() => setPage(Math.min(Math.ceil(filtered.length / perPage), page + 1))}
                disabled={page >= Math.ceil(filtered.length / perPage)}
                className="flex items-center gap-1"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Dialogs */}
        <AddPatientDialog
          isOpen={isOpenDialog}
          onClose={() => {
            setIsOpenDialog(false);
            setSelectedPatient(null);
          }}
          editData={selectedPatient}
        />

        <DeleteDialog
          isOpenDelete={isOpenDelete}
          onClose={() => {
            setIsOpenDelete(false);
            setSelectedPatient(null);
          }}
          deleteTitle="Delete Patient"
          onConfirm={confirmDelete}
          description={`Are you sure you want to delete ${selectedPatient?.name}? This action will mark the patient as inactive and can be restored later.`}
          itemName={selectedPatient?.name}
        />
      </div>
    </div>
  );
}