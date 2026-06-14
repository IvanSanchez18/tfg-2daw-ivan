import React from 'react';
import { useTranslation } from 'react-i18next';
import StarDisplay from './StarDisplay';
import { groupParticipantsByTeam } from '../../../utils/runShow';
import './liveShow.scss';

const LiveShow = ({ isSimulating, results, cardData, revealIndex, step, onNextReveal, onSkipAll }) => {
  const { t } = useTranslation('myGM/runShow');

  if (isSimulating) {
    return (
      <div className="simulating-screen animate-fade-in">
        <div className="loading-ring"></div>
        <h2>{t('showOnAir')}</h2>
      </div>
    );
  }

  if (!results || revealIndex < 0 || revealIndex >= results.segmentResults.length) return null;

  const currentSegment = results.segmentResults[revealIndex];
  const participants = cardData.gm_segments[revealIndex].gm_segment_participants;

  return (
    <div className="live-segment-view animate-fade-in">
      <div className="segment-header text-center mb-8">
        <span className="big-badge">{currentSegment.type === 'match' ? t('officialMatch') : t('inRingPromo')}</span>
        <h2 className="big-title mt-4">{currentSegment.title}</h2>
      </div>

      <div className={`arena-stage ${participants.length > 2 ? 'is-multi' : ''}`}>
        {groupParticipantsByTeam(participants).map((teamGroup, tIdx, tArr) => (
          <React.Fragment key={tIdx}>
            <div className="team-container">
              {teamGroup.map(p => {
                const wrestlerName = p.gm_session_roster?.gm_wrestlers?.name || t('vacant');
                const wrestlerImage = p.gm_session_roster?.gm_wrestlers?.image_url;
                const isWinner = currentSegment.winnerIds?.includes(p.id);

                let focusClass = "neutral";
                if (step === 2 && currentSegment.type === 'match') {
                  focusClass = isWinner ? "is-winner" : "is-loser";
                }

                return (
                  <div key={p.id} className={`wrestler-spotlight ${focusClass}`}>
                    <div className="portrait-frame"><img src={wrestlerImage} alt={wrestlerName} /></div>
                    <h4 className="wrestler-name">{wrestlerName}</h4>
                    {focusClass === 'is-winner' && <div className="winner-tag animate-bounce-in">{t('winnerTag')}</div>}
                  </div>
                );
              })}
            </div>
            {tIdx < tArr.length - 1 && currentSegment.type === 'match' && <div className="vs-graphic">VS</div>}
          </React.Fragment>
        ))}
      </div>

      <div className="rating-podium mt-12 text-center h-32">
        <StarDisplay rating={currentSegment.stars} active={step >= 1} />
        {step >= 2 && <p className="segment-summary mt-4 italic text-gray-300 text-xl animate-fade-in">"{currentSegment.summary}"</p>}
      </div>

      <div className="live-controls mt-8 flex justify-center gap-6 animate-fade-in">
        {step >= 2 && <button className="btn-next" onClick={onNextReveal}>{t('nextSegment')}</button>}
        <button className="btn-skip" onClick={onSkipAll}>{t('skipAll')}</button>
      </div>
    </div>
  );
};

export default LiveShow;