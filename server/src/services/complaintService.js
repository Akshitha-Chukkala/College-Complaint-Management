const Complaint = require('../models/Complaint');
const ComplaintLog = require('../models/ComplaintLog');
const Notification = require('../models/Notification');
const aiService = require('./aiService');
const { getIO } = require('../config/socket');

const createComplaint = async ({ title, description, category, location, priority, attachments, user }) => {
  // Run AI triage pipeline
  const aiResult = await aiService.classifyComplaint({ title, description });

  // Use student chosen category if provided and not 'other', else use AI inferred category
  const resolvedCategory = (category && category !== 'other') ? category : (aiResult.category || 'other');
  const resolvedPriority = priority || aiResult.priority || 'medium';

  // Create complaint entry
  const complaint = await Complaint.create({
    title,
    description,
    category: resolvedCategory,
    location,
    priority: resolvedPriority,
    attachments: attachments || [],
    studentId: user._id,
    aiSummary: aiResult.aiSummary || '',
    status: 'submitted'
  });

  // Log initial lifecycle entry in ComplaintLog
  await ComplaintLog.create({
    complaintId: complaint._id,
    actionBy: user._id,
    previousStatus: '',
    newStatus: 'submitted',
    comment: 'Complaint officially registered and queued for triage.'
  });

  // Emit real-time notification
  try {
    const io = getIO();
    io.emit('new_complaint', {
      complaintId: complaint._id,
      title: complaint.title,
      category: complaint.category,
      priority: complaint.priority,
      createdAt: complaint.createdAt
    });
  } catch (socketErr) {
    console.warn('[Socket.IO] Could not broadcast new_complaint:', socketErr.message);
  }

  return complaint;
};

const getComplaints = async ({ category, status, priority, search, page = 1, limit = 20, user }) => {
  const query = {};

  // If user is student, restrict to their complaints
  if (user.role === 'student') {
    query.studentId = user._id;
  }

  // Filters
  if (category && category !== 'all') {
    query.category = category;
  }
  if (status && status !== 'all') {
    query.status = status;
  }
  if (priority && priority !== 'all') {
    query.priority = priority;
  }
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { location: { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (page - 1) * limit;

  const [complaints, total] = await Promise.all([
    Complaint.find(query)
      .populate('studentId', 'name email studentId department')
      .populate('assignedTo', 'name email department')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Complaint.countDocuments(query)
  ]);

  return {
    complaints,
    pagination: {
      total,
      page: Number(page),
      pages: Math.ceil(total / limit)
    }
  };
};

const getComplaintById = async (id, user) => {
  const complaint = await Complaint.findById(id)
    .populate('studentId', 'name email studentId department')
    .populate('assignedTo', 'name email department');

  if (!complaint) {
    const error = new Error('Complaint not found');
    error.statusCode = 404;
    throw error;
  }

  // Access control: students can only see their own tickets
  if (user.role === 'student' && complaint.studentId._id.toString() !== user._id.toString()) {
    const error = new Error('Access denied to this complaint record');
    error.statusCode = 403;
    throw error;
  }

  // Fetch granular timeline audit logs
  const timeline = await ComplaintLog.find({ complaintId: id })
    .populate('actionBy', 'name role department')
    .sort({ timestamp: 1 });

  return {
    complaint,
    timeline
  };
};

const updateComplaintStatus = async (id, { status, resolutionNotes, comment }, user) => {
  const complaint = await Complaint.findById(id);
  if (!complaint) {
    const error = new Error('Complaint not found');
    error.statusCode = 404;
    throw error;
  }

  const previousStatus = complaint.status;
  complaint.status = status;

  if (resolutionNotes) {
    complaint.resolutionNotes = resolutionNotes;
  }

  await complaint.save();

  // Create immutable timeline audit log
  const logComment = comment || (
    status === 'resolved' 
      ? `Issue marked as resolved. Notes: ${resolutionNotes || 'Resolution completed.'}` 
      : `Status advanced from ${previousStatus} to ${status}.`
  );

  const log = await ComplaintLog.create({
    complaintId: complaint._id,
    actionBy: user._id,
    previousStatus,
    newStatus: status,
    comment: logComment
  });

  // Create persistent in-app notification for the student
  const notification = await Notification.create({
    owner: complaint.studentId,
    complaintId: complaint._id,
    type: 'status_update',
    title: `Ticket Status Updated: #${complaint._id.toString().slice(-6)}`,
    message: `Your grievance "${complaint.title}" has been updated to "${status.toUpperCase().replace('_', ' ')}".`
  });

  // Real-time broadcast via Socket.IO
  try {
    const io = getIO();
    // Notify student room
    io.to(`user:${complaint.studentId}`).emit('notification', notification);
    io.to(`user:${complaint.studentId}`).emit('status_update', {
      complaintId: complaint._id,
      previousStatus,
      newStatus: status,
      resolutionNotes: complaint.resolutionNotes,
      timestamp: log.timestamp
    });

    // Notify ticket room
    io.to(`complaint:${complaint._id}`).emit('complaint_updated', {
      complaintId: complaint._id,
      status,
      log
    });
  } catch (socketErr) {
    console.warn('[Socket.IO] Broadcast warning:', socketErr.message);
  }

  return { complaint, log };
};

const assignComplaint = async (id, { assignedTo }, user) => {
  const complaint = await Complaint.findById(id);
  if (!complaint) {
    const error = new Error('Complaint not found');
    error.statusCode = 404;
    throw error;
  }

  complaint.assignedTo = assignedTo;
  if (complaint.status === 'submitted' || complaint.status === 'under_review') {
    complaint.status = 'assigned';
  }
  await complaint.save();

  const log = await ComplaintLog.create({
    complaintId: complaint._id,
    actionBy: user._id,
    previousStatus: complaint.status,
    newStatus: 'assigned',
    comment: `Complaint assigned to staff / department lead.`
  });

  // Notify student
  const notification = await Notification.create({
    owner: complaint.studentId,
    complaintId: complaint._id,
    type: 'assignment',
    title: `Ticket Assigned: #${complaint._id.toString().slice(-6)}`,
    message: `Your ticket has been assigned to a department officer for investigation.`
  });

  try {
    const io = getIO();
    io.to(`user:${complaint.studentId}`).emit('notification', notification);
  } catch (e) {
    console.warn('[Socket.IO] Assign emit error:', e.message);
  }

  return { complaint, log };
};

const submitFeedback = async (id, { rating, feedback }, user) => {
  const complaint = await Complaint.findById(id);
  if (!complaint) {
    const error = new Error('Complaint not found');
    error.statusCode = 404;
    throw error;
  }

  if (complaint.studentId.toString() !== user._id.toString()) {
    const error = new Error('Only the student who submitted this ticket can provide feedback');
    error.statusCode = 403;
    throw error;
  }

  complaint.rating = rating;
  complaint.feedback = feedback;
  complaint.status = 'closed';
  await complaint.save();

  const log = await ComplaintLog.create({
    complaintId: complaint._id,
    actionBy: user._id,
    previousStatus: 'resolved',
    newStatus: 'closed',
    comment: `Student submitted feedback with satisfaction rating of ${rating}/5.`
  });

  return { complaint, log };
};

module.exports = {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateComplaintStatus,
  assignComplaint,
  submitFeedback
};
