// components/Gigs.jsx
import Gig from "./Gig";
import "./gigs.css";

export default function Gigs({ gigs }) {
  if (!Array.isArray(gigs)) return <div>No gigs yet</div>;

  return (
    <div className="gigs-grid">
      {gigs.map(gig => (
        <Gig key={gig.id} gig={gig} />
      ))}
    </div>
  );
}
