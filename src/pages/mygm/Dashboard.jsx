import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LoadingScreen from "../../components/loadingScreen/LoadingScreen";
import GameEndGuard from '../../components/myGM/GameEndGuard';
import { getGameSession, getSessionRoster, setWrestlerAsChampion } from "../../services/myGMService";
import { BRANDS, INJURY_SEVERITY, INJURY_TYPES } from '../../utils/myGM';
import './dashboard.scss';

export const Dashboard = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation('myGM/dashboard');

  const [session, setSession] = useState(null);
  const [roster, setRoster] = useState([]);
  const [loading, setLoading] = useState(true);

  const [missingChampType, setMissingChampType] = useState(null);
  const [isCrowning, setIsCrowning] = useState(false);

  const checkMissingChampions = (currentRoster) => {
    const males = currentRoster.filter(w => w.gender?.toLowerCase().startsWith('m'));
    const females = currentRoster.filter(w => w.gender?.toLowerCase().startsWith('f'));

    const hasMaleChamp = males.some(w => w.is_champion);
    const hasFemaleChamp = females.some(w => w.is_champion);

    if (males.length > 0 && !hasMaleChamp) {
      setMissingChampType('M');
    } else if (females.length > 0 && !hasFemaleChamp) {
      setMissingChampType('F');
    } else {
      setMissingChampType(null);
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const sessionData = await getGameSession(sessionId);
        if (!sessionData) {
          navigate('/mygm', { replace: true });
          return;
        }

        const allRoster = await getSessionRoster(sessionId);
        const myBrandRoster = allRoster.filter(w => w.brand === sessionData.brand);

        setSession(sessionData);
        setRoster(myBrandRoster);

        checkMissingChampions(myBrandRoster);

      } catch (error) {
        console.error("Error cargando el dashboard:", error);
      } finally {
        setTimeout(() => setLoading(false), 500);
      }
    };

    fetchDashboardData();
  }, [sessionId, navigate]);

  const handleSelectChampion = async (targetWrestlerId) => {
    if (isCrowning) return;
    setIsCrowning(true);

    try {
      const wrestler = roster.find(w => w.wrestler_id === targetWrestlerId);
      const newPop = Math.min(100, (wrestler.current_pop || 0) + 20);

      await setWrestlerAsChampion(session.id, targetWrestlerId, newPop);

      const updatedRoster = roster.map(w =>
        w.wrestler_id === targetWrestlerId ? { ...w, is_champion: true, current_pop: newPop } : w
      );

      setRoster(updatedRoster);
      checkMissingChampions(updatedRoster);

    } catch (error) {
      console.error("Error al coronar campeón:", error);
    } finally {
      setIsCrowning(false);
    }
  };

  if (loading || !session) return <LoadingScreen active={loading} />;

  const brandInfo = BRANDS.find(b => b.id === session.brand) || BRANDS[0];
  const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
  const formatNumber = (num) => new Intl.NumberFormat('en-US').format(num);

  const fatiguedWrestlers = roster.filter(w => w.fatigue >= 70);
  const unhappyWrestlers = roster.filter(w => w.morale <= 40);
  const injuredWrestlers = roster.filter(w => w.is_injured);

  const currentWeek = session.week || session.current_week || 1;
  const totalWeeks = session.max_weeks || session.total_weeks || 52;

  const getChampionshipUrl = (wrestler) => {
    const isFemale = wrestler.gender?.toUpperCase().startsWith('F');
    const prefix = isFemale ? 'W' : '';
    return `https://rkncnbzilbfsuqlndvyk.supabase.co/storage/v1/object/public/titles/${prefix}${brandInfo.shortName}.webp`;
  };

  const eligibleWrestlersForChamp = roster.filter(w =>
    missingChampType === 'M' ? w.gender?.toLowerCase().startsWith('m') : w.gender?.toLowerCase().startsWith('f')
  );

  const modalBeltUrl = missingChampType
    ? getChampionshipUrl({ gender: missingChampType === 'M' ? 'Male' : 'Female' })
    : '';

  return (
    <div className="mygm-dashboard-wrapper" style={{ '--dynamic-brand-color': brandInfo.color }}>
      <GameEndGuard session={session} />

      {missingChampType && (
        <div className="champ-modal-overlay">
          <div className="champ-modal-content">
            <div className="champ-modal-header">
              <img src={modalBeltUrl} alt="Cinturón de Campeonato" className="championship-belt-img" />
              <h2>{t('inauguralCrowning')}</h2>
              <p>
                {t('selectChampion', {
                  championType: missingChampType === 'M' ? t('maleChampion') : t('femaleChampion'),
                  brand: brandInfo.name
                })}
              </p>
            </div>

            <div className="champ-selection-wrapper">
              <div className="champ-selection-grid">
                {eligibleWrestlersForChamp.sort((a, b) => b.current_pop - a.current_pop).map(w => (
                  <div key={w.id} className="champ-card" onClick={() => handleSelectChampion(w.wrestler_id)}>
                    <img src={w.image_url} alt={w.name} />
                    <div className="champ-card-info">
                      <h4>{w.name}</h4>
                      <span>POP {w.current_pop}</span>
                    </div>
                    {isCrowning && (
                      <div className="loading-overlay">
                        <i className="fas fa-spinner fa-spin"></i>
                        <span>{t('crowning')}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{ marginBottom: '1rem' }}>
        <button
          onClick={() => navigate('/mygm')}
          style={{
            background: 'var(--bg-card, #1e1e1e)',
            color: 'var(--text-main, #ffffff)',
            border: '1px solid var(--border-soft, #333)',
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: 'bold',
            fontSize: '0.95rem'
          }}
        >
          <i className="fas fa-arrow-left"></i> {t('backToMyGMMenu')}
        </button>
      </div>

      <header className="dashboard-header" style={{ borderBottom: `4px solid var(--dynamic-brand-color)` }}>
        <div className="brand-identity">
          <div className="brand-logo-container">
            <img src={brandInfo.logo} alt={brandInfo.name} className="brand-logo-img" />
          </div>
          <div className="brand-info">
            <h1>{t('operationsCenter')}</h1>
            <p>{t('weekProgress', { current: currentWeek, total: totalWeeks })}</p>
          </div>
        </div>

        <div className="session-stats">
          <div className="stat-box">
            <i className="fas fa-users" style={{ color: '#4caf50' }}></i>
            <div className="stat-info">
              <span>{t('currentFans')}</span>
              <h3>{formatNumber(session.fans || 0)}</h3>
            </div>
          </div>
          <div className="stat-box">
            <i className="fas fa-money-bill-wave" style={{ color: '#81c784' }}></i>
            <div className="stat-info">
              <span>{t('budget')}</span>
              <h3 className={session.budget < 100000 ? 'danger-text' : ''}>
                {formatCurrency(session.budget)}
              </h3>
            </div>
          </div>
        </div>
      </header>

      <div style={{ marginTop: '2rem', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.6rem', margin: 0, color: 'var(--text-main)' }}>{t('weeklyManagement')}</h2>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-main-panel">
          <section className="action-hub">
            <div className="action-grid">
              <button className="action-card book-show-card" onClick={() => navigate(`/mygm/book-show/${session.id}`)}>
                <i className="fas fa-calendar-check"></i>
                <h3>{t('bookShow')}</h3>
                <p>{t('bookShowDesc')}</p>
              </button>

              <button className="action-card roster-card" onClick={() => navigate(`/mygm/roster/${session.id}`)}>
                <i className="fas fa-users-cog"></i>
                <h3>{t('myRoster')}</h3>
                <p>{t('myRosterDesc')}</p>
              </button>

              <button className="action-card free-agents-card" onClick={() => navigate(`/mygm/free-agents/${session.id}`)}>
                <i className="fas fa-handshake"></i>
                <h3>{t('freeAgency')}</h3>
                <p>{t('freeAgencyDesc')}</p>
              </button>

              <button className="action-card standings-card" onClick={() => navigate(`/mygm/standings/${session.id}`)}>
                <i className="fas fa-chart-line"></i>
                <h3>{t('standings')}</h3>
                <p>{t('standingsDesc')}</p>
              </button>

              <button className="action-card logistics-card" onClick={() => navigate(`/mygm/logistics/${session.id}`)}>
                <i className="fas fa-truck-loading"></i>
                <h3>{t('logistics')}</h3>
                <p>{t('logisticsDesc')}</p>
              </button>

              <button className="action-card rivalries-card" onClick={() => navigate(`/mygm/rivalries/${session.id}`)}>
                <i className="fas fa-fire"></i>
                <h3>{t('rivalries')}</h3>
                <p>{t('rivalriesDesc')}</p>
              </button>

              <button className="action-card tagteams-card" onClick={() => navigate(`/mygm/tagteams/${session.id}`)}>
                <i className="fas fa-users"></i>
                <div className="btn-text">
                  <h3>{t('tagTeams')}</h3>
                  <p>{t('tagTeamsDesc')}</p>
                </div>
              </button>

              <button className="action-card" onClick={() => navigate(`/options`)}>
                <i className="fas fa-cog"></i>
                <h3>{t('options')}</h3>
                <p>{t('optionsDesc')}</p>
              </button>
            </div>
          </section>

          {(fatiguedWrestlers.length > 0 || unhappyWrestlers.length > 0 || injuredWrestlers.length > 0) && (
            <section className="alerts-section">
              <h2><i className="fas fa-exclamation-triangle" style={{ color: '#ff9800' }}></i> {t('attentionRequired')}</h2>
              <div className="alerts-container">

                {injuredWrestlers.map(w => {
                  const severityInfo = INJURY_SEVERITY[w.injury_severity];
                  const severityLabel = severityInfo ? t(severityInfo.label) : 'Lesión';

                  const typeKey = INJURY_TYPES[w.injury_type];
                  const typeLabel = typeKey ? t(typeKey) : (w.injury_type || 'Zona no especificada');

                  return (
                    <div key={`injury-${w.id}`} className="alert-item danger" style={{ borderLeftColor: '#f44336' }}>
                      <span>
                        <i className="fas fa-ambulance" style={{ marginRight: '8px', color: '#f44336' }}></i>
                        <strong>{w.name}</strong>{' '}
                        <span style={{ fontWeight: 'bold' }}>
                          {t('injuryAlert', { severity: severityLabel, type: typeLabel })}
                        </span>{' '}
                        {w.days_out > 0
                          ? t('injuryTimeOut', { weeks: w.days_out })
                          : t('injuryIndefinite')
                        }
                      </span>
                    </div>
                  );
                })}

                {fatiguedWrestlers.map(w => (
                  <div key={`fatigue-${w.id}`} className="alert-item warning">
                    <span><strong>{w.name}</strong> {t('fatigueAlert', { fatigue: w.fatigue })}</span>
                  </div>
                ))}

                {unhappyWrestlers.map(w => (
                  <div key={`morale-${w.id}`} className="alert-item danger">
                    <span><strong>{w.name}</strong> {t('unhappyAlert', { morale: w.morale })}</span>
                  </div>
                ))}

              </div>
            </section>
          )}
        </div>

        <aside className="dashboard-sidebar">
          <div className="sidebar-header">
            <h3>{t('topSuperstars')}</h3>
            <span className="roster-count">{t('talentsCount', { count: roster.length })}</span>
          </div>

          <div className="roster-preview-list">
            {roster.sort((a, b) => b.current_pop - a.current_pop).slice(0, 5).map((w, index) => {
              const alignmentKey = w.alignment ? `align_${w.alignment.toLowerCase()}` : '';
              const translatedAlignment = alignmentKey ? t(alignmentKey) : w.alignment;

              return (
                <div key={w.id} className="preview-card" style={{ position: 'relative' }}>
                  <div className="rank-number">{index + 1}</div>
                  <img src={w.image_url} alt={w.name} className="preview-avatar" />
                  <div className="preview-info">
                    <h4>{w.name}</h4>
                    <div className="preview-stats">
                      <span className="pop-badge">POP: {w.current_pop}</span>
                      <span className={`alignment-text ${w.alignment?.toLowerCase()}`}>
                        {translatedAlignment}
                      </span>
                    </div>
                  </div>

                  {w.is_champion && (
                    <img
                      src={getChampionshipUrl(w)}
                      alt="Campeón"
                      className="preview-champion-belt"
                    />
                  )}
                </div>
              );
            })}
          </div>

          {roster.length > 5 && (
            <button className="view-all-btn" onClick={() => navigate(`/mygm/roster/${session.id}`)}>
              {t('viewFullRoster')}
            </button>
          )}
        </aside>
      </div>
    </div>
  );
};

export default Dashboard;