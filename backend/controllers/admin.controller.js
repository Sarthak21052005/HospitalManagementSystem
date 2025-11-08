const AdminService = require('../services/admin.service');

class AdminController {
  // ===== DOCTORS =====
  static async getAllDoctors(req, res) {
    try {
      const doctors = await AdminService.getAllDoctors();
      res.json(doctors);
    } catch (err) {
      console.error('❌ Error fetching doctors:', err);
      res.status(500).json({ message: 'Server error' });
    }
  }

  static async addDoctor(req, res) {
    try {
      const doctor = await AdminService.addDoctor(req.body);
      console.log(`✅ Doctor added: ${doctor.name} (${doctor.email})`);
      res.status(201).json(doctor);
    } catch (err) {
      if (err.message === 'EMAIL_EXISTS') {
        return res.status(400).json({ message: 'Email already registered' });
      }
      console.error('❌ Error adding doctor:', err);
      res.status(500).json({ message: 'Server error' });
    }
  }

  static async updateDoctor(req, res) {
    try {
      const doctor = await AdminService.updateDoctor(req.params.id, req.body);
      console.log(`✅ Doctor updated: ${doctor.name}`);
      res.json(doctor);
    } catch (err) {
      if (err.message === 'DOCTOR_NOT_FOUND') {
        return res.status(404).json({ message: 'Doctor not found' });
      }
      console.error('❌ Error updating doctor:', err);
      res.status(500).json({ message: 'Server error' });
    }
  }

