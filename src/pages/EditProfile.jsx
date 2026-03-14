import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiEdit2, FiArrowLeft } from "react-icons/fi";
import { FaQrcode, FaRupeeSign, FaPaypal } from "react-icons/fa";
import { SiRazorpay } from "react-icons/si";
import { BsCreditCard } from "react-icons/bs";

const API_BASE = "https://Linkx1.pythonanywhere.com";

export default function EditProfile() {
  const navigate = useNavigate();
  const bannerRef = useRef(null);
  const avatarRef = useRef(null);

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
    qr: null,
    qr_preview: null,
  });

  // LOAD PROFILE
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    fetch(`${API_BASE}/freelancers/me/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(d => {
        if (!d) return;
        setName(d.display_name || "");
        setDesc(d.description || "");
        setPortfolio(d.portfolio_link || "");
        setKeywords(d.tags || []);
        if (d.avatar) setAvatar(d.avatar);
        if (d.banner) setBanner(d.banner);
        if (d.payments) {
          setPayments({
            upi_id: d.payments.upi_id || "",
            razorpay_link: d.payments.razorpay || "",
            paypal_link: d.payments.paypal || "",
            custom_payment_label: d.payments.custom?.label || "",
            custom_payment_details: d.payments.custom?.details || "",
            qr: null,
            qr_preview: d.payments.qr || null,
          });
          
        }

        
      });
  }, []);

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

  const handleSave = async () => {
    const token = localStorage.getItem("accessToken");
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
    if (avatarFile) fd.append("avatar", avatarFile);
    if (bannerFile) fd.append("banner", bannerFile);
    if (payments.qr) fd.append("upi_qr", payments.qr);
    

    await fetch(`${API_BASE}/freelancers/me/update/`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    });

    alert("Saved");
  };

  return (
    <div style={s.page}>
      {/* HEADER */}
      <div style={s.header}>
        <FiArrowLeft onClick={() => navigate(-1)} />
        <div style={s.headerTitle}>Edit Profile</div>
        <button style={s.saveBtn} onClick={handleSave}>Save</button>
      </div>

      <div style={s.card}>
        {/* BANNER */}
        <div style={{ ...s.banner, backgroundImage: banner && `url(${banner})` }}>
          <button style={s.editIcon} onClick={() => bannerRef.current.click()}><FiEdit2 /></button>
          <input hidden ref={bannerRef} type="file" onChange={e => {
            const f = e.target.files[0]; if (!f) return;
            setBannerFile(f); readImage(f, setBanner);
          }} />
        </div>

        {/* AVATAR */}
        <div style={s.avatarWrap}>
          <div style={{ ...s.avatar, backgroundImage: avatar && `url(${avatar})` }} />
          <button style={s.avatarEdit} onClick={() => avatarRef.current.click()}><FiEdit2 /></button>
          <input hidden ref={avatarRef} type="file" onChange={e => {
            const f = e.target.files[0]; if (!f) return;
            setAvatarFile(f); readImage(f, setAvatar);
          }} />
        </div>

        {/* DISPLAY NAME */}
        <input style={s.input} placeholder="display name" value={name} onChange={e => setName(e.target.value)} />
        <p style={s.helper}>this will be displayed to clients and does not change your username <span style={s.link}>learn more</span></p>

        {/* TAGS */}
        <div style={s.tagBox}>
          {keywords.map((k, i) => (
            <span key={i} style={s.tag}>
              {k}
              <span style={s.tagClose} onClick={() => removeTag(i)}>×</span>
            </span>
          ))}

          <input
            style={s.tagInput}
            placeholder="+ tags"
            value={keywordInput}
            onChange={e => setKeywordInput(e.target.value)}
            onKeyDown={addKeyword}
          />
        </div>

        <p style={s.helper}>tags helps algorithm to recommend you to clients <span style={s.link}>learn more</span></p>

        {/* PAYMENT / PORTFOLIO */}
        <p style={s.boldMuted}>payment method and portfolio are mandatory.</p>
        <div style={s.row}>
          <button style={s.pill} onClick={() => setShowPaymentModal(true)}>+ add payment</button>
          <button style={s.pill} onClick={() => setShowPortfolioModal(true)}>+ portfolio link</button>
          <button style={s.pill}>more</button>
        </div>

        {/* DESCRIPTION */}
        <textarea style={s.desc} placeholder="description (optional but highly recommended)" value={desc} onChange={e => setDesc(e.target.value)} />
      </div>

      {/* PAYMENT MODAL */}
      {showPaymentModal && (
        <div style={s.modalBg} onClick={() => setShowPaymentModal(false)}>
          <div style={s.modalBox} onClick={e => e.stopPropagation()}>
            <div style={s.modalHeader}>Payment Methods</div>

            <div style={s.payRow}><SiRazorpay /> <input placeholder="razorpay link" value ={payments.razorpay_link} onChange={e => setPayments({ ...payments, razorpay_link: e.target.value })} /></div>
            <div style={s.payRow}><FaPaypal /> <input placeholder="paypal info" value = {payments.paypal_link} onChange={e => setPayments({ ...payments, paypal_link: e.target.value })} /></div>
            <div style={s.payRow}><FaRupeeSign /> <input placeholder="upi id" value={payments.upi_id} onChange={e => setPayments({ ...payments, upi_id: e.target.value })} /></div>
            <div style={s.payRow}><BsCreditCard /> <input placeholder="custom payment" value ={payments.custom_payment_label} onChange={e => setPayments({ ...payments, custom_payment_label: e.target.value })} /></div>

            <label style={s.qrBox}>
              <FaQrcode /> Upload QR
              <input hidden type="file" onChange={e => {
                const f = e.target.files[0];
                readImage(f, img => setPayments(p => ({ ...p, qr_preview: img, qr: f })));
              }} />
            </label>

            {payments.qr_preview && <img src={payments.qr_preview} style={s.qrPreview} />}

            <button style={s.modalSave} onClick={() => setShowPaymentModal(false)}>Save</button>
          </div>
        </div>
      )}

      {/* PORTFOLIO MODAL */}
      {showPortfolioModal && (
        <div style={s.modalBg} onClick={() => setShowPortfolioModal(false)}>
          <div style={s.modalBox} onClick={e => e.stopPropagation()}>
            <div style={s.modalHeader}>Portfolio Link</div>
            <input style={s.input} placeholder="https://your-site.com" value={portfolio} onChange={e => setPortfolio(e.target.value)} />
            <button style={s.modalSave} onClick={() => setShowPortfolioModal(false)}>Save</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- STYLES ---------------- */

const s = {
  page:{ background:"#eee", minHeight:"100vh" },

  header:{ display:"flex", justifyContent:"space-between", padding:15, fontWeight:"bold" },
  headerTitle:{ fontSize:18 },
  saveBtn:{ background:"#ddd", borderRadius:20, border:"none", padding:"6px 14px" },

  card:{ maxWidth:500, margin:"0 auto", padding:14 },

  banner:{ height:140, background:"#000", borderRadius:16, position:"relative", backgroundSize:"cover" },
  editIcon:{ position:"absolute", right:10, bottom:10, background:"#fff", borderRadius:"50%", padding:8, cursor:"pointer", zIndex:10 },

  avatarWrap:{ marginTop:-45, display:"flex", justifyContent:"center", position:"relative" },
  avatar:{ width:80, height:80, borderRadius:"50%", background:"#ccc", border:"4px solid #eee", backgroundSize:"cover" },
  avatarEdit:{ position:"absolute", right:"38%", bottom:0, background:"#fff", borderRadius:"50%", padding:6, cursor:"pointer" },

  input:{ width:"90%", padding:"12px 14px", borderRadius:20, border:"none", background:"#e6e6e6", fontSize:15, marginTop:10 },
  desc:{ width:"90%", padding:"12px 14px", borderRadius:20, border:"none", background:"#e6e6e6", fontSize:15, marginTop:10, minHeight:80, resize:"none" },

  helper:{ fontSize:12, opacity:.6, marginTop:4 },
  link:{ color:"#a020f0" },

  tagBox:{ background:"#e6e6e6", borderRadius:20, padding:10, display:"flex", flexWrap:"wrap", gap:6, alignItems:"center", minHeight:45, width:"90%" },
  tag:{ background:"#fff", padding:"5px 10px", borderRadius:15, fontSize:14, display:"flex", alignItems:"center", gap:6, maxWidth:"100%" },
  tagClose:{ fontSize:14, cursor:"pointer", opacity:.6 },
  tagInput:{ border:"none", background:"transparent", flex:1, minWidth:80, fontSize:14 },

  boldMuted:{ fontWeight:"bold", opacity:.7, marginTop:12 },
  row:{ display:"flex", gap:10, marginTop:10 },
  pill:{ background:"#e6e6e6", borderRadius:20, border:"none", padding:"8px 14px" },

  modalBg:{ position:"fixed", inset:0, background:"rgba(0,0,0,.5)", display:"flex", justifyContent:"center", alignItems:"center" },
  modalBox:{ background:"#fff", width:"90%", borderRadius:20, padding:15 },
  modalHeader:{ fontWeight:"bold", marginBottom:10 },
  payRow:{ display:"flex", alignItems:"center", gap:10, background:"#f2f2f2", padding:10, borderRadius:12, marginBottom:10,outline: "none",
  border: "none", boxShadow: "none",
    
  },
  qrBox:{ display:"flex", gap:10, background:"#f2f2f2", padding:10, borderRadius:12, cursor:"pointer" },
  qrPreview:{ width:120, marginTop:10, borderRadius:12 },
  modalSave:{ marginTop:10, width:"100%", padding:10, borderRadius:20, border:"none", background:"#ddd" },
};
