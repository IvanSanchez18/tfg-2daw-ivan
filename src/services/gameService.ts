import { supabase } from "./supabaseClient";

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