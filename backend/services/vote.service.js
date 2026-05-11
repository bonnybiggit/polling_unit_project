const Vote = require('../models/vote.model');
const Candidate = require('../models/candidate.model');
const Position = require('../models/position.model');
const ApiError = require('../utils/apiError');

const requiredPositions = ['President', 'Governor', 'Senator', 'House of Representatives', 'Chairman', 'Councillor'];

async function submitBallot({ electionId, voter, selections, pollingUnit, metadata = {} }) {
  const selectedPositionIds = selections.map((choice) => choice.position.toString());
  const uniqueSelections = new Set(selectedPositionIds);
  if (selectedPositionIds.length !== uniqueSelections.size) {
    throw new ApiError(400, 'Duplicate position selection is not permitted.');
  }

  const positions = await Position.find({ _id: { $in: selectedPositionIds } });
  if (positions.length !== requiredPositions.length) {
    throw new ApiError(400, 'Ballot selections must include all official positions.');
  }

  const existingVote = await Vote.findOne({ voter: voter._id, election: electionId });
  if (existingVote) {
    throw new ApiError(409, 'Voter has already cast a ballot in this election.');
  }

  const candidateIds = selections.map((choice) => choice.candidate);
  const candidates = await Candidate.find({ _id: { $in: candidateIds }, active: true }).populate('position');
  if (candidates.length !== candidateIds.length) {
    throw new ApiError(400, 'Some selected candidates are no longer valid.');
  }

  const mismatches = selections.filter((choice) => {
    const candidate = candidates.find((item) => item._id.toString() === choice.candidate.toString());
    return !candidate || candidate.position.toString() !== choice.position.toString();
  });
  if (mismatches.length > 0) {
    throw new ApiError(400, 'One or more candidates do not match the selected positions.');
  }

  const uniqueCandidateIds = new Set(candidateIds.map(String));
  if (uniqueCandidateIds.size !== candidateIds.length) {
    throw new ApiError(400, 'Duplicate candidate selection is not permitted.');
  }

  const vote = await Vote.create({
    election: electionId,
    voter: voter._id,
    pollingUnit,
    selections,
    audit: metadata,
  });

  await Promise.all(selections.map((choice) =>
    Candidate.findByIdAndUpdate(choice.candidate, { $inc: { votes: 1 } })
  ));

  return vote;
}

async function getVoteCountByPosition(electionId) {
  return Vote.aggregate([
    { $match: { election: electionId } },
    { $unwind: '$selections' },
    {
      $group: {
        _id: '$selections.position',
        count: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: 'positions',
        localField: '_id',
        foreignField: '_id',
        as: 'position',
      },
    },
    { $unwind: '$position' },
    {
      $project: {
        position: '$position.title',
        count: 1,
      },
    },
  ]);
}

module.exports = { submitBallot, getVoteCountByPosition, requiredPositions };
