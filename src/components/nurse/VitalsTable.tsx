import { useState, useCallback } from 'react';
import { format } from 'date-fns';

// Import icons file
import { Edit2, Trash2, Plus } from 'lucide-react';

// Import UI components file
import { FormButton } from '@/components/common/FormButton';
import ThreeDotMenu from '@/components/common/ThreeDotMenu';

// Import utils file
import { getRoleColors } from '@/utils/roleColors';

// Import type file
import type { Vitals, Patient } from '@/types/vitals/vitalsType';

import ConfirmationDialog from '@/components/common/dialog/ConfirmationDialog';

type VitalsTableProps = {
  vitals: Vitals[];
  patients: Patient[];
  onEdit: (vitals: Vitals) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
};

export const VitalsTable = ({ vitals, patients, onEdit, onDelete, onAdd }: VitalsTableProps) => {

  const nurseColors = getRoleColors('nurse');

  // State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [vitalToDelete, setVitalToDelete] = useState<string | null>(null);

  // Methods
  const getPatientInfo = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? `${patient.name} (${patient.age}y, ${patient.gender}) - Bed: ${patient.bedNumber}` : 'Unknown Patient';
  };

  const getVitalStatus = (vital: Vitals) => {
    const issues = [];
    if (parseInt(vital.bp.split('/')[0]) > 140 || parseInt(vital.bp.split('/')[1]) > 90) {
      issues.push('BP');
    }
    if (vital.pulse < 60 || vital.pulse > 100) {
      issues.push('Pulse');
    }
    if (vital.temp > 100.4) {
      issues.push('Temp');
    }
    if (vital.spo2 < 95) {
      issues.push('SpO2');
    }
    return issues;
  };

  const handleEdit = useCallback((vital: Vitals) => {
    onEdit(vital);
  }, [onEdit]);

  const handleDelete = useCallback((vitalId: string) => {
    setVitalToDelete(vitalId);
    setDeleteDialogOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (vitalToDelete) {
      onDelete(vitalToDelete);
      setVitalToDelete(null);
    }
    setDeleteDialogOpen(false);
  }, [vitalToDelete, onDelete]);

  const handleCloseDeleteDialog = useCallback(() => {
    setDeleteDialogOpen(false);
    setVitalToDelete(null);
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Vitals Records</h2>
        <FormButton
          onClick={onAdd}
          size="sm"
          customColor={`bg-gradient-to-r ${nurseColors.primary} text-white hover:shadow-lg transform hover:scale-105`}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Record Vitals
        </FormButton>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Patient
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date & Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                BP
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pulse
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Temp
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                SpO2
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {vitals.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <Plus className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-lg font-medium mb-2">No vitals recorded</p>
                    <p className="text-sm text-gray-400 mb-4">Start by recording patient vitals</p>
                    <FormButton
                      onClick={onAdd}
                      size="sm"
                      customColor={`bg-gradient-to-r ${nurseColors.primary} text-white hover:shadow-lg transform hover:scale-105`}
                      className="flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Record First Vitals
                    </FormButton>
                  </div>
                </td>
              </tr>
            ) : (
              vitals.map((vital) => {
                const issues = getVitalStatus(vital);
                const hasIssues = issues.length > 0;

                return (
                  <tr key={vital.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {getPatientInfo(vital.patientId)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {format(new Date(vital.recordedAt), 'MMM dd, yyyy HH:mm')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-medium">{vital.bp}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{vital.pulse} bpm</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{vital.temp}°F</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{vital.spo2}%</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {hasIssues ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          {issues.join(', ')}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Normal
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <ThreeDotMenu
                        items={[
                          {
                            label: 'Edit Vitals',
                            onClick: () => handleEdit(vital),
                            icon: <Edit2 className="w-4 h-4 text-blue-400" />,
                            className: 'text-gray-700'
                          },
                          {
                            label: 'Delete Vitals',
                            onClick: () => handleDelete(vital.id),
                            icon: <Trash2 className="w-4 h-4 text-red-400" />,
                            className: 'text-red-600'
                          }
                        ]}
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation dialog */}
        <ConfirmationDialog
          isOpen={deleteDialogOpen}
          title="Delete Vitals"
          message="Are you sure you want to delete these vitals? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
          onConfirm={handleConfirmDelete}
          onCancel={handleCloseDeleteDialog}
        />
    </div>
  );
};
