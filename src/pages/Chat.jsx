import { useParams, useNavigate } from "react-router-dom";

export default function Chat() {
  const { clientId } = useParams();
  const navigate = useNavigate();

  return (
    <div style={styles.page}>

      {/* HEADER */}
      <div style={styles.header}>
        <div style={styles.back} onClick={() => navigate(-1)}>
          ❮
        </div>

        <div style={styles.user}>
          <div style={styles.avatar}></div>
          <div>
            <div style={styles.name}>{clientId}</div>
            <div style={styles.username}>@{clientId}xyz</div>
          </div>
        </div>

        <button style={styles.pay}>pay</button>
      </div>

      {/* CHAT BODY */}
      <div style={styles.body}></div>

      {/* INPUT BAR */}
      <div style={styles.inputBar}>
        <div style={styles.plus}>+</div>
        <input
          placeholder=""
          style={styles.input}
        />
        <div style={styles.send}>^</div>
      </div>

    </div>
  );
}

const styles = {
  page: {
    height: "100vh",
    background: "#fff",
    display: "flex",
    flexDirection: "column"
  },

  /* HEADER */
  header: {
    display: "flex",
    alignItems: "center",
    padding: "10px",
    borderBottom: "1px solid #ddd"
  },

  back: {
    fontSize: 28,
    marginRight: 8,
    cursor: "pointer"
  },

  user: {
    display: "flex",
    alignItems: "center",
    flex: 1
  },

  avatar: {
    width: 42,
    height: 42,
    borderRadius: "50%",
    background: "#ccc",
    marginRight: 10
  },

  name: {
    fontWeight: "bold",
    fontSize: 16
  },

  username: {
    fontSize: 12,
    color: "#999"
  },

  pay: {
    background: "#000",
    color: "#fff",
    border: "none",
    padding: "6px 14px",
    borderRadius: 20,
    cursor: "pointer"
  },

  /* BODY */
  body: {
    flex: 1
  },

  /* INPUT */
  inputBar: {
    display: "flex",
    alignItems: "center",
    padding: 10,
    borderTop: "1px solid #ddd"
  },

  plus: {
    fontSize: 26,
    marginRight: 8,
    cursor: "pointer"
  },

  input: {
    flex: 1,
    padding: "10px 14px",
    borderRadius: 25,
    border: "1px solid #ccc",
    outline: "none"
  },

  send: {
    width: 38,
    height: 38,
    borderRadius: "50%",
    background: "#000",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
    cursor: "pointer",
    fontSize: 18
  }
};
