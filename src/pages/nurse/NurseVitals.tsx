import { useState, useEffect, Suspense, lazy } from 'react';
import toast from 'react-hot-toast';

// Import type file
import type { Vitals, Patient } from '@/types/vitals/vitalsType';

// Import service file
import { VitalsService } from '@/services/vitalsService';

// Lazy load components
const VitalsTable = lazy(() => import('@/components/nurse/VitalsTable').then(m => ({ default: m.VitalsTable })));
const AddEditVitalsDialog = lazy(() => import('@/components/nurse/dialog/AddEditVitalsDialog').then(m => ({ default: m.VitalsForm })));



const NurseVitals = () => {

  // State
  const [showForm, setShowForm] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const [vitals, setVitals] = useState<Vitals[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [editingVitals, setEditingVitals] = useState<Vitals | undefined>();

  // Effect
  useEffect(() => {
    loadData();
  }, []);

  // Method
  const loadData = async () => {
    try {
      setLoading(true);
      const [vitalsData, patientsData] = await Promise.all([
        VitalsService.getVitals(),
        VitalsService.getPatients()
      ]);
      setVitals(vitalsData.sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()));
      setPatients(patientsData);
    } catch (error) {
      toast.error('Failed to load data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddVitals = () => {
    setEditingVitals(undefined);
    setShowForm(true);
  };

  const handleEditVitals = (vital: Vitals) => {
    setEditingVitals(vital);
    setShowForm(true);
  };

  const handleDeleteVitals = async (id: string) => {
    try {
      await VitalsService.deleteVitals(id);
      setVitals(prev => prev.filter(v => v.id !== id));
      toast.success('Vitals deleted successfully');
    } catch (error) {
      toast.error('Failed to delete vitals');
      console.error(error);
    }
  };

  const handleFormSubmit = (submittedVitals: Vitals) => {
    if (editingVitals) {
      setVitals(prev => prev.map(v => v.id === submittedVitals.id ? submittedVitals : v));
    } else {
      setVitals(prev => [submittedVitals, ...prev].sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()));
    }
    setShowForm(false);
    setEditingVitals(undefined);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingVitals(undefined);
  };

  if (loading) {
    return (
      <div className="h-full bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading vitals data...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="px-4 lg:px-6">
        <div className="mb-8 bg-white rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Patient Vitals Management</h1>
          <p className="text-gray-600">Record and manage patient vital signs</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Records</p>
                <p className="text-2xl font-bold text-gray-900">{vitals.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Normal</p>
                <p className="text-2xl font-bold text-gray-900">
                  {vitals.filter(v => {
                    const bp = v.bp.split('/');
                    return parseInt(bp[0]) <= 140 && parseInt(bp[1]) <= 90 &&
                          v.pulse >= 60 && v.pulse <= 100 &&
                          v.temp <= 100.4 &&
                          v.spo2 >= 95;
                  }).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-red-100 rounded-lg p-3">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Critical</p>
                <p className="text-2xl font-bold text-gray-900">
                  {vitals.filter(v => {
                    const bp = v.bp.split('/');
                    return parseInt(bp[0]) > 140 || parseInt(bp[1]) > 90 ||
                          v.pulse < 60 || v.pulse > 100 ||
                          v.temp > 100.4 ||
                          v.spo2 < 95;
                  }).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-100 rounded-lg p-3">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Patients</p>
                <p className="text-2xl font-bold text-gray-900">{patients.length}</p>
              </div>
            </div>
          </div>
        </div>

        <Suspense fallback={
          <div className="bg-white rounded-lg shadow p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
              <span className="text-gray-600">Loading table...</span>
            </div>
          </div>
        }>
          <VitalsTable
            vitals={vitals}
            patients={patients}
            onEdit={handleEditVitals}
            onDelete={handleDeleteVitals}
            onAdd={handleAddVitals}
          />
        </Suspense>

        {showForm && (
          <Suspense fallback={<div className="text-center py-8">Loading form...</div>}>
            <AddEditVitalsDialog
              vitals={editingVitals}
              patients={patients}
              existingVitals={vitals}
              onSubmit={handleFormSubmit}
              onCancel={handleFormCancel}
            />
          </Suspense>
        )}
      </div>
    </div>
  );
};

export default NurseVitals;