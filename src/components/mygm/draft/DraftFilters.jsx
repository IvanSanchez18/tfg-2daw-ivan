import { ALIGNMENTS, GENDERS, STYLES } from '../../../utils/myGM';
import "./draftFilters.scss";

const DraftFilters = ({ searchTerm, setSearchTerm, filterAlignment, setFilterAlignment, filterGender, setFilterGender, filterStyle, setFilterStyle, isPlayerTurn }) => {
  return (
    <div className="draft-filters">
      <input
        type="text"
        placeholder="Buscar superestrella..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-input"
        disabled={!isPlayerTurn}
      />

      <select value={filterAlignment} onChange={(e) => setFilterAlignment(e.target.value)} disabled={!isPlayerTurn}>
        <option value="All">Alineación</option>
        {ALIGNMENTS.map(alignment => (
          <option key={alignment} value={alignment}>{alignment}</option>
        ))}
      </select>

      <select value={filterGender} onChange={(e) => setFilterGender(e.target.value)} disabled={!isPlayerTurn}>
        <option value="All">Género</option>
        {GENDERS.map(gender => (
          <option key={gender.id} value={gender.id}>{gender.label}</option>
        ))}
      </select>

      <select value={filterStyle} onChange={(e) => setFilterStyle(e.target.value)} disabled={!isPlayerTurn}>
        <option value="All">Estilo</option>
        {STYLES.map(style => (
          <option key={style} value={style}>{style}</option>
        ))}
      </select>
    </div>
  );
};

export default DraftFilters;