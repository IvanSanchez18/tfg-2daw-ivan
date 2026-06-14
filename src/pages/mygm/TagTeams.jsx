import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from "react-i18next";
import GameEndGuard from '../../components/myGM/GameEndGuard';
import LoadingScreen from "../../components/loadingScreen/LoadingScreen";
import { getGameSession, getSessionRoster, getAllTagTeams, createTagTeam, disbandTagTeam } from '../../services/myGMService';
import { BRANDS } from '../../utils/myGM';
import './tagteams.scss';
import ManagementLayout from '../../components/mygm/ManagementLayout';

export const TagTeams = () => {
  const { t, i18n } = useTranslation("myGM/tagTeams");
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [roster, setRoster] = useState([]);
  const [tagTeams, setTagTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState('active');

  const [showCreator, setShowCreator] = useState(false);
  const [slotA, setSlotA] = useState(null);
  const [slotB, setSlotB] = useState(null);
  const [teamName, setTeamName] = useState('');
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

      const [rosterData, teamsData] = await Promise.all([
        getSessionRoster(sessionId),
        getAllTagTeams(sessionId)
      ]);

      setRoster(rosterData.filter(w => w.brand === sessionData.brand));
      setTagTeams(teamsData);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getWrestler = (id) => roster.find(w => w.wrestler_id === id);

  const activeTeams = tagTeams.filter(t => t.is_active);
  const historyTeams = tagTeams.filter(t => !t.is_active);

  const busyWrestlers = activeTeams.flatMap(t => [t.wrestler1_id, t.wrestler2_id]);

  const handleCreateTeam = async () => {
    if (!slotA || !slotB) return alert(t('alerts.selectBothTalents'));
    if (!teamName.trim()) return alert(t('alerts.teamNeedsName'));
    if (slotA.gender !== slotB.gender) return alert(t('alerts.sameDivision'));

    setLoading(true);
    try {
      await createTagTeam(session.id, teamName, slotA.wrestler_id, slotB.wrestler_id);
      setShowCreator(false);
      setSlotA(null);
      setSlotB(null);
      setTeamName('');
      await loadData();
    } catch (e) {
      alert(t('alerts.errorCreating'));
    } finally {
      setLoading(false);
    }
  };

  const renderPickerGrid = () => {
    let options = roster.filter(w => !busyWrestlers.includes(w.wrestler_id));

    if (selectingFor === 'B' && slotA) {
      options = options.filter(w => w.gender === slotA.gender && w.wrestler_id !== slotA.wrestler_id);
    } else if (selectingFor === 'A' && slotB) {
      options = options.filter(w => w.gender === slotB.gender && w.wrestler_id !== slotB.wrestler_id);
    }

    return (
      <div className="picker-overlay" onClick={() => setSelectingFor(null)}>
        <div className="picker-container" onClick={(e) => e.stopPropagation()}>
          <div className="picker-header">
            <h3>{t('picker.selectPartner')}</h3>
            <button onClick={() => setSelectingFor(null)}><i className="fas fa-times"></i></button>
          </div>

          <div className="picker-scroll-area">
            <div className="picker-grid">
              {options.length === 0 ? (
                <p className="no-options">{t('picker.noFreeTalents')}</p>
              ) : (
                options.map(wrestler => {
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
                          {t(alignKey)}
                        </span>
                      </div>
                      <div className="agent-info">
                        <div className="agent-title-row">
                          <h4>{wrestler.name}</h4>
                          <i className={`fas ${isFemale ? 'fa-venus female' : 'fa-mars male'} gender-icon`}></i>
                        </div>

                        <p className="agent-style">{t(styleKey)}</p>

                        <div className="agent-stats">
                          <span className="pop-stat">POP: {wrestler.current_pop || wrestler.base_pop}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCreator = () => (
    <div className="visual-creator">
      <div className="team-name-input">
        <label>{t('creator.teamNameLabel')}</label>
        <input
          type="text"
          placeholder={t('creator.teamNamePlaceholder')}
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          maxLength={40}
        />
      </div>

      <div className="versus-board">
        <div className="slot" onClick={() => setSelectingFor('A')}>
          {slotA ? (
            <div className="selected-card">
              <img src={slotA.image_url} alt={slotA.name} />
              <h3>{slotA.name}</h3>
            </div>
          ) : (
            <div className="empty-slot"><i className="fas fa-user-plus"></i><p>{t('creator.member1')}</p></div>
          )}
        </div>
        <div className="alliance-center"><i className="fas fa-handshake"></i></div>
        <div className={`slot ${!slotA ? 'disabled' : ''}`} onClick={() => slotA && setSelectingFor('B')}>
          {slotB ? (
            <div className="selected-card">
              <img src={slotB.image_url} alt={slotB.name} />
              <h3>{slotB.name}</h3>
            </div>
          ) : (
            <div className="empty-slot"><i className={slotA ? "fas fa-user-plus" : "fas fa-lock"}></i><p>{t('creator.member2')}</p></div>
          )}
        </div>
      </div>

      <div className="creator-actions">
        <button className="cancel-btn" onClick={() => { setShowCreator(false); setSlotA(null); setSlotB(null); setTeamName(''); }}>{t('creator.cancel')}</button>
        <button className="confirm-btn" disabled={!slotA || !slotB || !teamName.trim()} onClick={handleCreateTeam}>{t('creator.confirmTeam')}</button>
      </div>
    </div>
  );

  const renderActiveList = () => (
    <div className="teams-list">
      {activeTeams.length === 0 && !showCreator ? (
        <div className="no-data-msg">
          <i className="fas fa-users-slash"></i>
          <h3>{t('activeList.noTeams')}</h3>
          <p>{t('activeList.noTeamsDesc')}</p>
        </div>
      ) : (
        <div className="teams-grid">
          {activeTeams.map(team => {
            const w1 = getWrestler(team.wrestler1_id);
            const w2 = getWrestler(team.wrestler2_id);
            if (!w1 || !w2) return null;

            return (
              <div key={team.id} className="tag-team-card">
                <div className="team-header">
                  <h3>{team.name}</h3>
                  <button className="disband-btn" onClick={() => disbandTagTeam(team.id).then(loadData)} title={t('activeList.disbandTeam')}>
                    <i className="fas fa-unlink"></i>
                  </button>
                </div>
                <div className="team-members">
                  <div className="member"><img src={w1.image_url} alt={w1.name} /><span>{w1.name}</span></div>
                  <div className="and-symbol">&</div>
                  <div className="member"><img src={w2.image_url} alt={w2.name} /><span>{w2.name}</span></div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderHistoryList = () => (
    <div className="teams-list history">
      {historyTeams.length === 0 ? (
        <div className="no-data-msg">
          <i className="fas fa-history"></i>
          <h3>{t('historyList.noHistory')}</h3>
          <p>{t('historyList.noHistoryDesc')}</p>
        </div>
      ) : (
        <div className="teams-grid">
          {historyTeams.map(team => {
            const w1 = getWrestler(team.wrestler1_id);
            const w2 = getWrestler(team.wrestler2_id);
            if (!w1 || !w2) return null;

            return (
              <div key={team.id} className="tag-team-card history-card" style={{ opacity: 0.7, filter: 'grayscale(0.5)' }}>
                <div className="team-header">
                  <h3>{team.name}</h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-soft)', textTransform: 'uppercase' }}>{t('historyList.disbanded')}</span>
                </div>
                <div className="team-members">
                  <div className="member"><img src={w1.image_url} alt={w1.name} /><span>{w1.name}</span></div>
                  <div className="and-symbol">&</div>
                  <div className="member"><img src={w2.image_url} alt={w2.name} /><span>{w2.name}</span></div>
                </div>
              </div>
            );
          })}
        </div>
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
        wrapperClassName="tagteams-wrapper"

        activeTab={activeTab}
        setActiveTab={setActiveTab}

        titles={{
          active: t('management.tagTeams'),
          history: t('management.disbandedTeams')
        }}
        descriptions={{
          active: session ? `${t('management.manageAlliances')} ${session.brand.toUpperCase()}` : '',
          history: t('management.legacyBrokenAlliances')
        }}

        showCreator={showCreator}
        setShowCreator={setShowCreator}
        actionButtonText={t('management.formTeam')}

        creatorNode={renderCreator()}
        activeListNode={renderActiveList()}
        historyListNode={renderHistoryList()}
        pickerNode={selectingFor ? renderPickerGrid() : null}
      />
    </div>

  );
};

export default TagTeams;