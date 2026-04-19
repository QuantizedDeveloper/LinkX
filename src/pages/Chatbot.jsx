import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { fetchWithAuth } from "../utils/api";
import { FiSend } from "react-icons/fi";
import "./Chatbot.css";
import { showToast } from "../utils/toast";
export default function Chatbot() {

  const endRef = useRef();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [answerMap, setAnswerMap] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [input, setInput] = useState("");
  const [done, setDone] = useState(false);
  const [results, setResults] = useState([]);

  // ✅ transition state (replaces hint system)
  const [transitionText, setTransitionText] = useState("");
  const [showTransition, setShowTransition] = useState(false);

  const STORAGE_KEY = "linkbot_chat";

  const dummyFreelancers = [
    {
      username: "QuantizedDeveloper",
      avg_rating: 4.5,
      match_percentage: 91,
      country: "India",
      explanation: ["Highly rated", "Fast delivery"],
      gig: { title: "Landing page", price: 99, delivery_days: 3 },
    },
    {
      username: "UIX_Master",
      avg_rating: 4.7,
      match_percentage: 88,
      country: "India",
      explanation: ["Strong UI portfolio", "Clean design style"],
      gig: { title: "Modern Landing Page", price: 120, delivery_days: 4 },
    },
    {
      username: "FastBuildDev",
      avg_rating: 4.3,
      match_percentage: 85,
      country: "India",
      explanation: ["Fast delivery", "Budget friendly"],
      gig: { title: "Basic Landing Page", price: 70, delivery_days: 2 },
    },
  ];

  // ✅ per-question transition messages
  const transitionMap = {
    skills: [
      "Understanding your requirements...",
      "Analyzing required skills...",
      "Mapping technical expertise...",
    ],
    budget: [
      "Got your budget details...",
      "Evaluating cost expectations...",
      "Processing budget range...",
    ],
    delivery: [
      "Checking delivery timeline...",
      "Understanding urgency...",
      "Processing time requirements...",
    ],
    experience: [
      "Assessing experience level...",
      "Evaluating expertise depth...",
      "Matching freelancers...",
    ],
    rating: [
      "Filtering rating preferences...",
      "Analyzing quality expectations...",
      "Sorting trusted profiles...",
    ],
  };

  // LOAD
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      const data = JSON.parse(saved);
      setQuestions(data.questions || []);
      setAnswers(data.answers || []);
      setAnswerMap(data.answerMap || {});
      setCurrentIndex(data.currentIndex || 0);
      setDone(data.done || false);
      setResults(data.results || []);
    } else {
      fetchNext([]);
    }
  }, []);

  // SAVE
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        questions,
        answers,
        answerMap,
        currentIndex,
        done,
        results,
      })
    );
  }, [questions, answers, answerMap, currentIndex, done, results]);

  // AUTO SCROLL
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [questions, answers, showTransition]);

  // FETCH NEXT QUESTION
  const fetchNext = async (answersData) => {
    try {
      const res = await fetchWithAuth("/api/linkbot/next-question/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: answersData }),
      });

      const data = await res.json();

      if (data.done) {
        setDone(true);
        fetchResults(answersData);
        return;
      }

      if (data.next_question) {
        setQuestions((prev) => [
          ...prev,
          {
            id: data.question_id,
            text: data.next_question,
          },
        ]);
      }
    } catch (e) {
      console.log(e);
    }
  };

  // RESULTS
  const fetchResults = async (answersData) => {
    try {
      const res = await fetchWithAuth("/api/linkbot/match/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_id: null, answers: answersData }),
      });

      const data = await res.json();

      const backend = data.top_freelancers || [];
      setResults(backend.length ? backend : dummyFreelancers);
    } catch {
      setResults(dummyFreelancers);
    }
  };

  // SEND ANSWER
  const handleSend = () => {
    if (!input.trim()) return;

    const q = questions[currentIndex];

    const newAnswer = {
      id: q.id,
      question: q.text,
      answer: input,
    };

    const updated = [...answers, newAnswer];
    const updatedMap = { ...answerMap, [q.id]: input };

    setAnswers(updated);
    setAnswerMap(updatedMap);
    setInput("");

    // ✅ transition animation logic
    const phrases = transitionMap[q.id] || [
      "Processing your response...",
      "Understanding input...",
      "Updating recommendations...",
    ];

    let i = 0;
    setShowTransition(true);
    setTransitionText(phrases[0]);

    const interval = setInterval(() => {
      i++;
      if (i < phrases.length) {
        setTransitionText(phrases[i]);
      }
    }, 650);

    setTimeout(() => {
      clearInterval(interval);
      setShowTransition(false);

      setCurrentIndex((prev) => prev + 1);
      fetchNext(updated);
    }, 1800);
  };

  // RESET CHAT
  const resetChat = () => {
    localStorage.removeItem(STORAGE_KEY);
    setQuestions([]);
    setAnswers([]);
    setAnswerMap({});
    setCurrentIndex(0);
    setDone(false);
    setResults([]);
    fetchNext([]);
  };

  return (
  <div className="page">
    <div className="container">

      {/* HEADER */}
      <div className="header">
        <div className="left">
          <span onClick={() => navigate("/")}>✕</span>
          <span className="title">LinkBot</span>
        </div>
      </div>

      <div className="content">

        {/* CHAT */}
        {questions.map((q, i) => (
          <div key={q.id || i} className="block">

            <div className="botRow">
              <div className="botBubble">{q.text}</div>
            </div>

            {answerMap[q.id] && (
              <div className="userRow">
                <div className="userBubble">
                  {answerMap[q.id]}
                </div>
              </div>
            )}

          </div>
        ))}

        {/* TRANSITION ANIMATION */}
        {showTransition && (
          <div className="botRow">
            <div className="aiHint animate-pulse">
              {transitionText}
            </div>
          </div>
        )}

        {/* RESULTS */}
        {done && (
          <div className="results">

            <div className="summaryTitle">
              🎯 Top 3 freelancers matched for you
            </div>

            {results.map((f, i) => (
              <div key={i} className="card">

                <div className="cardHeader">

                  {/* AVATAR */}
                  <div
                    className="avatar"
                    onClick={() => {
                      if (!f?.username) {
                        showToast("Something went wrong, try again later");
                        return;
                      }
                      navigate(`/public-profile/${f.username}`);
                    }}
                    style={{ cursor: "pointer" }}
                  >
                  </div>

                  <div>
                    <div className="name">{f.username}</div>
                    <div className="subtitle">{f.gig.title}</div>
                  </div>

                </div>

                <div className="meta">
                  ⭐ {f.avg_rating} | {f.gig.price} | {f.gig.delivery_days}
                </div>

                <div className="match">
                  🔥 {f.match_percentage}% Match
                </div>

                <div className="explain">
                  {f.explanation?.map((e, idx) => (
                    <div key={idx}>✔ {e}</div>
                  ))}
                </div>

                <div className="actions">

                  {/* VIEW PORTFOLIO */}
                  <button
                    className="viewBtn"
                    onClick={() => {
                      if (!f?.portfolio) {
                        showToast("Something went wrong, try again later");
                        return;
                      }
                      window.open(f.portfolio_link, "_blank");
                    }}
                  >
                    View Portfolio
                  </button>

                  {/* CONTACT */}
                  <button
                    className="contactBtn"
                    onClick={() => {
                      if (!f?.username) {
                        showToast("Something went wrong, try again later");
                        return;
                      }
                      navigate(`/chat/${f.username}`);
                    }}
                  >
                    Contact Now
                  </button>

                </div>

              </div>
            ))}

            {/* RESET */}
            <button className="resetBtn" onClick={resetChat}>
              Find Again
            </button>

          </div>
        )}

        <div ref={endRef}></div>
      </div>

      {/* INPUT */}
      {!done && (
        <div className="footer">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
          />
          <button className="send" onClick={handleSend}>
            <FiSend size={18} />
          </button>
        </div>
      )}

    </div>
  </div>
);
}