const { submitBallot } = require('../services/vote.service');
const { markVoterHasVoted } = require('../services/voter.service');
const { logAction } = require('../services/audit.service');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/apiError');

exports.castVote = catchAsync(async (req, res) => {
  const { electionId, voterId, pollingUnitId, selections } = req.body;
  if (!electionId || !voterId || !pollingUnitId || !Array.isArray(selections)) {
    throw new ApiError(400, 'Election, voter, polling unit, and selections are required.');
  }

  const vote = await submitBallot({ electionId, voter: { _id: voterId }, selections, pollingUnit: pollingUnitId, metadata: { ipAddress: req.ip } });
  await markVoterHasVoted(voterId);
  await logAction({ actor: voterId, actorType: 'Voter', action: 'submit_vote', category: 'voting', metadata: { voteId: vote._id }, req });
  res.status(201).json({ status: 'success', data: vote });
});
