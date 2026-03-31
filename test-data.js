// Test doctor and schedule data - run this in browser console
(async () => {
  try {
    console.log('🔍 Testing doctor and schedule data...');
    
    const { db } = await import('/src/features/db/dexie.ts');
    
    // Get all doctors
    const doctors = await db.doctors.toArray();
    console.log('👨‍⚕️ Doctors:', doctors.length);
    doctors.forEach((doctor, index) => {
      console.log(`  ${index + 1}. ${doctor.name} (ID: ${doctor.id}) - ${doctor.department}`);
    });
    
    // Get all schedules
    const schedules = await db.doctorSchedules.toArray();
    console.log('\n📅 Schedules:', schedules.length);
    schedules.forEach((schedule, index) => {
      const doctor = doctors.find(d => d.id === schedule.doctorId);
      console.log(`  ${index + 1}. Dr. ${doctor?.name || 'Unknown'} - ${schedule.startTime} to ${schedule.endTime}`);
    });
    
    // Test a specific doctor lookup
    if (doctors.length > 0) {
      const firstDoctor = doctors[0];
      console.log(`\n🧪 Testing lookup for Dr. ${firstDoctor.name} (ID: ${firstDoctor.id})`);
      
      const schedule = await db.doctorSchedules.where('doctorId').equals(firstDoctor.id).first();
      if (schedule) {
        console.log('✅ Schedule found:', schedule);
      } else {
        console.log('❌ No schedule found for this doctor');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
})();
