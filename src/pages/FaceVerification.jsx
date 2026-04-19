import { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { showToast } from "../utils/toast";
//axios.defaults.baseURL = "https://Linkx1.pythonanywhere.com";
axios.defaults.baseURL = "https://linkx-backend-api-linkx-backend.hf.space";

axios.defaults.withCredentials = true;

const STEPS = [
  { key: "front", text: "Look straight 😐" },
  { key: "smile", text: "Smile 🙂" },
  { key: "left", text: "Turn RIGHT 👉" },
  { key: "right", text: "Turn LEFT 👈" },
];

export default function FaceVerification() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const mountedRef = useRef(true);

  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);

  const [step, setStep] = useState(0);
  const [captures, setCaptures] = useState([]);
  const [status, setStatus] = useState("Initializing...");
  const [submitting, setSubmitting] = useState(false);

  /* =============================
     1️⃣ LOAD MODELS
  ============================== */
  useEffect(() => {
    mountedRef.current = true;

    async function loadModels() {
      try {
        const MODEL_URL = process.env.PUBLIC_URL + "/models/";

        setStatus("Loading face detector...");
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);

        setStatus("Loading landmarks...");
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);

        setStatus("Loading recognition model...");
        await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);

        if (!mountedRef.current) return;

        setModelsLoaded(true);
      } catch (err) {
        console.error("MODEL LOAD ERROR:", err);
        showToast(err.message);
        //console.error("MODEL LOAD ERROR:", err);
        //alert("Failed to load face models");
      }
    }

    loadModels();

    return () => {
      mountedRef.current = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  /* =============================
     2️⃣ START CAMERA AFTER MODELS
  ============================== */
  useEffect(() => {
    if (!modelsLoaded) return;

    async function startCamera() {
      try {
        setStatus("Starting camera...");

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
          audio: false,
        });

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        setCameraReady(true);
        setStatus("Ready!");
      } catch (err) {
        console.error("CAMERA ERROR:", err);

        if (err.name === "NotAllowedError") {
          showToast("Camera permission denied");
        } else {
          showToast("Could not access camera");
        }
      }
    }

    startCamera();
  }, [modelsLoaded]);

  /* =============================
     3️⃣ CAPTURE FUNCTION
  ============================== */
  const capture = async () => {
    if (!cameraReady || submitting) return;

    try {
      setStatus("Detecting face...");

      const detection = await faceapi
        .detectSingleFace(
          videoRef.current,
          new faceapi.TinyFaceDetectorOptions({
            inputSize: 160,
            scoreThreshold: 0.5,
          })
        )
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        showToast("No face detected");
        setStatus("Ready!");
        return;
      }

      if (!poseValid(detection, STEPS[step].key, videoRef.current)) {
        showToast("Follow instruction properly");
        setStatus("Ready!");
        return;
      }

      const updated = [
        ...captures,
        {
          pose: STEPS[step].key,
          embedding: Array.from(detection.descriptor),
        },
      ];

      setCaptures(updated);

      if (step < STEPS.length - 1) {
        setStep(step + 1);
        setStatus("Ready!");
      } else {
        submit(updated);
      }
    } catch (err) {
      console.error("CAPTURE ERROR:", err);
      showToast("Capture failed");
      setStatus("Ready!");
    }
  };

  /* =============================
     4️⃣ SUBMIT TO BACKEND
  ============================== */
  const submit = async (capturesData) => {
    try {
      setSubmitting(true);
      setStatus("Submitting...");

      const embeddings = capturesData.map((c) => c.embedding);

      const res = await axios.post(
        "/api/accounts/complete-signup/",
        { embeddings }
      );

      const data = res.data;

      if (data.access) localStorage.setItem("accessToken", data.access);
      if (data.refresh) localStorage.setItem("refreshToken", data.refresh);
      if (data.username) localStorage.setItem("username", data.username);

      streamRef.current?.getTracks().forEach((t) => t.stop());

      navigate("/");
    } catch (err) {
      console.error("SUBMIT ERROR:", err);
      showToast(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Verification failed"
      );

      setSubmitting(false);
      setStatus("Ready!");
    }
  };

  /* =============================
     UI
  ============================== */
  return (
    <div style={{ padding: 20, textAlign: "center" }}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          width: 320,
          borderRadius: 12,
          marginBottom: 16,
        }}
      />

      <h3>{submitting ? "Submitting..." : STEPS[step]?.text}</h3>
      <p>{status}</p>

      <button
        onClick={capture}
        disabled={!cameraReady || submitting}
        style={{
          padding: "10px 20px",
          borderRadius: 8,
          cursor: "pointer",
        }}
      >
        {submitting ? "Please wait..." : "Capture"}
      </button>
    </div>
  );
}

/* =============================
   POSE VALIDATION
============================= */
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