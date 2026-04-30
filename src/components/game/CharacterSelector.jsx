import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import "./characterSelector.scss";

// PROFILE
import takerProfile from "../../assets/Taker/Taker-profile.png";
import rockProfile from "../../assets/Rock/Rock-profile.png";
import cenaProfile from "../../assets/Cena/Cena-profile.png";
import hoganProfile from "../../assets/Hogan/Hogan-profile.png";
import reyProfile from "../../assets/Rey/Rey-profile.png";
import stonecoldProfile from "../../assets/StoneCold/StoneCold-profile.png";
import romanProfile from "../../assets/Roman/Roman-profile.png";
import vaquerProfile from "../../assets/Vaquer/Vaquer-profile.png";
import pentaProfile from "../../assets/Penta/Penta-profile.png";
import livProfile from "../../assets/Liv/Liv-profile.png";
import rheaProfile from "../../assets/Rhea/Rhea-profile.png";
import lyraProfile from "../../assets/Lyra/Lyra-profile.png";

// IDLE
import takerIdle from "../../assets/Taker/Taker-idle-1.png";
import rockIdle from "../../assets/Rock/Rock-idle-1.png";
import cenaIdle from "../../assets/Cena/Cena-idle-1.png";
import hoganIdle from "../../assets/Hogan/Hogan-idle-1.png";
import reyIdle from "../../assets/Rey/Rey-idle-1.png";
import stonecoldIdle from "../../assets/StoneCold/StoneCold-idle-1.png";
import romanIdle from "../../assets/Roman/Roman-idle-1.png";
import vaquerIdle from "../../assets/Vaquer/Vaquer-idle-1.png";
import pentaIdle from "../../assets/Penta/Penta-idle-1.png";
import livIdle from "../../assets/Liv/Liv-idle-1.png";
import rheaIdle from "../../assets/Rhea/Rhea-idle-1.png";
import lyraIdle from "../../assets/Lyra/Lyra-idle-1.png";

// SOUNDS
import takerSound from "../../assets/Taker/taker.mp3";
import stonecoldSound from "../../assets/StoneCold/stonecold.mp3";
import rockSound from "../../assets/Rock/rock.mp3";
import cenaSound from "../../assets/Cena/cena.mp3";
import hoganSound from "../../assets/Hogan/hogan.mp3";
import reySound from "../../assets/Rey/rey.mp3";
import romanSound from "../../assets/Roman/roman.mp3";
import vaquerSound from "../../assets/Vaquer/vaquer.mp3";
import pentaSound from "../../assets/Penta/penta.mp3";
import livSound from "../../assets/Liv/liv.mp3";
import rheaSound from "../../assets/Rhea/rhea.mp3";
import lyraSound from "../../assets/Lyra/Lyra.mp3";

import changeSound from "../../assets/sounds/change-character.mp3";

const baseCharacters = [
  { name: "Cena", profile: cenaProfile, idle: cenaIdle, sound: cenaSound },
  { name: "Hogan", profile: hoganProfile, idle: hoganIdle, sound: hoganSound },
  { name: "Liv", profile: livProfile, idle: livIdle, sound: livSound },
  { name: "Lyra", profile: lyraProfile, idle: lyraIdle, sound: lyraSound },
  { name: "Penta", profile: pentaProfile, idle: pentaIdle, sound: pentaSound },
  { name: "Rey", profile: reyProfile, idle: reyIdle, sound: reySound },
  { name: "Rhea", profile: rheaProfile, idle: rheaIdle, sound: rheaSound },
  { name: "Rock", profile: rockProfile, idle: rockIdle, sound: rockSound },
  { name: "Roman", profile: romanProfile, idle: romanIdle, sound: romanSound },
  { name: "StoneCold", profile: stonecoldProfile, idle: stonecoldIdle, sound: stonecoldSound },
  { name: "Taker", profile: takerProfile, idle: takerIdle, sound: takerSound },
  { name: "Vaquer", profile: vaquerProfile, idle: vaquerIdle, sound: vaquerSound },
];

const characters = [...baseCharacters, ...baseCharacters, ...baseCharacters].slice(0, 12);

