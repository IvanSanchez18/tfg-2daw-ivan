import "./healthBar.scss"

const HealthBar = ({ name, img, health, flip }) => {
  const percentage = (health / 10) * 100;

  return (
    <div className="sf-health-container">
      <div className="sf-header">
        <span className="sf-name">{name}</span>
      </div>

      <div className="sf-bar-wrapper">
        <div className="sf-bar-bg">
          <div
            className="sf-bar-fill"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>

      <img src={img} alt={name} className="sf-char-img" style={{ transform: flip ? "scaleX(-1)" : "none" }} />
    </div>
  );
};

export default HealthBar;