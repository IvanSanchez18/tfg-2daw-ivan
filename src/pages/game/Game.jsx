import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import HealthBar from "../../components/game/HealthBar";
import CharacterSelector from "../../components/game/CharacterSelector";
import VictoryView from "../../components/game/VictoryView";
import "./game.scss";

// TAKER
import idle from "../../assets/Taker/Taker-idle-1.png";
import walk1 from "../../assets/Taker/Taker-walk-1.png";
import walk2 from "../../assets/Taker/Taker-walk-2.png";
import walk3 from "../../assets/Taker/Taker-walk-3.png";
import walk4 from "../../assets/Taker/Taker-walk-4.png";
import walk5 from "../../assets/Taker/Taker-walk-5.png";
import punch from "../../assets/Taker/Taker-punch-1.png";

// REY
import reyIdle from "../../assets/Rey/Rey-idle-1.png";
import reyWalk1 from "../../assets/Rey/Rey-walk-1.png";
import reyWalk2 from "../../assets/Rey/Rey-walk-2.png";
import reyWalk3 from "../../assets/Rey/Rey-walk-3.png";
import reyWalk4 from "../../assets/Rey/Rey-walk-4.png";
import reyWalk5 from "../../assets/Rey/Rey-walk-5.png";
import reyPunch from "../../assets/Rey/Rey-punch-1.png";

// Rock
import rockIdle from "../../assets/Rock/Rock-idle-1.png";
import rockWalk1 from "../../assets/Rock/Rock-walk-1.png";
import rockWalk2 from "../../assets/Rock/Rock-walk-2.png";
import rockWalk3 from "../../assets/Rock/Rock-walk-3.png";
import rockWalk4 from "../../assets/Rock/Rock-walk-4.png";
import rockWalk5 from "../../assets/Rock/Rock-walk-5.png";
import rockPunch from "../../assets/Rock/Rock-punch-1.png";

// Hogan
import hoganIdle from "../../assets/Hogan/Hogan-idle-1.png";
import hoganWalk1 from "../../assets/Hogan/Hogan-walk-1.png";
import hoganWalk2 from "../../assets/Hogan/Hogan-walk-2.png";
import hoganWalk3 from "../../assets/Hogan/Hogan-walk-3.png";
import hoganWalk4 from "../../assets/Hogan/Hogan-walk-4.png";
import hoganWalk5 from "../../assets/Hogan/Hogan-walk-5.png";
import hoganPunch from "../../assets/Hogan/Hogan-punch-1.png";

// Cena
import cenaIdle from "../../assets/Cena/Cena-idle-1.png";
import cenaWalk1 from "../../assets/Cena/Cena-walk-1.png";
import cenaWalk2 from "../../assets/Cena/Cena-walk-2.png";
import cenaWalk3 from "../../assets/Cena/Cena-walk-3.png";
import cenaWalk4 from "../../assets/Cena/Cena-walk-4.png";
import cenaWalk5 from "../../assets/Cena/Cena-walk-5.png";
import cenaPunch from "../../assets/Cena/Cena-punch-1.png";

// RHEA
import rheaIdle from "../../assets/Rhea/Rhea-idle-1.png";
import rheaWalk1 from "../../assets/Rhea/Rhea-walk-1.png";
import rheaWalk2 from "../../assets/Rhea/Rhea-walk-2.png";
import rheaWalk3 from "../../assets/Rhea/Rhea-walk-3.png";
import rheaWalk4 from "../../assets/Rhea/Rhea-walk-4.png";
import rheaWalk5 from "../../assets/Rhea/Rhea-walk-5.png";
import rheaPunch from "../../assets/Rhea/Rhea-punch-1.png";

