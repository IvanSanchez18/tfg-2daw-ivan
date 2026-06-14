import React from 'react';
import { useTranslation } from 'react-i18next';
import StarDisplay from './StarDisplay';
import { groupParticipantsByTeam } from '../../../utils/runShow';
import './postShowSummary.scss';

const PostShowSummary = ({ results, cardData, onExit }) => {
  const { t } = useTranslation('myGM/runShow');

  return (
    <div className="post-show-summary animate-fade-in">
      <h1 className="post-title text-center text-5xl font-black mb-8">{t('broadcastEnded')}</h1>

      <div className="global-stats mb-12">
        <div className="stat-item">
          <p className="value">{results.finalRating}</p>
          <h3>{t('finalRating')}</h3>
        </div>

        <div className="stat-divider"></div>

        <div className="stat-item">
          <p className={`value ${results.fansGained >= 0 ? 'text-green-400' : 'text-red-500'}`}>
            {results.fansGained > 0 ? '+' : ''}{results.fansGained.toLocaleString()}
          </p>
          <h3>{t('fansGained')}</h3>
        </div>
      </div>

      <div className="recap-list max-w-4xl mx-auto flex flex-col gap-4">
        {results.segmentResults.map((res, i) => {
          const seg = cardData.gm_segments[i];
          const groupedTeams = groupParticipantsByTeam(seg.gm_segment_participants);

          return (
            <div key={i} className="recap-row">
              <div className="recap-info w-1/3">
                <span className="recap-badge">{res.type}</span>
                <h4 className="font-bold text-lg mt-1">{res.title}</h4>
                <div className="scale-75 origin-left -mt-2"><StarDisplay rating={res.stars} active={true} /></div>
              </div>

              <div className="recap-roster w-2/3 flex items-center justify-end flex-wrap gap-2">
                {groupedTeams.map((teamGroup, tIdx) => (
                  <React.Fragment key={tIdx}>
                    <div className="flex gap-1">
                      {teamGroup.map(p => {
                        const isWinner = res.winnerIds?.includes(p.id);
                        const isMatch = res.type === 'match';
                        return (
                          <div key={p.id} className={`recap-wrestler ${isWinner ? 'winner-style' : (isMatch ? 'loser-style' : 'neutral-style')}`}>
                            <img src={p.gm_session_roster?.gm_wrestlers?.image_url} alt="Wrestler" />
                            <span className="text-sm font-bold whitespace-nowrap">{p.gm_session_roster?.gm_wrestlers?.name}</span>
                          </div>
                        )
                      })}
                    </div>
                    {tIdx < groupedTeams.length - 1 && res.type === 'match' && <span className="text-gray-500 font-black italic text-sm px-1">VS</span>}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-12">
        <button className="btn-exit" onClick={onExit}>{t('backToOffice')}</button>
      </div>
    </div>
  );
};

export default PostShowSummary;