  static async deleteDoctor(req, res) {
    try {
      const doctor = await AdminService.deleteDoctor(req.params.id);
      console.log(`✅ Doctor deleted: ${doctor.name}`);
      res.json({ message: 'Doctor deleted successfully' });
    } catch (err) {
      if (err.message === 'DOCTOR_NOT_FOUND') {
        return res.status(404).json({ message: 'Doctor not found' });
      }
      console.error('❌ Error deleting doctor:', err);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // ===== NURSES =====
  static async getAllNurses(req, res) {
    try {
      const nurses = await AdminService.getAllNurses();
      res.json(nurses);
    } catch (err) {
      console.error('❌ Error fetching nurses:', err);
      res.status(500).json({ message: 'Server error' });
    }
  }

  static async addNurse(req, res) {
    try {
      const nurse = await AdminService.addNurse(req.body);
      console.log(`✅ Nurse added: ${nurse.name} (${nurse.email})`);
      res.status(201).json(nurse);
    } catch (err) {
      if (err.message === 'EMAIL_EXISTS') {
        return res.status(400).json({ message: 'Email already registered' });
      }
      console.error('❌ Error adding nurse:', err);
      res.status(500).json({ message: 'Server error' });
    }
  }

  static async updateNurse(req, res) {
    try {
      const nurse = await AdminService.updateNurse(req.params.id, req.body);
      console.log(`✅ Nurse updated: ${nurse.name}`);
      res.json(nurse);
    } catch (err) {
      if (err.message === 'NURSE_NOT_FOUND') {
        return res.status(404).json({ message: 'Nurse not found' });
      }
      console.error('❌ Error updating nurse:', err);
      res.status(500).json({ message: 'Server error' });
    }
  }

  static async deleteNurse(req, res) {
    try {
      const nurse = await AdminService.deleteNurse(req.params.id);
      console.log(`✅ Nurse deleted: ${nurse.name}`);
      res.json({ message: 'Nurse deleted successfully' });
    } catch (err) {
      if (err.message === 'NURSE_NOT_FOUND') {
        return res.status(404).json({ message: 'Nurse not found' });
      }
      console.error('❌ Error deleting nurse:', err);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // ===== WARD ASSIGNMENTS =====
  static async getWardAssignments(req, res) {
    try {
      const assignments = await AdminService.getWardAssignments();
      res.json(assignments);
    } catch (err) {
      console.error('❌ Error fetching ward assignments:', err);
      res.status(500).json({ message: 'Server error' });
    }
  }

  static async getAvailableNurses(req, res) {
    try {
      const nurses = await AdminService.getAvailableNurses();
      res.json(nurses);
    } catch (err) {
      console.error('❌ Error fetching available nurses:', err);
      res.status(500).json({ message: 'Server error' });
    }
  }

  static async getWardsListWithStats(req, res) {
    try {
      const wards = await AdminService.getWardsListWithStats();
      res.json(wards);
    } catch (err) {
      console.error('❌ Error fetching wards:', err);
      res.status(500).json({ message: 'Server error' });
    }
  }

  static async assignWard(req, res) {
    try {
      const { nurse_id, ward_id } = req.body;
      if (!nurse_id || !ward_id) {
        return res.status(400).json({ message: 'Nurse ID and Ward ID are required' });
      }
      const assignment = await AdminService.assignWard(nurse_id, ward_id);
      console.log(`✅ Nurse ${nurse_id} assigned to Ward ${ward_id}`);
      res.json({ success: true, message: 'Ward assigned successfully', assignment });
    } catch (err) {
      if (err.message === 'ALREADY_ASSIGNED') {
        return res.status(400).json({ message: 'Nurse is already assigned to this ward' });
      }
      console.error('❌ Error assigning ward:', err);
      res.status(500).json({ message: 'Server error' });
    }
  }

  static async unassignWard(req, res) {
    try {
      const { ward_nurse_id } = req.body;
      if (!ward_nurse_id) {
        return res.status(400).json({ message: 'Assignment ID is required' });
      }
      const assignment = await AdminService.unassignWard(ward_nurse_id);
      console.log(`✅ Ward assignment ${ward_nurse_id} ended`);
      res.json({ success: true, message: 'Ward unassigned successfully', assignment });
    } catch (err) {
      if (err.message === 'ASSIGNMENT_NOT_FOUND') {
        return res.status(404).json({ message: 'Assignment not found or already ended' });
      }
      console.error('❌ Error unassigning ward:', err);
      res.status(500).json({ message: 'Server error' });
    }
  }

  static async reassignWard(req, res) {
    try {
      const { old_ward_nurse_id, new_ward_id } = req.body;
      if (!old_ward_nurse_id || !new_ward_id) {
        return res.status(400).json({ message: 'Old assignment ID and new ward ID are required' });
      }
      const assignment = await AdminService.reassignWard(old_ward_nurse_id, new_ward_id);
      console.log(`✅ Nurse reassigned to Ward ${new_ward_id}`);
      res.json({ success: true, message: 'Ward reassigned successfully', assignment });
    } catch (err) {
      if (err.message === 'ASSIGNMENT_NOT_FOUND') {
        return res.status(404).json({ message: 'Old assignment not found' });
      }
      console.error('❌ Error reassigning ward:', err);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // ===== BED MANAGEMENT =====
  static async getAllBeds(req, res) {
    try {
      const beds = await AdminService.getAllBeds();
      res.json(beds);
    } catch (err) {
      console.error('❌ Error fetching beds:', err);
      res.status(500).json({ message: 'Server error' });
    }
  }

  static async getBedsByWard(req, res) {
    try {
      const beds = await AdminService.getBedsByWard(req.params.wardId);
      res.json(beds);
    } catch (err) {
      console.error('❌ Error fetching ward beds:', err);
      res.status(500).json({ message: 'Server error' });
    }
  }

  static async getWardsWithBedStats(req, res) {
    try {
      const wards = await AdminService.getWardsWithBedStats();
      res.json(wards);
    } catch (err) {
      console.error('❌ Error fetching ward bed statistics:', err);
      res.status(500).json({ message: 'Server error' });
    }
  }

  static async addBed(req, res) {
    try {
      const bed = await AdminService.addBed(req.body);
      console.log(`✅ Bed ${bed.bed_number} added to Ward ${bed.ward_id}`);
      res.json({ success: true, message: 'Bed added successfully', bed });
    } catch (err) {
      if (err.message === 'WARD_NOT_FOUND') {
        return res.status(404).json({ message: 'Ward not found' });
      }
      if (err.message.startsWith('WARD_FULL')) {
        const [, current, capacity] = err.message.split(':');
        return res.status(400).json({
          message: `Ward is at full capacity. Current beds: ${current}, Capacity: ${capacity}`
        });
      }
      if (err.message === 'BED_NUMBER_EXISTS') {
        return res.status(400).json({ message: 'Bed number already exists in this ward' });
      }
      console.error('❌ Error adding bed:', err);
      res.status(500).json({ message: 'Server error' });
    }
  }

  static async updateBedStatus(req, res) {
    try {
      const bed = await AdminService.updateBedStatus(req.params.bedId, req.body.status);
      console.log(`✅ Bed ${req.params.bedId} status updated to ${req.body.status}`);
      res.json({ success: true, message: 'Bed status updated successfully', bed });
    } catch (err) {
      if (err.message === 'INVALID_STATUS') {
        return res.status(400).json({ message: 'Invalid status' });
      }
      if (err.message === 'BED_NOT_FOUND') {
        return res.status(404).json({ message: 'Bed not found' });
      }
      console.error('❌ Error updating bed:', err);
      res.status(500).json({ message: 'Server error' });
    }
  }

  static async deleteBed(req, res) {
    try {
      await AdminService.deleteBed(req.params.bedId);
      console.log(`✅ Bed ${req.params.bedId} deleted`);
      res.json({ success: true, message: 'Bed deleted successfully' });
    } catch (err) {
      if (err.message === 'BED_NOT_FOUND') {
        return res.status(404).json({ message: 'Bed not found' });
      }
      if (err.message === 'BED_OCCUPIED') {
        return res.status(400).json({
          message: 'Cannot delete bed that is currently occupied. Please discharge the patient first.'
        });
      }
      console.error('❌ Error deleting bed:', err);
      res.status(500).json({ message: 'Server error' });
    }
  }

  static async bulkAddBeds(req, res) {
    try {
      const beds = await AdminService.bulkAddBeds(req.body);
      console.log(`✅ Added ${beds.length} beds to Ward ${req.body.ward_id}`);
      res.json({ success: true, message: `Successfully added ${beds.length} beds`, beds });
    } catch (err) {
      if (err.message === 'WARD_NOT_FOUND') {
        return res.status(404).json({ message: 'Ward not found' });
      }
      if (err.message.startsWith('INSUFFICIENT_CAPACITY')) {
        const [, current, capacity, available] = err.message.split(':');
        return res.status(400).json({
          message: `Cannot add ${req.body.num_beds} beds. Only ${available} slots available (Current: ${current}, Capacity: ${capacity})`
        });
      }
      console.error('❌ Error bulk adding beds:', err);
      res.status(500).json({ message: 'Server error' });
    }
  }
}

module.exports = AdminController;
