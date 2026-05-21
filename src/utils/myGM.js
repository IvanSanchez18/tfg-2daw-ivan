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

export const ALIGNMENTS = ['Face', 'Heel'];

export const GENDERS = [
    { id: 'male', label: 'Masculino' },
    { id: 'female', label: 'Femenino' }
];

export const STYLES = [
    'Giant',
    'Cruiser',
    'Brawler',
    'Fighter',
    'Specialist'
];

export const STYLE_COUNTERS = {
    'Giant': 'Cruiser',
    'Cruiser': 'Giant',
    'Brawler': 'Fighter',
    'Fighter': 'Brawler',
    'Specialist': 'Specialist'
};