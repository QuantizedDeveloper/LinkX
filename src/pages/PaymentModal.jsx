import { useState } from "react";
import "./PaymentModal.css";
import { showToast } from "../utils/toast";
export default function PaymentModal({ paymentInfo, onClose }) {
  const [showQR, setShowQR] = useState(null);

  if (!paymentInfo) return null;

  const copyUPI = (upi) => {
    navigator.clipboard.writeText(upi);
    showToast("UPI ID copied");
  };

  const items = [
    paymentInfo.razorpay_link && {
      name: "Razorpay",
      type: "link",
      link: paymentInfo.razorpay_link,
    },
    paymentInfo.paypal_link && {
      name: "PayPal",
      type: "link",
      link: paymentInfo.paypal_link,
    },
    (paymentInfo.upi_id || paymentInfo.upi_qr) && {
      name: "UPI",
      type: "upi",
      upi_id: paymentInfo.upi_id,
      qr: paymentInfo.upi_qr,
    },
  ].filter(Boolean);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Payment Methods</h3>

        <button className="close-btn" onClick={onClose}>✕</button>

        <ul className="payment-list">
          {items.map((item, idx) => (
            <li key={idx} className="payment-item">
              <div className="payment-name">{item.name}</div>

              {item.type === "link" && (
                <a href={item.link} target="_blank" rel="noreferrer" className="pay-btn-link">
                  Pay
                </a>
              )}

              {item.type === "upi" && (
                <div className="upi-actions">
                  {item.qr && (
                    <button className="upi-btn" onClick={() => setShowQR(item.qr)}>
                      Scan QR
                    </button>
                  )}

                  {item.upi_id && (
                    <button className="upi-btn" onClick={() => copyUPI(item.upi_id)}>
                      Copy UPI ID
                    </button>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>

        {showQR && (
          <div className="qr-modal-overlay" onClick={() => setShowQR(null)}>
            <div className="qr-modal" onClick={(e) => e.stopPropagation()}>
              <img src={showQR} alt="UPI QR" className="qr-image" />
              <button onClick={() => setShowQR(null)}>Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
