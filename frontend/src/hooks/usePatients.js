import { useState, useEffect, useCallback } from 'react'
import { getPatients, addPatient } from '../api/endpoints'

export function usePatients() {
  const [patients, setPatients] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchPatients = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getPatients()
      setPatients(data)
    } catch (err) {
      setError(err.message || 'Failed to fetch patients')
      console.error('Failed to fetch patients:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPatients()
  }, [fetchPatients])

  const handleAddPatient = useCallback(async (patientData) => {
    try {
      const newPatient = await addPatient(patientData)
      setPatients((prev) => [...prev, newPatient])
      return newPatient
    } catch (err) {
      console.error('Failed to add patient:', err)
      throw err
    }
  }, [])

  // Derived data
  const waitingPatients = patients.filter((p) => p.status === 'waiting')
  const treatingPatients = patients.filter((p) => p.status === 'in_treatment')
  const donePatients = patients.filter((p) => p.status === 'done')

  const sortedByPriority = [...patients].sort(
    (a, b) => b.priority_score - a.priority_score
  )

  const severityCounts = patients.reduce(
    (acc, p) => {
      acc[p.severity] = (acc[p.severity] || 0) + 1
      return acc
    },
    { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 }
  )

  return {
    patients,
    sortedByPriority,
    waitingPatients,
    treatingPatients,
    donePatients,
    severityCounts,
    isLoading,
    error,
    addPatient: handleAddPatient,
    refresh: fetchPatients,
  }
}
