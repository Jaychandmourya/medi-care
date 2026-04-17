import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { getAllPatients } from "@/features/patient/patientThunk";
import type { RootState } from "@/app/store";
import type { PatientFormData } from "@/schema/patientValidation";
import { Calendar, FileText, Activity, CreditCard, User, ArrowLeft, Edit } from "lucide-react";

export default function PatientProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const patients = useAppSelector((state: RootState) => state.patients.list);

  const [activeTab, setActiveTab] = useState<'overview' | 'appointments' | 'prescriptions' | 'vitals' | 'billing'>('overview');
  const [patient, setPatient] = useState<PatientFormData | null>(null);

  useEffect(() => {
    dispatch(getAllPatients());
  }, [dispatch]);

  useEffect(() => {
    if (patients.length > 0 && id) {
      const foundPatient = patients.find(p => p.id === id);
      if (foundPatient && foundPatient.id) {
        setPatient(foundPatient);
      }
    }
  }, [patients, id]);

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

  const formatDate = useCallback((dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }, []);

  const tabs = useMemo(() => [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'prescriptions', label: 'Prescriptions', icon: FileText },
    { id: 'vitals', label: 'Vitals', icon: Activity },
    { id: 'billing', label: 'Billing', icon: CreditCard },
  ], []);

  const handleBack = useCallback(() => {
    navigate('/admin/patients');
  }, [navigate]);

  if (!patient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <p className="text-gray-600">Patient not found</p>
            <button
              onClick={handleBack}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Back to Patients
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 backdrop-blur-sm bg-opacity-95">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBack}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                  {patient.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">{patient.name}</h1>
                  <p className="text-gray-600">ID: {patient.patientId}</p>
                </div>
              </div>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Edit className="w-4 h-4" />
              Edit Patient
            </button>
          </div>
        </div>

        {/* Patient Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 backdrop-blur-sm bg-opacity-95">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Age</p>
                <p className="font-medium">{calculateAge(patient.dob)} years</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Gender</p>
                <p className="font-medium">{patient.gender}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Blood Group</p>
                <p className="font-medium">{patient.bloodGroup || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Date of Birth</p>
                <p className="font-medium">{formatDate(patient.dob)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 backdrop-blur-sm bg-opacity-95">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Contact Information</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium">{patient.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{patient.email || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Address</p>
                <p className="font-medium">
                  {patient.address ? `${patient.address}, ${patient.city || ''}, ${patient.state || ''} ${patient.pin || ''}` : 'Not specified'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 backdrop-blur-sm bg-opacity-95">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Emergency Contact</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Contact Name</p>
                <p className="font-medium">{patient.contactName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Relationship</p>
                <p className="font-medium">{patient.relationship || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Emergency Phone</p>
                <p className="font-medium">{patient.emergencyPhone}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg backdrop-blur-sm bg-opacity-95">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Medical Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Known Allergies</h4>
                      <p className="text-gray-600 bg-red-50 p-3 rounded-lg">{patient.allergies}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Chronic Conditions</h4>
                      <p className="text-gray-600 bg-blue-50 p-3 rounded-lg">{patient.conditions}</p>
                    </div>
                    {patient.surgeries && (
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Past Surgeries</h4>
                        <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{patient.surgeries}</p>
                      </div>
                    )}
                    {patient.medications && (
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Current Medications</h4>
                        <p className="text-gray-600 bg-green-50 p-3 rounded-lg">{patient.medications}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'appointments' && (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-800 mb-2">No Appointments</h3>
                <p className="text-gray-600">Appointments will be displayed here once scheduled.</p>
              </div>
            )}

            {activeTab === 'prescriptions' && (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-800 mb-2">No Prescriptions</h3>
                <p className="text-gray-600">Prescriptions will be displayed here once prescribed.</p>
              </div>
            )}

            {activeTab === 'vitals' && (
              <div className="text-center py-12">
                <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-800 mb-2">No Vitals Recorded</h3>
                <p className="text-gray-600">Vital signs will be displayed here once measured.</p>
              </div>
            )}

            {activeTab === 'billing' && (
              <div className="text-center py-12">
                <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-800 mb-2">No Billing Records</h3>
                <p className="text-gray-600">Billing information will be displayed here once available.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
