import { db } from '@/features/db/dexie';
import type { Vitals, VitalsFormData, Patient as VitalsPatient } from '@/types/vitals/vitalsType';
import { patientService } from '@/services/patientServices';


export class VitalsService {

  static async getPatients(): Promise<VitalsPatient[]> {
    try {
      const [dbPatients, beds] = await Promise.all([
        patientService.getAllPatients(),
        db.beds.toArray()
      ]);

      // Create a map of patientId to bed information
      const bedMap = new Map<string, string>();
      beds.forEach(bed => {
        if (bed.patientId && bed.status === 'occupied') {
          bedMap.set(bed.patientId, bed.bedId);
        }
      });

      // Transform database Patient to vitals Patient type
      return dbPatients
        .filter(patient => patient.isActive) // Only get active patients
        .map(patient => ({
          id: patient.id || patient.patientId || '', // Use id, patientId, or empty string as fallback
          name: patient.name,
          age: this.calculateAge(patient.dob),
          gender: patient.gender,
          bedNumber: bedMap.get(patient.patientId || '') || 'Unassigned' // Get bed number or show unassigned
        }));
    } catch (error) {
      console.error('Error fetching patients:', error);
      // Return empty array as fallback
      return [];
    }
  }

  private static calculateAge(dob: string): number {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  static async getVitals(): Promise<Vitals[]> {
    try {
      const vitals = await db.vitals.toArray();
      // Ensure recordedAt is serialized as ISO string for Redux
      return vitals.map(v => ({
        ...v,
        recordedAt: typeof (v as any).recordedAt?.toISOString === 'function' ? (v as any).recordedAt.toISOString() : v.recordedAt
      }));
    } catch (error) {
      console.error('Error fetching vitals:', error);
      return [];
    }
  }

  static async getVitalsByPatientId(patientId: string): Promise<Vitals[]> {
    try {
      const vitals = await db.vitals.where('patientId').equals(patientId).toArray();
      // Ensure recordedAt is serialized as ISO string for Redux
      return vitals.map(v => ({
        ...v,
        recordedAt: typeof (v as any).recordedAt?.toISOString === 'function' ? (v as any).recordedAt.toISOString() : v.recordedAt
      }));
    } catch (error) {
      console.error('Error fetching vitals for patient:', error);
      return [];
    }
  }

  static async addVitals(vitalsData: VitalsFormData): Promise<Vitals> {
    try {
      const newVitals = {
        id: Date.now().toString(),
        patientId: vitalsData.patientId,
        recordedAt: new Date().toISOString(),
        bp: vitalsData.bp,
        pulse: parseInt(vitalsData.pulse),
        temp: parseFloat(vitalsData.temp),
        spo2: parseInt(vitalsData.spo2)
      };

      const id = await db.vitals.add(newVitals);
      return { ...newVitals, id: id.toString() };
    } catch (error) {
      console.error('Error adding vitals:', error);
      throw new Error('Failed to add vitals');
    }
  }

  static async updateVitals(id: string, vitalsData: Partial<VitalsFormData>): Promise<Vitals> {
    try {
      const existingVitals = await db.vitals.get(id);
      if (!existingVitals) {
        throw new Error('Vitals record not found');
      }

      const updatedVitals = {
        ...existingVitals,
        ...vitalsData,
        pulse: vitalsData.pulse ? parseInt(vitalsData.pulse) : existingVitals.pulse,
        temp: vitalsData.temp ? parseFloat(vitalsData.temp) : existingVitals.temp,
        spo2: vitalsData.spo2 ? parseInt(vitalsData.spo2) : existingVitals.spo2,
        recordedAt: new Date().toISOString()
      };

      await db.vitals.update(id, updatedVitals);
      return updatedVitals;
    } catch (error) {
      console.error('Error updating vitals:', error);
      throw new Error('Failed to update vitals');
    }
  }

  static async deleteVitals(id: string): Promise<void> {
    try {
      await db.vitals.delete(id);
    } catch (error) {
      console.error('Error deleting vitals:', error);
      throw new Error('Failed to delete vitals');
    }
  }
}
