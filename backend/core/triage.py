"""
Priority Score Formula (0-100, higher = more urgent):
  Base = 50
  + heart_rate deviation from 60-100 normal range -> up to +20
  + BP deviation from 120/80 -> up to +15
  + oxygen drop below 95% -> up to +25
  + symptom weights (see SYMPTOM_WEIGHTS)
  Capped at 100, minimum 0
"""

from models.patient import Severity

SYMPTOM_WEIGHTS = {
    "stroke": 30,
    "chest_pain": 28,
    "breathing_difficulty": 25,
    "allergic_reaction": 20,
    "abdominal_pain": 12,
    "fracture": 10,
    "fever": 8,
    "laceration": 6,
    "headache": 4,
    "none": 0,
}


def calculate_priority(vitals) -> tuple[float, str]:
    """
    Returns (priority_score, severity_label).
    Formula recalibrated to lower base score (15.0) and uses fine-grained vital tie-breakers
    to ensure wide distribution and unique priority scores for patients.
    """
    score = 15.0

    # 1. Step-wise scoring based on clinically meaningful deviations
    
    # Heart rate step (max +18)
    hr = vitals.heart_rate
    if hr < 40 or hr > 150:
        score += 18
    elif hr < 60 or hr > 120:
        score += 10
    elif hr < 50 or hr > 100:
        score += 5

    # BP step (systolic) (max +15)
    sbp = vitals.systolic_bp
    if sbp < 80 or sbp > 180:
        score += 15
    elif sbp < 90 or sbp > 160:
        score += 8
    elif sbp < 100 or sbp > 140:
        score += 4

    # Oxygen saturation step (max +22)
    spo2 = vitals.oxygen_saturation
    if spo2 < 85:
        score += 22
    elif spo2 < 90:
        score += 15
    elif spo2 < 95:
        score += 8

    # Symptom weights step (max +28)
    symptom_score = max(
        (SYMPTOM_WEIGHTS.get(s.value, 0) for s in vitals.symptoms),
        default=0,
    )
    score += min(28, symptom_score)

    # 2. Continuous fine-grained vital tie-breakers (max ~10-15 points)
    # Adds a tiny unique fraction for every patient based on exact vitals
    hr_tb = abs(hr - 80) * 0.05
    bp_tb = abs(sbp - 120) * 0.03 + abs(vitals.diastolic_bp - 80) * 0.02
    o2_tb = (100.0 - spo2) * 0.25
    temp_tb = abs(vitals.temperature - 37.0) * 0.5
    
    score += (hr_tb + bp_tb + o2_tb + temp_tb)

    # Hard cap at 100.0
    score = min(100.0, max(0.0, score))

    # 3. Derive Severity from widely-distributed score
    if score >= 70.0:
        severity = Severity.CRITICAL
    elif score >= 45.0:
        severity = Severity.HIGH
    elif score >= 25.0:
        severity = Severity.MEDIUM
    else:
        severity = Severity.LOW

    return round(score, 2), severity


def vitals_alerts(vitals) -> list[str]:
    """V04 — Return human-readable alerts for out-of-range vitals."""
    alerts: list[str] = []
    if vitals.oxygen_saturation < 90:
        alerts.append(f"CRITICAL: SpO2 at {vitals.oxygen_saturation}% (< 90)")
    elif vitals.oxygen_saturation < 95:
        alerts.append(f"WARNING: SpO2 at {vitals.oxygen_saturation}% (< 95)")
    if vitals.heart_rate < 40:
        alerts.append(f"CRITICAL: Bradycardia — HR {vitals.heart_rate} bpm")
    elif vitals.heart_rate > 150:
        alerts.append(f"CRITICAL: Tachycardia — HR {vitals.heart_rate} bpm")
    if vitals.systolic_bp > 180:
        alerts.append(f"CRITICAL: Hypertensive crisis — SBP {vitals.systolic_bp}")
    elif vitals.systolic_bp < 80:
        alerts.append(f"CRITICAL: Hypotension — SBP {vitals.systolic_bp}")
    if vitals.temperature > 39.5:
        alerts.append(f"WARNING: High fever — {vitals.temperature}°C")
    elif vitals.temperature < 35.0:
        alerts.append(f"WARNING: Hypothermia — {vitals.temperature}°C")
    return alerts
