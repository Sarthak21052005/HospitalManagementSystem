const express = require('express');
const router = express.Router();
const { requireRole } = require('../middleware/auth');
const NurseController = require('../controllers/nurse.controller');

// ===== DASHBOARD =====
router.get('/stats', requireRole('nurse'), NurseController.getStats);

// ===== WARDS & BEDS =====
router.get('/wards', requireRole('nurse'), NurseController.getWards);
router.get('/wards/:wardId/beds', requireRole('nurse'), NurseController.getWardBeds);

// ===== PATIENTS =====
router.get('/patients/eligible-for-admission', requireRole('nurse'), NurseController.getEligiblePatients);
router.get('/patients/admitted', requireRole('nurse'), NurseController.getAdmittedPatients);
router.get('/patients/:patientId/vital-signs', requireRole('nurse'), NurseController.getPatientVitalSigns);

// ===== ADMISSIONS =====
router.post('/admissions', requireRole('nurse'), NurseController.admitPatient);
router.post('/admissions/:admissionId/discharge', requireRole('nurse'), NurseController.dischargePatient);

// ===== VITAL SIGNS =====
router.post('/vital-signs', requireRole('nurse'), NurseController.recordVitalSigns);

// ===== TASKS =====
router.get('/tasks', requireRole('nurse'), NurseController.getTasks);
router.patch('/tasks/:taskId/claim', requireRole('nurse'), NurseController.claimTask);
router.patch('/tasks/:taskId', requireRole('nurse'), NurseController.updateTask);

// ===== MEDICAL RECORDS =====
router.get('/reports/:recordId', requireRole('nurse'), NurseController.getMedicalReport);
router.post('/reports/:recordId/notes', requireRole('nurse'), NurseController.addNursingNotes);
router.get('/reports/:recordId/medicines', requireRole('nurse'), NurseController.getPrescribedMedicines);

// ===== DOCTORS =====
router.get('/doctors', requireRole('nurse'), NurseController.getDoctors);

module.exports = router;
