// ==============================================================================
// TETHER-EDGE — PROFESSIONAL MINIMALIST FLEET CONTROL PLANE
// ==============================================================================
// Minimalist, distraction-free UI inspired by ChatGPT, iLovePDF, and Biblos.
// Featuring an interactive, customizable Node Graph Pipeline Canvas.
// ==============================================================================

const {
  useState,
  useEffect,
  useRef,
  useCallback
} = React;

// ------------------------------------------------------------------------------
// CLEAN MINIMALIST SVG ICONS (Zero external dependency failures)
// ------------------------------------------------------------------------------
const Icon = ({
  name,
  className = "w-4 h-4"
}) => {
  switch (name) {
    case 'video':
      return /*#__PURE__*/React.createElement("svg", {
        className: className,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2",
        strokeLinecap: "round",
        strokeLinejoin: "round"
      }, /*#__PURE__*/React.createElement("polygon", {
        points: "23 7 16 12 23 17 23 7"
      }), /*#__PURE__*/React.createElement("rect", {
        x: "1",
        y: "5",
        width: "15",
        height: "14",
        rx: "2",
        ry: "2"
      }));
    case 'server':
      return /*#__PURE__*/React.createElement("svg", {
        className: className,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2",
        strokeLinecap: "round",
        strokeLinejoin: "round"
      }, /*#__PURE__*/React.createElement("rect", {
        x: "2",
        y: "2",
        width: "20",
        height: "8",
        rx: "2",
        ry: "2"
      }), /*#__PURE__*/React.createElement("rect", {
        x: "2",
        y: "14",
        width: "20",
        height: "8",
        rx: "2",
        ry: "2"
      }), /*#__PURE__*/React.createElement("line", {
        x1: "6",
        y1: "6",
        x2: "6.01",
        y2: "6"
      }), /*#__PURE__*/React.createElement("line", {
        x1: "6",
        y1: "18",
        x2: "6.01",
        y2: "18"
      }));
    case 'brain':
      return /*#__PURE__*/React.createElement("svg", {
        className: className,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2",
        strokeLinecap: "round",
        strokeLinejoin: "round"
      }, /*#__PURE__*/React.createElement("path", {
        d: "M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.04"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.04"
      }));
    case 'shield':
      return /*#__PURE__*/React.createElement("svg", {
        className: className,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2",
        strokeLinecap: "round",
        strokeLinejoin: "round"
      }, /*#__PURE__*/React.createElement("path", {
        d: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
      }));
    case 'workflow':
      return /*#__PURE__*/React.createElement("svg", {
        className: className,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2",
        strokeLinecap: "round",
        strokeLinejoin: "round"
      }, /*#__PURE__*/React.createElement("rect", {
        x: "3",
        y: "3",
        width: "6",
        height: "6",
        rx: "1.5"
      }), /*#__PURE__*/React.createElement("rect", {
        x: "15",
        y: "3",
        width: "6",
        height: "6",
        rx: "1.5"
      }), /*#__PURE__*/React.createElement("rect", {
        x: "9",
        y: "15",
        width: "6",
        height: "6",
        rx: "1.5"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M6 9v3a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V9"
      }), /*#__PURE__*/React.createElement("line", {
        x1: "12",
        y1: "13",
        x2: "12",
        y2: "15"
      }));
    case 'activity':
      return /*#__PURE__*/React.createElement("svg", {
        className: className,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2",
        strokeLinecap: "round",
        strokeLinejoin: "round"
      }, /*#__PURE__*/React.createElement("polyline", {
        points: "22 12 18 12 15 21 9 3 6 12 2 12"
      }));
    case 'copy':
      return /*#__PURE__*/React.createElement("svg", {
        className: className,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2",
        strokeLinecap: "round",
        strokeLinejoin: "round"
      }, /*#__PURE__*/React.createElement("rect", {
        x: "9",
        y: "9",
        width: "13",
        height: "13",
        rx: "2",
        ry: "2"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
      }));
    case 'check':
      return /*#__PURE__*/React.createElement("svg", {
        className: className,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2",
        strokeLinecap: "round",
        strokeLinejoin: "round"
      }, /*#__PURE__*/React.createElement("polyline", {
        points: "20 6 9 17 4 12"
      }));
    case 'upload':
      return /*#__PURE__*/React.createElement("svg", {
        className: className,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2",
        strokeLinecap: "round",
        strokeLinejoin: "round"
      }, /*#__PURE__*/React.createElement("path", {
        d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
      }), /*#__PURE__*/React.createElement("polyline", {
        points: "17 8 12 3 7 8"
      }), /*#__PURE__*/React.createElement("line", {
        x1: "12",
        y1: "3",
        x2: "12",
        y2: "15"
      }));
    case 'refresh':
      return /*#__PURE__*/React.createElement("svg", {
        className: className,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2",
        strokeLinecap: "round",
        strokeLinejoin: "round"
      }, /*#__PURE__*/React.createElement("polyline", {
        points: "23 4 23 10 17 10"
      }), /*#__PURE__*/React.createElement("polyline", {
        points: "1 20 1 14 7 14"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"
      }));
    case 'send':
      return /*#__PURE__*/React.createElement("svg", {
        className: className,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2",
        strokeLinecap: "round",
        strokeLinejoin: "round"
      }, /*#__PURE__*/React.createElement("line", {
        x1: "22",
        y1: "2",
        x2: "11",
        y2: "13"
      }), /*#__PURE__*/React.createElement("polygon", {
        points: "22 2 15 22 11 13 2 9 22 2"
      }));
    case 'cpu':
      return /*#__PURE__*/React.createElement("svg", {
        className: className,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2",
        strokeLinecap: "round",
        strokeLinejoin: "round"
      }, /*#__PURE__*/React.createElement("rect", {
        x: "4",
        y: "4",
        width: "16",
        height: "16",
        rx: "2",
        ry: "2"
      }), /*#__PURE__*/React.createElement("rect", {
        x: "9",
        y: "9",
        width: "6",
        height: "6"
      }), /*#__PURE__*/React.createElement("line", {
        x1: "9",
        y1: "1",
        x2: "9",
        y2: "4"
      }), /*#__PURE__*/React.createElement("line", {
        x1: "15",
        y1: "1",
        x2: "15",
        y2: "4"
      }), /*#__PURE__*/React.createElement("line", {
        x1: "9",
        y1: "20",
        x2: "9",
        y2: "23"
      }), /*#__PURE__*/React.createElement("line", {
        x1: "15",
        y1: "20",
        x2: "15",
        y2: "23"
      }), /*#__PURE__*/React.createElement("line", {
        x1: "20",
        y1: "9",
        x2: "23",
        y2: "9"
      }), /*#__PURE__*/React.createElement("line", {
        x1: "20",
        y1: "14",
        x2: "23",
        y2: "14"
      }), /*#__PURE__*/React.createElement("line", {
        x1: "1",
        y1: "9",
        x2: "4",
        y2: "9"
      }), /*#__PURE__*/React.createElement("line", {
        x1: "1",
        y1: "14",
        x2: "4",
        y2: "14"
      }));
    case 'zap':
      return /*#__PURE__*/React.createElement("svg", {
        className: className,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2",
        strokeLinecap: "round",
        strokeLinejoin: "round"
      }, /*#__PURE__*/React.createElement("polygon", {
        points: "13 2 3 14 12 14 11 22 21 10 12 10 13 2"
      }));
    case 'plus':
      return /*#__PURE__*/React.createElement("svg", {
        className: className,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2",
        strokeLinecap: "round",
        strokeLinejoin: "round"
      }, /*#__PURE__*/React.createElement("line", {
        x1: "12",
        y1: "5",
        x2: "12",
        y2: "19"
      }), /*#__PURE__*/React.createElement("line", {
        x1: "5",
        y1: "12",
        x2: "19",
        y2: "12"
      }));
    case 'trash':
      return /*#__PURE__*/React.createElement("svg", {
        className: className,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2",
        strokeLinecap: "round",
        strokeLinejoin: "round"
      }, /*#__PURE__*/React.createElement("polyline", {
        points: "3 6 5 6 21 6"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
      }));
    case 'sliders':
      return /*#__PURE__*/React.createElement("svg", {
        className: className,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2",
        strokeLinecap: "round",
        strokeLinejoin: "round"
      }, /*#__PURE__*/React.createElement("line", {
        x1: "4",
        y1: "21",
        x2: "4",
        y2: "14"
      }), /*#__PURE__*/React.createElement("line", {
        x1: "4",
        y1: "10",
        x2: "4",
        y2: "3"
      }), /*#__PURE__*/React.createElement("line", {
        x1: "12",
        y1: "21",
        x2: "12",
        y2: "12"
      }), /*#__PURE__*/React.createElement("line", {
        x1: "12",
        y1: "8",
        x2: "12",
        y2: "3"
      }), /*#__PURE__*/React.createElement("line", {
        x1: "20",
        y1: "21",
        x2: "20",
        y2: "16"
      }), /*#__PURE__*/React.createElement("line", {
        x1: "20",
        y1: "12",
        x2: "20",
        y2: "3"
      }), /*#__PURE__*/React.createElement("line", {
        x1: "1",
        y1: "14",
        x2: "7",
        y2: "14"
      }), /*#__PURE__*/React.createElement("line", {
        x1: "9",
        y1: "8",
        x2: "15",
        y2: "8"
      }), /*#__PURE__*/React.createElement("line", {
        x1: "17",
        y1: "16",
        x2: "23",
        y2: "16"
      }));
    case 'terminal':
      return /*#__PURE__*/React.createElement("svg", {
        className: className,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2",
        strokeLinecap: "round",
        strokeLinejoin: "round"
      }, /*#__PURE__*/React.createElement("polyline", {
        points: "4 17 10 11 4 5"
      }), /*#__PURE__*/React.createElement("line", {
        x1: "12",
        y1: "19",
        x2: "20",
        y2: "19"
      }));
    case 'play':
      return /*#__PURE__*/React.createElement("svg", {
        className: className,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2",
        strokeLinecap: "round",
        strokeLinejoin: "round"
      }, /*#__PURE__*/React.createElement("polygon", {
        points: "5 3 19 12 5 21 5 3"
      }));
    case 'stop':
      return /*#__PURE__*/React.createElement("svg", {
        className: className,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2",
        strokeLinecap: "round",
        strokeLinejoin: "round"
      }, /*#__PURE__*/React.createElement("rect", {
        x: "4",
        y: "4",
        width: "16",
        height: "16",
        rx: "2",
        ry: "2"
      }));
    case 'power':
      return /*#__PURE__*/React.createElement("svg", {
        className: className,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2",
        strokeLinecap: "round",
        strokeLinejoin: "round"
      }, /*#__PURE__*/React.createElement("path", {
        d: "M18.36 6.64a9 9 0 1 1-12.73 0"
      }), /*#__PURE__*/React.createElement("line", {
        x1: "12",
        y1: "2",
        x2: "12",
        y2: "12"
      }));
    case 'info':
      return /*#__PURE__*/React.createElement("svg", {
        className: className,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2",
        strokeLinecap: "round",
        strokeLinejoin: "round"
      }, /*#__PURE__*/React.createElement("circle", {
        cx: "12",
        cy: "12",
        r: "10"
      }), /*#__PURE__*/React.createElement("line", {
        x1: "12",
        y1: "16",
        x2: "12",
        y2: "12"
      }), /*#__PURE__*/React.createElement("line", {
        x1: "12",
        y1: "8",
        x2: "12.01",
        y2: "8"
      }));
    default:
      return /*#__PURE__*/React.createElement("svg", {
        className: className,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2",
        strokeLinecap: "round",
        strokeLinejoin: "round"
      }, /*#__PURE__*/React.createElement("circle", {
        cx: "12",
        cy: "12",
        r: "10"
      }), /*#__PURE__*/React.createElement("line", {
        x1: "12",
        y1: "8",
        x2: "12",
        y2: "12"
      }), /*#__PURE__*/React.createElement("line", {
        x1: "12",
        y1: "16",
        x2: "12.01",
        y2: "16"
      }));
  }
};

// ------------------------------------------------------------------------------
// HIGH-PERFORMANCE INDUSTRIAL TELEMETRY GRAPH (Clean, Precision SVG)
// ------------------------------------------------------------------------------
function MetricGraph({
  data = [],
  min = 0,
  max,
  unit = '',
  color = 'cyan',
  threshold,
  thresholdLabel,
  height = 85,
  title,
  isActive = true,
  subtitle = ''
}) {
  const width = 340;
  const paddingLeft = 38;
  const paddingRight = 12;
  const paddingTop = 10;
  const paddingBottom = 20;
  const plotWidth = width - paddingLeft - paddingRight;
  const plotHeight = height - paddingTop - paddingBottom;

  // If no data or not active, create a flat zero baseline
  const effectiveData = !isActive || !data || data.length === 0 ? [0, 0, 0, 0, 0, 0, 0, 0, 0, 0] : data.length === 1 ? [data[0], data[0]] : data;
  const currentVal = isActive && data && data.length > 0 ? data[data.length - 1] : 0;
  const dMin = min !== undefined ? min : Math.min(...effectiveData);
  const dMax = max !== undefined ? Math.max(max, Math.max(...effectiveData)) : Math.max(1, Math.max(...effectiveData));
  const range = dMax - dMin || 1;
  const points = effectiveData.map((val, idx) => {
    const x = paddingLeft + idx / (effectiveData.length - 1) * plotWidth;
    const norm = Math.max(0, Math.min(1, (val - dMin) / range));
    const y = paddingTop + (1 - norm) * plotHeight;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  const baseY = paddingTop + plotHeight;
  const areaPath = `M ${paddingLeft},${baseY} L ${points.split(' ').join(' L ')} L ${paddingLeft + plotWidth},${baseY} Z`;
  let thresholdY = null;
  if (isActive && threshold !== undefined && threshold >= dMin && threshold <= dMax) {
    const normThresh = (threshold - dMin) / range;
    thresholdY = paddingTop + (1 - normThresh) * plotHeight;
  }
  const colorMap = {
    cyan: {
      stroke: '#06b6d4',
      fill: 'rgba(6, 182, 212, 0.12)',
      text: 'text-cyan-400',
      badge: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20'
    },
    emerald: {
      stroke: '#10b981',
      fill: 'rgba(16, 185, 129, 0.12)',
      text: 'text-emerald-400',
      badge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
    },
    amber: {
      stroke: '#f59e0b',
      fill: 'rgba(245, 158, 11, 0.12)',
      text: 'text-amber-400',
      badge: 'bg-amber-500/10 text-amber-300 border-amber-500/20'
    },
    violet: {
      stroke: '#a855f7',
      fill: 'rgba(168, 85, 247, 0.12)',
      text: 'text-violet-400',
      badge: 'bg-violet-500/10 text-violet-300 border-violet-500/20'
    },
    rose: {
      stroke: '#f43f5e',
      fill: 'rgba(244, 63, 94, 0.12)',
      text: 'text-rose-400',
      badge: 'bg-rose-500/10 text-rose-300 border-rose-500/20'
    }
  };
  const theme = colorMap[color] || colorMap.cyan;
  const ptsArr = points.split(' ');
  const lastPoint = ptsArr[ptsArr.length - 1].split(',');
  return /*#__PURE__*/React.createElement("div", {
    className: `p-3.5 rounded-2xl bg-zinc-950/80 border transition space-y-2 ${isActive ? 'border-white/[0.08] hover:border-white/[0.14]' : 'border-white/[0.04] opacity-70'}`
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center space-x-2"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-[11px] font-semibold text-zinc-300 uppercase tracking-wider"
  }, title), isActive ? /*#__PURE__*/React.createElement("span", {
    className: "flex items-center space-x-1 text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded-full border border-emerald-500/20"
  }, /*#__PURE__*/React.createElement("span", {
    className: "w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"
  }), /*#__PURE__*/React.createElement("span", null, "STREAMING")) : /*#__PURE__*/React.createElement("span", {
    className: "text-[9px] font-mono text-zinc-500 bg-zinc-800/80 px-1.5 py-0.2 rounded-full border border-white/[0.06]"
  }, "NO ACTIVE SIGNAL")), subtitle && /*#__PURE__*/React.createElement("p", {
    className: "text-[10px] text-zinc-500 mt-0.5"
  }, subtitle)), /*#__PURE__*/React.createElement("div", {
    className: "text-right"
  }, /*#__PURE__*/React.createElement("span", {
    className: `px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold border ${isActive ? theme.badge : 'bg-zinc-900 text-zinc-500 border-white/[0.06]'}`
  }, isActive ? `${currentVal} ${unit}` : `-- ${unit}`))), /*#__PURE__*/React.createElement("div", {
    className: "w-full relative"
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: `0 0 ${width} ${height}`,
    className: "w-full h-auto overflow-visible select-none"
  }, /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("linearGradient", {
    id: `grad-${color}-${title.replace(/[^a-zA-Z0-9]/g, '')}`,
    x1: "0%",
    y1: "0%",
    x2: "0%",
    y2: "100%"
  }, /*#__PURE__*/React.createElement("stop", {
    offset: "0%",
    stopColor: theme.stroke,
    stopOpacity: isActive ? 0.22 : 0.03
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "100%",
    stopColor: theme.stroke,
    stopOpacity: "0.0"
  })), /*#__PURE__*/React.createElement("pattern", {
    id: "tech-grid",
    width: "16",
    height: "16",
    patternUnits: "userSpaceOnUse"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 16 0 L 0 0 0 16",
    fill: "none",
    stroke: "rgba(255,255,255,0.025)",
    strokeWidth: "1"
  }))), /*#__PURE__*/React.createElement("rect", {
    x: paddingLeft,
    y: paddingTop,
    width: plotWidth,
    height: plotHeight,
    fill: "url(#tech-grid)",
    rx: "4"
  }), /*#__PURE__*/React.createElement("rect", {
    x: paddingLeft,
    y: paddingTop,
    width: plotWidth,
    height: plotHeight,
    fill: "none",
    stroke: "rgba(255,255,255,0.06)",
    strokeWidth: "1",
    rx: "4"
  }), /*#__PURE__*/React.createElement("text", {
    x: paddingLeft - 6,
    y: paddingTop + 6,
    fill: "#71717a",
    fontSize: "8",
    textAnchor: "end",
    fontFamily: "monospace"
  }, Number(dMax).toFixed(0)), /*#__PURE__*/React.createElement("text", {
    x: paddingLeft - 6,
    y: paddingTop + plotHeight / 2 + 3,
    fill: "#52525b",
    fontSize: "8",
    textAnchor: "end",
    fontFamily: "monospace"
  }, Number((dMax + dMin) / 2).toFixed(0)), /*#__PURE__*/React.createElement("text", {
    x: paddingLeft - 6,
    y: paddingTop + plotHeight,
    fill: "#71717a",
    fontSize: "8",
    textAnchor: "end",
    fontFamily: "monospace"
  }, Number(dMin).toFixed(0)), /*#__PURE__*/React.createElement("line", {
    x1: paddingLeft,
    y1: paddingTop + plotHeight / 2,
    x2: paddingLeft + plotWidth,
    y2: paddingTop + plotHeight / 2,
    stroke: "rgba(255,255,255,0.04)",
    strokeDasharray: "2 2"
  }), thresholdY !== null && /*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement("line", {
    x1: paddingLeft,
    y1: thresholdY,
    x2: paddingLeft + plotWidth,
    y2: thresholdY,
    stroke: "#ef4444",
    strokeWidth: "1",
    strokeDasharray: "3 3",
    opacity: "0.8"
  }), /*#__PURE__*/React.createElement("text", {
    x: paddingLeft + plotWidth - 4,
    y: thresholdY - 3,
    fill: "#ef4444",
    fontSize: "8",
    textAnchor: "end",
    fontFamily: "monospace"
  }, thresholdLabel || `Limit ${threshold} ${unit}`)), /*#__PURE__*/React.createElement("path", {
    d: areaPath,
    fill: `url(#grad-${color}-${title.replace(/[^a-zA-Z0-9]/g, '')})`
  }), /*#__PURE__*/React.createElement("polyline", {
    fill: "none",
    stroke: isActive ? theme.stroke : '#3f3f46',
    strokeWidth: "1.75",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    points: points
  }), isActive && /*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement("circle", {
    cx: lastPoint[0],
    cy: lastPoint[1],
    r: "4",
    fill: theme.stroke,
    opacity: "0.4",
    className: "animate-ping"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: lastPoint[0],
    cy: lastPoint[1],
    r: "3",
    fill: theme.stroke
  }), /*#__PURE__*/React.createElement("circle", {
    cx: lastPoint[0],
    cy: lastPoint[1],
    r: "1.5",
    fill: "#ffffff"
  })), /*#__PURE__*/React.createElement("text", {
    x: paddingLeft,
    y: height - 4,
    fill: "#52525b",
    fontSize: "7.5",
    textAnchor: "start",
    fontFamily: "monospace"
  }, "-30s"), /*#__PURE__*/React.createElement("text", {
    x: paddingLeft + plotWidth / 2,
    y: height - 4,
    fill: "#52525b",
    fontSize: "7.5",
    textAnchor: "middle",
    fontFamily: "monospace"
  }, "-15s"), /*#__PURE__*/React.createElement("text", {
    x: paddingLeft + plotWidth,
    y: height - 4,
    fill: "#52525b",
    fontSize: "7.5",
    textAnchor: "end",
    fontFamily: "monospace"
  }, "Now (0s)"))), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between text-[10px] text-zinc-500 font-mono px-1"
  }, /*#__PURE__*/React.createElement("span", null, "Min: ", isActive ? Math.min(...effectiveData) : 0, " ", unit), /*#__PURE__*/React.createElement("span", null, "Avg: ", isActive ? (effectiveData.reduce((a, b) => a + b, 0) / effectiveData.length).toFixed(1) : 0, " ", unit), /*#__PURE__*/React.createElement("span", null, "Max: ", isActive ? Math.max(...effectiveData) : 0, " ", unit)));
}

