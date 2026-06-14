import i18n from 'i18next';
import { getRandomSummaryKey, getMatchQualityKey, getPromoQualityKey } from '../utils/summaryDictionary';
import { supabase } from './supabaseClient';
import { GameSession, LogisticsData, Rivalry, TitleChangeResult, SimulationResponse, SegmentResult, GMSessionRoster, RosterStateChange, CardResponse } from '../types';
import { STYLE_COUNTERS, INJURY_TYPES, SIMULATION_RULES } from '../utils/myGM';

export const getMyGMGames = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("gm_game_sessions")
    .select("*")
    .eq("user_id", user.id)
    .order("week", { ascending: false });

  if (error) {
    console.error("Error fetching MyGM games:", error);
    throw error;
  }

  return data;
};

export const getMyGMImages = async () => {
  const { data, error } = await supabase.storage.from('mygm').list('', {
    offset: 0,
    sortBy: { column: 'name', order: 'asc' },
  });

  if (error) {
    console.error("Error fetching MyGM images:", error);
    throw error;
  }

  return data
    .filter(file => file.name !== '.emptyFolderPlaceholder')
    .map(file => {
      const { data: publicUrlData } = supabase.storage
        .from('mygm')
        .getPublicUrl(file.name);
      return {
        name: file.name,
        url: publicUrlData.publicUrl
      };
    });
};

export const startNewGame = async (
  userId: string,
  selectedBrand: string,
  initialBudget: number,
  gmImage: string | null
): Promise<GameSession | null> => {
  try {
    const { data, error } = await supabase
      .from('gm_game_sessions')
      .insert([{
        user_id: userId,
        brand: selectedBrand,
        budget: initialBudget,
        game_image: gmImage,
        week: 1,
        max_weeks: 52,
        is_drafted: false
      }])
      .select()
      .single();

    if (error) {
      console.error('[gameService] Error al crear la partida:', error.message);
      return null;
    }

    return data as GameSession;
  } catch (err) {
    console.error('[gameService] Excepción no controlada:', err);
    return null;
  }
};

export const getGameSession = async (sessionId: string): Promise<GameSession | null> => {
  const { data, error } = await supabase
    .from('gm_game_sessions')
    .select('*')
    .eq('id', sessionId)
    .single();

  if (error) {
    console.error('[gameService] Error obteniendo sesión:', error.message);
    return null;
  }
  return data as GameSession;
};

export const getAvailableWrestlers = async () => {
  const { data, error } = await supabase
    .from('gm_wrestlers')
    .select('*')
    .order('base_pop', { ascending: false });

  if (error) {
    console.error('[gameService] Error obteniendo luchadores:', error.message);
    return [];
  }
  return data;
};

export const draftWrestler = async (
  sessionId: string,
  wrestlerId: string,
  cost: number,
  currentBudget: number,
  alignment: string,
  brand: string,
  basePop: number
) => {
  if (currentBudget < cost) throw new Error("Presupuesto insuficiente");

  const { error: rosterError } = await supabase
    .from('gm_session_roster')
    .insert([{
      session_id: sessionId,
      wrestler_id: wrestlerId,
      alignment: alignment,
      brand: brand,
      fatigue: 0,
      morale: 100,
      is_injured: false,
      is_champion: false,
      current_pop: basePop,
      contract_weeks: 52,
      salary: cost * 0.1
    }]);

  if (rosterError) throw rosterError;

  const newBudget = currentBudget - cost;
  const { error: budgetError } = await supabase
    .from('gm_game_sessions')
    .update({ budget: newBudget })
    .eq('id', sessionId);

  if (budgetError) throw budgetError;

  return newBudget;
};

export const calculateWrestlerCost = (basePop: number) => {
  return basePop * 5000;
};

export const saveCPUPicks = async (cpuPicks: any[]) => {
  const { data, error } = await supabase
    .from('gm_session_roster')
    .insert(cpuPicks);

  if (error) {
    console.error("Error guardando los picks de la CPU:", error);
    throw error;
  }

  return data;
};

