import { useState, useCallback, useMemo } from 'react';
import { format } from 'date-fns';

// Import icons file
import { User, Stethoscope, Calendar, Clock, FileText, Phone, Mail } from 'lucide-react';

// Import UI components
import ConfirmationDialog from '@/components/common/dialog/ConfirmationDialog';
import FormDialog from '@/components/common/dialog/FormDialog';
import { Button } from '@/components/common/Button';
import { Label } from '@/components/common/Label';

// Import Types files
import type { RootState } from "@/app/store";
import type { Appointment } from '@/types/appointment/appointmentType'
import type { Patient } from '@/types/patients/patientType'

// Import dispatch and selector for redux
import { useAppDispatch, useAppSelector } from '@/app/hooks';

// Import Thunk file for redux
import { updateAppointment } from '@/features/appointment/appointmentThunk';

const AppointmentDetailModal = ({ showDetailModal, closeShowDetailModal, handleRescheduleModal }: { showDetailModal: boolean, closeShowDetailModal: () => void, handleRescheduleModal: () => void }) => {
  // Redux dispatch
  const dispatch = useAppDispatch();

  // Redux selectors
  const { selectedAppointment } = useAppSelector((state) => state.appointments);
  const patients = useAppSelector((state: RootState) => state.patients.list);
  const { localDoctors } = useAppSelector((state: RootState) => state.doctors)

  // Confirmation dialog state
  const [confirmationDialog, setConfirmationDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Handle close modal
  const handleClose = useCallback(() => {
    closeShowDetailModal()
  }, [closeShowDetailModal]);

  // Handle status change with confirmation
  const handleStatusChange = useCallback((newStatus: Appointment['status']) => {
    if (selectedAppointment && selectedAppointment.status !== newStatus) {
      const currentStatusText = selectedAppointment.status.replace('_', ' ').toUpperCase();
      const newStatusText = newStatus.replace('_', ' ').toUpperCase();

      setConfirmationDialog({
        isOpen: true,
        title: 'Confirm Status Change',
        message: `Are you sure you want to change the appointment status from "${currentStatusText}" to "${newStatusText}"?`,
        onConfirm: () => {
          dispatch(updateAppointment({
            id: selectedAppointment.id,
            updates: { status: newStatus }
          }));
          setConfirmationDialog(prev => ({ ...prev, isOpen: false }));
        },
      });
    }
  }, [selectedAppointment, dispatch]);

  // Helper functions to get patient and doctor data
  const getPatient = useCallback((patientId: string): Patient | undefined => {
    return patients.find(p => p.id === patientId);
  }, [patients]);

  // Helper function to get doctor data
  const getDoctor = useCallback((doctorId: string) => {
    return localDoctors.find(d => d.id === doctorId);
  }, [localDoctors]);

  // Helper function to get status color
  const getStatusColor = useCallback((status: Appointment['status']) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'no_show':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }, []);

  // Get patient and doctor data
  const patient = useMemo(() => selectedAppointment?.patientId ? getPatient(selectedAppointment.patientId) : undefined, [getPatient, selectedAppointment?.patientId]);
  const doctor = useMemo(() => selectedAppointment?.doctorId ? getDoctor(selectedAppointment.doctorId) : undefined, [getDoctor, selectedAppointment?.doctorId]);

  // Handle reschedule click
  const handleRescheduleClick = useCallback(() => {
    handleRescheduleModal()
  }, [handleRescheduleModal]);

  // Handle confirmation cancel
  const handleConfirmationCancel = useCallback(() => {
    setConfirmationDialog(prev => ({ ...prev, isOpen: false }));
  }, []);

  // Get appointment ID
  const appointmentId = useMemo(() =>
    selectedAppointment?.id.slice(-8) || '', [selectedAppointment?.id]);

  // Format date
  const formattedDate = useMemo(() =>
    selectedAppointment ? format(new Date(selectedAppointment.date), 'MMMM d, yyyy') : '',
    [selectedAppointment]);

  // Get status text
  const statusText = useMemo(() =>
    selectedAppointment?.status.replace('_', ' ').toUpperCase() || '',
    [selectedAppointment?.status]);

  // Get status color class
  const statusColorClass = useMemo(() =>
    selectedAppointment ? getStatusColor(selectedAppointment.status) : '',
    [selectedAppointment, getStatusColor]);

  return (
    <>
      <FormDialog
        isOpen={showDetailModal && !!selectedAppointment}
        onClose={handleClose}
        maxWidth="max-w-3xl"
        title="Appointment Details"
        subtitle={`ID: ${appointmentId}`}
        showDefaultButtons={false}
        header={
          <div className="flex items-center space-x-3">
            <Calendar className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                Appointment Details
              </h2>
              <p className="text-gray-500 text-sm mt-1">ID: {appointmentId}</p>
            </div>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <div className={`px-4 py-2 rounded-full border text-sm font-medium ${statusColorClass}`}>
              {statusText}
            </div>
          </div>

          {/* Patient Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <User className="w-5 h-5 mr-2 text-blue-600" />
              Patient Information
            </h3>
            {patient ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-gray-600">Name</Label>
                  <p className="font-medium">{patient.name}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Phone</Label>
                  <p className="font-medium flex items-center">
                    <Phone className="w-4 h-4 mr-1" />
                    {patient.phone}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Email</Label>
                  <p className="font-medium flex items-center">
                    <Mail className="w-4 h-4 mr-1" />
                    {patient.email || 'N/A'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Blood Group</Label>
                  <p className="font-medium">{patient.bloodGroup}</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">Patient information not available</p>
            )}
          </div>

          {/* Doctor Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <Stethoscope className="w-5 h-5 mr-2 text-blue-600" />
              Doctor Information
            </h3>
            {doctor ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-gray-600">Name</Label>
                  <p className="font-medium">Dr. {doctor.name || `${doctor.firstName} ${doctor.lastName}`}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Department</Label>
                  <p className="font-medium">{doctor.department}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Specialization</Label>
                  <p className="font-medium">{doctor.specialty || 'General Practice'}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Phone</Label>
                  <p className="font-medium flex items-center">
                    <Phone className="w-4 h-4 mr-1" />
                    {doctor.phone}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">Doctor information not available</p>
            )}
          </div>

          {/* Appointment Details */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-blue-600" />
              Appointment Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-sm text-gray-600">Date</Label>
                <p className="font-medium">
                  {formattedDate}
                </p>
              </div>
              <div>
                <Label className="text-sm text-gray-600 flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  Time
                </Label>
                <p className="font-medium">{selectedAppointment?.slot}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-600">Duration</Label>
                <p className="font-medium">{selectedAppointment?.duration} minutes</p>
              </div>
            </div>
          </div>

          {/* Reason and Notes */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-blue-600" />
              Medical Information
            </h3>
            <div className="space-y-4">
              <div>
                <Label className="text-sm text-gray-600 mb-1">Reason for Visit</Label>
                <p className="bg-white p-3 rounded border border-gray-200">
                  {selectedAppointment?.reason}
                </p>
              </div>
              {selectedAppointment?.notes && (
                <div>
                  <Label className="text-sm text-gray-600 mb-1">Additional Notes</Label>
                  <p className="bg-white p-3 rounded border border-gray-200">
                    {selectedAppointment.notes}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Status Actions */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <div className="w-3 h-3 bg-blue-600 rounded-full mr-2"></div>
              Update Status
            </h3>

            {/* Current Status Badge */}
            <div className="mb-4 flex items-center justify-between">
              <Label className="text-sm text-gray-600">Current Status:</Label>
              <div className={`px-3 py-1 rounded-full border text-sm font-medium ${statusColorClass}`}>
                {statusText}
              </div>
            </div>

            {/* All Status Options */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {/* Scheduled */}
              <Button
                onClick={() => handleStatusChange('scheduled')}
                disabled={selectedAppointment?.status === 'scheduled'}
                className={`flex items-center justify-center px-4 py-3 rounded-lg transition-all transform hover:scale-105 shadow-md ${
                  selectedAppointment?.status === 'scheduled'
                    ? 'bg-blue-100 text-blue-800 border-2 border-blue-300 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700 border-2 border-blue-600'
                }`}
              >
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  selectedAppointment?.status === 'scheduled' ? 'bg-blue-600' : 'bg-white'
                }`}></div>
                Scheduled
              </Button>

              {/* Confirmed */}
              <Button
                onClick={() => handleStatusChange('confirmed')}
                disabled={selectedAppointment?.status === 'confirmed'}
                className={`flex items-center justify-center px-4 py-3 rounded-lg transition-all transform hover:scale-105 shadow-md ${
                  selectedAppointment?.status === 'confirmed'
                    ? 'bg-green-100 text-green-800 border-2 border-green-300 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700 border-2 border-green-600'
                }`}
              >
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  selectedAppointment?.status === 'confirmed' ? 'bg-green-600' : 'bg-white'
                }`}></div>
                Confirmed
              </Button>

              {/* In Progress */}
              <Button
                onClick={() => handleStatusChange('in_progress')}
                disabled={selectedAppointment?.status === 'in_progress'}
                className={`flex items-center justify-center px-4 py-3 rounded-lg transition-all transform hover:scale-105 shadow-md ${
                  selectedAppointment?.status === 'in_progress'
                    ? 'bg-yellow-100 text-yellow-800 border-2 border-yellow-300 cursor-not-allowed'
                    : 'bg-yellow-600 text-white hover:bg-yellow-700 border-2 border-yellow-600'
                }`}
              >
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  selectedAppointment?.status === 'in_progress' ? 'bg-yellow-600 animate-pulse' : 'bg-white'
                }`}></div>
                In Progress
              </Button>

              {/* Completed */}
              <Button
                onClick={() => handleStatusChange('completed')}
                disabled={selectedAppointment?.status === 'completed'}
                className={`flex items-center justify-center px-4 py-3 rounded-lg transition-all transform hover:scale-105 shadow-md ${
                  selectedAppointment?.status === 'completed'
                    ? 'bg-gray-100 text-gray-800 border-2 border-gray-300 cursor-not-allowed'
                    : 'bg-gray-600 text-white hover:bg-gray-700 border-2 border-gray-600'
                }`}
              >
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  selectedAppointment?.status === 'completed' ? 'bg-gray-600' : 'bg-white'
                }`}></div>
                Completed
              </Button>

              {/* Cancelled */}
              <Button
                onClick={() => handleStatusChange('cancelled')}
                disabled={selectedAppointment?.status === 'cancelled'}
                className={`flex items-center justify-center px-4 py-3 rounded-lg transition-all transform hover:scale-105 shadow-md ${
                  selectedAppointment?.status === 'cancelled'
                    ? 'bg-red-100 text-red-800 border-2 border-red-300 cursor-not-allowed'
                    : 'bg-red-600 text-white hover:bg-red-700 border-2 border-red-600'
                }`}
              >
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  selectedAppointment?.status === 'cancelled' ? 'bg-red-600' : 'bg-white'
                }`}></div>
                Cancelled
              </Button>

              {/* No Show */}
              <Button
                onClick={() => handleStatusChange('no_show')}
                disabled={selectedAppointment?.status === 'no_show'}
                className={`flex items-center justify-center px-4 py-3 rounded-lg transition-all transform hover:scale-105 shadow-md ${
                  selectedAppointment?.status === 'no_show'
                    ? 'bg-orange-100 text-orange-800 border-2 border-orange-300 cursor-not-allowed'
                    : 'bg-orange-600 text-white hover:bg-orange-700 border-2 border-orange-600'
                }`}
              >
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  selectedAppointment?.status === 'no_show' ? 'bg-orange-600' : 'bg-white'
                }`}></div>
                No Show
              </Button>
            </div>

            {/* Reschedule Button */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <Button
                onClick={handleRescheduleClick}
                className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all transform hover:scale-105 shadow-md"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Reschedule Appointment
              </Button>
            </div>
          </div>
        </div>
      </FormDialog>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={confirmationDialog.isOpen}
        title={confirmationDialog.title}
        message={confirmationDialog.message}
        type="warning"
        onConfirm={confirmationDialog.onConfirm}
        onCancel={handleConfirmationCancel}
      />
    </>
  );
};

export default AppointmentDetailModal;