// ------------------------------------------------------------------------------
// MODULAR NODE CATALOG (For Custom Scratch Pipeline Building)
// ------------------------------------------------------------------------------
const NODE_LIBRARY = {
  // --- Sensors ---
  sensor_cam: {
    type: 'sensor_cam',
    category: 'Sensors',
    title: 'Camera Stream',
    subtitle: 'V4L2 Video Device',
    icon: 'video',
    color: 'emerald',
    inputs: 0,
    outputs: 1,
    defaultConfig: {
      fps: 5,
      resolution: '640x480 RGB'
    }
  },
  sensor_imu: {
    type: 'sensor_imu',
    category: 'Sensors',
    title: 'Vibration IMU',
    subtitle: 'Tri-Axial Accelerometer',
    icon: 'activity',
    color: 'emerald',
    inputs: 0,
    outputs: 1,
    defaultConfig: {
      rate_hz: 2000,
      range_g: 16
    }
  },
  sensor_mic: {
    type: 'sensor_mic',
    category: 'Sensors',
    title: 'Acoustic Mic',
    subtitle: '16-bit PCM Audio',
    icon: 'activity',
    color: 'emerald',
    inputs: 0,
    outputs: 1,
    defaultConfig: {
      sample_rate: '16 kHz',
      format: 'PCM16'
    }
  },
  // --- Preprocessing & Gatekeepers ---
  wasm_filter: {
    type: 'wasm_filter',
    category: 'Gatekeepers',
    title: 'WASM Gatekeeper',
    subtitle: 'Pure-CPU Rule Sandbox',
    icon: 'shield',
    color: 'indigo',
    inputs: 1,
    outputs: 1,
    defaultConfig: {
      threshold: 4.5,
      policy: 'Drop Nominal Frames'
    }
  },
  motion_gate: {
    type: 'motion_gate',
    category: 'Gatekeepers',
    title: 'Motion Gating',
    subtitle: 'Delta Pixel MSE Trigger',
    icon: 'sliders',
    color: 'indigo',
    inputs: 1,
    outputs: 1,
    defaultConfig: {
      threshold_mse: 0.12
    }
  },
  custom_rule: {
    type: 'custom_rule',
    category: 'Gatekeepers',
    title: 'Custom Logic Rule',
    subtitle: 'Multi-Metric Condition Engine',
    icon: 'shield',
    color: 'indigo',
    inputs: 1,
    outputs: 1,
    defaultConfig: {
      metric: 'confidence',
      operator: '>=',
      threshold: 70,
      action: 'alert'
    }
  },
  // --- AI Inference Engines ---
  ai_yolo: {
    type: 'ai_yolo',
    category: 'AI Engines',
    title: 'YOLOv8 Vision',
    subtitle: 'Native SIMD ONNX',
    icon: 'brain',
    color: 'cyan',
    inputs: 1,
    outputs: 1,
    defaultConfig: {
      model: 'yolov8n-coco',
      confidence: 0.70
    }
  },
  ai_vibration: {
    type: 'ai_vibration',
    category: 'AI Engines',
    title: '1D-CNN Harmonics',
    subtitle: 'ISO-10816 Bearing Fault',
    icon: 'brain',
    color: 'cyan',
    inputs: 1,
    outputs: 1,
    defaultConfig: {
      fft_points: 1024,
      model: 'bearing-1dcnn'
    }
  },
  ai_audio: {
    type: 'ai_audio',
    category: 'AI Engines',
    title: 'Mel-Autoencoder',
    subtitle: 'Cavitation Sentinel',
    icon: 'brain',
    color: 'cyan',
    inputs: 1,
    outputs: 1,
    defaultConfig: {
      threshold_db: 75.0,
      model: 'audio-cavitation'
    }
  },
  ai_slm: {
    type: 'ai_slm',
    category: 'AI Engines',
    title: 'Qwen SLM Reasoner',
    subtitle: 'Local GGUF Diagnosis',
    icon: 'brain',
    color: 'cyan',
    inputs: 1,
    outputs: 1,
    defaultConfig: {
      max_tokens: 120,
      model: 'qwen3-0.6b-diagnostic'
    }
  },
  // --- Storage & Output Sinks ---
  storage_wal: {
    type: 'storage_wal',
    category: 'Storage & Sinks',
    title: 'SQLite WAL Sink',
    subtitle: 'Offline Resilient Buffer',
    icon: 'cpu',
    color: 'amber',
    inputs: 1,
    outputs: 1,
    defaultConfig: {
      ring_buffer: 512,
      wal_mode: true
    }
  },
  cloud_sync: {
    type: 'cloud_sync',
    category: 'Storage & Sinks',
    title: 'Cloud Fleet Sync',
    subtitle: 'AEAD Encrypted Ingest',
    icon: 'zap',
    color: 'violet',
    inputs: 1,
    outputs: 0,
    defaultConfig: {
      security: 'AEAD AES-256-GCM',
      hmac: true
    }
  },
  alert_relay: {
    type: 'alert_relay',
    category: 'Storage & Sinks',
    title: 'Hardware GPIO Trip',
    subtitle: 'Physical Alarm Relay',
    icon: 'zap',
    color: 'rose',
    inputs: 1,
    outputs: 0,
    defaultConfig: {
      pin: 18,
      trip_on_defect: true
    }
  }
};

// Preset Topologies
const PRESET_PIPELINES = {
  multimodal: {
    name: 'Industrial Sentinel (Full Multi-Modal)',
    nodes: [{
      id: 'n_cam',
      type: 'sensor_cam',
      title: 'Camera Stream',
      subtitle: 'V4L2 Video Device',
      icon: 'video',
      color: 'emerald',
      x: 30,
      y: 40,
      inputs: 0,
      outputs: 1,
      config: {
        fps: 5
      }
    }, {
      id: 'n_motion',
      type: 'motion_gate',
      title: 'Motion Gating',
      subtitle: 'Delta Pixel MSE',
      icon: 'sliders',
      color: 'indigo',
      x: 290,
      y: 40,
      inputs: 1,
      outputs: 1,
      config: {
        threshold_mse: 0.12
      }
    }, {
      id: 'n_yolo',
      type: 'ai_yolo',
      title: 'YOLOv8 Vision',
      subtitle: 'Native SIMD ONNX',
      icon: 'brain',
      color: 'cyan',
      x: 550,
      y: 40,
      inputs: 1,
      outputs: 1,
      config: {
        model: 'yolov8n-coco'
      }
    }, {
      id: 'n_imu',
      type: 'sensor_imu',
      title: 'Vibration IMU',
      subtitle: '2 kHz Accelerometer',
      icon: 'activity',
      color: 'emerald',
      x: 30,
      y: 270,
      inputs: 0,
      outputs: 1,
      config: {
        rate_hz: 2000
      }
    }, {
      id: 'n_wasm',
      type: 'wasm_filter',
      title: 'WASM Gatekeeper',
      subtitle: 'ISO-10816 Sandbox',
      icon: 'shield',
      color: 'indigo',
      x: 290,
      y: 270,
      inputs: 1,
      outputs: 1,
      config: {
        threshold: 4.5
      }
    }, {
      id: 'n_vibai',
      type: 'ai_vibration',
      title: '1D-CNN Harmonics',
      subtitle: 'Bearing Fault AI',
      icon: 'brain',
      color: 'cyan',
      x: 550,
      y: 270,
      inputs: 1,
      outputs: 1,
      config: {
        fft_points: 1024
      }
    }, {
      id: 'n_wal',
      type: 'storage_wal',
      title: 'SQLite WAL Sink',
      subtitle: '512 Ring Buffer',
      icon: 'cpu',
      color: 'amber',
      x: 810,
      y: 155,
      inputs: 1,
      outputs: 1,
      config: {
        ring_buffer: 512
      }
    }, {
      id: 'n_cloud',
      type: 'cloud_sync',
      title: 'Cloud Fleet Sync',
      subtitle: 'AEAD Encrypted',
      icon: 'zap',
      color: 'violet',
      x: 1070,
      y: 155,
      inputs: 1,
      outputs: 0,
      config: {
        hmac: true
      }
    }],
    connections: [{
      id: 'c1',
      from: 'n_cam',
      to: 'n_motion'
    }, {
      id: 'c2',
      from: 'n_motion',
      to: 'n_yolo'
    }, {
      id: 'c3',
      from: 'n_yolo',
      to: 'n_wal'
    }, {
      id: 'c4',
      from: 'n_imu',
      to: 'n_wasm'
    }, {
      id: 'c5',
      from: 'n_wasm',
      to: 'n_vibai'
    }, {
      id: 'c6',
      from: 'n_vibai',
      to: 'n_wal'
    }, {
      id: 'c7',
      from: 'n_wal',
      to: 'n_cloud'
    }]
  },
  vision_only: {
    name: 'Vision-Only Edge Inspector',
    nodes: [{
      id: 'n_cam',
      type: 'sensor_cam',
      title: 'Camera Stream',
      subtitle: 'V4L2 Video Device',
      icon: 'video',
      color: 'emerald',
      x: 60,
      y: 150,
      inputs: 0,
      outputs: 1,
      config: {
        fps: 5
      }
    }, {
      id: 'n_motion',
      type: 'motion_gate',
      title: 'Motion Gating',
      subtitle: 'Delta MSE Trigger',
      icon: 'sliders',
      color: 'indigo',
      x: 360,
      y: 150,
      inputs: 1,
      outputs: 1,
      config: {
        threshold_mse: 0.12
      }
    }, {
      id: 'n_yolo',
      type: 'ai_yolo',
      title: 'YOLOv8 Vision',
      subtitle: 'Native SIMD ONNX',
      icon: 'brain',
      color: 'cyan',
      x: 660,
      y: 150,
      inputs: 1,
      outputs: 1,
      config: {
        model: 'yolov8n-coco'
      }
    }, {
      id: 'n_cloud',
      type: 'cloud_sync',
      title: 'Cloud Fleet Sync',
      subtitle: 'AEAD Encrypted',
      icon: 'zap',
      color: 'violet',
      x: 960,
      y: 150,
      inputs: 1,
      outputs: 0,
      config: {
        hmac: true
      }
    }],
    connections: [{
      id: 'c1',
      from: 'n_cam',
      to: 'n_motion'
    }, {
      id: 'c2',
      from: 'n_motion',
      to: 'n_yolo'
    }, {
      id: 'c3',
      from: 'n_yolo',
      to: 'n_cloud'
    }]
  },
  predictive: {
    name: 'Vibration & Acoustic Maintenance',
    nodes: [{
      id: 'n_imu',
      type: 'sensor_imu',
      title: 'Vibration IMU',
      subtitle: '2 kHz Accelerometer',
      icon: 'activity',
      color: 'emerald',
      x: 60,
      y: 70,
      inputs: 0,
      outputs: 1,
      config: {
        rate_hz: 2000
      }
    }, {
      id: 'n_wasm',
      type: 'wasm_filter',
      title: 'WASM Gatekeeper',
      subtitle: 'ISO-10816 Sandbox',
      icon: 'shield',
      color: 'indigo',
      x: 360,
      y: 70,
      inputs: 1,
      outputs: 1,
      config: {
        threshold: 4.5
      }
    }, {
      id: 'n_vibai',
      type: 'ai_vibration',
      title: '1D-CNN Harmonics',
      subtitle: 'Bearing Fault AI',
      icon: 'brain',
      color: 'cyan',
      x: 660,
      y: 70,
      inputs: 1,
      outputs: 1,
      config: {
        fft_points: 1024
      }
    }, {
      id: 'n_mic',
      type: 'sensor_mic',
      title: 'Acoustic Mic',
      subtitle: '16-bit PCM Audio',
      icon: 'activity',
      color: 'emerald',
      x: 60,
      y: 260,
      inputs: 0,
      outputs: 1,
      config: {
        sample_rate: '16 kHz'
      }
    }, {
      id: 'n_audioai',
      type: 'ai_audio',
      title: 'Mel-Autoencoder',
      subtitle: 'Cavitation Sentinel',
      icon: 'brain',
      color: 'cyan',
      x: 460,
      y: 260,
      inputs: 1,
      outputs: 1,
      config: {
        threshold_db: 75.0
      }
    }, {
      id: 'n_wal',
      type: 'storage_wal',
      title: 'SQLite WAL Sink',
      subtitle: '512 Ring Buffer',
      icon: 'cpu',
      color: 'amber',
      x: 960,
      y: 165,
      inputs: 1,
      outputs: 1,
      config: {
        ring_buffer: 512
      }
    }],
    connections: [{
      id: 'c1',
      from: 'n_imu',
      to: 'n_wasm'
    }, {
      id: 'c2',
      from: 'n_wasm',
      to: 'n_vibai'
    }, {
      id: 'c3',
      from: 'n_vibai',
      to: 'n_wal'
    }, {
      id: 'c4',
      from: 'n_mic',
      to: 'n_audioai'
    }, {
      id: 'c5',
      from: 'n_audioai',
      to: 'n_wal'
    }]
  },
  blank: {
    name: 'Blank Canvas (Start from Scratch)',
    nodes: [],
    connections: []
  }
};

