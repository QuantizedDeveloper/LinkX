import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiImage } from "react-icons/fi";

export default function Upload() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [delivery, setDelivery] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState([]);
  const [images, setImages] = useState([]);

  /* ---------- TAG LOGIC (UNCHANGED) ---------- */

  const tryAddTag = (value) => {
    const tag = value.trim().toLowerCase();
    if (!tag || tags.includes(tag) || tags.length >= 10) return;
    setTags((prev) => [...prev, tag]);
  };

  const handleTagKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      tryAddTag(tagInput);
      setTagInput("");
    }
  };

  const handleTagBlur = () => {
    tryAddTag(tagInput);
    setTagInput("");
  };

  const removeTag = (index) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  /* ---------- IMAGE LOGIC (UNCHANGED) ---------- */

  const handleImage = (file) => {
    if (!file || images.length >= 2) return;

    setImages((prev) => [
      ...prev,
      { file, preview: URL.createObjectURL(file) },
    ]);
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  /* ---------- VALIDATION (UNCHANGED MEANING) ---------- */

  const canPublish =
    title.trim() &&
    price.trim() &&
    delivery.trim() &&
    tags.length >= 2;

  /* ---------- UI ---------- */

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button style={styles.close} onClick={() => navigate(-1)}>
          ✕
        </button>

        <h3 style={styles.headerTitle}>New gig</h3>

        <button
          disabled={!canPublish}
          style={{
            ...styles.publish,
            background: canPublish ? "#000" : "#bdbdbd",
            cursor: canPublish ? "pointer" : "not-allowed",
          }}
        >
          Publish
        </button>
      </div>

      {/* Title */}
      <textarea
        placeholder="What's new gig"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={styles.textarea}
      />

      {/* Images */}
      <div style={styles.imageRow}>
        {images.map((img, index) => (
          <div key={index} style={styles.imagePreview}>
            <img src={img.preview} alt="preview" style={styles.previewImg} />
            <span
              style={styles.removeImg}
              onClick={() => removeImage(index)}
            >
              ×
            </span>
          </div>
        ))}

        {images.length < 2 && (
          <label style={styles.imageAdd}>
            <FiImage size={24} color="#666" />
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => handleImage(e.target.files[0])}
            />
          </label>
        )}
      </div>

      {/* Inputs (SHORT PILLS) */}
      <div style={styles.row}>
        <input
          placeholder="Price (₹, $, €)"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          style={styles.input}
        />

        <input
          placeholder="delivery time"
          value={delivery}
          onChange={(e) => setDelivery(e.target.value)}
          style={styles.input}
        />

        <input
          placeholder="add tags"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleTagKeyDown}
          onBlur={handleTagBlur}
          style={styles.input}
        />
      </div>

      {/* Tags */}
      <div style={styles.tagsContainer}>
        {tags.map((tag, index) => (
          <div key={index} style={styles.tag}>
            {tag}
            <span style={styles.remove} onClick={() => removeTag(index)}>
              ×
            </span>
          </div>
        ))}
      </div>

      {/* Errors */}
      {tags.length > 0 && tags.length < 2 && (
        <p style={styles.error}>Minimum 2 tags required</p>
      )}
      {tags.length === 10 && (
        <p style={styles.error}>Maximum 10 tags allowed</p>
      )}
    </div>
  );
}

/* ---------------- STYLES ---------------- */

const styles = {
  container: {
    padding: 16,
    maxWidth: 360,
    margin: "0 auto",
    fontFamily: "sans-serif",
  },

  header: {
    height: 48,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    position: "relative",
    marginBottom: 12,
  },

  headerTitle: {
    position: "absolute",
    left: "50%",
    transform: "translateX(-50%)",
    margin: 0,
    fontSize: 16,
    fontWeight: 600,
  },

  close: {
    background: "none",
    border: "none",
    fontSize: 22,
    padding: 4,
  },

  publish: {
    color: "white",
    border: "none",
    padding: "6px 16px",
    borderRadius: 20,
    fontSize: 14,
  },

  textarea: {
    width: "100%",
    minHeight: 60,
    border: "none",
    outline: "none",
    fontSize: 16,
    marginBottom: 14,
  },

  imageRow: {
    display: "flex",
    gap: 12,
    marginBottom: 18,
  },

  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 18,
    background: "#f5f5f5",
    position: "relative",
    overflow: "hidden",
  },

  previewImg: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
  },

  removeImg: {
    position: "absolute",
    top: 4,
    right: 6,
    background: "rgba(0,0,0,0.6)",
    color: "white",
    borderRadius: "50%",
    padding: "2px 6px",
    cursor: "pointer",
    fontSize: 13,
  },

  imageAdd: {
    width: 100,
    height: 100,
    borderRadius: 18,
    border: "1px dashed #ccc",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },

  row: {
    display: "flex",
    gap: 8,
    justifyContent: "center",
    marginBottom: 14,
    
  },

  input: {
    width: 88,                 // 👈 real small
    height: 32,
    padding: "0 6px",          // 👈 less padding
    borderRadius: 999,
    border: "1px solid #9e9e9e",
    outline: "none",
    fontSize: 12,              // 👈 smaller text
    textAlign: "center",
    background: "white",
    boxSizing: "border-box",   // 👈 VERY IMPORTANT
  },


  tagsContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },

  tag: {
    background: "#f1f1f1",
    padding: "6px 12px",
    borderRadius: 20,
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 13,
  },

  remove: {
    cursor: "pointer",
    fontWeight: "bold",
  },

  error: {
    color: "red",
    fontSize: 12,
    marginTop: 6,
  },
};
