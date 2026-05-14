export interface GameSession {
    id: string;
    user_id: string;
    brand: string | null;
    budget: number;
    week: number;
    fans: number;
    max_weeks: number;
    ai_fans?: number;
    is_drafted: boolean;
}