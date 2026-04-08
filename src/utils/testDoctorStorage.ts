/**
 * Test script to verify doctor localStorage functionality
 * Run this in browser console or as part of your testing
 */

import { getDoctorInfo, getCurrentDoctorId, getCurrentDoctorName, isCurrentUserDoctor } from './doctorStorage'

// Test function to verify localStorage functionality
export const testDoctorStorage = () => {
  console.log('=== Testing Doctor Storage Functionality ===')
  
  // Test 1: Check if user is doctor
  const isDoctor = isCurrentUserDoctor()
  console.log('Is current user doctor:', isDoctor)
  
  // Test 2: Get doctor info
  const doctorInfo = getDoctorInfo()
  console.log('Doctor info from localStorage:', doctorInfo)
  
  // Test 3: Get doctor ID
  const doctorId = getCurrentDoctorId()
  console.log('Current doctor ID:', doctorId)
  
  // Test 4: Get doctor name
  const doctorName = getCurrentDoctorName()
  console.log('Current doctor name:', doctorName)
  
  // Test 5: Check localStorage contents
  const userStorage = localStorage.getItem('user')
  const doctorStorage = localStorage.getItem('doctorInfo')
  
  console.log('User localStorage:', userStorage ? JSON.parse(userStorage) : null)
  console.log('Doctor localStorage:', doctorStorage ? JSON.parse(doctorStorage) : null)
  
  console.log('=== Test Complete ===')
}

// Auto-test after login (call this after successful doctor login)
export const verifyDoctorLogin = () => {
  setTimeout(() => {
    testDoctorStorage()
  }, 1000) // Wait 1 second for localStorage to be set
}
