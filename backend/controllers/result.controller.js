const Vote = require('../models/vote.model');
const Candidate = require('../models/candidate.model');
const Election = require('../models/election.model');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/apiError');

exports.getAggregateResults = catchAsync(async (req, res) => {
  const { electionId } = req.query;
  if (!electionId) {
    throw new ApiError(400, 'Election ID is required.');
  }

  const election = await Election.findById(electionId).populate('positions');
  if (!election) {
    throw new ApiError(404, 'Election not found.');
  }

  const results = await Vote.aggregate([
    { $match: { election: election._id } },
    { $unwind: '$selections' },
    {
      $group: {
        _id: '$selections.candidate',
        votes: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: 'candidates',
        localField: '_id',
        foreignField: '_id',
        as: 'candidate',
      },
    },
    { $unwind: '$candidate' },
    {
      $project: {
        candidate: '$candidate.name',
        party: '$candidate.party',
        position: '$candidate.position',
        votes: 1,
      },
    },
  ]);

  const positions = await Candidate.populate(results, { path: 'position', select: 'title' });
  res.status(200).json({ status: 'success', data: positions });
});

exports.getLiveStatistics = catchAsync(async (req, res) => {
  const { electionId } = req.query;
  if (!electionId) {
    throw new ApiError(400, 'Election ID is required.');
  }
  const totalVotes = await Vote.countDocuments({ election: electionId });
  const candidateStats = await Candidate.find().sort({ votes: -1 }).limit(10).select('name party votes position');
  res.status(200).json({ status: 'success', data: { totalVotes, candidateStats } });
});
