import { ALIGNMENTS, STYLES } from '../../../utils/myGM';
import { useTranslation } from "react-i18next";
import "./draftGrid.scss";

const DraftGrid = ({ filteredWrestlers, session, isPlayerTurn, handlePlayerPick, formatCurrency, calculateWrestlerCost }) => {
  const { t, i18n } = useTranslation("myGM/draft");

  return (
    <div className={`wrestlers-grid ${!isPlayerTurn ? 'disabled-grid' : ''}`}>
      {filteredWrestlers.map(wrestler => {
        const cost = calculateWrestlerCost(wrestler.base_pop);
        const canAfford = session.budget >= cost;

        const alignmentLabel = ALIGNMENTS.find(a => a.id === wrestler.default_alignment)?.label;
        const styleLabel = STYLES.find(s => s.id === wrestler.style)?.label;

        return (
          <div key={wrestler.id} className={`wrestler-card ${(!canAfford || !isPlayerTurn) ? 'cannot-afford' : ''}`}>
            <div className="wrestler-image-container">
              <img src={wrestler.image_url} alt={wrestler.name} />
              <span className={`alignment-badge ${wrestler.default_alignment.toLowerCase()}`}>
                {alignmentLabel ? t(alignmentLabel) : wrestler.default_alignment}
              </span>
            </div>
            <div className="wrestler-info">
              <h3>{wrestler.name}</h3>
              <div className="stats-row">
                <span>{t('draft_grid.pop_label')} <strong>{wrestler.base_pop}</strong></span>
                <div className="meta-info">
                  <i className={wrestler.gender === 'female' ? "fas fa-venus female-icon" : "fas fa-mars male-icon"}></i>
                  <span className="style-tag">
                    {styleLabel ? t(styleLabel) : wrestler.style}
                  </span>
                </div>
              </div>
              <button onClick={() => handlePlayerPick(wrestler)} disabled={!canAfford || !isPlayerTurn} className="draft-btn">
                {isPlayerTurn ? (
                  canAfford
                    ? t('draft_grid.sign_wrestler', { cost: formatCurrency(cost) })
                    : t('draft_grid.out_of_funds')
                ) : (
                  t('draft_grid.waiting_turn')
                )}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DraftGrid;