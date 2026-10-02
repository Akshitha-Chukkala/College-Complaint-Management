const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a complaint title'],
      trim: true,
      maxlength: 150
    },
    description: {
      type: String,
      required: [true, 'Please provide a detailed description'],
      trim: true
    },
    category: {
      type: String,
      enum: ['hostel', 'wifi', 'infrastructure', 'academics', 'cleanliness', 'other'],
      default: 'other'
    },
    location: {
      type: String,
      required: [true, 'Please provide a campus location'],
      trim: true
    },
    attachments: [
      {
        type: String,
        default: []
      }
    ],
    status: {
      type: String,
      enum: ['submitted', 'under_review', 'assigned', 'in_progress', 'resolved', 'closed'],
      default: 'submitted'
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    aiSummary: {
      type: String,
      default: ''
    },
    resolutionNotes: {
      type: String,
      default: ''
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null
    },
    feedback: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Complaint', complaintSchema);
