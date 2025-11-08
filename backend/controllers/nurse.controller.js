const NurseService = require('../services/nurse.service');

class NurseController {
  // ===== STATS =====
  static async getStats(req, res) {
    try {
      const nurseId = req.session.user.id;
      const stats = await NurseService.getStats(nurseId);
      res.json(stats);
    } catch (error) {
      console.error('❌ Error fetching nurse stats:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // ===== WARDS =====
  static async getWards(req, res) {
    try {
      const nurseId = req.session.user.id;
      const wards = await NurseService.getWards(nurseId);
      console.log(`✅ Nurse ${nurseId} has ${wards.length} ACTIVE ward(s)`);
      res.json(wards);
    } catch (error) {
      console.error('❌ Error fetching wards:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  static async getWardBeds(req, res) {
    try {
      const nurseId = req.session.user.id;
      const { wardId } = req.params;
      const beds = await NurseService.getWardBeds(wardId, nurseId);
      res.json(beds);
    } catch (error) {
      if (error.message === 'ACCESS_DENIED') {
        return res.status(403).json({ message: 'Access denied to this ward' });
      }
      console.error('❌ Error fetching beds:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // ===== PATIENTS =====
  static async getEligiblePatients(req, res) {
    try {
      const patients = await NurseService.getEligiblePatients();
      console.log(`✅ Found ${patients.length} patients eligible for admission`);
      res.json(patients);
    } catch (error) {
      console.error('❌ Error fetching eligible patients:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  static async getAdmittedPatients(req, res) {
    try {
      const nurseId = req.session.user.id;
      const patients = await NurseService.getAdmittedPatients(nurseId);
      res.json(patients);
    } catch (error) {
      console.error('❌ Error fetching admitted patients:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // ===== ADMISSIONS =====
  static async admitPatient(req, res) {
    try {
      const nurseId = req.session.user.id;
      const result = await NurseService.admitPatient(nurseId, req.body);
      
      const message = result.reassignment 
        ? 'Bed reassigned successfully' 
        : 'Patient admitted successfully';
      
      const statusCode = result.reassignment ? 200 : 201;
      
      res.status(statusCode).json({
        success: true,
        admission_id: result.admission_id,
        message,
        reassignment: result.reassignment
      });
    } catch (error) {
      if (error.message === 'MISSING_FIELDS') {
        return res.status(400).json({ message: 'Missing required fields' });
      }
      if (error.message === 'NO_MEDICAL_RECORD') {
        return res.status(400).json({ 
          message: 'Patient must have a medical record created by a doctor before admission' 
        });
      }
      if (error.message === 'ACCESS_DENIED') {
        return res.status(403).json({ message: 'You do not have active access to this ward' });
      }
      if (error.message === 'BED_NOT_FOUND') {
        return res.status(404).json({ message: 'Bed not found' });
      }
      if (error.message === 'BED_NOT_AVAILABLE') {
        return res.status(400).json({ message: 'Bed is not available' });
      }
      console.error('❌ Error creating/updating admission:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  static async dischargePatient(req, res) {
    try {
      const { admissionId } = req.params;
      const { discharge_summary } = req.body;
      await NurseService.dischargePatient(admissionId, discharge_summary);
      res.json({ success: true, message: 'Patient discharged successfully' });
    } catch (error) {
      if (error.message === 'ADMISSION_NOT_FOUND') {
        return res.status(404).json({ message: 'Admission not found' });
      }
      console.error('❌ Error discharging patient:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // ===== VITAL SIGNS =====
  static async recordVitalSigns(req, res) {
    try {
      const nurseId = req.session.user.id;
      const vitalSigns = await NurseService.recordVitalSigns(nurseId, req.body);
      console.log(`🩺 Vital signs recorded for patient ${req.body.patient_id} by nurse ${nurseId}`);
      res.json(vitalSigns);
    } catch (error) {
      if (error.message === 'PATIENT_ID_REQUIRED') {
        return res.status(400).json({ message: 'Patient ID is required' });
      }
      console.error('❌ Error recording vital signs:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  static async getPatientVitalSigns(req, res) {
    try {
      const { patientId } = req.params;
      const vitalSigns = await NurseService.getPatientVitalSigns(patientId);
      res.json(vitalSigns);
    } catch (error) {
      console.error('❌ Error fetching vital signs:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // ===== TASKS =====
  static async getTasks(req, res) {
    try {
      const tasks = await NurseService.getTasks(req.query);
      console.log(`📋 Retrieved ${tasks.length} tasks`);
      res.json(tasks);
    } catch (error) {
      console.error('❌ Error fetching nurse tasks:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  static async claimTask(req, res) {
    try {
      const nurseId = req.session.user.id;
      const { taskId } = req.params;
      console.log(`🔄 Nurse ${nurseId} claiming task ${taskId}`);
      const task = await NurseService.claimTask(taskId, nurseId);
      res.json(task);
    } catch (error) {
      if (error.message === 'TASK_NOT_FOUND') {
        return res.status(404).json({ message: 'Task not found' });
      }
      if (error.message === 'TASK_ALREADY_CLAIMED') {
        return res.status(400).json({ message: 'Task already claimed or completed' });
      }
      console.error('❌ Error claiming task:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  static async updateTask(req, res) {
    try {
      const { taskId } = req.params;
      const task = await NurseService.updateTask(taskId, req.body);
      res.json(task);
    } catch (error) {
      if (error.message === 'TASK_NOT_FOUND') {
        return res.status(404).json({ message: 'Task not found' });
      }
      console.error('❌ Error updating task:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // ===== MEDICAL RECORDS =====
  static async getMedicalReport(req, res) {
    try {
      const { recordId } = req.params;
      const report = await NurseService.getMedicalReport(recordId);
      console.log(`📋 Nurse viewing medical report: ${recordId}`);
      res.json(report);
    } catch (error) {
      if (error.message === 'RECORD_NOT_FOUND') {
        return res.status(404).json({ message: 'Medical report not found' });
      }
      console.error('❌ Error fetching medical report:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  static async addNursingNotes(req, res) {
    try {
      const nurseId = req.session.user.id;
      const { recordId } = req.params;
      const { nursing_notes } = req.body;
      await NurseService.addNursingNotes(recordId, nurseId, nursing_notes);
      res.json({ success: true, message: 'Nursing notes added successfully' });
    } catch (error) {
      if (error.message === 'RECORD_NOT_FOUND') {
        return res.status(404).json({ message: 'Medical record not found' });
      }
      console.error('❌ Error adding nursing notes:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  static async getPrescribedMedicines(req, res) {
    try {
      const { recordId } = req.params;
      const medicines = await NurseService.getPrescribedMedicines(recordId);
      console.log(`💊 Retrieved ${medicines.length} prescribed medicines for record ${recordId}`);
      res.json(medicines);
    } catch (error) {
      console.error('❌ Error fetching prescribed medicines:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // ===== DOCTORS =====
  static async getDoctors(req, res) {
    try {
      const doctors = await NurseService.getDoctors();
      res.json(doctors);
    } catch (error) {
      console.error('❌ Error fetching doctors:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
}

module.exports = NurseController;
