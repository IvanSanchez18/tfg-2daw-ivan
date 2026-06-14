import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from "react-i18next";
import LoadingScreen from "../../components/loadingScreen/LoadingScreen";
import { getGameSession, getStandingsStats } from '../../services/myGMService';
import { BRANDS } from '../../utils/myGM';
import './seasonFinale.scss';

const FinaleRow = ({ rank, brandInfo, fans, avgRating, isPlayer, maxFans }) => {
  const { t } = useTranslation("myGM/finale");
  const progressPercentage = maxFans > 0 ? (fans / maxFans) * 100 : 0;

  return (
    <div
      className={`finale-row fade-in ${isPlayer ? 'player-row' : ''}`}
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
            {isPlayer && (
              <span
                className="you-badge"
                style={{ backgroundColor: brandInfo.color, color: '#ffffff' }}
              >
                {t('row.you')}
              </span>
            )}
          </h3>
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
          <span className="stat-label">{t('row.audience')}</span>
          <strong className="stat-value">{fans.toLocaleString('es-ES')}</strong>
        </div>
        <div className="stat-group rating-group">
          <span className="stat-label">{t('row.rating')}</span>
          <strong className="stat-value">{avgRating.toFixed(1)} &#11088;</strong>
        </div>
      </div>
    </div>
  );
};

export const SeasonFinale = () => {
  const { t } = useTranslation("myGM/finale");
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFinalStats = async () => {
      try {
        const [sessionData, standingsStats] = await Promise.all([
          getGameSession(sessionId),
          getStandingsStats(sessionId)
        ]);

        if (!sessionData) {
          navigate('/mygm', { replace: true });
          return;
        }

        const finalRanking = BRANDS.map(brand => {
          const isPlayer = sessionData.brand === brand.id;
          const fans = isPlayer ? sessionData.fans : (sessionData[`${brand.id}_fans`] || 0);
          const avgRating = standingsStats[brand.id]?.avgRating || 0;

          return {
            ...brand,
            fans: Number(fans),
            avgRating: Number(avgRating),
            isPlayer
          };
        }).sort((a, b) => b.fans - a.fans);

        setRanking(finalRanking);
        setSession(sessionData);
      } catch (error) {
        console.error("Error cargando los datos finales:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFinalStats();
  }, [sessionId, navigate]);

  if (loading || !session) return <LoadingScreen active={loading} />;

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);

  const formatNumber = (num) =>
    new Intl.NumberFormat('es-ES').format(num);

  const playerBrand = ranking.find(b => b.isPlayer) || ranking[0];
  const maxFans = ranking[0]?.fans || 1;

  return (
    <div className="season-finale-wrapper">
      <div className="finale-content">
        <div className="finale-header">
          <h1 className="title">{t('header.title')}</h1>
          <p className="subtitle">{t('header.subtitle')} <strong>{playerBrand.name}</strong></p>
        </div>

        <div className="stats-grid">
          <div className="stat-card" style={{ borderBottomColor: playerBrand.color }}>
            <i className="fas fa-users icon-stat" style={{ color: playerBrand.color }}></i>
            <h3>{t('stats.finalAudience')}</h3>
            <span className="stat-value">{formatNumber(playerBrand.fans)}</span>
          </div>

          <div className="stat-card" style={{ borderBottomColor: playerBrand.color }}>
            <i className="fas fa-star icon-stat" style={{ color: playerBrand.color }}></i>
            <h3>{t('stats.averageRating')}</h3>
            <span className="stat-value">{playerBrand.avgRating.toFixed(1)}</span>
          </div>

          <div className="stat-card" style={{ borderBottomColor: playerBrand.color }}>
            <i className="fas fa-wallet icon-stat" style={{ color: playerBrand.color }}></i>
            <h3>{t('stats.remainingBudget')}</h3>
            <span className="stat-value">{formatCurrency(session.budget)}</span>
          </div>
        </div>

        <div className="finale-ranking-container">
          {ranking.map((brand, index) => (
            <FinaleRow
              key={brand.id}
              rank={index + 1}
              brandInfo={brand}
              fans={brand.fans}
              avgRating={brand.avgRating}
              isPlayer={brand.isPlayer}
              maxFans={maxFans}
            />
          ))}
        </div>

        <div className="finale-actions">
          <button className="btn-main-menu" onClick={() => navigate('/mygm')}>
            <i className="fas fa-sign-out-alt"></i> {t('actions.backToMenu')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SeasonFinale;