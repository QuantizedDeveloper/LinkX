// components/Gigs.jsx
import { useEffect, useRef } from "react";
import Gig from "./Gig";
import "./gigs.css";

export default function Gigs({ gigs, hasMore, loadMore }) {
  const observerRef = useRef(null);
  const loadingRef = useRef(false);

  useEffect(() => {
    if (!hasMore) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !loadingRef.current) {
          loadingRef.current = true;
          loadMore();

          // unlock after load
          setTimeout(() => {
            loadingRef.current = false;
          }, 400);
        }
      },
      { rootMargin: "100px" }
    );

    const el = observerRef.current;
    if (el) observer.observe(el);

    return () => {
      if (el) observer.unobserve(el);
      observer.disconnect();
    };
  }, [gigs.length, hasMore, loadMore]);

  return (
    <div className="gigs-grid">
      {gigs.map(gig => (
        <Gig key={gig.id} gig={gig} />
      ))}

      {hasMore && <div ref={observerRef} className="observer" />}
    </div>
  );
}
