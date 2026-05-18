// ── Mock data matching the API contract exactly ──

export const mockPatients = [
  {
    patient_id: 'P001', name: 'Arjun Mehta', age: 58,
    vitals: { heart_rate: 145, systolic_bp: 180, diastolic_bp: 110, oxygen_saturation: 88.0, temperature: 37.2, symptoms: ['chest_pain'] },
    arrival_time: 0, priority_score: 93.0, severity: 'CRITICAL', burst_time: 15, pid: 1,
    waiting_time: 0, turnaround_time: 0, start_time: null, finish_time: null, status: 'in_treatment', last_priority_bump: 0
  },
  {
    patient_id: 'P002', name: 'Priya Sharma', age: 34,
    vitals: { heart_rate: 72, systolic_bp: 118, diastolic_bp: 78, oxygen_saturation: 98.5, temperature: 38.9, symptoms: ['fever'] },
    arrival_time: 2, priority_score: 58.0, severity: 'MEDIUM', burst_time: 8, pid: 2,
    waiting_time: 5, turnaround_time: 0, start_time: null, finish_time: null, status: 'waiting', last_priority_bump: 0
  },
  {
    patient_id: 'P003', name: 'Ravi Kumar', age: 67,
    vitals: { heart_rate: 40, systolic_bp: 85, diastolic_bp: 55, oxygen_saturation: 82.0, temperature: 36.1, symptoms: ['stroke', 'breathing_difficulty'] },
    arrival_time: 1, priority_score: 100.0, severity: 'CRITICAL', burst_time: 25, pid: 3,
    waiting_time: 0, turnaround_time: 26, start_time: 0, finish_time: 26, status: 'done', last_priority_bump: 0
  },
  {
    patient_id: 'P004', name: 'Sneha Iyer', age: 22,
    vitals: { heart_rate: 88, systolic_bp: 115, diastolic_bp: 75, oxygen_saturation: 99.0, temperature: 36.8, symptoms: ['laceration'] },
    arrival_time: 5, priority_score: 56.0, severity: 'MEDIUM', burst_time: 6, pid: 4,
    waiting_time: 12, turnaround_time: 0, start_time: null, finish_time: null, status: 'waiting', last_priority_bump: 0
  },
  {
    patient_id: 'P005', name: 'Vikram Nair', age: 45,
    vitals: { heart_rate: 112, systolic_bp: 155, diastolic_bp: 95, oxygen_saturation: 91.0, temperature: 37.5, symptoms: ['breathing_difficulty'] },
    arrival_time: 3, priority_score: 83.0, severity: 'HIGH', burst_time: 12, pid: 5,
    waiting_time: 2, turnaround_time: 0, start_time: null, finish_time: null, status: 'waiting', last_priority_bump: 0
  },
  {
    patient_id: 'P006', name: 'Ananya Das', age: 29,
    vitals: { heart_rate: 78, systolic_bp: 122, diastolic_bp: 80, oxygen_saturation: 97.0, temperature: 39.5, symptoms: ['abdominal_pain'] },
    arrival_time: 4, priority_score: 62.0, severity: 'MEDIUM', burst_time: 10, pid: 6,
    waiting_time: 8, turnaround_time: 0, start_time: null, finish_time: null, status: 'waiting', last_priority_bump: 0
  },
  {
    patient_id: 'P007', name: 'Suresh Pillai', age: 71,
    vitals: { heart_rate: 160, systolic_bp: 195, diastolic_bp: 120, oxygen_saturation: 85.0, temperature: 36.5, symptoms: ['chest_pain', 'breathing_difficulty'] },
    arrival_time: 0, priority_score: 100.0, severity: 'CRITICAL', burst_time: 20, pid: 7,
    waiting_time: 0, turnaround_time: 0, start_time: 0, finish_time: null, status: 'in_treatment', last_priority_bump: 0
  },
  {
    patient_id: 'P008', name: 'Kavitha Rao', age: 16,
    vitals: { heart_rate: 95, systolic_bp: 108, diastolic_bp: 70, oxygen_saturation: 96.0, temperature: 38.1, symptoms: ['allergic_reaction'] },
    arrival_time: 6, priority_score: 70.0, severity: 'HIGH', burst_time: 8, pid: 8,
    waiting_time: 6, turnaround_time: 0, start_time: null, finish_time: null, status: 'waiting', last_priority_bump: 0
  },
  {
    patient_id: 'P009', name: 'Deepak Menon', age: 52,
    vitals: { heart_rate: 65, systolic_bp: 130, diastolic_bp: 85, oxygen_saturation: 94.0, temperature: 37.0, symptoms: ['headache'] },
    arrival_time: 8, priority_score: 62.0, severity: 'MEDIUM', burst_time: 7, pid: 9,
    waiting_time: 18, turnaround_time: 0, start_time: null, finish_time: null, status: 'waiting', last_priority_bump: 1
  },
  {
    patient_id: 'P010', name: 'Lalitha Bhat', age: 63,
    vitals: { heart_rate: 50, systolic_bp: 90, diastolic_bp: 60, oxygen_saturation: 89.0, temperature: 36.3, symptoms: ['stroke'] },
    arrival_time: 2, priority_score: 93.0, severity: 'CRITICAL', burst_time: 22, pid: 10,
    waiting_time: 0, turnaround_time: 0, start_time: 2, finish_time: null, status: 'in_treatment', last_priority_bump: 0
  },
  {
    patient_id: 'P011', name: 'Manish Gupta', age: 38,
    vitals: { heart_rate: 82, systolic_bp: 125, diastolic_bp: 82, oxygen_saturation: 98.0, temperature: 37.1, symptoms: ['fracture'] },
    arrival_time: 10, priority_score: 60.0, severity: 'MEDIUM', burst_time: 9, pid: 11,
    waiting_time: 14, turnaround_time: 0, start_time: null, finish_time: null, status: 'waiting', last_priority_bump: 0
  },
  {
    patient_id: 'P012', name: 'Sujata Kulkarni', age: 44,
    vitals: { heart_rate: 105, systolic_bp: 145, diastolic_bp: 92, oxygen_saturation: 93.0, temperature: 38.5, symptoms: ['breathing_difficulty', 'fever'] },
    arrival_time: 7, priority_score: 81.0, severity: 'HIGH', burst_time: 14, pid: 12,
    waiting_time: 3, turnaround_time: 0, start_time: null, finish_time: null, status: 'waiting', last_priority_bump: 0
  },
  {
    patient_id: 'P013', name: 'Ajay Tiwari', age: 19,
    vitals: { heart_rate: 75, systolic_bp: 112, diastolic_bp: 72, oxygen_saturation: 99.5, temperature: 36.9, symptoms: ['laceration', 'abdominal_pain'] },
    arrival_time: 12, priority_score: 62.0, severity: 'MEDIUM', burst_time: 5, pid: 13,
    waiting_time: 10, turnaround_time: 0, start_time: null, finish_time: null, status: 'waiting', last_priority_bump: 0
  },
  {
    patient_id: 'P014', name: 'Rekha Pandey', age: 55,
    vitals: { heart_rate: 130, systolic_bp: 170, diastolic_bp: 105, oxygen_saturation: 87.0, temperature: 37.8, symptoms: ['chest_pain', 'allergic_reaction'] },
    arrival_time: 1, priority_score: 96.0, severity: 'CRITICAL', burst_time: 18, pid: 14,
    waiting_time: 0, turnaround_time: 19, start_time: 1, finish_time: 20, status: 'done', last_priority_bump: 0
  },
  {
    patient_id: 'P015', name: 'Harish Venkat', age: 80,
    vitals: { heart_rate: 48, systolic_bp: 80, diastolic_bp: 50, oxygen_saturation: 80.0, temperature: 35.5, symptoms: ['stroke', 'chest_pain'] },
    arrival_time: 0, priority_score: 100.0, severity: 'CRITICAL', burst_time: 30, pid: 15,
    waiting_time: 0, turnaround_time: 30, start_time: 0, finish_time: 30, status: 'done', last_priority_bump: 0
  },
]

