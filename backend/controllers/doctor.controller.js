const DoctorService = require('../services/doctor.Service');
const ErrorHandler = require('../utils/errorhandler');
class DoctorController {
  // ===== STATS =====
  static async getStats(req, res) {
    try {
      const doctorId = req.session.user.id;
      const stats = await DoctorService.getStats(doctorId);
      res.json(stats);
    } catch (error) {
      console.error('❌ Error fetching doctor stats:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // ===== GET ALL PATIENTS =====
  static async getPatients(req, res) {
    try {
      const doctorId = req.session.user.id;
      const patients = await DoctorService.getPatients(doctorId);
      console.log(`✅ Retrieved ${patients.length} patients (without today's report)`);
      res.json(patients);
    } catch (error) {
      console.error('❌ Error fetching patients:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // ===== TODAY'S SCHEDULE =====
  static async getTodaySchedule(req, res) {
    try {
      const schedule = await DoctorService.getTodaySchedule();
      res.json(schedule);
    } catch (error) {
      console.error('❌ Error fetching today\'s patients:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // ===== PENDING APPOINTMENTS =====
  static async getPendingAppointments(req, res) {
    try {
      const appointments = await DoctorService.getPendingAppointments();
      res.json(appointments);
    } catch (error) {
      console.error('❌ Error fetching pending patients:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // ===== PATIENT HISTORY =====
  static async getPatientHistory(req, res) {
    try {
      const patientId = req.params.id;
      const history = await DoctorService.getPatientHistory(patientId);
      res.json(history);
    } catch (error) {
      if (error.message === 'PATIENT_NOT_FOUND') {
        return res.status(404).json({ message: 'Patient not found' });
      }
      console.error('❌ Error fetching patient history:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // ===== CREATE MEDICAL REPORT =====
  static async createMedicalReport(req, res) {
    try {
      const doctorId = req.session.user.id;
      const result = await DoctorService.createMedicalReport(doctorId, req.body);
      
      const message = result.lab_order_created
        ? 'Medical report created! Lab tests ordered and nurse notified.'
        : 'Medical report created successfully! Nurse has been notified.';
      
      res.json({ ...result, message });
    } catch (error) {
      if (error.message.includes('VALIDATION_ERROR')) {
        return res.status(400).json({ error: error.message });
      }
      if (error.message === 'PATIENT_NOT_FOUND') {
        return res.status(404).json({ error: 'Patient not found' });
      }
      console.error('❌ Error creating medical report:', error);
      res.status(500).json({ error: 'Failed to create medical report', details: error.message });
    }
  }

  // ===== GET PATIENT REPORTS =====
  static async getPatientReports(req, res) {
    try {
      const { patientId } = req.params;
      const reports = await DoctorService.getPatientReports(patientId);
      res.json(reports);
    } catch (error) {
      console.error('❌ Error fetching patient reports:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // ===== GET AVAILABLE MEDICINES =====
  static async getAvailableMedicines(req, res) {
    try {
      const medicines = await DoctorService.getAvailableMedicines();
      console.log(`📦 Retrieved ${medicines.length} available medicines`);
      res.json(medicines);
    } catch (error) {
      console.error('❌ Error fetching medicines:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // ===== PRESCRIBE MEDICINES =====
  static async prescribeMedicines(req, res) {
    try {
      const doctorId = req.session.user.id;
      const result = await DoctorService.prescribeMedicines(doctorId, req.body);
      console.log(`✅ ${result.count} medicines prescribed successfully`);
      res.json({ success: true, message: `${result.count} medicine(s) prescribed successfully` });
    } catch (error) {
      if (error.message.includes('MEDICINE_NOT_FOUND')) {
        return res.status(404).json({ message: error.message.replace('MEDICINE_NOT_FOUND: ', '') });
      }
      if (error.message.includes('INSUFFICIENT_STOCK')) {
        return res.status(400).json({ message: error.message.replace('INSUFFICIENT_STOCK: ', '') });
      }
      console.error('❌ Error prescribing medicines:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // ===== GET PRESCRIBED MEDICINES =====
  static async getPrescribedMedicines(req, res) {
    try {
      const { recordId } = req.params;
      const medicines = await DoctorService.getPrescribedMedicines(recordId);
      console.log(`💊 Retrieved ${medicines.length} prescribed medicines for record ${recordId}`);
      res.json(medicines);
    } catch (error) {
      console.error('❌ Error fetching prescribed medicines:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // ===== GET COMPLETED LAB REPORTS =====
  static async getCompletedLabReports(req, res) {
    try {
      const doctorId = req.session.user.id;
      const reports = await DoctorService.getCompletedLabReports(doctorId);
      res.json(reports);
    } catch (error) {
      console.error('❌ Error fetching completed lab reports:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // ===== GET LAB REPORT DETAILS =====
  static async getLabReportDetails(req, res) {
    try {
      const { orderId } = req.params;
      const report = await DoctorService.getLabReportDetails(orderId);
      res.json(report);
    } catch (error) {
      if (error.message === 'LAB_REPORT_NOT_FOUND') {
        return res.status(404).json({ message: 'Lab report not found.' });
      }
      console.error(`❌ Error fetching lab report ${req.params.orderId}:`, error);
      res.status(500).json({ message: 'Server error' });
    }
  }
}

module.exports = DoctorController;
