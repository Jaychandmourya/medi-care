import { patientService } from '@/services/patientServices'

export const getPatientNameById = async (patientId?: string): Promise<string | undefined> => {
  if (!patientId) return undefined
  
  try {
    const patient = await patientService.getPatientByPatientId(patientId)
    return patient?.name
  } catch (error) {
    console.error('Error fetching patient name:', error)
    return undefined
  }
}

export const getPatientNamesForBeds = async (beds: Array<{ patientId?: string }>): Promise<Map<string, string>> => {
  const patientNameMap = new Map<string, string>()
  
  const uniquePatientIds = [...new Set(beds.map(bed => bed.patientId).filter(Boolean))]
  
  await Promise.all(
    uniquePatientIds.map(async (patientId) => {
      if (patientId) {
        const patientName = await getPatientNameById(patientId)
        if (patientName) {
          patientNameMap.set(patientId, patientName)
        }
      }
    })
  )
  
  return patientNameMap
}
