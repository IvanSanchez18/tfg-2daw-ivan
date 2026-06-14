import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useTranslation } from 'react-i18next';
import LoadingScreen from "../../components/loadingScreen/LoadingScreen";
import GameEndGuard from '../../components/myGM/GameEndGuard';
import { simulateShow, getGameSession, getPendingCard } from '../../services/myGMService';
import { BRANDS } from '../../utils/myGM';
import { hexToRgba } from '../../utils/runShow';
import PreShowBoard from '../../components/mygm/runShow/PreShowBoard';
import LiveShow from '../../components/mygm/runShow/LiveShow';
import PostShowSummary from '../../components/mygm/runShow/PostShowSummary';
import './runshow.scss';

const getBrandConfig = (brandName) => {
  if (!brandName) return BRANDS.find(b => b.id === 'nxt');
  const nameLower = brandName.toLowerCase();
  const foundBrand = BRANDS.find(b =>
    nameLower.includes(b.id) ||
    nameLower.includes(b.name.toLowerCase()) ||
    nameLower === b.shortName.toLowerCase()
  );
  return foundBrand || BRANDS.find(b => b.id === 'nxt');
};

const RunShow = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation('myGM/runShow');

  const [session, setSession] = useState(null);
  const [cardData, setCardData] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isSimulating, setIsSimulating] = useState(false);
  const [revealIndex, setRevealIndex] = useState(-1);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      if (!sessionId) return;
      try {
        const s = await getGameSession(sessionId);
        const c = await getPendingCard(sessionId, s.week);
        setSession(s);
        setCardData(c);
      } catch (error) {
        console.error("Error al cargar la arena:", error);
        Swal.fire({
          title: t('errorLoadingArenaTitle'),
          text: t('errorLoadingArenaText'),
          icon: 'error',
          background: 'var(--bg-card)',
          color: 'var(--text-main)',
          confirmButtonColor: '#d33'
        });
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [sessionId, t]);

  const isLiveShow = isSimulating || (results && revealIndex >= 0 && revealIndex < results.segmentResults.length);
  const isPostShow = results && revealIndex >= results?.segmentResults?.length;

  useEffect(() => {
    if (isPostShow && results?.bonusEarned > 0) {
      const brandColor = getBrandConfig(cardData?.brand)?.color || '#3085d6';

      Swal.fire({
        title: t('fansMilestoneTitle'),
        text: t('fansMilestoneText', { bonus: results.bonusEarned.toLocaleString() }),
        icon: 'success',
        background: 'var(--bg-card)',
        color: 'var(--text-main)',
        confirmButtonColor: brandColor,
        confirmButtonText: t('excellent')
      });
    }
  }, [isPostShow, results, cardData, t]);

  const handleRunShow = async () => {
    if (!session || !cardData) return;
    setIsSimulating(true);
    try {
      const res = await simulateShow(session.id, cardData.id);
      setResults(res);
      setIsSimulating(false);
      setRevealIndex(0);
      triggerRevealSequence();
    } catch (e) {
      console.error(e);
      setIsSimulating(false);
      Swal.fire(t('productionErrorTitle'), t('productionErrorText'), 'error');
    }
  };

  const triggerRevealSequence = () => {
    setStep(0);
    setTimeout(() => setStep(1), 1000);
    setTimeout(() => setStep(2), 2500);
  };

  const handleNextReveal = () => {
    setRevealIndex(prev => prev + 1);
    triggerRevealSequence();
  };

  const handleSkipAll = () => {
    if (results) setRevealIndex(results.segmentResults.length);
  };

  if (loading) {
    return <LoadingScreen active={true} />;
  }

  if (!session || !cardData) {
    return (
      <div className="run-show-empty">
        <h2>{t('noCardTitle')}</h2>
        <p>{t('noCardText')}</p>
        <button onClick={() => navigate(`/mygm/dashboard/${sessionId}`)}>
          {t('backToDashboard')}
        </button>
      </div>
    );
  }

  const brandConfig = getBrandConfig(cardData.brand);
  const dynamicStyles = {
    '--brand-color': brandConfig.color,
    '--brand-glow': hexToRgba(brandConfig.color, 0.5)
  };

  return (
    <div className={`run-show-layout ${isLiveShow ? 'view-locked' : 'view-scrollable'}`} style={dynamicStyles}>
      <GameEndGuard session={session} />
      <header className="show-header">
        <h1>
          {t('weekHeader', { week: session.week })} <span className="divider">|</span> <span className="brand-name">{cardData.brand || t('indieTerritory')}</span>
        </h1>
      </header>

      {revealIndex === -1 && !isSimulating && (
        <PreShowBoard cardData={cardData} onStartShow={handleRunShow} />
      )}

      {isLiveShow && (
        <LiveShow
          isSimulating={isSimulating}
          results={results}
          cardData={cardData}
          revealIndex={revealIndex}
          step={step}
          onNextReveal={handleNextReveal}
          onSkipAll={handleSkipAll}
        />
      )}

      {isPostShow && (
        <PostShowSummary results={results} cardData={cardData} onExit={() => navigate(`/mygm/dashboard/${sessionId}`)} />
      )}

    </div>
  );
};

export default RunShow;