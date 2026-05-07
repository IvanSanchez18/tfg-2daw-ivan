import { useEffect, useState, useRef } from "react";
import { useSfxVolume } from "../../context/SfxVolumeContext";
import "./loadingScreen.scss";

const MIN_TIME = 1000;

const LoadingScreen = ({ active = true }) => {
  const audioRef = useRef(null);
  const [visible, setVisible] = useState(active);
  const { sfxVolume } = useSfxVolume();

  useEffect(() => {
    let timeout;

    if (active) {
      setVisible(true);
      if (audioRef.current && sfxVolume != null) {
        audioRef.current.volume = Math.max(0, Math.min(1, sfxVolume / 100));
        audioRef.current.play().catch(() => { });
      }
    } else {
      timeout = setTimeout(() => {
        setVisible(false);
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
      }, MIN_TIME);
    }

    return () => clearTimeout(timeout);
  }, [active, sfxVolume]);

  useEffect(() => {
    document.body.style.overflow = visible ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="loading-screen">
      <img src="/wrestling_universe/images/Wwe.jpg" alt="Cargando..." className="loading-image" />
      <audio ref={audioRef} src="/wrestling_universe/music/transition.mp3" preload="auto" />
    </div>
  );
};

export default LoadingScreen;