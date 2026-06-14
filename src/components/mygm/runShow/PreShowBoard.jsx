import React from 'react';
import { useTranslation } from 'react-i18next';
import { groupParticipantsByTeam, getSegmentTitle } from '../../../utils/runShow';
import './preShowBoard.scss';

const PreShowBoard = ({ cardData, onStartShow }) => {
  const { t } = useTranslation('myGM/runShow');

  return (
    <div className="pre-show-board animate-fade-in">
      <h2 className="board-title">{t('officialCard')}</h2>
      <div className="segments-list">
        {cardData.gm_segments?.map((seg) => {
          const groupedTeams = groupParticipantsByTeam(seg.gm_segment_participants);

          return (
            <div key={seg.id} className="segment-card-pre">
              <div className="seg-meta">
                <span className="type-badge">{seg.segment_type === 'match' ? t('match') : t('promo')}</span>
                <span className="position">#{seg.card_position}</span>
              </div>
              <h3 className="seg-title">{getSegmentTitle(seg)}</h3>

              <div className="participants-preview">
                {groupedTeams.map((teamGroup, tIdx) => (
                  <React.Fragment key={tIdx}>
                    <div className="team-cluster">
                      {teamGroup.map(p => (
                        <div key={p.id} className="mini-wrestler">
                          <img src={p.gm_session_roster?.gm_wrestlers?.image_url} alt="Wrestler" />
                          <span className="name">{p.gm_session_roster?.gm_wrestlers?.name || t('unknown')}</span>
                        </div>
                      ))}
                    </div>
                    {tIdx < groupedTeams.length - 1 && seg.segment_type === 'match' && <span className="vs-mini">VS</span>}
                  </React.Fragment>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <div className="action-center mt-8">
        <button className="btn-start shadow-glow" onClick={onStartShow}>{t('startBroadcast')}</button>
      </div>
    </div>
  );
};

export default PreShowBoard;