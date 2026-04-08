import { format } from 'date-fns';
import { Edit2, Trash2, Plus, MoreVertical } from 'lucide-react';
import { useState, useCallback } from 'react';
import type { Vitals, Patient } from '../../types/vitals/vitalsType';
import { Button } from '../ui/Button';
import { getRoleColors } from '../../utils/roleColors';
import DeleteDialog from '../ui/dialog/DeleteDialog';

type VitalsTableProps = {
  vitals: Vitals[];
  patients: Patient[];
  onEdit: (vitals: Vitals) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
};

export const VitalsTable = ({ vitals, patients, onEdit, onDelete, onAdd }: VitalsTableProps) => {
  const nurseColors = getRoleColors('nurse');
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [vitalToDelete, setVitalToDelete] = useState<string | null>(null);

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

  const toggleDropdown = useCallback((vitalId: string) => {
    setActiveDropdown(activeDropdown === vitalId ? null : vitalId);
  }, [activeDropdown]);

  const handleEdit = useCallback((vital: Vitals) => {
    onEdit(vital);
    setActiveDropdown(null);
  }, [onEdit]);

  const handleDelete = useCallback((vitalId: string) => {
    setVitalToDelete(vitalId);
    setDeleteDialogOpen(true);
    setActiveDropdown(null);
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
        <Button
          onClick={onAdd}
          size="sm"
          customColor={`bg-gradient-to-r ${nurseColors.primary} text-white hover:shadow-lg transform hover:scale-105`}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Record Vitals
        </Button>
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
                    <Button
                      onClick={onAdd}
                      size="sm"
                      customColor={`bg-gradient-to-r ${nurseColors.primary} text-white hover:shadow-lg transform hover:scale-105`}
                      className="flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Record First Vitals
                    </Button>
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
                      <div className="relative">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleDropdown(vital.id)}
                          className="text-gray-600 hover:text-gray-800 p-2"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>

                        {activeDropdown === vital.id && (
                          <>
                            {/* Backdrop to close dropdown when clicking outside */}
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setActiveDropdown(null)}
                            />
                            {/* Dropdown menu */}
                            <div className="fixed right-4 top-1/2 transform -translate-y-1/2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-20 animate-in slide-in-from-right-2 duration-200">
                              <div className="py-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEdit(vital)}
                                  className="flex items-center w-full justify-start px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md mx-1"
                                >
                                  <Edit2 className="w-4 h-4 mr-3 text-blue-400" />
                                  Edit Vitals
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(vital.id)}
                                  className="flex items-center w-full justify-start px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md mx-1"
                                >
                                  <Trash2 className="w-4 h-4 mr-3 text-red-400" />
                                  Delete Vitals
                                </Button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <DeleteDialog
        isOpenDelete={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        deleteTitle="Delete Vitals"
        onConfirm={handleConfirmDelete}
        description="Are you sure you want to delete these vitals? This action cannot be undone."
        itemName="Vitals Record"
      />
    </div>
  );
};
