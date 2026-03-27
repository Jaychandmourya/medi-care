import { db, type Patient } from '../features/db/dexie';
import type { PatientFormData } from '../lib/patientValidation';

// Ensure database is ready
export const initializeDatabase = async (): Promise<void> => {
  try {
    await db.open();
    console.log('✅ Database opened successfully');
  } catch (error) {
    console.error('❌ Failed to open database:', error);
    throw error;
  }
};


//  Generate Patient ID
const generatePatientId = async (): Promise<string> => {
  const currentYear = new Date().getFullYear();
  const prefix = `MED-${currentYear}-`;

  const existingPatients = await db.patients
    .where('patientId')
    .startsWith(prefix)
    .toArray();

  const maxNumber = existingPatients.reduce((max, patient) => {
    const match = patient.patientId?.match(new RegExp(`${prefix}(\\d{4})`));
    if (match) {
      const num = parseInt(match[1]);
      return num > max ? num : max;
    }
    return max;
  }, 0);

  const nextNumber = (maxNumber + 1).toString().padStart(4, '0');
  return `${prefix}${nextNumber}`;
};

// In This Call All Services for Patient
export const patientService = {

  //  Get AllPatients
  async getAllPatients(): Promise<PatientFormData[]> {
    try {
      await initializeDatabase();
      return await db.patients.toArray();
    } catch (error) {
      console.error('Error getting all patients:', error);
      throw error;
    }
  },

  // Get Data With Patient Id
  async getPatientById(id: string): Promise<PatientFormData | undefined> {
    return await db.patients.get(id);
  },

  // Get Data With Patient patientId
  async getPatientByPatientId(patientId: string): Promise<PatientFormData | undefined> {
    return await db.patients.where('patientId').equals(patientId).first();
  },

  //  Add Data Patient
  async addPatient(patient: Omit<PatientFormData, 'id' | 'createdAt' | 'updatedAt' | 'patientId'>): Promise<PatientFormData> {
    try {
      await initializeDatabase();
      const patientId = await generatePatientId();
      const newPatient: Patient = {
        ...patient,
        id: crypto.randomUUID(),
        patientId,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await db.patients.add(newPatient);
      return newPatient;
    } catch (error) {
      console.error('Error adding patient:', error);
      throw error;
    }
  },

   //  Update Data Patient
  async updatePatient(id: string, updates: Partial<PatientFormData>): Promise<void> {
    await db.patients.update(id, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  },

  //  Soft Delete Patient Only Change isActive
  async softDeletePatient(id: string): Promise<void> {
    await db.patients.update(id, {
      isActive: false,
      updatedAt: new Date().toISOString(),
    });
  },

  // Parament Delete with Database
  async deletePatient(id: string): Promise<void> {
    await db.patients.delete(id);
  },

  //  Searching Patients with query
  async searchPatients(query: string): Promise<PatientFormData[]> {
    try {
      const lowerQuery = query.toLowerCase();
      return await db.patients
        .where('name')
        .startsWithIgnoreCase(lowerQuery)
        .or('phone')
        .startsWithIgnoreCase(lowerQuery)
        .or('patientId')
        .startsWithIgnoreCase(lowerQuery)
        .or('bloodGroup')
        .startsWithIgnoreCase(lowerQuery)
        .toArray();
    } catch (error) {
      console.error('Error searching patients:', error);
      throw error;
    }
  },

  // Clear Database
  async clearDatabase(): Promise<void> {
    try {
      await db.delete();
      await db.open();
      console.log('Database cleared and reset with proper schema');
    } catch (error) {
      console.error('Error clearing database:', error);
      throw error;
    }
  }
};