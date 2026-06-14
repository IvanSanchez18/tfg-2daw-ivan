export const hexToRgba = (hex, alpha) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const groupParticipantsByTeam = (participants = []) => {
  const groups = {};
  participants.forEach(p => {
    const teamId = p.team ? p.team.toString() : p.id;
    if (!groups[teamId]) groups[teamId] = [];
    groups[teamId].push(p);
  });
  return Object.values(groups);
};

export const getSegmentTitle = (seg) => {
  if (!seg.match_type) return 'Segmento Oficial';
  if (seg.segment_type === 'promo' && seg.match_type.startsWith('Promo: ')) {
    return seg.match_type.replace('Promo: ', '').trim();
  }
  return seg.match_type;
};