import { ALIGNMENTS, GENDERS, STYLES } from '../../../utils/myGM';
import { useTranslation } from "react-i18next";
import "./draftFilters.scss";

const DraftFilters = ({ searchTerm, setSearchTerm, filterAlignment, setFilterAlignment, filterGender, setFilterGender, filterStyle, setFilterStyle, isPlayerTurn }) => {
  const { t } = useTranslation("myGM/draft");

  return (
    <div className="draft-filters">
      <input
        type="text"
        placeholder={t("draft_filters.search_placeholder")}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-input"
        disabled={!isPlayerTurn}
      />

      <select value={filterAlignment} onChange={(e) => setFilterAlignment(e.target.value)} disabled={!isPlayerTurn}>
        <option value="All">{t("draft_filters.filter_alignment")}</option>
        {ALIGNMENTS.map(alignment => (
          <option key={alignment.id} value={alignment.id}>{t(alignment.label)}</option>
        ))}
      </select>

      <select value={filterGender} onChange={(e) => setFilterGender(e.target.value)} disabled={!isPlayerTurn}>
        <option value="All">{t("draft_filters.filter_gender")}</option>
        {GENDERS.map(gender => (
          <option key={gender.id} value={gender.id}>{t(gender.label)}</option>
        ))}
      </select>

      <select value={filterStyle} onChange={(e) => setFilterStyle(e.target.value)} disabled={!isPlayerTurn}>
        <option value="All">{t("draft_filters.filter_style")}</option>
        {STYLES.map(style => (
          <option key={style.id} value={style.id}>{t(style.label)}</option>
        ))}
      </select>
    </div>
  );
};

export default DraftFilters;