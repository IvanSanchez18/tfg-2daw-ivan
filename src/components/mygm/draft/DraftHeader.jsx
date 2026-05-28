import { BRANDS } from '../../../utils/myGM';
import { useTranslation } from "react-i18next";
import "./draftHeader.scss";

const BRAND_COLORS = Object.fromEntries(
  BRANDS.map(b => [b.id, b.color])
);

const DraftHeader = ({ isDraftFinished, currentRound, activeDraftBrand, isPlayerTurn, draftOrder, currentTurnIndex, finishedBrands, session, formatCurrency }) => {
  const { t, i18n } = useTranslation("myGM/draft");
  return (
    <header className="draft-header">
      <div className="draft-status-board">
        <h2>
          {isDraftFinished
            ? t('draft_header.completed')
            : t('draft_header.round_label', { round: currentRound })}
        </h2>
        <div className="turn-indicator">
          {isDraftFinished ? (
            <span className="draft-over-text">{t('draft_header.all_brands_finished')}</span>
          ) : (
            <span className="turn-text" style={{ color: BRAND_COLORS[activeDraftBrand] }}>
              {t('draft_header.turn_of')} <strong>{activeDraftBrand?.toUpperCase()}</strong>
              {!isPlayerTurn && <span className="cpu-thinking">{t('draft_header.cpu_thinking')}</span>}
            </span>
          )}
        </div>
      </div>

      <div className="draft-order-bar">
        {draftOrder.map((brand, index) => {
          const isFinished = finishedBrands.includes(brand);
          return (
            <div key={brand} className={`order-slot ${index === currentTurnIndex && !isDraftFinished ? 'active-slot' : ''} ${isFinished ? 'finished-slot' : ''}`} style={{ borderColor: isFinished ? '#444' : BRAND_COLORS[brand] }}>
              <span style={{ color: isFinished ? '#666' : BRAND_COLORS[brand], textDecoration: isFinished ? 'line-through' : 'none' }}>
                {brand.toUpperCase()}
              </span>
            </div>
          );
        })}
      </div>

      <div className="budget-display">
        <span>{t('draft_header.your_budget')}</span>
        <h2 className={session.budget < 200000 ? 'danger' : ''}>{formatCurrency(session.budget)}</h2>
      </div>
    </header>
  );
};

export default DraftHeader;