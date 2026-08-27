import React from "react";
import { useNavigate } from "react-router-dom";

const HiredGuide = () => {
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
          <div style={styles.headerTitle}>Hired Guide</div>
          <div style={styles.headerSubtitle}>
            A simple guide for freelancers after getting hired
          </div>
        </div>
      </div>

      <div style={styles.container}>

        {/* HERO */}
        <div style={styles.hero}>
          <div style={styles.heroIcon}>🎉</div>

          <h1 style={styles.heroTitle}>
            You've been hired!
          </h1>

          <p style={styles.heroText}>
            Great. Now let's make sure the project starts clearly
            and goes smoothly for both you and your client.
          </p>
        </div>


        {/* FLOW */}
        <div style={styles.flowCard}>
          <div style={styles.flowTitle}>
            A good project is simple
          </div>

          <div style={styles.flowSteps}>

            <div style={styles.flowStep}>
              <div style={styles.flowIcon}>📋</div>
              <div>
                <strong>Understand</strong>
                <span> the project</span>
              </div>
            </div>

            <div style={styles.flowArrow}>→</div>

            <div style={styles.flowStep}>
              <div style={styles.flowIcon}>💬</div>
              <div>
                <strong>Communicate</strong>
                <span>clearly</span>
              </div>
            </div>

            <div style={styles.flowArrow}>→</div>

            <div style={styles.flowStep}>
              <div style={styles.flowIcon}>🛠️</div>
              <div>
                <strong>Do the work</strong>
                <span> as agreed</span>
              </div>
            </div>

            <div style={styles.flowArrow}>→</div>

            <div style={styles.flowStep}>
              <div style={styles.flowIcon}>⭐</div>
              <div>
                <strong>Build trust</strong>
                <span> through good work</span>
              </div>
            </div>

          </div>
        </div>


        {/* STEP 1 */}
        <section style={styles.card}>
          <div style={styles.number}>1</div>

          <div style={styles.cardContent}>
            <h2 style={styles.cardTitle}>
              Understand the project
            </h2>

            <p style={styles.cardText}>
              Read the client's requirements carefully. Make sure
              you understand what they expect before you start.
            </p>

            <div style={styles.checkList}>
              <div>✓ What needs to be delivered?</div>
              <div>✓ What does the client expect?</div>
              <div>✓ When is it due?</div>
              <div>✓ Are there any important requirements?</div>
            </div>

            <div style={styles.tip}>
              <strong>Not clear?</strong> Ask the client before
              starting instead of guessing.
            </div>
          </div>
        </section>


        {/* STEP 2 */}
        <section style={styles.card}>
          <div style={styles.number}>2</div>

          <div style={styles.cardContent}>
            <h2 style={styles.cardTitle}>
              Confirm the important details
            </h2>

            <p style={styles.cardText}>
              Make sure both you and the client understand the
              same agreement.
            </p>

            <div style={styles.greenBox}>
              ✓ Deliverables<br />
              ✓ Agreed price<br />
              ✓ Deadline<br />
              ✓ Important requirements
            </div>
          </div>
        </section>


        {/* STEP 3 */}
        <section style={styles.card}>
          <div style={styles.number}>3</div>

          <div style={styles.cardContent}>
            <h2 style={styles.cardTitle}>
              Be honest about what you can do
            </h2>

            <p style={styles.cardText}>
              Only promise work, skills and deadlines that you
              can realistically deliver.
            </p>

            <div style={styles.tip}>
              If you realize something may take longer or cannot
              be done as expected, tell the client as early as possible.
            </div>
          </div>
        </section>


        {/* STEP 4 */}
        <section style={styles.card}>
          <div style={styles.number}>4</div>

          <div style={styles.cardContent}>
            <h2 style={styles.cardTitle}>
              Keep the client updated
            </h2>

            <p style={styles.cardText}>
              You don't need to message constantly. Just keep the
              client informed when something important happens.
            </p>

            <div style={styles.checkList}>
              <div>✓ When you start</div>
              <div>✓ When you need clarification</div>
              <div>✓ When something changes</div>
              <div>✓ When you're close to delivery</div>
              <div>✓ If there is a delay or problem</div>
            </div>
          </div>
        </section>


        {/* STEP 5 */}
        <section style={styles.card}>
          <div style={styles.number}>5</div>

          <div style={styles.cardContent}>
            <h2 style={styles.cardTitle}>
              Deliver what was agreed
            </h2>

            <p style={styles.cardText}>
              Your goal isn't simply to finish something.
              Deliver the work that you and the client agreed on.
            </p>

            <div style={styles.featureBox}>
              <div style={styles.featureIcon}>🎯</div>

              <div>
                <div style={styles.featureTitle}>
                  Clear work = happy clients
                </div>

                <div style={styles.featureText}>
                  Good communication and reliable delivery help
                  you build a strong reputation on LinkX.
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* IF SOMETHING GOES WRONG */}
        <section style={styles.warningCard}>

          <div style={styles.warningIcon}>
            ⚠️
          </div>

          <div>
            <h2 style={styles.cardTitle}>
              Something went wrong?
            </h2>

            <p style={styles.cardText}>
              Don't disappear. Talk to the client, explain the
              problem clearly and try to find a reasonable solution.
            </p>

            <p style={styles.smallText}>
              If you cannot resolve the situation, use the
              appropriate LinkX support or reporting process.
            </p>
          </div>

        </section>


        {/* SAFETY */}
        <section style={styles.safetySection}>

          <div style={styles.safetyIcon}>
            🛡️
          </div>

          <div style={styles.cardContent}>
            <h2 style={styles.cardTitle}>
              Protect yourself too
            </h2>

            <div style={styles.checkList}>
              <div>✓ Don't accept illegal or harmful work.</div>
              <div>✓ Don't share passwords unnecessarily.</div>
              <div>✓ Don't misrepresent your skills or experience.</div>
              <div>✓ Don't accept work you cannot realistically complete.</div>
              <div>✓ If something feels wrong, stop and ask for help.</div>
            </div>
          </div>

        </section>


        {/* LINKX ROLE */}
        <section style={styles.infoCard}>

          <div style={styles.infoIcon}>
            ℹ️
          </div>

          <div>
            <h2 style={styles.cardTitle}>
              What LinkX does
            </h2>

            <p style={styles.cardText}>
              LinkX provides the marketplace and tools that help
              clients and freelancers connect and work together.
              But LinkX does not guarantee that every project will
              be successful or that a particular result will be achieved.
            </p>
          </div>

        </section>


        {/* FINAL */}
        <section style={styles.finalCard}>

          <div style={styles.finalIcon}>
            ⭐
          </div>

          <h2 style={styles.finalTitle}>
            Build your reputation.
          </h2>

          <p style={styles.finalText}>
            Do good work. Communicate clearly. Keep your promises.
          </p>

          <p style={styles.finalText}>
            Every project is an opportunity to build trust with
            your client and strengthen your reputation on LinkX.
          </p>

        </section>


        {/* BOTTOM */}
        <div style={styles.bottom}>
          <div style={styles.bottomTitle}>
            Good work speaks for itself.
          </div>

          <div style={styles.bottomText}>
            Make your next project a great one.
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

  container: {
    width: "100%",
    maxWidth: "760px",
    margin: "0 auto",
    padding: "24px 18px 50px",
    boxSizing: "border-box",
  },

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

  flowArrow: {
    color: "#888",
    fontSize: "18px",
  },

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

  checkList: {
    marginTop: "15px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    color: "#444",
    fontSize: "14px",
    lineHeight: "1.4",
  },

  greenBox: {
    marginTop: "14px",
    padding: "14px",
    background: "#f2faf4",
    borderRadius: "10px",
    color: "#287a3e",
    fontSize: "14px",
    lineHeight: "1.8",
  },

  tip: {
    marginTop: "14px",
    padding: "12px",
    background: "#fafafa",
    borderRadius: "10px",
    fontSize: "13px",
    lineHeight: "1.55",
    color: "#555",
  },

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

  safetySection: {
    background: "#ffffff",
    borderRadius: "16px",
    padding: "22px",
    marginTop: "18px",
    display: "flex",
    gap: "14px",
    boxShadow: "0 3px 12px rgba(0,0,0,0.04)",
  },

  safetyIcon: {
    fontSize: "25px",
    flexShrink: 0,
  },

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

  finalCard: {
    background: "#ffffff",
    borderRadius: "18px",
    padding: "28px 22px",
    marginTop: "18px",
    textAlign: "center",
    boxShadow: "0 4px 16px rgba(0,0,0,0.05)",
  },

  finalIcon: {
    fontSize: "34px",
    marginBottom: "8px",
  },

  finalTitle: {
    margin: "0 0 10px",
    fontSize: "22px",
    fontWeight: "700",
  },

  finalText: {
    margin: "7px auto 0",
    maxWidth: "560px",
    color: "#666",
    fontSize: "14px",
    lineHeight: "1.6",
  },

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

export default HiredGuide;