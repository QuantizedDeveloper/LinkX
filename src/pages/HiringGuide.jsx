import React from "react";
import { useNavigate } from "react-router-dom";

const HiringGuide = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.page}>

      {/* HEADER */}
      <div style={styles.header}>
        <button
          style={styles.backButton}
          onClick={() => navigate(-1)}
          aria-label="Go back"
        >
          ←
        </button>

        <div>
          <div style={styles.headerTitle}>Hiring Guide</div>
          <div style={styles.headerSubtitle}>
            A simple guide to hiring on LinkX
          </div>
        </div>
      </div>


      <div style={styles.container}>

        {/* HERO */}
        <div style={styles.hero}>
          <div style={styles.heroIcon}>🤝</div>

          <h1 style={styles.heroTitle}>
            Hire with confidence.
          </h1>

          <p style={styles.heroText}>
            LinkX gives you tools to discover, understand and connect
            with freelancers. Here's how to make the most of them.
          </p>
        </div>


        {/* LINKX FLOW */}
        <div style={styles.flowCard}>

          <div style={styles.flowTitle}>
            How hiring on LinkX works
          </div>

          <div style={styles.flowSteps}>

            <div style={styles.flowStep}>
              <div style={styles.flowIcon}>🤖</div>
              <div>
                <strong>LinkBot</strong>
                <span> helps you find</span>
              </div>
            </div>

            <div style={styles.flowArrow}>→</div>

            <div style={styles.flowStep}>
              <div style={styles.flowIcon}>✓</div>
              <div>
                <strong>Verification</strong>
                <span> adds a trust signal</span>
              </div>
            </div>

            <div style={styles.flowArrow}>→</div>

            <div style={styles.flowStep}>
              <div style={styles.flowIcon}>💬</div>
              <div>
                <strong>Messaging</strong>
                <span> helps you discuss</span>
              </div>
            </div>

            <div style={styles.flowArrow}>→</div>

            <div style={styles.flowStep}>
              <div style={styles.flowIcon}>🤝</div>
              <div>
                <strong>You decide</strong>
                <span> who to hire</span>
              </div>
            </div>

          </div>
        </div>


        {/* STEP 1 */}
        <section style={styles.card}>
          <div style={styles.number}>1</div>

          <div style={styles.cardContent}>
            <h2 style={styles.cardTitle}>
              Tell LinkBot what you need
            </h2>

            <p style={styles.cardText}>
              You don't need to know exactly what type of freelancer
              you should search for. Just describe your project in
              your own words.
            </p>

            <div style={styles.featureBox}>
              <div style={styles.featureIcon}>🤖</div>

              <div>
                <div style={styles.featureTitle}>
                  LinkBot
                </div>

                <div style={styles.featureText}>
                  LinkBot helps understand your requirements and
                  find freelancers who may be a good fit.
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* STEP 2 */}
        <section style={styles.card}>
          <div style={styles.number}>2</div>

          <div style={styles.cardContent}>
            <h2 style={styles.cardTitle}>
              Review the matches
            </h2>

            <p style={styles.cardText}>
              LinkBot helps narrow down the search. Take a look at
              the suggested freelancers and compare the information
              available on their profiles.
            </p>

            <div style={styles.checkList}>
              <div>✓ Skills</div>
              <div>✓ Experience</div>
              <div>✓ Portfolio</div>
              <div>✓ Ratings & reviews</div>
              <div>✓ Other available profile information</div>
            </div>
          </div>
        </section>


        {/* STEP 3 */}
        <section style={styles.card}>
          <div style={styles.number}>3</div>

          <div style={styles.cardContent}>
            <h2 style={styles.cardTitle}>
              Look for LinkX verification
            </h2>

            <p style={styles.cardText}>
              Some freelancers have a LinkX verification badge.
              These freelancers have gone through LinkX's manual
              verification process.
            </p>

            <div style={styles.verifiedBox}>
              <div style={styles.verifiedIcon}>✓</div>

              <div>
                <div style={styles.verifiedTitle}>
                  LinkX verified
                </div>

                <div style={styles.verifiedText}>
                  An additional trust signal that the freelancer
                  has completed LinkX's verification process.
                </div>
              </div>
            </div>

            <div style={styles.tip}>
              <strong>Remember:</strong> Verification does not
              guarantee the quality of someone's work, a project
              result, deadline, or business outcome.
            </div>
          </div>
        </section>


        {/* STEP 4 */}
        <section style={styles.card}>
          <div style={styles.number}>4</div>

          <div style={styles.cardContent}>
            <h2 style={styles.cardTitle}>
              Talk before hiring
            </h2>

            <p style={styles.cardText}>
              Use LinkX messaging to discuss the project before
              making your decision.
            </p>

            <div style={styles.checkList}>
              <div>✓ What exactly needs to be delivered?</div>
              <div>✓ What is the agreed price?</div>
              <div>✓ What is the deadline?</div>
              <div>✓ Are there any important requirements?</div>
            </div>

            <div style={styles.tip}>
              <strong>Tip:</strong> If something isn't clear,
              ask before hiring rather than assuming.
            </div>
          </div>
        </section>


        {/* STEP 5 */}
        <section style={styles.card}>
          <div style={styles.number}>5</div>

          <div style={styles.cardContent}>
            <h2 style={styles.cardTitle}>
              You make the final decision
            </h2>

            <p style={styles.cardText}>
              LinkX helps you discover and evaluate freelancers,
              but the final hiring decision is always yours.
            </p>

            <div style={styles.finalBox}>

              <div style={styles.finalRow}>
                <span>🤖</span>
                <div>
                  <strong>LinkBot</strong>
                  <small>helps you find</small>
                </div>
              </div>

              <div style={styles.finalRow}>
                <span>✓</span>
                <div>
                  <strong>Verification</strong>
                  <small>adds a trust signal</small>
                </div>
              </div>

              <div style={styles.finalRow}>
                <span>💬</span>
                <div>
                  <strong>Messaging</strong>
                  <small>helps you discuss</small>
                </div>
              </div>

              <div style={styles.finalRow}>
                <span>🤝</span>
                <div>
                  <strong>You</strong>
                  <small>choose who to hire</small>
                </div>
              </div>

            </div>
          </div>
        </section>


        {/* WHAT YOU CAN HIRE FOR */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>
            What can you hire for?
          </h2>

          <p style={styles.sectionText}>
            LinkX is designed for legitimate freelance work and
            professional services.
          </p>

          <div style={styles.tags}>
            <span style={styles.tag}>Web Development</span>
            <span style={styles.tag}>App Development</span>
            <span style={styles.tag}>Design</span>
            <span style={styles.tag}>SEO</span>
            <span style={styles.tag}>Content</span>
            <span style={styles.tag}>AI & Automation</span>
            <span style={styles.tag}>Marketing</span>
            <span style={styles.tag}>Other Freelance Work</span>
          </div>
        </section>


        {/* NOT ACCEPTED */}
        <section style={styles.warningCard}>

          <div style={styles.warningIcon}>
            ⚠️
          </div>

          <div>
            <h2 style={styles.cardTitle}>
              Keep your project legitimate
            </h2>

            <p style={styles.cardText}>
              LinkX should not be used to hire for illegal,
              fraudulent, harmful, abusive, or deceptive activities.
            </p>

            <p style={styles.smallText}>
              If you're unsure about something, contact LinkX
              Support before proceeding.
            </p>
          </div>

        </section>


        {/* IMPORTANT */}
        <section style={styles.infoCard}>

          <div style={styles.infoIcon}>
            ℹ️
          </div>

          <div>
            <h2 style={styles.cardTitle}>
              What LinkX does and doesn't guarantee
            </h2>

            <p style={styles.cardText}>
              LinkX provides tools to help you discover and connect
              with freelancers. However, LinkX does not guarantee
              a freelancer's work quality, delivery time, project
              result, or business outcome.
            </p>
          </div>

        </section>


        {/* SAFETY */}
        <section style={styles.safeCard}>

          <div style={styles.safeIcon}>
            🛡️
          </div>

          <h2 style={styles.safeTitle}>
            Take your time.
          </h2>

          <p style={styles.safeText}>
            You don't have to rush into a hiring decision.
            Review the freelancer, ask questions and make sure
            the project feels right before you start.
          </p>

          <a
            href="mailto:linkx.llm@gmail.com?subject=LinkX%20Hiring%20Help"
            style={styles.supportLink}
          >
            Need help? Contact LinkX Support →
          </a>

        </section>


        {/* FOOTER MESSAGE */}
        <div style={styles.bottom}>
          <div style={styles.bottomTitle}>
            Find the right person for your project.
          </div>

          <div style={styles.bottomText}>
            LinkX is here to make that process simpler.
          </div>
        </div>

      </div>
    </div>
  );
};


