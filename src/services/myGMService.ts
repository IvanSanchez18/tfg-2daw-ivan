import { supabase } from "./supabaseClient";
import { GameSession } from '../types';

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