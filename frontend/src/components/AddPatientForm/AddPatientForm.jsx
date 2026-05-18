import { useState } from 'react'
import { UserPlus, X, Heart, Droplets, Wind, Thermometer, AlertCircle, CheckCircle2 } from 'lucide-react'

const SYMPTOMS = [
  { value: 'chest_pain', label: 'Chest Pain' },
  { value: 'stroke', label: 'Stroke' },
  { value: 'breathing_difficulty', label: 'Breathing Difficulty' },
  { value: 'fracture', label: 'Fracture' },
  { value: 'fever', label: 'Fever' },
  { value: 'abdominal_pain', label: 'Abdominal Pain' },
  { value: 'laceration', label: 'Laceration' },
  { value: 'allergic_reaction', label: 'Allergic Reaction' },
  { value: 'headache', label: 'Headache' },
  { value: 'none', label: 'None' },
]

const initialForm = {
  name: '',
  age: '',
  heart_rate: '',
  systolic_bp: '',
  diastolic_bp: '',
  oxygen_saturation: '',
  temperature: '',
  symptoms: [],
  burst_time: '10',
}

export default function AddPatientForm({ isOpen, onClose, onSubmit, nextPatientId = `P${String(Date.now()).slice(-3)}` }) {
  const [form, setForm] = useState(initialForm)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null)

  if (!isOpen) return null

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const toggleSymptom = (symptom) => {
    setForm((prev) => {
      if (symptom === 'none') return { ...prev, symptoms: ['none'] }
      const filtered = prev.symptoms.filter((s) => s !== 'none')
      if (filtered.includes(symptom)) {
        return { ...prev, symptoms: filtered.filter((s) => s !== symptom) }
      }
      return { ...prev, symptoms: [...filtered, symptom] }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus(null)

    try {
      const patientData = {
        patient_id: nextPatientId,
        name: form.name,
        age: parseInt(form.age),
        vitals: {
          heart_rate: parseInt(form.heart_rate),
          systolic_bp: parseInt(form.systolic_bp),
          diastolic_bp: parseInt(form.diastolic_bp),
          oxygen_saturation: parseFloat(form.oxygen_saturation),
          temperature: parseFloat(form.temperature),
          symptoms: form.symptoms.length > 0 ? form.symptoms : ['none'],
        },
        arrival_time: 0,
        burst_time: parseInt(form.burst_time) || 10,
      }

      await onSubmit(patientData)
      setSubmitStatus('success')
      setTimeout(() => {
        setForm(initialForm)
        setSubmitStatus(null)
        onClose()
      }, 1200)
    } catch (err) {
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isValid = form.name && form.age && form.heart_rate && form.systolic_bp &&
    form.diastolic_bp && form.oxygen_saturation && form.temperature

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal-content">
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: '24px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(6,182,212,0.15))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1px solid rgba(99,102,241,0.2)'
            }}>
              <UserPlus size={20} style={{ color: 'var(--accent-indigo-light)' }} />
            </div>
            <div>
              <h3 style={{ fontWeight: '700', fontSize: '1.05rem' }}>Add New Patient</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Enter patient vitals for triage</p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '32px', height: '32px', borderRadius: '8px',
              background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)',
              color: 'var(--text-muted)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all var(--transition-fast)',
            }}
            onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--severity-critical)'; e.currentTarget.style.color = 'var(--severity-critical)' }}
            onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.color = 'var(--text-muted)' }}
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Patient Info */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div>
              <label className="input-label">Patient Name</label>
              <input
                className="input-field"
                type="text"
                placeholder="e.g. Rahul Verma"
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
              />
            </div>
            <div>
              <label className="input-label">Age</label>
              <input
                className="input-field"
                type="number"
                placeholder="e.g. 42"
                min="1"
                max="120"
                value={form.age}
                onChange={(e) => handleChange('age', e.target.value)}
                required
              />
            </div>
          </div>

          {/* Vitals */}
          <div style={{
            padding: '16px', borderRadius: 'var(--radius-md)',
            background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)',
            marginBottom: '16px',
          }}>
            <h4 style={{
              fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)',
              textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px',
            }}>
              Vitals
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              <VitalInput
                icon={Heart} label="Heart Rate" placeholder="60-100 bpm"
                value={form.heart_rate} onChange={(v) => handleChange('heart_rate', v)}
                unit="bpm"
              />
              <VitalInput
                icon={Droplets} label="Systolic BP" placeholder="90-140"
                value={form.systolic_bp} onChange={(v) => handleChange('systolic_bp', v)}
                unit="mmHg"
              />
              <VitalInput
                icon={Droplets} label="Diastolic BP" placeholder="60-90"
                value={form.diastolic_bp} onChange={(v) => handleChange('diastolic_bp', v)}
                unit="mmHg"
              />
              <VitalInput
                icon={Wind} label="SpO₂" placeholder="95-100"
                value={form.oxygen_saturation} onChange={(v) => handleChange('oxygen_saturation', v)}
                unit="%"
              />
              <VitalInput
                icon={Thermometer} label="Temperature" placeholder="36.1-37.5"
                value={form.temperature} onChange={(v) => handleChange('temperature', v)}
                unit="°C"
              />
              <div>
                <label className="input-label">Est. Treatment Time</label>
                <input
                  className="input-field"
                  type="number"
                  placeholder="10"
                  min="1"
                  max="60"
                  value={form.burst_time}
                  onChange={(e) => handleChange('burst_time', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Symptoms */}
          <div style={{ marginBottom: '20px' }}>
            <label className="input-label" style={{ marginBottom: '10px' }}>Symptoms</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {SYMPTOMS.map((s) => {
                const isSelected = form.symptoms.includes(s.value)
                return (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => toggleSymptom(s.value)}
                    style={{
                      padding: '6px 12px', borderRadius: '8px',
                      fontSize: '0.75rem', fontWeight: '600',
                      background: isSelected ? 'rgba(99,102,241,0.15)' : 'transparent',
                      color: isSelected ? 'var(--accent-indigo-light)' : 'var(--text-muted)',
                      border: `1px solid ${isSelected ? 'rgba(99,102,241,0.3)' : 'var(--border-subtle)'}`,
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)',
                    }}
                  >
                    {s.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Submit */}
          {submitStatus === 'success' && (
            <div style={{
              padding: '10px 14px', borderRadius: 'var(--radius-md)',
              background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)',
              display: 'flex', alignItems: 'center', gap: '8px',
              marginBottom: '14px', color: '#10b981', fontSize: '0.8rem', fontWeight: '600',
            }}>
              <CheckCircle2 size={16} /> Patient added successfully!
            </div>
          )}

          {submitStatus === 'error' && (
            <div style={{
              padding: '10px 14px', borderRadius: 'var(--radius-md)',
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
              display: 'flex', alignItems: 'center', gap: '8px',
              marginBottom: '14px', color: '#ef4444', fontSize: '0.8rem', fontWeight: '600',
            }}>
              <AlertCircle size={16} /> Failed to add patient. Please try again.
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={onClose}
              style={{ flex: 1 }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!isValid || isSubmitting}
              style={{ flex: 2 }}
            >
              <UserPlus size={16} />
              {isSubmitting ? 'Adding...' : 'Add Patient'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function VitalInput({ icon: Icon, label, placeholder, value, onChange, unit }) {
  return (
    <div>
      <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <Icon size={10} /> {label}
      </label>
      <div style={{ position: 'relative' }}>
        <input
          className="input-field"
          type="number"
          step="any"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ paddingRight: unit ? '40px' : '14px' }}
          required
        />
        {unit && (
          <span style={{
            position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
            fontSize: '0.7rem', color: 'var(--text-muted)', pointerEvents: 'none',
          }}>
            {unit}
          </span>
        )}
      </div>
    </div>
  )
}
