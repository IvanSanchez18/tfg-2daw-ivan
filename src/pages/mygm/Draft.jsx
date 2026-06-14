import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LoadingScreen from "../../components/loadingScreen/LoadingScreen";
import Swal from 'sweetalert2';
import { useTranslation } from "react-i18next";
import { getGameSession, getAvailableWrestlers, draftWrestler, calculateWrestlerCost, saveCPUPicks, applyPenaltyDraftAdjustments, finishDraft } from '../../services/myGMService';
import { BRANDS, STYLE_COUNTERS } from '../../utils/myGM';
import './draft.scss';
import DraftRules from '../../components/mygm/draft/DraftRules';
import DraftHeader from '../../components/mygm/draft/DraftHeader';
import DraftScouting from '../../components/mygm/draft/DraftScouting';
import DraftFilters from '../../components/mygm/draft/DraftFilters';
import DraftGrid from '../../components/mygm/draft/DraftGrid';
import DraftSidebar from '../../components/mygm/draft/DraftSidebar';

const BRAND_COLORS = Object.fromEntries(BRANDS.map(b => [b.id, b.color]));
const ALL_BRANDS = BRANDS.map(b => b.id);

export const Draft = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation("myGM/draft");

  const exitUrlRef = useRef(null);
  const trapSet = useRef(false);
  const latestDraftState = useRef({});

  const [session, setSession] = useState(null);
  const [wrestlers, setWrestlers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRules, setShowRules] = useState(true);

  const [draftOrder, setDraftOrder] = useState([]);
  const [currentRound, setCurrentRound] = useState(1);
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [draftHistory, setDraftHistory] = useState([]);
  const [cpuPicks, setCpuPicks] = useState([]);

  const initialCpuBudgets = Object.fromEntries(BRANDS.map(b => [b.id, b.initialBudget]));
  const [cpuBudgets, setCpuBudgets] = useState(initialCpuBudgets);

  const [finishedBrands, setFinishedBrands] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterAlignment, setFilterAlignment] = useState('All');
  const [filterGender, setFilterGender] = useState('All');
  const [filterStyle, setFilterStyle] = useState('All');

  const [turnCounter, setTurnCounter] = useState(0);
  const [cpuTargetSizes, setCpuTargetSizes] = useState({});
  const [activeTab, setActiveTab] = useState('');

  const activeDraftBrand = draftOrder.length > 0 ? draftOrder[currentTurnIndex] : null;
  const isPlayerTurn = activeDraftBrand === session?.brand;
  const isDraftFinished = draftOrder.length > 0 && finishedBrands.length === draftOrder.length;
  const currentBrandColor = BRAND_COLORS[session?.brand] || '#555';

  const getRosterByBrand = (brand) => {
    return draftHistory
      .filter(h => (h.type === 'pick' || h.type === 'penalty_add') && h.brand === brand)
      .map(h => h.wrestler);
  };

  const myRoster = getRosterByBrand(session?.brand);
  const viewingRoster = getRosterByBrand(activeTab);

  const runEmergencyDraft = async (stateData) => {
    const { wrestlers, session, myRoster, cpuPicks, cpuBudgets, cpuTargetSizes } = stateData;

    Swal.fire({
      title: t('swal.abandonment_title'),
      text: t('swal.abandonment_text'),
      icon: 'warning',
      allowOutsideClick: false,
      background: 'var(--bg-card)',
      color: 'var(--text-main)',
      didOpen: () => Swal.showLoading()
    });

    try {
      let currentBudget = session.budget;
      let dbInserts = [];
      let pool = [...wrestlers].sort((a, b) => a.base_pop - b.base_pop);
      let playerRosterSize = myRoster.length;

      while (playerRosterSize < 10 && pool.length > 0) {
        const pick = pool.shift();
        const cost = calculateWrestlerCost(pick.base_pop);
        currentBudget -= cost;
        dbInserts.push({
          session_id: session.id, wrestler_id: pick.id, alignment: pick.default_alignment,
          brand: session.brand, fatigue: 0, morale: 100, is_injured: false, is_champion: false,
          current_pop: pick.base_pop, contract_weeks: 52, salary: cost * 0.1
        });
        playerRosterSize++;
      }

      let finalCpuPicks = [...cpuPicks];
      for (const brand of ALL_BRANDS) {
        if (brand === session.brand) continue;
        let cpuCount = finalCpuPicks.filter(p => p.brand === brand).length;
        let target = cpuTargetSizes[brand] || 10;
        let cpuBudget = cpuBudgets[brand];

        while (cpuCount < target && pool.length > 0) {
          pool.sort((a, b) => b.base_pop - a.base_pop);
          let affordableIdx = pool.findIndex(w => calculateWrestlerCost(w.base_pop) <= cpuBudget);
          if (affordableIdx === -1) break;

          const pick = pool.splice(affordableIdx, 1)[0];
          const cost = calculateWrestlerCost(pick.base_pop);
          cpuBudget -= cost;

          finalCpuPicks.push({
            session_id: session.id, wrestler_id: pick.id, alignment: pick.default_alignment,
            brand: brand, fatigue: 0, morale: 100, is_injured: false, is_champion: false,
            current_pop: pick.base_pop, contract_weeks: 52, salary: cost * 0.1
          });
          cpuCount++;
        }
      }

      if (finalCpuPicks.length > 0) await saveCPUPicks(finalCpuPicks);
      if (dbInserts.length > 0) await applyPenaltyDraftAdjustments(session.id, [], dbInserts, currentBudget);
      await finishDraft(session.id);

      Swal.close();
      sessionStorage.setItem(`draft_done_${session.id}`, 'true');
      sessionStorage.removeItem(`draft_backup_${session.id}`);
      navigate(`/mygm/dashboard/${session.id}`, { replace: true });
    } catch (error) {
      console.error("Error en autocompletado de emergencia:", error);
      Swal.close();
      navigate('/mygm', { replace: true });
    }
  };

  useEffect(() => {
    const currentState = { wrestlers, session, myRoster, cpuPicks, cpuBudgets, cpuTargetSizes, isDraftFinished };
    latestDraftState.current = currentState;

    if (session && !isDraftFinished) {
      sessionStorage.setItem(`draft_backup_${session.id}`, JSON.stringify(currentState));
    }
  }, [wrestlers, session, myRoster, cpuPicks, cpuBudgets, cpuTargetSizes, isDraftFinished]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!isDraftFinished && session) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDraftFinished, session]);

  useEffect(() => {
    if (sessionStorage.getItem(`draft_done_${sessionId}`)) {
      navigate(`/mygm/dashboard/${sessionId}`, { replace: true });
      return;
    }

    const backupStr = sessionStorage.getItem(`draft_backup_${sessionId}`);
    if (backupStr) {
      sessionStorage.removeItem(`draft_backup_${sessionId}`);
      const backupState = JSON.parse(backupStr);
      runEmergencyDraft(backupState);
      return;
    }

    const loadData = async () => {
      const sessionData = await getGameSession(sessionId);
      if (!sessionData) {
        exitUrlRef.current = '/mygm';
        window.history.back();
        return;
      }

      const wrestlersData = await getAvailableWrestlers();
      setSession(sessionData);
      setActiveTab(sessionData.brand);
      setWrestlers(wrestlersData);

      const shuffledBrands = [...ALL_BRANDS].sort(() => Math.random() - 0.5);
      setDraftOrder(shuffledBrands);

      const targets = {};
      ALL_BRANDS.forEach(b => { targets[b] = Math.floor(Math.random() * 6) + 10; });
      setCpuTargetSizes(targets);

      setTimeout(() => setLoading(false), 800);
    };

    loadData();
  }, [sessionId, navigate]);

  useEffect(() => {
    if (!trapSet.current && !window.history.state?.isDraftTrap) {
      window.history.pushState({ ...window.history.state, isDraftTrap: true }, '');
      trapSet.current = true;
    }

    const handlePopState = async () => {
      const currentSessionId = latestDraftState.current.session?.id || sessionId;

      if (exitUrlRef.current) {
        sessionStorage.setItem(`draft_done_${currentSessionId}`, 'true');
        navigate(exitUrlRef.current, { replace: true });
        return;
      }

      const stateToUse = latestDraftState.current;

      if (!stateToUse.session) {
        navigate('/mygm', { replace: true });
        return;
      }

      if (stateToUse.isDraftFinished) {
        sessionStorage.setItem(`draft_done_${stateToUse.session.id}`, 'true');
        navigate(`/mygm/dashboard/${stateToUse.session.id}`, { replace: true });
        return;
      }

      await runEmergencyDraft(stateToUse);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [navigate, sessionId]);

  useEffect(() => {
    if (showRules || loading || isDraftFinished || isPlayerTurn || draftOrder.length === 0) return;

    const timer = setTimeout(() => {
      handleCPUTurn(activeDraftBrand);
    }, 1500);

    return () => clearTimeout(timer);
  }, [showRules, currentTurnIndex, isPlayerTurn, loading, isDraftFinished, activeDraftBrand, draftOrder, turnCounter]);

  const advanceTurn = (currentFinished = finishedBrands) => {
    if (currentFinished.length >= draftOrder.length) return;

    let nextIndex = currentTurnIndex;
    let nextRound = currentRound;
    let safetyCounter = 0;

    do {
      nextIndex++;
      if (nextIndex >= draftOrder.length) {
        nextIndex = 0;
        nextRound++;
      }
      safetyCounter++;
    } while (currentFinished.includes(draftOrder[nextIndex]) && safetyCounter < 10);

    setCurrentTurnIndex(nextIndex);
    setCurrentRound(nextRound);
    setTurnCounter(prev => prev + 1);
  };

  const handleCPUTurn = (brand) => {
    const currentBudget = cpuBudgets[brand];
    const cpuRosterSize = cpuPicks.filter(p => p.brand === brand).length;
    const targetSize = cpuTargetSizes[brand] || 10;
    let pool = [...wrestlers];

    const minimumSlotsToFill = Math.max(0, 10 - cpuRosterSize);
    const minCostInPool = pool.length > 0 ? Math.min(...pool.map(w => calculateWrestlerCost(w.base_pop))) : 0;
    const reservedBudget = Math.max(0, minimumSlotsToFill - 1) * minCostInPool;
    const maxSafeBudget = currentBudget - reservedBudget;

    const affordableWrestlers = pool.filter(w => calculateWrestlerCost(w.base_pop) <= maxSafeBudget);

    if (affordableWrestlers.length === 0 || cpuRosterSize >= targetSize) {
      const newFinished = [...finishedBrands, brand];
      setFinishedBrands(newFinished);
      setDraftHistory([...draftHistory, { type: 'finish', round: currentRound, brand }]);
      advanceTurn(newFinished);
      return;
    }

    affordableWrestlers.sort((a, b) => b.base_pop - a.base_pop);
    const topChoicesCount = Math.min(3, affordableWrestlers.length);
    const randomIndex = Math.floor(Math.random() * topChoicesCount);
    const pickedWrestler = affordableWrestlers[randomIndex];

    const cost = calculateWrestlerCost(pickedWrestler.base_pop);

    const newCpuPick = {
      session_id: session.id, wrestler_id: pickedWrestler.id, alignment: pickedWrestler.default_alignment,
      brand: brand, fatigue: 0, morale: 100, is_injured: false, is_champion: false,
      current_pop: pickedWrestler.base_pop, contract_weeks: 52, salary: cost * 0.1
    };

    setCpuPicks([...cpuPicks, newCpuPick]);
    setCpuBudgets({ ...cpuBudgets, [brand]: currentBudget - cost });
    setDraftHistory([...draftHistory, { type: 'pick', round: currentRound, brand, wrestler: pickedWrestler }]);
    setWrestlers(wrestlers.filter(w => w.id !== pickedWrestler.id));

    advanceTurn();
  };

  const handlePlayerPick = async (wrestler) => {
    if (!isPlayerTurn) return;
    const cost = calculateWrestlerCost(wrestler.base_pop);

    if (session.budget < cost) {
      return Swal.fire({
        title: t('swal.insufficient_funds_title'),
        text: t('swal.insufficient_funds_text'),
        icon: 'error',
        confirmButtonColor: currentBrandColor,
        background: 'var(--bg-card)',
        color: 'var(--text-main)'
      });
    }

    try {
      const newBudget = await draftWrestler(session.id, wrestler.id, cost, session.budget, wrestler.default_alignment, session.brand, wrestler.base_pop);
      setSession({ ...session, budget: newBudget });

      setDraftHistory([...draftHistory, { type: 'pick', round: currentRound, brand: session.brand, wrestler }]);
      setWrestlers(wrestlers.filter(w => w.id !== wrestler.id));
      advanceTurn();
    } catch (error) {
      console.error("Error fichando:", error);
    }
  };

  const applyRosterPenaltyAndFinish = async () => {
    let currentRoster = [...myRoster];
    let currentPool = [...wrestlers];
    let currentBudget = session.budget;

    let historyDeletes = [];
    let historyAdditions = [];
    let dbDeletes = [];
    let dbInserts = [];

    while (currentRoster.length < 10) {
      if (currentRoster.length > 0) {
        currentRoster.sort((a, b) => calculateWrestlerCost(b.base_pop) - calculateWrestlerCost(a.base_pop));
        const mostExpensive = currentRoster.shift();
        const refund = calculateWrestlerCost(mostExpensive.base_pop);
        currentBudget += refund;

        dbDeletes.push(mostExpensive.id);
        historyDeletes.push(mostExpensive.id);
        historyAdditions.push({ type: 'penalty_remove', brand: session.brand, wrestler: mostExpensive, round: currentRound });
      }

      const toBuy = currentRoster.length === 0 ? 10 : 2;
      currentPool.sort((a, b) => calculateWrestlerCost(a.base_pop) - calculateWrestlerCost(b.base_pop));

      for (let i = 0; i < toBuy; i++) {
        if (currentRoster.length >= 10) break;

        const cheapPick = currentPool.shift();
        const cost = calculateWrestlerCost(cheapPick.base_pop);
        currentBudget -= cost;
        currentRoster.push(cheapPick);

        dbInserts.push({
          session_id: session.id, wrestler_id: cheapPick.id, alignment: cheapPick.default_alignment,
          brand: session.brand, fatigue: 0, morale: 100, is_injured: false, is_champion: false,
          current_pop: cheapPick.base_pop, contract_weeks: 52, salary: cost * 0.1
        });
        historyAdditions.push({ type: 'penalty_add', round: currentRound, brand: session.brand, wrestler: cheapPick });
      }
    }

    setLoading(true);

    try {
      await applyPenaltyDraftAdjustments(session.id, dbDeletes, dbInserts, currentBudget);

      setSession(prev => ({ ...prev, budget: currentBudget }));
      setWrestlers(currentPool);

      setDraftHistory(prev => {
        const newHistory = prev.filter(h => !(h.type === 'pick' && h.brand === session.brand && historyDeletes.includes(h.wrestler.id)));
        return [...newHistory, ...historyAdditions, { type: 'finish', round: currentRound, brand: session.brand }];
      });

      const newFinished = [...finishedBrands, session.brand];
      setFinishedBrands(newFinished);

      Swal.fire({
        title: t('swal.adjustment_done_title'),
        text: t('swal.adjustment_done_text'),
        icon: 'info',
        confirmButtonColor: currentBrandColor,
        background: 'var(--bg-card)',
        color: 'var(--text-main)'
      });
      advanceTurn(newFinished);
    } catch (error) {
      Swal.fire({
        title: t('swal.error_title'),
        text: t('swal.adjustment_error_text'),
        icon: 'error',
        background: 'var(--bg-card)',
        color: 'var(--text-main)'
      });

    } finally {
      setLoading(false);
    }
  };

  const handlePlayerFinish = () => {
    if (myRoster.length < 10) {
      Swal.fire({
        title: t('swal.incomplete_roster_title'),
        text: t('swal.incomplete_roster_text'),
        icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', cancelButtonColor: '#3085d6',
        confirmButtonText: t('swal.confirm_adjustment'), cancelButtonText: t('swal.cancel'),
        background: 'var(--bg-card)',
        color: 'var(--text-main)'
      }).then((result) => {
        if (result.isConfirmed) {
          applyRosterPenaltyAndFinish();
        }
      });
    } else {
      Swal.fire({
        title: t('swal.finish_draft_title'),
        text: t('swal.finish_draft_text'),
        icon: 'question', showCancelButton: true, confirmButtonColor: currentBrandColor, cancelButtonColor: '#d33',
        confirmButtonText: t('swal.confirm_finish'), cancelButtonText: t('swal.continue_drafting'),
        background: 'var(--bg-card)',
        color: 'var(--text-main)'
      }).then((result) => {
        if (result.isConfirmed) {
          const newFinished = [...finishedBrands, session.brand];
          setFinishedBrands(newFinished);
          setDraftHistory(prev => [...prev, { type: 'finish', round: currentRound, brand: session.brand }]);
          advanceTurn(newFinished);
        }
      });
    }
  };

  const saveAndExitDraft = async () => {
    setLoading(true);
    try {
      if (cpuPicks.length > 0) {
        await saveCPUPicks(cpuPicks);
      }
      await finishDraft(session.id);
      exitUrlRef.current = `/mygm/dashboard/${session.id}`;
      window.history.back();
    } catch (error) {
      Swal.fire({
        title: t('swal.error_title'),
        text: t('swal.cpu_save_error_text'),
        icon: 'error',
        background: 'var(--bg-card)',
        color: 'var(--text-main)'
      });
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);

  const filteredWrestlers = useMemo(() => {
    return wrestlers.filter(w => {
      const matchesSearch = w.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesAlignment = filterAlignment === 'All' || w.default_alignment === filterAlignment;
      const matchesGender = filterGender === 'All' || w.gender === filterGender;
      const matchesStyle = filterStyle === 'All' || w.style === filterStyle;
      return matchesSearch && matchesAlignment && matchesGender && matchesStyle;
    });
  }, [wrestlers, searchTerm, filterAlignment, filterGender, filterStyle]);

  const suggestions = useMemo(() => {
    if (wrestlers.length === 0 || !session) return [];
    const faces = myRoster.filter(w => w.default_alignment === 'Face').length;
    const heels = myRoster.filter(w => w.default_alignment === 'Heel').length;
    const neededAlignment = faces > heels ? 'Heel' : 'Face';
    const neededStyles = myRoster.map(w => w.style).map(s => STYLE_COUNTERS[s]).filter(Boolean);

    return wrestlers
      .filter(w => calculateWrestlerCost(w.base_pop) <= session.budget)
      .map(w => {
        let score = 0;
        if (w.default_alignment === neededAlignment) score += 10;
        if (neededStyles.includes(w.style)) score += 15;
        score += (w.base_pop / 10);
        return { ...w, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 2);
  }, [wrestlers, myRoster, session?.budget]);

  if (loading || draftOrder.length === 0) return (
    <LoadingScreen active={loading} />
  );

  return (
    <div className="mygm-draft-wrapper" style={{ '--dynamic-brand-color': currentBrandColor }}>

      {showRules && (
        <DraftRules setShowRules={setShowRules} currentBrandColor={currentBrandColor} />
      )}

      <DraftHeader
        isDraftFinished={isDraftFinished} currentRound={currentRound}
        activeDraftBrand={activeDraftBrand} isPlayerTurn={isPlayerTurn}
        draftOrder={draftOrder} currentTurnIndex={currentTurnIndex}
        finishedBrands={finishedBrands} session={session} formatCurrency={formatCurrency}
      />

      <div className="draft-content">
        <div className="main-draft-area">

          {isDraftFinished ? (
            <div className="draft-finished-banner">
              <h2>{t('finished_banner.title')}</h2>
              <button className="finish-draft-btn" onClick={saveAndExitDraft} style={{ backgroundColor: currentBrandColor }}>
                {t('finished_banner.button')}
              </button>
            </div>
          ) : (
            <>
              {isPlayerTurn && suggestions.length > 0 && (
                <DraftScouting
                  suggestions={suggestions} handlePlayerPick={handlePlayerPick}
                  formatCurrency={formatCurrency} calculateWrestlerCost={calculateWrestlerCost}
                />
              )}

              <DraftFilters
                searchTerm={searchTerm} setSearchTerm={setSearchTerm}
                filterAlignment={filterAlignment} setFilterAlignment={setFilterAlignment}
                filterGender={filterGender} setFilterGender={setFilterGender}
                filterStyle={filterStyle} setFilterStyle={setFilterStyle}
                isPlayerTurn={isPlayerTurn}
              />

              <DraftGrid
                filteredWrestlers={filteredWrestlers} session={session}
                isPlayerTurn={isPlayerTurn} handlePlayerPick={handlePlayerPick}
                formatCurrency={formatCurrency} calculateWrestlerCost={calculateWrestlerCost}
              />
            </>
          )}
        </div>

        <DraftSidebar
          viewingRoster={viewingRoster} isDraftFinished={isDraftFinished}
          finishedBrands={finishedBrands} session={session}
          handlePlayerFinish={handlePlayerFinish} isPlayerTurn={isPlayerTurn}
          activeTab={activeTab} setActiveTab={setActiveTab} draftHistory={draftHistory}
        />
      </div>
    </div>
  );
};

export default Draft;