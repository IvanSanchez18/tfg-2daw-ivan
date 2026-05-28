import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { UserSettings, AuthService, checkIsAdmin } from "../../services/apiService";
import { useTheme } from "../../context/ThemeContext";
import { useMusicVolume } from "../../context/MusicVolumeContext";
import { useSfxVolume } from "../../context/SfxVolumeContext";
import LoadingScreen from "../../components/loadingScreen/LoadingScreen";
import "./options.scss";

const LANGUAGES = [
  { code: "es", flag: "/wrestling_universe/images/flags/es.png" },
  { code: "en", flag: "/wrestling_universe/images/flags/us.png" },
  { code: "jp", flag: "/wrestling_universe/images/flags/jp.png" },
  { code: "fr", flag: "/wrestling_universe/images/flags/fr.png" },
  { code: "it", flag: "/wrestling_universe/images/flags/it.png" },
  { code: "pt-BR", flag: "/wrestling_universe/images/flags/br.png" },
  { code: "kr", flag: "/wrestling_universe/images/flags/kr.png" },
  { code: "tr", flag: "/wrestling_universe/images/flags/tr.png" },
  { code: "pl", flag: "/wrestling_universe/images/flags/pl.png" },
  { code: "hi", flag: "/wrestling_universe/images/flags/in.png" },
  { code: "es-MX", flag: "/wrestling_universe/images/flags/mx.png" },
  { code: "hu", flag: "/wrestling_universe/images/flags/hu.png" },
  { code: "id", flag: "/wrestling_universe/images/flags/id.png" },
  { code: "fil", flag: "/wrestling_universe/images/flags/ph.png" },
  { code: "zh-CN", flag: "/wrestling_universe/images/flags/china.png" },
];

export default function Options() {
  const { t, i18n } = useTranslation("options");
  const navigate = useNavigate();
  const { darkMode, updateDarkMode } = useTheme();
  const { musicVolume, setMusicVolume } = useMusicVolume();
  const [language, setLanguage] = useState("es");
  const [languageOpen, setLanguageOpen] = useState(false);
  const [intergender, setIntergender] = useState(false);
  const { sfxVolume, setSfxVolume } = useSfxVolume();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const sortedLanguages = useMemo(() => {
    return [...LANGUAGES].sort((a, b) =>
      t(`languages.${a.code}`).localeCompare(t(`languages.${b.code}`), i18n.language)
    );
  }, [t, i18n.language]);

  const handleLogout = async () => {
    try {
      await AuthService.logout();
      navigate("/login", { replace: true });
    } catch (err) {
      console.error("Error al cerrar sesión:", err);
    }
  };

  const currentLanguage = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];

  useEffect(() => {
    const loadData = async () => {
      try {
        const [settingsData, adminStatus] = await Promise.all([
          UserSettings.get(),
          checkIsAdmin()
        ]);

        if (settingsData.language) setLanguage(settingsData.language);
        if (typeof settingsData.intergender === "boolean") setIntergender(settingsData.intergender);
        if (typeof settingsData.sfx_volume === "number") setSfxVolume(settingsData.sfx_volume);

        setIsAdmin(adminStatus);

      } catch (err) {
        console.error("Error cargando settings o estado admin:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (loading || musicVolume == null) return;
  }, [musicVolume, loading]);

  useEffect(() => {
    if (loading || sfxVolume == null) return;
    const timer = setTimeout(() => {
      UserSettings.updateSfxVolume(sfxVolume);
    }, 400);
    return () => clearTimeout(timer);
  }, [sfxVolume, loading]);

  return (
    <>
      <LoadingScreen active={loading} />

      {!loading && (
        <div className="options-container">
          <div className="options-card">
            <header className="options-header">
              <button className="back-button" onClick={() => navigate(-1)}>
                {t("back")}
              </button>
              <h2>{t("options")}</h2>
            </header>

            <div className="options-group">
              <label>{t("language")}</label>
              <div className="language-selector">
                <button className="language-current" onClick={() => setLanguageOpen(!languageOpen)}>
                  <img src={currentLanguage.flag} alt={t(`languages.${currentLanguage.code}`)} />
                  <span>{t(`languages.${currentLanguage.code}`)}</span>
                </button>
                {languageOpen && (
                  <ul className="language-list">
                    {sortedLanguages.map(lang => (
                      <li key={lang.code} onClick={() => {
                        setLanguage(lang.code);
                        i18n.changeLanguage(lang.code);
                        UserSettings.updateLanguage(lang.code);
                        setLanguageOpen(false);
                      }}>
                        <img src={lang.flag} alt={t(`languages.${lang.code}`)} />
                        <span>{t(`languages.${lang.code}`)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="options-group">
              <label>{t("interfaceMode")}</label>
              <label className="switch">
                <input type="checkbox" checked={darkMode} onChange={e => updateDarkMode(e.target.checked)} />
                <span className="slider" />
              </label>
            </div>

            <div className="options-group">
              <label>{t("musicVolume")}</label>
              <div className="volume-row">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={musicVolume}
                  onChange={e => setMusicVolume(Number(e.target.value))}
                />
                <span className="volume-value">{musicVolume}</span>
              </div>
            </div>

            <div className="options-group">
              <label>{t("sfxVolume")}</label>
              <div className="volume-row">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sfxVolume}
                  onChange={e => setSfxVolume(Number(e.target.value))}
                />
                <span className="volume-value">{sfxVolume}</span>
              </div>
            </div>

            <div className="options-group">
              <label>{t("intergenderFights")}</label>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={intergender}
                  onChange={e => {
                    const value = e.target.checked;
                    setIntergender(value);
                    UserSettings.updateIntergender(value);
                  }}
                />
                <span className="slider" />
              </label>
            </div>

            {isAdmin && (
              <div className="options-admin">
                <button className="admin-btn" onClick={() => navigate("/admin/wrestlers")}>
                  <i className="fa-solid fa-crown"></i> {t("adminPanel")}
                </button>
              </div>
            )}

            <div className="options-actions">
              <button className="secondary" onClick={() => navigate("/login")}>{t("changeAccount")}</button>
              <button className="danger" onClick={handleLogout}>{t("logout")}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}