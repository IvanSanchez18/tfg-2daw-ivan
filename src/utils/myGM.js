export const MAX_SLOTS = 3;

export const BRANDS = [
    {
        id: 'raw',
        name: 'Monday Night Raw',
        shortName: 'RAW',
        logo: './images/Raw_logo.png',
        color: '#d32f2f',
        initialBudget: 9000000,
        description: 'description.raw'
    },
    {
        id: 'smackdown',
        name: 'Friday Night SmackDown',
        shortName: 'SD',
        logo: './images/Smackdown_logo.png',
        color: '#1976d2',
        initialBudget: 8000000,
        description: 'description.smackdown'
    },
    {
        id: 'nxt',
        name: 'NXT',
        shortName: 'NXT',
        logo: './images/Nxt_logo.png',
        color: '#fbc02d',
        initialBudget: 5000000,
        description: 'description.nxt'
    },
    {
        id: 'evolve',
        name: 'Evolve Wrestling',
        shortName: 'EVOLVE',
        logo: './images/Evolve_logo.png',
        color: '#48146b',
        initialBudget: 3250000,
        description: 'description.evolve'
    }
];

export const ALIGNMENTS = [
    { id: 'Face', label: 'align_face' },
    { id: 'Heel', label: 'align_heel' }
];

export const GENDERS = [
    { id: 'male', label: 'gender_male' },
    { id: 'female', label: 'gender_female' }
];

export const STYLES = [
    { id: 'Giant', label: 'style_giant' },
    { id: 'Cruiser', label: 'style_cruiser' },
    { id: 'Brawler', label: 'style_brawler' },
    { id: 'Fighter', label: 'style_fighter' },
    { id: 'Specialist', label: 'style_specialist' }
];

export const STYLE_COUNTERS = {
    'Giant': 'Cruiser',
    'Cruiser': 'Giant',
    'Brawler': 'Fighter',
    'Fighter': 'Brawler',
    'Specialist': 'Specialist'
};

export const LOGISTICS_OPTIONS = {
    arenas: [
        {
            level: 1,
            name: 'items.arenas.lvl1.name',
            cost: 0,
            capacity: 5000,
            description: 'items.arenas.lvl1.description',
            image: './images/logistics/arena1.avif'
        },
        {
            level: 2,
            name: 'items.arenas.lvl2.name',
            cost: 15000,
            capacity: 15000,
            description: 'items.arenas.lvl2.description',
            image: './images/logistics/arena2.jpg'
        },
        {
            level: 3,
            name: 'items.arenas.lvl3.name',
            cost: 40000,
            capacity: 35000,
            description: 'items.arenas.lvl3.description',
            image: './images/logistics/arena3.jpg'
        },
        {
            level: 4,
            name: 'items.arenas.lvl4.name',
            cost: 100000,
            capacity: 70000,
            description: 'items.arenas.lvl4.description',
            image: './images/logistics/arena4.jpg'
        }
    ],
    production: [
        {
            level: 1,
            name: 'items.production.lvl1.name',
            cost: 0,
            ratingBonus: 0,
            description: 'items.production.lvl1.description',
            image: './images/logistics/production1.jpg'
        },
        {
            level: 2,
            name: 'items.production.lvl2.name',
            cost: 10000,
            ratingBonus: 0.2,
            description: 'items.production.lvl2.description',
            image: './images/logistics/production2.jpg'
        },
        {
            level: 3,
            name: 'items.production.lvl3.name',
            cost: 25000,
            ratingBonus: 0.5,
            description: 'items.production.lvl3.description',
            image: './images/logistics/production3.jpg'
        }
    ],
    advertising: [
        {
            level: 1,
            name: 'items.advertising.lvl1.name',
            cost: 0,
            fanMultiplier: 1.0,
            description: 'items.advertising.lvl1.description',
            image: './images/logistics/advertising1.jpg'
        },
        {
            level: 2,
            name: 'items.advertising.lvl2.name',
            cost: 8000,
            fanMultiplier: 1.15,
            description: 'items.advertising.lvl2.description',
            image: './images/logistics/advertising2.jpg'
        },
        {
            level: 3,
            name: 'items.advertising.lvl3.name',
            cost: 20000,
            fanMultiplier: 1.35,
            description: 'items.advertising.lvl3.description',
            image: './images/logistics/advertising3.webp'
        }
    ]
};

export const MATCH_CATEGORIES = {
    '1v1': { label: 'match1v1', max: 2 },
    '2v2': { label: 'match2v2', max: 4 },
    'triple_threat': { label: 'matchTripleThreat', max: 3 },
    'fatal_4_way': { label: 'matchFatal4Way', max: 4 }
};

export const STIPULATIONS = [
    { id: 'Normal', label: 'stipNormal', cost: 0 },
    { id: 'Extreme Rules', label: 'stipExtremeRules', cost: 15000 },
    { id: 'Steel Cage', label: 'stipSteelCage', cost: 30000 },
    { id: 'Hell in a Cell', label: 'stipHellInACell', cost: 50000 },
    { id: 'Tables', label: 'stipTables', cost: 20000 },
    { id: 'TLC', label: 'stipTLC', cost: 40000 }
];

export const PROMO_TYPES = [
    { id: 'self', label: 'promoSelf', cost: 0 },
    { id: 'taunt', label: 'promoTaunt', cost: 0 },
    { id: 'turn', label: 'promoTurn', cost: 0 },
    { id: 'ads', label: 'promoAds', cost: 0 },
    { id: 'charity', label: 'promoCharity', cost: 0 },
    { id: 'invasion', label: 'promoInvasion', cost: 50000 }
];

export const INJURY_SEVERITY = {
    1: { label: 'injury_severity_1', color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    2: { label: 'injury_severity_2', color: 'text-orange-500', bg: 'bg-orange-500/10' },
    3: { label: 'injury_severity_3', color: 'text-red-500', bg: 'bg-red-500/10' }
};

export const INJURY_TYPES = {
    knee: 'injury_type_knee',
    shoulder: 'injury_type_shoulder',
    neck: 'injury_type_neck',
    back: 'injury_type_back',
    ankle: 'injury_type_ankle',
    arm: 'injury_type_arm'
};

export const SIMULATION_RULES = {
    fatigueCost: {
        'Normal': 15,
        'Tag Team': 12,
        'TLC': 25,
        'Hell in a Cell': 30,
        'promo': 5
    },
    popularity: {
        win: 3,
        lose: -2,
        promo: 1
    },
    ticketPrice: 35,
    merchPerFan: 10
};