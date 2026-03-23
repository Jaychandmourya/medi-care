import React from 'react';
import { useAppSelector } from '@/app/hooks';

const ReduxDebugger: React.FC = () => {
  const appointmentState = useAppSelector((state) => state.appointments);
  
  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: 'white', 
      border: '1px solid black', 
      padding: '10px', 
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '300px'
    }}>
      <h4>Redux State Debug</h4>
      <div><strong>Loading:</strong> {appointmentState.loading.toString()}</div>
      <div><strong>Appointments:</strong> {appointmentState.appointments.length}</div>
      <div><strong>Doctors:</strong> {appointmentState.doctors.length}</div>
      <div><strong>Patients:</strong> {appointmentState.patients.length}</div>
      <div><strong>Schedules:</strong> {appointmentState.doctorSchedules.length}</div>
      <div><strong>Error:</strong> {appointmentState.error || 'None'}</div>
      
      <details style={{ marginTop: '10px' }}>
        <summary>Appointments Data</summary>
        <pre style={{ fontSize: '10px', maxHeight: '200px', overflow: 'auto' }}>
          {JSON.stringify(appointmentState.appointments, null, 2)}
        </pre>
      </details>
      
      <button 
        onClick={() => (window as any).resetAndSeedData?.()}
        style={{ marginTop: '10px', padding: '5px' }}
      >
        Reset Data
      </button>
    </div>
  );
};

export default ReduxDebugger;