export const mockSimState = {
  clock: 32,
  status: 'running',
  num_doctors: 2,
  scheduler: 'priority',
  queue: {
    waiting: ['P002', 'P004', 'P005', 'P006', 'P008', 'P009', 'P011', 'P012', 'P013'],
    in_treatment: ['P001', 'P007', 'P010'],
    done: ['P003', 'P014', 'P015'],
  },
  gantt: [
    { patient_id: 'P015', doctor_id: 1, start: 0, end: 5 },
    { patient_id: 'P003', doctor_id: 2, start: 0, end: 5 },
    { patient_id: 'P015', doctor_id: 1, start: 5, end: 10 },
    { patient_id: 'P014', doctor_id: 2, start: 5, end: 10 },
    { patient_id: 'P015', doctor_id: 1, start: 10, end: 15 },
    { patient_id: 'P003', doctor_id: 2, start: 10, end: 15 },
    { patient_id: 'P015', doctor_id: 1, start: 15, end: 20 },
    { patient_id: 'P014', doctor_id: 2, start: 15, end: 20 },
    { patient_id: 'P001', doctor_id: 1, start: 20, end: 25 },
    { patient_id: 'P007', doctor_id: 2, start: 20, end: 25 },
    { patient_id: 'P015', doctor_id: 1, start: 25, end: 30 },
    { patient_id: 'P010', doctor_id: 2, start: 25, end: 30 },
    { patient_id: 'P001', doctor_id: 1, start: 30, end: 32 },
    { patient_id: 'P007', doctor_id: 2, start: 30, end: 32 },
  ],
  stats: {
    avg_waiting_time: 4.67,
    avg_turnaround_time: 22.33,
    throughput: 3,
  },
  aged_patients: ['P009'],
}

export const mockAlgoCompare = {
  input_size: 15,
  selection_sort: {
    time_ms: 0.0312,
    time_complexity: 'O(n²)',
    space_complexity: 'O(1)',
    comparisons: 105,
    best_for: 'Small batches ≤ 10 patients',
    steps: [
      { pass: 0, swapped: ['P015', 'P001'], queue_snapshot: ['P015', 'P003', 'P014', 'P007', 'P010', 'P001'] },
      { pass: 1, swapped: ['P003', 'P014'], queue_snapshot: ['P015', 'P003', 'P014', 'P007', 'P010', 'P001'] },
      { pass: 2, swapped: ['P014', 'P007'], queue_snapshot: ['P015', 'P003', 'P014', 'P007', 'P010', 'P001'] },
    ],
  },
  merge_sort: {
    time_ms: 0.0187,
    time_complexity: 'O(n log n)',
    space_complexity: 'O(n)',
    comparisons: 49,
    best_for: 'Large queues > 10 patients',
    steps: [
      { merged_ids: ['P015', 'P003'] },
      { merged_ids: ['P014', 'P007'] },
      { merged_ids: ['P015', 'P003', 'P014', 'P007'] },
    ],
  },
  winner: 'merge_sort',
  note: 'Selection Sort wins for tiny n due to lower constant factor. Merge Sort wins for n > 10.',
}
