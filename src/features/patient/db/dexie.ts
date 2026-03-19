import Dexie, { type Table } from "dexie";

export interface Patient {
  id: string;
  name: string;
  dob: string;
  gender: string;
  bloodGroup: string;
  phone: string;
  email?: string;
  address?: string;
  photo?: string;
  isActive: boolean;
  createdAt: string;
}

class AppDB extends Dexie {
  patients!: Table<Patient>;

  constructor() {
    super("MediCareDB");
    this.version(1).stores({
      patients: "id, name, phone, bloodGroup, createdAt",
    });
  }
}

export const db = new AppDB();