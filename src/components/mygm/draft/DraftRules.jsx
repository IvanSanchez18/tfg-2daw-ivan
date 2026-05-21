import "./draftRules.scss";

const DraftRules = ({ setShowRules, currentBrandColor }) => {
  return (
    <div className="rules-overlay">
      <div className="rules-card">
        <h2><i className="fas fa-clipboard-list"></i> Reglas del Draft GM</h2>
        <ul>
          <li><strong>Dinámica de Turnos:</strong> El draft se realiza por rondas con un orden aleatorio. En tu turno, puedes fichar a un luchador. Las marcas rivales (CPU) ficharán automáticamente en sus turnos.</li>
          <li><strong>Gestión de Presupuesto:</strong> Cada superestrella tiene un coste basado en su popularidad (POP). Si agotas tus fondos, no podrás realizar más selecciones. Las marcas rivales también tienen su propio presupuesto.</li>
          <li><strong>Fin del Draft:</strong> Las marcas rivales dejarán de fichar y se plantarán aleatoriamente cuando tengan entre 10 y 15 luchadores. Tú puedes pulsar "Plantarse" cuando creas que tu plantilla está completa.</li>
          <li><strong>Mínimo 10 Luchadores:</strong> Debes fichar al menos 10 superestrellas. Si te plantas sin cumplirlo, el sistema venderá a tu superestrella más cara por las más baratas hasta que llegues al mínimo exigido.</li>
          <li><strong>Sinergias de Combate:</strong> Para obtener buenas calificaciones, busca estilos opuestos. Un Gigante (<strong>Giant</strong>) combina excelente con un Crucero (<strong>Cruiser</strong>). <strong>Brawler</strong> combina con <strong>Fighter</strong>, y <strong>Specialist</strong> contra <strong>Specialist</strong>.</li>
          <li><strong>Luchas por Género:</strong> En esta liga <strong>no se permiten combates intergénero</strong>. Asegúrate de fichar suficiente talento de cada división.</li>
        </ul>
        <button className="start-draft-btn" onClick={() => setShowRules(false)} style={{ backgroundColor: currentBrandColor }}>
          Entendido, Empezar Draft
        </button>
      </div>
    </div>
  );
};

export default DraftRules;