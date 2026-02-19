const FD_API_KEY = '886f7a378b1c41a09b4ee097abe03d4f';
const dateStr = '2026-02-17';

const nextDay = new Date(dateStr + 'T00:00:00Z');
nextDay.setUTCDate(nextDay.getUTCDate() + 1);
const dateToStr = nextDay.toISOString().split('T')[0];

console.log('Fetching', dateStr, 'to', dateToStr);

const res = await fetch(
  `https://api.football-data.org/v4/matches?dateFrom=${dateStr}&dateTo=${dateToStr}`,
  { headers: { 'X-Auth-Token': FD_API_KEY } }
);
const data = await res.json();

const matches = data.matches.filter(
  m => m.status !== 'CANCELLED' && m.utcDate.startsWith(dateStr)
);

console.log('Found:', matches.length, 'matchs');
matches.forEach(m => {
  const d = new Date(m.utcDate);
  const time = d.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Paris',
  });
  console.log(
    ' ',
    m.homeTeam.name,
    'vs',
    m.awayTeam.name,
    '|',
    m.competition.name,
    '|',
    time,
    '|',
    m.status
  );
});
