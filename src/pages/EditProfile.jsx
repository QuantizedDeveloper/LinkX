import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SiRazorpay } from "react-icons/si";
import { MdQrCode, MdPayment, MdLink } from "react-icons/md";

export default function EditProfile() {
  const navigate = useNavigate();

  /* ---------- KEYWORDS ---------- */
  const [keywords, setKeywords] = useState(["example keyword"]);
  const [keywordInput, setKeywordInput] = useState("");

  /* ---------- PAYMENTS ---------- */
  const [payments, setPayments] = useState({
    razorpay: "",
    instamojo: "",
    upi: "",
    custom: ""
  });

  const [qrImage, setQrImage] = useState(null);
  const [showPayment, setShowPayment] = useState(false);

  /* ---------- IMAGES (UI ONLY) ---------- */
  const [banner, setBanner] = useState(null);
  const [avatar, setAvatar] = useState(null);

  const handleSave = () => {
    console.log({ keywords, payments, qrImage, banner, avatar });
    alert("Saved (UI only)");
  };

  return (
    <div style={styles.page}>
      {/* HEADER */}
      <div style={styles.header}>
        <span style={styles.back} onClick={() => navigate(-1)}>‹</span>
        <h3>Edit Profile</h3>
        <button style={styles.save} onClick={handleSave}>Save</button>
      </div>

      {/* BANNER */}
      <label style={styles.cover}>
        <input
          type="file"
          hidden
          accept="image/*"
          onChange={(e) => {
            const f = e.target.files[0];
            if (f) setBanner(URL.createObjectURL(f));
          }}
        />

        {banner ? (
          <img src={banner} alt="banner" style={styles.bannerImg} />
        ) : (
          <div style={styles.bannerPlaceholder} />
        )}

        <span style={styles.bannerEdit}>✏️</span>
      </label>

      {/* AVATAR */}
      <div style={styles.avatarWrap}>
        <label style={styles.avatar}>
          <input
            type="file"
            hidden
            accept="image/*"
            onChange={(e) => {
              const f = e.target.files[0];
              if (f) setAvatar(URL.createObjectURL(f));
            }}
          />

          {avatar ? (
            <img src={avatar} alt="avatar" style={styles.avatarImg} />
          ) : (
            <div style={styles.avatarPlaceholder} />
          )}

          <span style={styles.avatarEdit}>✏️</span>
        </label>
      </div>

      {/* NAME */}
      <input style={styles.input} placeholder="name - optional" />

      {/* KEYWORDS */}
      <div style={styles.keywordBox}>
        {keywords.map((k, i) => (
          <span key={i} style={styles.tag}>
            {k}
            <span
              style={styles.remove}
              onClick={() =>
                setKeywords(keywords.filter((_, idx) => idx !== i))
              }
            >
              ×
            </span>
          </span>
        ))}

        <input
          value={keywordInput}
          onChange={(e) => setKeywordInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && keywordInput.trim()) {
              setKeywords([...keywords, keywordInput.trim()]);
              setKeywordInput("");
              e.preventDefault();
            }
          }}
          placeholder="Add tags"
          style={styles.keywordInput}
        />
      </div>

      {/* PAYMENTS */}
      <div style={styles.section}>
        <strong>Payment methods</strong>
        <p style={styles.muted}>clients can pay using these</p>

        <div style={styles.paymentIcons}>
          {payments.razorpay && (
            <IconBubble><SiRazorpay size={20} /></IconBubble>
          )}

          {payments.instamojo && (
            <IconBubble>
              <img src="/icons/instamojo.svg" alt="Instamojo" style={styles.svgIcon} />
            </IconBubble>
          )}

          {payments.upi && (
            <IconBubble><MdPayment size={20} /></IconBubble>
          )}

          {qrImage && (
            <IconBubble><MdQrCode size={20} /></IconBubble>
          )}

          {payments.custom && (
            <IconBubble><MdLink size={20} /></IconBubble>
          )}
        </div>

        <button style={styles.addPayment} onClick={() => setShowPayment(true)}>
          + add payment
        </button>
      </div>

      {/* DESCRIPTION */}
      <textarea style={styles.textarea} placeholder="description - optional" />

      {/* PAYMENT SHEET */}
      {showPayment && (
        <>
          <div style={styles.overlay} onClick={() => setShowPayment(false)} />
          <PaymentSheet
            payments={payments}
            setPayments={setPayments}
            qrImage={qrImage}
            setQrImage={setQrImage}
          />
        </>
      )}
    </div>
  );
}

/* ---------- PAYMENT SHEET ---------- */

