import { api, MOCK } from './client'
import { mockPatients, mockSimState, mockAlgoCompare } from './mocks'

const SYMPTOM_WEIGHTS = {
  stroke: 30,
  chest_pain: 28,
  breathing_difficulty: 25,
  allergic_reaction: 20,
  abdominal_pain: 12,
  fracture: 10,
  fever: 8,
  laceration: 6,
  headache: 4,
  none: 0,
}

function calculatePriority(vitals, age = 30) {
  let score = 15.0

  // 1. Step-wise scoring based on clinically meaningful deviations
  const hr = vitals.heart_rate || 80
  if (hr < 40 || hr > 150) {
    score += 18
  } else if (hr < 60 || hr > 120) {
    score += 10
  } else if (hr < 50 || hr > 100) {
    score += 5
  }

  const sbp = vitals.systolic_bp || 120
  if (sbp < 80 || sbp > 180) {
    score += 15
  } else if (sbp < 90 || sbp > 160) {
    score += 8
  } else if (sbp < 100 || sbp > 140) {
    score += 4
  }

  const spo2 = vitals.oxygen_saturation || 98
  if (spo2 < 85) {
    score += 22
  } else if (spo2 < 90) {
    score += 15
  } else if (spo2 < 95) {
    score += 8
  }

  // Temperature step (max +10)
  const temp = vitals.temperature || 37.0
  if (temp > 39.0 || temp < 35.0) {
    score += 10
  } else if (temp > 38.0 || temp < 36.0) {
    score += 5
  }

  // Age risk step (max +8)
  if (age >= 65 || age <= 5) {
    score += 8
  }

  const symptoms = vitals.symptoms || []
  const maxSymptomScore = symptoms.reduce((max, s) => {
    const val = typeof s === 'string' ? s : s?.value || 'none'
    return Math.max(max, SYMPTOM_WEIGHTS[val] || 0)
  }, 0)
  score += Math.min(28, maxSymptomScore)

  // 2. Continuous fine-grained vital tie-breakers (max ~10-15 points)
  const hr_tb = Math.abs(hr - 80) * 0.05
  const dbp = vitals.diastolic_bp || 80
  const bp_tb = Math.abs(sbp - 120) * 0.03 + Math.abs(dbp - 80) * 0.02
  const o2_tb = (100.0 - spo2) * 0.25
  const temp_tb = Math.abs(temp - 37.0) * 0.5
  const age_tb = age > 50 ? (age * 0.02) : (age < 5 ? (5 - age) * 0.1 : 0)

  score += (hr_tb + bp_tb + o2_tb + temp_tb + age_tb)

  // Caps
  score = Math.min(100.0, Math.max(0.0, score))
  score = Math.round(score * 100) / 100

  // Severity
  let severity = 'LOW'
  if (score >= 70.0) {
    severity = 'CRITICAL'
  } else if (score >= 45.0) {
    severity = 'HIGH'
  } else if (score >= 25.0) {
    severity = 'MEDIUM'
  }

  return { priority_score: score, severity }
}

// ── Patient endpoints ──
export const getPatients = () =>
  MOCK ? Promise.resolve(mockPatients) : api.get('/patients')

export const addPatient = (data) => {
  if (MOCK) {
    const { priority_score, severity } = calculatePriority(data.vitals, data.age)
    return Promise.resolve({
      ...data,
      patient_id: `P${String(Date.now()).slice(-3)}`,
      priority_score,
      severity,
      status: 'waiting',
      waiting_time: 0,
      turnaround_time: 0,
      pid: Date.now(),
    })
  }
  return api.post('/patients', data)
}

export const deletePatient = (patientId) =>
  MOCK ? Promise.resolve({ ok: true }) : api.delete(`/patients/${patientId}`)


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
