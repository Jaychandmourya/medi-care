// Debug script to check database content
// Run this in browser console when the app is running

(async () => {
  try {
    // Import the db instance
    const { db } = await import('/src/features/db/dexie.ts');
    
    console.log('=== Database Debug ===');
    
    // Check doctors
    const doctors = await db.doctors.toArray();
    console.log('Doctors count:', doctors.length);
    doctors.forEach((doctor, index) => {
      console.log(`Doctor ${index + 1}:`, {
        id: doctor.id,
        name: doctor.name,
        department: doctor.department,
        isActive: doctor.isActive
      });
    });
    
    // Check doctor schedules
    const schedules = await db.doctorSchedules.toArray();
    console.log('\nDoctor schedules count:', schedules.length);
    schedules.forEach((schedule, index) => {
      console.log(`Schedule ${index + 1}:`, {
        id: schedule.id,
        doctorId: schedule.doctorId,
        workingDays: schedule.workingDays,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        slotDuration: schedule.slotDuration,
        isActive: schedule.isActive
      });
    });
    
    // Check appointments
    const appointments = await db.appointments.toArray();
    console.log('\nAppointments count:', appointments.length);
    appointments.forEach((apt, index) => {
      console.log(`Appointment ${index + 1}:`, {
        id: apt.id,
        doctorId: apt.doctorId,
        patientId: apt.patientId,
        date: apt.date,
        slot: apt.slot,
        status: apt.status
      });
    });
    
    console.log('\n=== End Debug ===');
  } catch (error) {
    console.error('Debug error:', error);
  }
})();
