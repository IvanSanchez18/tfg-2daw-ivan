import { BRANDS } from '../../../utils/myGM';
import "./draftHeader.scss";

const BRAND_COLORS = Object.fromEntries(
  BRANDS.map(b => [b.id, b.color])
);

const DraftHeader = ({ isDraftFinished, currentRound, activeDraftBrand, isPlayerTurn, draftOrder, currentTurnIndex, finishedBrands, session, formatCurrency }) => {
  return (
    <header className="draft-header">
      <div className="draft-status-board">
        <h2>{isDraftFinished ? 'Draft Concluido' : `Ronda ${currentRound}`}</h2>
        <div className="turn-indicator">
          {isDraftFinished ? (
            <span className="draft-over-text">TODAS LAS MARCAS HAN FINALIZADO</span>
          ) : (
            <span className="turn-text" style={{ color: BRAND_COLORS[activeDraftBrand] }}>
              Turno de: <strong>{activeDraftBrand?.toUpperCase()}</strong>
              {!isPlayerTurn && <span className="cpu-thinking"> (Pensando...)</span>}
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
        <span>Tu Presupuesto</span>
        <h2 className={session.budget < 200000 ? 'danger' : ''}>{formatCurrency(session.budget)}</h2>
      </div>
    </header>
  );
};

export default DraftHeader;