import { ALIGNMENTS, STYLES } from '../../../utils/myGM';
import { useTranslation } from "react-i18next";
import "./draftScouting.scss";

const DraftScouting = ({ suggestions, handlePlayerPick, formatCurrency, calculateWrestlerCost }) => {
  const { t, i18n } = useTranslation("myGM/draft");

  const styleLabel = STYLES.find(s => s.id === suggestions[0].style)?.label;
  const alignmentLabel = ALIGNMENTS.find(a => a.id === suggestions[0].default_alignment)?.label;

  return (
    <div className="scouting-report">
      <h3><i className="fas fa-search-dollar"></i> {t('draft_scouting.title')}</h3>
      <p dangerouslySetInnerHTML={{
        __html: t('draft_scouting.suggestion_desc', {
          style: styleLabel ? t(styleLabel) : suggestions[0].style,
          alignment: alignmentLabel ? t(alignmentLabel) : suggestions[0].default_alignment
        })
      }} />
      <div className="suggestions-flex">
        {suggestions.map(sug => (
          <button key={`sug-${sug.id}`} className="suggestion-chip" onClick={() => handlePlayerPick(sug)}>
            <img src={sug.image_url} alt={sug.name} />
            <div className="sug-info">
              <span className="sug-name"><strong>{sug.name}</strong> ({formatCurrency(calculateWrestlerCost(sug.base_pop))})</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default DraftScouting;