import React from 'react';

const StarDisplay = ({ rating, active }) => {
  if (!active) return <div className="stars-placeholder"></div>;

  const stars = [];
  for (let i = 1; i <= 5; i++) {
    const delay = `${i * 0.1}s`;
    let starType = rating >= i ? "full" : rating >= i - 0.5 ? "half" : "empty";

    stars.push(
      <span key={i} className={`star ${starType}`} style={{ animationDelay: delay }}>
        ★
      </span>
    );
  }

  return (
    <div className="stars-active">
      {stars}
      <span className="rating-number ml-2 text-xl" style={{ animationDelay: '0.6s' }}>
        ({rating})
      </span>
    </div>
  );
};

export default StarDisplay;