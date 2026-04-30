import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getBaseWrestlers } from "../../services/apiService";
import AdminWrestlerForm from "./AdminWrestlerForm";
import "./AdminWrestlers.scss";

export default function AdminWrestlers() {
  const navigate = useNavigate();
  const [wrestlers, setWrestlers] = useState([]);
  const [currentView, setCurrentView] = useState("list");
  const [selectedWrestler, setSelectedWrestler] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [brandFilter, setBrandFilter] = useState("All");
  const [genderFilter, setGenderFilter] = useState("All");
  const [themeFilter, setThemeFilter] = useState("All");
  const [minOverall, setMinOverall] = useState(0);
  const [maxOverall, setMaxOverall] = useState(100);
  const [sortBy, setSortBy] = useState("name_asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  const loadData = () => {
    getBaseWrestlers()
      .then((data) => {
        const enrichedData = data.map(w => {
          const total = w.power + w.technique + w.charisma + w.speed + w.durability + w.ring_iq;
          return { ...w, overall: Math.round(total / 6) };
        });
        setWrestlers(enrichedData);
      })
      .catch(console.error);
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, brandFilter, genderFilter, themeFilter, minOverall, maxOverall, sortBy, itemsPerPage]);

  const handleOpenForm = (wrestler = null) => {
    setSelectedWrestler(wrestler);
    setCurrentView("form");
  };

  const handleCloseForm = (shouldRefresh = false) => {
    setCurrentView("list");
    setSelectedWrestler(null);
    if (shouldRefresh) {
      loadData();
    }
  };

  if (currentView === "form") {
    return <AdminWrestlerForm wrestler={selectedWrestler} onClose={handleCloseForm} />;
  }

  const filteredWrestlers = wrestlers.filter((w) => {
    const safeName = w.name || "";
    const matchesSearch = safeName.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesBrand = false;
    if (brandFilter === "All") {
      matchesBrand = true;
    } else if (brandFilter === "NULL") {
      matchesBrand = !w.brand || w.brand.trim() === "";
    } else {
      matchesBrand = w.brand === brandFilter;
    }

    const matchesOverall = w.overall >= minOverall && w.overall <= maxOverall;
    const matchesGender = genderFilter === "All" || w.gender === genderFilter;

    let matchesTheme = true;
    if (themeFilter === "has_theme") matchesTheme = w.theme_track_id !== null;
    if (themeFilter === "no_theme") matchesTheme = w.theme_track_id === null;

    return matchesSearch && matchesBrand && matchesOverall && matchesGender && matchesTheme;
  });

  const sortedWrestlers = [...filteredWrestlers].sort((a, b) => {
    if (sortBy === "name_asc") return (a.name || "").localeCompare(b.name || "");
    if (sortBy === "name_desc") return (b.name || "").localeCompare(a.name || "");
    if (sortBy === "overall_desc") return b.overall - a.overall;
    if (sortBy === "overall_asc") return a.overall - b.overall;
    return 0;
  });

  const isAll = itemsPerPage === "All";
  const totalPages = isAll ? 1 : Math.max(1, Math.ceil(sortedWrestlers.length / itemsPerPage));

  const startIndex = (currentPage - 1) * (isAll ? sortedWrestlers.length : itemsPerPage);
  const endIndex = isAll ? sortedWrestlers.length : startIndex + itemsPerPage;

  const currentWrestlers = sortedWrestlers.slice(startIndex, endIndex);

  const handleFirstPage = () => setCurrentPage(1);
  const handlePrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const handleLastPage = () => setCurrentPage(totalPages);

  return (
    <div className="admin-wrestlers">
      <div className="admin-header">
        <div className="header-left-group">
          <button className="btn-back-admin" onClick={() => navigate(-1)} title="Volver">
            <i className="fas fa-arrow-left"></i>
          </button>
          <h2>Panel de Administrador - Luchadores</h2>
        </div>

        <button className="btn-create" onClick={() => handleOpenForm()}>
          <i className="fas fa-plus"></i> Nuevo Luchador
        </button>
      </div>

      <div className="filters-container">
        <input
          type="text"
          placeholder="Buscar..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="admin-input"
        />

        <select value={brandFilter} onChange={(e) => setBrandFilter(e.target.value)} className="admin-input">
          <option value="All">Todas las marcas</option>
          <option value="RAW">RAW</option>
          <option value="SmackDown">SmackDown</option>
          <option value="NXT">NXT</option>
          <option value="NULL">Agentes Libre</option>
        </select>

        <select value={genderFilter} onChange={(e) => setGenderFilter(e.target.value)} className="admin-input">
          <option value="All">Ambos géneros</option>
          <option value="male">Masculino</option>
          <option value="female">Femenino</option>
        </select>

        <select value={themeFilter} onChange={(e) => setThemeFilter(e.target.value)} className="admin-input">
          <option value="All">Tema musical: Todos</option>
          <option value="has_theme">Con canción asignada</option>
          <option value="no_theme">Falta canción asignada</option>
        </select>

        <div className="range-filter">
          <label>Media:</label>
          <input
            type="number" min="0" max={maxOverall}
            value={minOverall} onChange={(e) => setMinOverall(Number(e.target.value))}
            className="admin-input small-number"
          />
          <span> - </span>
          <input
            type="number" min={minOverall} max="100"
            value={maxOverall} onChange={(e) => setMaxOverall(Number(e.target.value))}
            className="admin-input small-number"
          />
        </div>

        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="admin-input">
          <option value="name_asc">Nombre (A-Z)</option>
          <option value="name_desc">Nombre (Z-A)</option>
          <option value="overall_desc">Media (Mayor a Menor)</option>
          <option value="overall_asc">Media (Menor a Mayor)</option>
        </select>
      </div>

      <div className="wrestlers-grid">
        {currentWrestlers.map((w) => (
          <div key={w.id} className="wrestler-card" onClick={() => handleOpenForm(w)} style={{ cursor: "pointer" }}>
            <div className="wrestler-image">
              <img
                src={w.image_url}
                alt={w.name || "Desconocido"}
                loading="lazy"
                decoding="async"
              />
              <div className="overall-badge">
                {w.overall}
              </div>
              {w.theme_track_id && (
                <div className="theme-badge" title="Tiene canción asignada">
                  <i className="fas fa-music"></i>
                </div>
              )}
            </div>
            <div className="wrestler-info">
              <h3>
                {w.name || "Luchador sin nombre"}
                <i className={`fas ${w.gender === 'male' ? 'fa-mars' : 'fa-venus'} gender-icon`}></i>
              </h3>
              <span className={`brand-badge ${(w.brand || "none").toLowerCase()}`}>
                {w.brand || "Agente Libre"}
              </span>
            </div>
          </div>
        ))}

        {sortedWrestlers.length === 0 && (
          <p className="no-results">No se encontraron luchadores con estos filtros.</p>
        )}
      </div>

      <div className="pagination-wrapper">
        <div className="items-per-page">
          <label>Mostrar:</label>
          <div className="per-page-toggle">
            {[12, 24, 48, "All"].map((value) => (
              <button
                key={value}
                className={`toggle-btn ${itemsPerPage === value ? "active" : ""}`}
                onClick={() => setItemsPerPage(value)}
              >
                {value === "All" ? "Todos" : value}
              </button>
            ))}
          </div>
        </div>

        {totalPages > 1 && (
          <div className="pagination-controls">
            <button onClick={handleFirstPage} disabled={currentPage === 1} className="btn-paginate" title="Ir al principio">
              <i className="fas fa-angle-double-left"></i>
            </button>
            <button onClick={handlePrevPage} disabled={currentPage === 1} className="btn-paginate" title="Anterior">
              <i className="fas fa-angle-left"></i>
            </button>

            <span className="page-info">
              Página {currentPage} de {totalPages}
            </span>

            <button onClick={handleNextPage} disabled={currentPage === totalPages} className="btn-paginate" title="Siguiente">
              <i className="fas fa-angle-right"></i>
            </button>
            <button onClick={handleLastPage} disabled={currentPage === totalPages} className="btn-paginate" title="Ir al final">
              <i className="fas fa-angle-double-right"></i>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}