// LIV
import livIdle from "../../assets/Liv/Liv-idle-1.png";
import livWalk1 from "../../assets/Liv/Liv-walk-1.png";
import livWalk2 from "../../assets/Liv/Liv-walk-2.png";
import livWalk3 from "../../assets/Liv/Liv-walk-3.png";
import livWalk4 from "../../assets/Liv/Liv-walk-4.png";
import livWalk5 from "../../assets/Liv/Liv-walk-5.png";
import livPunch from "../../assets/Liv/Liv-punch-1.png";

// LYRA
import lyraIdle from "../../assets/Lyra/Lyra-idle-1.png";
import lyraWalk1 from "../../assets/Lyra/Lyra-walk-1.png";
import lyraWalk2 from "../../assets/Lyra/Lyra-walk-2.png";
import lyraWalk3 from "../../assets/Lyra/Lyra-walk-3.png";
import lyraWalk4 from "../../assets/Lyra/Lyra-walk-4.png";
import lyraWalk5 from "../../assets/Lyra/Lyra-walk-5.png";
import lyraPunch from "../../assets/Lyra/Lyra-punch-1.png";

// ROMAN
import romanIdle from "../../assets/Roman/Roman-idle-1.png";
import romanWalk1 from "../../assets/Roman/Roman-walk-1.png";
import romanWalk2 from "../../assets/Roman/Roman-walk-2.png";
import romanWalk3 from "../../assets/Roman/Roman-walk-3.png";
import romanWalk4 from "../../assets/Roman/Roman-walk-4.png";
import romanWalk5 from "../../assets/Roman/Roman-walk-5.png";
import romanPunch from "../../assets/Roman/Roman-punch-1.png";

// PENTA
import pentaIdle from "../../assets/Penta/Penta-idle-1.png";
import pentaWalk1 from "../../assets/Penta/Penta-walk-1.png";
import pentaWalk2 from "../../assets/Penta/Penta-walk-2.png";
import pentaWalk3 from "../../assets/Penta/Penta-walk-3.png";
import pentaWalk4 from "../../assets/Penta/Penta-walk-4.png";
import pentaWalk5 from "../../assets/Penta/Penta-walk-5.png";
import pentaPunch from "../../assets/Penta/Penta-punch-1.png";

// STONECOLD
import stonecoldIdle from "../../assets/StoneCold/StoneCold-idle-1.png";
import stonecoldWalk1 from "../../assets/StoneCold/StoneCold-walk-1.png";
import stonecoldWalk2 from "../../assets/StoneCold/StoneCold-walk-2.png";
import stonecoldWalk3 from "../../assets/StoneCold/StoneCold-walk-3.png";
import stonecoldWalk4 from "../../assets/StoneCold/StoneCold-walk-4.png";
import stonecoldWalk5 from "../../assets/StoneCold/StoneCold-walk-5.png";
import stonecoldPunch from "../../assets/StoneCold/StoneCold-punch-1.png";

// VAQUER
import vaquerIdle from "../../assets/Vaquer/Vaquer-idle-1.png";
import vaquerWalk1 from "../../assets/Vaquer/Vaquer-walk-1.png";
import vaquerWalk2 from "../../assets/Vaquer/Vaquer-walk-2.png";
import vaquerWalk3 from "../../assets/Vaquer/Vaquer-walk-3.png";
import vaquerWalk4 from "../../assets/Vaquer/Vaquer-walk-4.png";
import vaquerWalk5 from "../../assets/Vaquer/Vaquer-walk-5.png";
import vaquerPunch from "../../assets/Vaquer/Vaquer-punch-1.png";

import round1 from "../../assets/sounds/Round-1.mp3";
import round2 from "../../assets/sounds/Round-2.mp3";
import finalround from "../../assets/sounds/Final-Round.mp3";

