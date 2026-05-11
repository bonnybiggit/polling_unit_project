const faceapi = require('@vladmandic/face-api');
const canvas = require('canvas');
const path = require('path');

const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

let modelsLoaded = false;

async function loadFaceModels() {
  if (modelsLoaded) return;
  const modelPath = path.resolve(__dirname, '..', 'uploads', 'face-models');
  await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelPath);
  await faceapi.nets.faceRecognitionNet.loadFromDisk(modelPath);
  await faceapi.nets.faceLandmark68Net.loadFromDisk(modelPath);
  modelsLoaded = true;
}

function deserializeDescriptor(descriptor) {
  if (!Array.isArray(descriptor)) return null;
  return new Float32Array(descriptor);
}

async function verifyFaceMatch(liveImageBuffer, storedDescriptor, minConfidence = 0.55) {
  await loadFaceModels();

  const img = await canvas.loadImage(liveImageBuffer);
  const detection = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
  if (!detection) {
    return { matched: false, confidence: 0, message: 'No face detected in the submitted image.' };
  }

  const liveDescriptor = detection.descriptor;
  const referenceDescriptor = deserializeDescriptor(storedDescriptor);
  if (!referenceDescriptor) {
    return { matched: false, confidence: 0, message: 'Stored face descriptor is not available.' };
  }

  const distance = faceapi.euclideanDistance(liveDescriptor, referenceDescriptor);
  const confidence = Math.max(0, 1 - distance);
  const matched = confidence >= minConfidence;
  return { matched, confidence, distance };
}

module.exports = { verifyFaceMatch, loadFaceModels };
