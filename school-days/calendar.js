(function (root) {
  'use strict';
  const start = '2026-09-07', end = '2027-07-08';
  const terms = [
    ['Autumn · first half', '2026-09-08', '2026-10-23'],
    ['Autumn · second half', '2026-11-09', '2026-12-17'],
    ['Spring · first half', '2027-01-07', '2027-02-12'],
    ['Spring · second half', '2027-02-22', '2027-03-19'],
    ['Summer · first half', '2027-04-12', '2027-05-28'],
    ['Summer · second half', '2027-06-07', end]
  ];
  function parse(key) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) throw Error('Enter a valid date.');
    const d = new Date(key + 'T12:00:00Z');
    if (!Number.isFinite(+d) || d.toISOString().slice(0, 10) !== key) throw Error('Enter a valid date.');
    return d;
  }
  function next(key) { const d = parse(key); d.setUTCDate(d.getUTCDate() + 1); return d.toISOString().slice(0, 10); }
  function kind(key, induction = false) {
    const day = parse(key).getUTCDay();
    if (key < start || key > end) return 'unknown';
    if (key === '2027-06-26') return 'special';
    if (key === start && induction) return 'school';
    if (day === 0 || day === 6) return 'weekend';
    if (key === '2027-05-03') return 'holiday';
    return terms.some(([, a, b]) => key >= a && key <= b) ? 'school' : 'holiday';
  }
  function count(from, to, induction = false) {
    parse(from); parse(to);
    if (to < from) throw Error('Choose today or a future date.');
    if (from < start || from > end || to > end) throw Error('This calendar covers 7 September 2026 to 8 July 2027. A complete count outside those dates needs another school calendar.');
    const result = {school: 0, weekend: 0, holiday: 0, special: 0, total: 0};
    for (let key = next(from); key <= to; key = next(key)) {
      const type = kind(key, induction); result[type]++; result.total++;
    }
    result.school += result.special;
    return result;
  }
  const api = {start, end, terms, parse, next, kind, count};
  if (typeof module !== 'undefined') module.exports = api;
  else root.SchoolCalendar = api;
})(globalThis);