const walkFrames = [walk1, walk2, walk3, walk4, walk5];
const reyWalkFrames = [reyWalk1, reyWalk2, reyWalk3, reyWalk4, reyWalk5];
const hoganWalkFrames = [hoganWalk1, hoganWalk2, hoganWalk3, hoganWalk4, hoganWalk5];
const rockWalkFrames = [rockWalk1, rockWalk2, rockWalk3, rockWalk4, rockWalk5];
const cenaWalkFrames = [cenaWalk1, cenaWalk2, cenaWalk3, cenaWalk4, cenaWalk5];
const rheaWalkFrames = [rheaWalk1, rheaWalk2, rheaWalk3, rheaWalk4, rheaWalk5];
const livWalkFrames = [livWalk1, livWalk2, livWalk3, livWalk4, livWalk5];
const lyraWalkFrames = [lyraWalk1, lyraWalk2, lyraWalk3, lyraWalk4, lyraWalk5];
const romanWalkFrames = [romanWalk1, romanWalk2, romanWalk3, romanWalk4, romanWalk5];
const pentaWalkFrames = [pentaWalk1, pentaWalk2, pentaWalk3, pentaWalk4, pentaWalk5];
const stonecoldWalkFrames = [stonecoldWalk1, stonecoldWalk2, stonecoldWalk3, stonecoldWalk4, stonecoldWalk5];
const vaquerWalkFrames = [vaquerWalk1, vaquerWalk2, vaquerWalk3, vaquerWalk4, vaquerWalk5];

const characterData = {
  Taker: {
    idle,
    walkFrames,
    punch,
  },
  Rey: {
    idle: reyIdle,
    walkFrames: reyWalkFrames,
    punch: reyPunch,
  },
  Hogan: {
    idle: hoganIdle,
    walkFrames: hoganWalkFrames,
    punch: hoganPunch,
  },
  Rock: {
    idle: rockIdle,
    walkFrames: rockWalkFrames,
    punch: rockPunch,
  },
  Cena: {
    idle: cenaIdle,
    walkFrames: cenaWalkFrames,
    punch: cenaPunch,
  },
  Rhea: {
    idle: rheaIdle,
    walkFrames: rheaWalkFrames,
    punch: rheaPunch,
  },
  Liv: {
    idle: livIdle,
    walkFrames: livWalkFrames,
    punch: livPunch,
  },
  Lyra: {
    idle: lyraIdle,
    walkFrames: lyraWalkFrames,
    punch: lyraPunch,
  },
  Roman: {
    idle: romanIdle,
    walkFrames: romanWalkFrames,
    punch: romanPunch,
  },
  Penta: {
    idle: pentaIdle,
    walkFrames: pentaWalkFrames,
    punch: pentaPunch,
  },
  StoneCold: {
    idle: stonecoldIdle,
    walkFrames: stonecoldWalkFrames,
    punch: stonecoldPunch,
  },
  Vaquer: {
    idle: vaquerIdle,
    walkFrames: vaquerWalkFrames,
    punch: vaquerPunch,
  },
};

