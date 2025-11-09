const express = require('express');
const router = express.Router();
const { requireRole } = require('../middleware/auth');
const ScheduleController = require('../controllers/schedule.controller');

// ===== ADMIN: DOCTOR SCHEDULING =====
router.post('/doctor', requireRole('admin'), ScheduleController.assignDoctorToWard);
router.get('/doctor', requireRole('admin'), ScheduleController.getDoctorSchedules);

// ===== ADMIN: NURSE SCHEDULING =====
router.post('/nurse', requireRole('admin'), ScheduleController.assignNurseToWard);
router.get('/nurse', requireRole('admin'), ScheduleController.getNurseSchedules);

// ===== DOCTOR: VIEW OWN SCHEDULE =====
router.get('/doctor/my-schedule', requireRole('doctor'), ScheduleController.getCurrentDoctorSchedule);

// ===== NURSE: VIEW OWN SCHEDULE =====
router.get('/nurse/my-schedule', requireRole('nurse'), ScheduleController.getCurrentNurseSchedule);

// ===== SCHEDULE MANAGEMENT (ADMIN) =====
router.put('/:type/:scheduleId', requireRole('admin'), ScheduleController.updateSchedule);
router.patch('/:type/:scheduleId/cancel', requireRole('admin'), ScheduleController.cancelSchedule);
router.delete('/:type/:scheduleId', requireRole('admin'), ScheduleController.deleteSchedule);

// ===== WARD OVERVIEW =====
router.get('/ward/:wardId/summary', requireRole('admin'), ScheduleController.getWardScheduleSummary);

// ===== UPCOMING SCHEDULES =====
router.get('/upcoming/:type', requireRole('admin'), ScheduleController.getUpcomingSchedules);

module.exports = router;
