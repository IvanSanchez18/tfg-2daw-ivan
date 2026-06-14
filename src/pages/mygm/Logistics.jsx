import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import GameEndGuard from '../../components/myGM/GameEndGuard';
import { getGameSession, updateLogistics } from '../../services/myGMService';
import { LOGISTICS_OPTIONS } from '../../utils/myGM';
import LoadingScreen from "../../components/loadingScreen/LoadingScreen";
import './logistics.scss';

export const Logistics = () => {
  const { t } = useTranslation("myGM/logistics");
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [selections, setSelections] = useState({ arena: 1, production: 1, advertising: 1 });
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      setLoading(true);
      try {
        const data = await getGameSession(sessionId);
        setSession(data);
        setSelections({
          arena: data.arena_level || 1,
          production: data.production_level || 1,
          advertising: data.advertising_level || 1
        });
      } catch (error) {
        console.error("Error cargando la sesión:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, [sessionId]);

  if (loading || !session) return <LoadingScreen active={loading} />;

  const currentCost =
    LOGISTICS_OPTIONS.arenas.find(a => a.level === selections.arena).cost +
    LOGISTICS_OPTIONS.production.find(p => p.level === selections.production).cost +
    LOGISTICS_OPTIONS.advertising.find(a => a.level === selections.advertising).cost;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateLogistics(sessionId, {
        arena_level: selections.arena,
        production_level: selections.production,
        advertising_level: selections.advertising,
        total_cost: currentCost
      });
      navigate(`/mygm/dashboard/${sessionId}`);
    } catch (error) {
      console.error("Error al guardar logística", error);
    } finally {
      setIsSaving(false);
    }
  };

  const renderOptions = (type, stateKey) => {
    return LOGISTICS_OPTIONS[type].map(option => {
      const tKey = `items.${type}.lvl${option.level}`;

      return (
        <div
          key={option.level}
          className={`logistics-card ${selections[stateKey] === option.level ? 'selected' : ''}`}
          onClick={() => setSelections(prev => ({ ...prev, [stateKey]: option.level }))}
        >
          <div
            className="card-bg-image"
            style={{ backgroundImage: `url(${option.image})` }}
          ></div>
          <div className="card-overlay"></div>

          <div className="card-content">
            <div className="card-top">
              <div className="card-header">
                <h4>{t(`${tKey}.name`)}</h4>
                <span className={`cost ${option.cost > 0 ? 'cost-red' : ''}`}>
                  {option.cost === 0 ? t('options.free') : `-$${option.cost.toLocaleString()}`}
                </span>
              </div>
              <p>{t(`${tKey}.description`)}</p>
            </div>

            <div className="card-bottom">
              {option.capacity && <div className="stat">{t('options.capacity')} <span>{option.capacity.toLocaleString()}</span></div>}
              {option.ratingBonus > 0 && <div className="stat">{t('options.ratingBonus')} <span>+{option.ratingBonus} &#11088;</span></div>}
            </div>
          </div>
        </div>
      );
    });
  };

  return (
    <div className="logistics-page" data-brand={session.brand ? session.brand.toLowerCase() : 'raw'}>
      <GameEndGuard session={session} />
      <div className="logistics-content">
        <header className="page-header">
          <button onClick={() => navigate(`/mygm/dashboard/${sessionId}`)} className="btn-back">{t('header.back')}</button>
          <h1>{t('header.title', { week: session.week })}</h1>
          <div className="budget-display">
            {t('header.budget', { budget: session.budget.toLocaleString() })}
            <span className="projected-cost"> {t('header.projectedCost', { cost: currentCost.toLocaleString() })}</span>
          </div>
        </header>

        <div className="logistics-grid">
          <section className="logistics-section">
            <h2><i className="fas fa-building"></i> {t('sections.arena')}</h2>
            <div className="options-container">{renderOptions('arenas', 'arena')}</div>
          </section>

          <section className="logistics-section">
            <h2><i className="fas fa-video"></i> {t('sections.production')}</h2>
            <div className="options-container">{renderOptions('production', 'production')}</div>
          </section>

          <section className="logistics-section">
            <h2><i className="fas fa-bullhorn"></i> {t('sections.advertising')}</h2>
            <div className="options-container">{renderOptions('advertising', 'advertising')}</div>
          </section>
        </div>
      </div>

      <div className="actions-footer">
        <button
          className="btn-save"
          onClick={handleSave}
          disabled={isSaving || session.budget < currentCost}
        >
          {isSaving ? t('footer.saving') : t('footer.confirm')}
        </button>
        {session.budget < currentCost && <p className="error-text">{t('footer.insufficientBudget')}</p>}
      </div>
    </div>
  );
};

export default Logistics;