const styles = {

  page: {
    minHeight: "100vh",
    background: "#f5f5f5",
    color: "#111",
    fontFamily: "Arial, sans-serif",
  },

  /* HEADER */

  header: {
    minHeight: "72px",
    background: "#ffffff",
    display: "flex",
    alignItems: "center",
    gap: "14px",
    padding: "0 20px",
    borderBottom: "1px solid #eeeeee",
    position: "sticky",
    top: 0,
    zIndex: 10,
  },

  backButton: {
    border: "none",
    background: "#f2f2f2",
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    fontSize: "25px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  headerTitle: {
    fontSize: "20px",
    fontWeight: "700",
  },

  headerSubtitle: {
    fontSize: "13px",
    color: "#777",
    marginTop: "3px",
  },


  /* MAIN */

  container: {
    width: "100%",
    maxWidth: "760px",
    margin: "0 auto",
    padding: "24px 18px 50px",
    boxSizing: "border-box",
  },


  /* HERO */

  hero: {
    background: "#ffffff",
    borderRadius: "20px",
    padding: "30px 24px",
    marginBottom: "18px",
    boxShadow: "0 4px 16px rgba(0,0,0,0.05)",
  },

  heroIcon: {
    fontSize: "38px",
    marginBottom: "10px",
  },

  heroTitle: {
    fontSize: "30px",
    lineHeight: "1.2",
    margin: "0 0 10px",
    fontWeight: "750",
  },

  heroText: {
    margin: 0,
    color: "#666",
    fontSize: "16px",
    lineHeight: "1.6",
    maxWidth: "620px",
  },


  /* LINKX FLOW */

  flowCard: {
    background: "#111111",
    color: "#ffffff",
    borderRadius: "18px",
    padding: "22px",
    marginBottom: "18px",
    boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
  },

  flowTitle: {
    fontSize: "17px",
    fontWeight: "700",
    marginBottom: "18px",
  },

  flowSteps: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "8px",
    flexWrap: "wrap",
  },

  flowStep: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    minWidth: "130px",
    flex: 1,
  },

  flowIcon: {
    width: "34px",
    height: "34px",
    borderRadius: "50%",
    background: "#ffffff",
    color: "#111111",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    fontSize: "15px",
  },

  flowStepStrong: {
    display: "block",
  },

  flowArrow: {
    color: "#888",
    fontSize: "18px",
  },


  /* CARDS */

  card: {
    background: "#ffffff",
    borderRadius: "16px",
    padding: "20px",
    marginBottom: "14px",
    display: "flex",
    gap: "16px",
    boxShadow: "0 3px 12px rgba(0,0,0,0.04)",
  },

  number: {
    minWidth: "34px",
    width: "34px",
    height: "34px",
    borderRadius: "50%",
    background: "#000000",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    fontSize: "15px",
    flexShrink: 0,
  },

  cardContent: {
    minWidth: 0,
    flex: 1,
  },

  cardTitle: {
    margin: "0 0 8px",
    fontSize: "19px",
    fontWeight: "700",
    lineHeight: "1.3",
  },

  cardText: {
    margin: 0,
    color: "#666",
    fontSize: "15px",
    lineHeight: "1.6",
  },


  /* FEATURE BOX */

  featureBox: {
    marginTop: "16px",
    padding: "14px",
    background: "#f7f7f7",
    borderRadius: "12px",
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
  },

  featureIcon: {
    fontSize: "24px",
    lineHeight: "1",
  },

  featureTitle: {
    fontWeight: "700",
    fontSize: "15px",
    marginBottom: "3px",
  },

  featureText: {
    color: "#666",
    fontSize: "13px",
    lineHeight: "1.5",
  },


  /* CHECK LIST */

  checkList: {
    marginTop: "15px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    color: "#444",
    fontSize: "14px",
    lineHeight: "1.4",
  },


  /* VERIFIED */

  verifiedBox: {
    marginTop: "16px",
    padding: "14px",
    background: "#f2faf4",
    border: "1px solid #dcefe0",
    borderRadius: "12px",
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
  },

  verifiedIcon: {
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    background: "#35a853",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    flexShrink: 0,
  },

  verifiedTitle: {
    fontSize: "15px",
    fontWeight: "700",
    marginBottom: "3px",
  },

  verifiedText: {
    color: "#5d6b61",
    fontSize: "13px",
    lineHeight: "1.5",
  },


  /* TIP */

  tip: {
    marginTop: "14px",
    padding: "12px",
    background: "#fafafa",
    borderRadius: "10px",
    fontSize: "13px",
    lineHeight: "1.55",
    color: "#555",
  },


  /* SECTION */

  section: {
    background: "#ffffff",
    borderRadius: "16px",
    padding: "22px",
    marginTop: "18px",
    boxShadow: "0 3px 12px rgba(0,0,0,0.04)",
  },

  sectionTitle: {
    margin: "0 0 8px",
    fontSize: "20px",
    fontWeight: "700",
  },

  sectionText: {
    margin: 0,
    color: "#666",
    lineHeight: "1.6",
    fontSize: "15px",
  },


  /* TAGS */

  tags: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginTop: "16px",
  },

  tag: {
    background: "#f4f4f4",
    padding: "8px 12px",
    borderRadius: "20px",
    fontSize: "13px",
    color: "#444",
  },


  /* WARNING */

  warningCard: {
    background: "#fffaf0",
    border: "1px solid #f1e2bd",
    borderRadius: "16px",
    padding: "20px",
    marginTop: "18px",
    display: "flex",
    gap: "14px",
  },

  warningIcon: {
    fontSize: "24px",
    flexShrink: 0,
  },

  smallText: {
    margin: "10px 0 0",
    color: "#777",
    fontSize: "13px",
    lineHeight: "1.5",
  },


  /* INFO */

  infoCard: {
    background: "#f3f7ff",
    border: "1px solid #dce7fb",
    borderRadius: "16px",
    padding: "22px",
    marginTop: "18px",
    display: "flex",
    gap: "14px",
  },

  infoIcon: {
    fontSize: "23px",
    flexShrink: 0,
  },


  /* SAFETY */

  safeCard: {
    background: "#ffffff",
    borderRadius: "18px",
    padding: "28px 22px",
    marginTop: "18px",
    textAlign: "center",
    boxShadow: "0 4px 16px rgba(0,0,0,0.05)",
  },

  safeIcon: {
    fontSize: "34px",
    marginBottom: "8px",
  },

  safeTitle: {
    margin: "0 0 8px",
    fontSize: "21px",
  },

  safeText: {
    margin: "0 auto",
    maxWidth: "560px",
    color: "#666",
    fontSize: "14px",
    lineHeight: "1.6",
  },

  supportLink: {
    display: "inline-block",
    marginTop: "16px",
    color: "#000000",
    fontWeight: "700",
    textDecoration: "none",
    fontSize: "14px",
  },


  /* FINAL BOX */

  finalBox: {
    marginTop: "16px",
    padding: "15px",
    background: "#f7f7f7",
    borderRadius: "12px",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
  },

  finalRow: {
    display: "flex",
    alignItems: "center",
    gap: "9px",
    fontSize: "14px",
  },

  finalRowIcon: {
    fontSize: "18px",
  },

  finalRow : {
    display: "block",
    color: "#888",
    marginTop: "2px",
    fontSize: "12px",
  },


  /* BOTTOM */

  bottom: {
    textAlign: "center",
    padding: "30px 10px 10px",
  },

  bottomTitle: {
    fontSize: "18px",
    fontWeight: "700",
  },

  bottomText: {
    marginTop: "5px",
    color: "#888",
    fontSize: "14px",
  },
};


export default HiringGuide;