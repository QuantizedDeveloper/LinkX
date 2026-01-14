import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiEdit2,
  FiArrowLeft,
} from "react-icons/fi";
import { FaQrcode, FaRupeeSign } from "react-icons/fa";
import { SiRazorpay } from "react-icons/si";
import { BsCreditCard } from "react-icons/bs";

export default function EditProfile() {
  const navigate = useNavigate();

  const bannerRef = useRef(null);
  const avatarRef = useRef(null);

  const [banner, setBanner] = useState(null);
  const [avatar, setAvatar] = useState(null);

  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");

  // ---------- KEYWORDS ----------
  const [keywordInput, setKeywordInput] = useState("");
  const [keywords, setKeywords] = useState([]);

  const addKeyword = (e) => {
    if (e.key === "Enter" && keywordInput.trim()) {
      e.preventDefault();
      if (!keywords.includes(keywordInput.trim())) {
        setKeywords([...keywords, keywordInput.trim()]);
      }
      setKeywordInput("");
    }
  };

  const removeKeyword = (k) =>
    setKeywords(keywords.filter((x) => x !== k));

  // ---------- PAYMENTS ----------
  const [showSheet, setShowSheet] = useState(false);
  const [payments, setPayments] = useState({
    razorpay: "",
    instamojo: "",
    upi: "",
    custom: "",
    qr: null,
  });

  const activeIcons = [];
  if (payments.razorpay) activeIcons.push("razorpay");
  if (payments.instamojo) activeIcons.push("instamojo");
  if (payments.upi) activeIcons.push("upi");
  if (payments.custom) activeIcons.push("custom");
  if (payments.qr) activeIcons.push("qr");

  const readImage = (file, setter) => {
    const reader = new FileReader();
    reader.onload = () => setter(reader.result);
    reader.readAsDataURL(file);
  };

  return (
    <div style={s.page}>
      {/* HEADER */}
      <div style={s.header}>
        <FiArrowLeft size={20} onClick={() => navigate(-1)} />
        <div>Edit Profile</div>
        <button style={s.save}>Save</button>
      </div>

      {/* BANNER */}
      <div
        style={{
          ...s.banner,
          backgroundImage: banner ? `url(${banner})` : "none",
        }}
      >
        <button
          type="button"
          style={s.bannerBtn}
          onClick={() => bannerRef.current.click()}
        >
          <FiEdit2 />
        </button>

        <input
          ref={bannerRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) =>
            e.target.files[0] &&
            readImage(e.target.files[0], setBanner)
          }
        />
      </div>

      {/* AVATAR */}
      <div style={s.avatarWrap}>
        <div
          style={{
            ...s.avatar,
            backgroundImage: avatar ? `url(${avatar})` : "none",
          }}
        />
        <button
          type="button"
          style={s.avatarBtn}
          onClick={() => avatarRef.current.click()}
        >
          <FiEdit2 size={14} />
        </button>

        <input
          ref={avatarRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) =>
            e.target.files[0] &&
            readImage(e.target.files[0], setAvatar)
          }
        />
      </div>

      {/* NAME */}
      <input
        style={s.input}
        placeholder="name --optional"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <p style={s.hint}>
        this will be displayed to clients and does not change your username
      </p>

      {/* KEYWORDS */}
      <div style={s.keywordBox}>
        {keywords.map((k) => (
          <span key={k} style={s.pill}>
            {k}
            <span onClick={() => removeKeyword(k)}>×</span>
          </span>
        ))}
        <input
          style={s.keywordInput}
          placeholder="add keywords"
          value={keywordInput}
          onChange={(e) => setKeywordInput(e.target.value)}
          onKeyDown={addKeyword}
        />
      </div>

      {/* PAYMENTS */}
      <h4>Payments method (max 5)</h4>
      <p style={s.hint}>client can pay using these methods</p>

      <div style={s.paymentRow}>
        <button style={s.addPayBtn} onClick={() => setShowSheet(true)}>
          + add payment
        </button>

        {activeIcons.map((i) => (
          <span key={i} style={s.payIcon}>
            {i === "razorpay" && <SiRazorpay />}
            {i === "instamojo" && (
              <img
                src="/instamojo/instamojo.svg"
                alt="instamojo"
                style={{ height: 18 }}
              />
            )}
            {i === "upi" && <FaRupeeSign />}
            {i === "custom" && <BsCreditCard />}
            {i === "qr" && <FaQrcode />}
          </span>
        ))}
      </div>

      {/* DESCRIPTION */}
      <textarea
        style={s.desc}
        placeholder="description --optional"
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
      />

      {/* PAYMENT SHEET */}
      {showSheet && (
        <div style={s.sheet}>
          <h3>Add payment method</h3>

          <input
            style={s.input}
            placeholder="Razorpay link"
            onChange={(e) =>
              setPayments({ ...payments, razorpay: e.target.value })
            }
          />
          <input
            style={s.input}
            placeholder="Instamojo link"
            onChange={(e) =>
              setPayments({ ...payments, instamojo: e.target.value })
            }
          />
          <input
            style={s.input}
            placeholder="UPI ID"
            onChange={(e) =>
              setPayments({ ...payments, upi: e.target.value })
            }
          />
          <input
            style={s.input}
            placeholder="Custom payment"
            onChange={(e) =>
              setPayments({ ...payments, custom: e.target.value })
            }
          />

          <label style={s.qrBox}>
            <FaQrcode size={34} />
            <div style={{ fontWeight: 600 }}>Upload QR code</div>
            <span style={{ fontSize: 12, color: "#666" }}>
  PNG or JPG
</span>

            <input
              type="file"
              hidden
              onChange={(e) =>
                e.target.files[0] &&
                setPayments({
                  ...payments,
                  qr: e.target.files[0],
                })
              }
            />
          </label>

          <button
            style={s.close}
            onClick={() => setShowSheet(false)}
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
}

/* ---------------- STYLES ---------------- */
const HP = 16;
const s = {
  page: {
    paddingBottom: 140,
    paddingLeft: HP,
    paddingRight: HP,
  },

  
  
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    fontWeight: "bold",
  },
  save: {
    border: "none",
    padding: "6px 14px",
    borderRadius: 20,
    background: "#eee",
  },

  banner: {
    height: 140,
    background: "#000",
    backgroundSize: "cover",
    backgroundPosition: "center",
    position: "relative",
  },
  bannerBtn: {
    position: "absolute",
    right: 12,
    bottom: 12,
    background: "#fff",
    borderRadius: "50%",
    padding: 8,
    border: "none",
  },

  avatarWrap: {
    position: "relative",
    width: 90,
    margin: "-45px auto 10px",
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: "50%",
    background: "#ddd",
    backgroundSize: "cover",
    border: "4px solid white",
  },
  avatarBtn: {
    position: "absolute",
    right: 0,
    bottom: 0,
    background: "#fff",
    borderRadius: "50%",
    padding: 6,
    border: "none",
  },

  input: {
    width: "100%",
    marginTop: 10,
    padding: 7,
    borderRadius: 20,
    background: "#f1f1f1",
    fontSize: 16,
    border: "none",
  },

  desc: {
    width: "100%",
    height: 120,
    marginTop: 10,
    padding: 7,
    border: "none",
    background: "#f1f1f1",
    fontSize: 16,
    borderRadius: 20,
},

  hint: {
    fontSize: 12,
    color: "#777",
    marginTop:6,
  },


  keywordBox: {
    width: "100%",
    marginTop: 10,
    background: "#f1f1f1",
    borderRadius: 20,
    padding: 7,
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
  },

  pill: {
    background: "#ddd",
    padding: "6px 12px",
    borderRadius: 20,
    display: "flex",
    gap: 6,
    alignItems: "center",
  },
  keywordInput: {
    border: "none",
    background: "transparent",
    flex: 1,
    minWidth: 120,
    outline: "none",
  },
  paymentRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
    marginTop: 10,
  },

  
  addPayBtn: {
    border: "none",
    padding: "6px 14px",
    borderRadius: 20,
    background: "#eee",
  },
  payIcon: {
    background: "#eee",
    padding: 8,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  sheet: {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    background: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "80vh",
    overflowY: "auto",
    zIndex: 1000,
    paddingBottom: 120,
    border: "2px solid #000",      // ✅ black outline
    boxShadow: "0 -8px 20px rgba(0,0,0,0.15)", // optional but clean
  },

  qrBox: {
    border: "2px dashed #000",
    borderRadius: 16,
    padding: 24,
    marginTop: 16,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    background: "#fafafa",
  },

  close: {
    width: "100%",
    marginTop: 16,
    padding: 12,
    borderRadius: 20,
    border: "none",
    background: "#000",
    color: "#fff",
  },
};
