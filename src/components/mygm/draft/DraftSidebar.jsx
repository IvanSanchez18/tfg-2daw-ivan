import { BRANDS } from '../../../utils/myGM';
import { useTranslation } from "react-i18next";
import "./draftSidebar.scss";

const BRAND_COLORS = Object.fromEntries(
  BRANDS.map(b => [b.id, b.color])
);
const ALL_BRANDS = BRANDS.map(b => b.id);

const DraftSidebar = ({ viewingRoster, isDraftFinished, finishedBrands, session, handlePlayerFinish, isPlayerTurn, activeTab, setActiveTab, draftHistory }) => {
  const { t, i18n } = useTranslation("myGM/draft");
  return (
    <aside className="roster-sidebar split-sidebar">
      <div className="sidebar-section my-roster-section">
        <div className="roster-header-actions">
          <h3>{t('draft_sidebar.rosters_title', { count: viewingRoster.length })}</h3>
          {!isDraftFinished && !finishedBrands.includes(session.brand) && (
            <button className="retire-btn" onClick={handlePlayerFinish} disabled={!isPlayerTurn}>
              {t('draft_sidebar.settle_btn')}
            </button>
          )}
        </div>

        <div className="roster-tabs">
          {ALL_BRANDS.map(b => (
            <button
              key={b}
              className={`tab-btn ${activeTab === b ? 'active' : ''}`}
              onClick={() => setActiveTab(b)}
              style={{
                borderBottomColor: activeTab === b ? BRAND_COLORS[b] : 'transparent',
                color: activeTab === b ? BRAND_COLORS[b] : '#aaa'
              }}
            >
              {b.toUpperCase()}
              {b === session?.brand && <i className="fas fa-star" style={{ marginLeft: '4px', fontSize: '0.7rem' }}></i>}
            </button>
          ))}
        </div>

        {viewingRoster.length === 0 ? (
          <p className="empty-roster">{t('draft_sidebar.empty_roster')}</p>
        ) : (
          <ul className="roster-list">
            {viewingRoster.map(w => (
              <li key={w.id}>
                <div className="roster-item-main">
                  <span className="roster-name"><strong>{w.name}</strong></span>
                  <div className="sidebar-meta-tags" style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '4px', fontSize: '0.8rem' }}>
                    <i
                      className={w.gender === 'female' ? "fas fa-venus" : "fas fa-mars"}
                      style={{ color: w.gender === 'female' ? '#e91e63' : '#2196f3' }}
                      title={w.gender === 'female' ? t('draft_sidebar.gender_female') : t('draft_sidebar.gender_male')}
                    ></i>
                    <span className={`alignment-badge ${w.default_alignment.toLowerCase()}`} style={{ padding: '2px 6px', fontSize: '0.7rem', borderRadius: '4px' }}>
                      {w.default_alignment}
                    </span>
                    <span className="sidebar-style-tag" style={{ background: '#eee', color: '#333', padding: '2px 6px', borderRadius: '4px' }}>
                      {w.style}
                    </span>
                  </div>
                </div>
                <small className="pop-indicator" style={{ backgroundColor: BRAND_COLORS[activeTab] || '#555' }}>{w.base_pop} POP</small>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="sidebar-section history-section">
        <h3>{t('draft_sidebar.history_title')}</h3>
        {draftHistory.length === 0 ? (
          <p className="empty-roster">{t('draft_sidebar.history_waiting')}</p>
        ) : (
          <ul className="roster-list history-list">
            {draftHistory.slice().reverse().map((event, idx) => {
              if (event.type === 'finish') {
                return (
                  <li key={idx} className="history-finish-event" style={{ borderColor: BRAND_COLORS[event.brand] }}>
                    <i className="fas fa-flag-checkered"></i>
                    <span dangerouslySetInnerHTML={{ __html: t('draft_sidebar.history_finish', { brand: event.brand.toUpperCase() }) }} />
                  </li>
                );
              }
              if (event.type === 'penalty_remove') {
                return (
                  <li key={idx} className="history-penalty-remove">
                    <i className="fas fa-hand-holding-usd"></i>
                    <span dangerouslySetInnerHTML={{ __html: t('draft_sidebar.history_penalty_remove', { name: event.wrestler.name }) }} />
                  </li>
                );
              }
              if (event.type === 'penalty_add') {
                return (
                  <li key={idx} className="history-penalty-add" style={{ borderLeft: `4px solid ${BRAND_COLORS[event.brand]}` }}>
                    <i className="fas fa-gavel"></i>
                    <span dangerouslySetInnerHTML={{ __html: t('draft_sidebar.history_penalty_add', { name: event.wrestler.name }) }} />
                  </li>
                );
              }
              return (
                <li key={idx} style={{ borderLeft: `4px solid ${BRAND_COLORS[event.brand]}` }}>
                  <div className="roster-item-main">
                    <span className="pick-round">{t('draft_sidebar.history_round', { round: event.round })}</span>
                    <span className="roster-name">{event.wrestler.name}</span>
                    <small style={{ color: BRAND_COLORS[event.brand], fontWeight: 'bold' }}>{event.brand.toUpperCase()}</small>
                  </div>
                  <img src={event.wrestler.image_url} alt="pic" className="pick-mini-img" />
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </aside>
  );
};

export default DraftSidebar;