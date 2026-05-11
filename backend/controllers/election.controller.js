const Election = require('../models/election.model');
const Position = require('../models/position.model');
const { logAction } = require('../services/audit.service');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/apiError');

exports.getElections = catchAsync(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.status = status;
  const total = await Election.countDocuments(filter);
  const elections = await Election.find(filter)
    .populate('positions')
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .sort({ createdAt: -1 });
  res.status(200).json({ status: 'success', meta: { total, page: Number(page), limit: Number(limit) }, data: elections });
});

exports.createElection = catchAsync(async (req, res) => {
  const election = await Election.create(req.body);
  await logAction({ actor: req.user._id, actorType: 'Admin', action: 'create_election', category: 'election', metadata: { electionId: election._id }, req });
  res.status(201).json({ status: 'success', data: election });
});

exports.updateElection = catchAsync(async (req, res) => {
  const election = await Election.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!election) {
    throw new ApiError(404, 'Election not found.');
  }
  await logAction({ actor: req.user._id, actorType: 'Admin', action: 'update_election', category: 'election', metadata: { electionId: election._id }, req });
  res.status(200).json({ status: 'success', data: election });
});

exports.getPositions = catchAsync(async (req, res) => {
  const positions = await Position.find({ active: true }).sort({ title: 1 });
  res.status(200).json({ status: 'success', data: positions });
});
