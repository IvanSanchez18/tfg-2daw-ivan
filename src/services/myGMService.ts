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