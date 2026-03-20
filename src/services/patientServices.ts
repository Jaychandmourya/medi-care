import Dexie from 'dexie';
import type { Table } from 'dexie';
import type { PatientFormData } from '../lib/patientValidation';

export class PatientDatabase extends Dexie {
  patients!: Table<PatientFormData>;

  constructor() {
    super('MediCarePatientDB');
    this.version(1).stores({
      patients: '++id, patientId, name, phone, dob, gender, bloodGroup, isActive, createdAt, updatedAt'
    });
  }
}

export const patientDB = new PatientDatabase();

const generatePatientId = async (): Promise<string> => {
  const currentYear = new Date().getFullYear();
  const prefix = `MED-${currentYear}-`;

  const existingPatients = await patientDB.patients
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

export const patientService = {
  async getAllPatients(): Promise<PatientFormData[]> {
    return await patientDB.patients.toArray();
  },

  async getPatientById(id: string): Promise<PatientFormData | undefined> {
    return await patientDB.patients.get(id);
  },

  async getPatientByPatientId(patientId: string): Promise<PatientFormData | undefined> {
    return await patientDB.patients.where('patientId').equals(patientId).first();
  },

  async addPatient(patient: Omit<PatientFormData, 'id' | 'createdAt' | 'updatedAt' | 'patientId'>): Promise<PatientFormData> {
    console.log('Adding patient:', patient);
    const patientId = await generatePatientId();
    const newPatient = {
      ...patient,
      id: crypto.randomUUID(),
      patientId,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await patientDB.patients.add(newPatient);
    return newPatient;
  },

  async updatePatient(id: string, updates: Partial<PatientFormData>): Promise<void> {
    await patientDB.patients.update(id, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  },

  async softDeletePatient(id: string): Promise<void> {
    await patientDB.patients.update(id, {
      isActive: false,
      updatedAt: new Date().toISOString(),
    });
  },

  async deletePatient(id: string): Promise<void> {
    await patientDB.patients.delete(id);
  },

  async searchPatients(query: string): Promise<PatientFormData[]> {
    const lowerQuery = query.toLowerCase();
    return await patientDB.patients
      .where('name')
      .startsWithIgnoreCase(lowerQuery)
      .or('phone')
      .startsWithIgnoreCase(lowerQuery)
      .or('patientId')
      .startsWithIgnoreCase(lowerQuery)
      .or('bloodGroup')
      .startsWithIgnoreCase(lowerQuery)
      .toArray();
  }
};