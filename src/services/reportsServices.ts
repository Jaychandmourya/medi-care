import { db } from '@/features/db/dexie';
import { format, subDays } from 'date-fns';

// Ensure database is open
const ensureDbOpen = async () => {
  if (!db.isOpen()) {
    await db.open();
  }
};

// Types matching reportsSlice
export interface OPDTrendData {
  date: string;
  patients: number;
}

export interface BedOccupancyData {
  date: string;
  occupancyRate: number;
}

export interface DepartmentDistribution {
  department: string;
  count: number;
  percentage: number;
}

export interface AppointmentStatusData {
  status: 'Completed' | 'Cancelled' | 'No-Show';
  count: number;
  date: string;
}

export interface DoctorWorkloadData {
  doctorName: string;
  appointments: number;
  department: string;
}

export interface RevenueData {
  department: string;
  revenue: number;
}

export interface DrugRecallData {
  drugClass: string;
  recallCount: number;
  lastUpdated: string;
}

export const reportsServices = {
  // Fetch OPD Trend - patients created per day for last 30 days
  async fetchOPDTrend(): Promise<OPDTrendData[]> {
    await ensureDbOpen();

    const patients = await db.patients.toArray();
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = subDays(new Date(), 29 - i);
      return format(date, 'yyyy-MM-dd');
    });

    // Count patients created per day
    const patientCounts = last30Days.map(date => {
      const count = patients.filter(patient => {
        if (!patient.createdAt) return false;
        const patientDate = format(new Date(patient.createdAt), 'yyyy-MM-dd');
        return patientDate === date;
      }).length;

      return {
        date,
        patients: count,
      };
    });

    return patientCounts;
  },

  // Fetch Bed Occupancy - current occupancy rate (snapshot-based)
  async fetchBedOccupancy(): Promise<BedOccupancyData[]> {
    await ensureDbOpen();

    const beds = await db.beds.toArray();
    const totalBeds = beds.length;
    const occupiedBeds = beds.filter(bed => bed.status === 'occupied').length;
    const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

    // Generate 30 days of occupancy data with slight variations
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = subDays(new Date(), 29 - i);
      // Add slight random variation (-5% to +5%) to current rate
      const variation = Math.floor(Math.random() * 10) - 5;
      const rate = Math.max(0, Math.min(100, occupancyRate + variation));

      return {
        date: format(date, 'yyyy-MM-dd'),
        occupancyRate: rate,
      };
    });

    return last30Days;
  },

  // Fetch Department Distribution - appointments per department
  async fetchDepartmentDistribution(): Promise<DepartmentDistribution[]> {
    await ensureDbOpen();

    const appointments = await db.appointments.toArray();
    const departmentCounts: Record<string, number> = {};

    appointments.forEach(apt => {
      const dept = apt.department || 'General';
      departmentCounts[dept] = (departmentCounts[dept] || 0) + 1;
    });

    // If no appointments, return empty array
    if (Object.keys(departmentCounts).length === 0) {
      return [];
    }

    const total = Object.values(departmentCounts).reduce((sum, count) => sum + count, 0);

    return Object.entries(departmentCounts)
      .map(([department, count]) => ({
        department,
        count,
        percentage: Math.round((count / total) * 100),
      }))
      .sort((a, b) => b.count - a.count);
  },

  // Fetch Appointment Status - count by status for last 7 days
  async fetchAppointmentStatus(): Promise<AppointmentStatusData[]> {
    await ensureDbOpen();

    const appointments = await db.appointments.toArray();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      return format(date, 'yyyy-MM-dd');
    });

    const result: AppointmentStatusData[] = [];

    last7Days.forEach(date => {
      const dayAppointments = appointments.filter(apt => apt.date === date);

      const statusCounts = {
        completed: 0,
        cancelled: 0,
        no_show: 0,
      };

      dayAppointments.forEach(apt => {
        if (apt.status === 'completed') statusCounts.completed++;
        else if (apt.status === 'cancelled') statusCounts.cancelled++;
        else if (apt.status === 'no_show') statusCounts.no_show++;
      });

      result.push(
        { status: 'Completed', count: statusCounts.completed, date },
        { status: 'Cancelled', count: statusCounts.cancelled, date },
        { status: 'No-Show', count: statusCounts.no_show, date }
      );
    });

    return result;
  },

  // Fetch Doctor Workload - appointments per doctor
  async fetchDoctorWorkload(): Promise<DoctorWorkloadData[]> {
    await ensureDbOpen();

    const appointments = await db.appointments.toArray();
    const doctors = await db.doctors.toArray();

    // Create a map of doctorId to doctor info
    const doctorMap = new Map(doctors.map(d => [d.id, d]));

    // Count appointments per doctor
    const appointmentCounts: Record<string, number> = {};
    appointments.forEach(apt => {
      appointmentCounts[apt.doctorId] = (appointmentCounts[apt.doctorId] || 0) + 1;
    });

    // Build result with doctor details
    const result: DoctorWorkloadData[] = Object.entries(appointmentCounts)
      .map(([doctorId, count]) => {
        const doctor = doctorMap.get(doctorId);
        return {
          doctorName: doctor?.name || `Doctor ${doctorId.slice(0, 8)}`,
          appointments: count,
          department: doctor?.department || 'General',
        };
      })
      .sort((a, b) => b.appointments - a.appointments)
      .slice(0, 10); // Top 10 doctors

    return result;
  },

  // Fetch Revenue - estimated from appointments by department
  // Using a simple estimation: $100 per appointment base rate, adjusted by department
  async fetchRevenue(): Promise<RevenueData[]> {
    await ensureDbOpen();

    const appointments = await db.appointments.toArray();
    const departmentRevenue: Record<string, number> = {};

    // Base rate per appointment by department (simplified model)
    const departmentRates: Record<string, number> = {
      'Cardiology': 300,
      'Neurology': 350,
      'Orthopedics': 250,
      'Pediatrics': 150,
      'General Medicine': 100,
      'Emergency': 200,
      'Dermatology': 120,
      'Oncology': 400,
      'Radiology': 180,
      'Surgery': 500,
    };

    appointments.forEach(apt => {
      const dept = apt.department || 'General Medicine';
      const rate = departmentRates[dept] || 100;
      departmentRevenue[dept] = (departmentRevenue[dept] || 0) + rate;
    });

    // If no revenue data, return empty array
    if (Object.keys(departmentRevenue).length === 0) {
      return [];
    }

    return Object.entries(departmentRevenue)
      .map(([department, revenue]) => ({
        department,
        revenue,
      }))
      .sort((a, b) => b.revenue - a.revenue);
  },

  // Fetch Drug Recalls - from external API (OpenFDA)
  // Falls back to mock data if API fails
  async fetchDrugRecalls(): Promise<DrugRecallData[]> {
    try {
      const response = await fetch(
        'https://api.fda.gov/drug/enforcement.json?search=status:Ongoing&limit=5'
      );

      if (!response.ok) {
        throw new Error('Failed to fetch drug recalls');
      }

      const data = await response.json();

      // Process FDA data into our format
      const recalls = data.results || [];
      const drugClassCounts: Record<string, number> = {};

      recalls.forEach((recall: { product_type?: string; product_description?: string }) => {
        // Extract drug class from product description or type
        const description = recall.product_description || '';
        let drugClass = 'Other';

        if (description.toLowerCase().includes('antibiotic')) drugClass = 'Antibiotics';
        else if (description.toLowerCase().includes('pain') || description.toLowerCase().includes('analgesic')) drugClass = 'Pain Relievers';
        else if (description.toLowerCase().includes('cardio') || description.toLowerCase().includes('heart')) drugClass = 'Cardiovascular';
        else if (description.toLowerCase().includes('diabetes') || description.toLowerCase().includes('insulin')) drugClass = 'Diabetes';
        else if (description.toLowerCase().includes('mental') || description.toLowerCase().includes('psych')) drugClass = 'Mental Health';

        drugClassCounts[drugClass] = (drugClassCounts[drugClass] || 0) + 1;
      });

      // If no data from API, use fallback
      if (Object.keys(drugClassCounts).length === 0) {
        return getMockDrugRecalls();
      }

      return Object.entries(drugClassCounts).map(([drugClass, recallCount]) => ({
        drugClass,
        recallCount,
        lastUpdated: new Date().toISOString(),
      }));
    } catch (error) {
      console.warn('Failed to fetch drug recalls from API, using mock data:', error);
      return getMockDrugRecalls();
    }
  },
};

// Mock drug recalls fallback
function getMockDrugRecalls(): DrugRecallData[] {
  return [
    { drugClass: 'Antibiotics', recallCount: 12, lastUpdated: new Date().toISOString() },
    { drugClass: 'Pain Relievers', recallCount: 8, lastUpdated: new Date().toISOString() },
    { drugClass: 'Cardiovascular', recallCount: 15, lastUpdated: new Date().toISOString() },
    { drugClass: 'Diabetes', recallCount: 6, lastUpdated: new Date().toISOString() },
    { drugClass: 'Mental Health', recallCount: 9, lastUpdated: new Date().toISOString() },
  ];
}

export default reportsServices;
