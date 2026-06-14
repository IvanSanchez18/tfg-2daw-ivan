import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LoadingScreen from "../../components/loadingScreen/LoadingScreen";
import GameEndGuard from '../../components/myGM/GameEndGuard';
import { getGameSession, getAvailableWrestlers, getSessionRoster, calculateWrestlerCostFreeAgent, draftWrestler } from '../../services/myGMService';
import { ALIGNMENTS, GENDERS, STYLES } from '../../utils/myGM';
import './freeAgents.scss';

export const FreeAgents = () => {
  const { t } = useTranslation("myGM/freeAgents");
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [freeAgents, setFreeAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [signingId, setSigningId] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [genderFilter, setGenderFilter] = useState('all');
  const [alignmentFilter, setAlignmentFilter] = useState('all');

  const [visibleCount, setVisibleCount] = useState(12);
  const observer = useRef();

  const lastElementRef = useCallback(node => {
    if (loading) return;

    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        setVisibleCount(prev => prev + 12);
      }
    }, { threshold: 0.1 });

    if (node) observer.current.observe(node);
  }, [loading]);

  useEffect(() => {
    setVisibleCount(12);
  }, [searchTerm, genderFilter, alignmentFilter]);

  useEffect(() => {
    const fetchFreeAgents = async () => {
      try {
        const sessionData = await getGameSession(sessionId);
        if (!sessionData) {
          navigate('/mygm', { replace: true });
          return;
        }
        setSession(sessionData);

        const [allWrestlers, hiredRoster] = await Promise.all([
          getAvailableWrestlers(),
          getSessionRoster(sessionId)
        ]);

        const hiredWrestlerIds = hiredRoster.map(r => r.wrestler_id);
        const availableAgents = allWrestlers.filter(w => !hiredWrestlerIds.includes(w.id));

        setFreeAgents(availableAgents);
      } catch (error) {
        console.error("Error cargando la agencia libre:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFreeAgents();
  }, [sessionId, navigate]);

  const handleSignWrestler = async (wrestler) => {
    const cost = calculateWrestlerCostFreeAgent(wrestler.base_pop);

    if (session.budget < cost) {
      alert(t('alerts.insufficientBudget'));
      return;
    }

    setSigningId(wrestler.id);

    try {
      const newBudget = await draftWrestler(
        session.id,
        wrestler.id,
        cost,
        session.budget,
        wrestler.default_alignment || 'Face',
        session.brand,
        wrestler.base_pop
      );

      setSession({ ...session, budget: newBudget });
      setFreeAgents(prev => prev.filter(w => w.id !== wrestler.id));

    } catch (error) {
      console.error("Error al fichar al agente libre:", error);
      alert(t('alerts.errorContract'));
    } finally {
      setSigningId(null);
    }
  };

  const filteredAgents = freeAgents.filter(wrestler => {
    const matchesSearch = wrestler.name.toLowerCase().includes(searchTerm.toLowerCase());

    const wGender = wrestler.gender ? wrestler.gender.toLowerCase() : 'male';
    const matchesGender = genderFilter === 'all' || wGender === genderFilter;

    const wAlignment = wrestler.default_alignment ? wrestler.default_alignment : 'Face';
    const matchesAlignment = alignmentFilter === 'all' || wAlignment === alignmentFilter;

    return matchesSearch && matchesGender && matchesAlignment;
  });

  const visibleAgents = filteredAgents.slice(0, visibleCount);

  if (loading || !session) return <LoadingScreen active={loading} />;

  const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);

  return (
    <>
      <GameEndGuard session={session} />
      <div className="free-agents-wrapper">
        <div className="top-bar">
          <button className="back-btn" onClick={() => navigate(`/mygm/dashboard/${session.id}`)}>
            <i className="fas fa-arrow-left"></i> {t('header.back')}
          </button>

          <div className="budget-display">
            <span>{t('header.remainingBudget')}</span>
            <h3 className={session.budget < 500000 ? 'danger-text' : ''}>
              {formatCurrency(session.budget)}
            </h3>
          </div>
        </div>

        <header className="fa-header">
          <h1>{t('header.title')}</h1>
          <p>{t('header.subtitle', { brand: session.brand.toUpperCase() })}</p>
        </header>

        <div className="filters-bar">
          <div className="filter-group search-group">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder={t('filters.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <select value={genderFilter} onChange={(e) => setGenderFilter(e.target.value)}>
              <option value="all">{t('filters.allGenders')}</option>
              {GENDERS.map(g => (
                <option key={g.id} value={g.id}>{t(g.label)}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <select value={alignmentFilter} onChange={(e) => setAlignmentFilter(e.target.value)}>
              <option value="all">{t('filters.allAlignments')}</option>
              {ALIGNMENTS.map(a => (
                <option key={a.id} value={a.id}>{t(a.label)}</option>
              ))}
            </select>
          </div>
        </div>

        {filteredAgents.length === 0 ? (
          <div className="no-agents-msg">
            <i className="fas fa-ghost"></i>
            <h3>{t('noAgents.title')}</h3>
            <p>{t('noAgents.description')}</p>
          </div>
        ) : (
          <div className="agents-grid">
            {visibleAgents.map(wrestler => {
              const cost = calculateWrestlerCostFreeAgent(wrestler.base_pop);
              const canAfford = session.budget >= cost;
              const isSigning = signingId === wrestler.id;

              const alignmentObj = ALIGNMENTS.find(a => a.id === wrestler.default_alignment) || ALIGNMENTS[0];
              const styleObj = STYLES.find(s => s.id === wrestler.style) || STYLES[2];
              const isFemale = wrestler.gender === 'female';

              return (
                <div key={wrestler.id} className={`agent-card ${!canAfford ? 'cannot-afford' : ''}`}>
                  <div className="agent-image-container">
                    <img src={wrestler.image_url} alt={wrestler.name} />
                    <span className={`alignment-badge ${alignmentObj.id.toLowerCase()}`}>
                      {t(alignmentObj.label)}
                    </span>
                  </div>

                  <div className="agent-info">
                    <div className="agent-title-row">
                      <h4>{wrestler.name}</h4>
                      {isFemale ? (
                        <i className="fas fa-venus gender-icon female" title={t('gender_female')}></i>
                      ) : (
                        <i className="fas fa-mars gender-icon male" title={t('gender_male')}></i>
                      )}
                    </div>

                    <div className="agent-stats">
                      <span className="pop-stat">POP: {wrestler.base_pop}</span>
                      <span className="style-stat">{t(styleObj.label)}</span>
                    </div>
                    <div className="agent-cost">
                      {formatCurrency(cost)}
                    </div>
                  </div>

                  <button
                    className="sign-btn"
                    disabled={!canAfford || isSigning || signingId !== null}
                    onClick={() => handleSignWrestler(wrestler)}
                  >
                    {isSigning ? (
                      <><i className="fas fa-spinner fa-spin"></i> {t('buttons.signing')}</>
                    ) : canAfford ? (
                      <><i className="fas fa-file-signature"></i> {t('buttons.sign')}</>
                    ) : (
                      <><i className="fas fa-lock"></i> {t('buttons.noBudget')}</>
                    )}
                  </button>
                </div>
              );
            })}

            {visibleCount < filteredAgents.length && (
              <div
                ref={lastElementRef}
                style={{ height: '20px', gridColumn: '1 / -1' }}
              />
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default FreeAgents;