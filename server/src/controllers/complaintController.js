const { validationResult } = require('express-validator');
const emailService = require('../services/emailService');
const complaintService = require('../services/complaintService');
const aiService = require('../services/aiService');

const create = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array().map((e) => ({ field: e.path, message: e.msg }))
      });
    }

    const { title, description, category, location, priority, attachments } = req.body;
    const complaint = await complaintService.createComplaint({
      title,
      description,
      category,
      location,
      priority,
      attachments,
      user: req.user
    });

    res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully and queued for AI triage',
      data: complaint
    });
  } catch (error) {
    next(error);
  }
};

const getAll = async (req, res, next) => {
  try {
    const { category, status, priority, search, page, limit } = req.query;
    const result = await complaintService.getComplaints({
      category,
      status,
      priority,
      search,
      page,
      limit,
      user: req.user
    });

    res.status(200).json({
      success: true,
      data: result.complaints,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await complaintService.getComplaintById(id, req.user);

    res.status(200).json({
      success: true,
      data: result.complaint,
      timeline: result.timeline
    });
  } catch (error) {
    next(error);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, resolutionNotes, comment } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const result = await complaintService.updateComplaintStatus(
      id,
      { status, resolutionNotes, comment },
      req.user
    );

    // Emit real‑time update via Socket.IO
    const io = req.app.get('io');
    io.emit('complaintUpdated', { id, status: result.complaint.status });

    // Send email notification to the student
    try {
      const User = require('../models/User');
      const student = await User.findById(result.complaint.studentId);
      if (student && student.email) {
        await emailService.sendEmail(
          student.email,
          `Your complaint status changed to ${result.complaint.status}`,
          `<p>Dear ${student.name},</p><p>Your complaint "${result.complaint.title}" is now <strong>${result.complaint.status}</strong>.</p><p>Thank you.</p>`
        );
      }
    } catch (e) {
      console.warn('Failed to send status email', e);
    }

    res.status(200).json({
      success: true,
      message: 'Status updated successfully',
      data: result.complaint,
      log: result.log
    });
  } catch (error) {
    next(error);
  }
};

const assign = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { assignedTo } = req.body;

    const result = await complaintService.assignComplaint(
      id,
      { assignedTo },
      req.user
    );

    // Emit real‑time update
    const io = req.app.get('io');
    io.emit('complaintUpdated', { id, assignedTo });

    // Notify assigned staff via email (if they have an email)
    try {
      const User = require('../models/User');
      const staff = await User.findById(assignedTo);
      if (staff && staff.email) {
        await emailService.sendEmail(
          staff.email,
          `You have been assigned a new complaint`,
          `<p>Hello ${staff.name},</p><p>You have been assigned to complaint "${result.complaint.title}".</p>`
        );
      }
    } catch (e) {
      console.warn('Failed to send assignment email', e);
    }

    res.status(200).json({
      success: true,
      message: 'Ticket assigned successfully',
      data: result.complaint,
      log: result.log
    });
  } catch (error) {
    next(error);
  }
};

const submitFeedback = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, feedback } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    const result = await complaintService.submitFeedback(
      id,
      { rating, feedback },
      req.user
    );

    // Emit real‑time update (complaint is now closed)
    const io = req.app.get('io');
    io.emit('complaintUpdated', { id, status: result.complaint.status });

    // Send email to student confirming closure
    try {
      const User = require('../models/User');
      const student = await User.findById(result.complaint.studentId);
      if (student && student.email) {
        await emailService.sendEmail(
          student.email,
          `Your complaint has been resolved`,
          `<p>Dear ${student.name},</p><p>Your complaint "${result.complaint.title}" has been marked as <strong>${result.complaint.status}</strong> and we received your feedback.</p>`
        );
      }
    } catch (e) {
      console.warn('Failed to send feedback email', e);
    }

    res.status(200).json({
      success: true,
      message: 'Feedback submitted successfully. Ticket closed.',
      data: result.complaint,
      log: result.log
    });
  } catch (error) {
    next(error);
  }
};

const uploadEvidence = (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'Please provide an image file to upload'
    });
  }

  // Construct accessible relative URL
  const fileUrl = `/uploads/${req.file.filename}`;

  res.status(200).json({
    success: true,
    message: 'Evidence image uploaded successfully',
    url: fileUrl,
    filename: req.file.filename
  });
};

const getAiPreview = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    const result = await aiService.classifyComplaint({ title, description });

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  create,
  getAll,
  getById,
  updateStatus,
  assign,
  submitFeedback,
  uploadEvidence,
  getAiPreview
};
