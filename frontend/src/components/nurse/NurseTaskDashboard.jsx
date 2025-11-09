import { useState, useEffect } from 'react';
import { api } from '../../api';
import RecordVitalsForm from '../forms/RecordVitalsForm';

function NurseTaskDashboard({ user, onTaskUpdate }) {
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportDetails, setReportDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [showVitalsModal, setShowVitalsModal] = useState(false);
  const [prescribedMedicines, setPrescribedMedicines] = useState([]);
  const [nursingNotes, setNursingNotes] = useState(''); // ✅ For completing tasks

  useEffect(() => {
    loadTasks();
  }, [filter]);

  async function loadTasks() {
    try {
      setLoading(true);
      const statusFilter = filter === 'all' ? null : filter.toUpperCase();
      const data = await api.getNurseTasks(statusFilter);
      setTasks(data);
    } catch (err) {
      console.error('Failed to load tasks:', err);
      alert('Failed to load tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function viewReportDetails(recordId, task) {
    try {
      const report = await api.getNurseMedicalReport(recordId);
      setReportDetails(report);
      setSelectedTask(task); // ✅ Store the task
      
      try {
        const medicines = await api.getNursePrescribedMedicines(recordId);
        setPrescribedMedicines(medicines || []);
        console.log(`💊 Loaded ${medicines?.length || 0} medicines for record ${recordId}`);
      } catch (medErr) {
        console.error('Failed to load medicines:', medErr);
        setPrescribedMedicines([]);
      }
      
      setShowReportModal(true);
    } catch (err) {
      console.error('Failed to load report:', err);
      alert('Failed to load medical report.');
    }
  }

  async function claimTask(taskId) {
    if (!confirm('Claim this task?')) return;
    try {
      await api.claimNurseTask(taskId, user.id);
      alert('Task claimed successfully!');
      loadTasks();
      if (onTaskUpdate) onTaskUpdate();
    } catch (err) {
      console.error('Failed to claim task:', err);
      alert(err.message || 'Failed to claim task.');
    }
  }

  async function completeTask(taskId, notes) {
    if (!notes || !notes.trim()) {
      alert('⚠️ Please add nursing notes before completing the task.');
      return;
    }

    try {
      // ✅ Update task status to COMPLETED with nursing notes
      await api.updateNurseTaskStatus(taskId, { 
        status: 'COMPLETED', 
        notes: notes 
      });

      alert('✅ Task completed successfully!');
      setShowReportModal(false);
      setReportDetails(null);
      setSelectedTask(null);
      setPrescribedMedicines([]);
      setNursingNotes('');
      
      loadTasks();
      if (onTaskUpdate) onTaskUpdate();
    } catch (err) {
      console.error('❌ Failed to complete task:', err);
      alert(`Failed to complete task: ${err.message || 'Unknown error'}`);
    }
  }

  function openVitalsModal(task) {
    setSelectedTask({
      patient_id: task.patient_id,
      patient_name: task.patient_name,
      name: task.patient_name,
      age: task.age,
      gender: task.gender,
      record_id: task.record_id
    });
    setShowVitalsModal(true);
  }

  async function handleVitalsSubmit() {
    setShowVitalsModal(false);
    setSelectedTask(null);
    await loadTasks();
    if (onTaskUpdate) onTaskUpdate();
  }

  const priorityColors = {
    STAT: '#dc2626',
    URGENT: '#ea580c',
    ROUTINE: '#3b82f6'
  };

  const statusColors = {
    PENDING: '#eab308',
    IN_PROGRESS: '#3b82f6',
    COMPLETED: '#10b981'
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading tasks...</div>;
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* Filter Buttons */}
      <div style={{ marginBottom: '24px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        {['pending', 'in_progress', 'completed', 'all'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '10px 20px',
              background: filter === f ? '#3b82f6' : '#f1f5f9',
              color: filter === f ? 'white' : '#475569',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: '600',
              textTransform: 'capitalize'
            }}
          >
            {f.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Tasks List */}
      {tasks.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
          No {filter !== 'all' ? filter.replace('_', ' ') : ''} tasks found.
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {tasks.map((task) => (
            <div
              key={task.task_id}
              style={{
                padding: '20px',
                background: 'white',
                borderRadius: '12px',
                border: '2px solid #e2e8f0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', color: '#1e293b' }}>
                    👤 {task.patient_name} ({task.age}yrs, {task.gender})
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                    <span style={{ padding: '4px 12px', background: priorityColors[task.priority], color: 'white', borderRadius: '12px', fontSize: '12px', fontWeight: '700' }}>
                      {task.priority}
                    </span>
                    <span style={{ padding: '4px 12px', background: statusColors[task.status], color: 'white', borderRadius: '12px', fontSize: '12px', fontWeight: '700' }}>
                      {task.status.replace('_', ' ')}
                    </span>
                    {task.doctor_name && (
                      <span style={{ fontSize: '14px', color: '#64748b' }}>
                        👨‍⚕️ Dr. {task.doctor_name}
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {task.record_id && (
                    <button
                      onClick={() => viewReportDetails(task.record_id, task)}
                      style={{ padding: '8px 16px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}
                    >
                      📄 View Full Report
                    </button>
                  )}

                  {task.status === 'PENDING' && !task.assigned_nurse_id && (
                    <button
                      onClick={() => claimTask(task.task_id)}
                      style={{ padding: '8px 16px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}
                    >
                      ✋ Claim Task
                    </button>
                  )}

                  {task.status === 'IN_PROGRESS' && task.assigned_nurse_id === user.id && (
                    <>
                      <button
                        onClick={() => openVitalsModal(task)}
                        style={{ padding: '8px 16px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}
                      >
                        🩺 Record Vitals
                      </button>
                      <button
                        onClick={() => viewReportDetails(task.record_id, task)}
                        style={{ padding: '8px 16px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}
                      >
                        ✅ Complete Task
                      </button>
                    </>
                  )}
                </div>
              </div>

              {task.notes && (
                <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', marginTop: '12px' }}>
                  <strong style={{ color: '#475569' }}>📝 Notes:</strong>
                  <p style={{ margin: '4px 0 0 0', color: '#64748b' }}>{task.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ===== MEDICAL REPORT MODAL WITH NURSING NOTES ===== */}
      {showReportModal && reportDetails && (
        <div
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}
          onClick={() => {
            setShowReportModal(false);
            setPrescribedMedicines([]);
            setNursingNotes('');
          }}
        >
          <div
            style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '900px', maxHeight: '90vh', overflow: 'auto', padding: '32px', position: 'relative' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                setShowReportModal(false);
                setPrescribedMedicines([]);
                setNursingNotes('');
              }}
              style={{ position: 'absolute', top: '16px', right: '16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '36px', height: '36px', fontSize: '20px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              ×
            </button>

            <h2 style={{ margin: '0 0 24px 0', fontSize: '28px', color: '#1e293b' }}>
              📋 Complete Medical Report
            </h2>

            {/* Patient Info */}
            <div style={{ marginBottom: '24px', padding: '20px', background: '#f0f9ff', borderRadius: '12px', border: '2px solid #3b82f6' }}>
              <h3 style={{ margin: '0 0 12px 0', color: '#1e40af' }}>👤 Patient Information</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                <div><strong>Name:</strong> {reportDetails.patient_name}</div>
                <div><strong>Age:</strong> {reportDetails.age} years</div>
                <div><strong>Gender:</strong> {reportDetails.gender}</div>
                <div><strong>Doctor:</strong> Dr. {reportDetails.doctor_name}</div>
                <div><strong>Diagnosis:</strong> {reportDetails.diagnosis}</div>
              </div>
            </div>

            {/* Prescribed Medicines */}
            {prescribedMedicines && prescribedMedicines.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ margin: '0 0 16px 0', color: '#166534', fontSize: '20px' }}>
                  💊 Prescribed Medicines ({prescribedMedicines.length})
                </h3>
                <div style={{ display: 'grid', gap: '16px' }}>
                  {prescribedMedicines.map((medicine, index) => (
                    <div
                      key={medicine.prescription_id || index}
                      style={{ padding: '16px', background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', borderRadius: '12px', border: '2px solid #10b981' }}
                    >
                      <h4 style={{ margin: '0 0 12px 0', color: '#166534', fontSize: '18px' }}>
                        {index + 1}. {medicine.medicine_name}
                      </h4>
                      <div style={{ display: 'grid', gap: '8px', fontSize: '14px', color: '#475569' }}>
                        <div><strong>💊 Dosage:</strong> {medicine.dosage}</div>
                        <div><strong>⏰ Frequency:</strong> {medicine.frequency}</div>
                        <div><strong>📅 Duration:</strong> {medicine.duration}</div>
                        {medicine.instructions && (
                          <div style={{ marginTop: '8px', padding: '12px', background: 'white', borderRadius: '8px' }}>
                            <strong>📝 Instructions:</strong>
                            <p style={{ margin: '4px 0 0 0' }}>{medicine.instructions}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ✅ NURSING NOTES INPUT (FOR COMPLETING TASK) */}
            {selectedTask && selectedTask.status === 'IN_PROGRESS' && (
              <div style={{ marginTop: '32px', padding: '24px', background: '#fffbeb', borderRadius: '12px', border: '2px solid #f59e0b' }}>
                <h3 style={{ margin: '0 0 12px 0', color: '#92400e', fontSize: '18px' }}>
                  📝 Your Nursing Notes (Required to Complete Task)
                </h3>
                <p style={{ margin: '0 0 12px 0', color: '#78350f', fontSize: '14px' }}>
                  Document vital signs recorded, medications administered, patient condition, and recommendations.
                </p>
                <textarea
                  value={nursingNotes}
                  onChange={(e) => setNursingNotes(e.target.value)}
                  placeholder="Example:&#10;- Vital signs recorded: Temp 102.5°F, BP 118/78, Pulse 88bpm, RR 18/min, SpO2 98%&#10;- Administered prescribed medications: Paracetamol 500mg, Amoxicillin 250mg&#10;- Patient condition: Alert and oriented, fever present, resting comfortably&#10;- Recommendations: Continue fever monitoring, ensure adequate hydration, follow-up in 24 hours"
                  rows="8"
                  style={{ width: '100%', padding: '12px', fontSize: '15px', border: '2px solid #fbbf24', borderRadius: '8px', boxSizing: 'border-box', fontFamily: 'inherit', resize: 'vertical' }}
                />
                
                <div style={{ display: 'flex', gap: '12px', marginTop: '16px', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => {
                      setShowReportModal(false);
                      setNursingNotes('');
                      setPrescribedMedicines([]);
                    }}
                    style={{ padding: '12px 24px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  
                  <button
                    onClick={() => completeTask(selectedTask.task_id, nursingNotes)}
                    style={{ padding: '12px 24px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}
                  >
                    ✅ Mark as Completed
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Record Vitals Modal */}
      {showVitalsModal && selectedTask && (
        <RecordVitalsForm
          patient={selectedTask}
          onClose={() => {
            setShowVitalsModal(false);
            setSelectedTask(null);
          }}
          onSubmit={handleVitalsSubmit}
        />
      )}
    </div>
  );
}

export default NurseTaskDashboard;