export const applyPenaltyDraftAdjustments = async (
  sessionId: string,
  dbDeletes: string[],
  dbInserts: any[],
  newBudget: number
) => {
  try {
    if (dbDeletes && dbDeletes.length > 0) {
      const { error: deleteError } = await supabase
        .from('gm_session_roster')
        .delete()
        .in('wrestler_id', dbDeletes)
        .eq('session_id', sessionId);

      if (deleteError) throw deleteError;
    }

    if (dbInserts && dbInserts.length > 0) {
      const { error: insertError } = await supabase
        .from('gm_session_roster')
        .insert(dbInserts);

      if (insertError) throw insertError;
    }

    const { error: updateError } = await supabase
      .from('gm_game_sessions')
      .update({ budget: newBudget })
      .eq('id', sessionId);

    if (updateError) throw updateError;

    return { success: true };
  } catch (error) {
    console.error("Error aplicando los ajustes de penalización del roster:", error);
    throw error;
  }
};

export const finishDraft = async (sessionId: string) => {
  const { data, error } = await supabase
    .from('gm_game_sessions')
    .update({ is_drafted: true })
    .eq('id', sessionId)
    .select()
    .single();

  if (error) {
    console.error('[gameService] Error al marcar el draft como completado:', error.message);
    throw error;
  }

  return data;
};

export const getSessionRoster = async (sessionId: string) => {
  const { data: rosterData, error: rosterError } = await supabase
    .from('gm_session_roster')
    .select('*')
    .eq('session_id', sessionId);

  if (rosterError) {
    console.error("Error obteniendo la tabla gm_session_roster:", rosterError);
    return [];
  }

  if (!rosterData || rosterData.length === 0) {
    return [];
  }

  const wrestlerIds = rosterData.map(item => item.wrestler_id);

  const { data: wrestlersData, error: wrestlersError } = await supabase
    .from('gm_wrestlers')
    .select('id, name, image_url, style, gender')
    .in('id', wrestlerIds);

  if (wrestlersError) {
    console.error("Error obteniendo los nombres de los luchadores:", wrestlersError);
    return rosterData;
  }

  const formattedRoster = rosterData.map(rosterItem => {
    const wrestlerInfo = wrestlersData.find(w => w.id === rosterItem.wrestler_id);

    return {
      ...rosterItem,
      name: wrestlerInfo?.name || 'Desconocido',
      image_url: wrestlerInfo?.image_url || '',
      style: wrestlerInfo?.style || '',
      gender: wrestlerInfo?.gender || 'male'
    };
  });

  return formattedRoster;
};

export const removeWrestlerFromRoster = async (
  sessionId: string,
  rowId: string
): Promise<void> => {
  const { data, error, count } = await supabase
    .from('gm_session_roster')
    .delete({ count: 'exact' })
    .eq('id', rowId);

  if (error) {
    console.error("Error de Supabase:", error.message);
    throw new Error(error.message);
  }

  if (count === 0) {
    throw new Error("IDs no coinciden. No se encontró el registro en la BD.");
  }
};

export const setWrestlerAsChampion = async (sessionId: string, wrestlerId: string, newPop: number) => {
  try {
    const { data, error } = await supabase
      .from('gm_session_roster')
      .update({
        is_champion: true,
        current_pop: newPop
      })
      .eq('wrestler_id', wrestlerId)
      .eq('session_id', sessionId)

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Error coronando al campeon:", error);
    throw error;
  }
};

export const calculateWrestlerCostFreeAgent = (basePop: number) => {
  return basePop * 25000;
};

export const getAllRivalries = async (sessionId: string) => {
  const { data, error } = await supabase
    .from('gm_rivalries')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error obteniendo rivalidades:", error);
    return [];
  }
  return data;
};

