import { ROLE_CONFIG } from "@/constants/roleMenuConfig";
import type { Role } from "@/types/auth/auth";

export const getRoleColors = (role: Role) => {
  const colorConfig = ROLE_CONFIG[role]?.color || 'blue';
  
  const colorMap = {
    blue: {
      primary: 'from-blue-500 to-blue-600',
      secondary: 'bg-blue-600 hover:bg-blue-700',
      light: 'bg-blue-50 border-blue-200',
      text: 'text-blue-700',
      progress: 'from-blue-500 to-purple-600',
      gradient: 'from-blue-500 to-purple-600'
    },
    green: {
      primary: 'from-green-500 to-green-600',
      secondary: 'bg-green-600 hover:bg-green-700',
      light: 'bg-green-50 border-green-200',
      text: 'text-green-700',
      progress: 'from-green-500 to-green-600',
      gradient: 'from-green-500 to-green-600'
    },
    purple: {
      primary: 'from-purple-500 to-purple-600',
      secondary: 'bg-purple-600 hover:bg-purple-700',
      light: 'bg-purple-50 border-purple-200',
      text: 'text-purple-700',
      progress: 'from-purple-500 to-purple-600',
      gradient: 'from-purple-500 to-purple-600'
    },
    orange: {
      primary: 'from-orange-500 to-orange-600',
      secondary: 'bg-orange-600 hover:bg-orange-700',
      light: 'bg-orange-50 border-orange-200',
      text: 'text-orange-700',
      progress: 'from-orange-500 to-orange-600',
      gradient: 'from-orange-500 to-orange-600'
    }
  };

  return colorMap[colorConfig as keyof typeof colorMap] || colorMap.blue;
};
