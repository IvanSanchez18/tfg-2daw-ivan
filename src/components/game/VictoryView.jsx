import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import "./victoryView.scss"

const VictoryView = ({ onFinish }) => {
  const { t, i18n } = useTranslation("arcadeFightZone");

  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 4000);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="victory-screen">
      <div className="victory-content">
        <h1 className="victory-title">{t("you_win")}</h1>
        <p className="victory-subtitle">{t("all_opponents_defeated")}</p>

        <div className="victory-divider" />

        <p className="victory-run">{t("masterful_performance")}</p>
      </div>
    </div>
  );
};

export default VictoryView;