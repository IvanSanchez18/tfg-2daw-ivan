import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useSfxVolume } from "../../context/SfxVolumeContext";
import "./broadcastInterruption.scss";

export default function BroadcastInterruption() {
    const [isIdle, setIsIdle] = useState(false);
    const { t } = useTranslation("broadcastInterruption");
    const { sfxVolume } = useSfxVolume();
    const audioRef = useRef(null);

    const [currentPhraseKey, setCurrentPhraseKey] = useState("phrase_1");
    const [tick, setTick] = useState(0);

    const phraseKeys = [
        "phrase_1", "phrase_2", "phrase_3", "phrase_4", "phrase_5",
        "phrase_6", "phrase_7", "phrase_8", "phrase_9", "phrase_10"
    ];

    useEffect(() => {
        let timeoutId;

        const resetTimer = () => {
            setIsIdle(false);
            clearTimeout(timeoutId);

            if (document.hidden) return;

            timeoutId = setTimeout(() => {
                const randomIndex = Math.floor(Math.random() * phraseKeys.length);
                setCurrentPhraseKey(phraseKeys[randomIndex]);
                setTick(prev => prev + 1);
                setIsIdle(true);
            }, 300000);
        };

        const handleVisibilityChange = () => {
            if (document.hidden) {
                setIsIdle(false);
                clearTimeout(timeoutId);
            } else {
                resetTimer();
            }
        };

        const events = ["mousemove", "keydown", "mousedown", "touchstart", "scroll"];

        events.forEach(event => window.addEventListener(event, resetTimer));
        document.addEventListener("visibilitychange", handleVisibilityChange);

        resetTimer();

        return () => {
            events.forEach(event => window.removeEventListener(event, resetTimer));
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            clearTimeout(timeoutId);
        };
    }, []);

    useEffect(() => {
        let intervalId;

        if (isIdle) {
            if (audioRef.current && sfxVolume != null) {
                audioRef.current.volume = Math.max(0, Math.min(1, sfxVolume / 100));
                audioRef.current.currentTime = 0;
                audioRef.current.play().catch(() => { });
            }

            intervalId = setInterval(() => {
                const randomIndex = Math.floor(Math.random() * phraseKeys.length);
                setCurrentPhraseKey(phraseKeys[randomIndex]);

                setTick(prev => prev + 1);

                if (audioRef.current && sfxVolume != null) {
                    audioRef.current.volume = Math.max(0, Math.min(1, sfxVolume / 100));
                    audioRef.current.currentTime = 0;
                    audioRef.current.play().catch(() => { });
                }
            }, 10000);
        } else {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
        }

        return () => clearInterval(intervalId);
    }, [isIdle, sfxVolume]);

    if (!isIdle) return null;

    const glitchText = t(currentPhraseKey);

    return (
        <div className="broadcast-interruption">
            <div className="tv-static"></div>

            <div className="fireflies-container">
                <div className="firefly f1"></div><div className="firefly f2"></div>
                <div className="firefly f3"></div><div className="firefly f4"></div>
                <div className="firefly f5"></div><div className="firefly f6"></div>
                <div className="firefly f7"></div><div className="firefly f8"></div>
                <div className="firefly f9"></div><div className="firefly f10"></div>
                <div className="firefly f11"></div><div className="firefly f12"></div>
                <div className="firefly f13"></div><div className="firefly f14"></div>
                <div className="firefly f15"></div>
            </div>

            <div className="content-wrapper">
                <img
                    key={tick}
                    src="./images/Wyatt_logo.png"
                    alt="Wyatt Logo"
                    className="glitch-logo"
                />
                <h2 className="glitch-text" data-text={glitchText}>
                    {glitchText}
                </h2>
            </div>

            <audio
                ref={audioRef}
                src="/wrestling_universe/music/broadcastInterruption.mp3"
                preload="auto"
            />
        </div>
    );
}