import * as faceapi from 'face-api.js';

const getLabeledFaceDescriptors = async () => {
  try {
    const response = await fetch('/src/faces/faces.json');
    const faces = await response.json();
    return Promise.all(
      faces.map(async (face) => {
        const imageUrl = `/src/faces/${face.image}`;
        const image = await faceapi.fetchImage(imageUrl);

        const faceDescription = await faceapi
          .detectSingleFace(image)
          .withFaceLandmarks()
          .withFaceDescriptor();

        if (!faceDescription) {
          throw new Error(`no faces detected for ${face.name}`);
        }

        const faceDescriptors = [faceDescription.descriptor];
        return new faceapi.LabeledFaceDescriptors(face.name, faceDescriptors);
      })
    );
  } catch (error) {
    console.error('DEBUG getLabeledFaceDescriptors ', error);
  }
};

const loadThenStartFaceDetection = async (video) => {
  const canvas = faceapi.createCanvasFromMedia(video);
  document.body.append(canvas);
  const displaySize = { width: video.width, height: video.height };
  faceapi.matchDimensions(canvas, displaySize);

  const labeledFaceDescriptors = await getLabeledFaceDescriptors();
  startFaceDetection(canvas, displaySize, labeledFaceDescriptors, video);
};

const startFaceDetection = async (
  canvas,
  displaySize,
  labeledFaceDescriptors,
  video
) => {
  // detect face in camera
  const detection = await faceapi
    .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks()
    .withFaceDescriptor();
  if (detection) {
    // face is detected, do checking if face is in faces folder

    const faceDescription = faceapi.resizeResults(detection, displaySize); // get face description

    // draw box border in canvas
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    faceapi.draw.drawDetections(canvas, faceDescription);

    // find best match in camera
    const threshold = 0.6;
    const faceMatcher = new faceapi.FaceMatcher(
      labeledFaceDescriptors,
      threshold
    );
    const bestMatch = faceMatcher.findBestMatch(faceDescription.descriptor);
    if (bestMatch.distance >= 0.2) {
      const box = faceDescription.detection.box;
      const text = bestMatch.toString(false);
      const drawBox = new faceapi.draw.DrawBox(box, {
        label: text,
        boxColor: 'green',
      });
      drawBox.draw(canvas);
    }
  }

  // if no face detected, keep detecting...
  setTimeout(
    () =>
      startFaceDetection(canvas, displaySize, labeledFaceDescriptors, video),
    100
  );
};

const startVideo = (video) => {
  navigator.getUserMedia(
    { video: {} },
    (stream) => (video.srcObject = stream),
    (err) => console.error('DEBUG: startVideo', err)
  );
};

const loadModelsThenStartVideo = async (video) => {
  try {
    await Promise.all([
      faceapi.nets.ssdMobilenetv1.loadFromUri('/src/models'),
      faceapi.nets.tinyFaceDetector.loadFromUri('/src/models'),
      faceapi.nets.faceLandmark68Net.loadFromUri('/src/models'),
      faceapi.nets.faceRecognitionNet.loadFromUri('/src/models'),
      faceapi.nets.faceExpressionNet.loadFromUri('/src/models'),
    ]);
    startVideo(video);
  } catch (error) {
    console.error('DEBUG: [ERR] loadModelsThenStartVideo', error);
  }
};

const video = document.getElementById('video'); // the <video> html element
loadModelsThenStartVideo(video);
video.addEventListener('play', () => loadThenStartFaceDetection(video));
