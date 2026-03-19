import PatientsTodayCard from "@/components/admin/dashboard/PatientsTodayCard";
import BedOccupancyChart from "@/components/admin/dashboard/BedOccupancyChart";
import OPDQueueWidget from "@/components/admin/dashboard/OPDQueueWidget";
import RevenueChart from "@/components/admin/dashboard/RevenueChart";
import TopDepartmentsChart from "@/components/admin/dashboard/TopDepartmentsChart";
import AlertsPanel from "@/components/admin/dashboard/AlertsPanel";
import DoctorAvailability from "@/components/admin/dashboard/DoctorAvailability";
const AdminDashboard = () => {
    return (
      <>
        <div className="p-6 grid grid-cols-3 gap-6">
         <PatientsTodayCard total={128} />
          <BedOccupancyChart occupied={70} available={30} />
        <OPDQueueWidget queueCount={14} />

        <div className="col-span-1">
          <RevenueChart data={[
            { month: "Jan", revenue: 4000 },
            { month: "Feb", revenue: 3000 },
          ]} />
        </div>

        <TopDepartmentsChart data={[
          { name: "Cardiology", patients: 120 },
          { name: "Orthopedic", patients: 90 },
        ]} />

        <DoctorAvailability/>

        <div className="col-span-3">
          <AlertsPanel alerts={[
            { id: "1", message: "Bed 12 freed", time: "2 min ago" },
            { id: "2", message: "Emergency admitted", time: "5 min ago" },
          ]} />
        </div>

        </div>
      </>
    )
}

export default AdminDashboard