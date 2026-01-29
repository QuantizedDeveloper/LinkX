import { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import axios from "axios";
import { useNavigate } from "react-router-dom";

axios.defaults.baseURL = "https://linkx-backend-api.onrender.com/";
axios.defaults.withCredentials = true;



const STEPS = [
  { key: "front", text: "Look straight 😐" },
  { key: "smile", text: "Smile 🙂" },
  { key: "left", text: "Turn LEFT 👈" },
  { key: "right", text: "Turn RIGHT 👉" }
];

export default function FaceVerification() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [step, setStep] = useState(0);
  const [captures, setCaptures] = useState([]);
  const [ready, setReady] = useState(false);

  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("Initializing…");

  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        const MODEL_URL = process.env.PUBLIC_URL + "/models";

        // 1️⃣ Load face detector
        setStatus("Loading face detector…");
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        setProgress(30);

        // 2️⃣ Load landmarks
        setStatus("Loading landmarks…");
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        setProgress(60);

        // 3️⃣ Load recognition model
        setStatus("Loading recognition model…");
        await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
        setProgress(90);

        // 4️⃣ Start camera (ANDROID SAFE)
        setStatus("Starting camera…");

        let stream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: true, // DO NOT force facingMode (Android bug)
            audio: false
          });
        } catch (e) {
          alert("Camera error: " + e.name);
          throw e;
        }

        if (!mounted) return;

        streamRef.current = stream;
        videoRef.current.srcObject = stream;

        setProgress(100);
        setLoading(false);
      } catch (err) {
        console.error("INIT FAILED:", err);
        alert("Failed to initialize face verification");
      }
    }

    init();

    return () => {
      mounted = false;
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  const capture = async () => {
    setReady(false);

    const detection = await faceapi
      .detectSingleFace(
        videoRef.current,
        new faceapi.TinyFaceDetectorOptions({
          inputSize: 160,
          scoreThreshold: 0.5
        })
      )
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) {
      alert("No face detected");
      setReady(true);
      return;
    }

    if (!poseValid(detection, STEPS[step].key, videoRef.current)) {
      alert("Please follow the instruction");
      setReady(true);
      return;
    }

    const updated = [
      ...captures,
      {
        pose: STEPS[step].key,
        embedding: Array.from(detection.descriptor)
      }
    ];

    setCaptures(updated);

    if (step < STEPS.length - 1) {
      setStep(step + 1);
      setReady(true);
    } else {
      submit(updated);
    }
  };

  const submit = async (captures) => {
    try {
      const embeddings = captures.map(c => c.embedding);
      await axios.post("/api/accounts/complete-signup/", { embeddings });
      navigate("/");
    } catch (err) {
      alert("Face verification failed");
    }
  };

  return (
    <div style={{ padding: 16 }}>
      {loading ? (
        <>
          <h3>{status}</h3>

          <div
            style={{
              width: "100%",
              height: 8,
              background: "#ddd",
              borderRadius: 4
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: "100%",
                background: "#4caf50",
                borderRadius: 4,
                transition: "width 0.4s"
              }}
            />
          </div>

          <p>{progress}%</p>
        </>
      ) : (
        <>
          <h3>{STEPS[step].text}</h3>

          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            onLoadedData={() => setReady(true)}
            style={{ width: 320, borderRadius: 8 }}
          />

          <br />

          <button onClick={capture} disabled={!ready}>
            Capture
          </button>
        </>
      )}
    </div>
  );
}

function poseValid(result, pose, video) {
  const nose = result.landmarks.getNose()[3].x;
  const jaw = result.landmarks.getJawOutline();
  const center = (jaw[0].x + jaw[16].x) / 2;
  const ratio = (nose - center) / video.videoWidth;

  if (pose === "front") return Math.abs(ratio) < 0.03;
  if (pose === "left") return ratio < -0.05;
  if (pose === "right") return ratio > 0.05;
  return true;
}
