const Voter = require('../models/voter.model');
const PollingUnit = require('../models/pollingUnit.model');
const ApiError = require('../utils/apiError');

async function verifyVoterCard(cardNumber) {
  const voter = await Voter.findOne({ cardNumber }).populate('pollingUnit');
  if (!voter) {
    throw new ApiError(404, 'Voter card not found.');
  }
  if (voter.status !== 'active') {
    throw new ApiError(403, 'Voter is not active.');
  }
  if (voter.hasVoted) {
    throw new ApiError(409, 'This voter has already voted.');
  }
  return voter;
}

async function loadVoterProfile(cardNumber) {
  return Voter.findOne({ cardNumber }).populate('pollingUnit');
}

async function markVoterHasVoted(voterId) {
  return Voter.findByIdAndUpdate(voterId, { hasVoted: true }, { new: true });
}

async function findVoterById(id) {
  return Voter.findById(id).populate('pollingUnit');
}

module.exports = { verifyVoterCard, loadVoterProfile, markVoterHasVoted, findVoterById };
