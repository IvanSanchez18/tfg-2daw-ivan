import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from "react-i18next";
import { startNewGame } from '../../services/myGMService';
import { BRANDS } from '../../utils/myGM';
import { supabase } from "../../services/supabaseClient";
import './newGame.scss';

export const NewGame = () => {
    const { t } = useTranslation(["myGM/newGame", "myGM/brands"]);
    const [selectedBrand, setSelectedBrand] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const navigate = useNavigate();
    const location = useLocation();

    const gmImage = location.state?.selectedGmImage || null;

    const handleStartDraft = async () => {
        if (!selectedBrand) return;

        setLoading(true);
        setError(null);

        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            setError(t('error_login'));
            setLoading(false);
            return;
        }

        const session = await startNewGame(user.id, selectedBrand.id, selectedBrand.initialBudget, gmImage);

        if (session) {
            navigate(`/mygm/draft/${session.id}`, { replace: true });
        } else {
            setError(t('error_connection'));
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <div className="mygm-setup-wrapper">
            <main className="left-panel">
                <div className="left-content-wrapper">
                    <button className="btn-back" onClick={() => navigate(-1)}>
                        &#8592; {t('back_button')}
                    </button>

                    <header className="setup-header">
                        <h1 className="title">{t('setup_title')}</h1>
                        <p className="subtitle">{t('setup_subtitle')}</p>
                    </header>

                    <div className="brands-grid">
                        {BRANDS.map((brand) => (
                            <button
                                key={brand.id}
                                onClick={() => setSelectedBrand(brand)}
                                className={`brand-card ${selectedBrand?.id === brand.id ? 'selected' : ''}`}
                                style={{ '--brand-color': brand.color }}
                                aria-label={`Seleccionar ${brand.name}`}
                            >
                                <div className="brand-glow"></div>
                                <span className="brand-short"><img src={brand.logo} alt={brand.shortName} /></span>
                                <h2 className="brand-name">{brand.name}</h2>
                            </button>
                        ))}
                    </div>
                </div>
            </main>

            <aside className="right-panel">
                {selectedBrand ? (
                    <div className="details-card fade-in">
                        <div className="details-content">
                            <h3 className="details-title" style={{ color: selectedBrand.color }}>{selectedBrand.name}</h3>
                            <p className="details-desc">{t(`myGM/brands:${selectedBrand.description}`)}</p>

                            <div className="details-stats">
                                <div className="stat-row">
                                    <span>{t('initial_budget')}</span>
                                    <strong style={{ color: selectedBrand.color, fontSize: '1.2rem' }}>
                                        {formatCurrency(selectedBrand.initialBudget)}
                                    </strong>
                                </div>
                                <div className="stat-row">
                                    <span>{t('contract_duration')}</span>
                                    <strong>{t('weeks_count')}</strong>
                                </div>
                            </div>

                            {error && <div className="error-banner">{error}</div>}
                        </div>

                        <button
                            onClick={handleStartDraft}
                            disabled={loading}
                            className="btn-start"
                            style={{ backgroundColor: selectedBrand.color }}
                        >
                            {loading ? t('loading_text') : t('submit_button')}
                        </button>
                    </div>
                ) : (
                    <div className="details-placeholder">
                        <div className="placeholder-icon"><i className="fa-solid fa-briefcase"></i></div>
                        <p>{t('placeholder_text')}</p>
                    </div>
                )}
            </aside>
        </div>
    );
};

export default NewGame;