import PatientList from "@/components/admin/patient/PatientList";
import { useAppSelector } from "@/app/hooks";
import type { RootState } from "@/app/store";
import { ROLE_THEME } from "@/utils/theme";

const ReceptionistPatient = () => {
  const user = useAppSelector((state: RootState) => state.auth.user);
  const themeColors = user ? ROLE_THEME[user.role] : ROLE_THEME.receptionist;

  return (
    <div className={themeColors.text}>
      <PatientList />
    </div>
  )
}

export default ReceptionistPatient