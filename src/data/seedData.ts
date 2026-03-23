import { db, type Doctor, type DoctorSchedule, type Patient, type Appointment } from '@/features/patient/db/dexie';
import { format, addDays } from 'date-fns';

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

export const seedAppointments = async (doctors: Doctor[], patients: Patient[]) => {
  const appointments: Appointment[] = [];
  const today = new Date();

  // Create sample appointments for the current week
  for (let i = 0; i < 5; i++) { // Create 5 sample appointments
    const randomDoctor = doctors[Math.floor(Math.random() * doctors.length)];
    const randomPatient = patients[Math.floor(Math.random() * patients.length)];
    const dayOffset = Math.floor(Math.random() * 7); // Random day in current week
    const appointmentDate = addDays(today, dayOffset);

    // Random time slots between 9:00 AM and 4:30 PM
    const hour = 9 + Math.floor(Math.random() * 8); // 9-16
    const minute = Math.random() > 0.5 ? '00' : '30';

    appointments.push({
      id: crypto.randomUUID(),
      patientId: randomPatient.id,
      doctorId: randomDoctor.id,
      department: randomDoctor.department,
      date: format(appointmentDate, 'yyyy-MM-dd'),
      slot: `${hour.toString().padStart(2, '0')}:${minute}`,
      duration: 30,
      status: ['scheduled', 'confirmed'][Math.floor(Math.random() * 2)] as Appointment['status'],
      reason: ['Regular checkup', 'Follow-up consultation', 'New patient visit', 'Emergency'][Math.floor(Math.random() * 4)],
      notes: 'Sample appointment for testing',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  await db.appointments.bulkAdd(appointments);
  return appointments;
};

export const seedAllData = async () => {
  try {
    console.log('Starting seedAllData...');

    // Check if data already exists first
    const existingDoctors = await db.doctors.count();
    const existingPatients = await db.patients.count();
    const existingAppointments = await db.appointments.count();

    if (existingDoctors > 0 || existingPatients > 0 || existingAppointments > 0) {
      console.log('Seed data already exists, skipping...');
      return;
    }

    console.log('Seeding initial data...');
    const doctors = await seedDoctors();
    console.log('Doctors seeded:', doctors.length);

    const patients = await seedPatients();
    console.log('Patients seeded:', patients.length);

    const schedules = await seedDoctorSchedules(doctors);
    console.log('Schedules seeded:', schedules.length);

    const appointments = await seedAppointments(doctors, patients);
    console.log('Appointments seeded:', appointments.length);

    console.log('Seed data created successfully!');

    // Verify data was created
    const doctorCount = await db.doctors.count();
    const patientCount = await db.patients.count();
    const scheduleCount = await db.doctorSchedules.count();
    const appointmentCount = await db.appointments.count();

    console.log('Final counts:', { doctorCount, patientCount, scheduleCount, appointmentCount });

  } catch (error) {
    console.error('Error seeding data:', error);
  }
};
