const ScheduleService = require('../services/schedule.service');

class ScheduleController {
  // ===== DOCTOR SCHEDULING =====
  
  static async assignDoctorToWard(req, res) {
    try {
      const adminId = req.session.user.id;
      const schedule = await ScheduleService.assignDoctorToWard(adminId, req.body);
      res.status(201).json({ 
        success: true, 
        message: 'Doctor assigned to ward successfully', 
        schedule 
      });
    } catch (error) {
      if (error.message === 'INVALID_DATE_RANGE') {
        return res.status(400).json({ message: 'Invalid date range: end date must be after start date' });
      }
      if (error.message === 'SCHEDULE_CONFLICT') {
        return res.status(409).json({ message: 'Doctor already has a schedule during this period' });
      }
      console.error('❌ Error assigning doctor to ward:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
  
  static async getDoctorSchedules(req, res) {
    try {
      const schedules = await ScheduleService.getDoctorSchedules(req.query);
      res.json(schedules);
    } catch (error) {
      console.error('❌ Error fetching doctor schedules:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
  
  static async getCurrentDoctorSchedule(req, res) {
    try {
      const doctorId = req.session.user.id;
      const schedules = await ScheduleService.getCurrentDoctorSchedule(doctorId);
      res.json(schedules);
    } catch (error) {
      console.error('❌ Error fetching current doctor schedule:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
  
  // ===== NURSE SCHEDULING =====
  
  static async assignNurseToWard(req, res) {
    try {
      const adminId = req.session.user.id;
      const schedule = await ScheduleService.assignNurseToWard(adminId, req.body);
      res.status(201).json({ 
        success: true, 
        message: 'Nurse assigned to ward successfully', 
        schedule 
      });
    } catch (error) {
      if (error.message === 'INVALID_DATE_RANGE') {
        return res.status(400).json({ message: 'Invalid date range: end date must be after start date' });
      }
      if (error.message === 'SCHEDULE_CONFLICT') {
        return res.status(409).json({ message: 'Nurse already has a schedule during this period' });
      }
      console.error('❌ Error assigning nurse to ward:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
  
  static async getNurseSchedules(req, res) {
    try {
      const schedules = await ScheduleService.getNurseSchedules(req.query);
      res.json(schedules);
    } catch (error) {
      console.error('❌ Error fetching nurse schedules:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
  
  static async getCurrentNurseSchedule(req, res) {
    try {
      const nurseId = req.session.user.id;
      const schedules = await ScheduleService.getCurrentNurseSchedule(nurseId);
      res.json(schedules);
    } catch (error) {
      console.error('❌ Error fetching current nurse schedule:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
  
  // ===== SCHEDULE MANAGEMENT =====
  
  static async updateSchedule(req, res) {
    try {
      const { scheduleId, type } = req.params;
      const schedule = await ScheduleService.updateSchedule(scheduleId, type, req.body);
      res.json({ 
        success: true, 
        message: 'Schedule updated successfully', 
        schedule 
      });
    } catch (error) {
      if (error.message === 'NO_UPDATES_PROVIDED') {
        return res.status(400).json({ message: 'No update fields provided' });
      }
      if (error.message === 'SCHEDULE_NOT_FOUND') {
        return res.status(404).json({ message: 'Schedule not found' });
      }
      console.error('❌ Error updating schedule:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
  
  static async cancelSchedule(req, res) {
    try {
      const { scheduleId, type } = req.params;
      const schedule = await ScheduleService.cancelSchedule(scheduleId, type);
      res.json({ 
        success: true, 
        message: 'Schedule cancelled successfully', 
        schedule 
      });
    } catch (error) {
      if (error.message === 'SCHEDULE_NOT_FOUND') {
        return res.status(404).json({ message: 'Schedule not found' });
      }
      console.error('❌ Error cancelling schedule:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
  
  static async deleteSchedule(req, res) {
    try {
      const { scheduleId, type } = req.params;
      await ScheduleService.deleteSchedule(scheduleId, type);
      res.json({ 
        success: true, 
        message: 'Schedule deleted successfully' 
      });
    } catch (error) {
      if (error.message === 'SCHEDULE_NOT_FOUND') {
        return res.status(404).json({ message: 'Schedule not found' });
      }
      console.error('❌ Error deleting schedule:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
  
  // ===== WARD OVERVIEW =====
  
  static async getWardScheduleSummary(req, res) {
    try {
      const { wardId } = req.params;
      const { week_start } = req.query;
      
      if (!week_start) {
        return res.status(400).json({ message: 'week_start query parameter is required' });
      }
      
      const summary = await ScheduleService.getWardScheduleSummary(wardId, week_start);
      res.json(summary);
    } catch (error) {
      console.error('❌ Error fetching ward schedule summary:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
  
  // ===== UPCOMING SCHEDULES =====
  
  static async getUpcomingSchedules(req, res) {
    try {
      const { type } = req.params;
      const { limit } = req.query;
      
      if (type !== 'doctor' && type !== 'nurse') {
        return res.status(400).json({ message: 'Invalid type. Must be "doctor" or "nurse"' });
      }
      
      const schedules = await ScheduleService.getUpcomingSchedules(type, limit ? parseInt(limit) : 10);
      res.json(schedules);
    } catch (error) {
      console.error('❌ Error fetching upcoming schedules:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
}

module.exports = ScheduleController;
