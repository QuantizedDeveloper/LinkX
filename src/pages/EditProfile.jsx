import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiEdit2, FiArrowLeft } from "react-icons/fi";
import { FaQrcode, FaRupeeSign, FaPaypal } from "react-icons/fa";
import { SiRazorpay } from "react-icons/si";
import { BsCreditCard } from "react-icons/bs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { showToast } from "../utils/toast";
import { FiCamera } from "react-icons/fi";
import { fetchWithAuth } from "../utils/api";
//const API_BASE = "https://Linkx1.pythonanywhere.com";
const API_BASE = "https://linkx-backend-api-linkx-backend.hf.space";

export default function EditProfile() {
  const navigate = useNavigate();
  const bannerRef = useRef(null);
  const avatarRef = useRef(null);
  const queryClient = useQueryClient();

  const [experienceYears, setExperienceYears] = useState("");
  const [country, setCountry] = useState("");
  const [banner, setBanner] = useState(null);
  const [avatar, setAvatar] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);

  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [portfolio, setPortfolio] = useState("");

  const [keywordInput, setKeywordInput] = useState("");
  const [keywords, setKeywords] = useState([]);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);

  const [payments, setPayments] = useState({
    razorpay_link: "",
    paypal_link: "",
    upi_id: "",
    custom_payment_label: "",
    custom_payment_details: "",
    qr: null,
    qr_preview: null,
  });

  const fetchProfile = async () => {
    const token = localStorage.getItem("accessToken");
    const res = await fetch(`${API_BASE}/freelancers/me/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to fetch profile");
    return res.json();
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["profile"],
    queryFn: fetchProfile,
  });

  useEffect(() => {
    if (!data) return;

    setExperienceYears(data.experience_years || "");
    setCountry(data.country || "");
    setName(data.display_name || "");
    setDesc(data.description || "");
    setPortfolio(data.portfolio_link || "");
    setKeywords(data.tags || []);

    setAvatar(data.avatar || null);
    setBanner(data.banner || null);

    if (data.payments) {
      setPayments({
        upi_id: data.payments.upi_id || "",
        razorpay_link: data.payments.razorpay || "",
        paypal_link: data.payments.paypal || "",
        custom_payment_label: data.payments.custom?.label || "",
        custom_payment_details: data.payments.custom?.details || "",
        qr: null,
        qr_preview: data.payments.qr || null,
      });
    }
  }, [data]);

  const readImage = (f, setter) => {
    const r = new FileReader();
    r.onload = () => setter(r.result);
    r.readAsDataURL(f);
  };

  const addKeyword = (e) => {
    if (e.key === "Enter" && keywordInput.trim()) {
      e.preventDefault();
      setKeywords([...keywords, keywordInput.trim()]);
      setKeywordInput("");
    }
  };

  const removeTag = (i) => {
    setKeywords(keywords.filter((_, index) => index !== i));
  };

  const mutation = useMutation({
  mutationFn: async (fd) => {
    const token = localStorage.getItem("accessToken");

    const res = await fetchWithAuth(
      `/freelancers/me/update/`,
      {
        method: "PATCH",
        body: fd,
      }
    );

    if (!res.ok) throw new Error("Update failed");
    return res.json();
  },

  onSuccess: () => {
    queryClient.invalidateQueries(["profile"]);
    showToast("Saved");
    navigate("/profile");
  },

  onError: () => {
    showToast("Error saving profile");
  },
});

  const handleSave = () => {
    const fd = new FormData();

    fd.append("display_name", name);
    fd.append("description", desc);
    fd.append("portfolio_link", portfolio);
    fd.append("tags", JSON.stringify(keywords));
    fd.append("upi_id", payments.upi_id);
    fd.append("razorpay_link", payments.razorpay_link);
    fd.append("paypal_link", payments.paypal_link);
    fd.append("custom_payment_label", payments.custom_payment_label);
    fd.append("custom_payment_details", payments.custom_payment_details);

    fd.append("experience_years", experienceYears || "");
    fd.append("country", country || "");
    if (avatarFile) fd.append("avatar", avatarFile);
    if (bannerFile) fd.append("banner", bannerFile);
    if (payments.qr) fd.append("upi_qr", payments.qr);

    mutation.mutate(fd);
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading profile</div>;

  return (
    <div style={s.page}>
      {/* HEADER */}
      <div style={s.header}>
        <FiArrowLeft size={20} onClick={() => navigate(-1)} />
        <div style={s.headerTitle}>Edit Profile</div>
        <button style={s.saveBtn} onClick={handleSave}>Save</button>
      </div>

      <div style={s.card}>
        {/* BANNER */}
        <div style={{ ...s.banner, backgroundImage: banner && `url(${banner})` }}>
          <button style={s.editIcon}
          onClick={() => bannerRef.current && bannerRef.current.click()}>
            <FiCamera size={16} />
            </button>
        
          <input
          ref={bannerRef}
          type="file"
          style={{ display: "none" }}
          onChange={(e) => {
          const f = e.target.files[0];
          if (!f) return;
          setBannerFile(f);
          readImage(f, setBanner);
          }}
        />
        </div>

        {/* AVATAR */}
        <div style={s.avatarWrap}>
          <div style={{ ...s.avatar, backgroundImage: avatar && `url(${avatar})` }} />
          <button style={s.avatarEdit} onClick={() => avatarRef.current.click()}>
            <FiCamera size={16} />
          </button>
          <input hidden ref={avatarRef} type="file" onChange={(e) => {
            const f = e.target.files[0];
            if (!f) return;
            setAvatarFile(f);
            readImage(f, setAvatar);
          }} />
        </div>

        {/* NAME */}
        <input
          style={s.input}
          placeholder="display name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
        />

        <p style={s.helper}>
          this will be displayed to clients and does not change your username
        </p>

        {/* COUNTRY + EXPERIENCE */}
        <div style={s.inlineRow}>
          <input style={s.countryInput} placeholder="country" value = {country}
          
            onChange={(e) => setCountry(e.target.value)}
          autoComplete="name"
          />
          <input style={s.expInput} placeholder="experience"value = {experienceYears}
           onChange={(e) => setExperienceYears(e.target.value)}
          autoComplete="name"/>
        </div>

        {/* TAGS */}
        <div style={s.tagBox}>
          {keywords.map((k, i) => (
            <span key={i} style={s.tag}>
              {k}
              <span onClick={() => removeTag(i)}>×</span>
            </span>
          ))}
          <input
            style={s.tagInput}
            placeholder="+ tags"
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            onKeyDown={addKeyword}
          />
        </div>

        <p style={s.helper}>tags helps algorithm to recommend you</p>

        {/* ACTIONS */}
        <div style={s.actionRow}>
          <button style={s.pill} onClick={() => setShowPaymentModal(true)}>+ add payment</button>
          <button style={s.pill} onClick={() => setShowPortfolioModal(true)}>+ portfolio</button>
          <button style={s.pill}>more</button>
        </div>

        {/* DESCRIPTION */}
        <textarea
          style={s.desc}
          placeholder="description (optional but recommended)"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />
      </div>

      {/* PAYMENT MODAL */}
      {showPaymentModal && (
        <div style={s.modalBg} onClick={() => setShowPaymentModal(false)}>
          <div style={s.modalBox} onClick={(e) => e.stopPropagation()}>
            <div style={s.modalHeader}>Payment Methods</div>

            {[{ icon: <SiRazorpay />, key: "razorpay_link", placeholder: "Razorpay link" },
              { icon: <FaPaypal />, key: "paypal_link", placeholder: "PayPal" },
              { icon: <FaRupeeSign />, key: "upi_id", placeholder: "UPI ID" },
              { icon: <BsCreditCard />, key: "custom_payment_label", placeholder: "Custom payment" }
            ].map((item, i) => (
              <div key={i} style={s.payInput}>
                {item.icon}
                <input
                  placeholder={item.placeholder}
                  value={payments[item.key]}
                  onChange={(e) =>
                    setPayments({ ...payments, [item.key]: e.target.value })
                  }
                />
              </div>
            ))}

            <label style={s.qrUpload}>
              <FaQrcode /> Upload QR
              <input hidden type="file" onChange={(e) => {
                const f = e.target.files[0];
                readImage(f, (img) =>
                  setPayments((p) => ({ ...p, qr_preview: img, qr: f }))
                );
              }} />
            </label>

            {payments.qr_preview && (
              <img src={payments.qr_preview} style={s.qrPreview} />
            )}

            <button style={s.modalSave} onClick={() => setShowPaymentModal(false)}>
              Save
            </button>
          </div>
        </div>
      )}

      {/* PORTFOLIO MODAL */}
      {showPortfolioModal && (
        <div style={s.modalBg} onClick={() => setShowPortfolioModal(false)}>
          <div style={s.modalBox} onClick={(e) => e.stopPropagation()}>
            <div style={s.modalHeader}>Portfolio Link</div>
            <input
              style={s.input}
              placeholder="https://your-site.com"
              value={portfolio}
              onChange={(e) => setPortfolio(e.target.value)}
              inputMode="url"
            />
            <button style={s.modalSave} onClick={() => setShowPortfolioModal(false)}>
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const s = {
  page: { background: "#f5f5f5", minHeight: "100vh" },
  header: { display: "flex", justifyContent: "space-between", padding: 14, background: "#fff" },
  headerTitle: { fontWeight: 600 },
  saveBtn: { background: "#eee", borderRadius: 20, border: "none", padding: "6px 16px" },
  card: { maxWidth: 500, margin: "0 auto", padding: 16 },

  banner: { height: 150, background: "#000", borderRadius: 16, position: "relative", backgroundSize: "cover" },
  editIcon: {
    position: "absolute",
    right: 10,
    bottom: 10,
    background: "#fff",
    borderRadius: "50%",
    padding: 8,
    cursor: "pointer",
    zIndex: 100, // 🔥 VERY IMPORTANT
    pointerEvents: "auto", // 🔥 ADD THIS
  },

  avatarWrap: { marginTop: -50, display: "flex", justifyContent: "center", position: "relative" },
  avatar: { width: 90, height: 90, borderRadius: "50%", background: "#ccc", border: "4px solid #f5f5f5", backgroundSize: "cover" },
  avatarEdit: { position: "absolute", bottom: 0, right: "calc(50% - 45px)", transform: "translateX(50%)", background: "#fff", borderRadius: "50%", padding: 6 },

  input: { width: "93%", padding: 12, borderRadius: 20, border: "none", background: "#eaeaea", marginTop: 12 },
  smallInput: { flex: 1, padding: 10, borderRadius: 20, border: "none", background: "#eaeaea", margin:5 },
  
  inlineRow: {
    display: "flex",
    gap: 10,
    marginTop: 10,
    width: "100%",
  },
  countryInput: {
    width: 80, // 🔥 fixed small field
    padding: 12,
    borderRadius: 20,
    border: "none",
    background: "#eaeaea",
    textAlign: "center",
    fontFamily: "Inter, sans-serif"
    
  },
  expInput: {
    width: 80, // 🔥 fixed small field
    padding: 12,
    borderRadius: 20,
    border: "none",
    background: "#eaeaea",
    textAlign: "center",
    fontFamily: "Inter, sans-serif"
  },
  helper: { fontSize: 12, opacity: 0.6, marginTop: 4 },

  tagBox: { background: "#eaeaea", borderRadius: 20, padding: 10, display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10, fontFamily: "Inter, sans-serif"},
  tag: { background: "#fff", padding: "5px 10px", borderRadius: 15, fontFamily: "Inter, sans-serif" },
  tagInput: { border: "none", background: "transparent", flex: 1, fontFamily: "Inter, sans-serif" },

  actionRow: { display: "flex", gap: 10, marginTop: 12 },
  pill: { background: "#eaeaea", borderRadius: 20, border: "none", padding: "8px 14px" },

  desc: { width: "93%", padding: 12, borderRadius: 20, border: "none", background: "#eaeaea", marginTop: 12, minHeight: 90 },

  modalBg: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", justifyContent: "center", alignItems: "center" },
  modalBox: { background: "#fff", width: "90%", borderRadius: 20, padding: 16 },
  modalHeader: { fontWeight: 600, marginBottom: 12 },

  payInput: { display: "flex", alignItems: "center", gap: 10, background: "#f2f2f2", padding: 10, borderRadius: 14, marginBottom: 10, border: "hidden "},
  qrUpload: { display: "flex", gap: 10, background: "#f2f2f2", padding: 10, borderRadius: 14, cursor: "pointer" },
  qrPreview: { width: 120, borderRadius: 10, marginTop: 10 },

  modalSave: { width: "100%", marginTop: 14, padding: 12, borderRadius: 20, border: "none", background: "#eaeaea" },
};