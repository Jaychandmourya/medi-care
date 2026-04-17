import { ROLE_THEME } from "@/utils/theme";

// Import type file
import type { RootState } from "@/app/store";

import { useAppSelector } from "@/app/hooks";

// Import components
import PatientList from "@/components/admin/patient/PatientList";

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