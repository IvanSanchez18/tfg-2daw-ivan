import { STYLES } from '../../../utils/myGM';
import { useTranslation } from "react-i18next";
import "./draftRules.scss";

const DraftRules = ({ setShowRules, currentBrandColor }) => {
  const { t, i18n } = useTranslation("myGM/draft");
  return (
    <div className="rules-overlay">
      <div className="rules-card">
        <h2><i className="fas fa-clipboard-list"></i> {t('draft_rules.title')}</h2>
        <ul>
          <li><strong>{t('draft_rules.turns_title')}</strong> {t('draft_rules.turns_desc')}</li>
          <li><strong>{t('draft_rules.budget_title')}</strong> {t('draft_rules.budget_desc')}</li>
          <li><strong>{t('draft_rules.end_title')}</strong> {t('draft_rules.end_desc')}</li>
          <li><strong>{t('draft_rules.minimum_title')}</strong> {t('draft_rules.minimum_desc')}</li>
          <li>
            <strong>{t('draft_rules.synergies_title')}</strong> {t('draft_rules.synergies_intro')} <span dangerouslySetInnerHTML={{
              __html: t('draft_rules.synergies_combos', {
                giant: t(STYLES[0].label),
                cruiser: t(STYLES[1].label),
                brawler: t(STYLES[2].label),
                fighter: t(STYLES[3].label),
                specialist: t(STYLES[4].label)
              })
            }}></span>
          </li>
          <li>
            <strong>{t('draft_rules.gender_title')}</strong> <span dangerouslySetInnerHTML={{ __html: t('draft_rules.gender_desc') }}></span>
          </li>
        </ul>
        <button className="start-draft-btn" onClick={() => setShowRules(false)} style={{ backgroundColor: currentBrandColor }}>
          {t('draft_rules.start_button')}
        </button>
      </div>
    </div>
  );
};

export default DraftRules;