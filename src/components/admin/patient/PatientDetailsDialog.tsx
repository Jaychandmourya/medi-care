import { X, Calendar, Mail, MapPin, User, Activity, Phone } from "lucide-react";

interface Patient {
  id: string;
  name: string;
  phone: string;
  gender: string;
  bloodGroup: string;
  dob: string;
  patientId?: string;
  email?: string;
  address?: string;
  allergies?: string;
  chronicConditions?: string;
  medications?: string;
  emergencyContact?: string;
  photo?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface PatientDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPatient: Patient | null;
  calculateAge: (dob: string) => number;
}

const PatientDetailsDialog = ({ isOpen, onClose, selectedPatient, calculateAge }: PatientDetailsDialogProps) => {
  if (!isOpen || !selectedPatient) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/60 bg-opacity-50 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />

        {/* Dialog Panel */}
        <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
          {/* Fixed Header */}
          <div className="sticky top-0 z-10 bg-linear-to-r from-blue-600 to-indigo-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white text-black bg-opacity-20 rounded-full flex items-center justify-center overflow-hidden">
                  {selectedPatient.photo ? (
                    <img
                      src={selectedPatient.photo}
                      alt={selectedPatient.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-black text-2xl font-bold">
                      {selectedPatient.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{selectedPatient.name}</h2>
                  <p className="text-blue-100">Patient Details</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 cursor-pointer hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors hover:text-black"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Basic Information */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-blue-600" />
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Patient ID</p>
                  <p className="font-semibold text-gray-800">{selectedPatient.patientId || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="font-semibold text-gray-800">{selectedPatient.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Gender</p>
                  <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800">
                    {selectedPatient.gender}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Age</p>
                  <p className="font-semibold text-gray-800">{calculateAge(selectedPatient.dob)} years</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date of Birth</p>
                  <p className="font-semibold text-gray-800">{new Date(selectedPatient.dob).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Blood Group</p>
                  <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-red-100 text-red-800">
                    {selectedPatient.bloodGroup}
                  </span>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Phone className="w-5 h-5 mr-2 text-green-600" />
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Phone Number</p>
                  <p className="font-semibold text-gray-800 flex items-center">
                    <Phone className="w-4 h-4 mr-2 text-gray-400" />
                    {selectedPatient.phone}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-semibold text-gray-800 flex items-center">
                    <Mail className="w-4 h-4 mr-2 text-gray-400" />
                    {selectedPatient.email || 'N/A'}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="font-semibold text-gray-800 flex items-center">
                    <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                    {selectedPatient.address || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Medical Information */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-red-600" />
                Medical Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Allergies</p>
                  <p className="font-semibold text-gray-800">{selectedPatient.allergies || 'None recorded'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Chronic Conditions</p>
                  <p className="font-semibold text-gray-800">{selectedPatient.chronicConditions || 'None recorded'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Current Medications</p>
                  <p className="font-semibold text-gray-800">{selectedPatient.medications || 'None recorded'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Emergency Contact</p>
                  <p className="font-semibold text-gray-800">{selectedPatient.emergencyContact || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Registration Information */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-purple-600" />
                Registration Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Registration Date</p>
                  <p className="font-semibold text-gray-800">
                    {selectedPatient.createdAt ? new Date(selectedPatient.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Last Updated</p>
                  <p className="font-semibold text-gray-800">
                    {selectedPatient.updatedAt ? new Date(selectedPatient.updatedAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDetailsDialog;