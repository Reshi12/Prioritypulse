import { useState } from 'react'
import {
  UserPlus, Menu, X, Activity,
  LayoutDashboard, GitCompareArrows, TrendingUp, BarChart3, Stethoscope
} from 'lucide-react'
import { usePatients } from '../hooks/usePatients'
import { useSimulation } from '../hooks/useSimulation'
import QueuePanel from '../components/QueuePanel'
import GanttChart from '../components/GanttChart'
import AlgoComparison from '../components/AlgoComparison'
import ComplexityPanel from '../components/ComplexityPanel'
import SimControls from '../components/SimControls'
import AddPatientForm from '../components/AddPatientForm'
import StatsPanel from '../components/StatsPanel'
import PatientCard from '../components/PatientCard'

const TABS = [
  { key: 'overview', label: 'Overview', icon: LayoutDashboard },
  { key: 'patients', label: 'Patients', icon: Stethoscope },
  { key: 'gantt', label: 'Gantt Chart', icon: BarChart3 },
  { key: 'algorithms', label: 'Algorithms', icon: GitCompareArrows },
  { key: 'complexity', label: 'Complexity', icon: TrendingUp },
]

export default function Dashboard() {
  const { patients: initialPatients, addPatient, deletePatient, refresh: refreshPatients } = usePatients()
  const {
    simState, isConnected, isLoading,
    onStart, onPause, onStep, onReset
  } = useSimulation()

  const [activeTab, setActiveTab] = useState('overview')
  const [showAddForm, setShowAddForm] = useState(false)
  const [numDoctors, setNumDoctors] = useState(2)
  const [scheduler, setScheduler] = useState('priority')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Use live simulation patients if available, otherwise initial loaded patients
  const patients = simState?.patients && simState.patients.length > 0
    ? simState.patients
    : initialPatients

  const agedPatients = simState?.aged_patients || []

  const handleAddPatient = async (data) => {
    await addPatient(data)
    await refreshPatients()
  }

  const handleDeletePatient = async (patientId) => {
    if (window.confirm(`Are you sure you want to remove patient ${patientId}?`)) {
      try {
        await deletePatient(patientId)
      } catch (err) {
        alert('Failed to remove patient: ' + err.message)
      }
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* ── Top Navigation Bar ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(10, 14, 26, 0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '0 24px',
      }}>
        <div style={{
          maxWidth: '1440px', margin: '0 auto',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          height: '64px',
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '38px', height: '38px', borderRadius: '10px',
              background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.3)',
            }}>
              <Activity size={20} color="white" />
            </div>
            <div>
              <h1 style={{
                fontSize: '1.1rem', fontWeight: '800', lineHeight: 1.2,
                background: 'linear-gradient(135deg, #f1f5f9, #94a3b8)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                PriorityPulse
              </h1>
              <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Hospital Triage System
              </p>
            </div>
          </div>

          {/* Desktop Tabs */}
          <nav className="tab-nav" style={{ display: 'none' }} id="desktop-nav">
            {TABS.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.key}
                  className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.key)}
                >
                  <Icon size={14} style={{ display: 'inline', verticalAlign: '-2px', marginRight: '4px' }} />
                  {tab.label}
                </button>
              )
            })}
          </nav>

          {/* Right Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Connection indicator */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '5px 12px', borderRadius: '999px',
              background: isConnected ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
              border: `1px solid ${isConnected ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
            }}>
              <div style={{
                width: '6px', height: '6px', borderRadius: '50%',
                background: isConnected ? '#10b981' : '#ef4444',
                boxShadow: isConnected ? '0 0 8px rgba(16,185,129,0.5)' : '0 0 8px rgba(239,68,68,0.5)',
              }} />
              <span style={{
                fontSize: '0.65rem', fontWeight: '600',
                color: isConnected ? '#10b981' : '#ef4444',
              }}>
                {isConnected ? 'Live' : 'Offline'}
              </span>
            </div>

            <button className="btn btn-primary btn-sm" onClick={() => setShowAddForm(true)}>
              <UserPlus size={14} />
              <span className="hide-mobile">Add Patient</span>
            </button>

            {/* Mobile menu toggle */}
            <button
              className="btn btn-ghost btn-icon show-mobile"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              id="mobile-menu-btn"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div id="mobile-menu" style={{
            padding: '12px', borderTop: '1px solid var(--border-subtle)',
            display: 'flex', flexWrap: 'wrap', gap: '6px',
          }}>
            {TABS.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.key}
                  className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}
                  onClick={() => { setActiveTab(tab.key); setMobileMenuOpen(false) }}
                  style={{ flex: '1 1 auto', minWidth: '100px' }}
                >
                  <Icon size={14} style={{ display: 'inline', verticalAlign: '-2px', marginRight: '4px' }} />
                  {tab.label}
                </button>
              )
            })}
          </div>
        )}
      </header>

      {/* ── Main Content ── */}
      <main style={{
        flex: 1, maxWidth: '1440px', width: '100%',
        margin: '0 auto', padding: '24px',
      }}>
        {/* ── Overview Tab ── */}
        {activeTab === 'overview' && (
          <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Top Row: Stats + Controls */}
            <div style={{
              display: 'grid', gap: '20px',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            }}>
              <SimControls
                simState={simState}
                isConnected={isConnected}
                isLoading={isLoading}
                onStart={onStart}
                onPause={onPause}
                onStep={onStep}
                onReset={onReset}
                numDoctors={numDoctors}
                setNumDoctors={setNumDoctors}
                scheduler={scheduler}
                setScheduler={setScheduler}
              />
              <StatsPanel simState={simState} patients={patients} />
            </div>

            {/* Queue Panel */}
            <QueuePanel
              patients={patients}
              agedPatients={agedPatients}
              simState={simState}
              onDeletePatient={handleDeletePatient}
            />

            {/* Gantt Chart */}
            <GanttChart
              ganttData={simState?.gantt || []}
              patients={patients}
              numDoctors={numDoctors}
            />
          </div>
        )}

        {/* ── Patients Tab ── */}
        {activeTab === 'patients' && (
          <div className="fade-in">
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: '20px',
            }}>
              <div>
                <h2 style={{ fontSize: '1.3rem', fontWeight: '800' }}>All Patients</h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {patients.length} patients registered · Sorted by priority score
                </p>
              </div>
            </div>
            <div style={{
              display: 'grid', gap: '14px',
              gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            }}>
              {[...patients]
                .sort((a, b) => b.priority_score - a.priority_score)
                .map((patient, idx) => (
                  <div key={patient.patient_id} className="fade-in" style={{ animationDelay: `${idx * 40}ms` }}>
                    <PatientCard
                      patient={patient}
                      isAged={agedPatients.includes(patient.patient_id)}
                      onDelete={() => handleDeletePatient(patient.patient_id)}
                    />
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ── Gantt Tab ── */}
        {activeTab === 'gantt' && (
          <div className="fade-in">
            <div style={{ marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: '800' }}>Treatment Timeline</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Gantt chart showing patient treatment schedule per doctor
              </p>
            </div>
            <GanttChart
              ganttData={simState?.gantt || []}
              patients={patients}
              numDoctors={numDoctors}
            />
          </div>
        )}

        {/* ── Algorithms Tab ── */}
        {activeTab === 'algorithms' && (
          <div className="fade-in">
            <div style={{ marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: '800' }}>Algorithm Analysis</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Selection Sort vs Merge Sort — DAA comparison
              </p>
            </div>
            <AlgoComparison patients={patients} />
          </div>
        )}

        {/* ── Complexity Tab ── */}
        {activeTab === 'complexity' && (
          <div className="fade-in">
            <div style={{ marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: '800' }}>Complexity Analysis</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Big-O time complexity comparison with visual charts
              </p>
            </div>
            <ComplexityPanel />
          </div>
        )}
      </main>

      {/* ── Footer ── */}
      <footer style={{
        padding: '16px 24px', borderTop: '1px solid var(--border-subtle)',
        textAlign: 'center', fontSize: '0.7rem', color: 'var(--text-muted)',
      }}>
        PriorityPulse — Hospital Triage System · DAA + OS Concepts
      </footer>

      {/* ── Add Patient Modal ── */}
      <AddPatientForm
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        onSubmit={handleAddPatient}
        nextPatientId={`P${String(Math.max(0, ...patients.map(p => parseInt(p.patient_id.replace(/\D/g, '')) || 0)) + 1).padStart(3, '0')}`}
      />

      {/* ── Responsive Styles ── */}
      <style>{`
        #desktop-nav { display: flex !important; }
        .show-mobile { display: none !important; }
        .hide-mobile { display: inline; }

        @media (max-width: 768px) {
          #desktop-nav { display: none !important; }
          .show-mobile { display: flex !important; }
          .hide-mobile { display: none !important; }
        }
      `}</style>
    </div>
  )
}