// ------------------------------------------------------------------------------
// MAIN TETHER-EDGE DASHBOARD APPLICATION
// ------------------------------------------------------------------------------
function App() {
  const getInitialTab = () => {
    try {
      const params = new URLSearchParams(window.location.search);
      const t = params.get('tab');
      if (t && ['live', 'pipeline', 'fleet', 'catalog', 'security'].includes(t)) return t;
      const hash = window.location.hash.replace('#', '');
      if (hash && ['live', 'pipeline', 'fleet', 'catalog', 'security'].includes(hash)) return hash;
      const saved = localStorage.getItem('tether_active_tab');
      if (saved && ['live', 'pipeline', 'fleet', 'catalog', 'security'].includes(saved)) return saved;
    } catch (_) {}
    return 'live';
  };
  const [activeTab, setActiveTabState] = useState(getInitialTab);
  const setActiveTab = tab => {
    setActiveTabState(tab);
    try {
      window.location.hash = tab;
      localStorage.setItem('tether_active_tab', tab);
    } catch (_) {}
  };
  const [devices, setDevices] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [notification, setNotification] = useState(null);
  const [quickInstallCommand, setQuickInstallCommand] = useState('');
  const [copiedQuick, setCopiedQuick] = useState(false);
  const [isGeneratingToken, setIsGeneratingToken] = useState(false);
  const [currentTokenInfo, setCurrentTokenInfo] = useState(null);
  const [daemonMode, setDaemonMode] = useState(false);
  const [showQuickRef, setShowQuickRef] = useState(true);
  const [tunnelInfo, setTunnelInfo] = useState({
    active: false,
    url: null
  });
  const [isStartingTunnel, setIsStartingTunnel] = useState(false);
  const [copiedColab, setCopiedColab] = useState(false);

  // Live Vision & Detections state
  const [liveDetections, setLiveDetections] = useState([]);
  const [liveFrameTick, setLiveFrameTick] = useState(Date.now());
  const [frameError, setFrameError] = useState(false);
  const [activeModel, setActiveModel] = useState('yolov8n-coco');
  const [isDeployingModel, setIsDeployingModel] = useState(false);

  // ----------------------------------------------------------------------------
  // INTERACTIVE NODE GRAPH PIPELINE STATE
  // ----------------------------------------------------------------------------
  const [pipelineNodes, setPipelineNodes] = useState(PRESET_PIPELINES.multimodal.nodes);
  const [pipelineConnections, setPipelineConnections] = useState(PRESET_PIPELINES.multimodal.connections);
  const [selectedNodeId, setSelectedNodeId] = useState('n_yolo');
  const [connectingSource, setConnectingSource] = useState(null); // { nodeId, port }
  const [mouseCanvasPos, setMouseCanvasPos] = useState(null);
  const [showAddNodeMenu, setShowAddNodeMenu] = useState(false);
  const [nodeFilterCat, setNodeFilterCat] = useState('All');
  const [nodeSearchTerm, setNodeSearchTerm] = useState('');
  const [panOffset, setPanOffset] = useState({
    x: 0,
    y: 0
  });
  const [isPanning, setIsPanning] = useState(false);

  // Dragging and Canvas Panning refs
  const draggingState = useRef(null);
  const panStartRef = useRef(null);
  const canvasRef = useRef(null);

  // Real-time rolling Telemetry History (for graphs - clean flatline until real device connects)
  const [telemetryHistory, setTelemetryHistory] = useState({
    latency: [0, 0, 0, 0, 0, 0],
    vibration: [0, 0, 0, 0, 0, 0],
    audio: [0, 0, 0, 0, 0, 0],
    cpu: [0, 0, 0, 0, 0, 0],
    memory: [0, 0, 0, 0, 0, 0],
    temp: [0, 0, 0, 0, 0, 0]
  });

  // Add Device Modal state
  const [showAddDeviceModal, setShowAddDeviceModal] = useState(false);
  const [enrollPlatform, setEnrollPlatform] = useState('colab'); // 'colab', 'jetson', 'rpi', 'generic'
  const [enrollTag, setEnrollTag] = useState('');
  const [enrollDuration, setEnrollDuration] = useState('24h');

  // ChatGPT-style SLM Assistant state
  const [assistantPrompt, setAssistantPrompt] = useState('');
  const [assistantReply, setAssistantReply] = useState(null);
  const [isAssistantThinking, setIsAssistantThinking] = useState(false);

  // Upload Modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadName, setUploadName] = useState('');
  const [uploadModality, setUploadModality] = useState('Vision');
  const [uploadClasses, setUploadClasses] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadFile, setUploadFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // Model Drift tracking state
  const [driftMetrics, setDriftMetrics] = useState(null);

  // Diagnostic Terminal Drawer state
  const [showTerminalDrawer, setShowTerminalDrawer] = useState(false);
  const [terminalCommand, setTerminalCommand] = useState('free -h');
  const [terminalHistory, setTerminalHistory] = useState([{
    cmd: './edge-ctl status',
    output: 'Client Daemon: ACTIVE (PID 14201, RSS 14.1 MB)\nInference Worker: ACTIVE (PID 14205, Pure Rust ONNX SIMD)\nWASM Host: ACTIVE (PID 14209, Wasmtime 21.0 Sandbox)\nStorage Service: ACTIVE (PID 14213, SQLite WAL)\nLocal NATS: ONLINE (127.0.0.1:4222)',
    time: 'Ready'
  }]);
  const [isExecutingCommand, setIsExecutingCommand] = useState(false);
  const showToast = (type, text) => {
    setNotification({
      type,
      text
    });
    setTimeout(() => setNotification(null), 3500);
  };

  // Fetch all fleet data & update rolling telemetry history
  const fetchAllData = async () => {
    try {
      const [devRes, catRes, tokRes, liveRes, tunRes] = await Promise.all([fetch('/api/v1/devices').then(r => r.json()).catch(() => ({
        devices: []
      })), fetch('/api/v1/catalog').then(r => r.json()).catch(() => ({
        catalog: []
      })), fetch('/api/v1/tokens/latest').then(r => r.json()).catch(() => ({
        token: null
      })), fetch('/api/v1/telemetry/live').then(r => r.json()).catch(() => ({
        modalities: {}
      })), fetch('/api/v1/tunnel').then(r => r.json()).catch(() => ({
        active: false,
        url: null
      }))]);
      if (devRes.devices) setDevices(devRes.devices);
      if (catRes.catalog) setCatalog(catRes.catalog);
      if (tunRes && tunRes.success) setTunnelInfo({
        active: !!tunRes.active,
        url: tunRes.url
      });
      const host = window.location.host;
      if (tokRes.token && tokRes.token.token) {
        setQuickInstallCommand(`curl -sSL http://${host}/bootstrap.sh?token=${tokRes.token.token} | bash`);
        setCurrentTokenInfo(tokRes.token);
      }

      // Check for an actively reporting online device
      const activeDev = devRes.devices?.find(d => d.status === 'ONLINE');
      const isDeviceOnline = Boolean(activeDev);

      // Determine active sensor modalities in the visual pipeline
      const hasVision = pipelineNodes.some(n => n.type.startsWith('ai_yolo') || n.type.startsWith('ai_'));
      const hasImu = pipelineNodes.some(n => n.type === 'sensor_imu' || n.type === 'ai_vibration');
      const hasMic = pipelineNodes.some(n => n.type === 'sensor_mic' || n.type === 'ai_audio');

      // 1. Host OS Metrics (Strictly 0.0 if device is not online)
      const cpuVal = isDeviceOnline && activeDev?.telemetry?.cpu_usage_pct != null ? Number(activeDev.telemetry.cpu_usage_pct.toFixed(1)) : 0;
      const memVal = isDeviceOnline && activeDev?.telemetry?.ram_used_mb != null ? Number(activeDev.telemetry.ram_used_mb.toFixed(1)) : 0;
      const tempVal = isDeviceOnline && activeDev?.telemetry?.temperature_c != null ? Number(activeDev.telemetry.temperature_c.toFixed(1)) : 0;

      // 2. Vision Inference Latency (Strictly 0 if no device or vision node not in pipeline)
      const latVal = isDeviceOnline && hasVision && liveRes?.modalities?.Vision?.latency_ms != null ? Number(liveRes.modalities.Vision.latency_ms) : isDeviceOnline && hasVision && activeDev?.telemetry?.fps ? Math.round(1000 / Math.max(1, activeDev.telemetry.fps)) : isDeviceOnline && hasVision ? 122 : 0;

      // 3. Vibration Velocity (Strictly 0 if no IMU in pipeline or no device)
      const vibVal = isDeviceOnline && hasImu && liveRes?.modalities?.Vibration?.rms_velocity_mms != null ? Number(Number(liveRes.modalities.Vibration.rms_velocity_mms).toFixed(2)) : 0;

      // 4. Acoustic Sound Level (Strictly 0 if no mic in pipeline or no device)
      const audVal = isDeviceOnline && hasMic && liveRes?.modalities?.Audio?.sound_pressure_db != null ? Number(Number(liveRes.modalities.Audio.sound_pressure_db).toFixed(1)) : 0;
      if (liveRes && liveRes.drift_metrics && isDeviceOnline) {
        setDriftMetrics(liveRes.drift_metrics);
      } else if (!isDeviceOnline) {
        setDriftMetrics(null);
      }
      setTelemetryHistory(prev => ({
        latency: [...prev.latency.slice(-20), latVal],
        vibration: [...prev.vibration.slice(-20), Number(vibVal.toFixed(2))],
        audio: [...prev.audio.slice(-20), Number(audVal.toFixed(1))],
        cpu: [...prev.cpu.slice(-20), Number(cpuVal.toFixed(1))],
        memory: [...prev.memory.slice(-20), Number(memVal.toFixed(1))],
        temp: [...prev.temp.slice(-20), Number(tempVal.toFixed(1))]
      }));
    } catch (_) {}
  };
  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 2500);
    return () => clearInterval(interval);
  }, []);

  // Poll live camera frame and detections every 1.2s
  useEffect(() => {
    if (activeTab !== 'live') return;
    const pollCamera = async () => {
      try {
        const res = await fetch('/api/v1/telemetry/live/detections');
        const data = await res.json();
        if (data.detections) {
          setLiveDetections(data.detections);
        }
      } catch (_) {}
      setLiveFrameTick(Date.now());
    };
    pollCamera();
    const timer = setInterval(pollCamera, 1200);
    return () => clearInterval(timer);
  }, [activeTab]);

  // Handle generating a fresh provisioning token on demand
  const handleGenerateNewToken = async () => {
    setIsGeneratingToken(true);
    try {
      const res = await fetch('/api/v1/tokens/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          device_tag: 'edge-node',
          ttl_seconds: 86400
        })
      });
      const data = await res.json();
      if (data.success) {
        const host = window.location.host;
        setQuickInstallCommand(`curl -sSL http://${host}/bootstrap.sh?token=${data.token} | bash`);
        setCurrentTokenInfo(data.record || {
          token: data.token,
          expires_at: data.expires_at
        });
        showToast('success', `Generated new enrollment token: ${data.token}`);
      } else {
        showToast('error', data.error || 'Failed to generate token');
      }
    } catch (err) {
      showToast('error', err.message);
    } finally {
      setIsGeneratingToken(false);
    }
  };

  // Handle Deploying selected model to active device
  const handleDeployModel = async modelId => {
    const onlineDevices = devices.filter(d => d.status === 'ONLINE');
    const targetDevices = onlineDevices.length > 0 ? onlineDevices : devices.length > 0 ? [devices[0]] : [];
    if (targetDevices.length === 0) {
      showToast('error', 'No edge devices connected. Run the quickstart command on your device first.');
      return;
    }
    setIsDeployingModel(true);
    try {
      const deployPromises = targetDevices.map(dev => fetch(`/api/v1/devices/${dev.device_id}/deploy/${modelId}`, {
        method: 'POST'
      }).then(r => r.json()));
      await Promise.all(deployPromises);
      setActiveModel(modelId);
      showToast('success', `Deployed '${modelId}' to ${targetDevices.length} edge device(s)`);
      await fetchAllData();
    } catch (err) {
      showToast('error', err.message);
    } finally {
      setIsDeployingModel(false);
    }
  };

  // Handle Staged Canary Deployment (10% Canary node -> 10s health watch -> Fleet rollout)
  const handleDeployCanaryModel = async modelId => {
    setIsDeployingModel(true);
    try {
      const res = await fetch(`/api/v1/deployments/canary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model_id: modelId
        })
      });
      const data = await res.json();
      if (data.success) {
        setActiveModel(modelId);
        showToast('success', `Canary rollout started for '${modelId}'. Stage 1: Canary active!`);
        fetchAllData();
      } else {
        showToast('error', data.error || 'Canary deployment failed');
      }
    } catch (err) {
      showToast('error', err.message);
    } finally {
      setIsDeployingModel(false);
    }
  };

  // Handle Diagnostic Edge Terminal execution
  const handleExecuteTerminalCommand = async cmdToRun => {
    const cmd = cmdToRun || terminalCommand;
    if (!cmd.trim()) return;
    const activeDevice = devices.find(d => d.status === 'ONLINE') || devices[0];
    const deviceId = activeDevice ? activeDevice.device_id : 'edge-node-alpha-01';
    setIsExecutingCommand(true);
    try {
      const res = await fetch(`/api/v1/devices/${deviceId}/exec`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          command: cmd
        })
      });
      const data = await res.json();
      setTerminalHistory(prev => [{
        cmd,
        output: data.output || (data.error ? `Error: ${data.error}` : 'Success (No output)'),
        isError: !data.success,
        time: new Date().toLocaleTimeString()
      }, ...prev.slice(0, 19)]);
    } catch (e) {
      setTerminalHistory(prev => [{
        cmd,
        output: `Connection error: ${e.message}`,
        isError: true,
        time: new Date().toLocaleTimeString()
      }, ...prev.slice(0, 19)]);
    } finally {
      setIsExecutingCommand(false);
    }
  };

  // Deploy custom pipeline configuration to edge hardware
  const handleDeployPipelineToEdge = async () => {
    const onlineDevices = devices.filter(d => d.status === 'ONLINE');
    const targetDevices = onlineDevices.length > 0 ? onlineDevices : devices.length > 0 ? [devices[0]] : [];
    if (targetDevices.length === 0) {
      showToast('error', 'No active edge device online to receive pipeline deploy.');
      return;
    }
    const hasCam = pipelineNodes.some(n => n.type === 'sensor_cam');
    const hasImu = pipelineNodes.some(n => n.type === 'sensor_imu');
    const hasMic = pipelineNodes.some(n => n.type === 'sensor_mic');
    const aiNode = pipelineNodes.find(n => n.type.startsWith('ai_'));
    const wasmNode = pipelineNodes.find(n => n.type === 'wasm_filter');
    const customRuleNode = pipelineNodes.find(n => n.type === 'custom_rule');
    const servicesConfig = {
      camera: {
        enabled: hasCam,
        device_path: '/dev/video0',
        fps: hasCam ? pipelineNodes.find(n => n.type === 'sensor_cam')?.config?.fps || 5 : 5,
        resolution: [640, 480],
        pixel_format: 'RGB24',
        motion_threshold: customRuleNode?.config?.motion_delta || 0.12,
        publish_topic: 'sensor.camera'
      },
      inference: {
        enabled: Boolean(aiNode),
        active_model_id: aiNode?.config?.model || activeModel || 'yolov8n-coco',
        modality: aiNode?.type === 'ai_vibration' ? 'Vibration' : aiNode?.type === 'ai_audio' ? 'Audio' : 'Vision',
        confidence_threshold: aiNode?.config?.confidence || 0.70,
        memory_cap_mb: 15,
        listen_topic: 'inference.vision',
        publish_topic: 'inference.response'
      },
      monitoring: {
        enabled: Boolean(wasmNode || customRuleNode),
        thermal_alert_celsius: customRuleNode?.config?.max_temp_c || 85.0,
        vibration_iso_threshold_mms: customRuleNode?.config?.max_vibration_mms || wasmNode?.config?.threshold || 4.5,
        audio_alert_db: 75.0,
        listen_topics: ['sensor.environment', 'sensor.camera', 'sensor.vibration']
      },
      storage: {
        enabled: pipelineNodes.some(n => n.type === 'storage_wal'),
        ring_buffer_capacity: 512,
        wal_mode: true
      }
    };
    try {
      const deployPromises = targetDevices.map(dev => fetch(`/api/v1/devices/${dev.device_id}/services`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(servicesConfig)
      }).then(r => r.json()));
      const results = await Promise.all(deployPromises);
      const allOk = results.every(r => r.success);
      if (allOk) {
        showToast('success', `Deployed customized pipeline (${pipelineNodes.length} nodes) to ${targetDevices.length} device(s)!`);
        await fetchAllData();
      } else {
        showToast('error', 'Failed to deploy services to some devices');
      }
    } catch (e) {
      showToast('error', 'Pipeline deploy error: ' + e.message);
    }
  };

  // ----------------------------------------------------------------------------
  // CANVAS NODE GRAPH INTERACTIONS (Smooth Drag, Pan, Add, Connect, Auto-Arrange)
  // ----------------------------------------------------------------------------
  const handleNodeMouseDown = (e, nodeId) => {
    e.stopPropagation();
    setSelectedNodeId(nodeId);
    const node = pipelineNodes.find(n => n.id === nodeId);
    if (!node) return;
    draggingState.current = {
      nodeId,
      startX: e.clientX,
      startY: e.clientY,
      origX: node.x,
      origY: node.y
    };
    const handleMouseMove = moveEvent => {
      if (!draggingState.current) return;
      const dx = moveEvent.clientX - draggingState.current.startX;
      const dy = moveEvent.clientY - draggingState.current.startY;
      const newX = Math.round(draggingState.current.origX + dx);
      const newY = Math.round(draggingState.current.origY + dy);
      setPipelineNodes(prev => prev.map(n => n.id === draggingState.current.nodeId ? {
        ...n,
        x: newX,
        y: newY
      } : n));
    };
    const handleMouseUp = () => {
      draggingState.current = null;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Canvas background panning (Click & drag on empty canvas background)
  const handleCanvasMouseDown = e => {
    // If clicked on node, pin, or button, let their handler take priority
    if (e.target.closest('.node-card') || e.target.closest('.port-pin') || e.target.closest('button') || e.target.closest('input')) {
      return;
    }
    if (showAddNodeMenu) setShowAddNodeMenu(false);
    if (connectingSource) setConnectingSource(null);
    setIsPanning(true);
    panStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origPanX: panOffset.x,
      origPanY: panOffset.y
    };
    const handlePanMove = moveEvt => {
      if (!panStartRef.current) return;
      const dx = moveEvt.clientX - panStartRef.current.startX;
      const dy = moveEvt.clientY - panStartRef.current.startY;
      setPanOffset({
        x: Math.round(panStartRef.current.origPanX + dx),
        y: Math.round(panStartRef.current.origPanY + dy)
      });
    };
    const handlePanUp = () => {
      setIsPanning(false);
      panStartRef.current = null;
      window.removeEventListener('mousemove', handlePanMove);
      window.removeEventListener('mouseup', handlePanUp);
    };
    window.addEventListener('mousemove', handlePanMove);
    window.addEventListener('mouseup', handlePanUp);
  };
  const handleCanvasMouseMove = e => {
    if (!connectingSource || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    setMouseCanvasPos({
      x: e.clientX - rect.left - panOffset.x,
      y: e.clientY - rect.top - panOffset.y
    });
  };

  // Connect port logic
  const handleStartConnect = nodeId => {
    setConnectingSource({
      nodeId
    });
  };
  const handleEndConnect = targetNodeId => {
    if (!connectingSource) return;
    if (connectingSource.nodeId === targetNodeId) {
      setConnectingSource(null);
      return;
    }

    // Check if duplicate connection exists
    const exists = pipelineConnections.some(c => c.from === connectingSource.nodeId && c.to === targetNodeId);
    if (!exists) {
      const newConn = {
        id: 'conn_' + Date.now(),
        from: connectingSource.nodeId,
        to: targetNodeId
      };
      setPipelineConnections(prev => [...prev, newConn]);
      const src = pipelineNodes.find(n => n.id === connectingSource.nodeId);
      const tgt = pipelineNodes.find(n => n.id === targetNodeId);
      showToast('success', `Linked: ${src?.title || 'Node'} ➔ ${tgt?.title || 'Node'}`);
    }
    setConnectingSource(null);
  };
  const handleDeleteConnection = connId => {
    setPipelineConnections(prev => prev.filter(c => c.id !== connId));
    showToast('info', 'Cable disconnected');
  };
  const handleDeleteNode = nodeId => {
    setPipelineNodes(prev => prev.filter(n => n.id !== nodeId));
    setPipelineConnections(prev => prev.filter(c => c.from !== nodeId && c.to !== nodeId));
    if (selectedNodeId === nodeId) setSelectedNodeId(null);
    showToast('info', 'Node removed from pipeline');
  };
  const handleAddNodeFromLibrary = key => {
    const template = NODE_LIBRARY[key];
    if (!template) return;

    // Place node at comfortable visible spot accounting for pan offset
    const newId = 'n_' + key + '_' + Math.random().toString(36).substring(2, 6);
    const existingCount = pipelineNodes.length;
    const posX = Math.max(20, Math.round(60 + existingCount % 4 * 280 - panOffset.x));
    const posY = Math.max(20, Math.round(50 + Math.floor(existingCount / 4) * 210 - panOffset.y));
    const newNode = {
      id: newId,
      type: template.type,
      title: template.title,
      subtitle: template.subtitle,
      icon: template.icon,
      color: template.color,
      inputs: template.inputs,
      outputs: template.outputs,
      x: posX,
      y: posY,
      config: {
        ...template.defaultConfig
      }
    };
    setPipelineNodes(prev => [...prev, newNode]);
    setSelectedNodeId(newId);
    setShowAddNodeMenu(false);
    showToast('success', `Added node: ${template.title}`);
  };

  // Start building completely from scratch (zero presets)
  const handleClearPipeline = () => {
    setPipelineNodes([]);
    setPipelineConnections([]);
    setSelectedNodeId(null);
    setConnectingSource(null);
    setPanOffset({
      x: 0,
      y: 0
    });
    showToast('info', 'Canvas cleared. Click "+ Add Node" to build from scratch.');
  };
  const handleResetPan = () => {
    setPanOffset({
      x: 0,
      y: 0
    });
  };

  // Auto-align nodes into functional signal flow columns
  const handleAutoArrange = () => {
    const colMap = {
      sensor_cam: 0,
      sensor_imu: 0,
      sensor_mic: 0,
      motion_gate: 1,
      wasm_filter: 1,
      custom_rule: 1,
      ai_yolo: 2,
      ai_vibration: 2,
      ai_audio: 2,
      storage_wal: 3,
      cloud_sync: 4
    };
    const colCounters = [0, 0, 0, 0, 0];
    setPipelineNodes(prev => prev.map(node => {
      const col = colMap[node.type] != null ? colMap[node.type] : 2;
      const row = colCounters[col]++;
      return {
        ...node,
        x: 40 + col * 290,
        y: 40 + row * 210
      };
    }));
    setPanOffset({
      x: 0,
      y: 0
    });
    showToast('success', 'Pipeline graph auto-arranged into signal flow columns.');
  };
  const handleLoadPreset = presetKey => {
    if (presetKey === 'blank') {
      handleClearPipeline();
      return;
    }
    const preset = PRESET_PIPELINES[presetKey];
    if (!preset) return;
    setPipelineNodes([...preset.nodes]);
    setPipelineConnections([...preset.connections]);
    setSelectedNodeId(preset.nodes[0]?.id || null);
    setPanOffset({
      x: 0,
      y: 0
    });
    showToast('info', `Loaded pipeline: ${preset.name}`);
  };
  const handleUpdateNodeConfig = (nodeId, key, value) => {
    setPipelineNodes(prev => prev.map(n => {
      if (n.id !== nodeId) return n;
      return {
        ...n,
        config: {
          ...n.config,
          [key]: value
        }
      };
    }));
  };

  // Clean duplicate devices from fleet manager
  const handlePruneDevices = async () => {
    try {
      const res = await fetch('/api/v1/devices/prune', {
        method: 'POST'
      });
      const data = await res.json();
      if (data.success) {
        showToast('success', `Cleaned duplicate records. ${data.remaining_count} unique device active.`);
        fetchAllData();
      }
    } catch (e) {
      showToast('error', 'Failed to prune devices: ' + e.message);
    }
  };

  // Start edge microservices for a device
  const handleStartDevice = async deviceId => {
    try {
      showToast('info', `Starting edge microservices for [${deviceId}]...`);
      const res = await fetch(`/api/v1/devices/${deviceId}/start`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data.success) {
        showToast('success', `Edge client launched! Streaming telemetry from ${deviceId}`);
        fetchAllData();
      } else {
        showToast('error', data.error || 'Failed to start device');
      }
    } catch (e) {
      showToast('error', 'Network error starting device: ' + e.message);
    }
  };

  // Gracefully stop edge microservices for a device
  const handleStopDevice = async deviceId => {
    try {
      showToast('info', `Halting edge microservices for [${deviceId}]...`);
      const res = await fetch(`/api/v1/devices/${deviceId}/stop`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data.success) {
        showToast('success', `Device [${deviceId}] microservices stopped cleanly.`);
        fetchAllData();
      } else {
        showToast('error', data.error || 'Failed to stop device');
      }
    } catch (e) {
      showToast('error', 'Network error stopping device: ' + e.message);
    }
  };

  // Stop, wipe data, and permanently delete device from fleet
  const handlePurgeDevice = async deviceId => {
    if (!window.confirm(`Are you sure you want to STOP and PURGE device [${deviceId}]?\n\nThis will terminate microservices, delete local SQLite databases & configs, and deregister the hardware.`)) {
      return;
    }
    try {
      showToast('info', `Purging device [${deviceId}] and wiping local data...`);
      const res = await fetch(`/api/v1/devices/${deviceId}/purge`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data.success) {
        showToast('success', `Device [${deviceId}] and all local databases completely purged.`);
        fetchAllData();
      } else {
        showToast('error', data.error || 'Failed to purge device');
      }
    } catch (e) {
      showToast('error', 'Network error purging device: ' + e.message);
    }
  };

  // Launch Cloudflare Public Tunnel for Google Colab, Kaggle & WAN nodes
  const handleStartTunnel = async () => {
    setIsStartingTunnel(true);
    try {
      showToast('info', 'Connecting to Cloudflare edge network for public HTTPS tunnel...');
      const res = await fetch('/api/v1/tunnel/start', {
        method: 'POST'
      });
      const data = await res.json();
      if (data.success) {
        setTunnelInfo({
          active: true,
          url: data.url
        });
        showToast('success', `Cloudflare Public Tunnel online! Ready for Colab: ${data.url}`);
        fetchAllData();
      } else {
        showToast('error', data.error || 'Failed to start Cloudflare Tunnel');
      }
    } catch (e) {
      showToast('error', 'Network error launching tunnel: ' + e.message);
    } finally {
      setIsStartingTunnel(false);
    }
  };

  // Stop Cloudflare Public Tunnel
  const handleStopTunnel = async () => {
    try {
      showToast('info', 'Stopping Cloudflare public tunnel...');
      const res = await fetch('/api/v1/tunnel/stop', {
        method: 'POST'
      });
      const data = await res.json();
      if (data.success) {
        setTunnelInfo({
          active: false,
          url: null
        });
        showToast('success', 'Public tunnel stopped. Reverted to local LAN mode.');
        fetchAllData();
      }
    } catch (e) {
      showToast('error', 'Error stopping tunnel: ' + e.message);
    }
  };

  // ChatGPT-style AI query
  const handleAskAssistant = async promptText => {
    const q = promptText || assistantPrompt;
    if (!q || !q.trim()) return;
    setIsAssistantThinking(true);
    setAssistantReply(null);
    try {
      const res = await fetch('/api/v1/inference/vision/vlm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          detections: liveDetections,
          prompt: q
        })
      });
      const data = await res.json();
      if (data.success) {
        setAssistantReply(data.analysis || 'Scene verified. Nominal baseline confirmed.');
      } else {
        setAssistantReply(data.error || 'Local SLM engine offline. Launch ./run-edge.sh to start.');
      }
    } catch (e) {
      setAssistantReply('AI Assistant connection failed: ' + e.message);
    } finally {
      setIsAssistantThinking(false);
    }
  };

  // Handle Custom Model Upload
  const handleUploadModel = async e => {
    e.preventDefault();
    if (!uploadName || !uploadFile) {
      showToast('error', 'Please provide a model name and select a file (.onnx / .gguf)');
      return;
    }
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('model_file', uploadFile);
      formData.append('name', uploadName);
      formData.append('modality', uploadModality);
      formData.append('description', uploadDescription);
      formData.append('classes', uploadClasses);
      const res = await fetch('/api/v1/catalog/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        showToast('success', `Model '${uploadName}' uploaded & registered!`);
        setShowUploadModal(false);
        setUploadName('');
        setUploadDescription('');
        setUploadClasses('');
        setUploadFile(null);
        fetchAllData();
      } else {
        showToast('error', data.error || 'Upload failed');
      }
    } catch (err) {
      showToast('error', 'Upload failed: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };
  const onlineDevicesCount = devices.filter(d => d.status === 'ONLINE').length;
  const activeDevice = devices.find(d => d.status === 'ONLINE') || devices[0];
  const selectedNode = pipelineNodes.find(n => n.id === selectedNodeId);
  return /*#__PURE__*/React.createElement("div", {
    className: "min-h-screen flex flex-col bg-[#090a0f] text-zinc-100 font-sans selection:bg-indigo-500 selection:text-white"
  }, notification && /*#__PURE__*/React.createElement("div", {
    className: "fixed top-5 right-5 z-50 flex items-center space-x-2.5 px-4 py-2.5 rounded-full border shadow-2xl text-xs font-medium bg-zinc-900/95 border-zinc-700/80 text-zinc-200 backdrop-blur-md animate-in fade-in slide-in-from-top-3 duration-200"
  }, /*#__PURE__*/React.createElement("span", {
    className: `w-2 h-2 rounded-full ${notification.type === 'error' ? 'bg-rose-500 ring-4 ring-rose-500/20' : 'bg-emerald-400 ring-4 ring-emerald-400/20'}`
  }), /*#__PURE__*/React.createElement("span", null, notification.text)), /*#__PURE__*/React.createElement("header", {
    className: "sticky top-0 z-40 backdrop-blur-xl bg-[#090a0f]/80 border-b border-white/[0.06] px-6 py-3.5 flex items-center justify-between"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center space-x-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white font-bold text-xs tracking-wider"
  }, "TE"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center space-x-2"
  }, /*#__PURE__*/React.createElement("span", {
    className: "font-semibold text-sm tracking-tight text-white"
  }, "Tether-Edge"), /*#__PURE__*/React.createElement("span", {
    className: "text-[10px] px-2 py-0.5 rounded-full bg-white/[0.06] text-zinc-400 border border-white/[0.05]"
  }, "Control Plane")))), /*#__PURE__*/React.createElement("nav", {
    className: "flex items-center space-x-1 p-1 rounded-full bg-white/[0.04] border border-white/[0.08] shadow-inner text-xs"
  }, [{
    id: 'live',
    label: 'Live Stream',
    icon: 'video'
  }, {
    id: 'pipeline',
    label: 'Pipeline Graph',
    icon: 'workflow'
  }, {
    id: 'fleet',
    label: 'Fleet Devices',
    icon: 'server',
    badge: devices.length
  }, {
    id: 'catalog',
    label: 'AI Models',
    icon: 'brain',
    badge: catalog.length
  }, {
    id: 'security',
    label: 'Security',
    icon: 'shield'
  }].map(tab => {
    const isActive = activeTab === tab.id;
    return /*#__PURE__*/React.createElement("button", {
      key: tab.id,
      onClick: () => setActiveTab(tab.id),
      className: `flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${isActive ? 'bg-white text-zinc-950 shadow-md shadow-white/10' : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'}`
    }, /*#__PURE__*/React.createElement(Icon, {
      name: tab.icon,
      className: "w-3.5 h-3.5"
    }), /*#__PURE__*/React.createElement("span", null, tab.label), tab.badge !== undefined && /*#__PURE__*/React.createElement("span", {
      className: `text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-zinc-200 text-zinc-900' : 'bg-white/[0.08] text-zinc-400'}`
    }, tab.badge));
  })), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center space-x-3 text-xs"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06]"
  }, /*#__PURE__*/React.createElement("span", {
    className: `w-2 h-2 rounded-full ${onlineDevicesCount > 0 ? 'bg-emerald-400 shadow-sm shadow-emerald-400 animate-pulse' : 'bg-zinc-600'}`
  }), /*#__PURE__*/React.createElement("span", {
    className: "text-zinc-300 font-medium"
  }, onlineDevicesCount > 0 ? `${onlineDevicesCount} Online` : 'Awaiting Nodes')), /*#__PURE__*/React.createElement("button", {
    onClick: () => setShowTerminalDrawer(!showTerminalDrawer),
    title: "Open Diagnostic Edge Terminal",
    className: `flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition ${showTerminalDrawer ? 'bg-cyan-500 text-zinc-950 font-semibold shadow-md shadow-cyan-500/20' : 'bg-white/[0.04] text-zinc-300 hover:text-white hover:bg-white/[0.08] border border-white/[0.08]'}`
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "terminal",
    className: "w-3.5 h-3.5"
  }), /*#__PURE__*/React.createElement("span", null, "Terminal")), /*#__PURE__*/React.createElement("button", {
    onClick: fetchAllData,
    title: "Refresh state",
    className: "p-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/[0.06] transition"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "refresh",
    className: "w-3.5 h-3.5"
  })))), /*#__PURE__*/React.createElement("main", {
    className: "flex-1 max-w-7xl w-full mx-auto p-6 flex flex-col"
  }, activeTab === 'pipeline' && /*#__PURE__*/React.createElement("div", {
    className: "space-y-5"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex flex-wrap items-center justify-between gap-3 p-4 rounded-3xl bg-zinc-950/70 border border-white/[0.08] shadow-lg"
  }, /*#__PURE__*/React.createElement("div", {
    className: "space-y-0.5"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center space-x-2"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "text-sm font-semibold text-white"
  }, "Edge Data Pipeline Architecture"), /*#__PURE__*/React.createElement("span", {
    className: "text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20"
  }, pipelineNodes.length, " Nodes • ", pipelineConnections.length, " Cables")), /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-zinc-400"
  }, "Drag nodes to organize. Click pins to connect. Customize parameters directly on each node.")), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center flex-wrap gap-2 text-xs"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: handleClearPipeline,
    className: "px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 rounded-xl text-xs font-medium transition shadow-sm flex items-center space-x-1.5",
    title: "Clear all nodes to build your pipeline completely from scratch"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "trash",
    className: "w-3.5 h-3.5 text-rose-400"
  }), /*#__PURE__*/React.createElement("span", null, "Clear (From Scratch)")), /*#__PURE__*/React.createElement("select", {
    onChange: e => handleLoadPreset(e.target.value),
    className: "bg-zinc-900 border border-white/10 rounded-xl px-3 py-1.5 text-zinc-300 hover:text-white text-xs focus:outline-none cursor-pointer",
    defaultValue: "multimodal"
  }, /*#__PURE__*/React.createElement("option", {
    value: "multimodal"
  }, "Preset: Industrial Sentinel (Full)"), /*#__PURE__*/React.createElement("option", {
    value: "vision_only"
  }, "Preset: Vision-Only Edge"), /*#__PURE__*/React.createElement("option", {
    value: "predictive"
  }, "Preset: Predictive Maintenance"), /*#__PURE__*/React.createElement("option", {
    value: "blank"
  }, "Blank Canvas (Start from Scratch)")), /*#__PURE__*/React.createElement("button", {
    onClick: handleAutoArrange,
    className: "px-3 py-1.5 bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white border border-white/10 rounded-xl text-xs font-medium transition shadow-sm flex items-center space-x-1.5",
    title: "Auto-arrange nodes neatly in sequence"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "sliders",
    className: "w-3.5 h-3.5 text-indigo-400"
  }), /*#__PURE__*/React.createElement("span", null, "Auto-Arrange")), /*#__PURE__*/React.createElement("button", {
    onClick: handleResetPan,
    className: "px-2.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-white/10 rounded-xl text-xs font-medium transition shadow-sm",
    title: "Reset Pan Center (0,0)"
  }, "Center View"), /*#__PURE__*/React.createElement("div", {
    className: "relative"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      setShowAddNodeMenu(!showAddNodeMenu);
      setNodeSearchTerm('');
      setNodeFilterCat('All');
    },
    className: "px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-medium transition shadow-sm flex items-center space-x-1.5"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "plus",
    className: "w-3.5 h-3.5"
  }), /*#__PURE__*/React.createElement("span", null, "Add Node")), showAddNodeMenu && /*#__PURE__*/React.createElement("div", {
    className: "absolute right-0 top-11 z-50 w-80 bg-zinc-900/95 backdrop-blur-md border border-white/[0.12] rounded-2xl shadow-2xl p-3 space-y-2.5 animate-in fade-in zoom-in-95 duration-100 text-xs"
  }, /*#__PURE__*/React.createElement("div", {
    className: "relative"
  }, /*#__PURE__*/React.createElement("input", {
    type: "text",
    placeholder: "Search nodes (e.g. YOLO, Camera, SLM)...",
    value: nodeSearchTerm,
    onChange: e => setNodeSearchTerm(e.target.value),
    autoFocus: true,
    className: "w-full bg-black/50 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
  }), nodeSearchTerm && /*#__PURE__*/React.createElement("button", {
    onClick: () => setNodeSearchTerm(''),
    className: "absolute right-2.5 top-2 text-zinc-500 hover:text-white text-[10px]"
  }, "✕")), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center space-x-1 overflow-x-auto pb-1 text-[10px]"
  }, ['All', 'Sensors', 'Gatekeepers', 'AI Engines', 'Storage & Sinks'].map(cat => /*#__PURE__*/React.createElement("button", {
    key: cat,
    onClick: () => setNodeFilterCat(cat),
    className: `px-2 py-0.5 rounded-lg font-medium whitespace-nowrap transition ${nodeFilterCat === cat ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white/[0.04] text-zinc-400 hover:text-zinc-200'}`
  }, cat))), /*#__PURE__*/React.createElement("div", {
    className: "max-h-64 overflow-y-auto space-y-1 pr-1 overscroll-contain"
  }, (() => {
    const filtered = Object.entries(NODE_LIBRARY).filter(([key, item]) => {
      const matchCat = nodeFilterCat === 'All' || item.category === nodeFilterCat;
      const matchSearch = !nodeSearchTerm || item.title.toLowerCase().includes(nodeSearchTerm.toLowerCase()) || item.subtitle.toLowerCase().includes(nodeSearchTerm.toLowerCase()) || item.category.toLowerCase().includes(nodeSearchTerm.toLowerCase());
      return matchCat && matchSearch;
    });
    if (filtered.length === 0) {
      return /*#__PURE__*/React.createElement("div", {
        className: "py-6 text-center text-zinc-500 text-xs"
      }, "No matching nodes found.");
    }
    return filtered.map(([key, item]) => /*#__PURE__*/React.createElement("button", {
      key: key,
      onClick: () => {
        handleAddNodeFromLibrary(key);
        setShowAddNodeMenu(false);
      },
      className: "w-full text-left p-2 rounded-xl hover:bg-white/[0.08] bg-white/[0.02] border border-white/[0.04] flex items-center justify-between group transition"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-center space-x-2.5 min-w-0"
    }, /*#__PURE__*/React.createElement("div", {
      className: "w-6 h-6 rounded-lg bg-white/[0.05] group-hover:bg-indigo-500/20 text-indigo-400 flex items-center justify-center transition"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: item.icon,
      className: "w-3.5 h-3.5"
    })), /*#__PURE__*/React.createElement("div", {
      className: "truncate"
    }, /*#__PURE__*/React.createElement("div", {
      className: "font-medium text-xs text-zinc-200 group-hover:text-white transition truncate"
    }, item.title), /*#__PURE__*/React.createElement("div", {
      className: "text-[10px] text-zinc-500 truncate"
    }, item.subtitle))), /*#__PURE__*/React.createElement("span", {
      className: "text-[10px] font-mono text-zinc-500 group-hover:text-indigo-400 pl-2"
    }, "+ Add")));
  })()))), /*#__PURE__*/React.createElement("button", {
    onClick: handleDeployPipelineToEdge,
    className: "px-3.5 py-1.5 bg-white text-zinc-950 hover:bg-zinc-200 rounded-xl text-xs font-medium transition shadow-sm flex items-center space-x-1.5"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "zap",
    className: "w-3.5 h-3.5 text-zinc-950"
  }), /*#__PURE__*/React.createElement("span", null, "Deploy to Fleet")))), connectingSource && /*#__PURE__*/React.createElement("div", {
    className: "p-2.5 rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs flex items-center justify-between"
  }, /*#__PURE__*/React.createElement("span", null, "Wiring cable from ", /*#__PURE__*/React.createElement("strong", null, pipelineNodes.find(n => n.id === connectingSource.nodeId)?.title), ". Click any target node to connect."), /*#__PURE__*/React.createElement("button", {
    onClick: () => setConnectingSource(null),
    className: "px-2 py-0.5 bg-cyan-900/50 hover:bg-cyan-800 rounded-md text-[11px]"
  }, "Cancel")), /*#__PURE__*/React.createElement("div", {
    ref: canvasRef,
    onMouseDown: handleCanvasMouseDown,
    onMouseMove: handleCanvasMouseMove,
    onClick: () => {
      if (showAddNodeMenu) setShowAddNodeMenu(false);
      if (connectingSource) setConnectingSource(null);
    },
    style: {
      minHeight: '560px',
      height: '580px',
      cursor: isPanning ? 'grabbing' : 'default'
    },
    className: "relative w-full rounded-3xl overflow-hidden canvas-dots border border-white/[0.08] shadow-2xl select-none"
  }, /*#__PURE__*/React.createElement("div", {
    className: "absolute top-3 right-3 z-30 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] text-zinc-400 font-mono pointer-events-none flex items-center space-x-2"
  }, /*#__PURE__*/React.createElement("span", {
    className: "w-1.5 h-1.5 rounded-full bg-cyan-400"
  }), /*#__PURE__*/React.createElement("span", null, "Canvas: (", Math.round(panOffset.x), ", ", Math.round(panOffset.y), ")"), /*#__PURE__*/React.createElement("span", {
    className: "text-zinc-600"
  }, "•"), /*#__PURE__*/React.createElement("span", null, "Drag background to pan")), /*#__PURE__*/React.createElement("div", {
    style: {
      transform: `translate(${panOffset.x}px, ${panOffset.y}px)`,
      willChange: 'transform'
    },
    className: "absolute inset-0 pointer-events-none"
  }, /*#__PURE__*/React.createElement("svg", {
    className: "absolute inset-0 w-[4000px] h-[4000px] pointer-events-none overflow-visible"
  }, /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("linearGradient", {
    id: "cable-grad",
    x1: "0%",
    y1: "0%",
    x2: "100%",
    y2: "0%"
  }, /*#__PURE__*/React.createElement("stop", {
    offset: "0%",
    stopColor: "#06b6d4"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "100%",
    stopColor: "#8b5cf6"
  }))), pipelineConnections.map(conn => {
    const fromNode = pipelineNodes.find(n => n.id === conn.from);
    const toNode = pipelineNodes.find(n => n.id === conn.to);
    if (!fromNode || !toNode) return null;
    const startX = fromNode.x + 260;
    const startY = fromNode.y + 36;
    const endX = toNode.x;
    const endY = toNode.y + 36;
    const dx = endX - startX;
    const curvature = Math.max(35, Math.abs(dx) * 0.45);
    const pathD = `M ${startX} ${startY} C ${startX + curvature} ${startY}, ${endX - curvature} ${endY}, ${endX} ${endY}`;
    const midX = (startX + endX) / 2;
    const midY = (startY + endY) / 2;
    return /*#__PURE__*/React.createElement("g", {
      key: conn.id,
      className: "pointer-events-auto group cursor-pointer cable-hit"
    }, /*#__PURE__*/React.createElement("path", {
      d: pathD,
      fill: "none",
      stroke: "transparent",
      strokeWidth: "18",
      onClick: e => {
        e.stopPropagation();
        handleDeleteConnection(conn.id);
      }
    }), /*#__PURE__*/React.createElement("path", {
      d: pathD,
      fill: "none",
      stroke: "#06b6d4",
      strokeWidth: "5",
      opacity: "0.18"
    }), /*#__PURE__*/React.createElement("path", {
      d: pathD,
      fill: "none",
      stroke: "#0284c7",
      strokeWidth: "2.5",
      strokeLinecap: "round"
    }), /*#__PURE__*/React.createElement("path", {
      d: pathD,
      fill: "none",
      stroke: "#67e8f9",
      strokeWidth: "1.5",
      strokeLinecap: "round",
      className: "wire-animated"
    }), /*#__PURE__*/React.createElement("g", {
      className: "opacity-0 group-hover:opacity-100 transition duration-150 cursor-pointer",
      onClick: e => {
        e.stopPropagation();
        handleDeleteConnection(conn.id);
      }
    }, /*#__PURE__*/React.createElement("circle", {
      cx: midX,
      cy: midY,
      r: "9",
      fill: "#ef4444"
    }), /*#__PURE__*/React.createElement("text", {
      x: midX,
      y: midY + 3.5,
      textAnchor: "middle",
      fill: "#ffffff",
      fontSize: "10",
      fontWeight: "bold"
    }, "✕")));
  }), connectingSource && mouseCanvasPos && (() => {
    const src = pipelineNodes.find(n => n.id === connectingSource.nodeId);
    if (!src) return null;
    const startX = src.x + 260;
    const startY = src.y + 36;
    const endX = mouseCanvasPos.x;
    const endY = mouseCanvasPos.y;
    const dx = endX - startX;
    const curvature = Math.max(30, Math.abs(dx) * 0.4);
    return /*#__PURE__*/React.createElement("path", {
      d: `M ${startX} ${startY} C ${startX + curvature} ${startY}, ${endX - curvature} ${endY}, ${endX} ${endY}`,
      fill: "none",
      stroke: "#a855f7",
      strokeWidth: "2.5",
      strokeDasharray: "4 4",
      opacity: "0.9"
    });
  })()), pipelineNodes.map(node => {
    const isSelected = selectedNodeId === node.id;
    const colorMap = {
      emerald: {
        bar: 'bg-emerald-500',
        badge: 'bg-emerald-500/10 text-emerald-400',
        border: 'border-emerald-500/30'
      },
      indigo: {
        bar: 'bg-indigo-500',
        badge: 'bg-indigo-500/10 text-indigo-400',
        border: 'border-indigo-500/30'
      },
      cyan: {
        bar: 'bg-cyan-500',
        badge: 'bg-cyan-500/10 text-cyan-400',
        border: 'border-cyan-500/30'
      },
      amber: {
        bar: 'bg-amber-500',
        badge: 'bg-amber-500/10 text-amber-400',
        border: 'border-amber-500/30'
      },
      violet: {
        bar: 'bg-violet-500',
        badge: 'bg-violet-500/10 text-violet-400',
        border: 'border-violet-500/30'
      },
      rose: {
        bar: 'bg-rose-500',
        badge: 'bg-rose-500/10 text-rose-400',
        border: 'border-rose-500/30'
      }
    };
    const theme = colorMap[node.color] || colorMap.cyan;
    return /*#__PURE__*/React.createElement("div", {
      key: node.id,
      style: {
        position: 'absolute',
        left: `${node.x}px`,
        top: `${node.y}px`,
        width: '260px'
      },
      onClick: e => {
        e.stopPropagation();
        if (connectingSource && connectingSource.nodeId !== node.id) {
          handleEndConnect(node.id);
        } else {
          setSelectedNodeId(node.id);
        }
      },
      className: `rounded-2xl bg-zinc-900/95 backdrop-blur-md border shadow-2xl pointer-events-auto node-card select-none ${isSelected ? 'border-white/60 ring-2 ring-indigo-500/60 shadow-indigo-500/20 z-20' : 'border-white/[0.12] hover:border-white/30 z-10'}`
    }, /*#__PURE__*/React.createElement("div", {
      className: `h-1.5 w-full rounded-t-2xl ${theme.bar}`
    }), node.inputs > 0 && /*#__PURE__*/React.createElement("div", {
      onClick: e => {
        e.stopPropagation();
        handleEndConnect(node.id);
      },
      className: `absolute -left-2.5 top-8 w-5 h-5 rounded-full bg-zinc-950 border-2 border-indigo-400 flex items-center justify-center cursor-pointer transition hover:scale-125 z-30 port-pin ${connectingSource && connectingSource.nodeId !== node.id ? 'ring-4 ring-cyan-400 animate-pulse' : ''}`,
      title: "Input Port: Click to link incoming cable"
    }, /*#__PURE__*/React.createElement("div", {
      className: "w-1.5 h-1.5 rounded-full bg-white"
    })), node.outputs > 0 && /*#__PURE__*/React.createElement("div", {
      onClick: e => {
        e.stopPropagation();
        handleStartConnect(node.id);
      },
      className: "absolute -right-2.5 top-8 w-5 h-5 rounded-full bg-zinc-950 border-2 border-cyan-400 flex items-center justify-center cursor-pointer transition hover:scale-125 z-30 port-pin",
      title: "Output Port: Click to drag wire to another node"
    }, /*#__PURE__*/React.createElement("div", {
      className: "w-1.5 h-1.5 rounded-full bg-white"
    })), /*#__PURE__*/React.createElement("div", {
      onMouseDown: e => handleNodeMouseDown(e, node.id),
      className: "p-3 pb-2 flex items-center justify-between border-b border-white/[0.06] cursor-grab active:cursor-grabbing hover:bg-white/[0.03] rounded-t-2xl"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-center space-x-2 truncate"
    }, /*#__PURE__*/React.createElement("div", {
      className: `w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${theme.badge}`
    }, /*#__PURE__*/React.createElement(Icon, {
      name: node.icon,
      className: "w-3.5 h-3.5"
    })), /*#__PURE__*/React.createElement("div", {
      className: "truncate"
    }, /*#__PURE__*/React.createElement("h4", {
      className: "text-xs font-semibold text-white leading-tight truncate"
    }, node.title), /*#__PURE__*/React.createElement("span", {
      className: "text-[10px] text-zinc-400 block truncate"
    }, node.subtitle))), /*#__PURE__*/React.createElement("div", {
      className: "flex items-center space-x-1 shrink-0"
    }, /*#__PURE__*/React.createElement("span", {
      className: "text-[9px] font-mono text-zinc-500 px-1 rounded bg-white/[0.04]"
    }, node.x, ",", node.y), /*#__PURE__*/React.createElement("button", {
      onClick: e => {
        e.stopPropagation();
        handleDeleteNode(node.id);
      },
      className: "text-zinc-500 hover:text-rose-400 p-1 rounded-md transition text-xs shrink-0",
      title: "Delete Node"
    }, "✕"))), /*#__PURE__*/React.createElement("div", {
      className: "p-3 space-y-2 text-[11px]",
      onMouseDown: e => e.stopPropagation()
    }, node.type === 'sensor_cam' && /*#__PURE__*/React.createElement("div", {
      className: "space-y-1"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-center justify-between text-zinc-400"
    }, /*#__PURE__*/React.createElement("span", null, "Capture Rate:"), /*#__PURE__*/React.createElement("span", {
      className: "font-mono text-white font-medium"
    }, node.config?.fps || 5, " FPS")), /*#__PURE__*/React.createElement("input", {
      type: "range",
      min: "1",
      max: "30",
      value: node.config?.fps || 5,
      onMouseDown: e => e.stopPropagation(),
      onChange: e => handleUpdateNodeConfig(node.id, 'fps', Number(e.target.value)),
      className: "w-full accent-emerald-500 h-1 bg-zinc-800 rounded-lg cursor-pointer"
    })), node.type === 'wasm_filter' && /*#__PURE__*/React.createElement("div", {
      className: "space-y-1"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-center justify-between text-zinc-400"
    }, /*#__PURE__*/React.createElement("span", null, "ISO-10816 Limit:"), /*#__PURE__*/React.createElement("span", {
      className: "font-mono text-white font-medium"
    }, node.config?.threshold || 4.5, " mm/s")), /*#__PURE__*/React.createElement("input", {
      type: "range",
      min: "1.0",
      max: "8.0",
      step: "0.5",
      value: node.config?.threshold || 4.5,
      onMouseDown: e => e.stopPropagation(),
      onChange: e => handleUpdateNodeConfig(node.id, 'threshold', Number(e.target.value)),
      className: "w-full accent-indigo-500 h-1 bg-zinc-800 rounded-lg cursor-pointer"
    })), node.type === 'custom_rule' && /*#__PURE__*/React.createElement("div", {
      className: "space-y-2"
    }, /*#__PURE__*/React.createElement("div", {
      className: "grid grid-cols-2 gap-1.5"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
      className: "text-[9px] text-zinc-500 uppercase font-mono block"
    }, "Condition Metric"), /*#__PURE__*/React.createElement("select", {
      value: node.config?.metric || 'confidence',
      onMouseDown: e => e.stopPropagation(),
      onChange: e => {
        const m = e.target.value;
        const defVal = m === 'confidence' ? 70 : m === 'motion' ? 12 : m === 'latency' ? 150 : m === 'temperature' ? 80 : m === 'vibration' ? 4.5 : 75;
        handleUpdateNodeConfig(node.id, 'metric', m);
        handleUpdateNodeConfig(node.id, 'threshold', defVal);
      },
      className: "w-full bg-zinc-950 border border-white/10 rounded-lg px-1.5 py-1 text-white text-[10px] focus:outline-none cursor-pointer"
    }, /*#__PURE__*/React.createElement("option", {
      value: "confidence"
    }, "Confidence (%)"), /*#__PURE__*/React.createElement("option", {
      value: "motion"
    }, "Motion Delta (%)"), /*#__PURE__*/React.createElement("option", {
      value: "latency"
    }, "Inference Latency (ms)"), /*#__PURE__*/React.createElement("option", {
      value: "temperature"
    }, "Core Temp (°C)"), /*#__PURE__*/React.createElement("option", {
      value: "vibration"
    }, "Vibration (mm/s)"), /*#__PURE__*/React.createElement("option", {
      value: "audio"
    }, "Acoustic (dB)"))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
      className: "text-[9px] text-zinc-500 uppercase font-mono block"
    }, "Operator"), /*#__PURE__*/React.createElement("select", {
      value: node.config?.operator || '>=',
      onMouseDown: e => e.stopPropagation(),
      onChange: e => handleUpdateNodeConfig(node.id, 'operator', e.target.value),
      className: "w-full bg-zinc-950 border border-white/10 rounded-lg px-1.5 py-1 text-white text-[10px] focus:outline-none font-mono cursor-pointer"
    }, /*#__PURE__*/React.createElement("option", {
      value: ">="
    }, ">= (GTE)"), /*#__PURE__*/React.createElement("option", {
      value: "<="
    }, "<= (LTE)"), /*#__PURE__*/React.createElement("option", {
      value: ">"
    }, "> (GT)"), /*#__PURE__*/React.createElement("option", {
      value: "<"
    }, "< (LT)")))), /*#__PURE__*/React.createElement("div", {
      className: "flex items-center justify-between text-zinc-400 text-[10px]"
    }, /*#__PURE__*/React.createElement("span", null, "Trigger Threshold:"), /*#__PURE__*/React.createElement("span", {
      className: "font-mono text-white font-medium"
    }, node.config?.threshold != null ? node.config.threshold : 70, node.config?.metric === 'confidence' || node.config?.metric === 'motion' ? '%' : node.config?.metric === 'latency' ? ' ms' : node.config?.metric === 'temperature' ? '°C' : node.config?.metric === 'vibration' ? ' mm/s' : ' dB')), /*#__PURE__*/React.createElement("input", {
      type: "range",
      min: node.config?.metric === 'vibration' ? 0.5 : node.config?.metric === 'temperature' ? 40 : 1,
      max: node.config?.metric === 'vibration' ? 10 : node.config?.metric === 'latency' ? 500 : 100,
      step: node.config?.metric === 'vibration' ? 0.1 : 1,
      value: node.config?.threshold != null ? node.config.threshold : 70,
      onMouseDown: e => e.stopPropagation(),
      onChange: e => handleUpdateNodeConfig(node.id, 'threshold', Number(e.target.value)),
      className: "w-full accent-indigo-500 h-1 bg-zinc-800 rounded-lg cursor-pointer"
    })), node.type === 'ai_yolo' && /*#__PURE__*/React.createElement("div", {
      className: "space-y-1"
    }, /*#__PURE__*/React.createElement("span", {
      className: "text-[10px] text-zinc-400 block"
    }, "Active ONNX Model:"), /*#__PURE__*/React.createElement("select", {
      value: node.config?.model || 'yolov8n-coco',
      onMouseDown: e => e.stopPropagation(),
      onChange: e => handleUpdateNodeConfig(node.id, 'model', e.target.value),
      className: "w-full bg-zinc-950 border border-white/10 rounded-lg px-2 py-1 text-white text-[11px] focus:outline-none"
    }, catalog.map(m => /*#__PURE__*/React.createElement("option", {
      key: m.model_id,
      value: m.model_id
    }, m.name.split(' (')[0])))), node.type === 'sensor_imu' && /*#__PURE__*/React.createElement("div", {
      className: "flex items-center justify-between text-zinc-400"
    }, /*#__PURE__*/React.createElement("span", null, "Sample Rate:"), /*#__PURE__*/React.createElement("span", {
      className: "font-mono text-emerald-300"
    }, "2000 Hz (±16g)")), node.type === 'ai_vibration' && /*#__PURE__*/React.createElement("div", {
      className: "flex items-center justify-between text-zinc-400"
    }, /*#__PURE__*/React.createElement("span", null, "Harmonic FFT:"), /*#__PURE__*/React.createElement("span", {
      className: "font-mono text-cyan-300"
    }, "1024-pt SIMD")), node.type === 'storage_wal' && /*#__PURE__*/React.createElement("div", {
      className: "flex items-center justify-between text-zinc-400"
    }, /*#__PURE__*/React.createElement("span", null, "Ring Buffer:"), /*#__PURE__*/React.createElement("span", {
      className: "font-mono text-amber-300"
    }, node.config?.ring_buffer || 512, " frames")), node.type === 'cloud_sync' && /*#__PURE__*/React.createElement("div", {
      className: "flex items-center justify-between text-zinc-400"
    }, /*#__PURE__*/React.createElement("span", null, "Security:"), /*#__PURE__*/React.createElement("span", {
      className: "font-mono text-violet-300"
    }, "ChaCha20-Poly1305"))), /*#__PURE__*/React.createElement("div", {
      className: "px-3 py-1.5 bg-black/40 border-t border-white/[0.04] rounded-b-2xl flex items-center justify-between"
    }, /*#__PURE__*/React.createElement("span", {
      className: "text-[9px] text-zinc-500 uppercase tracking-wider"
    }, node.type.split('_')[0]), /*#__PURE__*/React.createElement("button", {
      onClick: e => {
        e.stopPropagation();
        handleStartConnect(node.id);
      },
      className: "text-[10px] text-indigo-400 hover:text-indigo-300 font-medium flex items-center space-x-0.5"
    }, /*#__PURE__*/React.createElement("span", null, "Wire ➔"))));
  })), pipelineNodes.length === 0 && /*#__PURE__*/React.createElement("div", {
    className: "absolute inset-0 flex flex-col items-center justify-center p-6 text-center select-none z-10 pointer-events-none"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-3 shadow-xl"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "sliders",
    className: "w-7 h-7"
  })), /*#__PURE__*/React.createElement("h4", {
    className: "font-medium text-sm text-zinc-200"
  }, "Blank Canvas Ready"), /*#__PURE__*/React.createElement("p", {
    className: "text-xs max-w-sm text-zinc-400 mt-1 mb-4"
  }, "Assemble your edge pipeline from scratch. Click any button below to drop your first block:"), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-wrap items-center justify-center gap-2 pointer-events-auto"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => handleAddNodeFromLibrary('sensor_cam'),
    className: "px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs font-medium text-emerald-400 border border-emerald-500/30 transition flex items-center space-x-1.5"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "video",
    className: "w-3.5 h-3.5"
  }), /*#__PURE__*/React.createElement("span", null, "+ Camera Stream")), /*#__PURE__*/React.createElement("button", {
    onClick: () => handleAddNodeFromLibrary('ai_yolo'),
    className: "px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs font-medium text-cyan-400 border border-cyan-500/30 transition flex items-center space-x-1.5"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "brain",
    className: "w-3.5 h-3.5"
  }), /*#__PURE__*/React.createElement("span", null, "+ YOLOv8 Vision")), /*#__PURE__*/React.createElement("button", {
    onClick: () => handleAddNodeFromLibrary('sensor_imu'),
    className: "px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs font-medium text-emerald-400 border border-emerald-500/30 transition flex items-center space-x-1.5"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "activity",
    className: "w-3.5 h-3.5"
  }), /*#__PURE__*/React.createElement("span", null, "+ Vibration IMU")), /*#__PURE__*/React.createElement("button", {
    onClick: () => handleAddNodeFromLibrary('custom_rule'),
    className: "px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs font-medium text-indigo-400 border border-indigo-500/30 transition flex items-center space-x-1.5"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "shield",
    className: "w-3.5 h-3.5"
  }), /*#__PURE__*/React.createElement("span", null, "+ Custom Rule")), /*#__PURE__*/React.createElement("button", {
    onClick: () => handleAddNodeFromLibrary('storage_wal'),
    className: "px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs font-medium text-amber-400 border border-amber-500/30 transition flex items-center space-x-1.5"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "cpu",
    className: "w-3.5 h-3.5"
  }), /*#__PURE__*/React.createElement("span", null, "+ SQLite WAL"))))), selectedNode && /*#__PURE__*/React.createElement("div", {
    className: "p-4 rounded-3xl bg-zinc-950/70 border border-white/[0.08] shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "space-y-1"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center space-x-2"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-xs font-semibold text-white"
  }, selectedNode.title, " Parameters"), /*#__PURE__*/React.createElement("span", {
    className: "px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-mono border border-emerald-500/20"
  }, "Active")), /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-zinc-400"
  }, selectedNode.subtitle)), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-wrap items-center gap-3 text-xs w-full md:w-auto"
  }, Object.entries(selectedNode.config || {}).map(([k, v]) => /*#__PURE__*/React.createElement("div", {
    key: k,
    className: "p-2.5 rounded-xl bg-zinc-900 border border-white/[0.04]"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-[10px] text-zinc-500 block uppercase font-bold"
  }, k), /*#__PURE__*/React.createElement("span", {
    className: "font-mono text-zinc-200 text-[11px] font-medium"
  }, String(v)))), /*#__PURE__*/React.createElement("button", {
    onClick: () => handleDeleteNode(selectedNode.id),
    className: "p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-medium transition"
  }, "Delete Node"))), (() => {
    const isDeviceOnline = devices.some(d => d.status === 'ONLINE');
    const hasVision = pipelineNodes.some(n => n.type.startsWith('ai_yolo') || n.type.startsWith('ai_'));
    const hasImu = pipelineNodes.some(n => n.type === 'sensor_imu' || n.type === 'ai_vibration');
    const hasMic = pipelineNodes.some(n => n.type === 'sensor_mic' || n.type === 'ai_audio');
    return /*#__PURE__*/React.createElement("div", {
      className: "space-y-3 pt-2"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-center justify-between px-1"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-center space-x-2"
    }, /*#__PURE__*/React.createElement("h4", {
      className: "text-xs font-semibold text-zinc-300 uppercase tracking-wider"
    }, "Pipeline Telemetry Streams"), /*#__PURE__*/React.createElement("span", {
      className: `text-[10px] font-mono px-2 py-0.5 rounded-full ${isDeviceOnline ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-zinc-800 text-zinc-400'}`
    }, isDeviceOnline ? '● Live Hardware Feed (1.5s)' : '○ Standby — Awaiting Edge Connection')), /*#__PURE__*/React.createElement("span", {
      className: "text-[11px] text-zinc-500 font-mono"
    }, "Real Edge Hardware Feedback")), /*#__PURE__*/React.createElement("div", {
      className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
    }, /*#__PURE__*/React.createElement(MetricGraph, {
      title: "Inference Latency",
      subtitle: hasVision ? 'Pure Rust ONNX Runtime Engine' : 'Not configured in active pipeline',
      data: telemetryHistory.latency,
      unit: "ms",
      min: 0,
      max: 200,
      color: "cyan",
      threshold: 150,
      thresholdLabel: "Budget: 150 ms",
      isActive: isDeviceOnline && hasVision
    }), /*#__PURE__*/React.createElement(MetricGraph, {
      title: "Vibration Velocity (ISO-10816)",
      subtitle: hasImu ? 'Accelerometer Harmonics' : 'Not configured in active pipeline',
      data: telemetryHistory.vibration,
      unit: "mm/s",
      min: 0,
      max: 6.0,
      color: "emerald",
      threshold: 4.5,
      thresholdLabel: "Limit: 4.5 mm/s",
      isActive: isDeviceOnline && hasImu
    }), /*#__PURE__*/React.createElement(MetricGraph, {
      title: "Acoustic Sound Pressure",
      subtitle: hasMic ? 'MEMS Microphone Decibels' : 'Not configured in active pipeline',
      data: telemetryHistory.audio,
      unit: "dB",
      min: 0,
      max: 100,
      color: "amber",
      threshold: 75,
      thresholdLabel: "Alert: 75 dB",
      isActive: isDeviceOnline && hasMic
    }), /*#__PURE__*/React.createElement(MetricGraph, {
      title: "CPU Utilization",
      subtitle: isDeviceOnline ? 'Host Kernel Load' : 'Awaiting device heartbeat',
      data: telemetryHistory.cpu,
      unit: "%",
      min: 0,
      max: 100,
      color: "violet",
      isActive: isDeviceOnline
    }), /*#__PURE__*/React.createElement(MetricGraph, {
      title: "RAM Resident Footprint",
      subtitle: isDeviceOnline ? 'RSS Memory Alloc' : 'Awaiting device heartbeat',
      data: telemetryHistory.memory,
      unit: "MB",
      min: 0,
      max: 120,
      color: "cyan",
      isActive: isDeviceOnline
    }), /*#__PURE__*/React.createElement(MetricGraph, {
      title: "Sensor Core Temperature",
      subtitle: isDeviceOnline ? 'Hardware Thermal Zone' : 'Awaiting device heartbeat',
      data: telemetryHistory.temp,
      unit: "°C",
      min: 0,
      max: 90,
      color: "rose",
      threshold: 85,
      thresholdLabel: "Thermal Cap: 85°C",
      isActive: isDeviceOnline
    })));
  })()), activeTab === 'live' && /*#__PURE__*/React.createElement("div", {
    className: "flex-1 flex flex-col space-y-6"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    className: "text-base font-semibold text-white"
  }, "Live Vision & Neural Telemetry"), /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-zinc-400 mt-0.5"
  }, "Real-time optical inference stream from active edge hardware.")), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center space-x-3 text-xs"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-zinc-400"
  }, "Active Model:"), /*#__PURE__*/React.createElement("select", {
    value: activeModel,
    disabled: isDeployingModel,
    onChange: e => handleDeployModel(e.target.value),
    className: "bg-zinc-900 border border-white/[0.12] rounded-xl px-3.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer shadow-sm"
  }, catalog.map(m => /*#__PURE__*/React.createElement("option", {
    key: m.model_id,
    value: m.model_id
  }, m.name, " [", m.modality, "]"))), /*#__PURE__*/React.createElement("button", {
    onClick: () => handleDeployCanaryModel(activeModel),
    disabled: isDeployingModel,
    title: "Staged Canary: deploy to 1 node, verify 10s, then promote to fleet",
    className: "px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-medium transition flex items-center space-x-1.5 shadow-sm"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "shield",
    className: "w-3.5 h-3.5"
  }), /*#__PURE__*/React.createElement("span", null, "Canary Deploy")), /*#__PURE__*/React.createElement("button", {
    onClick: () => setActiveTab('pipeline'),
    className: "px-3.5 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 text-xs font-medium transition flex items-center space-x-1.5 shadow-sm",
    title: "Switch to visual node graph pipeline editor (TIF Sandbox)"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "workflow",
    className: "w-3.5 h-3.5 text-indigo-400"
  }), /*#__PURE__*/React.createElement("span", null, "Pipeline Studio (TIF Sandbox)")), isDeployingModel && /*#__PURE__*/React.createElement("span", {
    className: "text-xs text-indigo-400 animate-pulse"
  }, "Hot-swapping..."))), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 lg:grid-cols-3 gap-6 items-start"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lg:col-span-2 relative rounded-3xl overflow-hidden bg-black border border-white/[0.08] shadow-2xl aspect-[4/3] flex items-center justify-center group"
  }, /*#__PURE__*/React.createElement("img", {
    key: liveFrameTick,
    src: `/api/v1/telemetry/live/frame?t=${liveFrameTick}`,
    alt: "Live Camera Stream",
    className: `w-full h-full object-cover ${frameError ? 'hidden' : 'block'}`,
    onError: () => setFrameError(true),
    onLoad: () => setFrameError(false)
  }), frameError && /*#__PURE__*/React.createElement("div", {
    className: "w-full h-full flex flex-col items-center justify-center space-y-3 bg-zinc-950/90 text-zinc-500 p-6 text-center"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-12 h-12 rounded-2xl bg-white/[0.04] flex items-center justify-center text-zinc-400"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "video",
    className: "w-6 h-6"
  })), /*#__PURE__*/React.createElement("div", {
    className: "text-sm font-medium text-zinc-300"
  }, "Camera Feed Standby"), /*#__PURE__*/React.createElement("p", {
    className: "text-xs max-w-sm text-zinc-500"
  }, "Start the edge client on your Raspberry Pi, Jetson, or PC to stream live frames:"), /*#__PURE__*/React.createElement("code", {
    className: "px-3 py-1 rounded-lg bg-zinc-900 border border-white/[0.08] text-xs font-mono text-zinc-300"
  }, "./run-edge.sh")), liveDetections.map((det, idx) => {
    const [x, y, w, h] = det.bbox || [40, 40, 100, 100];
    const leftPct = x / 640 * 100;
    const topPct = y / 480 * 100;
    const widthPct = w / 640 * 100;
    const heightPct = h / 480 * 100;
    return /*#__PURE__*/React.createElement("div", {
      key: idx,
      style: {
        position: 'absolute',
        left: `${leftPct}%`,
        top: `${topPct}%`,
        width: `${widthPct}%`,
        height: `${heightPct}%`
      },
      className: "border-2 border-emerald-400 bg-emerald-400/10 rounded-lg pointer-events-none transition-all duration-300 shadow-lg"
    }, /*#__PURE__*/React.createElement("span", {
      className: "absolute -top-6 left-0 px-2 py-0.5 rounded-md bg-emerald-500 text-black text-[10px] font-bold tracking-wide uppercase shadow"
    }, det.label, " ", Math.round(det.confidence * 100), "%"));
  }), /*#__PURE__*/React.createElement("div", {
    className: "absolute top-4 left-4 flex items-center space-x-2 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[11px] font-medium text-white"
  }, /*#__PURE__*/React.createElement("span", {
    className: "w-2 h-2 rounded-full bg-rose-500 animate-pulse"
  }), /*#__PURE__*/React.createElement("span", null, "LIVE /dev/video0"), /*#__PURE__*/React.createElement("span", {
    className: "text-zinc-500"
  }, "•"), /*#__PURE__*/React.createElement("span", {
    className: "text-zinc-300"
  }, "Native Rust ORT"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setLiveFrameTick(Date.now()),
    title: "Refresh camera snapshot",
    className: "ml-1 text-zinc-400 hover:text-cyan-400 transition"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "refresh",
    className: "w-3 h-3"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs pointer-events-none"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex flex-wrap gap-1.5"
  }, liveDetections.length === 0 ? /*#__PURE__*/React.createElement("span", {
    className: "px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-zinc-400 border border-white/10"
  }, "Inspecting scene (nominal)") : liveDetections.map((d, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    className: "px-2.5 py-1 rounded-lg bg-emerald-500/20 backdrop-blur-md text-emerald-300 border border-emerald-500/40 font-mono text-[11px]"
  }, d.label, " ", Math.round(d.confidence * 100), "%"))))), /*#__PURE__*/React.createElement("div", {
    className: "space-y-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-3 gap-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-center"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-[11px] text-zinc-400 block mb-1"
  }, "Inference"), /*#__PURE__*/React.createElement("span", {
    className: "text-base font-semibold text-white font-mono"
  }, telemetryHistory.latency[telemetryHistory.latency.length - 1], " ms")), /*#__PURE__*/React.createElement("div", {
    className: "p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-center"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-[11px] text-zinc-400 block mb-1"
  }, "Core Temp"), /*#__PURE__*/React.createElement("span", {
    className: "text-base font-semibold text-emerald-400 font-mono"
  }, telemetryHistory.temp[telemetryHistory.temp.length - 1], "°C")), /*#__PURE__*/React.createElement("div", {
    className: "p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-center"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-[11px] text-zinc-400 block mb-1"
  }, "RAM Resident"), /*#__PURE__*/React.createElement("span", {
    className: "text-base font-semibold text-white font-mono"
  }, telemetryHistory.memory[telemetryHistory.memory.length - 1], " MB"))), /*#__PURE__*/React.createElement("div", {
    className: "p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center space-x-2.5"
  }, /*#__PURE__*/React.createElement("div", {
    className: `w-8 h-8 rounded-xl flex items-center justify-center ${driftMetrics?.drift_detected ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "activity",
    className: "w-4 h-4"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "text-xs font-semibold text-white flex items-center space-x-1.5"
  }, /*#__PURE__*/React.createElement("span", null, "Confidence & Drift"), /*#__PURE__*/React.createElement("span", {
    className: `text-[10px] px-1.5 py-0.2 rounded-full font-mono ${driftMetrics?.drift_detected ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'}`
  }, driftMetrics?.drift_detected ? 'DRIFT ALERT' : 'STABLE')), /*#__PURE__*/React.createElement("div", {
    className: "text-[11px] text-zinc-400 mt-0.5"
  }, "Mean: ", /*#__PURE__*/React.createElement("span", {
    className: "font-mono text-zinc-200"
  }, driftMetrics ? `${(driftMetrics.mean_confidence * 100).toFixed(0)}%` : '88%'), " • Samples: ", /*#__PURE__*/React.createElement("span", {
    className: "font-mono text-zinc-200"
  }, driftMetrics?.sample_count || 30)))), /*#__PURE__*/React.createElement("div", {
    className: "text-right"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-[10px] text-zinc-500 block"
  }, "Variance"), /*#__PURE__*/React.createElement("span", {
    className: "text-xs font-mono text-zinc-300"
  }, driftMetrics ? Number(driftMetrics.variance).toFixed(4) : '0.0040'))), /*#__PURE__*/React.createElement("div", {
    className: "p-4 rounded-3xl bg-white/[0.03] border border-white/[0.06] flex flex-col space-y-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center space-x-2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "brain",
    className: "w-3.5 h-3.5"
  })), /*#__PURE__*/React.createElement("span", {
    className: "text-xs font-semibold text-white"
  }, "Edge AI Assistant (Qwen SLM)")), /*#__PURE__*/React.createElement("span", {
    className: "text-[10px] px-2 py-0.5 rounded-full bg-indigo-950/60 text-indigo-300 border border-indigo-800/60 font-mono"
  }, "Local GGUF")), /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-zinc-400 leading-relaxed"
  }, "Ask on-device AI to analyze visual targets or inspect machine health."), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-wrap gap-1.5"
  }, ["Summarize camera scene", "Check safety compliance", "Diagnose machine health"].map((prompt, idx) => /*#__PURE__*/React.createElement("button", {
    key: idx,
    onClick: () => handleAskAssistant(prompt),
    className: "text-[11px] px-2.5 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 border border-white/[0.06] transition"
  }, prompt))), (assistantReply || isAssistantThinking) && /*#__PURE__*/React.createElement("div", {
    className: "p-3 rounded-2xl bg-zinc-950/80 border border-white/[0.08] text-xs text-zinc-200 leading-relaxed min-h-[60px] flex items-center"
  }, isAssistantThinking ? /*#__PURE__*/React.createElement("div", {
    className: "flex items-center space-x-2 text-zinc-400"
  }, /*#__PURE__*/React.createElement("span", {
    className: "w-2 h-2 rounded-full bg-indigo-400 animate-ping"
  }), /*#__PURE__*/React.createElement("span", null, "Local SLM reasoning...")) : /*#__PURE__*/React.createElement("span", null, assistantReply)), /*#__PURE__*/React.createElement("form", {
    onSubmit: e => {
      e.preventDefault();
      handleAskAssistant();
    },
    className: "flex items-center space-x-2 pt-1"
  }, /*#__PURE__*/React.createElement("input", {
    type: "text",
    placeholder: "Ask edge diagnostic assistant...",
    value: assistantPrompt,
    onChange: e => setAssistantPrompt(e.target.value),
    className: "flex-1 bg-zinc-950 border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
  }), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    disabled: isAssistantThinking || !assistantPrompt.trim(),
    className: "p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white transition shadow-sm"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "send",
    className: "w-4 h-4"
  })))))), (() => {
    const isDeviceOnline = devices.some(d => d.status === 'ONLINE');
    const hasVision = pipelineNodes.some(n => n.type.startsWith('ai_yolo') || n.type.startsWith('ai_'));
    return /*#__PURE__*/React.createElement("div", {
      className: "grid grid-cols-1 md:grid-cols-2 gap-4"
    }, /*#__PURE__*/React.createElement(MetricGraph, {
      title: "Inference Latency (Native SIMD ORT)",
      subtitle: hasVision ? 'Active Computer Vision Pipeline' : 'No vision model in pipeline',
      data: telemetryHistory.latency,
      unit: "ms",
      min: 0,
      max: 200,
      color: "cyan",
      threshold: 150,
      thresholdLabel: "Budget: 150 ms",
      isActive: isDeviceOnline && hasVision
    }), /*#__PURE__*/React.createElement(MetricGraph, {
      title: "Host System RAM Footprint",
      subtitle: isDeviceOnline ? 'Edge Client Resident Memory' : 'Device offline / awaiting heartbeat',
      data: telemetryHistory.memory,
      unit: "MB",
      min: 0,
      max: 120,
      color: "emerald",
      threshold: 90,
      thresholdLabel: "Cap: 90 MB",
      isActive: isDeviceOnline
    }));
  })()), activeTab === 'fleet' && /*#__PURE__*/React.createElement("div", {
    className: "space-y-6"
  }, /*#__PURE__*/React.createElement("div", {
    className: "p-6 rounded-3xl bg-gradient-to-br from-indigo-950/30 via-zinc-900/40 to-zinc-950 border border-indigo-500/20 shadow-xl space-y-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex flex-col sm:flex-row sm:items-center justify-between gap-2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center space-x-2.5"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-7 h-7 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "zap",
    className: "w-4 h-4"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    className: "font-semibold text-sm text-white"
  }, "Zero-Touch Edge Device Provisioning"), /*#__PURE__*/React.createElement("p", {
    className: "text-[11px] text-zinc-400"
  }, "Streamlined one-line installer — claims hardware ID, stages configs, and boots microservices automatically."))), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center space-x-2 shrink-0"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setShowAddDeviceModal(true),
    className: "px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition flex items-center space-x-1.5 cursor-pointer"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "plus",
    className: "w-3.5 h-3.5"
  }), /*#__PURE__*/React.createElement("span", null, "+ Add Device")), currentTokenInfo && /*#__PURE__*/React.createElement("span", {
    className: "text-[10px] font-mono px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
  }, "Token: ", currentTokenInfo.token.substring(0, 16), "... (Active 24h)"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setShowQuickRef(!showQuickRef),
    className: "px-2.5 py-1 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 text-xs font-medium border border-white/[0.08] transition flex items-center space-x-1",
    title: "Toggle Server & SLM Cheatsheet"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "terminal",
    className: "w-3.5 h-3.5 text-indigo-400"
  }), /*#__PURE__*/React.createElement("span", null, showQuickRef ? 'Hide Reference' : 'Server & CLI Reference')))), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between text-xs pt-1"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center space-x-2"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-zinc-400"
  }, "Execution Mode:"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setDaemonMode(false),
    className: `px-2.5 py-1 rounded-lg text-[11px] font-medium transition ${!daemonMode ? 'bg-indigo-600 text-white shadow-sm' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`
  }, "Live Streaming (Foreground)"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setDaemonMode(true),
    className: `px-2.5 py-1 rounded-lg text-[11px] font-medium transition ${daemonMode ? 'bg-indigo-600 text-white shadow-sm' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`
  }, "Background Daemon (--daemon)")), /*#__PURE__*/React.createElement("div", {
    className: "hidden sm:flex items-center space-x-2 text-[11px] text-zinc-500 font-mono"
  }, /*#__PURE__*/React.createElement("span", null, "Zero Python • Pure Rust & C++ ELF"))), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 rounded-2xl bg-zinc-950/90 border border-white/[0.08] text-xs gap-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center space-x-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "relative flex items-center justify-center"
  }, /*#__PURE__*/React.createElement("span", {
    className: `w-2.5 h-2.5 rounded-full ${tunnelInfo.active ? 'bg-cyan-400 animate-pulse' : 'bg-zinc-600'}`
  }), tunnelInfo.active && /*#__PURE__*/React.createElement("span", {
    className: "absolute w-4 h-4 rounded-full bg-cyan-400/30 animate-ping"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center space-x-2"
  }, /*#__PURE__*/React.createElement("span", {
    className: "font-semibold text-white"
  }, tunnelInfo.active ? 'Public Cloudflare Tunnel Active' : 'Local Network Mode'), tunnelInfo.active ? /*#__PURE__*/React.createElement("span", {
    className: "text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20"
  }, "Colab, Kaggle & WAN Ready") : /*#__PURE__*/React.createElement("span", {
    className: "text-[10px] text-zinc-500 font-mono"
  }, "LAN / Localhost only")), /*#__PURE__*/React.createElement("span", {
    className: "text-[11px] text-zinc-400 font-mono block mt-0.5"
  }, tunnelInfo.active ? tunnelInfo.url : `http://${window.location.host}`))), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center space-x-2 shrink-0 w-full sm:w-auto justify-end"
  }, tunnelInfo.active ? /*#__PURE__*/React.createElement("button", {
    onClick: handleStopTunnel,
    className: "px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-medium transition flex items-center space-x-1.5"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "stop",
    className: "w-3.5 h-3.5"
  }), /*#__PURE__*/React.createElement("span", null, "Stop Tunnel")) : /*#__PURE__*/React.createElement("button", {
    onClick: handleStartTunnel,
    disabled: isStartingTunnel,
    className: "px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-medium transition shadow-sm flex items-center space-x-1.5"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "refresh",
    className: `w-3.5 h-3.5 ${isStartingTunnel ? 'animate-spin' : ''}`
  }), /*#__PURE__*/React.createElement("span", null, isStartingTunnel ? 'Connecting Cloudflare...' : '🌐 Start Cloudflare Tunnel')))), (() => {
    const isTunnelActive = tunnelInfo.active && tunnelInfo.url;
    const activeBaseUrl = isTunnelActive ? tunnelInfo.url : `http://${window.location.host}`;
    const tok = currentTokenInfo?.token || 'YOUR_TOKEN';
    const cmd = `curl -sSL ${activeBaseUrl}/bootstrap.sh?token=${tok}${daemonMode ? ' | bash -s -- --daemon' : ' | bash'}`;
    const colabCmd = `!curl -sSL ${activeBaseUrl}/bootstrap.sh?token=${tok} | bash -s -- --daemon`;
    const activeDev = devices.find(d => d.status === 'ONLINE') || devices[0];
    const isClientOnline = activeDev?.status === 'ONLINE';
    return /*#__PURE__*/React.createElement("div", {
      className: "space-y-3"
    }, isTunnelActive && /*#__PURE__*/React.createElement("div", {
      className: "p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-zinc-900/60 to-cyan-500/10 border border-amber-500/30 space-y-2 text-xs"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-center justify-between"
    }, /*#__PURE__*/React.createElement("span", {
      className: "font-semibold text-amber-300 flex items-center space-x-1.5"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "zap",
      className: "w-3.5 h-3.5 text-amber-400"
    }), /*#__PURE__*/React.createElement("span", null, "Google Colab & Kaggle 1-Click Code Cell")), /*#__PURE__*/React.createElement("span", {
      className: "text-[10px] text-zinc-400 font-mono"
    }, "Shift+Enter in Colab")), /*#__PURE__*/React.createElement("div", {
      className: "flex items-center space-x-2 bg-black/60 p-2 rounded-xl border border-white/[0.06] font-mono text-xs text-amber-200"
    }, /*#__PURE__*/React.createElement("span", {
      className: "flex-1 select-all truncate pl-1"
    }, colabCmd), /*#__PURE__*/React.createElement("button", {
      onClick: () => {
        navigator.clipboard.writeText(colabCmd);
        setCopiedColab(true);
        setTimeout(() => setCopiedColab(false), 2000);
      },
      className: "px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg text-xs font-sans font-medium transition shrink-0 border border-amber-500/30"
    }, copiedColab ? 'Copied!' : 'Copy Colab Code'))), /*#__PURE__*/React.createElement("div", {
      className: "flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 bg-zinc-950/80 p-2.5 rounded-2xl border border-white/[0.1] font-mono text-xs text-indigo-300"
    }, /*#__PURE__*/React.createElement("span", {
      className: "flex-1 select-all truncate pl-2"
    }, cmd), /*#__PURE__*/React.createElement("div", {
      className: "flex items-center space-x-2 shrink-0"
    }, /*#__PURE__*/React.createElement("button", {
      onClick: handleGenerateNewToken,
      disabled: isGeneratingToken,
      className: "px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-xl text-xs font-sans font-medium transition shadow-sm flex items-center space-x-1.5 border border-white/[0.08]",
      title: "Generate a fresh enrollment token"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "refresh",
      className: `w-3.5 h-3.5 ${isGeneratingToken ? 'animate-spin' : ''}`
    }), /*#__PURE__*/React.createElement("span", null, "New Token")), /*#__PURE__*/React.createElement("button", {
      onClick: () => {
        navigator.clipboard.writeText(cmd);
        setCopiedQuick(true);
        setTimeout(() => setCopiedQuick(false), 2000);
      },
      className: "px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-sans font-medium transition shadow-sm flex items-center space-x-1.5"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: copiedQuick ? "check" : "copy",
      className: "w-3.5 h-3.5"
    }), /*#__PURE__*/React.createElement("span", null, copiedQuick ? 'Copied!' : 'Copy Command')))), /*#__PURE__*/React.createElement("div", {
      className: "flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-white/[0.04]"
    }, /*#__PURE__*/React.createElement("p", {
      className: "text-[11px] text-zinc-400"
    }, "Run the command in your edge terminal, or launch locally right from this browser:"), /*#__PURE__*/React.createElement("div", {
      className: "flex items-center space-x-2"
    }, isClientOnline ? /*#__PURE__*/React.createElement("button", {
      onClick: () => handleStopDevice(activeDev.device_id),
      className: "px-3 py-1 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-medium transition flex items-center space-x-1.5"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "stop",
      className: "w-3.5 h-3.5"
    }), /*#__PURE__*/React.createElement("span", null, "Stop Edge Client")) : /*#__PURE__*/React.createElement("button", {
      onClick: () => handleStartDevice(activeDev?.device_id || 'my-edge-device-6dec8a'),
      className: "px-3 py-1 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-medium transition flex items-center space-x-1.5"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "play",
      className: "w-3.5 h-3.5"
    }), /*#__PURE__*/React.createElement("span", null, "▶ Start Edge Client")), activeDev && /*#__PURE__*/React.createElement("button", {
      onClick: () => handlePurgeDevice(activeDev.device_id),
      className: "px-3 py-1 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-medium transition flex items-center space-x-1.5",
      title: "Stop microservices and completely wipe local data & databases"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "trash",
      className: "w-3.5 h-3.5"
    }), /*#__PURE__*/React.createElement("span", null, "Purge & Delete Data")))));
  })(), showQuickRef && /*#__PURE__*/React.createElement("div", {
    className: "p-4 rounded-2xl bg-zinc-950/70 border border-white/[0.06] space-y-3 animate-in fade-in duration-150"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-xs font-semibold text-zinc-300 uppercase tracking-wider"
  }, "Startup Guidelines & CLI Quick Reference"), /*#__PURE__*/React.createElement("span", {
    className: "text-[10px] text-zinc-500 font-mono"
  }, "Edge Platform v1.0")), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono"
  }, /*#__PURE__*/React.createElement("div", {
    className: "p-3 rounded-xl bg-zinc-900 border border-white/[0.06] space-y-1.5"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between text-zinc-400 font-sans font-semibold text-[11px]"
  }, /*#__PURE__*/React.createElement("span", null, "1. Cloud Fleet Server"), /*#__PURE__*/React.createElement("span", {
    className: "text-emerald-400"
  }, "Port 8080")), /*#__PURE__*/React.createElement("div", {
    className: "text-[11px] text-zinc-300 select-all bg-black/40 p-1.5 rounded border border-white/[0.04]"
  }, "node cloud_server/src/server.js")), /*#__PURE__*/React.createElement("div", {
    className: "p-3 rounded-xl bg-zinc-900 border border-white/[0.06] space-y-1.5"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between text-zinc-400 font-sans font-semibold text-[11px]"
  }, /*#__PURE__*/React.createElement("span", null, "2. Local SLM (Llama.cpp)"), /*#__PURE__*/React.createElement("span", {
    className: "text-purple-400"
  }, "Port 9931")), /*#__PURE__*/React.createElement("div", {
    className: "text-[11px] text-zinc-300 select-all bg-black/40 p-1.5 rounded border border-white/[0.04] truncate",
    title: "llama-server --host 127.0.0.1 --port 9931 -m data/models/qwen.gguf -c 1024 -t 4 --reasoning off"
  }, "llama-server -p 9931 --reasoning off")), /*#__PURE__*/React.createElement("div", {
    className: "p-3 rounded-xl bg-zinc-900 border border-white/[0.06] space-y-1.5"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between text-zinc-400 font-sans font-semibold text-[11px]"
  }, /*#__PURE__*/React.createElement("span", null, "3. Edge Client CLI"), /*#__PURE__*/React.createElement("span", {
    className: "text-cyan-400"
  }, "./edge-ctl")), /*#__PURE__*/React.createElement("div", {
    className: "text-[11px] text-zinc-300 select-all bg-black/40 p-1.5 rounded border border-white/[0.04]"
  }, "./edge-ctl [run | stop | purge]"))))), /*#__PURE__*/React.createElement("div", {
    className: "space-y-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between px-1"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center space-x-2"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "text-xs font-semibold text-zinc-400 uppercase tracking-wider"
  }, "Registered Fleet Hardware"), /*#__PURE__*/React.createElement("span", {
    className: "text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20"
  }, devices.length, " Unique Machine", devices.length === 1 ? '' : 's')), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center space-x-2"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setShowAddDeviceModal(true),
    className: "px-3 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs text-white font-medium shadow-sm transition flex items-center space-x-1.5 cursor-pointer"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "plus",
    className: "w-3.5 h-3.5"
  }), /*#__PURE__*/React.createElement("span", null, "+ Enroll Node")), /*#__PURE__*/React.createElement("button", {
    onClick: handlePruneDevices,
    className: "px-3 py-1 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs text-zinc-400 hover:text-white border border-white/[0.08] transition flex items-center space-x-1.5",
    title: "Prune duplicate or ghost hardware records"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "refresh",
    className: "w-3.5 h-3.5 text-zinc-400"
  }), /*#__PURE__*/React.createElement("span", null, "Prune Duplicates")))), devices.length === 0 ? /*#__PURE__*/React.createElement("div", {
    className: "p-10 rounded-3xl bg-zinc-950/60 border border-white/[0.06] text-center space-y-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "server",
    className: "w-5 h-5"
  })), /*#__PURE__*/React.createElement("div", {
    className: "space-y-1"
  }, /*#__PURE__*/React.createElement("h4", {
    className: "text-sm font-semibold text-white"
  }, "No Edge Devices Enrolled Yet"), /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-zinc-400 max-w-sm mx-auto"
  }, "Click \"+ Add Device\" to generate a secure enrollment command for Google Colab, Jetson, Raspberry Pi, or Linux IPCs.")), /*#__PURE__*/React.createElement("button", {
    onClick: () => setShowAddDeviceModal(true),
    className: "px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/30 inline-flex items-center space-x-2 transition cursor-pointer"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "plus",
    className: "w-3.5 h-3.5"
  }), /*#__PURE__*/React.createElement("span", null, "+ Add Your First Device"))) : /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
  }, devices.map(d => {
    const isOnline = d.status === 'ONLINE';
    const isStopped = d.status === 'STOPPED';
    return /*#__PURE__*/React.createElement("div", {
      key: d.device_id,
      className: "p-5 rounded-3xl bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.15] transition space-y-4 shadow-sm flex flex-col justify-between"
    }, /*#__PURE__*/React.createElement("div", {
      className: "space-y-3"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-start justify-between"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "flex items-center space-x-2"
    }, /*#__PURE__*/React.createElement("h4", {
      className: "font-semibold text-white text-sm"
    }, d.device_id), d.hardware_id && /*#__PURE__*/React.createElement("span", {
      className: "text-[9px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-white/[0.06]"
    }, "HW: ", d.hardware_id.slice(0, 8)), d.arch && /*#__PURE__*/React.createElement("span", {
      className: "text-[9px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
    }, d.arch)), /*#__PURE__*/React.createElement("div", {
      className: "flex items-center space-x-1.5 text-xs text-zinc-500 font-mono"
    }, /*#__PURE__*/React.createElement("span", null, d.hostname || 'edge-device'), d.board_model && /*#__PURE__*/React.createElement("span", {
      className: "text-[10px] text-zinc-400 font-sans truncate max-w-[160px]"
    }, "• ", d.board_model))), /*#__PURE__*/React.createElement("span", {
      className: `px-2.5 py-0.5 rounded-full text-[11px] font-medium flex items-center space-x-1.5 ${isOnline ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30' : isStopped ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30' : 'bg-zinc-800 text-zinc-400 border border-zinc-700'}`
    }, /*#__PURE__*/React.createElement("span", {
      className: `w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : isStopped ? 'bg-amber-400' : 'bg-zinc-500'}`
    }), /*#__PURE__*/React.createElement("span", null, d.status))), /*#__PURE__*/React.createElement("div", {
      className: "grid grid-cols-3 gap-2 p-3 rounded-2xl bg-zinc-950/60 border border-white/[0.04] text-center text-xs"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
      className: "text-[10px] text-zinc-500 block"
    }, "CPU"), /*#__PURE__*/React.createElement("span", {
      className: "font-mono text-zinc-300 font-semibold"
    }, d.telemetry ? Math.round(d.telemetry.cpu_usage_pct) : 0, "%")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
      className: "text-[10px] text-zinc-500 block"
    }, "Temp"), /*#__PURE__*/React.createElement("span", {
      className: "font-mono text-zinc-300 font-semibold"
    }, d.telemetry ? `${d.telemetry.temperature_c}°C` : '--')), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
      className: "text-[10px] text-zinc-500 block"
    }, "Memory"), /*#__PURE__*/React.createElement("span", {
      className: "font-mono text-zinc-300 font-semibold"
    }, d.telemetry ? `${Math.round(d.telemetry.ram_used_mb)}M` : '--'))), /*#__PURE__*/React.createElement("div", {
      className: "flex items-center justify-between text-xs pt-1 border-t border-white/[0.06]"
    }, /*#__PURE__*/React.createElement("span", {
      className: "text-zinc-500"
    }, "Active Model:"), /*#__PURE__*/React.createElement("span", {
      className: "text-indigo-300 font-medium"
    }, d.active_model || 'yolov8n-coco')), /*#__PURE__*/React.createElement("div", {
      className: "flex items-center justify-between text-[10px] text-zinc-500"
    }, /*#__PURE__*/React.createElement("span", null, "Heartbeat:"), /*#__PURE__*/React.createElement("span", {
      className: "font-mono text-zinc-400"
    }, d.seconds_ago ? `${d.seconds_ago}s ago` : 'live now'))), /*#__PURE__*/React.createElement("div", {
      className: "pt-3 border-t border-white/[0.06] flex items-center space-x-2"
    }, isOnline ? /*#__PURE__*/React.createElement("button", {
      onClick: () => handleStopDevice(d.device_id),
      className: "flex-1 py-1.5 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-medium flex items-center justify-center space-x-1.5 transition shadow-sm",
      title: "Stop microservices on this device"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "stop",
      className: "w-3.5 h-3.5"
    }), /*#__PURE__*/React.createElement("span", null, "Stop Client")) : /*#__PURE__*/React.createElement("button", {
      onClick: () => handleStartDevice(d.device_id),
      className: "flex-1 py-1.5 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-medium flex items-center justify-center space-x-1.5 transition shadow-sm",
      title: "Start edge microservices"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "play",
      className: "w-3.5 h-3.5"
    }), /*#__PURE__*/React.createElement("span", null, "Start Client")), /*#__PURE__*/React.createElement("button", {
      onClick: () => handlePurgeDevice(d.device_id),
      className: "py-1.5 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-medium flex items-center justify-center space-x-1.5 transition shadow-sm",
      title: "Stop microservices, wipe SQLite database, and purge from fleet"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "trash",
      className: "w-3.5 h-3.5"
    }), /*#__PURE__*/React.createElement("span", null, "Purge & Delete"))));
  }))), showAddDeviceModal && /*#__PURE__*/React.createElement("div", {
    className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-zinc-900 border border-white/[0.12] rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-150"
  }, /*#__PURE__*/React.createElement("div", {
    className: "p-5 border-b border-white/[0.08] flex items-center justify-between bg-zinc-950/60"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center space-x-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "server",
    className: "w-4 h-4"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    className: "font-semibold text-white text-sm"
  }, "Enroll New Edge Device"), /*#__PURE__*/React.createElement("p", {
    className: "text-[11px] text-zinc-400"
  }, "Generate a cryptographically secured one-line bootstrap command"))), /*#__PURE__*/React.createElement("button", {
    onClick: () => setShowAddDeviceModal(false),
    className: "text-zinc-500 hover:text-white text-sm p-1.5 rounded-lg hover:bg-white/[0.06] transition"
  }, "✕")), /*#__PURE__*/React.createElement("div", {
    className: "p-6 space-y-5 text-xs"
  }, /*#__PURE__*/React.createElement("div", {
    className: "space-y-2"
  }, /*#__PURE__*/React.createElement("label", {
    className: "text-[11px] font-semibold text-zinc-300 uppercase tracking-wider block"
  }, "1. Target Hardware Environment"), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-2 sm:grid-cols-4 gap-2"
  }, [{
    id: 'colab',
    label: 'Google Colab',
    sub: 'Kaggle / Cloud VM',
    icon: 'zap'
  }, {
    id: 'jetson',
    label: 'NVIDIA Jetson',
    sub: 'DeepStream / NVMM',
    icon: 'cpu'
  }, {
    id: 'rpi',
    label: 'Raspberry Pi',
    sub: 'ARM64 64-bit OS',
    icon: 'activity'
  }, {
    id: 'generic',
    label: 'Linux PC / IPC',
    sub: 'x86_64 Debian/RHEL',
    icon: 'server'
  }].map(p => /*#__PURE__*/React.createElement("button", {
    key: p.id,
    type: "button",
    onClick: () => setEnrollPlatform(p.id),
    className: `p-3 rounded-2xl border text-left transition flex flex-col justify-between cursor-pointer ${enrollPlatform === p.id ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md' : 'bg-zinc-950/60 border-white/[0.06] text-zinc-400 hover:text-white hover:border-white/[0.12]'}`
  }, /*#__PURE__*/React.createElement(Icon, {
    name: p.icon,
    className: `w-4 h-4 mb-2 ${enrollPlatform === p.id ? 'text-indigo-400' : 'text-zinc-500'}`
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "font-semibold text-xs truncate"
  }, p.label), /*#__PURE__*/React.createElement("div", {
    className: "text-[9px] text-zinc-500 truncate mt-0.5"
  }, p.sub)))))), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 sm:grid-cols-2 gap-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "space-y-1.5"
  }, /*#__PURE__*/React.createElement("label", {
    className: "text-[11px] font-semibold text-zinc-300 uppercase tracking-wider block"
  }, "2. Execution Mode"), /*#__PURE__*/React.createElement("div", {
    className: "flex rounded-xl bg-zinc-950 p-1 border border-white/[0.08]"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setDaemonMode(true),
    className: `flex-1 py-1.5 rounded-lg text-center font-medium transition cursor-pointer ${daemonMode ? 'bg-indigo-600 text-white shadow-sm' : 'text-zinc-400 hover:text-white'}`
  }, "Daemon (Background)"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setDaemonMode(false),
    className: `flex-1 py-1.5 rounded-lg text-center font-medium transition cursor-pointer ${!daemonMode ? 'bg-indigo-600 text-white shadow-sm' : 'text-zinc-400 hover:text-white'}`
  }, "Interactive Console"))), /*#__PURE__*/React.createElement("div", {
    className: "space-y-1.5"
  }, /*#__PURE__*/React.createElement("label", {
    className: "text-[11px] font-semibold text-zinc-300 uppercase tracking-wider block"
  }, "3. Device Label / Tag (Optional)"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    placeholder: "e.g. factory-camera-1",
    value: enrollTag,
    onChange: e => setEnrollTag(e.target.value),
    className: "w-full bg-zinc-950 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 font-mono"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "space-y-2 pt-1"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between"
  }, /*#__PURE__*/React.createElement("label", {
    className: "text-[11px] font-semibold text-zinc-300 uppercase tracking-wider"
  }, "Secure Enrollment Command"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: handleGenerateNewToken,
    disabled: isGeneratingToken,
    className: "text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center space-x-1 cursor-pointer"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "refresh",
    className: `w-3 h-3 ${isGeneratingToken ? 'animate-spin' : ''}`
  }), /*#__PURE__*/React.createElement("span", null, "Regenerate Fresh Token"))), (() => {
    const isTunnelActive = tunnelInfo.active && tunnelInfo.url;
    const activeBaseUrl = isTunnelActive ? tunnelInfo.url : `http://${window.location.host}`;
    const tok = currentTokenInfo?.token || 'YOUR_TOKEN';
    const flag = daemonMode ? ' | bash -s -- --daemon' : ' | bash';
    const fullCmd = enrollPlatform === 'colab' ? `!curl -sSL ${activeBaseUrl}/bootstrap.sh?token=${tok} | bash -s -- --daemon` : `curl -sSL ${activeBaseUrl}/bootstrap.sh?token=${tok}${flag}`;
    return /*#__PURE__*/React.createElement("div", {
      className: "space-y-2"
    }, /*#__PURE__*/React.createElement("div", {
      className: "p-3 bg-zinc-950 rounded-2xl border border-white/[0.1] font-mono text-xs text-indigo-300 select-all break-all relative group"
    }, fullCmd), /*#__PURE__*/React.createElement("div", {
      className: "flex items-center justify-between gap-2 pt-1"
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-[10px] text-zinc-500 font-mono flex items-center space-x-1.5"
    }, /*#__PURE__*/React.createElement("span", {
      className: "w-1.5 h-1.5 rounded-full bg-emerald-400"
    }), /*#__PURE__*/React.createElement("span", null, "Valid 24h • Auto-registers hardware ID & starts edge daemon")), /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: () => {
        navigator.clipboard.writeText(fullCmd);
        setCopiedQuick(true);
        setTimeout(() => setCopiedQuick(false), 2000);
        showToast('success', 'Enrollment command copied to clipboard!');
      },
      className: "px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition shadow-sm flex items-center space-x-1.5 shrink-0 cursor-pointer"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: copiedQuick ? "check" : "copy",
      className: "w-3.5 h-3.5"
    }), /*#__PURE__*/React.createElement("span", null, copiedQuick ? 'Copied to Clipboard!' : 'Copy Command'))));
  })())), /*#__PURE__*/React.createElement("div", {
    className: "p-4 bg-zinc-950/80 border-t border-white/[0.06] flex items-center justify-between text-xs"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-[11px] text-zinc-500 font-mono"
  }, "Single binary ELF • Zero Python • Anti-Collision Identity"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setShowAddDeviceModal(false),
    className: "px-4 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 transition cursor-pointer"
  }, "Done"))))), activeTab === 'catalog' && /*#__PURE__*/React.createElement("div", {
    className: "space-y-6"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    className: "text-sm font-semibold text-white"
  }, "Model Catalog & Registry"), /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-zinc-400 mt-0.5"
  }, "Pre-curated public models and proprietary user-uploaded weights.")), /*#__PURE__*/React.createElement("button", {
    onClick: () => setShowUploadModal(true),
    className: "px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition shadow-sm flex items-center space-x-2"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "upload",
    className: "w-3.5 h-3.5"
  }), /*#__PURE__*/React.createElement("span", null, "+ Upload Custom Model"))), showUploadModal && /*#__PURE__*/React.createElement("div", {
    className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-zinc-900 border border-white/[0.12] rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-150"
  }, /*#__PURE__*/React.createElement("div", {
    className: "p-4 border-b border-white/[0.08] flex items-center justify-between"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "font-semibold text-white text-sm"
  }, "Upload Custom Model Weights"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setShowUploadModal(false),
    className: "text-zinc-500 hover:text-white text-sm p-1"
  }, "✕")), /*#__PURE__*/React.createElement("form", {
    onSubmit: handleUploadModel,
    className: "p-5 space-y-4 text-xs"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-zinc-300 mb-1 font-medium"
  }, "Model Name"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    required: true,
    placeholder: "e.g. Worker Safety PPE Detector",
    value: uploadName,
    onChange: e => setUploadName(e.target.value),
    className: "w-full bg-zinc-950 border border-white/[0.1] rounded-xl px-3 py-2 text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
  })), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-2 gap-3"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-zinc-300 mb-1 font-medium"
  }, "Modality"), /*#__PURE__*/React.createElement("select", {
    value: uploadModality,
    onChange: e => setUploadModality(e.target.value),
    className: "w-full bg-zinc-950 border border-white/[0.1] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
  }, /*#__PURE__*/React.createElement("option", {
    value: "Vision"
  }, "Vision (ONNX)"), /*#__PURE__*/React.createElement("option", {
    value: "Vibration"
  }, "Vibration (1D-CNN)"), /*#__PURE__*/React.createElement("option", {
    value: "Audio"
  }, "Audio (Acoustic)"), /*#__PURE__*/React.createElement("option", {
    value: "Text"
  }, "Text (GGUF SLM)"))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-zinc-300 mb-1 font-medium"
  }, "Model File (.onnx / .gguf)"), /*#__PURE__*/React.createElement("input", {
    type: "file",
    required: true,
    onChange: e => setUploadFile(e.target.files[0]),
    className: "w-full text-zinc-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:bg-zinc-800 file:text-white hover:file:bg-zinc-700 cursor-pointer"
  }))), uploadModality === 'Vision' && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-zinc-300 mb-1 font-medium"
  }, "Custom Class Labels (Comma Separated)"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    placeholder: "e.g. hardhat, safety_vest, person, boots",
    value: uploadClasses,
    onChange: e => setUploadClasses(e.target.value),
    className: "w-full bg-zinc-950 border border-white/[0.1] rounded-xl px-3 py-2 text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
  }), /*#__PURE__*/React.createElement("span", {
    className: "text-[10px] text-zinc-500 mt-1 block"
  }, "Leave empty to use automatic COCO-80 labels or generic class_0, class_1 mapping.")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-zinc-300 mb-1 font-medium"
  }, "Description"), /*#__PURE__*/React.createElement("textarea", {
    rows: "2",
    placeholder: "Purpose and deployment scenarios for this model...",
    value: uploadDescription,
    onChange: e => setUploadDescription(e.target.value),
    className: "w-full bg-zinc-950 border border-white/[0.1] rounded-xl px-3 py-2 text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
  })), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-end space-x-2 pt-2 border-t border-white/[0.08]"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setShowUploadModal(false),
    className: "px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium"
  }, "Cancel"), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    disabled: isUploading,
    className: "px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium disabled:opacity-50"
  }, isUploading ? 'Uploading...' : 'Upload & Register'))))), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
  }, catalog.map(m => /*#__PURE__*/React.createElement("div", {
    key: m.model_id,
    className: "p-5 rounded-3xl bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.18] transition flex flex-col justify-between space-y-4 shadow-sm group"
  }, /*#__PURE__*/React.createElement("div", {
    className: "space-y-2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-start justify-between"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-9 h-9 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center group-hover:scale-105 transition"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: m.modality === 'Vision' ? 'video' : m.modality === 'Text' ? 'brain' : 'zap',
    className: "w-4 h-4"
  })), /*#__PURE__*/React.createElement("span", {
    className: "px-2.5 py-0.5 rounded-full bg-white/[0.06] text-zinc-300 text-[10px] font-mono border border-white/[0.05]"
  }, m.format, " • ", m.size_mb, " MB")), /*#__PURE__*/React.createElement("h4", {
    className: "font-semibold text-white text-sm"
  }, m.name), /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-zinc-400 leading-relaxed line-clamp-2"
  }, m.description)), /*#__PURE__*/React.createElement("div", {
    className: "pt-2 border-t border-white/[0.06] flex items-center justify-between"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-[10px] font-mono text-zinc-500 truncate max-w-[120px]"
  }, m.model_id), /*#__PURE__*/React.createElement("button", {
    onClick: () => handleDeployModel(m.model_id),
    className: "px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white text-zinc-300 hover:text-black text-xs font-medium transition"
  }, "Deploy to Fleet")))))), activeTab === 'security' && /*#__PURE__*/React.createElement("div", {
    className: "space-y-6 max-w-4xl"
  }, /*#__PURE__*/React.createElement("div", {
    className: "p-5 rounded-3xl bg-white/[0.02] border border-white/[0.06] space-y-1"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "text-sm font-semibold text-white"
  }, "Edge Fleet Cryptographic Security"), /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-zinc-400"
  }, "Zero-Trust hardware attestation, AEAD payload encryption, and tamper resistance.")), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 md:grid-cols-2 gap-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "p-5 rounded-3xl bg-white/[0.03] border border-white/[0.08] space-y-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center space-x-2.5"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "shield",
    className: "w-4 h-4"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h4", {
    className: "text-xs font-semibold text-white"
  }, "In-Flight AEAD Encryption"), /*#__PURE__*/React.createElement("span", {
    className: "text-[10px] text-emerald-400 font-mono"
  }, "AES-256-GCM / ChaCha20"))), /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-zinc-400 leading-relaxed"
  }, "All telemetry packets, sensor buffers, and diagnostic outputs are sealed in an authenticated envelope prior to network transmission."), /*#__PURE__*/React.createElement("div", {
    className: "p-2 rounded-xl bg-zinc-950 font-mono text-[11px] text-zinc-300 border border-white/[0.04]"
  }, "Status: 🔒 Active (Zero-Overhead SIMD)")), /*#__PURE__*/React.createElement("div", {
    className: "p-5 rounded-3xl bg-white/[0.03] border border-white/[0.08] space-y-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center space-x-2.5"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "zap",
    className: "w-4 h-4"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h4", {
    className: "text-xs font-semibold text-white"
  }, "Anti-Tamper Message Signing"), /*#__PURE__*/React.createElement("span", {
    className: "text-[10px] text-indigo-400 font-mono"
  }, "HMAC-SHA256 Signatures"))), /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-zinc-400 leading-relaxed"
  }, "Every edge packet includes a cryptographic message authentication code. Any man-in-the-middle bit tampering causes immediate rejection."), /*#__PURE__*/React.createElement("div", {
    className: "p-2 rounded-xl bg-zinc-950 font-mono text-[11px] text-zinc-300 border border-white/[0.04]"
  }, "Verification: 🔑 100% Packets Authenticated")), /*#__PURE__*/React.createElement("div", {
    className: "p-5 rounded-3xl bg-white/[0.03] border border-white/[0.08] space-y-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center space-x-2.5"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-8 h-8 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "cpu",
    className: "w-4 h-4"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h4", {
    className: "text-xs font-semibold text-white"
  }, "WASM Memory Isolation"), /*#__PURE__*/React.createElement("span", {
    className: "text-[10px] text-violet-400 font-mono"
  }, "Wasmtime 64KB Sandbox"))), /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-zinc-400 leading-relaxed"
  }, "Dynamic rules execute in private 64KB linear memory with no raw OS, filesystem, or socket access granted to untrusted guest code."), /*#__PURE__*/React.createElement("div", {
    className: "p-2 rounded-xl bg-zinc-950 font-mono text-[11px] text-zinc-300 border border-white/[0.04]"
  }, "Sandbox: 🛡️ Hardware Enforced Memory Boundaries")), /*#__PURE__*/React.createElement("div", {
    className: "p-5 rounded-3xl bg-white/[0.03] border border-white/[0.08] space-y-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center space-x-2.5"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "server",
    className: "w-4 h-4"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h4", {
    className: "text-xs font-semibold text-white"
  }, "Atomic Model Verification"), /*#__PURE__*/React.createElement("span", {
    className: "text-[10px] text-amber-400 font-mono"
  }, "SHA-256 + rename(2)"))), /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-zinc-400 leading-relaxed"
  }, "Downloaded weights are verified against the cryptographic cloud manifest before executing atomic POSIX staging to guarantee zero corruption."), /*#__PURE__*/React.createElement("div", {
    className: "p-2 rounded-xl bg-zinc-950 font-mono text-[11px] text-zinc-300 border border-white/[0.04]"
  }, "Integrity: ✅ Verified Staging Pipeline"))))), showTerminalDrawer && /*#__PURE__*/React.createElement("div", {
    className: "fixed bottom-0 left-0 right-0 z-50 bg-zinc-950/95 backdrop-blur-xl border-t border-white/[0.12] shadow-2xl p-4 transition-all duration-300 max-h-[380px] flex flex-col font-mono text-xs"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between pb-3 border-b border-white/[0.08] mb-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center space-x-2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"
  }), /*#__PURE__*/React.createElement("span", {
    className: "font-semibold text-white tracking-wide"
  }, "Edge Diagnostic Shell"), /*#__PURE__*/React.createElement("span", {
    className: "text-[10px] px-2 py-0.5 rounded-full bg-white/[0.06] text-zinc-400"
  }, "Whitelisted Commands")), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center space-x-2"
  }, ['free -h', 'df -h', 'uptime', 'v4l2-ctl --list-devices', './edge-ctl status'].map(cmd => /*#__PURE__*/React.createElement("button", {
    key: cmd,
    onClick: () => handleExecuteTerminalCommand(cmd),
    disabled: isExecutingCommand,
    className: "px-2 py-1 rounded bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 text-[11px] border border-white/[0.06] transition"
  }, cmd)), /*#__PURE__*/React.createElement("button", {
    onClick: () => setShowTerminalDrawer(false),
    className: "p-1 rounded text-zinc-400 hover:text-white"
  }, "✕"))), /*#__PURE__*/React.createElement("div", {
    className: "flex-1 overflow-y-auto space-y-2 max-h-[200px] bg-black/60 p-3 rounded-xl border border-white/[0.06] text-zinc-300 font-mono text-[11px]"
  }, terminalHistory.map((item, idx) => /*#__PURE__*/React.createElement("div", {
    key: idx,
    className: "space-y-0.5"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center space-x-2 text-cyan-400"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-zinc-500"
  }, item.time), /*#__PURE__*/React.createElement("span", null, "edge-node$"), /*#__PURE__*/React.createElement("span", {
    className: "font-semibold"
  }, item.cmd)), /*#__PURE__*/React.createElement("pre", {
    className: "text-zinc-300 whitespace-pre-wrap pl-4 border-l border-zinc-800"
  }, item.output)))), /*#__PURE__*/React.createElement("form", {
    onSubmit: e => {
      e.preventDefault();
      handleExecuteTerminalCommand();
    },
    className: "flex items-center space-x-2 mt-3"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-cyan-400 font-bold"
  }, "$"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: terminalCommand,
    onChange: e => setTerminalCommand(e.target.value),
    placeholder: "Enter command (e.g. free -h, df -h, uptime, v4l2-ctl --list-devices)...",
    className: "flex-1 bg-zinc-900 border border-white/[0.1] rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
  }), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    disabled: isExecutingCommand,
    className: "px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-black font-semibold rounded-lg text-xs transition"
  }, isExecutingCommand ? 'Executing...' : 'Run'))));
}

// Mount React Root
const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(/*#__PURE__*/React.createElement(App, null));
}