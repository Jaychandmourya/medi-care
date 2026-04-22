import { X, Calendar, Mail, MapPin, User, Activity, Phone, FileText, Heart, CreditCard, Pill, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { fetchAppointmentsByPatientId } from "@/features/appointment/appointmentThunk";
import { fetchVitalsByPatientId } from "@/features/vital/VitalThunk";
import { loadPrescriptionHistory } from "@/features/prescription/prescriptionThunk";
import type { PatientDetailsDialogProps } from '@/types/patients/patientType'
import type { Appointment } from '@/types/appointment/appointmentType'
import type { Vitals} from '@/types/vitals/vitalsType'
import type { Prescription, Medicine } from '@/types/prescription/prescriptionType'
import FormDialog from "@/components/common/dialog/FormDialog";
import { Button } from "@/components/common/Button";

interface BillingRecord {
  id: string;
  patientId: string;
  date: string;
  description: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  dueDate?: string;
}

const PatientDetails = ({
  isOpen,
  onClose,
  selectedPatient,
  calculateAge
}: PatientDetailsDialogProps) => {
  const [activeTab, setActiveTab] = useState('overview');
  const dispatch = useAppDispatch();
  const [patientAppointments, setPatientAppointments] = useState<Appointment[]>([]);
  const [patientVitals, setPatientVitals] = useState<Vitals[]>([]);
  const [patientPrescriptions, setPatientPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(false);

  // Get prescription history from Redux store
  const prescriptionHistory = useAppSelector((state) => state.prescriptions?.prescriptionHistory || []);

  // Fetch patient-specific data when dialog opens or patient changes
  useEffect(() => {
    if (isOpen && selectedPatient) {
      const patientId = selectedPatient.id;

      const fetchData = async () => {
        setLoading(true);
        try {
          const [appointmentsData, vitalsData] = await Promise.all([
            dispatch(fetchAppointmentsByPatientId(patientId)).unwrap(),
            dispatch(fetchVitalsByPatientId(patientId)).unwrap(),
            dispatch(loadPrescriptionHistory()).unwrap()
          ]);
          console.log('patientId', patientId)
          console.log('appointmentsData', appointmentsData)
          setPatientAppointments(appointmentsData);
          setPatientVitals(vitalsData);
        } catch (error) {
          console.error('Error fetching patient data:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [isOpen, selectedPatient, dispatch]);

  // Filter prescriptions by patient ID whenever prescriptionHistory or selectedPatient changes
  useEffect(() => {
    if (selectedPatient && prescriptionHistory.length > 0) {
      const filtered = prescriptionHistory.filter(
        (prescription: Prescription) => prescription.patientId === selectedPatient.patientId
      );
      setPatientPrescriptions(filtered);
    } else {
      setPatientPrescriptions([]);
    }
  }, [prescriptionHistory, selectedPatient]);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'prescriptions', label: 'Prescriptions', icon: Pill },
    { id: 'vitals', label: 'Vitals', icon: Heart },
    { id: 'billing', label: 'Billing', icon: CreditCard }
  ];

  // Use real data or fallback to empty arrays
  const displayAppointments = patientAppointments;

  // Use real vitals data or fallback to empty array
  const displayVitals = patientVitals;

  // Real prescriptions filtered by patient ID
  const displayPrescriptions = patientPrescriptions;

  const mockBilling: BillingRecord[] = selectedPatient ? [
    {
      id: '1',
      patientId: selectedPatient.id,
      date: '2024-01-15',
      description: 'Consultation Fee - Cardiology',
      amount: 150,
      status: 'paid',
      dueDate: '2024-01-30'
    },
    {
      id: '2',
      patientId: selectedPatient.id,
      date: '2024-02-10',
      description: 'Lab Tests',
      amount: 200,
      status: 'pending',
      dueDate: '2024-02-25'
    }
  ] : [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'scheduled':
      case 'confirmed':
      case 'pending':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'no_show':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Custom gradient header with patient avatar
  const customHeader = selectedPatient ? (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gray-400 rounded-full flex items-center justify-center overflow-hidden ring-2 ring-white/30">
            {selectedPatient.photo ? (
              <img
                src={selectedPatient.photo}
                alt={selectedPatient.name || 'Patient'}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-white text-2xl font-bold">
                {(selectedPatient.name || 'P').charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-black">{selectedPatient.name || 'Unknown'}</h2>
            <p className="text-blue-500">Patient Details</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="w-10 h-10 rounded-full hover:bg-gray-100 transition-all duration-200 hover:scale-105 flex-shrink-0 ml-4"
        >
          <span className="text-gray-400 hover:text-gray-600 text-xl">✕</span>
      </Button>
      </div>
    </div>
  ) : null;

  return (
    <FormDialog
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-4xl"
      maxHeight="max-h-[90vh]"
      showFooter={false}
      showCloseButton={false}
      header={customHeader}
    >
      {/* Tabs Navigation */}
      <div className="border-b border-gray-200 bg-white -mx-6 px-6 -mt-2 pb-2">
        <div className="flex space-x-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center cursor-pointer space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="pt-6 min-h-[400px]">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-blue-600" />
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Patient ID</p>
                  <p className="font-semibold text-gray-800">{selectedPatient?.patientId || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="font-semibold text-gray-800">{selectedPatient?.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Gender</p>
                  <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800">
                    {selectedPatient?.gender}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Age</p>
                  <p className="font-semibold text-gray-800">{selectedPatient?.dob ? calculateAge(selectedPatient.dob) : '-'} years</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date of Birth</p>
                  <p className="font-semibold text-gray-800">{selectedPatient?.dob ? new Date(selectedPatient.dob).toLocaleDateString() : '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Blood Group</p>
                  <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-red-100 text-red-800">
                    {selectedPatient?.bloodGroup}
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
                    {selectedPatient?.phone}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-semibold text-gray-800 flex items-center">
                    <Mail className="w-4 h-4 mr-2 text-gray-400" />
                    {selectedPatient?.email || 'N/A'}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="font-semibold text-gray-800 flex items-center">
                    <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                    {selectedPatient?.address || 'N/A'}
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
                  <p className="font-semibold text-gray-800">{selectedPatient?.allergies || 'None recorded'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Chronic Conditions</p>
                  <p className="font-semibold text-gray-800">{selectedPatient?.conditions || 'None recorded'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Current Medications</p>
                  <p className="font-semibold text-gray-800">{selectedPatient?.medications || 'None recorded'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Emergency Contact</p>
                  <p className="font-semibold text-gray-800">{selectedPatient?.contactName || 'N/A'} ({selectedPatient?.emergencyPhone || 'N/A'})</p>
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
                    {selectedPatient?.createdAt ? new Date(selectedPatient.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Last Updated</p>
                  <p className="font-semibold text-gray-800">
                    {selectedPatient?.updatedAt ? new Date(selectedPatient.updatedAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'appointments' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-blue-600" />
              Appointment History
            </h3>
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">
                          Loading appointments...
                        </td>
                      </tr>
                    ) : displayAppointments.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">
                          No appointments found for this patient
                        </td>
                      </tr>
                    ) : (
                      displayAppointments.map((appointment) => (
                        <tr key={appointment.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {new Date(appointment.date).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">{appointment.slot}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{appointment.doctorId || 'Not assigned'}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{appointment.department}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{appointment.reason}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                              {appointment.status.replace('_', ' ')}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'prescriptions' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Pill className="w-5 h-5 mr-2 text-green-600" />
              Prescriptions
            </h3>
            {loading ? (
              <div className="text-center py-8 text-gray-500">
                Loading prescriptions...
              </div>
            ) : displayPrescriptions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No prescriptions found for this patient
              </div>
            ) : (
              <div className="space-y-4">
                {displayPrescriptions.map((prescription) => (
                  <div key={prescription.id} className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-semibold text-gray-900">{prescription.doctorName || prescription.doctorId || 'Unknown Doctor'}</h4>
                        <p className="text-sm text-gray-500">{new Date(prescription.createdAt).toLocaleDateString()}</p>
                      </div>
                      <FileText className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="space-y-3">
                      {prescription.medicines.map((med: Medicine, index: number) => (
                        <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-gray-900">{med.name}</p>
                              <p className="text-sm text-gray-600">{med.dosage} - {med.frequency}</p>
                              <p className="text-sm text-gray-500">Duration: {med.duration}</p>
                              {med.instructions && (
                                <p className="text-sm text-gray-500 mt-1">Instructions: {med.instructions}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      {prescription.generalNotes && (
                        <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                          <p className="text-sm text-yellow-800">
                            <AlertCircle className="w-4 h-4 inline mr-1" />
                            {prescription.generalNotes}
                          </p>
                        </div>
                      )}
                      {prescription.followUpDate && (
                        <div className="mt-2 text-sm text-gray-600">
                          <strong>Follow-up Date:</strong> {new Date(prescription.followUpDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'vitals' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Heart className="w-5 h-5 mr-2 text-red-600" />
              Vitals History
            </h3>
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Blood Pressure</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pulse</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Temperature</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SpO2</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">
                          Loading vitals...
                        </td>
                      </tr>
                    ) : displayVitals.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">
                          No vitals recorded for this patient
                        </td>
                      </tr>
                    ) : (
                      displayVitals.map((vital) => (
                        <tr key={vital.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {new Date(vital.recordedAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">{vital.bp}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{vital.pulse} bpm</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{vital.temp}°F</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{vital.spo2}%</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'billing' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <CreditCard className="w-5 h-5 mr-2 text-purple-600" />
              Billing Records
            </h3>
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {mockBilling.map((bill) => (
                      <tr key={bill.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {new Date(bill.date).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">{bill.description}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900">${bill.amount}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {bill.dueDate ? new Date(bill.dueDate).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(bill.status)}`}>
                            {bill.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </FormDialog>
  );
};

export default PatientDetails;