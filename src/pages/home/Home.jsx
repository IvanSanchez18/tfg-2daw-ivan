import { useState } from "react";
import { useTranslation } from "react-i18next";
import HomeCard from "../../components/home/HomeCard";
import "./home.scss";

const Home = () => {
  const { t } = useTranslation("home");
  const [currentView, setCurrentView] = useState("main");

  const handleGamesClick = (e) => {
    e.preventDefault();
    setCurrentView("games");
  };

  const renderMainView = () => (
    <>
      <div className="home__right">
        <HomeCard
          title={t("universe")}
          image="/wrestling_universe/images/homeUniverse.webp"
          to="/universe"
          focusX="50%"
          focusY="20%"
          className="focus-universe"
        />
        <div className="home-card-wrapper" onClick={handleGamesClick}>
          <HomeCard
            title={t("games")}
            image="/wrestling_universe/images/homeGames.jpg"
            to="#"
            focusX="10%"
            focusY="0%"
            className="focus-game"
          />
        </div>
      </div>
      <div className="home__right">
        <HomeCard
          title={t("options")}
          image="/wrestling_universe/images/options.jpg"
          to="/options"
          focusX="60%"
          focusY="1%"
          className="focus-options"
        />
        <HomeCard
          title={t("jukebox")}
          image="/wrestling_universe/images/jukebox.jpg"
          to="/jukebox"
          focusX="50%"
          focusY="10%"
          className="focus-jukebox"
        />
      </div>
    </>
  );

  const renderGamesView = () => (
    <>
      <button className="back-button-home" onClick={() => setCurrentView("main")}>
        {t("back")}
      </button>

      <div className="home__left">
        <HomeCard
          title="MyGM"
          image="/wrestling_universe/images/mygm.avif"
          to="/mygm"
          focusX="20%"
          focusY="50%"
          className="focus-mygm"
        />
      </div>
      <div className="home__left">
        <HomeCard
          title={t("arcadeFightZone")}
          image="/wrestling_universe/images/arcadeFightZone.png"
          to="/game"
          focusX="50%"
          focusY="50%"
          className="focus-game"
        />
      </div>
    </>
  );

  return (
    <div className="home">
      {currentView === "main" ? renderMainView() : renderGamesView()}
    </div>
  );
};

export default Home;