export type Alignment = 'Face' | 'Heel';
export type Style = 'Brawler' | 'High Flyer' | 'Technician' | 'Powerhouse' | 'Specialist';
export type Gender = 'male' | 'female';

export interface Wrestler {
    id: string;
    name: string;
    power: number;
    technique: number;
    charisma: number;
    speed: number;
    durability: number;
    ring_iq: number;
    image_url: string | null;
    gender: Gender;
    base_pop: number;
    style: Style;
    default_alignment: Alignment;
}

export interface GameSession {
    id: string;
    user_id: string;
    brand: string | null;
    budget?: number;
    week: number;
    fans: number;
    max_weeks: number;
    ai_fans?: number;
    is_drafted: boolean;
}

export interface SessionRoster {
    id: string;
    session_id: string;
    wrestler_id: string;
    alignment: Alignment;
    fatigue: number;
    morale: number;
    is_injured: boolean;
    injury_weeks?: number;
    is_champion: boolean;
    current_pop: number;
    contract_weeks: number;
    salary?: number;
    wrestler?: Wrestler;
    days_out: number;
    injury_type?: string;
    injury_severity?: number;
}

export interface Show {
    id: string;
    session_id: string;
    week: number;
    total_cost: number;
    total_rating: number;
    fans_gained: number;
}

export interface Segment {
    id: string;
    show_id: string;
    segment_type: 'match' | 'promo';
    match_type: string;
    card_position: number;
    rating: number;
}

export interface SegmentParticipant {
    id: string;
    segment_id: string;
    roster_id: string;
    team: number;
    is_winner: boolean;
    role: 'competitor' | 'manager' | 'interfered';
}

export interface Rivalry {
    id: string;
    session_id: string | null;
    wrestler1_id: string | null;
    wrestler2_id: string | null;
    level: number | null;
    start_week: number | null;
    is_active: boolean | null;
    created_at: string | null;
    is_tag_team: boolean | null;
    team1_id: string | null;
    team2_id: string | null;
    end_week: number | null;
}

export interface LogisticsData {
    arena_level: number;
    production_level: number;
    advertising_level: number;
    total_cost: number;
}

export interface CardResponse {
    id: string;
    session_id: string;
    brand: string | null;
    week: number | null;
    status: string | null;
    cost: number | null;
    target_brand: string | null;
    gm_segments: Segment[];
}

export interface TitleChangeResult {
    success: boolean;
    newChampPop: number;
    oldChampPop: number;
}

export interface SimulationResponse {
    success: boolean;
    finalRating: number;
    fansGained: number;
    segmentResults: SegmentResult[];
    bonusEarned?: number;
}

export interface SegmentResult {
    segmentId: string;
    type: string;
    title: string;
    stars: number;
    winnerIds: string[];
    winnerNames: string[];
    summary: string;
}

export interface GMWrestler {
    id: string;
    name: string;
    power: number;
    technique: number;
    speed: number;
    durability: number;
    ring_iq: number;
    charisma: number;
    style: string;
}

export interface GMSessionRoster {
    id: string;
    session_id: string;
    brand: string | null;
    salary: number;
    alignment: string;
    morale: number;
    fatigue: number;
    current_pop: number;
    is_champion: boolean;
    is_injured: boolean;
    days_out: number;
    injury_severity: 1 | 2 | 3 | null;
    injury_type: string | null;
    gm_wrestlers?: GMWrestler;
}

export interface RosterStateChange {
    fatigueChange: number;
    moraleChange: number;
    popChange: number;
    isInjured?: boolean;
    daysOut?: number;
    injurySeverity?: number;
    injuryType?: string;
    quitBrand?: boolean;
    isRecovering?: boolean;
    newAlignment?: string;
}