import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { getMyGMGames, getMyGMImages } from "../../services/gameService";
import LoadingScreen from "../../components/loadingScreen/LoadingScreen";
import "./myGMSlots.scss";

const MAX_SLOTS = 3;

const BRANDS = [
  { id: 'raw', name: 'Monday Night Raw', shortName: 'RAW', logo: './images/Raw_logo.png', color: '#d32f2f' },
  { id: 'smackdown', name: 'Friday Night SmackDown', shortName: 'SD', logo: './images/Smackdown_logo.png', color: '#1976d2' },
  { id: 'nxt', name: 'NXT', shortName: 'NXT', logo: './images/Nxt_logo.png', color: '#fbc02d' },
  { id: 'evolve', name: 'Evolve Wrestling', shortName: 'EVOLVE', logo: './images/Evolve_logo.png', color: '#48146b' }
];

const MyGMSlots = () => {
  const [savedGames, setSavedGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showImageSelector, setShowImageSelector] = useState(false);
  const [gmImages, setGmImages] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [games, images] = await Promise.all([
          getMyGMGames(),
          getMyGMImages()
        ]);

        setSavedGames(games);
        setGmImages(images);
      } catch (error) {
        console.error("Error cargando los datos:", error);
      } finally {
        setTimeout(() => setLoading(false), 300);
      }
    };

    fetchData();
  }, []);

  const handleCreateNewGameClick = () => {
    setShowImageSelector(true);
  };

  const handleSelectImage = (img) => {
    Swal.fire({
      title: '¿Elegir este General Manager?',
      imageUrl: img.url,
      imageHeight: 200,
      imageAlt: 'GM Profile',
      showCancelButton: true,
      confirmButtonColor: 'var(--accent)',
      cancelButtonColor: 'var(--text-soft)',
      confirmButtonText: 'Sí, empezar',
      cancelButtonText: 'Cancelar',
      background: 'var(--bg-card)',
      color: 'var(--text-main)',
    }).then((result) => {
      if (result.isConfirmed) {
        setShowImageSelector(false);
        navigate("/mygm/new", { state: { selectedGmImage: img.url } });
      }
    });
  };

  const handleLoadGame = (game) => {
    if (!game.is_drafted) {
      navigate(`/mygm/draft/${game.id}`);
    } else {
      navigate(`/mygm/dashboard/${game.id}`);
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  const emptySlotsCount = MAX_SLOTS - savedGames.length;
  const emptySlots = Array.from({ length: Math.max(0, emptySlotsCount) });

  return (
    <div className="gm-slots-view">
      <div className="slots-content-wrapper">

        <button className="slots-back-button" onClick={() => navigate('/')}>
          <i className="fas fa-arrow-left"></i> VOLVER
        </button>

        <h1 className="slots-title">SELECCIONA UNA PARTIDA</h1>

        <div className="slots-grid">
          {savedGames.map((game) => {
            const brandInfo = BRANDS.find(b => b.id === game.brand) || BRANDS[0];

            return (
              <div
                key={game.id}
                className="slot-card saved-game"
                onClick={() => handleLoadGame(game)}
                style={{ '--brand-color': brandInfo.color }}
              >
                <div className="slot-image-container">
                  <img src={brandInfo.logo} alt={brandInfo.shortName} className="brand-logo-top-right" />

                  {game.game_image ? (
                    <img src={game.game_image} alt={brandInfo.name} className="slot-image" />
                  ) : (
                    <div className="slot-image-placeholder">Sin Imagen</div>
                  )}
                </div>

                <div className="slot-info">
                  <h3>Semana {game.week} / {game.max_weeks}</h3>
                  <p>Presupuesto: ${game.budget.toLocaleString()}</p>
                  <p>Fans: {game.fans.toLocaleString()}</p>
                </div>

                <button
                  className="slot-btn load-btn"
                  style={{ backgroundColor: brandInfo.color }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLoadGame(game);
                  }}
                >
                  CARGAR PARTIDA
                </button>
              </div>
            );
          })}

          {emptySlots.map((_, index) => (
            <div
              key={`empty-${index}`}
              className="slot-card new-game"
              onClick={handleCreateNewGameClick}
            >
              <div className="slot-empty-icon">
                <span>+</span>
              </div>
              <div className="slot-info empty-info">
                <h3>Rendija Vacía</h3>
                <p>Inicia un nuevo camino hacia la gloria.</p>
              </div>
              <button className="slot-btn create-btn">NUEVA PARTIDA</button>
            </div>
          ))}
        </div>
      </div>

      {showImageSelector && (
        <div className="gm-image-selector-overlay" onClick={() => setShowImageSelector(false)}>
          <div className="gm-image-selector-modal" onClick={e => e.stopPropagation()}>
            <h2>SELECCIONA TU GENERAL MANAGER</h2>
            <div className="gm-images-grid">
              {gmImages.length > 0 ? (
                gmImages.map((img, index) => (
                  <div key={index} className="gm-image-option" onClick={() => handleSelectImage(img)}>
                    <img src={img.url} alt={`GM ${index}`} />
                  </div>
                ))
              ) : (
                <p style={{ textAlign: 'center', gridColumn: '1 / -1' }}>No se encontraron imágenes.</p>
              )}
            </div>
            <button className="close-modal-btn" onClick={() => setShowImageSelector(false)}>
              CANCELAR
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyGMSlots;