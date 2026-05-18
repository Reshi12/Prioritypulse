#!/usr/bin/env python3
"""
LifeLine: Hospital Emergency Triage Engine
Standalone Command Line Interface (CLI) & Simulation Report Generator

This script runs the entire DAA sorting and OS scheduling simulation 
directly in the terminal, printing clean tables, charts, and generating
a static output log ('triage_simulation_report.txt').
"""

import os
import sys
import time
import json
import copy

# Add backend to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from backend.models.patient import Patient, PatientVitals
from backend.core.triage import calculate_priority, vitals_alerts
from backend.core.sorting import selection_sort, merge_sort, compare_algorithms
from backend.core.aging import apply_aging
from backend.config import ROUND_ROBIN_QUANTUM, NUM_DOCTORS, AGING_THRESHOLD_MINUTES, AGING_BOOST

def load_seed_data():
    patients_path = os.path.join(os.path.dirname(__file__), 'backend', 'data', 'patients.json')
    seed_path = os.path.join(os.path.dirname(__file__), 'backend', 'data', 'seed_patients.json')
    
    if os.path.exists(patients_path) and os.path.getsize(patients_path) > 10:
        path = patients_path
        print(f"[*] Fetching live patients from database: {patients_path}")
    else:
        path = seed_path
        print(f"[*] Fetching static seed patients from: {seed_path}")
        
    with open(path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    patients = []
    for idx, d in enumerate(data):
        vitals = PatientVitals(
            heart_rate=d["vitals"]["heart_rate"],
            systolic_bp=d["vitals"]["systolic_bp"],
            diastolic_bp=d["vitals"]["diastolic_bp"],
            oxygen_saturation=d["vitals"]["oxygen_saturation"],
            temperature=d["vitals"]["temperature"],
            symptoms=d["vitals"].get("symptoms", ["none"])
        )
        score, severity = calculate_priority(vitals)
        p = Patient(
            patient_id=d["patient_id"],
            name=d["name"],
            age=d["age"],
            vitals=vitals,
            arrival_time=d.get("arrival_time", 0),
            burst_time=d.get("burst_time", 10),
            priority_score=score,
            severity=severity,
            pid=idx + 1
        )
        patients.append(p)
    return patients

def format_patient_table(patients):
    lines = []
    lines.append(f"{'ID':<6} | {'Name':<18} | {'Age':<3} | {'Severity':<10} | {'Score':<6} | {'Arrival':<7} | {'Burst':<5} | {'Vitals (HR/BP/SpO2)':<22}")
    lines.append("-" * 90)
    for p in patients:
        v_str = f"{p.vitals.heart_rate}bpm/{p.vitals.systolic_bp}/{int(p.vitals.oxygen_saturation)}%"
        lines.append(f"{p.patient_id:<6} | {p.name:<18} | {p.age:<3} | {p.severity:<10} | {p.priority_score:<6.1f} | {p.arrival_time:<7} | {p.burst_time:<5} | {v_str:<22}")
    return "\n".join(lines)

def run_daa_sorting_demo(patients):
    report = []
    report.append("=" * 90)
    report.append(" DAA DEMO: TRIAGE SORTING ALGORITHM COMPARISON")
    report.append("=" * 90)
    report.append(f"Running sorting algorithms on the sample dataset of {len(patients)} patients...\n")
    
    analysis = compare_algorithms(patients)
    
    report.append(f"{'Metric':<25} | {'Selection Sort (O(n^2))':<28} | {'Merge Sort (O(n log n))':<28}")
    report.append("-" * 90)
    report.append(f"{'Execution Time (ms)':<25} | {analysis['selection_sort']['time_ms']:<28} | {analysis['merge_sort']['time_ms']:<28}")
    report.append(f"{'Theoretical Complexity':<25} | {analysis['selection_sort']['time_complexity'].replace('²', '^2'):<28} | {analysis['merge_sort']['time_complexity']:<28}")
    report.append(f"{'Space Complexity':<25} | {analysis['selection_sort']['space_complexity']:<28} | {analysis['merge_sort']['space_complexity']:<28}")
    report.append(f"{'Calculated Comparisons':<25} | {analysis['selection_sort']['comparisons']:<28} | {analysis['merge_sort']['comparisons']:<28}")
    report.append(f"{'Best Suited For':<25} | {analysis['selection_sort']['best_for'].replace('≤', '<='):<28} | {analysis['merge_sort']['best_for']:<28}")
    report.append("-" * 90)
    report.append(f"Winner based on speed for this batch size (n={len(patients)}): {analysis['winner'].upper()}")
    report.append(f"Note: {analysis['note'].replace('≤', '<=')}\n")
    
    report.append("Sorted Patients Order (Highest Urgency First):")
    sorted_p, _ = merge_sort(patients)
    report.append(format_patient_table(sorted_p))
    report.append("\n" + "=" * 90)
    
    return "\n".join(report)

class StandaloneSimulation:
    def __init__(self, patients, scheduler_type="priority", num_doctors=2):
        self.clock = 0
        self.scheduler_type = scheduler_type
        self.num_doctors = num_doctors
        self.patients = copy.deepcopy(patients)
        self.gantt = []
        self.aged_patients = set()
        
        self.remaining = {p.patient_id: p.burst_time for p in self.patients}
        self.doctor_patient = {d: None for d in range(1, num_doctors + 1)}
        self.rr_used = {d: 0 for d in range(1, num_doctors + 1)}
        self.activated = set()

    def _get_patient(self, pid):
        for p in self.patients:
            if p.patient_id == pid:
                return p
        return None

    def _available_waiting(self):
        assigned = set(v for v in self.doctor_patient.values() if v)
        avail = [
            p for p in self.patients
            if p.patient_id in self.activated
            and p.status == "waiting"
            and p.patient_id not in assigned
        ]
        # Sort waiting pool
        if self.scheduler_type == "priority":
            avail.sort(key=lambda p: -p.priority_score)
        else:
            # Round Robin FIFO by arrival time
            avail.sort(key=lambda p: p.arrival_time)
        return avail

    def _assign(self, doc_id):
        available = self._available_waiting()
        if not available:
            return
        chosen = available[0]
        chosen.status = "in_treatment"
        if chosen.start_time is None:
            chosen.start_time = self.clock
        self.doctor_patient[doc_id] = chosen.patient_id
        self.rr_used[doc_id] = 0

    def run_simulation(self):
        log = []
        log.append(f"Starting {self.scheduler_type.upper()} scheduler simulation with {self.num_doctors} doctor(s)...")
        
        while True:
            # Check if all done
            all_arrived = len(self.activated) == len(self.patients)
            all_done = all(p.status == "done" for p in self.patients if p.patient_id in self.activated)
            if all_done and all_arrived:
                break
                
            # 1. Activate new arrivals
            for p in self.patients:
                if p.patient_id not in self.activated and p.arrival_time <= self.clock:
                    self.activated.add(p.patient_id)
                    log.append(f"[Clock {self.clock}m] Patient {p.patient_id} ({p.name}) ARRIVED. Priority Score: {p.priority_score:.1f} ({p.severity})")

            # 2. Apply aging (starvation prevention)
            waiting_list = [p for p in self.patients if p.status == "waiting" and p.patient_id in self.activated]
            apply_aging(waiting_list, self.clock)
            for p in waiting_list:
                if p.last_priority_bump > 0 and p.patient_id not in self.aged_patients:
                    self.aged_patients.add(p.patient_id)
                    log.append(f"[Clock {self.clock}m] AGING STARVED: Patient {p.patient_id} ({p.name}) bumped to score {p.priority_score:.1f} after waiting {self.clock - p.arrival_time}m!")

            # 3. Handle Doctors
            for doc_id in range(1, self.num_doctors + 1):
                current_pid = self.doctor_patient.get(doc_id)
                
                # Check preemption/round robin quantum
                if current_pid:
                    current = self._get_patient(current_pid)
                    if current and current.status == "in_treatment":
                        if self.scheduler_type == "priority":
                            # Preemptive Priority
                            available = self._available_waiting()
                            if available and available[0].priority_score > current.priority_score:
                                log.append(f"[Clock {self.clock}m] PREEMPTION: Patient {available[0].patient_id} ({available[0].name}) preempted {current.patient_id} on Doctor {doc_id}!")
                                current.status = "waiting"
                                self.doctor_patient[doc_id] = None
                                self._assign(doc_id)
                                current_pid = self.doctor_patient.get(doc_id)
                                current = self._get_patient(current_pid) if current_pid else None
                        elif self.scheduler_type == "round_robin":
                            # RR quantum check
                            if self.rr_used[doc_id] >= ROUND_ROBIN_QUANTUM and self.remaining[current_pid] > 0:
                                log.append(f"[Clock {self.clock}m] QUANTUM EXPIRED: Patient {current_pid} rotated out on Doctor {doc_id}.")
                                current.status = "waiting"
                                self.doctor_patient[doc_id] = None
                                self.rr_used[doc_id] = 0
                                self._assign(doc_id)
                                current_pid = self.doctor_patient.get(doc_id)
                                current = self._get_patient(current_pid) if current_pid else None

                # Assign if free
                if not self.doctor_patient.get(doc_id):
                    self._assign(doc_id)
                    current_pid = self.doctor_patient.get(doc_id)
                    current = self._get_patient(current_pid) if current_pid else None

                # Treat for 1 min
                if current_pid and current and current.status == "in_treatment":
                    self.remaining[current_pid] = max(0, self.remaining[current_pid] - 1)
                    self.gantt.append({
                        "patient_id": current_pid,
                        "doctor_id": doc_id,
                        "start": self.clock,
                        "end": self.clock + 1
                    })
                    self.rr_used[doc_id] += 1
                    
                    if self.remaining[current_pid] <= 0:
                        current.status = "done"
                        current.finish_time = self.clock + 1
                        current.turnaround_time = current.finish_time - current.arrival_time
                        current.waiting_time = current.turnaround_time - current.burst_time
                        self.doctor_patient[doc_id] = None
                        self.rr_used[doc_id] = 0
                        log.append(f"[Clock {self.clock + 1}m] Doctor {doc_id} COMPLETED treatment of Patient {current_pid} ({current.name}). Wait: {current.waiting_time}m, Turnaround: {current.turnaround_time}m.")

            self.clock += 1

        # Post simulation stats
        stats = []
        stats.append("\n" + "=" * 90)
        stats.append(f" {self.scheduler_type.upper()} SCHEDULER STATS & GANTT CHART")
        stats.append("=" * 90)
        
        stats.append(f"{'ID':<6} | {'Name':<18} | {'Arrival':<7} | {'Burst':<5} | {'Start':<5} | {'Finish':<6} | {'Wait Time':<9} | {'Turnaround':<10}")
        stats.append("-" * 90)
        completed = [p for p in self.patients if p.status == "done"]
        for p in sorted(self.patients, key=lambda p: p.patient_id):
            stats.append(f"{p.patient_id:<6} | {p.name:<18} | {p.arrival_time:<7} | {p.burst_time:<5} | {p.start_time:<5} | {p.finish_time:<6} | {p.waiting_time:<9} | {p.turnaround_time:<10}")
        stats.append("-" * 90)
        
        avg_w = sum(p.waiting_time for p in completed) / len(completed) if completed else 0
        avg_t = sum(p.turnaround_time for p in completed) / len(completed) if completed else 0
        stats.append(f"Average Waiting Time:    {avg_w:.2f} minutes")
        stats.append(f"Average Turnaround Time: {avg_t:.2f} minutes")
        stats.append(f"Throughput:              {len(completed)} patients completed")
        stats.append("-" * 90)
        
        # Build standard Gantt timeline representation
        stats.append("\nGantt Timeline Visualization (1 block = 2 mins):")
        for d in range(1, self.num_doctors + 1):
            lane = [g for g in self.gantt if g["doctor_id"] == d]
            timeline = []
            last_end = 0
            for entry in sorted(lane, key=lambda e: e["start"]):
                if entry["start"] > last_end:
                    timeline.append("-" * ((entry["start"] - last_end) // 2))
                timeline.append(f"[{entry['patient_id']}]" * ((entry["end"] - entry["start"]) // 2 or 1))
                last_end = entry["end"]
            stats.append(f"Doctor {d}: " + "".join(timeline))
            
        return "\n".join(log) + "\n" + "\n".join(stats)

def main():
    print("================================================================================")
    print("                 PriorityPulse: Hospital Triage Simulation Engine               ")
    print("================================================================================")
    
    patients = load_seed_data()
    
    # 1. Run Sorting algorithms and generate comparison report
    daa_report = run_daa_sorting_demo(patients)
    print(daa_report)
    
    # 2. Run Scheduling Simulations
    # Simulation 1: Preemptive Priority Scheduling
    p_sim = StandaloneSimulation(patients, scheduler_type="priority", num_doctors=2)
    p_log = p_sim.run_simulation()
    print(p_log)
    
    # Simulation 2: Round Robin Scheduling
    rr_sim = StandaloneSimulation(patients, scheduler_type="round_robin", num_doctors=2)
    rr_log = rr_sim.run_simulation()
    
    # 3. Write all outputs into triage_simulation_report.txt
    report_file = os.path.join(os.path.dirname(__file__), 'triage_simulation_report.txt')
    with open(report_file, 'w', encoding='utf-8') as f:
        f.write("=" * 90 + "\n")
        f.write("            LIFELINE: HOSPITAL EMERGENCY TRIAGE SIMULATION FINAL REPORT\n")
        f.write("=" * 90 + "\n\n")
        f.write("Generated at: " + time.strftime("%Y-%m-%d %H:%M:%S") + "\n\n")
        
        f.write("1. ORIGINAL SAMPLE PATIENTS DATASET\n")
        f.write("-" * 90 + "\n")
        f.write(format_patient_table(patients) + "\n\n")
        
        f.write("2. DAA SORTING ALGORITHMS EVALUATION REPORT\n")
        f.write(daa_report + "\n\n")
        
        f.write("3. OS SCHEDULER SIMULATION (PREEMPTIVE PRIORITY)\n")
        f.write(p_log + "\n\n")
        
        f.write("4. OS SCHEDULER SIMULATION (ROUND ROBIN)\n")
        f.write(rr_log + "\n\n")
        
        f.write("5. CONCEPTUAL MAPPINGS & COMPLEXITY OVERVIEW\n")
        f.write("-" * 90 + "\n")
        f.write("- Selection Sort: O(n^2) worst/average time, O(1) space. Chosen for small queues to avoid recursion overhead.\n")
        f.write("- Merge Sort: O(n log n) best/worst/average time, O(n) space. Scalable for large disaster triage queues.\n")
        f.write("- Process Modeling: Patients act as active processes. PID = patient ID, Burst Time = treatment duration, Arrival Time = check-in.\n")
        f.write("- Preemptive Priority: Higher priority triage score immediately preempts/interrupts current treatment if a doctor is busy.\n")
        f.write("- Round Robin: Ensures fairness. Doctors treat in intervals (Quantum=5m), guaranteeing lower priority starvation prevention.\n")
        f.write("- Aging Mechanism: Automatically increments priority scores of patients waiting past threshold, preventing infinite starvation.\n")
        f.write("=" * 90 + "\n")
        
    print("\n" + "=" * 80)
    print(f" SUCCESS: Standalone console execution completed!")
    print(f" Saved full printable report to: {report_file}")
    print("=" * 80)

if __name__ == "__main__":
    main()
