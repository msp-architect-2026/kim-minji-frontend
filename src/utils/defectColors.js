export const DEFECT_COLORS = {
  'Center':    { bg: '#e8f0ff', color: '#0071e3' },
  'Donut':     { bg: '#fff0e8', color: '#ff6b00' },
  'Edge-Loc':  { bg: '#e8fff0', color: '#34c759' },
  'Edge-Ring': { bg: '#ffe8f0', color: '#ff2d55' },
  'Loc':       { bg: '#f0e8ff', color: '#af52de' },
  'Near-full': { bg: '#e8f8ff', color: '#5ac8fa' },
  'Random':    { bg: '#fff8e8', color: '#ff9f0a' },
  'Scratch':   { bg: '#ffe8e8', color: '#ff3b30' },
  'none':      { bg: '#e8f5e9', color: '#2e7d32' },
};

export const getDefectColor = (prediction) => {
  return DEFECT_COLORS[prediction] || { bg: '#f5f5f7', color: '#6e6e73' };
};

export const CHART_COLORS = [
  '#0071e3', '#ff6b00', '#34c759', '#ff2d55',
  '#af52de', '#5ac8fa', '#ff9f0a', '#ff3b30', '#2e7d32'
];