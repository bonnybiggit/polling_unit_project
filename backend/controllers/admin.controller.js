const Admin = require('../models/admin.model');
const Vote = require('../models/vote.model');
const Voter = require('../models/voter.model');
const Candidate = require('../models/candidate.model');
const AuditLog = require('../models/auditLog.model');
const catchAsync = require('../utils/catchAsync');

exports.getDashboard = catchAsync(async (req, res) => {
  const [totalVoters, totalVotes, topCandidates, auditCount] = await Promise.all([
    Voter.countDocuments(),
    Vote.countDocuments(),
    Candidate.find().sort({ votes: -1 }).limit(6).select('name party votes position'),
    AuditLog.countDocuments(),
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      totalVoters,
      totalVotes,
      auditCount,
      topCandidates,
    },
  });
});

exports.getAuditLogs = catchAsync(async (req, res) => {
  const { page = 1, limit = 30 } = req.query;
  const logs = await AuditLog.find()
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));
  const total = await AuditLog.countDocuments();
  res.status(200).json({ status: 'success', meta: { total, page: Number(page), limit: Number(limit) }, data: logs });
});

exports.getAdmins = catchAsync(async (req, res) => {
  const admins = await Admin.find().select('-password');
  res.status(200).json({ status: 'success', data: admins });
});
