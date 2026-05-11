const Candidate = require('../models/candidate.model');
const Position = require('../models/position.model');
const { logAction } = require('../services/audit.service');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/apiError');

exports.getCandidates = catchAsync(async (req, res) => {
  const { search, position, page = 1, limit = 20 } = req.query;
  const filter = { active: true };
  if (position) filter.position = position;
  if (search) {
    filter.$or = [
      { name: new RegExp(search, 'i') },
      { party: new RegExp(search, 'i') },
    ];
  }

  const total = await Candidate.countDocuments(filter);
  const candidates = await Candidate.find(filter)
    .populate('position')
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .sort({ votes: -1, name: 1 });
  res.status(200).json({ status: 'success', meta: { total, page: Number(page), limit: Number(limit) }, data: candidates });
});

exports.createCandidate = catchAsync(async (req, res) => {
  const { name, party, position, bio, manifesto } = req.body;
  const positionExists = await Position.exists({ _id: position });
  if (!positionExists) {
    throw new ApiError(400, 'The provided position is invalid.');
  }
  const candidate = await Candidate.create({ name, party, position, bio, manifesto });
  await logAction({ actor: req.user._id, actorType: 'Admin', action: 'create_candidate', category: 'candidate', metadata: { candidateId: candidate._id }, req });
  res.status(201).json({ status: 'success', data: candidate });
});

exports.updateCandidate = catchAsync(async (req, res) => {
  const candidate = await Candidate.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!candidate) {
    throw new ApiError(404, 'Candidate not found.');
  }
  await logAction({ actor: req.user._id, actorType: 'Admin', action: 'update_candidate', category: 'candidate', metadata: { candidateId: candidate._id, updates: req.body }, req });
  res.status(200).json({ status: 'success', data: candidate });
});

exports.deleteCandidate = catchAsync(async (req, res) => {
  const candidate = await Candidate.findByIdAndDelete(req.params.id);
  if (!candidate) {
    throw new ApiError(404, 'Candidate not found.');
  }
  await logAction({ actor: req.user._id, actorType: 'Admin', action: 'delete_candidate', category: 'candidate', metadata: { candidateId: candidate._id }, req });
  res.status(204).send();
});
