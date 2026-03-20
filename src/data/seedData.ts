import { db, type Doctor, type DoctorSchedule, type Patient } from '@/features/patient/db/dexie';

export const seedDoctors = async () => {
  const doctors: Doctor[] = [
    {
      id: crypto.randomUUID(),
      name: 'Sarah Johnson',
      department: 'Cardiology',
      specialization: 'Interventional Cardiology',
      phone: '+1-555-0123',
      email: 'sarah.johnson@medicare.com',
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(),
      name: 'Michael Chen',
      department: 'Neurology',
      specialization: 'Neurophysiology',
      phone: '+1-555-0124',
      email: 'michael.chen@medicare.com',
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(),
      name: 'Emily Rodriguez',
      department: 'Pediatrics',
      specialization: 'Pediatric Cardiology',
      phone: '+1-555-0125',
      email: 'emily.rodriguez@medicare.com',
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(),
      name: 'David Kim',
      department: 'Orthopedics',
      specialization: 'Sports Medicine',
      phone: '+1-555-0126',
      email: 'david.kim@medicare.com',
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(),
      name: 'Lisa Thompson',
      department: 'General Medicine',
      specialization: 'Family Medicine',
      phone: '+1-555-0127',
      email: 'lisa.thompson@medicare.com',
      isActive: true,
      createdAt: new Date().toISOString(),
    },
  ];

  await db.doctors.bulkAdd(doctors);
  return doctors;
};

export const seedDoctorSchedules = async (doctors: Doctor[]) => {
  const schedules: DoctorSchedule[] = doctors.map((doctor) => ({
    id: crypto.randomUUID(),
    doctorId: doctor.id,
    workingDays: [1, 2, 3, 4, 5], // Monday to Friday
    startTime: '09:00',
    endTime: '17:00',
    slotDuration: 30 as const,
    lunchBreakStart: '12:00',
    lunchBreakEnd: '13:00',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));

  await db.doctorSchedules.bulkAdd(schedules);
  return schedules;
};

export const seedPatients = async () => {
  const patients: Patient[] = [
    {
      id: crypto.randomUUID(),
      name: 'John Smith',
      dob: '1985-06-15',
      gender: 'Male',
      bloodGroup: 'O+',
      phone: '+1-555-1001',
      email: 'john.smith@email.com',
      address: '123 Main St, City, State 12345',
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(),
      name: 'Mary Davis',
      dob: '1990-03-22',
      gender: 'Female',
      bloodGroup: 'A+',
      phone: '+1-555-1002',
      email: 'mary.davis@email.com',
      address: '456 Oak Ave, City, State 12345',
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(),
      name: 'Robert Wilson',
      dob: '1978-11-08',
      gender: 'Male',
      bloodGroup: 'B+',
      phone: '+1-555-1003',
      email: 'robert.wilson@email.com',
      address: '789 Pine Rd, City, State 12345',
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(),
      name: 'Jennifer Brown',
      dob: '1995-07-30',
      gender: 'Female',
      bloodGroup: 'AB+',
      phone: '+1-555-1004',
      email: 'jennifer.brown@email.com',
      address: '321 Elm St, City, State 12345',
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(),
      name: 'William Taylor',
      dob: '1982-02-14',
      gender: 'Male',
      bloodGroup: 'O-',
      phone: '+1-555-1005',
      email: 'william.taylor@email.com',
      address: '654 Maple Dr, City, State 12345',
      isActive: true,
      createdAt: new Date().toISOString(),
    },
  ];

  await db.patients.bulkAdd(patients);
  return patients;
};

export const seedAllData = async () => {
  try {
    // Check if data already exists
    const existingDoctors = await db.doctors.count();
    const existingPatients = await db.patients.count();

    if (existingDoctors > 0 || existingPatients > 0) {
      console.log('Seed data already exists');
      return;
    }

    console.log('Seeding initial data...');
    const doctors = await seedDoctors();
    await seedDoctorSchedules(doctors);
    await seedPatients();
    console.log('Seed data created successfully');
  } catch (error) {
    console.error('Error seeding data:', error);
  }
};