function Game() {
  const { t, i18n } = useTranslation("arcadeFightZone");
  const navigate = useNavigate();

  const [playerCharacter, setPlayerCharacter] = useState(null);
  const [enemyCharacter, setEnemyCharacter] = useState(null);

  const [playerPos, setPlayerPos] = useState({ x: 30, y: 60 });
  const [enemyPos, setEnemyPos] = useState({ x: 70, y: 60 });

  const [playerState, setPlayerState] = useState("idle");
  const [enemyState, setEnemyState] = useState("idle");

  const [playerFrame, setPlayerFrame] = useState(0);
  const [enemyFrame, setEnemyFrame] = useState(0);

  const [playerDir, setPlayerDir] = useState("right");
  const [enemyDir, setEnemyDir] = useState("left");

  const [playerHealth, setPlayerHealth] = useState(10);
  const [enemyHealth, setEnemyHealth] = useState(10);

  const [score, setScore] = useState(0);

  const playerSprites = playerCharacter ? characterData[playerCharacter.name] : null;

  const enemySprites = enemyCharacter
    ? characterData[enemyCharacter.name]
    : null;

  const [round, setRound] = useState(1);
  const [roundLosers, setRoundLosers] = useState([]);
  const [roundText, setRoundText] = useState("ROUND 1");
  const [controlsLocked, setControlsLocked] = useState(true);

  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [endText, setEndText] = useState("");

  const [defeatedCharacters, setDefeatedCharacters] = useState([]);

  const [showVictory, setShowVictory] = useState(false);

  const resetPositions = () => {
    setPlayerPos({ x: 30, y: 60 });
    setEnemyPos({ x: 70, y: 60 });
    setPlayerState("idle");
    setEnemyState("idle");
  };

  const MIN_Y = 10;
  const MAX_Y = 93;

  const resetFullGame = () => {
    setPlayerCharacter(null);
    setEnemyCharacter(null);

    setDefeatedCharacters([]);

    setPlayerHealth(10);
    setEnemyHealth(10);

    setRound(1);
    setRoundLosers([]);
    setRoundText("ROUND 1");

    setControlsLocked(true);
    setGameOver(false);
    setWinner(null);
    setEndText("");

    setScore(0);
  };

  useEffect(() => {
    if (!playerCharacter || !enemyCharacter) return;

    setRound(1);
    setRoundText("ROUND 1");
    setControlsLocked(true);
    resetPositions();

    const timer = setTimeout(() => {
      setRoundText("");
      setControlsLocked(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [playerCharacter, enemyCharacter]);

  useEffect(() => {
    if (playerHealth > 0 && enemyHealth > 0 || gameOver) return;

    setControlsLocked(true);

    const loser = playerHealth <= 0 ? "player" : "enemy";
    const updatedLosers = [...roundLosers, loser];
    setRoundLosers(updatedLosers);

    const playerLosses = updatedLosers.filter(l => l === "player").length;
    const enemyLosses = updatedLosers.filter(l => l === "enemy").length;

    if (playerLosses === 2 || enemyLosses === 2) {
      const win = playerLosses === 2 ? "enemy" : "player";

      setWinner(win);
      setEndText(win === "player" ? "VICTORY" : "DEFEAT");
      setGameOver(true);

      if (win === "player") {
        setDefeatedCharacters(prev =>
          prev.includes(enemyCharacter.name)
            ? prev
            : [...prev, enemyCharacter.name]
        );
        setTimeout(() => {
          const remainingEnemies = characterData
            ? Object.keys(characterData).filter(
              name =>
                name !== playerCharacter.name &&
                !defeatedCharacters.includes(name) &&
                name !== enemyCharacter.name
            )
            : [];

          if (remainingEnemies.length === 0) {
            setShowVictory(true);
            return;
          }

          resetGame();
        }, 3000);
      }

      setTimeout(resetGame, 3000);
      return;
    }

    const nextRound = round + 1;
    const text = nextRound === 2 ? "ROUND 2" : "FINAL ROUND";

    playSound(nextRound === 2 ? round2 : finalround);

    setTimeout(() => {
      setPlayerHealth(10);
      setEnemyHealth(10);
      resetPositions();
      setRound(nextRound);
      setRoundText(text);

      setTimeout(() => {
        setRoundText("");
        setControlsLocked(false);
      }, 2000);
    }, 1500);
  }, [playerHealth, enemyHealth]);

  const resetGame = () => {
    setEnemyCharacter(null);

    setPlayerHealth(10);
    setEnemyHealth(10);

    setRound(1);
    setRoundLosers([]);
    setRoundText("ROUND 1");

    setGameOver(false);
    setWinner(null);
    setEndText("");

    setControlsLocked(true);
    setScore(0);
  };

  const playSound = (sound) => {
    const audio = new Audio(sound);
    audio.play();
  };

  useEffect(() => {
    if (playerCharacter && enemyCharacter) {
      playSound(round1);
    }
  }, [playerCharacter, enemyCharacter]);

  const combatLoser =
    roundLosers.length >= 2 &&
      roundLosers[0] === roundLosers[1]
      ? roundLosers[0]
      : null;

  useEffect(() => {
    if (!playerCharacter || controlsLocked || gameOver) return;

    const ai = setInterval(() => {
      const dx = playerPos.x - enemyPos.x;
      const dy = playerPos.y - enemyPos.y;
      const distance = Math.hypot(dx, dy);

      const speed = 3;
      const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

      let newX = enemyPos.x;
      let newY = enemyPos.y;
      let movingDir = dx > 0 ? "right" : "left";

      if (enemyHealth <= 3 && distance <= 10) {
        setEnemyState("punch");
        setPlayerHealth((prev) => Math.max(0, prev - 1));
        setTimeout(() => setEnemyState("idle"), 300);
      } else if (enemyHealth <= 3) {
        const fleeX = dx > 0 ? -speed : speed;
        const fleeY = dy > 0 ? -speed / 2 : speed / 2;

        newX = clamp(enemyPos.x + fleeX, 0, 90);
        newY = clamp(enemyPos.y + fleeY, MIN_Y, MAX_Y);

        movingDir = fleeX > 0 ? "right" : "left";
        setEnemyState("walk");
      } else if (distance > 12) {
        const moveX = dx > 0 ? speed : -speed;
        const moveY = dy > 0 ? speed / 2 : -speed / 2;

        newX = clamp(enemyPos.x + moveX, 0, 90);
        newY = clamp(enemyPos.y + moveY, MIN_Y, MAX_Y);

        movingDir = moveX > 0 ? "right" : "left";
        setEnemyState("walk");
      } else {
        if (Math.random() > 0.4) {
          setEnemyState("punch");
          setPlayerHealth((prev) => Math.max(0, prev - 1));
          setTimeout(() => setEnemyState("idle"), 300);
        } else {
          const moveX = dx > 0 ? -speed : speed;
          const moveY = dy > 0 ? -speed / 2 : speed / 2;

          newX = clamp(enemyPos.x + moveX, 0, 90);
          newY = clamp(enemyPos.y + moveY, MIN_Y, MAX_Y);

          movingDir = moveX > 0 ? "right" : "left";
          setEnemyState("walk");
        }
      }

      setEnemyPos({ x: newX, y: newY });
      setEnemyDir(movingDir);
    }, 300);

    return () => clearInterval(ai);
  }, [playerPos, enemyPos, enemyHealth, playerCharacter, controlsLocked, gameOver]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (playerState === "walk") {
        setPlayerFrame((prev) => (prev + 1) % walkFrames.length);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [playerState]);

  useEffect(() => {
    if (!enemySprites) return;

    const interval = setInterval(() => {
      if (enemyState === "walk") {
        setEnemyFrame(
          (prev) => (prev + 1) % enemySprites.walkFrames.length
        );
      }
    }, 100);

    return () => clearInterval(interval);
  }, [enemyState, enemySprites]);

  useEffect(() => {
    const down = (e) => {
      if (controlsLocked || gameOver) return;

      if (e.key === "ArrowLeft") movePlayer(-2, 0);
      if (e.key === "ArrowRight") movePlayer(2, 0);
      if (e.key === "ArrowUp") movePlayer(0, -2);
      if (e.key === "ArrowDown") movePlayer(0, 2);
      if (e.key === " ") playerAttack();
    };

    const up = () => {
      if (controlsLocked || gameOver) return;
      stopPlayer();
    };

    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);

    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [controlsLocked, gameOver, playerPos, enemyPos]);

  const getPlayerSprite = () => {
    if (!playerSprites) return null;
    if (playerState === "walk") return playerSprites.walkFrames[playerFrame % playerSprites.walkFrames.length];
    if (playerState === "punch") return playerSprites.punch;
    return playerSprites.idle;
  };

  const getEnemySprite = () => {
    if (!enemySprites) return null;

    if (enemyState === "walk")
      return enemySprites.walkFrames[enemyFrame % enemySprites.walkFrames.length];

    if (enemyState === "punch")
      return enemySprites.punch;

    return enemySprites.idle;
  };

  const movePlayer = (dx, dy) => {
    setPlayerPos((prev) => ({
      x: Math.min(90, Math.max(0, prev.x + dx)),
      y: Math.min(MAX_Y, Math.max(MIN_Y, prev.y + dy)),
    }));

    if (dx > 0) setPlayerDir("left");
    if (dx < 0) setPlayerDir("right");

    setPlayerState("walk");
  };

  const stopPlayer = () => setPlayerState("idle");

  const playerAttack = () => {
    setPlayerState("punch");

    setEnemyHealth((prev) => {
      const distancex = Math.abs(playerPos.x - enemyPos.x);
      const distancey = Math.abs(playerPos.y - enemyPos.y);
      if ((distancex <= 10 && prev > 0) && (distancey <= 5 && prev > 0)) {
        setScore((s) => s + 1);
        return Math.max(0, prev - 1);
      }
      return prev;
    });

    setTimeout(() => setPlayerState("idle"), 300);
  };

  if (showVictory) {
    return (
      <VictoryView
        onFinish={() => {
          setShowVictory(false);
          resetFullGame();
        }}
      />
    );
  }
  if (!playerCharacter || !enemyCharacter) {
    return (
      <div className="strict-no-scroll-layout">
        <div className="top-bar">
          <button className="back-btn-game relative-btn" onClick={() => navigate(-1)}>{t("back")}
          </button>
        </div>

        <div className="scalable-content">
          <CharacterSelector
            defeatedCharacters={defeatedCharacters}
            lockedPlayer={playerCharacter}
            onSelect={(selection) => {
              setPlayerCharacter(selection.player);
              setEnemyCharacter(selection.rival);
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="game-container">
        <div className="lights">
          <div className="spotlight left"></div>
          <div className="spotlight center"></div>
          <div className="spotlight right"></div>
        </div>

        <div className="arena">
          <div className="health-bars">
            <HealthBar
              name={playerCharacter.name}
              img={playerSprites.idle}
              health={playerHealth}
              flip={true}
            />

            <HealthBar
              name={enemyCharacter.name}
              img={enemySprites.idle}
              health={enemyHealth}
            />

          </div>

          {roundText && (
            <div className="round-overlay">
              {roundText}
            </div>
          )}

          {gameOver && (
            <div className="end-overlay">
              {endText}
            </div>
          )}

          <div className="ring">
            <img
              src={getPlayerSprite()}
              className="player"
              alt="player-image"
              style={{
                left: `${playerPos.x}%`,
                bottom: `${100 - playerPos.y}%`,
                zIndex: playerPos.y,
                transform: `scale(${0.6 + playerPos.y / 120}) ${playerDir === "left" ? "scaleX(-1)" : "scaleX(1)"}`
              }}
            />
            <img
              src={getEnemySprite()}
              className="enemy"
              alt="enemy-image"
              style={{
                left: `${enemyPos.x}%`,
                bottom: `${100 - enemyPos.y}%`,
                zIndex: enemyPos.y,
                transform: `scale(${0.6 + enemyPos.y / 120}) ${enemyDir === "left" ? "scaleX(1)" : "scaleX(-1)"}`
              }}
            />
          </div>

          <div className="controls">
            <button onClick={() => !controlsLocked && movePlayer(0, -3)}><i className="fas fa-arrow-up"></i></button>
            <div>
              <button onClick={() => !controlsLocked && movePlayer(-3, 0)}><i className="fas fa-arrow-left"></i></button>
              <button onClick={() => !controlsLocked && playerAttack()}><i className="fa-solid fa-hand-fist"></i></button>
              <button onClick={() => !controlsLocked && movePlayer(3, 0)}><i className="fas fa-arrow-right"></i></button>
            </div>
            <button onClick={() => !controlsLocked && movePlayer(0, 3)}><i className="fas fa-arrow-down"></i></button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Game;