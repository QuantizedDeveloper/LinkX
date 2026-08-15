import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { fetchWithAuth } from "../utils/api";
import { FiSend } from "react-icons/fi";
import "./Chatbot.css";
import { showToast } from "../utils/toast";
import Gig from "../components/Gig";
import { useQuery } from "@tanstack/react-query";

import { IoSend } from "react-icons/io5";
import { FiEye } from "react-icons/fi";
const isDesktop = window.innerWidth >= 975;
export default function Chatbot() {
  
  const [selectedGigId, setSelectedGigId] = useState(null);
  const [showGigModal, setShowGigModal] = useState(false);
  const fixCloudinaryUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    return `https://res.cloudinary.com/dd04focej/${url}`;
  };
  const [uploading, setUploading] = useState(false);
  const [selectedImages, setSelectedImages] =
  useState(null);
  const endRef = useRef();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [pendingQuestion, setPendingQuestion] = useState(null);
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
    final: [
  "Analyzing your project requirements...",
  "Searching the best matching freelancers...",
  "Comparing skills, experience, and portfolios...",
  "Shortlisting the strongest candidates...",
  "Preparing your personalized matches..."
],
quality_level: [
  "Analyzing your project requirements...",
  "Searching matching freelancers...",
  "Comparing skills, experience, and portfolios...",
  "Shortlisting the best candidates...",
  "Preparing your personalized recommendations..."
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
    (async () => {
      const result = await fetchNext([]);

      if (result?.question) {
        setQuestions([result.question]);
      }
    })();
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
  const { data: selectedGig } = useQuery({
  queryKey: ["gig", selectedGigId],

  queryFn: async () => {

    if (!selectedGigId) return null;

    const res = await fetchWithAuth(
      `/api/gigs/gigs/${selectedGigId}/`
    );

    if (!res.ok) {
      throw new Error("Failed to fetch gig");
    }

    return res.json();
  },

  enabled: !!selectedGigId,
});
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

  await fetchResults(answersData);

  return {
    done: true
  };
}


    if (data.next_question) {
  return {
    question: {
      id: data.question_id,
      text: data.next_question,
    }
  };
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
  const handleSend = async () => {

  if (!input.trim()) return;

  const q = questions[currentIndex];

  const newAnswer = {
    id: q.id,
    question: q.text,
    answer: input,
  };

  const updated = [...answers, newAnswer];

  setAnswers(updated);

  setAnswerMap({
    ...answerMap,
    [q.id]: input
  });

  setInput("");

  const phrases = transitionMap[q.id] || transitionMap.final;

  setShowTransition(true);

  let index = 0;
  let backendResult = null;

const backendPromise = fetchNext(updated);

backendPromise.then(result => {
  backendResult = result;
});


  while (true) {

    setTransitionText(phrases[index]);

    await new Promise(resolve =>
      setTimeout(resolve, 1200)
    );
    

    index++;

    // loop transition
    if (index >= phrases.length) {

  if (backendResult) {
    break;
  }

  index = 0;
}
  }


  // make sure backend really finished
  const result = await backendPromise;

if (result?.question) {
  setQuestions(prev => [
    ...prev,
    result.question
  ]);

  setCurrentIndex(prev => prev + 1);
}

setShowTransition(false);

if (result?.done) {
  setDone(true);
  return;
}

};

  // RESET CHAT
  const resetChat = async () => {
  localStorage.removeItem(STORAGE_KEY);

  setQuestions([]);
  setAnswers([]);
  setAnswerMap({});
  setCurrentIndex(0);
  setDone(false);
  setResults([]);

  const result = await fetchNext([]);

  if (result?.question) {
    setQuestions([result.question]);
  }
};

  return (
  <div className="page">
    <div className="container">

      {/* HEADER */}
      <div className="header">
        <div className="left">
          {!isDesktop && (
          <span onClick={() => navigate("/")}>✕</span>
          )}
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
  <div key={i}>

    <div className="card">

      <div className="cardHeader">

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
          <img
            src={fixCloudinaryUrl(f.avatar)}
            alt="avatar"
            className="avatar"
          />
        </div>

        <div>
          <div className="name">{f.username}</div>
          <div className="subtitle">{f.gig.title}</div>
        </div>

        {(f.gig?.image1 || f.gig?.image2) && (
          <div
            className="gigPreviewBox"
            onClick={() =>{
              /*setSelectedImages(
                [f.gig?.image1, f.gig?.image2].filter(Boolean)
              )*/
              setSelectedGigId(f.gig.id);
              setShowGigModal(true);
              
            }}
          >
            <img
              src={fixCloudinaryUrl(
                f.gig?.image1 || f.gig?.image2
              )}
              alt="gig preview"
              className="gigPreviewImage"
              
                    
            />

            <div className="gigPreviewOverlay">
              <FiEye size={20} color="white" />
            </div>
          </div>
        )}

      </div>

      <div className="meta">
        ⭐ {f.avg_rating} | {f.gig.price} | {f.gig.delivery_days}
      </div>

      <div className="match">
        🔥 {f.match_percentage}% Match
      </div>

      <div className="match">
        🧠 {f.confidence_score}% Confidence
      </div>

      {f.activity_status && (
        <div className="explain">
          ● {f.activity_status}
        </div>
      )}

     <div className="explain">
       {f.is_verified_by_linkx
       ? "✔ Verified by LinkX"
       : "○ Not verified by LinkX yet"}
    </div>

      <div className="actions">

        <button
          className="viewBtn"
          onClick={() => {
            if (!f?.portfolio_link) {
              showToast("Something went wrong, try again later");
              return;
            }
            window.open(f.portfolio_link, "_blank");
          }}
        >
          View Portfolio
        </button>

        <button
          className="contactBtn"
          onClick={async () => {

            if (!f?.username || !f?.gig?.id) {
              showToast("Something went wrong");
              return;
            }

            try {

              await fetchWithAuth(
                "/api/linkbot/create-contact/",
                {
                  method: "POST",
                  body: JSON.stringify({
                    username: f.username,
                    gig_id: f.gig.id
                  })
                }
              );

              await fetchWithAuth(
                "/api/linkbot/generate-review-notifications/",
                {
                  method: "POST"
                }
              );

            } catch (e) {
              console.log(e);
            }

            navigate(`/chat/${f.username}`, {
              state: {
                gig: {
                  id: f.gig.id,
                  title: f.gig.title,
                  price: f.gig.price,
                  thumbnail: f.gig.image1,
                  deliverytime: f.gig.delivery_days,
                }
              }
            });

          }}
        >
          Contact Now
        </button>

      </div>

    </div>

    <div className="explanationCard">

      <div className="explanationTitle">
        🧠 Why LinkBot picked this freelancer
      </div>

      <div className="explanationSummary">
        <span className="aiBadge">
          LinkBot Analysis
          </span>
          <p> {f.explanation}</p>
      </div>

      

    </div>
    

    </div>



))}
            

            {/* RESET */}
            {results.length > 0 && (
            <button
            className="resetBtn"
            onClick={resetChat}>
              Find Again
              </button>
              )}

          </div>
        
        )}
        <div ref={endRef}></div>
      </div>

      {/* INPUT */}
      {!done && (
        <div className="chat-composer">
          <textarea
          
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className= "composer-textarea"
          />
          <button
      className="composer-send"
      //onClick={sendMessage}
      //disabled={uploading}
      onClick={handleSend}
    >
      <IoSend />
    </button>
        </div>
      )}
      {showGigModal && (
  <div
    className="gig-modal-overlay"
    onClick={() => setShowGigModal(false)}
  >
    <div
      className="gig-modal"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        className="close-modal-btn"
        onClick={() => setShowGigModal(false)}
      >
        ✕
      </button>

      {selectedGig ? (
        <Gig gig={selectedGig} />
      ) : (
        <div>Loading...</div>
      )}
    </div>
  </div>
)}

    </div>
  </div>
);
}