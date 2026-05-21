import "./draftScouting.scss";

const DraftScouting = ({ suggestions, handlePlayerPick, formatCurrency, calculateWrestlerCost }) => {
  return (
    <div className="scouting-report">
      <h3><i className="fas fa-search-dollar"></i> Sugerencia de Draft</h3>
      <p>Sugerimos buscar un <strong>{suggestions[0].style}</strong> o talento <strong>{suggestions[0].default_alignment}</strong> para equilibrar tu plantilla.</p>
      <div className="suggestions-flex">
        {suggestions.map(sug => (
          <button key={`sug-${sug.id}`} className="suggestion-chip" onClick={() => handlePlayerPick(sug)}>
            <img src={sug.image_url} alt={sug.name} />
            <div className="sug-info">
              <span className="sug-name"><strong>{sug.name}</strong> ({formatCurrency(calculateWrestlerCost(sug.base_pop))})</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default DraftScouting;