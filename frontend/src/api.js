const API_BASE = '/api';

async function request(path, { method = 'GET', body, headers = {} } = {}) {
  const res = await fetch(API_BASE + path, {
    method,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    let err = {};
    try {
      err = await res.json();
    } catch (e) {
      // ignore
    }
    throw new Error(err.message || err.error || res.statusText);
  }

  return res.status === 204 ? null : res.json();
}

export const api = {
  // ===== AUTHENTICATION =====
  session: () => request('/auth/session'),
  login: (role, email, password) => request('/auth/login', {
    method: 'POST',
    body: { role, email, password }
  }),
  logout: () => request('/auth/logout', { method: 'POST' }),

  // ===== RECEPTION ROUTES (NO AUTH REQUIRED) =====
  getReceptionPatients: () => request('/reception/patients'),
  registerPatient: (data) => request('/reception/register', {
    method: 'POST',
    body: data
  }),
  getReceptionPatient: (id) => request(`/reception/patients/${id}`),

  // ===== ADMIN - STAFF MANAGEMENT =====
  // Doctors
  getDoctors: () => request('/admin/doctors'),
  addDoctor: (data) => request('/admin/doctors', { method: 'POST', body: data }),
  updateDoctor: (id, data) => request(`/admin/doctors/${id}`, { method: 'PUT', body: data }),
  deleteDoctor: (id) => request(`/admin/doctors/${id}`, { method: 'DELETE' }),

  // Nurses
  getNurses: () => request('/admin/nurses'),
  addNurse: (data) => request('/admin/nurses', { method: 'POST', body: data }),
  updateNurse: (id, data) => request(`/admin/nurses/${id}`, { method: 'PUT', body: data }),
  deleteNurse: (id) => request(`/admin/nurses/${id}`, { method: 'DELETE' }),

  // ===== ADMIN - WARD ASSIGNMENT MANAGEMENT ===== 
  getWardAssignments: () => request('/admin/ward-assignments'),
  getAvailableNurses: () => request('/admin/available-nurses'),
  getWardsList: () => request('/admin/wards-list'),
  assignNurseToWard: (nurse_id, ward_id) => 
    request('/admin/assign-ward', { method: 'POST', body: { nurse_id, ward_id } }),
  unassignNurseFromWard: (ward_nurse_id) => 
    request('/admin/unassign-ward', { method: 'POST', body: { ward_nurse_id } }),
  reassignNurseToWard: (old_ward_nurse_id, new_ward_id) => 
    request('/admin/reassign-ward', { method: 'POST', body: { old_ward_nurse_id, new_ward_id } }),

  // ===== ADMIN - MEDICAL INVENTORY =====
  getInventory: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/admin/inventory${query ? '?' + query : ''}`);
  },
  getInventoryStats: () => request('/admin/inventory/stats'),
  getInventoryAlerts: () => request('/admin/inventory/alerts'),
  getInventoryItem: (id) => request(`/admin/inventory/${id}`),
  addInventoryItem: (data) => request('/admin/inventory', {
    method: 'POST',
    body: data
  }),
  updateInventoryItem: (id, data) => request(`/admin/inventory/${id}`, {
    method: 'PUT',
    body: data
  }),
  deleteInventoryItem: (id) => request(`/admin/inventory/${id}`, {
    method: 'DELETE'
  }),
  getItemTransactions: (id) => request(`/admin/inventory/${id}/transactions`),
  getRecentTransactions: (limit = 50) => request(`/admin/inventory/transactions/recent?limit=${limit}`),
  adjustStock: (id, data) => request(`/admin/inventory/${id}/adjust`, {
    method: 'POST',
    body: data
  }),

  // ===== DOCTOR ROUTES =====
  getDoctorStats: () => request('/doctor/stats'),
  getAllPatients: () => request('/doctor/patients'),
  getDoctorAppointments: (params) => {
    const query = params ? '?' + new URLSearchParams(params) : '';
    return request(`/doctor/appointments${query}`);
  },
  getAppointmentDetails: (id) => request(`/doctor/appointments/${id}`),
  updateAppointment: (id, data) => request(`/doctor/appointments/${id}`, {
    method: 'PUT',
    body: data
  }),
  getPatientHistory: (patientId) => request(`/doctor/patients/${patientId}/history`),
  createMedicalRecord: (data) => request('/doctor/medical-records', {
    method: 'POST',
    body: data
  }),
  getTodaySchedule: () => request('/doctor/schedule/today'),
  
  // Get available medicines from inventory
  getAvailableMedicines: () => request('/doctor/medicines/available'),
  
  // Prescribe medicines for a medical report
  prescribeMedicines: (recordId, medicines) => request('/doctor/prescribe-medicines', {
    method: 'POST',
    body: { record_id: recordId, medicines }
  }),
  
  // Get prescribed medicines for a report (used by nurse)
  getPrescribedMedicines: (recordId) => request(`/doctor/records/${recordId}/medicines`),
  
  // Medical Report Creation (with automatic nurse task)
  createMedicalReport: (data) => request('/doctor/create-report', {
    method: 'POST',
    body: data
  }),
  
  // Get patient's medical reports history
  getPatientReports: (patientId) => request(`/doctor/patients/${patientId}/reports`),
  
  getDoctorPrescribedMedicines: (recordId) => request(`/doctor/records/${recordId}/medicines`),
  
  // Lab Reports for Doctor
  getCompletedLabReports: () => request('/doctor/reports/lab-completed'),
  getLabReportDetails: (orderId) => request(`/doctor/reports/lab/${orderId}`),

  // ===== NURSE ROUTES =====
  // Get prescribed medicines for a report (Nurse views this)
  getNursePrescribedMedicines: (recordId) => request(`/nurse/reports/${recordId}/medicines`),
  
  // Dashboard & Stats
  getNurseStats: () => request('/nurse/stats'),
  
  // Ward & Bed Management
  getNurseWards: () => request('/nurse/wards'),
  getWardBeds: (wardId) => request(`/nurse/wards/${wardId}/beds`),
  
  // Patient Admission & Discharge
  getAvailablePatients: () => request('/nurse/patients/available'),
  getAdmittedPatients: () => request('/nurse/patients/admitted'),
  createAdmission: (data) => request('/nurse/admissions', {
    method: 'POST',
    body: data
  }),
  dischargePatient: (admissionId, data) => request(`/nurse/admissions/${admissionId}/discharge`, {
    method: 'POST',
    body: data
  }),
  
  // Vital Signs
  recordVitalSigns: (data) => request('/nurse/vital-signs', {
    method: 'POST',
    body: data
  }),
  getPatientVitalSigns: (patientId) => request(`/nurse/patients/${patientId}/vital-signs`),
  
  // Doctors List (for admission form)
  getDoctorsList: () => request('/nurse/doctors'),
  
  // Nurse Tasks & Medical Reports (Doctor → Nurse Workflow)
  getNurseTasks: (status = null) => {
    const url = status ? `/nurse/tasks?status=${status}` : '/nurse/tasks';
    return request(url);
  },
  
  // Get full medical report details
  getNurseMedicalReport: (recordId) => request(`/nurse/reports/${recordId}`),
  
  // Claim task
  claimNurseTask: (taskId) => request(`/nurse/tasks/${taskId}/claim`, {
    method: 'PATCH'
  }),
  
  // Update task status (complete/cancel)
  updateNurseTaskStatus: (taskId, data) => request(`/nurse/tasks/${taskId}`, {
    method: 'PATCH',
    body: data
  }),
  
  // Add nursing notes to medical report
  addNursingNotes: (recordId, data) => request(`/nurse/reports/${recordId}/notes`, {
    method: 'POST',
    body: data
  }),

  // ===== LAB TECHNICIAN ROUTES =====
  // Get all pending lab orders
  getPendingLabOrders: () => request('/lab/orders/pending'),
  
  // Get specific lab order with all tests details
  getLabOrderDetails: (orderId) => request(`/lab/orders/${orderId}`),
  
  // Update lab order status (PENDING → IN_PROGRESS → COMPLETED)
  updateLabOrderStatus: (orderId, status) => request(`/lab/orders/${orderId}/status`, {
    method: 'PATCH',
    body: { status }
  }),
  
  // Submit lab test results
  submitLabResults: (orderId, results) => request(`/lab/orders/${orderId}/results`, {
    method: 'POST',
    body: { results }
  }),
  
  // Get lab statistics
  getLabStats: () => request('/lab/stats'),
  // ===== BED MANAGEMENT =====
getBeds: () => request('/admin/beds'),
getBedsByWard: (wardId) => request(`/admin/beds/ward/${wardId}`),
getWardsWithBedStats: () => request('/admin/wards-with-bed-stats'),
addBed: (ward_id, bed_number) => 
  request('/admin/beds', { method: 'POST', body: { ward_id, bed_number } }),
updateBedStatus: (bed_id, status) => 
  request(`/admin/beds/${bed_id}`, { method: 'PUT', body: { status } }),
deleteBed: (bed_id) => 
  request(`/admin/beds/${bed_id}`, { method: 'DELETE' }),
bulkAddBeds: (ward_id, bed_prefix, num_beds) => 
  request('/admin/beds/bulk-add', { method: 'POST', body: { ward_id, bed_prefix, num_beds } }),

};