export const createRivalry = async (sessionId: string, isTagTeam: boolean, id1: string, id2: string, currentWeek: number) => {
  const payload = isTagTeam
    ? { session_id: sessionId, is_tag_team: true, team1_id: id1, team2_id: id2, level: 1, start_week: currentWeek, is_active: true }
    : { session_id: sessionId, is_tag_team: false, wrestler1_id: id1, wrestler2_id: id2, level: 1, start_week: currentWeek, is_active: true };

  const { data, error } = await supabase
    .from('gm_rivalries')
    .insert([payload])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const endRivalry = async (rivalryId: string, endWeek: number) => {
  const { error } = await supabase
    .from('gm_rivalries')
    .update({
      is_active: false,
      end_week: endWeek
    })
    .eq('id', rivalryId);

  if (error) {
    console.error("Error terminando la rivalidad:", error);
    throw error;
  }
  return true;
};

export const updateRivalryLevel = async (rivalryId: string, level: number) => {
  const { error } = await supabase
    .from('gm_rivalries')
    .update({ level })
    .eq('id', rivalryId);

  if (error) {
    console.error("Error actualizando intensidad:", error);
    throw error;
  }
  return true;
};

export const getAllTagTeams = async (sessionId: string) => {
  const { data, error } = await supabase
    .from('gm_teams')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("[gameService] Error obteniendo Tag Teams:", error.message);
    return [];
  }

  return data.map(team => ({
    ...team,
    wrestler1_id: team.wrestler1_id || team.member1_id,
    wrestler2_id: team.wrestler2_id || team.member2_id
  }));
};

