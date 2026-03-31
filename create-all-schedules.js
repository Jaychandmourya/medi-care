// Create schedules for ALL doctors - run this in browser console
(async () => {
  try {
    console.log('🔧 Creating schedules for all doctors...');
    
    const { db } = await import('/src/features/db/dexie.ts');
    
    // Get all doctors
    const doctors = await db.doctors.toArray();
    console.log('📋 Found doctors:', doctors.length);
    
    if (doctors.length === 0) {
      console.error('❌ No doctors found. Please seed doctors first.');
      return;
    }
    
    // Get existing schedules
    const existingSchedules = await db.doctorSchedules.toArray();
    console.log('📅 Existing schedules:', existingSchedules.length);
    
    // Create schedules for doctors that don't have one
    let created = 0;
    for (const doctor of doctors) {
      const hasSchedule = existingSchedules.some(s => s.doctorId === doctor.id);
      
      if (!hasSchedule) {
        const schedule = {
          id: crypto.randomUUID(),
          doctorId: doctor.id,
          workingDays: [1, 2, 3, 4, 5], // Monday to Friday
          startTime: '09:00',
          endTime: '17:00',
          slotDuration: 30,
          lunchBreakStart: '12:00',
          lunchBreakEnd: '13:00',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        await db.doctorSchedules.add(schedule);
        console.log(`✅ Created schedule for Dr. ${doctor.name}`);
        created++;
      } else {
        console.log(`ℹ️ Dr. ${doctor.name} already has schedule`);
      }
    }
    
    // Verify
    const finalScheduleCount = await db.doctorSchedules.count();
    console.log('📊 Final schedule count:', finalScheduleCount);
    console.log(`✅ Created ${created} new schedules`);
    
    if (created > 0) {
      console.log('🔄 Refresh the page and try selecting a doctor and date.');
    }
    
  } catch (error) {
    console.error('❌ Error creating schedules:', error);
  }
})();