const CharacterSelector = ({ onSelect, onBack, defeatedCharacters = [], lockedPlayer = null }) => {
  const { t, i18n } = useTranslation("arcadeFightZone");

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [introPlaying, setIntroPlaying] = useState(false);
  const [playerLocked, setPlayerLocked] = useState(false);
  const [rivalIndex, setRivalIndex] = useState(null);
  const [rivalSelecting, setRivalSelecting] = useState(false);
  const [showVS, setShowVS] = useState(false);

  const inputLockedRef = useRef(false);
  const gridRef = useRef(null);

  const changeAudioRef = useRef(new Audio(changeSound));
  const playingAudioRef = useRef(null);

  const handleBack = () => {
    if (changeAudioRef.current) changeAudioRef.current.pause();
    if (playingAudioRef.current) playingAudioRef.current.pause();
    if (onBack) onBack();
  };

  const handleAccept = (e) => {
    if (e && e.currentTarget) e.currentTarget.blur();

    if (introPlaying || inputLockedRef.current) return;

    const selectedCharacter = characters[selectedIndex];

    if (lockedPlayer && selectedCharacter.name !== lockedPlayer.name) return;
    if (defeatedCharacters.includes(selectedCharacter.name)) return;

    inputLockedRef.current = true;
    setPlayerLocked(true);
    setIntroPlaying(true);

    const acceptAudio = new Audio(selectedCharacter.sound);
    acceptAudio.volume = 0.9;

    playingAudioRef.current = acceptAudio;
    acceptAudio.play();

    acceptAudio.onended = () => {
      startRivalSelection(selectedCharacter);
    };
  };

  const startRivalSelection = (playerCharacter) => {
    setRivalSelecting(true);

    const availableIndexes = characters
      .map((c, i) => ({ name: c.name, index: i }))
      .filter(
        c =>
          c.name !== playerCharacter.name &&
          !defeatedCharacters.includes(c.name)
      );

    if (availableIndexes.length === 0) {
      console.warn("No quedan rivales disponibles");
      return;
    }

    const finalPick =
      availableIndexes[
        Math.floor(Math.random() * availableIndexes.length)
      ].index;

    let current = 0;
    let speed = 40;
    let loops = 0;

    const minLoops = 2;

    const changeSound = changeAudioRef.current;
    changeSound.currentTime = 0;
    changeSound.loop = true;
    changeSound.play();

    const spin = () => {
      if (characters[current].name === playerCharacter.name) {
        current++;
        if (current >= characters.length) {
          current = 0;
          loops++;
        }
      }

      setRivalIndex(current);

      if (loops >= minLoops && current === finalPick) {
        changeSound.pause();
        setRivalSelecting(false);

        const rivalAudio = new Audio(characters[finalPick].sound);
        rivalAudio.volume = 0.9;

        playingAudioRef.current = rivalAudio;
        rivalAudio.play();

        rivalAudio.onended = () => {
          setShowVS(true);

          setTimeout(() => {
            onSelect({
              player: playerCharacter,
              rival: characters[finalPick],
            });

            setShowVS(false);
            setRivalIndex(null);
            setRivalSelecting(false);
            setIntroPlaying(false);
          }, 2200);
        };

        return;
      }

      current++;

      if (current >= characters.length) {
        current = 0;
        loops++;
      }

      if (loops >= 1) {
        speed += 5;
      }

      setTimeout(spin, speed);
    };

    spin();
  };

  useEffect(() => {
    return () => {
      if (changeAudioRef.current) {
        changeAudioRef.current.pause();
        changeAudioRef.current.currentTime = 0;
      }
      if (playingAudioRef.current) {
        playingAudioRef.current.pause();
        playingAudioRef.current.currentTime = 0;
      }
    };
  }, []);

  useEffect(() => {
    if (!lockedPlayer) return;

    const index = characters.findIndex(
      c => c.name === lockedPlayer.name
    );

    if (index !== -1) {
      setSelectedIndex(index);
    }
  }, [lockedPlayer]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (inputLockedRef.current || introPlaying) return;

      if (e.key === "Enter") {
        handleAccept();
        return;
      }

      if (lockedPlayer || playerLocked) return;

      const grid = gridRef.current;
      if (!grid) return;

      const cards = Array.from(grid.children);
      const currentCard = cards[selectedIndex];
      if (!currentCard) return;

      const currentRect = currentCard.getBoundingClientRect();
      let targetIndex = selectedIndex;

      if (e.key === "ArrowRight") {
        targetIndex = (selectedIndex + 1) % characters.length;
      }

      if (e.key === "ArrowLeft") {
        targetIndex =
          (selectedIndex - 1 + characters.length) % characters.length;
      }

      if (e.key === "ArrowDown") {
        const belowCards = cards.filter(card => {
          const rect = card.getBoundingClientRect();
          return rect.top > currentRect.top + 5;
        });

        if (belowCards.length > 0) {
          const closestRowTop = Math.min(
            ...belowCards.map(card => card.getBoundingClientRect().top)
          );

          const sameRowCards = cards.filter(card => {
            const rect = card.getBoundingClientRect();
            return Math.abs(rect.top - closestRowTop) < 5;
          });

          let closest = sameRowCards[0];
          let minDistance = Infinity;

          sameRowCards.forEach(card => {
            const rect = card.getBoundingClientRect();
            const distance = Math.abs(rect.left - currentRect.left);
            if (distance < minDistance) {
              minDistance = distance;
              closest = card;
            }
          });

          targetIndex = cards.indexOf(closest);
        }
      }

      if (e.key === "ArrowUp") {
        const aboveCards = cards.filter(card => {
          const rect = card.getBoundingClientRect();
          return rect.top < currentRect.top - 5;
        });

        if (aboveCards.length > 0) {
          const closestRowTop = Math.max(
            ...aboveCards.map(card => card.getBoundingClientRect().top)
          );

          const sameRowCards = cards.filter(card => {
            const rect = card.getBoundingClientRect();
            return Math.abs(rect.top - closestRowTop) < 5;
          });

          let closest = sameRowCards[0];
          let minDistance = Infinity;

          sameRowCards.forEach(card => {
            const rect = card.getBoundingClientRect();
            const distance = Math.abs(rect.left - currentRect.left);
            if (distance < minDistance) {
              minDistance = distance;
              closest = card;
            }
          });

          targetIndex = cards.indexOf(closest);
        }
      }

      if (lockedPlayer && characters[targetIndex].name !== lockedPlayer.name) {
        return;
      }

      if (targetIndex !== selectedIndex) {
        const changeSound = changeAudioRef.current;
        changeSound.currentTime = 0;
        changeSound.volume = 0.6;
        changeSound.play().catch(() => { });
      }

      setSelectedIndex(targetIndex);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex, introPlaying, lockedPlayer, playerLocked]);

  return (
    <div className="character-selector-container">
      <h1 className="selector-title">{t("select")}</h1>

      <div className="selector-grid" ref={gridRef}>
        {characters.map((char, index) => {
          const isDefeated = defeatedCharacters.includes(char.name);
          const isLockedPlayer = lockedPlayer?.name === char.name;

          let cardClass = "selector-card";
          if (isDefeated) cardClass += " defeated";
          if (index === selectedIndex && (playerLocked || isLockedPlayer)) cardClass += " locked";
          else if (index === rivalIndex) cardClass += " rival";
          else if (index === selectedIndex) cardClass += " selected";

          let imgClass = "selector-thumbnail";
          if (isDefeated && !isLockedPlayer) imgClass += " defeated-img";

          return (
            <div
              key={index}
              className={cardClass}
              onClick={() => {
                if (introPlaying) return;
                if (isDefeated) return;
                if (playerLocked || lockedPlayer) return;

                setSelectedIndex(index);
              }}
            >
              <img
                src={char.profile}
                alt={char.name}
                className={imgClass}
              />
              <span className="selector-name">{char.name}</span>
            </div>
          );
        })}
      </div>

      <div className="selector-preview">
        <img
          src={characters[selectedIndex].idle}
          alt={characters[selectedIndex].name}
          className="selector-sprite"
        />
      </div>

      {showVS && (
        <div className="vs-overlay">
          <div className="vs-container">
            <div className="vs-player">
              <img src={characters[selectedIndex].idle} alt={characters[selectedIndex].name} className="vs-image" />
              <h2>{characters[selectedIndex].name}</h2>
            </div>

            <div className="vs-text">VS</div>

            <div className="vs-rival">
              <img src={characters[rivalIndex].idle} alt={characters[rivalIndex].name} className="vs-image" />
              <h2>{characters[rivalIndex].name}</h2>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '20px' }}>
        {onBack && (
          <button className="selector-button" style={{ backgroundColor: '#555' }} onClick={handleBack}>
            {t("back")}
          </button>
        )}
        <button className="selector-button" onClick={handleAccept} disabled={introPlaying}>
          {t("accept")}
        </button>
      </div>
    </div>
  );
};

export default CharacterSelector;