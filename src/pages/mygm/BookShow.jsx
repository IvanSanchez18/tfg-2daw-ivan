import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getGameSession, getSessionRoster, getRivalries, getActiveTagTeams, saveShow } from "../../services/myGMService";
import LoadingScreen from "../../components/loadingScreen/LoadingScreen";
import GameEndGuard from '../../components/myGM/GameEndGuard';
import Swal from 'sweetalert2';
import { BRANDS, STYLES, MATCH_CATEGORIES, STIPULATIONS, PROMO_TYPES, ALIGNMENTS } from '../../utils/myGM';
import './bookshow.scss';

export const BookShow = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation('myGM/bookShow');

  const [session, setSession] = useState(null);
  const [roster, setRoster] = useState([]);
  const [rivalries, setRivalries] = useState([]);
  const [tagTeams, setTagTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [card, setCard] = useState([
    { id: 1, type: 'match', mandatory: true, category: '1v1', stipulation: 'Normal', isTitleMatch: false, title: t('opener'), participants: [] },
    { id: 2, type: 'match', mandatory: true, category: '1v1', stipulation: 'Normal', isTitleMatch: false, title: t('midcard'), participants: [] },
    { id: 3, type: 'match', mandatory: true, category: '1v1', stipulation: 'Normal', isTitleMatch: false, title: t('coMainEvent'), participants: [] },
    { id: 4, type: 'match', mandatory: true, category: '1v1', stipulation: 'Normal', isTitleMatch: false, title: t('mainEvent'), participants: [] },
    { id: 5, type: 'promo', mandatory: false, category: 'promo', promoType: 'self', title: t('promo1'), participants: [] },
    { id: 6, type: 'promo', mandatory: false, category: 'promo', promoType: 'self', title: t('promo2'), participants: [] },
    { id: 7, type: 'promo', mandatory: false, category: 'promo', promoType: 'self', title: t('promo3'), participants: [] },
  ]);

  const [activeSlot, setActiveSlot] = useState(null);
  const [tempParticipants, setTempParticipants] = useState([]);
  const [tempCategory, setTempCategory] = useState('1v1');
  const [tempStipulation, setTempStipulation] = useState('Normal');
  const [tempIsTitleMatch, setTempIsTitleMatch] = useState(false);
  const [tempPromoType, setTempPromoType] = useState('self');
  const [tempTargetBrand, setTempTargetBrand] = useState('');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [sessionData, rosterData, rivalriesData, teamsData] = await Promise.all([
          getGameSession(sessionId),
          getSessionRoster(sessionId),
          getRivalries ? getRivalries(sessionId) : [],
          getActiveTagTeams(sessionId)
        ]);

        setSession(sessionData);
        setRoster(rosterData.filter(w => !w.is_injured && (!sessionData.brand || w.brand === sessionData.brand)));
        setRivalries(rivalriesData || []);
        setTagTeams(teamsData || []);
      } catch (error) {
        console.error("Error cargando datos:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [sessionId]);

  const getWrestlerTeam = (wrestlerId, rosterId) => {
    if (!tagTeams || tagTeams.length === 0) return null;
    return tagTeams.find(t =>
      t.wrestler1_id === wrestlerId || t.wrestler2_id === wrestlerId ||
      t.wrestler1_id === rosterId || t.wrestler2_id === rosterId
    );
  };

  const busyWrestlers = card
    .filter(slot => slot.id !== activeSlot?.id)
    .flatMap(slot => slot.participants.map(p => p.roster_id));

  const availableCount = roster.length - busyWrestlers.length;
  const getWrestler = (rosterId) => roster.find(w => w.id === rosterId);

  const getRivalryInfo = (wrestlerId) => {
    const riv = rivalries.find(r => r.is_active && (r.wrestler1_id === wrestlerId || r.wrestler2_id === wrestlerId));
    if (!riv) return null;
    const opponentId = riv.wrestler1_id === wrestlerId ? riv.wrestler2_id : riv.wrestler1_id;
    const opponent = roster.find(r => r.wrestler_id === opponentId);
    return { level: riv.level, opponentName: opponent?.name || "???" };
  };

  const getMaxLimit = () => {
    if (!activeSlot) return 1;
    if (activeSlot.type === 'match') return MATCH_CATEGORIES[tempCategory].max;
    return tempPromoType === 'taunt' ? 2 : 1;
  };

  const openModal = (slot) => {
    setActiveSlot(slot);
    setTempParticipants([...slot.participants]);
    if (slot.type === 'match') {
      setTempCategory(slot.category || '1v1');
      setTempStipulation(slot.stipulation || 'Normal');
      setTempIsTitleMatch(slot.isTitleMatch || false);
    } else {
      setTempPromoType(slot.promoType || 'self');
      setTempTargetBrand(slot.targetBrand || '');
    }
  };

  const closeModal = () => {
    setActiveSlot(null);
    setTempParticipants([]);
  };

  const handleCategoryChange = (e) => {
    const newCategory = e.target.value;
    setTempCategory(newCategory);
    setTempParticipants([]);

    if (newCategory === '2v2') {
      setTempIsTitleMatch(false);
    }
  }

  const handlePromoTypeChange = (e) => {
    const newType = e.target.value;
    setTempPromoType(newType);
    if (newType !== 'taunt' && tempParticipants.length > 1) {
      setTempParticipants([tempParticipants[0]]);
    }
  };

  const toggleWrestler = (rItem) => {
    const isAlreadySelected = tempParticipants.some(p => p.roster_id === rItem.id);

    if (isAlreadySelected) {
      setTempParticipants(tempParticipants.filter(p => p.roster_id !== rItem.id));
    } else {
      const maxLimit = getMaxLimit();
      if (tempParticipants.length >= maxLimit) return;

      const isMatch = activeSlot.type === 'match';
      const isTaunt = activeSlot.type === 'promo' && tempPromoType === 'taunt';

      if ((isMatch || isTaunt) && tempParticipants.length > 0) {
        const firstWrestler = getWrestler(tempParticipants[0].roster_id);
        if (firstWrestler.gender !== rItem.gender) {
          const gender1 = rItem.gender === 'male' ? t('male') : t('female');
          const gender2 = firstWrestler.gender === 'male' ? t('males') : t('females');

          Swal.fire({
            icon: 'warning',
            title: t('genderRuleTitle'),
            text: t('genderRuleText', { name: rItem.name, gender1, gender2 }),
            confirmButtonColor: '#d33',
            background: 'var(--bg-card)',
            color: 'var(--text-main)'
          });
          return;
        }
      }

      setTempParticipants([...tempParticipants, { roster_id: rItem.id, role: 'competitor' }]);
    }
  };

  const confirmSegment = () => {
    let segmentCost = 0;

    if (activeSlot.type === 'match') {
      const stipInfo = STIPULATIONS.find(s => s.id === tempStipulation);
      segmentCost = stipInfo ? stipInfo.cost : 0;

      if (tempIsTitleMatch) {
        const hasChampion = tempParticipants.some(p => {
          const wrestler = getWrestler(p.roster_id);
          return wrestler && wrestler.is_champion;
        });

        if (!hasChampion) {
          Swal.fire({
            icon: 'error',
            title: t('noChampionTitle'),
            text: t('noChampionText'),
            confirmButtonColor: '#d33',
            background: 'var(--bg-card)',
            color: 'var(--text-main)'
          });
          return;
        }
      }

    } else if (activeSlot.type === 'promo') {
      const promoInfo = PROMO_TYPES.find(p => p.id === tempPromoType);
      segmentCost = promoInfo ? promoInfo.cost : 0;

      if (tempPromoType === 'invasion' && !tempTargetBrand) {
        Swal.fire({
          icon: 'warning', title: t('targetBrandRequiredTitle'),
          text: t('targetBrandRequiredText'),
          confirmButtonColor: '#d33', background: 'var(--bg-card)', color: 'var(--text-main)'
        });
        return;
      }
    }

    if (segmentCost > 0 && session.budget < segmentCost) {
      Swal.fire({
        icon: 'error', title: t('insufficientFundsTitle'),
        text: t('insufficientFundsText', { cost: segmentCost.toLocaleString(), budget: session.budget.toLocaleString() }),
        confirmButtonColor: '#d33', background: 'var(--bg-card)', color: 'var(--text-main)'
      });
      return;
    }

    const mappedParticipants = tempParticipants.map((p, idx) => {
      let team = 1;
      if (tempCategory === '1v1') team = idx + 1;
      if (tempCategory === '2v2') team = idx < 2 ? 1 : 2;
      if (tempCategory === 'triple_threat') team = idx + 1;
      if (tempCategory === 'fatal_4_way') team = idx + 1;
      if (activeSlot.type === 'promo') team = idx + 1;
      return { ...p, team };
    });

    const isMatch = activeSlot.type === 'match';

    const promoTypeObj = PROMO_TYPES.find(p => p.id === tempPromoType);
    const promoLabel = promoTypeObj ? t(promoTypeObj.label) : '';

    const stipObj = STIPULATIONS.find(s => s.id === tempStipulation);
    const stipLabel = isMatch && stipObj ? t(stipObj.label) : '';

    const matchCategoryLabel = t(MATCH_CATEGORIES[tempCategory].label);
    const titleTag = isMatch && tempIsTitleMatch ? `(${t('forTheChampionship')})` : '';

    setCard(prev => prev.map(slot =>
      slot.id === activeSlot.id ? {
        ...slot,
        participants: mappedParticipants,
        category: isMatch ? tempCategory : 'promo',
        stipulation: isMatch ? tempStipulation : tempPromoType,
        isTitleMatch: isMatch ? tempIsTitleMatch : false,
        promoType: isMatch ? null : tempPromoType,
        targetBrand: isMatch ? null : (tempPromoType === 'invasion' ? tempTargetBrand : null),
        cost: segmentCost,
        matchType: isMatch
          ? `${matchCategoryLabel} - ${stipLabel}${titleTag}`
          : (tempPromoType === 'invasion' ? t('invasionTo', { brand: tempTargetBrand }) : t('promoPrefix', { promo: promoLabel }))
      } : slot
    ));
    closeModal();
  };

  const clearSegment = (id, e) => {
    e.stopPropagation();
    setCard(prev => prev.map(slot =>
      slot.id === id ? { ...slot, participants: [], promoType: 'self', isTitleMatch: false } : slot
    ));
  };

  const handleBookShow = async () => {
    const mandatoryIncomplete = card.filter(s => s.mandatory).some(s => s.participants.length < MATCH_CATEGORIES[s.category].max);
    if (mandatoryIncomplete) {
      Swal.fire({
        icon: 'error', title: t('incompleteCardTitle'),
        text: t('incompleteCardText'),
        confirmButtonColor: '#d33', background: 'var(--bg-card)', color: 'var(--text-main)'
      });
      return;
    }

    const segmentsToSave = card
      .filter(slot => slot.participants.length > 0)
      .map((slot, index) => ({
        segment_type: slot.type,
        match_type: slot.matchType,
        promo_type: slot.promoType,
        target_brand: slot.targetBrand,
        is_title_match: slot.isTitleMatch,
        cost: slot.cost || 0,
        card_position: index + 1,
        participants: slot.participants
      }));

    setIsSaving(true);
    try {
      await saveShow(sessionId, session.brand, session.week, segmentsToSave);
      Swal.fire({ icon: 'success', title: t('showConfirmedTitle'), text: t('showConfirmedText'), timer: 2000, showConfirmButton: false, background: 'var(--bg-card)', color: 'var(--text-main)' });
      navigate(`/mygm/run-show/${sessionId}`);
    } catch (error) {
      console.error("Error al guardar:", error);
      Swal.fire({ icon: 'error', title: t('errorTitle'), text: t('errorSavingCardText'), confirmButtonColor: '#d33', background: 'var(--bg-card)', color: 'var(--text-main)' });
    } finally {
      setIsSaving(false);
    }
  };

  const renderTeam = (teamParticipants) => {
    if (teamParticipants.length === 0) return null;
    const firstRoster = getWrestler(teamParticipants[0].roster_id);
    const teamInfo = firstRoster ? getWrestlerTeam(firstRoster.wrestler_id, firstRoster.id) : null;

    const isRealTagTeam = teamParticipants.length > 1 && teamInfo &&
      teamParticipants.every(p => {
        const r = getWrestler(p.roster_id);
        return r && (teamInfo.wrestler1_id === r.wrestler_id || teamInfo.wrestler2_id === r.wrestler_id ||
          teamInfo.wrestler1_id === r.id || teamInfo.wrestler2_id === r.id);
      });

    const teamNameDisplay = teamInfo?.name || teamInfo?.team_name || 'Tag Team';

    return (
      <div className="team-container">
        {isRealTagTeam && (
          <div className="team-name-badge">
            <i className="fas fa-users"></i> {teamNameDisplay}
          </div>
        )}
        <div className="team">
          {teamParticipants.map(p => (
            <div key={p.roster_id} className="wrestler-avatar">
              <img src={getWrestler(p.roster_id)?.image_url} alt="w" />
              <span>{getWrestler(p.roster_id)?.name}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading || !session) return <LoadingScreen active={loading} />;

  const getChampionshipUrl = (wrestler) => {
    const brand = BRANDS.find(b => b.id === session.brand) || BRANDS[0];
    const isFemale = wrestler.gender?.toUpperCase().startsWith('F');
    const prefix = isFemale ? 'W' : '';
    return `https://rkncnbzilbfsuqlndvyk.supabase.co/storage/v1/object/public/titles/${prefix}${brand.shortName}.webp`;
  };

  return (
    <div className="book-show-page" data-brand={session.brand}>
      <GameEndGuard session={session} />
      <header className="page-header">
        <button onClick={() => navigate(`/mygm/dashboard/${sessionId}`)} className="btn-back">
          <i className="fas fa-arrow-left"></i> {t('back')}
        </button>
        <div className="title-area">
          <h1>{t('weekCardTitle', { week: session.week })}</h1>
          <p>{t('budgetLabel')} <span>${session.budget?.toLocaleString()}</span></p>
        </div>
      </header>

      <div className="card-builder-container">
        <section className="booking-section">
          <h2><i className="fas fa-trophy"></i> {t('mandatoryMatches')}</h2>
          <div className="segments-grid matches-grid">
            {card.filter(s => s.type === 'match').map(slot => {
              const maxLimit = MATCH_CATEGORIES[slot.category].max;
              const isFilled = slot.participants.length === maxLimit;
              const team1 = slot.participants.filter(p => p.team === 1);
              const team2 = slot.participants.filter(p => p.team === 2);
              const team3 = slot.participants.filter(p => p.team === 3);
              const team4 = slot.participants.filter(p => p.team === 4);

              return (
                <div key={slot.id} className={`segment-card ${isFilled ? 'filled' : 'empty'}`} onClick={() => openModal(slot)}>
                  <div className="segment-header">
                    <h3>{slot.title}</h3>
                    {slot.participants.length > 0 && (
                      <button className="clear-btn" onClick={(e) => clearSegment(slot.id, e)}><i className="fas fa-times"></i></button>
                    )}
                  </div>
                  {isFilled ? (
                    <div className="booked-summary">
                      <p className={`stipulation-tag ${slot.isTitleMatch ? 'title-tag' : ''}`}>
                        {slot.matchType}
                      </p>
                      <div className="match-layout">
                        {(slot.category === '1v1' || slot.category === '2v2') && (
                          <>
                            {renderTeam(team1)}
                            <div className="vs-badge">VS</div>
                            {renderTeam(team2)}
                          </>
                        )}
                        {slot.category === 'triple_threat' && (
                          <>
                            {renderTeam(team1)}
                            <span className="vs-mini">VS</span>
                            {renderTeam(team2)}
                            <span className="vs-mini">VS</span>
                            {renderTeam(team3)}
                          </>
                        )}
                        {slot.category === 'fatal_4_way' && (
                          <div className="fatal-4-grid">
                            {renderTeam(team1)}
                            {renderTeam(team2)}
                            {renderTeam(team3)}
                            {renderTeam(team4)}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="empty-state"><i className="fas fa-plus-circle"></i><p>{t('bookMatch')}</p></div>
                  )}
                </div>
              )
            })}
          </div>
        </section>

        <section className="booking-section optional-section">
          <h2><i className="fas fa-microphone"></i> {t('optionalPromos')}</h2>
          <div className="segments-grid promos-grid">
            {card.filter(s => s.type === 'promo').map(slot => {
              const isTaunt = slot.promoType === 'taunt';
              const reqLimit = isTaunt ? 2 : 1;
              const isFilled = slot.participants.length === reqLimit;

              return (
                <div key={slot.id} className={`segment-card promo-card ${isFilled ? 'filled' : 'empty'}`} onClick={() => openModal(slot)}>
                  <div className="segment-header">
                    <h3>{slot.title}</h3>
                    {slot.participants.length > 0 && (
                      <button className="clear-btn" onClick={(e) => clearSegment(slot.id, e)}><i className="fas fa-times"></i></button>
                    )}
                  </div>
                  {isFilled ? (
                    <div className="promo-display booked-summary">
                      <p className="stipulation-tag">{slot.matchType}</p>
                      <div className="match-layout">
                        {isTaunt && slot.participants.length === 2 ? (
                          <>
                            <div className="wrestler-avatar promo-avatar">
                              <img src={getWrestler(slot.participants[0].roster_id)?.image_url} alt={t('instigator')} />
                              <span>{getWrestler(slot.participants[0].roster_id)?.name}</span>
                            </div>
                            <div className="vs-mini provocation-text">{t('taunts')}</div>
                            <div className="wrestler-avatar promo-avatar target">
                              <img src={getWrestler(slot.participants[1].roster_id)?.image_url} alt={t('target')} />
                              <span>{getWrestler(slot.participants[1].roster_id)?.name}</span>
                            </div>
                          </>
                        ) : (
                          <div className="wrestler-avatar promo-avatar">
                            <img src={getWrestler(slot.participants[0].roster_id)?.image_url} alt="Promo" />
                            <span>{getWrestler(slot.participants[0].roster_id)?.name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="empty-state"><i className="fas fa-plus-circle"></i><p>{t('bookPromo')}</p></div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <div className="actions-footer">
        <button className="btn-confirm" onClick={handleBookShow} disabled={isSaving}>
          {isSaving ? t('generating') : t('confirmCard')}
        </button>
      </div>

      {activeSlot && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{t('configureTitle', { title: activeSlot.title })}</h2>
              <button onClick={closeModal} className="close-btn"><i className="fas fa-times"></i></button>
            </div>

            <div className="modal-body">
              <div className="settings-container">
                {activeSlot.type === 'match' ? (
                  <div className="match-settings responsive-settings">
                    <div className="setting-group">
                      <label>{t('matchTypeLabel')}</label>
                      <select value={tempCategory} onChange={handleCategoryChange}>
                        {Object.entries(MATCH_CATEGORIES).map(([key, val]) => (
                          <option key={key} value={key}>{t(val.label)}</option>
                        ))}
                      </select>
                    </div>

                    <div className="setting-group">
                      <label>{t('stipulationLabel')}</label>
                      <select value={tempStipulation} onChange={(e) => setTempStipulation(e.target.value)}>
                        {STIPULATIONS.map(stip => (
                          <option key={stip.id} value={stip.id}>
                            {t(stip.label)} {stip.cost > 0 ? `(-$${stip.cost.toLocaleString()})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    {tempCategory !== '2v2' && (
                      <div className="setting-group checkbox-group">
                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={tempIsTitleMatch}
                            onChange={(e) => setTempIsTitleMatch(e.target.checked)}
                          />
                          <span>{t('titleMatchLabel')}</span>
                        </label>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="match-settings promo-settings responsive-settings">
                    <div className="setting-group full-width">
                      <label>{t('promoTypeLabel')}</label>
                      <select value={tempPromoType} onChange={handlePromoTypeChange}>
                        {PROMO_TYPES.map(promo => (
                          <option key={promo.id} value={promo.id}>
                            {t(promo.label)} {promo.cost > 0 ? `(-$${promo.cost.toLocaleString()})` : ''}
                          </option>
                        ))}
                      </select>

                      {tempPromoType === 'invasion' && (
                        <div className="setting-group full-width mt-3">
                          <label>{t('brandToInvadeLabel')}</label>
                          <select value={tempTargetBrand} onChange={(e) => setTempTargetBrand(e.target.value)}>
                            <option value="">{t('selectBrandPlaceholder')}</option>
                            {BRANDS.filter(b => b.id.toLowerCase() !== session.brand.toLowerCase()).map(brand => (
                              <option key={brand.id} value={brand.id}>{brand.id}</option>
                            ))}
                          </select>
                          <small className="promo-warning">{t('invasionWarning')}</small>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {activeSlot.type === 'match' && tempCategory === '2v2' && tempParticipants.length < 4 && (
                <div className="team-assignment-indicator">
                  {t('addingWrestlersTo')} <strong>{tempParticipants.length < 2 ? t('corner1') : t('corner2')}</strong>
                </div>
              )}
              {activeSlot.type === 'promo' && tempPromoType === 'taunt' && tempParticipants.length < 2 && (
                <div className="team-assignment-indicator taunt-indicator">
                  {t('selecting')} <strong>{tempParticipants.length === 0 ? t('instigator') : t('rivalToTaunt')}</strong>
                </div>
              )}

              {availableCount === 0 && (
                <div className="warning-banner">
                  <i className="fas fa-exclamation-triangle"></i> {t('noSuperstarsLeft')}
                </div>
              )}

              <div className="roster-picker-grid">
                {roster.map(rItem => {
                  const isSelected = tempParticipants.some(p => p.roster_id === rItem.id);
                  const isBusy = busyWrestlers.includes(rItem.id);
                  const riv = getRivalryInfo(rItem.wrestler_id);
                  const teamInfo = getWrestlerTeam(rItem.wrestler_id, rItem.id);
                  const teamNameDisplay = teamInfo?.name || teamInfo?.team_name;

                  const styleData = Array.isArray(STYLES) ? STYLES.find(s => s.id === rItem.style) : null;
                  const styleLabel = styleData ? t(styleData.label) : (rItem.style || '');

                  const alignData = Array.isArray(ALIGNMENTS) ? ALIGNMENTS.find(a => a.id === rItem.alignment) : null;
                  const alignLabel = alignData ? t(alignData.label) : (rItem.alignment || '');

                  return (
                    <div
                      key={rItem.id}
                      className={`roster-picker-card ${isSelected ? 'selected' : ''} ${isBusy ? 'disabled' : ''}`}
                      onClick={() => !isBusy && toggleWrestler(rItem)}
                    >
                      <div className="card-image-container">
                        <div className="gender-indicator">
                          {rItem.gender === 'male' ? <i className="fas fa-mars"></i> : <i className="fas fa-venus"></i>}
                        </div>
                        <img src={rItem.image_url} alt={rItem.name} className="wrestler-portrait" />

                        {rItem.alignment && (
                          <span className={`alignment-badge ${rItem.alignment.toLowerCase()}`}>
                            {alignLabel}
                          </span>
                        )}

                        {rItem.is_champion && (
                          <img
                            src={getChampionshipUrl(rItem)}
                            alt="Campeón"
                            className="championship-belt"
                          />
                        )}
                      </div>

                      <div className="roster-info">
                        <h4>{rItem.name}</h4>

                        <div className="wrestler-badges">
                          {rItem.style && (
                            <span className={`wrestler-style-badge ${rItem.style.toLowerCase()}`}>
                              {styleLabel}
                            </span>
                          )}
                        </div>

                        {teamInfo && (
                          <div className="tag-team-badge">
                            <i className="fas fa-users"></i> {teamNameDisplay}
                          </div>
                        )}
                        {riv && (
                          <div className="rivalry-tag">
                            <i className="fas fa-fire"></i> vs {riv.opponentName} (Nvl {riv.level})
                          </div>
                        )}
                      </div>

                      <div className="selected-badge">
                        <i className="fas fa-check"></i>
                      </div>
                      {isBusy && <div className="busy-overlay">{t('busy')}</div>}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="modal-footer">
              <span className="selection-count">
                {t('selectionCount', { count: tempParticipants.length, max: getMaxLimit() })}
              </span>
              <div className="modal-actions">
                <button className="btn-cancel" onClick={closeModal}>{t('cancel')}</button>
                <button
                  className="btn-save-segment"
                  disabled={tempParticipants.length !== getMaxLimit()}
                  onClick={confirmSegment}
                >
                  {t('confirm')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookShow;