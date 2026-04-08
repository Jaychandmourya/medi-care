import PatientsTodayCard from "@/components/admin/dashboard/PatientsTodayCard";
import BedOccupancyChart from "@/components/admin/dashboard/BedOccupancyChart";
import OPDQueueWidget from "@/components/admin/dashboard/OPDQueueWidget";
import RevenueChart from "@/components/admin/dashboard/RevenueChart";
import TopDepartmentsChart from "@/components/admin/dashboard/TopDepartmentsChart";
import AlertsPanel from "@/components/admin/dashboard/AlertsPanel";
import DoctorAvailability from "@/components/admin/dashboard/DoctorAvailability";
import { useDashboardData } from "@/hooks/useDashboardData";


const AdminDashboard = () => {
    const { data, loading } = useDashboardData();

    if (loading) {
      return (
        <div className="p-6 flex items-center justify-center">
          <div className="text-lg">Loading dashboard data...</div>
        </div>
      );
    }

    return (
      <>
        <div className="p-6 grid grid-cols-3 gap-6">
          <PatientsTodayCard total={data.patientsToday} />
          <BedOccupancyChart occupied={data.bedOccupancy.occupied} available={data.bedOccupancy.available} maintenance={data.bedOccupancy.maintenance} />
          <OPDQueueWidget queueCount={data.opdQueueCount} />

          <div className="col-span-1">
            <RevenueChart data={data.revenueData} />
          </div>

          <TopDepartmentsChart data={data.departmentData} />

          <DoctorAvailability doctors={data.doctorAvailability}/>

          <div className="col-span-3">
            <AlertsPanel alerts={data.alerts} />
          </div>

        </div>
      </>
    )
}

export default AdminDashboard