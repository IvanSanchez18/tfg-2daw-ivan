export const SUMMARY_KEYS = {
    title_change: [
        'summary_title_change_1', 'summary_title_change_2',
        'summary_title_change_3', 'summary_title_change_4'
    ],
    title_retain: [
        'summary_title_retain_1', 'summary_title_retain_2',
        'summary_title_retain_3', 'summary_title_retain_4'
    ],
    match_amazing: [
        'summary_match_amazing_1', 'summary_match_amazing_2',
        'summary_match_amazing_3', 'summary_match_amazing_4'
    ],
    match_good: [
        'summary_match_good_1', 'summary_match_good_2',
        'summary_match_good_3', 'summary_match_good_4'
    ],
    match_decent: [
        'summary_match_decent_1', 'summary_match_decent_2',
        'summary_match_decent_3', 'summary_match_decent_4'
    ],
    match_poor: [
        'summary_match_poor_1', 'summary_match_poor_2',
        'summary_match_poor_3', 'summary_match_poor_4'
    ],
    injury: [
        'summary_injury_1', 'summary_injury_2',
        'summary_injury_3', 'summary_injury_4'
    ],
    walkout: [
        'summary_walkout_1', 'summary_walkout_2',
        'summary_walkout_3', 'summary_walkout_4'
    ],
    promo_turn_surprise: [
        'summary_promo_turn_surprise_1', 'summary_promo_turn_surprise_2',
        'summary_promo_turn_surprise_3', 'summary_promo_turn_surprise_4'
    ],
    promo_turn_good: [
        'summary_promo_turn_good_1', 'summary_promo_turn_good_2',
        'summary_promo_turn_good_3', 'summary_promo_turn_good_4'
    ],
    promo_turn_bad: [
        'summary_promo_turn_bad_1', 'summary_promo_turn_bad_2',
        'summary_promo_turn_bad_3', 'summary_promo_turn_bad_4'
    ],
    promo_amazing: [
        'summary_promo_amazing_1', 'summary_promo_amazing_2',
        'summary_promo_amazing_3', 'summary_promo_amazing_4'
    ],
    promo_good: [
        'summary_promo_good_1', 'summary_promo_good_2',
        'summary_promo_good_3', 'summary_promo_good_4'
    ],
    promo_poor: [
        'summary_promo_poor_1', 'summary_promo_poor_2',
        'summary_promo_poor_3', 'summary_promo_poor_4'
    ],
    title_vacated: [
        'summary_title_vacated_1', 'summary_title_vacated_2',
        'summary_title_vacated_3', 'summary_title_vacated_4'
    ]
};

export const getRandomSummaryKey = (category) => {
    const keys = SUMMARY_KEYS[category];
    if (!keys || keys.length === 0) return '';
    return keys[Math.floor(Math.random() * keys.length)];
};

export const getMatchQualityKey = (stars) => {
    if (stars >= 4.5) return getRandomSummaryKey('match_amazing');
    if (stars >= 3.5) return getRandomSummaryKey('match_good');
    if (stars >= 2.5) return getRandomSummaryKey('match_decent');
    return getRandomSummaryKey('match_poor');
};

export const getPromoQualityKey = (stars, isTurnPromo) => {
    if (isTurnPromo) {
        return stars >= 3 ? getRandomSummaryKey('promo_turn_good') : getRandomSummaryKey('promo_turn_bad');
    }
    if (stars >= 4) return getRandomSummaryKey('promo_amazing');
    if (stars >= 2.5) return getRandomSummaryKey('promo_good');
    return getRandomSummaryKey('promo_poor');
};