export const createTagTeam = async (sessionId: string, name: string, m1: string, m2: string) => {
  const { data, error } = await supabase
    .from('gm_teams')
    .insert([{
      session_id: sessionId,
      name: name,
      member1_id: m1,
      member2_id: m2,
      is_active: true
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const disbandTagTeam = async (teamId: string) => {
  const { data, error } = await supabase
    .from('gm_teams')
    .update({
      is_active: false,
    })
    .eq('id', teamId);

  if (error) {
    console.error("[gameService] Error disolviendo el Tag Team:", error.message);
    throw error;
  }
  return true;
};

export const getStandingsStats = async (sessionId: string) => {
  const { data, error } = await supabase
    .from('gm_shows')
    .select('*')
    .eq('session_id', sessionId)
    .order('week', { ascending: true });

  if (error) {
    console.error("[gameService] Error obteniendo getStandingsStats:", error.message);
    throw error;
  }

  const emptyStats = { avgRating: 0, lastShowFans: 0 };
  if (!data || data.length === 0) {
    return { raw: emptyStats, smackdown: emptyStats, nxt: emptyStats, evolve: emptyStats };
  }

  const totalShows = data.length;
  const lastShow = data[totalShows - 1];

  const calcAvg = (brand: string) => {
    const total = data.reduce((sum, show) => sum + (show[`${brand}_rating`] || 0), 0);
    return Number((total / totalShows).toFixed(1));
  };

  return {
    raw: {
      avgRating: calcAvg('raw'),
      lastShowFans: lastShow['raw_fans_gained'] || 0
    },
    smackdown: {
      avgRating: calcAvg('smackdown'),
      lastShowFans: lastShow['smackdown_fans_gained'] || 0
    },
    nxt: {
      avgRating: calcAvg('nxt'),
      lastShowFans: lastShow['nxt_fans_gained'] || 0
    },
    evolve: {
      avgRating: calcAvg('evolve'),
      lastShowFans: lastShow['evolve_fans_gained'] || 0
    }
  };
};

export const updateLogistics = async (sessionId: string, logisticsData: LogisticsData): Promise<boolean> => {
  const { data: session, error: fetchError } = await supabase
    .from('gm_game_sessions')
    .select('budget')
    .eq('id', sessionId)
    .single();

  if (fetchError || !session) {
    console.error("[gameService] Error obteniendo la sesión:", fetchError?.message);
    throw new Error("No se pudo cargar la sesión actual.");
  }

  if (session.budget < logisticsData.total_cost) {
    throw new Error("Presupuesto insuficiente para realizar esta acción.");
  }

  const newBudget = session.budget - logisticsData.total_cost;

  const { error: updateError } = await supabase
    .from('gm_game_sessions')
    .update({
      arena_level: logisticsData.arena_level,
      production_level: logisticsData.production_level,
      advertising_level: logisticsData.advertising_level,
      budget: newBudget
    })
    .eq('id', sessionId);

  if (updateError) {
    console.error("[gameService] Error actualizando logística:", updateError.message);
    throw updateError;
  }

  return true;
};

export const getRivalries = async (sessionId: string): Promise<Rivalry[]> => {
  const { data, error } = await supabase
    .from('gm_rivalries')
    .select('*')
    .eq('session_id', sessionId)
    .eq('is_active', true);

  if (error) {
    console.error("Error obteniendo rivalidades:", error);
    return [];
  }
  return data;
};

export const getActiveTagTeams = async (sessionId: string) => {
  const { data, error } = await supabase
    .from('gm_teams')
    .select('*')
    .eq('session_id', sessionId)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("[gameService] Error obteniendo Tag Teams activos:", error.message);
    return [];
  }

  return data.map(team => ({
    ...team,
    wrestler1_id: team.wrestler1_id || team.member1_id,
    wrestler2_id: team.wrestler2_id || team.member2_id
  }));
};

export const saveShow = async (
  sessionId: string,
  brand: string,
  week: number,
  segments: any[]
): Promise<string> => {
  try {
    const totalCost = segments.reduce((sum, seg) => sum + (seg.cost || 0), 0);

    const { data: card, error: cardError } = await supabase
      .from('gm_cards')
      .insert({
        session_id: sessionId,
        brand: brand,
        week: week,
        cost: totalCost,
        status: 'pending'
      })
      .select('id')
      .single();

    if (cardError) throw cardError;

    for (let i = 0; i < segments.length; i++) {
      const segInput = segments[i];

      const { data: segmentData, error: segmentError } = await supabase
        .from('gm_segments')
        .insert({
          card_id: card.id,
          segment_type: segInput.segment_type,
          match_type: segInput.match_type,
          promo_type: segInput.promo_type || null,
          target_brand: segInput.target_brand || null,
          is_title_match: segInput.is_title_match || false,
          card_position: segInput.card_position,
          rating: 0
        })
        .select('id')
        .single();

      if (segmentError) throw segmentError;

      const participantsToInsert = segInput.participants.map((p: any) => ({
        segment_id: segmentData.id,
        roster_id: p.roster_id,
        team: p.team,
        role: p.role,
        is_winner: false
      }));

      const { error: partError } = await supabase
        .from('gm_segment_participants')
        .insert(participantsToInsert);

      if (partError) throw partError;
    }

    return card.id;

  } catch (error) {
    console.error("[gameService] Error al guardar la cartelera:", error);
    throw error;
  }
};

export const processTitleChange = async (newChampionRosterId: string, oldChampionRosterId: string): Promise<TitleChangeResult> => {
  try {
    const { data: wrestlers, error: fetchError } = await supabase
      .from('gm_session_roster')
      .select('id, current_pop')
      .in('id', [newChampionRosterId, oldChampionRosterId]);

    if (fetchError) throw fetchError;

    const newChampData = wrestlers?.find(w => w.id === newChampionRosterId);
    const oldChampData = wrestlers?.find(w => w.id === oldChampionRosterId);

    if (!newChampData || !oldChampData) {
      throw new Error("No se encontraron los datos de los luchadores para el cambio de título.");
    }

    const newChampPop: number = Math.min(100, Number(newChampData.current_pop || 0) + 20);
    const oldChampPop: number = Math.max(0, Number(oldChampData.current_pop || 0) - 20);

    const { error: updateNewError } = await supabase
      .from('gm_session_roster')
      .update({
        is_champion: true,
        current_pop: newChampPop
      })
      .eq('id', newChampionRosterId);

    if (updateNewError) throw updateNewError;

    const { error: updateOldError } = await supabase
      .from('gm_session_roster')
      .update({
        is_champion: false,
        current_pop: oldChampPop
      })
      .eq('id', oldChampionRosterId);

    if (updateOldError) throw updateOldError;

    return {
      success: true,
      newChampPop,
      oldChampPop
    };

  } catch (error) {
    console.error("[myGMService] Error al procesar el cambio de título:", error);
    throw error;
  }
};

export const simulateShow = async (sessionId: string, cardId: string): Promise<SimulationResponse> => {
  await i18n.loadNamespaces('myGM/summary');
  try {
    const sessionReq = await supabase.from('gm_game_sessions').select('*').eq('id', sessionId).single();
    if (sessionReq.error) throw sessionReq.error;
    const currentSession = sessionReq.data as GameSession;

    const userBrand = (currentSession.brand || 'nxt').toLowerCase();

    const [cardReq, rosterReq] = await Promise.all([
      supabase.from('gm_cards').select(`
        *,
        gm_segments (
          *,
          gm_segment_participants (
            *,
            gm_session_roster ( *, gm_wrestlers (*) ) 
          )
        )
      `).eq('id', cardId).single(),
      supabase.from('gm_session_roster').select('*').eq('session_id', sessionId).eq('brand', userBrand)
    ]);

    if (cardReq.error) throw cardReq.error;
    if (rosterReq.error) throw rosterReq.error;

    const card = cardReq.data as any;
    const fullRoster = rosterReq.data as GMSessionRoster[];

    const totalRosterSalary = fullRoster.reduce((acc, w) => acc + (w.salary || 0), 0);
    const totalShowCost = (card.cost || 0) + totalRosterSalary;

    let totalStars = 0;
    const segmentResults: SegmentResult[] = [];

    const rosterChanges: Record<string, RosterStateChange> = {};
    const championStatusUpdates: Record<string, boolean> = {};
    const participantIds = new Set<string>();

    const initiallyInjuredIds = new Set(fullRoster.filter(w => w.is_injured).map(w => w.id));
    let healthyWrestlersCount = fullRoster.filter(w => !w.is_injured).length;

    for (const segment of card.gm_segments || []) {
      const actualType = segment.segment_type || 'promo';
      let displayTitle = segment.match_type || 'Normal';

      if (actualType === 'promo' && displayTitle.startsWith('Promo: ')) {
        displayTitle = displayTitle.replace('Promo: ', '');
      }

      const isTurnPromo = actualType === 'promo' &&
        (displayTitle.toLowerCase().includes('turn') ||
          displayTitle.toLowerCase().includes('cambio'));

      const participants = segment.gm_segment_participants || [];
      let winnerIds: string[] = [];
      let winnerNames: string[] = [];
      let summary = "";
      let scorePoints = 30;

      if (participants.length > 0) {
        participants.forEach((p: any) => {
          if (p.gm_session_roster) participantIds.add(p.gm_session_roster.id);
        });

        if (actualType === 'match') {
          const totalPri = participants.reduce((acc: number, p: any) => {
            const r = p.gm_session_roster as GMSessionRoster;
            const w = r?.gm_wrestlers;
            if (!r || !w) return acc;

            const inRingStats = (w.power + w.technique + w.speed + w.durability + w.ring_iq) / 5;
            return acc + (inRingStats * 0.4) + (w.charisma * 0.3) + (Number(r.morale || 100) * 0.3);
          }, 0);

          const averagePri = totalPri / participants.length;

          let bookingMultiplier = 0.60;

          const alignments = [...new Set(participants.map((p: any) => p.gm_session_roster?.alignment))];
          if (alignments.includes('Face') && alignments.includes('Heel')) {
            bookingMultiplier += 0.15;
          }

          let hasStyleCounter = false;
          for (let i = 0; i < participants.length; i++) {
            for (let j = i + 1; j < participants.length; j++) {
              const p1 = participants[i];
              const p2 = participants[j];
              if (p1.team !== p2.team) {
                const style1 = p1.gm_session_roster?.gm_wrestlers?.style;
                const style2 = p2.gm_session_roster?.gm_wrestlers?.style;
                const counterMap = STYLE_COUNTERS as Record<string, string>;
                if (style1 && style2 && counterMap[style1] === style2) {
                  hasStyleCounter = true; break;
                }
              }
            }
            if (hasStyleCounter) break;
          }
          if (hasStyleCounter) bookingMultiplier += 0.15;

          if (segment.is_rivalry) bookingMultiplier += 0.20;

          scorePoints = averagePri * bookingMultiplier;

          const teams = [...new Set(participants.map((p: any) => p.team))];
          const winningTeam = teams[Math.floor(Math.random() * teams.length)];
          const winningParticipants = participants.filter((p: any) => p.team === winningTeam);

          winnerIds = winningParticipants.map((p: any) => p.id);
          winnerNames = winningParticipants.map((p: any) => p.gm_session_roster?.gm_wrestlers?.name || 'Vacante');

          await Promise.all(winnerIds.map(id => supabase.from('gm_segment_participants').update({ is_winner: true }).eq('id', id)));

          if (segment.is_title_match) {
            const currentChampPart = participants.find((p: any) => p.gm_session_roster?.is_champion === true);
            const winningPart = participants.find((p: any) => winnerIds.includes(p.id));

            if (currentChampPart && winningPart) {
              const champId = currentChampPart.gm_session_roster.id;
              const winId = winningPart.gm_session_roster.id;

              if (champId !== winId) {
                if (!rosterChanges[winId]) rosterChanges[winId] = { fatigueChange: 0, moraleChange: 0, popChange: 0 };
                if (!rosterChanges[champId]) rosterChanges[champId] = { fatigueChange: 0, moraleChange: 0, popChange: 0 };

                rosterChanges[winId].popChange += 20;
                rosterChanges[champId].popChange -= 20;
                championStatusUpdates[winId] = true;
                championStatusUpdates[champId] = false;

                summary = i18n.t(getRandomSummaryKey('title_change'), {
                  ns: 'myGM/summary',
                  winner: winningPart.gm_session_roster?.gm_wrestlers?.name,
                  loser: currentChampPart.gm_session_roster?.gm_wrestlers?.name
                }) + " ";
              } else {
                summary = i18n.t(getRandomSummaryKey('title_retain'), {
                  ns: 'myGM/summary',
                  champ: currentChampPart.gm_session_roster?.gm_wrestlers?.name
                }) + " ";
              }
            }
          }

        } else if (actualType === 'promo') {
          const totalPromoScore = participants.reduce((acc: number, p: any) => {
            const r = p.gm_session_roster as GMSessionRoster;
            const w = r?.gm_wrestlers;
            if (!r || !w) return acc;
            return acc + (w.charisma * 0.7) + (Number(r.morale || 100) * 0.3);
          }, 0);

          const averagePromo = totalPromoScore / participants.length;
          const promoMultiplier = segment.is_rivalry ? 1.05 : 0.70;

          scorePoints = averagePromo * promoMultiplier;

          if (isTurnPromo) {
            summary = i18n.t(getRandomSummaryKey('promo_turn_surprise'), { ns: 'myGM/summary' }) + " ";
          }
        }
      }

      scorePoints += (Math.random() * 10 - 5);
      const stars = Math.min(5, Math.max(1, Math.round((scorePoints / 20) * 2) / 2));
      totalStars += stars;

      if (actualType === 'match') {
        summary += i18n.t(getMatchQualityKey(stars), { ns: 'myGM/summary' }) + " ";
      } else {
        summary += i18n.t(getPromoQualityKey(stars, isTurnPromo), { ns: 'myGM/summary' }) + " ";
      }

      participants.forEach((p: any) => {
        const roster = p.gm_session_roster as GMSessionRoster;
        const wrestler = roster?.gm_wrestlers;
        if (!roster || !wrestler) return;

        if (!rosterChanges[roster.id]) rosterChanges[roster.id] = { fatigueChange: 0, moraleChange: 0, popChange: 0 };

        let nextFatigue = Number(roster.fatigue || 0);
        let nextMorale = Number(roster.morale || 100);

        if (actualType === 'match') {
          const simRules = SIMULATION_RULES as any;
          const baseFatigue = simRules.fatigueCost[displayTitle] || 15;
          const fatigueGained = Math.round(baseFatigue + (stars * 1.5));

          rosterChanges[roster.id].fatigueChange += fatigueGained;
          nextFatigue = Math.min(100, nextFatigue + fatigueGained);

          const isWinner = winnerIds.includes(p.id);
          const moraleGained = isWinner ? 8 : -5;
          rosterChanges[roster.id].moraleChange += moraleGained;
          nextMorale = Math.max(0, Math.min(100, nextMorale + moraleGained));

          rosterChanges[roster.id].popChange += isWinner ? 3 : -2;

          const fatigueFactor = (nextFatigue / 100) * 8;
          const durabilityFactor = (1 - (wrestler.durability / 100)) * 8;
          const moraleFactor = (1 - (nextMorale / 100)) * 4;
          const injuryChance = fatigueFactor + durabilityFactor + moraleFactor;

          if (Math.random() * 100 < injuryChance && !roster.is_injured && healthyWrestlersCount > 9) {
            rosterChanges[roster.id].isInjured = true;
            healthyWrestlersCount--;

            const daysOut = Math.floor(Math.random() * 8) + 1;
            const severity = daysOut >= 6 ? 3 : (daysOut >= 3 ? 2 : 1);
            const injuryTypeKeys = Object.keys(INJURY_TYPES);
            const type = injuryTypeKeys[Math.floor(Math.random() * injuryTypeKeys.length)];

            rosterChanges[roster.id].daysOut = daysOut;
            rosterChanges[roster.id].injurySeverity = severity;
            rosterChanges[roster.id].injuryType = type;

            summary += i18n.t(getRandomSummaryKey('injury'), {
              ns: 'myGM/summary',
              wrestler: wrestler.name,
              weeks: daysOut
            }) + " ";

            if (daysOut >= 4) {
              if (roster.is_champion || championStatusUpdates[roster.id] === true) {
                championStatusUpdates[roster.id] = false;
                summary += i18n.t(getRandomSummaryKey('title_vacated'), { ns: 'myGM/summary' }) + " ";
              }
            }
          }

        } else if (actualType === 'promo') {
          rosterChanges[roster.id].fatigueChange += 5;
          rosterChanges[roster.id].popChange += 1;
          rosterChanges[roster.id].moraleChange += stars >= 3.5 ? 5 : (stars <= 2.0 ? -3 : 0);

          if (isTurnPromo) {
            const currentAlignment = roster.alignment || 'Face';
            rosterChanges[roster.id].newAlignment = currentAlignment === 'Face' ? 'Heel' : 'Face';
          }
        }

        if (nextMorale < 20 && !rosterChanges[roster.id].quitBrand && healthyWrestlersCount > 9) {
          const walkoutChance = (20 - nextMorale) * 3.0;
          if (Math.random() * 100 < walkoutChance) {
            rosterChanges[roster.id].quitBrand = true;
            healthyWrestlersCount--;
            summary += i18n.t(getRandomSummaryKey('walkout'), {
              ns: 'myGM/summary',
              wrestler: wrestler.name
            }) + " ";
          }
        }
      });

      segmentResults.push({ segmentId: segment.id, type: actualType, title: displayTitle, stars, winnerIds, winnerNames, summary: summary.trim() });
    }

    fullRoster.forEach(w => {
      if (initiallyInjuredIds.has(w.id)) {
        if (!rosterChanges[w.id]) rosterChanges[w.id] = { fatigueChange: 0, moraleChange: 0, popChange: 0 };
        rosterChanges[w.id].isRecovering = true;
      } else if (!participantIds.has(w.id)) {
        if (!rosterChanges[w.id]) rosterChanges[w.id] = { fatigueChange: 0, moraleChange: 0, popChange: 0 };
        rosterChanges[w.id].fatigueChange -= 15;
        rosterChanges[w.id].moraleChange -= 5;
      }
    });

    const averageStars = card.gm_segments?.length > 0 ? (totalStars / card.gm_segments.length) : 0;
    const finalRating = Math.round((averageStars / 5) * 100);
    const fansGained = Math.round(((finalRating - 45) * 150) + (Math.random() * 500 - 250));
    const currentFans = currentSession.fans || 0;

    const attendance = Math.floor((currentFans * 0.05) + (finalRating * 50));
    const ticketRev = attendance * SIMULATION_RULES.ticketPrice;
    const merchRev = attendance * SIMULATION_RULES.merchPerFan;
    const netProfit = (ticketRev + merchRev) - totalShowCost;

    let newBudget = (currentSession.budget || 0) + netProfit;

    if (newBudget < totalShowCost) {
      newBudget = totalShowCost;
    }

    const previousFans = currentSession.fans || 0;
    const newTotalFans = Math.max(0, previousFans + fansGained);

    const FAN_MILESTONE = 15000;
    const BONUS_AMOUNT = 800000;

    const previousMilestones = Math.floor(previousFans / FAN_MILESTONE);
    const currentMilestones = Math.floor(newTotalFans / FAN_MILESTONE);

    let bonusEarned = 0;

    if (currentMilestones > previousMilestones) {
      const milestonesCrossed = currentMilestones - previousMilestones;
      const totalBonus = milestonesCrossed * BONUS_AMOUNT;
      newBudget += totalBonus;
      bonusEarned = totalBonus;
    }

    if (currentMilestones > previousMilestones) {
      const milestonesCrossed = currentMilestones - previousMilestones;
      const totalBonus = milestonesCrossed * BONUS_AMOUNT;
      newBudget += totalBonus;
      console.log(`¡Hito alcanzado! Ganaste un bono de $${totalBonus} por superar los ${currentMilestones * FAN_MILESTONE} fans.`);
    }

    const allBrands = ['raw', 'smackdown', 'nxt', 'evolve'];
    const prevRankings: Record<string, number> = {};
    allBrands.map(b => ({ name: b, fans: (currentSession[`${b}_fans` as keyof GameSession] as number) || 0 }))
      .sort((a, b) => b.fans - a.fans)
      .forEach((b, i) => prevRankings[b.name] = i + 1);

    const weeklyResults: Record<string, any> = {};
    allBrands.forEach(brand => {
      if (brand === userBrand) {
        weeklyResults[brand] = { rating: finalRating, fansGained, totalFans: Math.max(0, currentFans + fansGained) };
      } else {
        const aiRating = Math.floor(Math.random() * (90 - 40 + 1)) + 40;
        const aiFansGained = Math.round(((aiRating - 45) * 150) + (Math.random() * 500 - 250));
        weeklyResults[brand] = {
          rating: aiRating,
          fansGained: Math.max(-500, aiFansGained),
          totalFans: Math.max(0, ((currentSession[`${brand}_fans` as keyof GameSession] as number) || 0) + aiFansGained)
        };
      }
    });

    const updateRosterPromises = Object.entries(rosterChanges).map(async ([rosterId, change]) => {
      const found = fullRoster.find(w => w.id === rosterId);
      if (!found) return;

      const updatePayload: any = {
        fatigue: Math.max(0, Math.min(100, (found.fatigue || 0) + change.fatigueChange)),
        morale: Math.max(0, Math.min(100, (found.morale || 70) + change.moraleChange)),
        current_pop: Math.max(0, Math.min(100, (found.current_pop || 50) + change.popChange))
      };

      if (championStatusUpdates[rosterId] !== undefined) updatePayload.is_champion = championStatusUpdates[rosterId];
      if (change.quitBrand) updatePayload.brand = null;
      if (change.newAlignment) updatePayload.alignment = change.newAlignment;

      if (change.isInjured) {
        updatePayload.is_injured = true;
        updatePayload.days_out = change.daysOut;
        updatePayload.injury_severity = change.injurySeverity;
        updatePayload.injury_type = change.injuryType;
      }

      if (change.isRecovering && found.days_out) {
        const remainingDays = Math.max(0, found.days_out - 1);

        if (remainingDays === 0) {
          updatePayload.is_injured = false;
          updatePayload.days_out = 0;
          updatePayload.injury_severity = null;
          updatePayload.injury_type = null;
        } else {
          updatePayload.days_out = remainingDays;
        }
      }

      return supabase.from('gm_session_roster').update(updatePayload).eq('id', rosterId);
    });

    await Promise.all(updateRosterPromises);

    await supabase.from('gm_cards').update({ status: 'completed' }).eq('id', cardId);

    await supabase.from('gm_shows').insert({
      session_id: sessionId, week: currentSession.week, total_cost: totalShowCost, total_rating: finalRating, fans_gained: fansGained,
      ...Object.fromEntries(allBrands.map(b => [`${b}_rating`, weeklyResults[b].rating])),
      ...Object.fromEntries(allBrands.map(b => [`${b}_fans_gained`, weeklyResults[b].fansGained]))
    });

    await supabase.from('gm_game_sessions').update({
      week: currentSession.week + 1,
      budget: newBudget,
      ...Object.fromEntries(allBrands.map(b => [`${b}_fans`, weeklyResults[b].totalFans])),
      ...Object.fromEntries(allBrands.map(b => [`${b}_prev_rank`, prevRankings[b]]))
    }).eq('id', sessionId);

    return { success: true, finalRating, fansGained, segmentResults, bonusEarned };
  } catch (error) {
    console.error("Error crítico en núcleo simulador:", error);
    throw error;
  }
};

export const getPendingCard = async (sessionId: string, week: number): Promise<CardResponse> => {
  const { data, error } = await supabase
    .from('gm_cards')
    .select(`
      *,
      gm_segments (
        *,
        gm_segment_participants (
          *,
          gm_session_roster ( *, gm_wrestlers (*) ) 
        )
      )
    `)
    .eq('session_id', sessionId)
    .eq('week', week)
    .limit(1)
    .single();

  if (error) throw error;

  return data as unknown as CardResponse;
};