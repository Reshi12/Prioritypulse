import { api, MOCK } from './client'
import { mockPatients, mockSimState, mockAlgoCompare } from './mocks'

// ── Patient endpoints ──
export const getPatients = () =>
  MOCK ? Promise.resolve(mockPatients) : api.get('/patients')

export const addPatient = (data) =>
  MOCK
    ? Promise.resolve({
        ...data,
        patient_id: `P${String(Date.now()).slice(-3)}`,
        priority_score: Math.round(Math.random() * 40 + 60),
        severity: 'HIGH',
        status: 'waiting',
        waiting_time: 0,
        turnaround_time: 0,
        pid: Date.now(),
      })
    : api.post('/patients', data)

// ── Simulation endpoints ──
export const startSim = (params) =>
  MOCK ? Promise.resolve({ ok: true, clock: 0 }) : api.post('/simulation/start', params)

export const pauseSim = () =>
  MOCK ? Promise.resolve({ ok: true, clock: mockSimState.clock }) : api.post('/simulation/pause')

export const stepSim = () =>
  MOCK
    ? Promise.resolve({ ok: true, clock: mockSimState.clock + 1 })
    : api.post('/simulation/step')

export const resetSim = () =>
  MOCK ? Promise.resolve({ ok: true, clock: 0 }) : api.post('/simulation/reset')

export const getSimState = () =>
  MOCK ? Promise.resolve(mockSimState) : api.get('/simulation/state')

// ── Algorithm endpoints ──
export const compareAlgo = (patientIds) =>
  MOCK
    ? Promise.resolve(mockAlgoCompare)
    : api.post('/algorithms/compare', { patient_ids: patientIds })
