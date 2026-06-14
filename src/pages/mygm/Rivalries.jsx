import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from "react-i18next";
import LoadingScreen from "../../components/loadingScreen/LoadingScreen";
import GameEndGuard from '../../components/myGM/GameEndGuard';
import { getGameSession, getSessionRoster, getAllRivalries, getAllTagTeams, createRivalry, endRivalry, updateRivalryLevel } from '../../services/myGMService';
import { BRANDS } from '../../utils/myGM';
import '../../components/mygm/managementLayout.scss';
import './rivalries.scss';
import ManagementLayout from '../../components/mygm/ManagementLayout';

export const Rivalries = () => {
  const { t } = useTranslation("myGM/rivalries");
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [roster, setRoster] = useState([]);
  const [tagTeams, setTagTeams] = useState([]);
  const [rivalries, setRivalries] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState('active');

  const [showCreator, setShowCreator] = useState(false);
  const [isTagTeamMode, setIsTagTeamMode] = useState(false);
  const [slotA, setSlotA] = useState(null);
  const [slotB, setSlotB] = useState(null);
  const [selectingFor, setSelectingFor] = useState(null);

  useEffect(() => {
    loadData();
  }, [sessionId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const sessionData = await getGameSession(sessionId);
      if (!sessionData) return navigate('/mygm', { replace: true });
      setSession(sessionData);

      const [rosterData, rivalriesData, teamsData] = await Promise.all([
        getSessionRoster(sessionId),
        getAllRivalries(sessionId),
        getAllTagTeams(sessionId)
      ]);

      const brandRoster = rosterData.filter(w => w.brand === sessionData.brand);
      setRoster(brandRoster);

      const brandTeams = teamsData.filter(t =>
        t.is_active && brandRoster.some(w => w.wrestler_id === t.wrestler1_id)
      );
      setTagTeams(brandTeams);

      setRivalries(rivalriesData);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getWrestler = (id) => roster.find(w => w.wrestler_id === id);
  const getTeam = (id) => tagTeams.find(t => t.id === id);

  const activeFeuds = rivalries.filter(r => r.is_active);
  const historyFeuds = rivalries.filter(r => !r.is_active);

  const busyWrestlers = activeFeuds.filter(r => !r.is_tag_team).flatMap(r => [r.wrestler1_id, r.wrestler2_id]);
  const busyTeams = activeFeuds.filter(r => r.is_tag_team).flatMap(r => [r.team1_id, r.team2_id]);

  const getRivalryName = (level) => {
    switch (level) {
      case 1: return t('levels.mild');
      case 2: return t('levels.moderate');
      case 3: return t('levels.intense');
      case 4: return t('levels.extreme');
      default: return t('levels.tense');
    }
  };

  const handleModeSwitch = (isTag) => {
    setIsTagTeamMode(isTag);
    setSlotA(null);
    setSlotB(null);
  };

  const handleStartRivalry = async () => {
    if (!slotA || !slotB) return alert(t('alerts.selectBothSides'));

    const idA = isTagTeamMode ? slotA.id : slotA.wrestler_id;
    const idB = isTagTeamMode ? slotB.id : slotB.wrestler_id;

    if (idA === idB) return alert(t('alerts.cannotFightSelf'));

    const genderA = isTagTeamMode ? getWrestler(slotA.wrestler1_id)?.gender : slotA.gender;
    const genderB = isTagTeamMode ? getWrestler(slotB.wrestler1_id)?.gender : slotB.gender;

    if (genderA !== genderB) {
      return alert(t('alerts.sameDivision'));
    }

    setLoading(true);
    try {
      await createRivalry(session.id, isTagTeamMode, idA, idB, session.week);
      setShowCreator(false);
      setSlotA(null);
      setSlotB(null);
      await loadData();
    } catch (e) {
      alert(t('alerts.errorCreating'));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateIntensity = async (id, newLevel) => {
    try {
      await updateRivalryLevel(id, newLevel);
      setRivalries(prev => prev.map(r => r.id === id ? { ...r, level: newLevel } : r));
    } catch (error) {
      alert(t('alerts.errorUpdating'));
    }
  };

  const renderPickerGrid = () => {
    return (
      <div className="picker-overlay" onClick={() => setSelectingFor(null)}>
        <div className="picker-container" onClick={(e) => e.stopPropagation()}>
          <div className="picker-header">
            <h3>{isTagTeamMode ? t('picker.selectTagTeam') : t('picker.selectSuperstar')}</h3>
            <button onClick={() => setSelectingFor(null)}><i className="fas fa-times"></i></button>
          </div>

          <div className="picker-scroll-area">
            <div className="picker-grid">

              {isTagTeamMode ? (
                (() => {
                  let options = tagTeams.filter(t => !busyTeams.includes(t.id));

                  if (selectingFor === 'B' && slotA) {
                    const genderA = getWrestler(slotA.wrestler1_id)?.gender;
                    options = options.filter(t => {
                      const genderT = getWrestler(t.wrestler1_id)?.gender;
                      return t.id !== slotA.id && genderT === genderA;
                    });
                  }

                  if (selectingFor === 'A' && slotB) {
                    const genderB = getWrestler(slotB.wrestler1_id)?.gender;
                    options = options.filter(t => {
                      const genderT = getWrestler(t.wrestler1_id)?.gender;
                      return t.id !== slotB.id && genderT === genderB;
                    });
                  }

                  if (options.length === 0) return <p className="no-options">{t('picker.noTeamsAvailable')}</p>;

                  return options.map(team => {
                    const w1 = getWrestler(team.wrestler1_id);
                    const w2 = getWrestler(team.wrestler2_id);
                    if (!w1 || !w2) return null;

                    return (
                      <div key={team.id} className="agent-card tag-team-card" onClick={() => {
                        selectingFor === 'A' ? setSlotA(team) : setSlotB(team);
                        setSelectingFor(null);
                      }}>
                        <div className="agent-image-container">
                          <img src={w1.image_url} alt={w1.name} />
                          <img src={w2.image_url} alt={w2.name} />
                        </div>
                        <div className="agent-info">
                          <div className="agent-title-row">
                            <h4>{team.name}</h4>
                          </div>
                        </div>
                      </div>
                    );
                  })
                })()
              ) : (
                (() => {
                  let options = roster.filter(w => !busyWrestlers.includes(w.wrestler_id));

                  if (selectingFor === 'B' && slotA) {
                    options = options.filter(w => w.gender === slotA.gender && w.wrestler_id !== slotA.wrestler_id);
                  } else if (selectingFor === 'A' && slotB) {
                    options = options.filter(w => w.gender === slotB.gender && w.wrestler_id !== slotB.wrestler_id);
                  }

                  if (options.length === 0) return <p className="no-options">{t('picker.noTalentsAvailable')}</p>;

                  return options.map(wrestler => {
                    const isFemale = wrestler.gender?.toLowerCase().startsWith('f');

                    const alignKey = `align_${(wrestler.alignment || 'face').toLowerCase()}`;
                    const styleKey = `style_${(wrestler.style || 'brawler').toLowerCase()}`;

                    return (
                      <div key={wrestler.wrestler_id} className="agent-card" onClick={() => {
                        selectingFor === 'A' ? setSlotA(wrestler) : setSlotB(wrestler);
                        setSelectingFor(null);
                      }}>
                        <div className="agent-image-container">
                          <img src={wrestler.image_url} alt={wrestler.name} />
                          <span className={`alignment-badge ${wrestler.alignment?.toLowerCase()}`}>
                            {t(alignKey, { defaultValue: wrestler.alignment || 'Face' })}
                          </span>
                        </div>
                        <div className="agent-info">
                          <div className="agent-title-row">
                            <h4>{wrestler.name}</h4>
                            <i className={`fas ${isFemale ? 'fa-venus female' : 'fa-mars male'} gender-icon`}></i>
                          </div>

                          <p className="agent-style">{t(styleKey, { defaultValue: wrestler.style || 'Brawler' })}</p>

                          <div className="agent-stats">
                            <span className="pop-stat">POP: {wrestler.current_pop || wrestler.base_pop}</span>
                          </div>
                        </div>
                      </div>
                    );
                  });
                })()
              )}

            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCreator = () => (
    <div className="visual-creator">
      <div className="mode-toggle" style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button className={`toggle-btn ${!isTagTeamMode ? 'active' : ''}`} onClick={() => handleModeSwitch(false)} style={{ padding: '0.8rem 2rem', borderRadius: '8px', border: '1px solid var(--border-soft)', background: !isTagTeamMode ? 'var(--dynamic-brand-color)' : 'var(--bg-input)', color: !isTagTeamMode ? 'white' : 'var(--text-main)', fontWeight: 'bold', cursor: 'pointer' }}>{t('creator.mode1v1')}</button>
        <button className={`toggle-btn ${isTagTeamMode ? 'active' : ''}`} onClick={() => handleModeSwitch(true)} style={{ padding: '0.8rem 2rem', borderRadius: '8px', border: '1px solid var(--border-soft)', background: isTagTeamMode ? 'var(--dynamic-brand-color)' : 'var(--bg-input)', color: isTagTeamMode ? 'white' : 'var(--text-main)', fontWeight: 'bold', cursor: 'pointer' }}>{t('creator.modeTagTeam')}</button>
      </div>

      <div className="versus-board">
        <div className="slot" onClick={() => setSelectingFor('A')}>
          {slotA ? (
            <div className="selected-card">
              {isTagTeamMode ? (
                <>
                  <div className="team-icon"><i className="fas fa-users" style={{ fontSize: '3rem', marginBottom: '1rem', color: 'var(--text-soft)' }}></i></div>
                  <h3>{slotA.name}</h3>
                </>
              ) : (
                <>
                  <img src={slotA.image_url} alt={slotA.name} />
                  <h3>{slotA.name}</h3>
                  <span className={`align ${slotA.alignment.toLowerCase()}`}>{slotA.alignment}</span>
                </>
              )}
            </div>
          ) : (
            <div className="empty-slot"><i className={isTagTeamMode ? "fas fa-users" : "fas fa-user-plus"}></i><p>{isTagTeamMode ? t('creator.team1') : t('creator.wrestler1')}</p></div>
          )}
        </div>

        <div className="vs-center">VS</div>

        <div className={`slot ${!slotA ? 'disabled' : ''}`} onClick={() => slotA && setSelectingFor('B')}>
          {slotB ? (
            <div className="selected-card">
              {isTagTeamMode ? (
                <>
                  <div className="team-icon"><i className="fas fa-users" style={{ fontSize: '3rem', marginBottom: '1rem', color: 'var(--text-soft)' }}></i></div>
                  <h3>{slotB.name}</h3>
                </>
              ) : (
                <>
                  <img src={slotB.image_url} alt={slotB.name} />
                  <h3>{slotB.name}</h3>
                  <span className={`align ${slotB.alignment.toLowerCase()}`}>{slotB.alignment}</span>
                </>
              )}
            </div>
          ) : (
            <div className="empty-slot"><i className={slotA ? (isTagTeamMode ? "fas fa-users" : "fas fa-user-plus") : "fas fa-lock"}></i><p>{isTagTeamMode ? t('creator.team2') : t('creator.wrestler2')}</p></div>
          )}
        </div>
      </div>

      <div className="creator-actions">
        <button className="cancel-btn" onClick={() => { setShowCreator(false); setSlotA(null); setSlotB(null); }}>{t('creator.cancel')}</button>
        <button className="confirm-btn" disabled={!slotA || !slotB} onClick={handleStartRivalry}>{t('creator.startFeud')}</button>
      </div>
    </div>
  );

  const renderActiveList = () => (
    <div className="rivalries-list">
      {activeFeuds.length === 0 && !showCreator && (
        <div className="no-data-msg">
          <i className="fas fa-handshake-slash"></i>
          <h3>{t('activeList.noFeuds')}</h3>
          <p>{t('activeList.noFeudsDesc')}</p>
        </div>
      )}

      {activeFeuds.map(r => {
        const isTag = r.is_tag_team;
        let name1, name2, align1, align2;
        let images1 = [], images2 = [];

        if (isTag) {
          const t1 = getTeam(r.team1_id);
          const t2 = getTeam(r.team2_id);
          if (!t1 || !t2) return null;

          const w1t1 = getWrestler(t1.wrestler1_id);
          const w2t1 = getWrestler(t1.wrestler2_id);
          const w1t2 = getWrestler(t2.wrestler1_id);
          const w2t2 = getWrestler(t2.wrestler2_id);

          name1 = t1.name; name2 = t2.name;
          images1 = [w1t1?.image_url, w2t1?.image_url];
          images2 = [w1t2?.image_url, w2t2?.image_url];
          align1 = 'Equipo'; align2 = 'Equipo';
        } else {
          const w1 = getWrestler(r.wrestler1_id);
          const w2 = getWrestler(r.wrestler2_id);
          if (!w1 || !w2) return null;

          name1 = w1.name; name2 = w2.name;
          images1 = [w1.image_url];
          images2 = [w2.image_url];
          align1 = w1.alignment; align2 = w2.alignment;
        }

        return (
          <div key={r.id} className="active-feud-card">
            <div className={`feud-level level-${r.level}`}>
              {getRivalryName(r.level)} {isTag && t('activeList.tagTeam')}
            </div>

            <div className="feud-matchup">
              <div className="wrestler-side">
                {isTag ? (
                  <div className="team-portraits">
                    <img src={images1[0]} alt={name1} />
                    <img src={images1[1]} alt={name1} />
                  </div>
                ) : (
                  <img src={images1[0]} alt={name1} />
                )}

                <div className="info">
                  <h4>{name1}</h4>
                  {!isTag && <span className={`align ${align1.toLowerCase()}`}>{align1}</span>}
                </div>
              </div>

              <div className="vs">VS</div>

              <div className="wrestler-side right">
                <div className="info">
                  <h4>{name2}</h4>
                  {!isTag && <span className={`align ${align2.toLowerCase()}`}>{align2}</span>}
                </div>

                {isTag ? (
                  <div className="team-portraits">
                    <img src={images2[0]} alt={name2} />
                    <img src={images2[1]} alt={name2} />
                  </div>
                ) : (
                  <img src={images2[0]} alt={name2} />
                )}
              </div>
            </div>

            <div className="feud-actions">
              <div className="intensity-control">
                <label>{t('activeList.intensity')}</label>
                <select value={r.level} onChange={(e) => handleUpdateIntensity(r.id, parseInt(e.target.value))}>
                  <option value={1}>{t('levels.mild')}</option>
                  <option value={2}>{t('levels.moderate')}</option>
                  <option value={3}>{t('levels.intense')}</option>
                  <option value={4}>{t('levels.extreme')}</option>
                </select>
              </div>
              <span className="weeks">{t('activeList.weeksActive', { weeks: session.week - r.start_week })}</span>
              <button className="end-feud-btn" onClick={() => endRivalry(r.id, session.week).then(loadData)}>{t('activeList.endFeud')}</button>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderHistoryList = () => (
    <div className="rivalries-list history">
      {historyFeuds.length === 0 ? (
        <div className="no-data-msg">
          <i className="fas fa-history"></i>
          <h3>{t('historyList.noHistory')}</h3>
          <p>{t('historyList.noHistoryDesc')}</p>
        </div>
      ) : (
        historyFeuds.map(r => {
          const isTag = r.is_tag_team;
          let name1, name2;

          if (isTag) {
            const t1 = getTeam(r.team1_id);
            const t2 = getTeam(r.team2_id);
            if (!t1 || !t2) return null;
            name1 = t1.name; name2 = t2.name;
          } else {
            const w1 = getWrestler(r.wrestler1_id);
            const w2 = getWrestler(r.wrestler2_id);
            if (!w1 || !w2) return null;
            name1 = w1.name; name2 = w2.name;
          }

          return (
            <div key={r.id} className="history-feud-card">
              <div className="history-badge">{getRivalryName(r.level)} {isTag && t('historyList.tagTeam')}</div>
              <div className="matchup-compact">
                <span className="name">{name1}</span>
                <span className="vs-small">vs</span>
                <span className="name">{name2}</span>
              </div>
              <div className="duration">
                <i className="far fa-calendar-alt"></i> {t('historyList.week', { week: r.start_week })} - {r.end_week ? t('historyList.week', { week: r.end_week }) : '?'}
              </div>
            </div>
          );
        })
      )}
    </div>
  );

  if (loading || !session) return <LoadingScreen active={loading} />;

  const brandInfo = BRANDS.find(b => b.id === session.brand) || BRANDS[0];

  return (
    <div className="management-wrapper">
      <GameEndGuard session={session} />
      <ManagementLayout
        loading={loading}
        session={session}
        brandColor={brandInfo.color}
        backUrl={`/mygm/dashboard/${sessionId}`}
        wrapperClassName="rivalries-wrapper"

        activeTab={activeTab}
        setActiveTab={setActiveTab}
        tabLabels={{ active: t('management.tabs.active'), history: t('management.tabs.history') }}

        titles={{
          active: t('management.titles.active'),
          history: t('management.titles.history')
        }}
        descriptions={{
          active: session ? t('management.desc.active', { brand: session.brand.toUpperCase() }) : '',
          history: t('management.desc.history')
        }}

        showCreator={showCreator}
        setShowCreator={setShowCreator}
        actionButtonText={t('management.actionButton')}

        creatorNode={renderCreator()}
        activeListNode={renderActiveList()}
        historyListNode={renderHistoryList()}
        pickerNode={selectingFor ? renderPickerGrid() : null}
      />
    </div>
  );
};

export default Rivalries;