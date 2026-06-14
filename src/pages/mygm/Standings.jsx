import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from "react-i18next";
import LoadingScreen from "../../components/loadingScreen/LoadingScreen";
import GameEndGuard from '../../components/myGM/GameEndGuard';
import { getGameSession, getStandingsStats } from '../../services/myGMService';
import { BRANDS } from '../../utils/myGM';
import './standings.scss';

const LeaderboardRow = ({ rank, brandInfo, fans, avgRating, isPlayer, prevRank, maxFans }) => {
  const { t } = useTranslation("myGM/standings");
  const progressPercentage = maxFans > 0 ? (fans / maxFans) * 100 : 0;

  let trend = 'flat';
  if (prevRank) {
    if (rank < prevRank) trend = 'up';
    else if (rank > prevRank) trend = 'down';
  }

  return (
    <div
      className={`leaderboard-row fade-in ${isPlayer ? 'player-row' : ''}`}
      style={{
        '--brand-color': brandInfo.color,
        '--brand-glow': `${brandInfo.color}26`
      }}
    >
      <div className="rank-col">
        <span className={`rank-badge rank-${rank}`}>{rank}</span>
      </div>

      <div className="logo-col">
        <img
          src={brandInfo.logo}
          alt={brandInfo.name}
          className="brand-logo"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.parentElement.innerHTML = `<div class="logo-fallback" style="color: ${brandInfo.color}">${brandInfo.shortName}</div>`;
          }}
        />
      </div>

      <div className="brand-col">
        <div className="brand-header">
          <h3>
            {brandInfo.name}
            {isPlayer && <span className="you-badge" style={{ backgroundColor: brandInfo.color }}>{t('leaderboard.you')}</span>}
          </h3>

          <div className={`trend-indicator trend-${trend}`}>
            {trend === 'up' && '▲'}
            {trend === 'down' && '▼'}
            {trend === 'flat' && '—'}
          </div>
        </div>

        <div className="visual-bar-container">
          <div
            className="visual-bar"
            style={{
              width: `${progressPercentage}%`,
              backgroundColor: brandInfo.color,
              boxShadow: isPlayer ? `0 0 10px ${brandInfo.color}80` : 'none'
            }}
          ></div>
        </div>
      </div>

      <div className="stats-col">
        <div className="stat-group">
          <span className="stat-label">{t('leaderboard.totalFans')}</span>
          <strong className="stat-value">{fans.toLocaleString('es-ES')}</strong>
        </div>
        <div className="stat-group rating-group">
          <span className="stat-label">{t('leaderboard.rating')}</span>
          <strong className="stat-value">{avgRating.toFixed(1)} &#11088;</strong>
        </div>
      </div>
    </div>
  );
};

export const Standings = () => {
  const { t } = useTranslation("myGM/standings");
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [leaderboard, setLeaderboard] = useState([]);
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleBack = () => {
    navigate(`/mygm/dashboard/${sessionId}`);
  };

  useEffect(() => {
    if (!sessionId) {
      setError(t('errors.missingSessionId'));
      setIsLoading(false);
      return;
    }

    const fetchStandings = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [sessionData, standingsStats] = await Promise.all([
          getGameSession(sessionId),
          getStandingsStats(sessionId)
        ]);

        if (!sessionData) throw new Error("No se pudo obtener la sesión desde la base de datos.");

        setSession(sessionData);

        const allBrands = BRANDS.map(brand => {
          const isPlayer = sessionData.brand?.toLowerCase() === brand.id;

          return {
            ...brand,
            fans: sessionData[`${brand.id}_fans`] || 0,
            avgRating: standingsStats[brand.id]?.avgRating || 0,
            prevRank: sessionData[`${brand.id}_prev_rank`] || null,
            isPlayer: isPlayer
          };
        });

        const sortedLeaderboard = allBrands.sort((a, b) => b.fans - a.fans);
        setLeaderboard(sortedLeaderboard);

      } catch (err) {
        console.error("Error cargando standings:", err);
        setError(t('errors.connectionError'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchStandings();
  }, [sessionId]);

  if (isLoading || !session) return <LoadingScreen active={isLoading} />;

  if (error || leaderboard.length === 0) {
    return (
      <div className="standings-wrapper error-state">
        <div className="error-banner">{error}</div>
        <button onClick={handleBack} className="btn-back">&#8592; {t('navigation.back')}</button>
      </div>
    );
  }

  const maxFans = leaderboard[0]?.fans || 1;

  return (
    <>
      <GameEndGuard session={session} />

      <div className="standings-wrapper leaderboard-layout">
        <main className="main-panel">
          <header className="top-nav">
            <button className="btn-back" onClick={handleBack}>&#8592; {t('navigation.back')}</button>
            <div className="week-badge">
              {t('navigation.weekOf', { week: session?.week, maxWeeks: session?.max_weeks || 52 })}
            </div>
          </header>

          <div className="setup-header">
            <h1 className="title">{t('header.title')}</h1>
            <p className="subtitle">{t('header.subtitle')}</p>
          </div>

          <div className="leaderboard-container">
            {leaderboard.map((brand, index) => (
              <LeaderboardRow
                key={brand.id}
                rank={index + 1}
                brandInfo={brand}
                fans={brand.fans}
                avgRating={brand.avgRating}
                isPlayer={brand.isPlayer}
                prevRank={brand.prevRank}
                maxFans={maxFans}
              />
            ))}
          </div>
        </main>
      </div>
    </>
  );
};

export default Standings;