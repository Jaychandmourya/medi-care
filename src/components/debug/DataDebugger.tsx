import { useEffect, useState } from 'react';
import { db } from '@/features/db/dexie';
import { seedAllData } from '@/data/seedData';

interface DataInfo {
  doctorCount?: number;
  scheduleCount?: number;
  patientCount?: number;
  appointmentCount?: number;
  reseeded?: boolean;
}

const DataDebugger = () => {
  const [dataInfo, setDataInfo] = useState<DataInfo>({});
  const [loading, setLoading] = useState(true);

  const checkData = async () => {
    try {
      const doctorCount = await db.doctors.count();
      const scheduleCount = await db.doctorSchedules.count();
      const patientCount = await db.patients.count();
      const appointmentCount = await db.appointments.count();

      const info = {
        doctorCount,
        scheduleCount,
        patientCount,
        appointmentCount,
      };

      setDataInfo(info);

      // If no schedules exist, try to seed data
      if (doctorCount > 0 && scheduleCount === 0) {
        await seedAllData();
        // Check again after seeding
        const newScheduleCount = await db.doctorSchedules.count();
        setDataInfo((prev: DataInfo) => ({ ...prev, scheduleCount: newScheduleCount, reseeded: true }));
      }
    } catch (error) {
      console.error('Error checking data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkData();
  }, []);

  if (loading) return <div>Checking data...</div>;

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'white',
      padding: '10px',
      border: '1px solid #ccc',
      borderRadius: '4px',
      fontSize: '12px',
      zIndex: 9999
    }}>
      <h4>Data Debug Info</h4>
      <p>Doctors: {dataInfo.doctorCount}</p>
      <p>Schedules: {dataInfo.scheduleCount}</p>
      <p>Patients: {dataInfo.patientCount}</p>
      <p>Appointments: {dataInfo.appointmentCount}</p>
      {dataInfo.reseeded && <p style={{color: 'green'}}>Data reseeded!</p>}
      <button onClick={checkData} style={{marginTop: '5px'}}>Refresh</button>
    </div>
  );
};

export default DataDebugger;
