const Voter = require('../models/voter.model');
const { verifyVoterCard, loadVoterProfile, markVoterHasVoted } = require('../services/voter.service');
const { logAction } = require('../services/audit.service');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/apiError');

exports.verifyCard = catchAsync(async (req, res) => {
  const { cardNumber } = req.body;
  if (!cardNumber) {
    throw new ApiError(400, 'Card number is required.');
  }
  const voter = await verifyVoterCard(cardNumber);
  await logAction({ actor: voter._id, actorType: 'Voter', action: 'voter_card_verified', category: 'verification', req });
  res.status(200).json({ status: 'success', verified: true, data: { voter: { id: voter._id, cardNumber: voter.cardNumber, status: voter.status } } });
});

exports.getVoters = catchAsync(async (req, res) => {
  const { search, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (search) {
    filter.$or = [
      { firstName: new RegExp(search, 'i') },
      { lastName: new RegExp(search, 'i') },
      { cardNumber: new RegExp(search, 'i') },
    ];
  }
  const total = await Voter.countDocuments(filter);
  const voters = await Voter.find(filter)
    .populate('pollingUnit')
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .sort({ createdAt: -1 });
  res.status(200).json({ status: 'success', meta: { total, page: Number(page), limit: Number(limit) }, data: voters });
});

exports.getVoterById = catchAsync(async (req, res) => {
  const voter = await loadVoterProfile(req.params.id);
  if (!voter) {
    throw new ApiError(404, 'Voter not found.');
  }
  res.status(200).json({ status: 'success', data: voter });
});

exports.updateVoterStatus = catchAsync(async (req, res) => {
  const updated = await Voter.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!updated) {
    throw new ApiError(404, 'Voter not found.');
  }
  await logAction({ actor: req.user._id, actorType: 'Admin', action: 'update_voter_status', category: 'voter', metadata: { voterId: updated._id, updates: req.body }, req });
  res.status(200).json({ status: 'success', data: updated });
});
