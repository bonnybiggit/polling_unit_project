const { verifyFaceMatch } = require('../services/face.service');
const { loadVoterProfile, verifyVoterCard } = require('../services/voter.service');
const { logAction } = require('../services/audit.service');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/apiError');

exports.verifyFace = catchAsync(async (req, res) => {
  const { cardNumber, imageData } = req.body;
  if (!cardNumber || !imageData) {
    throw new ApiError(400, 'Card number and image data are required.');
  }

  const voter = await verifyVoterCard(cardNumber);
  if (!voter.faceDescriptor?.length) {
    throw new ApiError(422, 'Face template not available for this voter.');
  }

  const base64 = imageData.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');
  const buffer = Buffer.from(base64, 'base64');
  const { matched, confidence, message } = await verifyFaceMatch(buffer, voter.faceDescriptor);

  await logAction({ actor: voter._id, actorType: 'Voter', action: 'face_verification_attempt', category: 'verification', metadata: { matched, confidence }, req });

  if (!matched) {
    throw new ApiError(403, message || 'Face verification failed.');
  }

  res.status(200).json({ status: 'success', authorized: true, confidence, voter: { id: voter._id, cardNumber: voter.cardNumber } });
});
