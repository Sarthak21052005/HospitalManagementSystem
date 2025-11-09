const express = require('express');
const router = express.Router();
const { requireRole } = require('../middleware/auth');
const DoctorController = require('../controllers/doctor.Controller');

// ===== DASHBOARD =====
router.get('/stats', requireRole('doctor'), DoctorController.getStats);

// ===== PATIENTS =====
router.get('/patients', requireRole('doctor'), DoctorController.getPatients);
router.get('/patients/:id/history', requireRole('doctor'), DoctorController.getPatientHistory);
router.get('/patients/:patientId/reports', requireRole('doctor'), DoctorController.getPatientReports);

// ===== SCHEDULE & APPOINTMENTS =====
router.get('/schedule/today', requireRole('doctor'), DoctorController.getTodaySchedule);
router.get('/appointments', requireRole('doctor'), DoctorController.getPendingAppointments);

// ===== MEDICAL RECORDS =====
router.post('/create-report', requireRole('doctor'), DoctorController.createMedicalReport);

// ===== MEDICINES =====
router.get('/medicines/available', requireRole('doctor'), DoctorController.getAvailableMedicines);
router.post('/prescribe-medicines', requireRole('doctor'), DoctorController.prescribeMedicines);
router.get('/records/:recordId/medicines', requireRole('doctor'), DoctorController.getPrescribedMedicines);

// ===== LAB REPORTS =====
router.get('/reports/lab-completed', requireRole('doctor'), DoctorController.getCompletedLabReports);
router.get('/reports/lab/:orderId', requireRole('doctor'), DoctorController.getLabReportDetails);

module.exports = router;
