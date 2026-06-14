import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useTranslation } from "react-i18next";
import LoadingScreen from "../../components/loadingScreen/LoadingScreen";
import GameEndGuard from '../../components/myGM/GameEndGuard';
import { getGameSession, getSessionRoster, removeWrestlerFromRoster } from '../../services/myGMService';
import { BRANDS, ALIGNMENTS, STYLES } from '../../utils/myGM';
import './roster.scss';

export const Roster = () => {
  const { t } = useTranslation("myGM/roster");
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [roster, setRoster] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterAlignment, setFilterAlignment] = useState('ALL');
  const [sortBy, setSortBy] = useState('pop_desc');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWrestler, setSelectedWrestler] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchRosterData = async () => {
      try {
        const sessionData = await getGameSession(sessionId);
        if (!sessionData) {
          navigate('/mygm', { replace: true });
          return;
        }

        const allRoster = await getSessionRoster(sessionId);
        const myBrandRoster = allRoster.filter(w => w.brand === sessionData.brand);

        setSession(sessionData);
        setRoster(myBrandRoster);
      } catch (error) {
        console.error("Error cargando el roster:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRosterData();
  }, [sessionId, navigate]);

  const handleManageClick = (wrestler) => {
    setSelectedWrestler(wrestler);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedWrestler(null);
  };

  const handleSellWrestler = async () => {
    if (!selectedWrestler) return;

    try {
      setIsProcessing(true);

      await removeWrestlerFromRoster(sessionId, selectedWrestler.id);

      setRoster(prevRoster => prevRoster.filter(w => w.id !== selectedWrestler.id));
      handleCloseModal();

      Swal.fire({
        icon: 'success',
        title: t('modal.successTitle'),
        text: t('modal.successText', {
          amount: formatCurrency(selectedWrestler.salary),
          name: selectedWrestler.name
        }),
        background: 'var(--bg-card)',
        color: 'var(--text-main)',
        timer: 2000,
        showConfirmButton: false
      });

    } catch (error) {
      console.error("Error al vender al luchador:", error);
      handleCloseModal();

      Swal.fire({
        icon: 'error',
        title: t('modal.errorTitle'),
        text: t('modal.errorText'),
        confirmButtonColor: '#d33',
        background: 'var(--bg-card)',
        color: 'var(--text-main)'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading || !session) return <LoadingScreen active={loading} />;

  let displayedRoster = roster.filter(w => {
    const matchesSearch = w.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAlignment = filterAlignment === 'ALL' || w.alignment.toUpperCase() === filterAlignment;
    return matchesSearch && matchesAlignment;
  });

  displayedRoster.sort((a, b) => {
    if (sortBy === 'pop_desc') return b.current_pop - a.current_pop;
    if (sortBy === 'salary_desc') return b.salary - a.salary;
    if (sortBy === 'morale_asc') return a.morale - b.morale;
    if (sortBy === 'fatigue_desc') return b.fatigue - a.fatigue;
    return 0;
  });

  const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
  const totalSalary = roster.reduce((acc, curr) => acc + curr.salary, 0);

  const getChampionshipUrl = (wrestler) => {
    const brand = BRANDS.find(b => b.id === session.brand) || BRANDS[0];
    const isFemale = wrestler.gender?.toUpperCase().startsWith('F');
    const prefix = isFemale ? 'W' : '';
    return `https://rkncnbzilbfsuqlndvyk.supabase.co/storage/v1/object/public/titles/${prefix}${brand.shortName}.webp`;
  };

  const getAlignmentLabel = (alignmentId) => {
    if (!alignmentId) return '';
    const alignment = ALIGNMENTS.find(a => a.id.toUpperCase() === alignmentId.toUpperCase());
    return alignment ? t(alignment.label) : alignmentId;
  };

  return (
    <div className="roster-view-wrapper">
      <GameEndGuard session={session} />
      <header className="roster-header">
        <div className="header-title">
          <button className="back-btn" onClick={() => navigate(`/mygm/dashboard/${sessionId}`)}>
            <i className="fas fa-arrow-left"></i> {t('header.back')}
          </button>
          <h1>{t('header.title')}</h1>
        </div>
        <div className="roster-summary">
          <div className="summary-item">
            <span>{t('header.totalTalent')}</span><strong>{roster.length}</strong>
          </div>
          <div className="summary-item">
            <span>{t('header.weeklyCost')}</span><strong>{formatCurrency(totalSalary)}</strong>
          </div>
        </div>
      </header>

      <div className="roster-controls">
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input type="text" placeholder={t('controls.searchPlaceholder')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div className="filter-group">

          <select value={filterAlignment} onChange={(e) => setFilterAlignment(e.target.value)}>
            <option value="ALL">{t('controls.filters.allRoles')}</option>
            {ALIGNMENTS.map((align) => (
              <option key={align.id} value={align.id.toUpperCase()}>
                {t(align.label)}
              </option>
            ))}
          </select>

          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="pop_desc">{t('controls.sort.highestPop')}</option>
            <option value="salary_desc">{t('controls.sort.highestSalary')}</option>
            <option value="morale_asc">{t('controls.sort.lowestMorale')}</option>
            <option value="fatigue_desc">{t('controls.sort.highestFatigue')}</option>
          </select>
        </div>
      </div>

      <div className="roster-grid">
        {displayedRoster.length === 0 ? (
          <div className="empty-state">{t('grid.emptyState')}</div>
        ) : (
          displayedRoster.map(wrestler => (
            <div key={wrestler.id} className={`wrestler-card ${wrestler.is_injured ? 'is-injured' : ''}`}>

              <div className="card-image-container">
                <img src={wrestler.image_url} alt={wrestler.name} className="wrestler-portrait" />

                <span className={`gender-icon ${wrestler.gender?.toUpperCase().startsWith('F') ? 'female' : 'male'}`}>
                  <i className={`fas ${wrestler.gender?.toUpperCase().startsWith('F') ? 'fa-venus' : 'fa-mars'}`}></i>
                </span>

                <span className={`alignment-tag ${wrestler.alignment.toLowerCase()}`}>
                  {getAlignmentLabel(wrestler.alignment)}
                </span>

                {wrestler.is_injured && (
                  <span className="injury-badge">
                    <i className="fas fa-medkit"></i> {t('card.injured')}
                  </span>
                )}

                {wrestler.is_champion && (
                  <img
                    src={getChampionshipUrl(wrestler)}
                    alt={t('card.championshipAlt')}
                    className="championship-belt"
                  />
                )}
              </div>

              <div className="card-info">
                <h3>{wrestler.name}</h3>

                <p className="wrestler-style">
                  {wrestler.style && STYLES.find(s => s.id === wrestler.style)
                    ? t(STYLES.find(s => s.id === wrestler.style).label)
                    : ''}
                </p>

                <div className="stat-row">
                  <span className="stat-label">{t('card.popularity')}</span>
                  <span className="stat-value pop">{wrestler.current_pop}</span>
                </div>

                <div className="stat-row">
                  <span className="stat-label">{t('card.morale')}</span>
                  <div className="progress-bar-container">
                    <div className={`progress-fill ${wrestler.morale < 40 ? 'danger' : 'safe'}`} style={{ width: `${wrestler.morale}%` }}></div>
                    <span className="progress-text">{wrestler.morale}%</span>
                  </div>
                </div>

                <div className="stat-row">
                  <span className="stat-label">{t('card.fatigue')}</span>
                  <div className="progress-bar-container">
                    <div className={`progress-fill ${wrestler.fatigue > 70 ? 'danger' : 'warning'}`} style={{ width: `${wrestler.fatigue}%` }}></div>
                    <span className="progress-text">{wrestler.fatigue}%</span>
                  </div>
                </div>

                <div className="contract-info">
                  <div className="contract-item"><i className="fas fa-file-signature"></i> {wrestler.contract_weeks} {t('card.weeks')}</div>
                  <div className="contract-item"><i className="fas fa-dollar-sign"></i> {formatCurrency(wrestler.salary)}{t('card.perWeek')}</div>
                </div>

                <div className="card-actions">
                  <button
                    className="action-btn"
                    onClick={() => handleManageClick(wrestler)}
                  >
                    {t('card.manage')}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && selectedWrestler && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{t('modal.title', { name: selectedWrestler.name })}</h2>
              <button className="close-btn" onClick={handleCloseModal}>&times;</button>
            </div>

            <div className="modal-body">
              <p>{t('modal.warning')}</p>
              <div className="modal-wrestler-preview">
                <img src={selectedWrestler.image_url} alt={selectedWrestler.name} />
                <div className="preview-details">
                  <strong>{selectedWrestler.name}</strong>
                  <span>{t('modal.salaryRecovered', { amount: formatCurrency(selectedWrestler.salary) })}</span>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={handleCloseModal} disabled={isProcessing}>
                {t('modal.cancel')}
              </button>
              <button className="btn-sell" onClick={handleSellWrestler} disabled={isProcessing}>
                {isProcessing ? t('modal.processing') : t('modal.sell')}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Roster;