Global = {
  _MAX_AVAILABLE_SMS_COUNT: 500

};
Global.timeLimits = {
    day: 24 * 60 * 60 * 1000,
    week: 7 * 24 * 60 * 60 * 1000,
    month: 30 * 24 * 60 * 60 * 1000,
    quarter: 91 * 24 * 60 * 60 * 1000,
    year: 365 * 24 * 60 * 60 * 1000
};
var dayISO, weekISO, monthISO, yearISO
dayISO = moment().subtract(1, 'day');
weekISO = moment().subtract(1, 'week');
monthISO = moment().subtract(1, 'month');
quarterISO = moment().subtract(91, 'day');
yearISO = moment().subtract(1, 'year');
Global.timeLimitsISO = {
    day: dayISO,
    week: weekISO,
    month: monthISO,
    year: yearISO
}
