const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { requireRole } = require('../middleware/auth');
const validate = require('../middleware/validate');
const AdminController = require('../controllers/admin.controller');

// ===== DOCTORS =====
router.get('/doctors', requireRole('admin'), AdminController.getAllDoctors);

router.post('/doctors', requireRole('admin'), [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').notEmpty().trim(),
  body('specialization').notEmpty().trim(),
  body('contact').notEmpty().trim(),
  body('working_hours').optional()
], validate, AdminController.addDoctor);

router.put('/doctors/:id', requireRole('admin'), [
  body('name').optional().trim(),
  body('specialization').optional().trim(),
  body('contact').optional().trim(),
  body('working_hours').optional()    
], validate, AdminController.updateDoctor);

router.delete('/doctors/:id', requireRole('admin'), AdminController.deleteDoctor);

// ===== NURSES =====
router.get('/nurses', requireRole('admin'), AdminController.getAllNurses);

router.post('/nurses', requireRole('admin'), [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').notEmpty().trim(),
  body('contact').notEmpty().trim()
], validate, AdminController.addNurse);

router.put('/nurses/:id', requireRole('admin'), [
  body('name').optional().trim(),
  body('contact').optional().trim()
], validate, AdminController.updateNurse);

router.delete('/nurses/:id', requireRole('admin'), AdminController.deleteNurse);

// ===== WARD ASSIGNMENTS =====
router.get('/ward-assignments', requireRole('admin'), AdminController.getWardAssignments);
router.get('/available-nurses', requireRole('admin'), AdminController.getAvailableNurses);
router.get('/wards-list', requireRole('admin'), AdminController.getWardsListWithStats);
router.post('/assign-ward', requireRole('admin'), AdminController.assignWard);
router.post('/unassign-ward', requireRole('admin'), AdminController.unassignWard);
router.post('/reassign-ward', requireRole('admin'), AdminController.reassignWard);

// ===== BED MANAGEMENT =====
router.get('/beds', requireRole('admin'), AdminController.getAllBeds);
router.get('/beds/ward/:wardId', requireRole('admin'), AdminController.getBedsByWard);
router.get('/wards-with-bed-stats', requireRole('admin'), AdminController.getWardsWithBedStats);
router.post('/beds', requireRole('admin'), AdminController.addBed);
router.put('/beds/:bedId', requireRole('admin'), AdminController.updateBedStatus);
router.delete('/beds/:bedId', requireRole('admin'), AdminController.deleteBed);
router.post('/beds/bulk-add', requireRole('admin'), AdminController.bulkAddBeds);

module.exports = router;
