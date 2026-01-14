import React, { useEffect, useRef, useState } from "react";

export default function FaceVerification() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [step, setStep] = useState(0);
  const [frames, setFrames] = useState([]);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Define the 5 steps
  const STEPS = [
    { text: "Smile", key: "smile" },
    { text: "Turn slightly left", key: "left" },
    { text: "Turn slightly right", key: "right" },
    { text: "Close your eyes", key: "close_eyes" },
    { text: "Look straight at the camera", key: "front" },
  ];

  const MIN_BRIGHTNESS = 40;
  const MAX_BRIGHTNESS = 220;

  // Start video on mount
  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
        });
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      } catch (err) {
        setMessage("Cannot access camera: " + err.message);
      }
    }
    startCamera();
  }, []);

  // Capture a frame from video and perform brightness check
  const captureFrame = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const base64 = canvas.toDataURL("image/jpeg");

    // Lightweight brightness check
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let sum = 0;
    for (let i = 0; i < imageData.data.length; i += 4) {
      sum += (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;
    }
    const avgBrightness = sum / (imageData.data.length / 4);
    if (avgBrightness < MIN_BRIGHTNESS) {
      setMessage("Too dark! Please increase lighting.");
      return null;
    }
    if (avgBrightness > MAX_BRIGHTNESS) {
      setMessage("Too bright! Reduce light or move away from strong light.");
      return null;
    }

    setMessage(""); // Clear previous message
    return base64;
  };

  // Handle capture button
  const handleCapture = () => {
    const frame = captureFrame();
    if (!frame) return; // failed brightness check

    const newFrames = [...frames, { step: STEPS[step].key, base64: frame }];
    setFrames(newFrames);

    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      submitFrames(newFrames);
    }
  };

  // Submit all frames to backend
  const submitFrames = async (framesToSend) => {
    setSubmitting(true);
    try {
      // Get email/username/password from session storage
      const email = sessionStorage.getItem("email");
      const username = sessionStorage.getItem("username");
      const password = sessionStorage.getItem("password");

      if (!email || !username || !password) {
        setMessage("Session expired. Please login again.");
        setSubmitting(false);
        return;
      }

      const payload = {
        email,
        username,
        password,
        frames: framesToSend.map((f) => f.base64),
      };

      const res = await fetch("/api/complete_signup/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("Face verification successful! Logging in...");
        sessionStorage.setItem("access", data.access);
        sessionStorage.setItem("username", data.username);
        // Redirect or update UI as needed
      } else {
        setMessage(data.error || "Verification failed. Please try again.");
        // Keep frames cached for retry
      }
    } catch (err) {
      setMessage("Network or server error: " + err.message);
    }
    setSubmitting(false);
  };

  // Retry button clears frames and resets steps
  const handleRetry = () => {
    setStep(0);
    setFrames([]);
    setMessage("");
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h2>Face Verification</h2>
      <p>{STEPS[step].text}</p>
      <video
        ref={videoRef}
        style={{ width: "300px", borderRadius: "10px", border: "1px solid #ccc" }}
      ></video>
      <canvas ref={canvasRef} style={{ display: "none" }}></canvas>

      <div style={{ marginTop: "20px" }}>
        <button onClick={handleCapture} disabled={submitting}>
          Capture Step {step + 1}
        </button>
        <button onClick={handleRetry} style={{ marginLeft: "10px" }} disabled={submitting}>
          Retry
        </button>
      </div>

      <div style={{ marginTop: "20px", color: "red" }}>{message}</div>
      <div style={{ marginTop: "20px" }}>
        <p>Frames captured: {frames.length} / {STEPS.length}</p>
      </div>
    </div>
  );
}