function PaymentSheet({ payments, setPayments, qrImage, setQrImage }) {
  return (
    <div style={styles.sheet}>
      <div style={styles.handle} />
      <h4>Add payment methods</h4>

      <InputRow
        label="Razorpay"
        placeholder="https://rzp.io/..."
        value={payments.razorpay}
        onChange={(v) => setPayments({ ...payments, razorpay: v })}
      />

      <InputRow
        label="Instamojo"
        placeholder="https://imjo.in/..."
        value={payments.instamojo}
        onChange={(v) => setPayments({ ...payments, instamojo: v })}
      />

      <InputRow
        label="UPI ID"
        placeholder="yourid@upi"
        value={payments.upi}
        onChange={(v) => setPayments({ ...payments, upi: v })}
      />

      <InputRow
        label="Custom payment link"
        placeholder="https://your-payment-link.com"
        value={payments.custom}
        onChange={(v) => setPayments({ ...payments, custom: v })}
      />

      <label style={styles.qrBox}>
        <input
          type="file"
          hidden
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files[0];
            if (file) setQrImage(URL.createObjectURL(file));
          }}
        />
        {qrImage ? (
          <img src={qrImage} alt="QR" style={styles.qrPreview} />
        ) : (
          <>
            <div style={styles.plus}>＋</div>
            <div>Upload QR code</div>
          </>
        )}
      </label>
    </div>
  );
}

function InputRow({ label, value, onChange, placeholder }) {
  return (
    <div style={styles.payRow}>
      <strong>{label}</strong>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={styles.payInput}
      />
    </div>
  );
}

function IconBubble({ children }) {
  return <div style={styles.iconBubble}>{children}</div>;
}

/* ---------- STYLES ---------- */

const styles = {
  page: { padding: 16, paddingBottom: 120 },

  header: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  back: { fontSize: 22, cursor: "pointer" },
  save: { borderRadius: 20, padding: "6px 16px", border: "none" },

  cover: {
    height: 180,
    background: "#eaeaea",
    borderRadius: 20,
    marginTop: 10,
    position: "relative",
    overflow: "hidden",
    cursor: "pointer"
  },

  bannerImg: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover"
  },

  bannerPlaceholder: {
    position: "absolute",
    inset: 0,
    background: "#ddd"
  },

  bannerEdit: {
    position: "absolute",
    right: 16,
    top: "50%",
    transform: "translateY(-50%)",
    width: 38,
    height: 38,
    borderRadius: "50%",
    background: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 6px 16px rgba(0,0,0,0.18)",
    zIndex: 2
  },

  avatarWrap: { display: "flex", justifyContent: "center", marginTop: -45 },

  avatar: {
    width: 90,
    height: 90,
    borderRadius: "50%",
    background: "#fff",
    border: "2px solid #ddd",
    position: "relative",
    overflow: "hidden",
    cursor: "pointer"
  },

  avatarImg: { width: "100%", height: "100%", objectFit: "cover" },

  avatarPlaceholder: { width: "100%", height: "100%", background: "#eee" },

  avatarEdit: {
    position: "absolute",
    right: 6,
    bottom: 6,
    width: 28,
    height: 28,
    borderRadius: "50%",
    background: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 10px rgba(0,0,0,0.18)",
    fontSize: 14
  },

  input: {
    width: "100%",
    marginTop: 20,
    padding: 14,
    borderRadius: 22,
    border: "none",
    background: "#f2f2f2"
  },

  keywordBox: {
    background: "#f2f2f2",
    padding: 14,
    borderRadius: 22,
    marginTop: 16,
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
  },

  tag: { background: "#ddd", padding: "6px 12px", borderRadius: 18 },
  remove: { marginLeft: 6, cursor: "pointer" },
  keywordInput: { border: "none", outline: "none", background: "transparent", minWidth: 120 },

  section: { marginTop: 24 },
  muted: { fontSize: 12, color: "#777" },

  paymentIcons: { display: "flex", gap: 10, marginTop: 10 },

  iconBubble: {
    width: 34,
    height: 34,
    borderRadius: "50%",
    background: "#fff",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    
  },

  svgIcon: { width: 20, height: 20 },

  addPayment: {
    marginTop: 12,
    padding: 14,
    borderRadius: 22,
    border: "none",
    width: "100%"
  },

  textarea: {
    marginTop: 24,
    width: "100%",
    height: 110,
    borderRadius: 22,
    border: "none",
    padding: 14,
    background: "#f2f2f2"
  },

  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)" },

  sheet: {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    background: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 16
  },

  handle: {
    width: 40,
    height: 4,
    background: "#ddd",
    borderRadius: 10,
    margin: "0 auto 12px"
  },

  payRow: { marginBottom: 12 },

  payInput: {
    width: "100%",
    padding: 12,
    borderRadius: 20,
    border: "none",
    background: "#f2f2f2"
  },

  qrBox: {
    marginTop: 16,
    border: "2px dashed #ccc",
    borderRadius: 16,
    height: 160,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    cursor: "pointer"
  },

  plus: { fontSize: 32 },

  qrPreview: { width: "100%", height: "100%", objectFit: "contain" }
};