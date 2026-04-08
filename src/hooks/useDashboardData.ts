import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { doctorDBOperations } from '@/services/doctorServices';
import { db } from '@/features/db/dexie';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';

interface Appointment {
  id: string;
  date: string;
  status: string;
  department?: string;
  patientId: string;
  createdAt: string;
}

interface Doctor {
  id?: string;
  npi: string;
  firstName: string;
  lastName: string;
  specialty?: string;
  department: string;
  addedAt: string;
}

interface Bed {
  bedId: string;
  status: string;
  admittedAt?: string;
}

interface Patient {
  id: string;
  patientId: string;
  name?: string;
  createdAt: string;
}

interface DashboardData {
  patientsToday: number;
  bedOccupancy: { occupied: number; available: number; maintenance: number };
  opdQueueCount: number;
  revenueData: Array<{ month: string; revenue: number }>;
  departmentData: Array<{ name: string; patients: number }>;
  alerts: Array<{ id: string; message: string; time: string; type?: 'info' | 'warning' | 'error' | 'success' }>;
  doctorAvailability: Array<{ id: string; name: string; specialty: string; available: boolean; department?: string; nextAvailable?: string }>;
}

export const useDashboardData = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DashboardData>({
    patientsToday: 0,
    bedOccupancy: { occupied: 0, available: 0, maintenance: 0 },
    opdQueueCount: 0,
    revenueData: [],
    departmentData: [],
    alerts: [],
    doctorAvailability: []
  });

  const cacheRef = useRef<{
    data: DashboardData | null;
    timestamp: number;
  }>({ data: null, timestamp: 0 });

  const CACHE_DURATION = 30000; // 30 seconds cache

  const today = useMemo(() => format(new Date(), 'yyyy-MM-dd'), []);
  const now = useMemo(() => new Date(), []);
  const todayString = useMemo(() => now.toDateString(), [now]);

  const processDashboardData = useCallback((
    allAppointments: Appointment[],
    allDoctors: Doctor[],
    allBeds: Bed[],
    allPatients: Patient[]
  ): DashboardData => {
    // Create lookup maps for O(1) access
    const patientMap = new Map(allPatients.map(p => [p.id, p]));

    // Calculate patients today (patients added today)
    const patientsToday = allPatients.reduce((count, patient) => {
      const createdDate = new Date(patient.createdAt).toISOString().split('T')[0];
      return createdDate === today ? count + 1 : count;
    }, 0);

    // Calculate bed occupancy in single pass
    const bedStats = allBeds.reduce((acc, bed) => {
      if (bed.status === 'occupied') acc.occupied++;
      else if (bed.status === 'maintenance') acc.maintenance++;
      return acc;
    }, { occupied: 0, maintenance: 0 });

    const totalBeds = allBeds.length;
    const bedOccupancy = {
      occupied: bedStats.occupied,
      maintenance: bedStats.maintenance,
      available: totalBeds - bedStats.occupied - bedStats.maintenance
    };

    // Calculate OPD queue count
    const opdQueueCount = allAppointments.reduce((count, apt) => {
      return apt.date === today && (apt.status === 'scheduled' || apt.status === 'in_progress')
        ? count + 1 : count;
    }, 0);

    // Generate revenue data with optimized filtering
    const revenueData: Array<{ month: string; revenue: number }> = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(now, i);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);

      const monthAppointments = allAppointments.filter(apt => {
        const aptDate = new Date(apt.date);
        return aptDate >= monthStart && aptDate <= monthEnd && apt.status === 'completed';
      });

      revenueData.push({
        month: format(monthDate, 'MMM'),
        revenue: monthAppointments.length * 150 // Assuming $150 per consultation
      });
    }

    // Generate department data with Map for efficiency
    const departmentMap = allAppointments.reduce((map, apt) => {
      if (apt.department) {
        map.set(apt.department, (map.get(apt.department) || 0) + 1);
      }
      return map;
    }, new Map<string, number>());

    const departmentData = Array.from(departmentMap.entries())
      .map(([name, patients]) => ({ name, patients }))
      .sort((a, b) => b.patients - a.patients)
      .slice(0, 5);

    // Generate alerts with optimized lookups
    const alerts: DashboardData['alerts'] = [];

    // Process recent appointments
    const recentAppointments = allAppointments
      .filter(apt => apt.date === today)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    recentAppointments.forEach((apt) => {
      const patient = patientMap.get(apt.patientId);
      const patientName = patient?.name || `Patient ${apt.patientId}`;

      const alertConfig = {
        completed: { type: 'success' as const, message: `Appointment completed for ${patientName}` },
        scheduled: { type: 'info' as const, message: `New appointment scheduled for ${patientName}` },
        cancelled: { type: 'warning' as const, message: `Appointment cancelled for ${patientName}` },
        confirmed: { type: 'success' as const, message: `Appointment confirmed for ${patientName}` }
      };

      const config = alertConfig[apt.status as keyof typeof alertConfig];
      if (config) {
        alerts.push({
          id: apt.id,
          message: config.message,
          time: apt.createdAt,
          type: config.type
        });
      }
    });

    // Add bed status alerts
    const recentBedChanges = allBeds
      .filter(bed => bed.admittedAt && new Date(bed.admittedAt).toDateString() === todayString)
      .slice(0, 2);

    recentBedChanges.forEach(bed => {
      alerts.push({
        id: `bed-${bed.bedId}`,
        message: `Bed ${bed.bedId} ${bed.status === 'occupied' ? 'occupied' : 'freed'}`,
        time: bed.admittedAt || now.toISOString(),
        type: bed.status === 'occupied' ? 'warning' : 'info'
      });
    });

    // Calculate doctor availability with memoized random values
    const doctorAvailability = allDoctors.map(doctor => ({
      id: doctor.id || doctor.npi || '',
      name: `${doctor.firstName} ${doctor.lastName}`.trim(),
      specialty: doctor.specialty || 'General Practitioner',
      department: doctor.department || 'General',
      available: Math.random() > 0.3, // Mock availability
      nextAvailable: Math.random() > 0.3 ? 'Now' : `${Math.floor(Math.random() * 4) + 1}:00 PM`
    }));

    return {
      patientsToday,
      bedOccupancy,
      opdQueueCount,
      revenueData,
      departmentData,
      alerts: alerts.slice(0, 5),
      doctorAvailability
    };
  }, [today, now, todayString]);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Check cache first
      const now = Date.now();
      if (cacheRef.current.data &&
          now - cacheRef.current.timestamp < CACHE_DURATION) {
        setData(cacheRef.current.data);
        setLoading(false);
        return;
      }

      // Ensure database is open
      if (!db.isOpen()) {
        await db.open();
      }

      // Fetch all data in parallel
      const [
        allAppointments,
        allDoctors,
        allBeds,
        allPatients
      ] = await Promise.all([
        db.appointments.toArray(),
        doctorDBOperations.getAll(),
        db.beds.toArray(),
        db.patients.toArray()
      ]);

      // Process data
      const processedData = processDashboardData(
        allAppointments,
        allDoctors,
        allBeds,
        allPatients
      );

      // Update cache and state
      cacheRef.current = {
        data: processedData,
        timestamp: now
      };

      setData(processedData);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch dashboard data';
      console.error('Error fetching dashboard data:', error);
      setError(errorMessage);

      // Set fallback data
      setData({
        patientsToday: 0,
        bedOccupancy: { occupied: 0, available: 0, maintenance: 0 },
        opdQueueCount: 0,
        revenueData: [],
        departmentData: [],
        alerts: [{ id: 'error', message: errorMessage, time: new Date().toISOString(), type: 'error' }],
        doctorAvailability: []
      });
    } finally {
      setLoading(false);
    }
  }, [processDashboardData]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Add refresh functionality
  const refresh = useCallback(() => {
    cacheRef.current = { data: null, timestamp: 0 };
    fetchDashboardData();
  }, [fetchDashboardData]);

  return { data, loading, error, refresh };
};
