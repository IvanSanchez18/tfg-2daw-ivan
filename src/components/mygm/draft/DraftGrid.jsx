import "./draftGrid.scss";

const DraftGrid = ({ filteredWrestlers, session, isPlayerTurn, handlePlayerPick, formatCurrency, calculateWrestlerCost }) => {
  return (
    <div className={`wrestlers-grid ${!isPlayerTurn ? 'disabled-grid' : ''}`}>
      {filteredWrestlers.map(wrestler => {
        const cost = calculateWrestlerCost(wrestler.base_pop);
        const canAfford = session.budget >= cost;
        return (
          <div key={wrestler.id} className={`wrestler-card ${(!canAfford || !isPlayerTurn) ? 'cannot-afford' : ''}`}>
            <div className="wrestler-image-container">
              <img src={wrestler.image_url} alt={wrestler.name} />
              <span className={`alignment-badge ${wrestler.default_alignment.toLowerCase()}`}>{wrestler.default_alignment}</span>
            </div>
            <div className="wrestler-info">
              <h3>{wrestler.name}</h3>
              <div className="stats-row">
                <span>Pop: <strong>{wrestler.base_pop}</strong></span>
                <div className="meta-info">
                  <i className={wrestler.gender === 'female' ? "fas fa-venus female-icon" : "fas fa-mars male-icon"}></i>
                  <span className="style-tag">{wrestler.style}</span>
                </div>
              </div>
              <button onClick={() => handlePlayerPick(wrestler)} disabled={!canAfford || !isPlayerTurn} className="draft-btn">
                {isPlayerTurn ? (canAfford ? `Fichar ${formatCurrency(cost)}` : 'Sin fondos') : 'Esperando turno...'}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DraftGrid;