import { useEffect, useState, useMemo, useCallback, lazy, Suspense } from "react";
import toast from "react-hot-toast";

// Import icons file
import { Plus, Search, Filter, Edit, Trash2, Eye } from "lucide-react";

// Import UI components
import ConfirmationDialog from "@/components/common/dialog/ConfirmationDialog";
import { FormButton } from "@/components/common/FormButton";
import { Label } from "@/components/common/Label";
import FormField from "@/components/common/FormField";
import FormDatePicker from "@/components/common/FormDatePicker";
import ThreeDotMenu from "@/components/common/ThreeDotMenu";
import Pagination from "@/components/common/Pagination";

// Import Types files
import type { RootState } from "@/app/store";
import type { Patient } from '@/types/patients/patientType'

// Import utils file
import { ROLE_THEME } from "@/utils/theme";

// Import dispatch and selector for redux
import { useAppDispatch, useAppSelector } from "@/app/hooks"

// Import Thunk file for redux
import { getAllPatients, deletePatient } from "@/features/patient/patientThunk";

// Lazy loaded components
const AddEditPatient = lazy(() => import('@/components/admin/patient/AddEditPatient'));
const PatientDetails = lazy(() => import('@/components/admin/patient/PatientDetails'));

export default function PatientList() {
  // Redux dispatch and selector
  const dispatch = useAppDispatch();
  const patients = useAppSelector((state: RootState) => state.patients.list);
  const user = useAppSelector((state: RootState) => state.auth.user);

  // Get theme colors based on user role
  const themeColors = user ? ROLE_THEME[user.role] : ROLE_THEME.receptionist;

  // Dialog states
  const [isOpenDialog, setIsOpenDialog] = useState<boolean>(false);
  const [isOpenDelete, setIsOpenDelete] = useState<boolean>(false);
  const [isOpenViewDialog, setIsOpenViewDialog] = useState<boolean>(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [search, setSearch] = useState<string>("");
  const [page, setPage] = useState<number>(1);

  // Filter states
  const [genderFilter, setGenderFilter] = useState<string>("");
  const [bloodGroupFilter, setBloodGroupFilter] = useState<string>("");
  const [ageRange, setAgeRange] = useState<{ min: string; max: string }>({ min: "", max: "" });
  const [registrationDateRange, setRegistrationDateRange] = useState<{ start: string; end: string }>({ start: "", end: "" });
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const perPage = 10;

  // Get all patients on component mount
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
        (p.name?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
        (p.phone?.includes(search) ?? false) ||
        p.patientId?.toLowerCase().includes(search.toLowerCase()) ||
        p.bloodGroup?.toLowerCase().includes(search.toLowerCase());

      if (!searchMatch) return false;

      // Gender filter
      if (genderFilter && p.gender !== genderFilter) return false;

      // Blood group filter
      if (bloodGroupFilter && p.bloodGroup !== bloodGroupFilter) return false;

      // Age range filter
      if (ageRange.min || ageRange.max) {
        if (!p.dob) return false;
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


  // Pagination Filter
  const paginated = useMemo(() => {
    return filtered.slice((page - 1) * perPage, page * perPage);
  }, [filtered, page]);

  //  Edit and open edit patients dialog
  const handleEdit = useCallback((patient: Patient) => {
    if (patient) {
      setSelectedPatient(patient);
      setIsOpenDialog(true);
    }
  }, []);

  // Open delete confirmation dialog
  const handleDelete = useCallback((patient: Patient) => {
    if (patient) {
      setSelectedPatient(patient);
      setIsOpenDelete(true);
    }
  }, []);

  // Open View detail Dialog
  const handleView = useCallback((patient: Patient) => {
    if (patient) {
      setSelectedPatient(patient);
      setIsOpenViewDialog(true);
    }
  }, []);


  // Confirmation delete patient data
  const confirmDelete = useCallback(() => {
    if (selectedPatient && selectedPatient.id) {
      const loadingToast = toast.loading('Deleting patient...');

      dispatch(deletePatient(selectedPatient.id))
        .then(() => {
          toast.success('Patient deleted successfully!', { id: loadingToast });
        })
        .catch((error: Error) => {
          toast.error('Failed to delete patient', { id: loadingToast });
          console.error('Delete error:', error);
        });

      setIsOpenDelete(false);
      setSelectedPatient(null);
    }
  }, [selectedPatient, dispatch]);

  //  Clear filter
  const clearFilters = useCallback(() => {
    setGenderFilter("");
    setBloodGroupFilter("");
    setAgeRange({ min: "", max: "" });
    setRegistrationDateRange({ start: "", end: "" });
    setSearch("");
    setPage(1);
  }, []);

  return (
    <div className="min-h-screen">
      <div className="space-y-6">

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 backdrop-blur-sm bg-opacity-95">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className={`text-2xl font-bold ${themeColors.text}`}>
                Patients
              </h1>
              <p className="text-gray-600 mt-1">Manage your patient records</p>
            </div>
            <FormButton
              onClick={() => setIsOpenDialog(true)}
              className={`flex items-center gap-2 ${themeColors.button}`}
            >
              <Plus className="w-5 h-5" />
              Add Patient
            </FormButton>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 backdrop-blur-sm bg-opacity-95 space-y-4">
          {/* Search Bar */}
          <div className="flex flex-wrap justify-between gap-y-2 ">
            <FormField
              type="text"
              placeholder="Search by name, phone, patient ID, or blood group..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={Search}
              iconPosition="left"
              className="w-full sm:w-100 xl:w-175"
            />

            {/* Filter Toggle */}
            <div className="flex w-full md:w-fit flex-wrap gap-2 justify-between items-center">
              <FormButton
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center w-full md:w-fit gap-2 ${themeColors.text}`}
              >
                <Filter className="w-3 h-3" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </FormButton>
              {(genderFilter || bloodGroupFilter || ageRange.min || ageRange.max || registrationDateRange.start || registrationDateRange.end) && (
                <FormButton
                  variant="outline"
                  onClick={clearFilters}
                  className="text-red-600 w-full md:w-fit hover:text-red-800 text-base"
                >
                  Clear All Filters
                </FormButton>
              )}
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
              {/* Gender Filter */}
              <div className="space-y-2">
                <Label>Gender</Label>
                <FormField
                  as="select"
                  value={genderFilter}
                  onChange={(e) => setGenderFilter(e.target.value)}
                >
                  <option value="">All Genders</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </FormField>
              </div>

              {/* Blood Group Filter */}
              <div className="space-y-2">
                <Label>Blood Group</Label>
                <FormField
                  as="select"
                  value={bloodGroupFilter}
                  onChange={(e) => setBloodGroupFilter(e.target.value)}
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
                </FormField>
              </div>

              {/* Age Range Filter */}
              <div>
                <Label className="mb-1.5">Age Range</Label>
                <div className="flex gap-2">
                  <FormField
                    type="number"
                    placeholder="Min"
                    value={ageRange.min}
                    min={0}
                    onKeyDown={(e) => { if (e.key === '-') e.preventDefault(); }}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || parseInt(value) >= 0) {
                        setAgeRange(prev => ({ ...prev, min: value }));
                      }
                    }}
                    className="flex-1"
                  />
                  <FormField
                    type="number"
                    placeholder="Max"
                    value={ageRange.max}
                    min={0}
                    onKeyDown={(e) => { if (e.key === '-') e.preventDefault(); }}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || parseInt(value) >= 0) {
                        setAgeRange(prev => ({ ...prev, max: value }));
                      }
                    }}
                    className="flex-1"
                  />
                </div>
              </div>

              {/* Registration Date Range Filter */}
              <div>
                <Label className="mb-1.5">Registration Date</Label>
                <div className="flex gap-2">
                  <FormDatePicker
                    value={registrationDateRange.start}
                    onChange={(value) => setRegistrationDateRange(prev => ({ ...prev, start: value }))}
                    placeholder="Start date"
                    className="flex-1"
                    disableFutureDates
                  />
                  <FormDatePicker
                    value={registrationDateRange.end}
                    onChange={(value) => setRegistrationDateRange(prev => ({ ...prev, end: value }))}
                    placeholder="End date"
                    className="flex-1"
                    disableFutureDates
                    position="right"
                    minDate={registrationDateRange.start}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Responsive Table */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 bg-opacity-95 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {search ? 'No patients found' : 'No patients in system'}
            </h3>
            <p className="text-gray-600">
              {search
                ? 'Try adjusting your search terms or filters'
                : 'Add patients to get started'
              }
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden bg-opacity-95">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px]">
                <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Patient
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Gender
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Blood Group
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Age
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginated.map((p) => (
                    p.id && (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold overflow-hidden">
                            {p.photo ? (
                              <img src={p.photo} alt={p.name || 'Patient'} className="w-full h-full object-cover" />
                            ) : (
                              <span>{(p.name || 'P').charAt(0).toUpperCase()}</span>
                            )}
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-semibold text-gray-900">
                              {p.name || 'Unknown'}
                            </div>
                            <div className="text-xs text-gray-500 font-mono">
                              {p.patientId}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-700">{p.phone || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {p.gender}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          {p.bloodGroup}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-700">{p.dob ? calculateAge(p.dob) : '-'} years</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <ThreeDotMenu
                          items={[
                            {
                              label: 'View',
                              onClick: () => handleView(p),
                              icon: <Eye className="w-4 h-4" />,
                              className: 'text-blue-600 hover:text-blue-900'
                            },
                            {
                              label: 'Edit',
                              onClick: () => handleEdit(p),
                              icon: <Edit className="w-4 h-4" />,
                              className: 'text-green-600 hover:text-green-900'
                            },
                            {
                              label: 'Delete',
                              onClick: () => handleDelete(p),
                              icon: <Trash2 className="w-4 h-4" />,
                              className: 'text-red-600 hover:text-red-900'
                            }
                          ]}
                        />
                      </td>
                    </tr>
                    )
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination */}
        <Pagination
          page={page}
          setPage={setPage}
          totalItems={filtered.length}
          perPage={perPage}
          itemName="patients"
        />

        {/* Add Patient Dialog */}
        <Suspense fallback={<div>Loading...</div>}>
          <AddEditPatient
            isOpen={isOpenDialog}
            onClose={() => {
              setIsOpenDialog(false);
              setSelectedPatient(null);
            }}
            editData={selectedPatient as unknown as Partial<Patient> || undefined}
            titleClass={themeColors.text}
          />
        </Suspense>

        {/* Delete Confirmation Dialog */}
        <ConfirmationDialog
          isOpen={isOpenDelete}
          title="Delete Patient"
          message={`Are you sure you want to delete ${selectedPatient?.name}? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
          onConfirm={confirmDelete}
          onCancel={() => {
            setIsOpenDelete(false);
            setSelectedPatient(null);
          }}
        />

        {/* Patients View Dialog */}
        <Suspense fallback={<div>Loading...</div>}>
          <PatientDetails
            isOpen={isOpenViewDialog}
            onClose={() => { setIsOpenViewDialog(false); setSelectedPatient(null) }}
            selectedPatient={selectedPatient}
            calculateAge={calculateAge}
            titleClass={themeColors.text}
          />
        </Suspense>
      </div>
    </div>
  );
}