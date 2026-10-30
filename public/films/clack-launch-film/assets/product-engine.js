let filmSeed=297782;function filmRandom(){filmSeed=(Math.imul(1664525,filmSeed)+1013904223)>>>0;return filmSeed/4294967296;}

    /*************************************************************************
     * 1. WEB AUDIO API PROCEDURAL MECHANICAL SOUND ENGINE (ZERO EXTERNAL URLS)
     *************************************************************************/
    class TypewriterAudioEngine {
      constructor() {
        this.ctx = null;
        this.enabled = true;
        this.noiseBuffer = null;
      }

      init() {
        if (!this.ctx) {
          const AudioCtx = window.AudioContext || window.webkitAudioContext;
          this.ctx = new AudioCtx();
          const bufferSize = this.ctx.sampleRate * 1.5;
          this.noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
          const data = this.noiseBuffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
            data[i] = filmRandom() * 2 - 1;
          }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
          this.ctx.resume();
        }
      }

      // Crisp Typebar Hammer Strike on Cotton Paper & Rubber Platen
      playKeyClack(pitchVariance = 1) {
        if (!this.enabled) return;
        this.init();
        const now = this.ctx.currentTime;
        const rand = (0.94 + filmRandom() * 0.12) * pitchVariance;

        // 1. High-impact paper & ribbon snap
        const noise = this.ctx.createBufferSource();
        noise.buffer = this.noiseBuffer;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(2400 * rand, now);
        filter.Q.setValueAtTime(2.3, now);

        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.46, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.002, now + 0.025);

        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(this.ctx.destination);
        noise.start(now);
        noise.stop(now + 0.027);

        // 2. Metallic typebar linkage transient click
        const metalOsc = this.ctx.createOscillator();
        metalOsc.type = 'triangle';
        metalOsc.frequency.setValueAtTime(1320 * rand, now);
        metalOsc.frequency.exponentialRampToValueAtTime(290 * rand, now + 0.017);

        const metalGain = this.ctx.createGain();
        metalGain.gain.setValueAtTime(0.24, now);
        metalGain.gain.exponentialRampToValueAtTime(0.001, now + 0.018);

        metalOsc.connect(metalGain);
        metalGain.connect(this.ctx.destination);
        metalOsc.start(now);
        metalOsc.stop(now + 0.02);

        // 3. Satin cast-iron body low thud
        const bodyOsc = this.ctx.createOscillator();
        bodyOsc.type = 'sine';
        bodyOsc.frequency.setValueAtTime(155 * rand, now);
        bodyOsc.frequency.exponentialRampToValueAtTime(46, now + 0.055);

        const bodyGain = this.ctx.createGain();
        bodyGain.gain.setValueAtTime(0.35, now);
        bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.058);

        bodyOsc.connect(bodyGain);
        bodyGain.connect(this.ctx.destination);
        bodyOsc.start(now);
        bodyOsc.stop(now + 0.06);
      }

      // Crisp light mechanical linkage tick during Pinyin composition (feels tactile!)
      playPinyinKeyTick() {
        if (!this.enabled) return;
        this.init();
        const now = this.ctx.currentTime;
        const rand = 0.95 + filmRandom() * 0.1;

        const noise = this.ctx.createBufferSource();
        noise.buffer = this.noiseBuffer;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1950 * rand, now);
        filter.Q.setValueAtTime(3.0, now);

        const nGain = this.ctx.createGain();
        nGain.gain.setValueAtTime(0.22, now);
        nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.016);

        noise.connect(filter);
        filter.connect(nGain);
        nGain.connect(this.ctx.destination);
        noise.start(now);
        noise.stop(now + 0.018);

        const osc = this.ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(820 * rand, now);
        osc.frequency.exponentialRampToValueAtTime(210, now + 0.018);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.14, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.022);
      }

      // Hollow Spacebar Thud
      playSpacebar() {
        if (!this.enabled) return;
        this.init();
        const now = this.ctx.currentTime;
        const rand = 0.96 + filmRandom() * 0.08;

        const osc = this.ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(125 * rand, now);
        osc.frequency.exponentialRampToValueAtTime(42, now + 0.075);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.44, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.085);

        const noise = this.ctx.createBufferSource();
        noise.buffer = this.noiseBuffer;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1050, now);

        const nGain = this.ctx.createGain();
        nGain.gain.setValueAtTime(0.2, now);
        nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

        noise.connect(filter);
        filter.connect(nGain);
        nGain.connect(this.ctx.destination);
        noise.start(now);
        noise.stop(now + 0.03);
      }

      // Backspace Escapement Step Click
      playBackspace() {
        if (!this.enabled) return;
        this.init();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(760, now);
        osc.frequency.exponentialRampToValueAtTime(310, now + 0.022);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.16, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.026);
      }

      // Vintage Brass Margin Bell ("DING!")
      playMarginBell() {
        if (!this.enabled) return;
        this.init();
        const now = this.ctx.currentTime;
        const freqs = [2480, 5140, 7720, 10200];
        const amps  = [0.28, 0.14, 0.07, 0.03];
        const decays = [1.28, 0.75, 0.45, 0.22];

        freqs.forEach((f, idx) => {
          const osc = this.ctx.createOscillator();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, now);

          const gain = this.ctx.createGain();
          gain.gain.setValueAtTime(0.001, now);
          gain.gain.linearRampToValueAtTime(amps[idx], now + 0.004);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + decays[idx]);

          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + decays[idx] + 0.02);
        });
      }

      // Carriage Return Ratchet Zip + Stop Clunk
      playCarriageReturn(distanceCols = 25) {
        if (!this.enabled) return;
        this.init();
        const now = this.ctx.currentTime;
        const clicks = Math.max(6, Math.min(18, Math.floor(distanceCols * 0.45)));
        const duration = 0.24;

        for (let i = 0; i < clicks; i++) {
          const t = now + (i / clicks) * duration;
          const osc = this.ctx.createOscillator();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(1180 + i * 35, t);
          osc.frequency.exponentialRampToValueAtTime(440, t + 0.009);

          const gain = this.ctx.createGain();
          gain.gain.setValueAtTime(0.09, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.01);

          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(t);
          osc.stop(t + 0.011);
        }

        const stopTime = now + duration;
        const stopOsc = this.ctx.createOscillator();
        stopOsc.type = 'sine';
        stopOsc.frequency.setValueAtTime(135, stopTime);
        stopOsc.frequency.exponentialRampToValueAtTime(42, stopTime + 0.075);

        const stopGain = this.ctx.createGain();
        stopGain.gain.setValueAtTime(0.38, stopTime);
        stopGain.gain.exponentialRampToValueAtTime(0.001, stopTime + 0.08);

        stopOsc.connect(stopGain);
        stopGain.connect(this.ctx.destination);
        stopOsc.start(stopTime);
        stopOsc.stop(stopTime + 0.085);
      }

      // Paper Tear / Eject Sound
      playPaperTear() {
        if (!this.enabled) return;
        this.init();
        const now = this.ctx.currentTime;
        const noise = this.ctx.createBufferSource();
        noise.buffer = this.noiseBuffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(900, now);
        filter.frequency.exponentialRampToValueAtTime(2800, now + 0.26);
        filter.Q.setValueAtTime(1.8, now);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.32, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        noise.start(now);
        noise.stop(now + 0.3);
      }
    }

    const soundEngine = new TypewriterAudioEngine();

    /*************************************************************************
     * 2. LITERARY CLASSICS QUOTES, BUILT-IN PINYIN DICTIONARY & VIDEO KEYBOARD
     *************************************************************************/
    const LITERARY_QUOTES = [
      {
        id: 'video-original',
        title: 'Clack 原版 (视频 00:03 同款段落)',
        text: 'every key you press lands on real paper and every mistake stays where you made it'
      },
      {
        id: 'chinese-writing',
        title: '作家箴言 · 落笔无悔（支持纸面实时拼音）',
        text: '落笔无悔，每一声清脆的敲击都是思想落在纸上的重量。'
      },
      {
        id: 'luxun',
        title: '鲁迅 · 《野草·秋夜》（中文跟打）',
        text: '在我的后园，可以看见墙外有两株树，一株是枣树，还有一株也是枣树。'
      },
      {
        id: 'hemingway',
        title: 'Ernest Hemingway · 真实之句',
        text: 'There is nothing to writing. All you do is sit down at a typewriter and bleed one true sentence.'
      }
    ];

    // Built-in Pinyin Engine Dictionary so users can test On-Paper Pinyin immediately
    // even if their OS keyboard is currently in English!
    const BUILTIN_PINYIN_DICT = {
      'luobi': ['落笔', '落笔无悔'],
      'wuhui': ['无悔', '无回'],
      'luobiwuhui': ['落笔无悔'],
      'chunfeng': ['春风', '春风十里'],
      'shili': ['十里', '实力', '事例'],
      'xiezuo': ['写作', '协作'],
      'daziji': ['打字机'],
      'zhi': ['纸', '之', '只', '知', '至'],
      'shang': ['上', '尚', '伤'],
      'si': ['思', '似', '四', '丝'],
      'xiang': ['想', '向', '像', '响'],
      'siwei': ['思维', '四围'],
      'sixiang': ['思想', '思乡'],
      'zhongliang': ['重量', '中梁'],
      'qingcui': ['清脆', '青翠'],
      'qiaoji': ['敲击', '巧计'],
      'meiyisheng': ['每一声'],
      'shijie': ['世界', '时间', '视觉'],
      'shijian': ['时间', '事件', '实践'],
      'women': ['我们'],
      'nihao': ['你好'],
      'zuojia': ['作家', '作假'],
      'shougao': ['手稿', '收稿'],
      'wenzi': ['文字', '蚊子'],
      'rensheng': ['人生', '人声'],
      'ye': ['夜', '也', '页', '叶'],
      'guang': ['光', '广'],
      'meng': ['梦', '猛'],
      'xin': ['心', '新', '信'],
      'ai': ['爱', '挨'],
      'mei': ['每', '美', '没'],
      'yi': ['一', '以', '已', '意'],
      'sheng': ['声', '生', '省'],
      'de': ['的', '地', '得'],
      'shi': ['是', '时', '事', '诗', '十'],
      'zai': ['在', '再', '载'],
      'wo': ['我', '握'],
      'ni': ['你', '泥', '逆'],
      'ta': ['他', '她', '它', '踏'],
      'he': ['和', '河', '喝'],
      'you': ['有', '又', '由', '友'],
      'бу': ['不'],
      'bu': ['不', '步', '部'],
      'ke': ['可', '刻', '客'],
      'kan': ['看', '刊'],
      'jian': ['见', '间', '件'],
      'shu': ['树', '书', '数'],
      'zaoshu': ['枣树'],
      'houyuan': ['后园', '后院'],
      'qiangwai': ['墙外']
    };

    // Exact 4 Character Rows from the Reference Video + Row 5 Spacebar
    // Notice the exact video burnt-orange accent keys: E, I (Row 2), F (Row 3), C (Row 4)
    const VIDEO_KEYBOARD_ROWS = [
      {
        rowIndex: 0,
        keys: [
          { id: '1', label: '1' },
          { id: '2', label: '2' },
          { id: '3', label: '3' },
          { id: '4', label: '4' },
          { id: '5', label: '5' },
          { id: '6', label: '6' },
          { id: '7', label: '7' },
          { id: '8', label: '8' },
          { id: '9', label: '9' },
          { id: '0', label: '0' },
          { id: '-', label: '-' }, { id: 'bksp', label: '⌫' }
        ]
      },
      {
        rowIndex: 1,
        keys: [
          { id: 'q', label: 'Q' },
          { id: 'w', label: 'W' },
          { id: 'e', label: 'E', accent: true }, // Video Burnt-Orange Accent Key!
          { id: 'r', label: 'R' },
          { id: 't', label: 'T' },
          { id: 'y', label: 'Y' },
          { id: 'u', label: 'U' },
          { id: 'i', label: 'I', accent: true }, // Video Burnt-Orange Accent Key!
          { id: 'o', label: 'O' },
          { id: 'p', label: 'P' },
          { id: '[', label: '[' }, { id: ']', label: ']' }
        ]
      },
      {
        rowIndex: 2,
        keys: [
          { id: 'caps', label: '⇪' }, { id: 'a', label: 'A' },
          { id: 's', label: 'S' },
          { id: 'd', label: 'D' },
          { id: 'f', label: 'F', accent: true }, // Video Burnt-Orange Accent Key!
          { id: 'g', label: 'G' },
          { id: 'h', label: 'H' },
          { id: 'j', label: 'J' },
          { id: 'k', label: 'K' },
          { id: 'l', label: 'L' },
          { id: ';', label: ';' },
          { id: "'", label: "'" }
        ]
      },
      {
        rowIndex: 3,
        keys: [
          { id: 'shift_l', label: 'SHIFT', pill: true },
          { id: 'z', label: 'Z' },
          { id: 'x', label: 'X' },
          { id: 'c', label: 'C', accent: true }, // Video Burnt-Orange Accent Key!
          { id: 'v', label: 'V' },
          { id: 'b', label: 'B' },
          { id: 'n', label: 'N' },
          { id: 'm', label: 'M' },
          { id: ',', label: ',' },
          { id: '.', label: '.' },
          { id: '/', label: '/' },
          { id: 'shift_r', label: 'SHIFT', pill: true }
        ]
      }
    ];

    /*************************************************************************
     * 3. CORE APPLICATION, ON-PAPER PINYIN IME & PAPER MATRIX STATE
     *************************************************************************/
    const MAX_COLS_PER_LINE = 34; // 34 crisp columns per line
    const BELL_WARN_COL = 28;     // Rings brass bell 6 columns before right margin

    const state = {
      mode: 'practice',           // 'practice' | 'freewrite'
      heroVisible: true,
      tornCardVisible: false,
      ribbonColor: 'black',       // 'black' | 'red'
      typoMode: 'erase',     // 'overstrike' | 'tape' | 'erase'

      // Live On-Paper Pinyin IME State (Supports both OS IME and Built-in Paper Pinyin)
      virtualShift: false,
      virtualCaps: false,
      builtinPinyinEnabled: false,
      isComposingIME: false,
      imeVisualRaw: '',
      imePhysicalPending: null,
      imeVisualTimers: [],
      compositionText: '',        // Rendered LIVE on the 3D paper at the cursor position!
      pinyinCandidates: [],
      pendingCompositionEcho: null,
      queueTimer: null,
      sessionId: 0,
      stampQueue: [],
      isProcessingQueue: false,
      demoTimer: null,

      // Multi-Line Paper Matrix (Generous 94px line spacing -> never crowds or overlaps!)
      // Each cell: { colWidth: 1|2, layers: [{ char, color, dx, dy, rot, alpha, isTape, isTypo }] }
      lines: [[]],
      currentLineIdx: 0,
      currentColPos: 0,
      manualScrollOffset: 0,
      bellRangOnCurrentLine: false,
      paperEjectProgress: 0,

      // Practice Mode Stats
      selectedQuoteIdx: 0,
      practiceTargetText: LITERARY_QUOTES[0].text,
      practiceCursorIdx: 0,
      practiceCharStates: [],
      practiceStartTime: null,
      practiceTotalKeystrokes: 0,
      practiceTyposCount: 0,
      overstrikeCount: 0,

      // Saved Archive
      archive: []
    };

    const graphemes = new Intl.Segmenter('zh', { granularity: 'grapheme' });
    function splitCharacters(text) { return Array.from(graphemes.segment(text), x => x.segment); }
    function getCharColWidth(ch) {
      return /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}\p{Extended_Pictographic}\u3000-\u303f\uff00-\uffef—…“”‘’]/u.test(ch) ? 2 : 1;
    }
    function cancelPendingInput() {
      state.imeVisualTimers.forEach(clearTimeout);state.imeVisualTimers=[];
      state.imeVisualRaw='';state.imePhysicalPending=null;state.virtualShift=false;
      clearTimeout(state.queueTimer);
      state.queueTimer = null;
      state.stampQueue = [];
      state.isProcessingQueue = false;
      state.sessionId++;
      state.isComposingIME = false;
      state.pendingCompositionEcho = null;
      state.compositionText = '';
      const input = document.getElementById('imeInput');
      if (input) input.value = '';
      document.getElementById('stampQueueBadge').classList.add('hidden');
      document.getElementById('imeCandidateBar').classList.add('hidden');
    }
    function flushStampQueue() {
      clearTimeout(state.queueTimer);
      state.isProcessingQueue = false;
      while (state.stampQueue.length) applyQueuedAction(state.stampQueue.shift());
      document.getElementById('stampQueueBadge').classList.add('hidden');
    }

    // Format raw Pinyin string with syllable spaces for clean on-paper preview
    function formatPinyinPreview(raw) {
      if (!raw) return '';
      return raw.replace(/([a-z]+?)(?=[jqxzhchshbpdtnlgkhzcsr][aeiouv])/gi, '$1 ');
    }

    function computeBuiltinPinyinCandidates(rawPinyin) {
      const clean = (rawPinyin || '').toLowerCase().replace(/[^a-z]/g, '');
      if (!clean) return [];
      const exact = BUILTIN_PINYIN_DICT[clean] ? [...BUILTIN_PINYIN_DICT[clean]] : [];

      // Also match prefix or compound combinations
      Object.keys(BUILTIN_PINYIN_DICT).forEach((k) => {
        if (k.startsWith(clean) && k !== clean) {
          BUILTIN_PINYIN_DICT[k].forEach((word) => {
            if (!exact.includes(word)) exact.push(word);
          });
        }
      });

      // Fallback single syllable lookup
      if (exact.length === 0) {
        for (let len = Math.min(6, clean.length); len >= 1; len--) {
          const sub = clean.slice(0, len);
          if (BUILTIN_PINYIN_DICT[sub]) {
            exact.push(...BUILTIN_PINYIN_DICT[sub]);
            break;
          }
        }
      }

      // Always include the raw English letters as final candidate so user can type English too
      if (!exact.includes(rawPinyin)) {
        exact.push(rawPinyin);
      }
      return exact.slice(0, 5);
    }

    /*************************************************************************
     * 4. ULTRA-CRISP 2048×2600 PAPER CANVAS RENDERER
     *    - Generous 94px physical LINE_HEIGHT (2.14x spacing) -> ZERO crowding!
     *    - Renders LIVE Pinyin IME Composition String directly on the 3D paper!
     *************************************************************************/
    const PAPER_CANVAS_W = 2048;
    const PAPER_CANVAS_H = 2600;
    const PAPER_LEFT_MARGIN = 190;
    const PAPER_COL_PX = 48;        // 1 column = 48px, 2 columns (CJK) = 96px
    const PAPER_LINE_HEIGHT = 96;   // Generous 96px vertical line spacing! Never crowds!
    const STRIKE_BASELINE_Y = 2280; // Positioned right above V-guide and below chrome bail bar

    let paperCanvas = null;
    let paperCtx = null;
    let paperTexture3D = null;

    function initHighResPaperCanvas() {
      paperCanvas = document.createElement('canvas');
      paperCanvas.width = PAPER_CANVAS_W;
      paperCanvas.height = PAPER_CANVAS_H;
      paperCtx = paperCanvas.getContext('2d');
      renderHighResPaperCanvas();
    }

    function renderHighResPaperCanvas() {
      if (!paperCtx) return;
      const ctx = paperCtx;

      // 1. Warm Cream Cotton Paper Base (#FBF9F3)
      ctx.fillStyle = '#FBF9F3';
      ctx.fillRect(0, 0, PAPER_CANVAS_W, PAPER_CANVAS_H);

      // Subtle lateral cylindrical shading & natural paper grain
      const grad = ctx.createLinearGradient(0, 0, PAPER_CANVAS_W, 0);
      grad.addColorStop(0, 'rgba(205, 198, 182, 0.30)');
      grad.addColorStop(0.05, 'rgba(255, 255, 255, 0)');
      grad.addColorStop(0.95, 'rgba(255, 255, 255, 0)');
      grad.addColorStop(1, 'rgba(205, 198, 182, 0.30)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, PAPER_CANVAS_W, PAPER_CANVAS_H);

      const effectiveBottomLine = Math.max(0, state.currentLineIdx - state.manualScrollOffset);
      const maxVisibleLinesAbove = 9;
      const startLineIdx = Math.max(0, effectiveBottomLine - maxVisibleLinesAbove);

      // 2. Render Each Line with Generous 96px Vertical Spacing (Zero Overlapping!)
      for (let lineIndex = startLineIdx; lineIndex <= effectiveBottomLine; lineIndex++) {
        const lineCells = state.lines[lineIndex] || [];
        const linesAboveActive = effectiveBottomLine - lineIndex;
        const baselineY = STRIKE_BASELINE_Y - linesAboveActive * PAPER_LINE_HEIGHT;

        if (baselineY < 110) continue;

        let colCursor = 0;
        lineCells.forEach((cell) => {
          const cellX = PAPER_LEFT_MARGIN + colCursor * PAPER_COL_PX;
          const cellW = cell.colWidth * PAPER_COL_PX;

          cell.layers.forEach((layer) => {
            if (layer.isTape) {
              ctx.fillStyle = '#FCFBF7';
              ctx.fillRect(cellX - 3, baselineY - 48, cellW + 6, 60);
            }

            ctx.save();
            const centerX = cellX + cellW * 0.5 + parseFloat(layer.dx) * 2.5;
            const centerY = baselineY + parseFloat(layer.dy) * 2.5;
            ctx.translate(centerX, centerY);
            ctx.scale(1, 1.6);
            ctx.rotate((parseFloat(layer.rot) * Math.PI) / 180);

            const isCJK = cell.colWidth === 2;
            ctx.font = isCJK
              ? '700 64px "Noto Serif SC", "Songti SC", "Courier Prime", serif'
              : '400 76px "Courier Prime", "Noto Serif SC", monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'alphabetic';

            const alpha = parseFloat(layer.alpha);
            ctx.fillStyle = layer.color === 'red'
              ? `rgba(209, 75, 48, ${alpha})`
              : `rgba(24, 26, 30, ${alpha})`;

            ctx.fillText(layer.char, 0, 0);

            // Subtle ribbon fabric ink halo
            ctx.fillStyle = layer.color === 'red'
              ? `rgba(209, 75, 48, ${alpha * 0.22})`
              : `rgba(24, 26, 30, ${alpha * 0.16})`;
            ctx.fillText(layer.char, 1.0, 0.7);

            ctx.restore();
          });

          colCursor += cell.colWidth;
        });

        // 3. LIVE ON-PAPER PINYIN IME COMPOSITION RENDERING!
        // When user is typing Pinyin (either OS IME or Built-in Pinyin), draw the live Pinyin syllables
        // directly on the 3D paper at the active cursor position with a warm terracotta dashed underline!
        if (lineIndex === state.currentLineIdx && state.manualScrollOffset === 0) {
          const caretX = PAPER_LEFT_MARGIN + state.currentColPos * PAPER_COL_PX;

          if (state.compositionText && state.compositionText.length > 0) {
            const compStr = formatPinyinPreview(state.compositionText);
            const compChars = splitCharacters(compStr).slice(-(MAX_COLS_PER_LINE - state.currentColPos || 1));
            const compWidthPx = compChars.length * PAPER_COL_PX;

            // Warm highlight box on the paper for active Pinyin composition
            ctx.save();
            ctx.fillStyle = 'rgba(217, 83, 56, 0.09)';
            ctx.fillRect(caretX - 4, baselineY - 82, compWidthPx + 12, 94);

            // Render each Pinyin letter on the paper in crisp italic typewriter font
            ctx.font = 'italic 400 70px "Courier Prime", "Noto Serif SC", monospace';
            ctx.fillStyle = 'rgba(209, 75, 48, 0.94)';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'alphabetic';

            compChars.forEach((pCh, pIdx) => {
              const px = caretX + pIdx * PAPER_COL_PX + PAPER_COL_PX * 0.5;
              ctx.save();ctx.translate(px,baselineY-2);ctx.scale(1,1.35);ctx.fillText(pCh,0,0);ctx.restore();
            });

            // Dashed terracotta underline directly on the paper under the Pinyin letters
            ctx.strokeStyle = 'rgba(209, 75, 48, 0.88)';
            ctx.lineWidth = 3.5;
            ctx.setLineDash([8, 6]);
            ctx.beginPath();
            ctx.moveTo(caretX, baselineY + 8);
            ctx.lineTo(caretX + compWidthPx, baselineY + 8);
            ctx.stroke();

            // Active Pinyin cursor bar at the end of the Pinyin string
            ctx.setLineDash([]);
            ctx.fillStyle = '#D14B30';
            ctx.fillRect(caretX + compWidthPx + 4, baselineY - 75, 4.5, 82);
            ctx.restore();
          } else {
            // Subtle active V-guide alignment tick on the paper
            ctx.fillStyle = 'rgba(217, 83, 56, 0.72)';
            ctx.fillRect(caretX + 4, baselineY + 9, PAPER_COL_PX - 8, 4.5);
          }
        }
      }

      if (paperTexture3D) {
        paperTexture3D.needsUpdate = true;
      }
    }

    /*************************************************************************
     * 5. THREE.JS r128 STUDIO SATIN-BLACK TYPEWRITER ENGINE
     *    - Satin-Piano Matte Black Material (#14161a, clearcoat: 0.56, roughness: 0.27)
     *    - 22° Telephoto Camera -> Zero perspective occlusion on any keycap!
     *    - Exact Video Anatomy: Twin Circular Spool Domes, V-Cutout Typebasket,
     *      32 3D Typebars, Woven Black/Red Ribbon, Chrome Paper Bail Bar with
     *      Ruler Ticks & Dual Rubber Rollers, Left Orange-Tipped Return Lever
     *************************************************************************/
    let scene, camera, renderer, raycaster, mouseVec;
    let typewriterRoot, carriageGroup, platenRollerMesh, leftKnobMesh, rightKnobMesh;
    let returnLeverGroup, ribbonVibratorGroup, paperMesh3D;
    const keycap3DMap = new Map();
    const typebar3DList = [];
    const clickable3DObjects = [];

    // Smooth 3D Physics & Camera State
    const anim3D = {
      carriageTargetX: 0,
      carriageCurrentX: 0,
      paperFeedTargetY: 0,
      paperFeedCurrentY: 0,
      sheetRise: 0,
      platenTargetRotX: 0,
      platenCurrentRotX: 0,
      leverTargetRotZ: 0,
      leverCurrentRotZ: 0,
      ribbonTargetY: 0,
      ribbonCurrentY: 0,
      chassisJoltY: 0,

      // Telephoto 22° Studio Camera Presets (Exact Video Perspective!)
      camMode: 'classic',
      camPosTarget: new THREE.Vector3(0, 17.7, 23.2),
      camLookTarget: new THREE.Vector3(0, 0.75, 0.15),
      camPosCurrent: new THREE.Vector3(0, 17.7, 23.2),
      camLookCurrent: new THREE.Vector3(0, 0.75, 0.15),
      mouseParallaxX: 0,
      mouseParallaxY: 0,
      isDraggingOrbit: false,
      orbitYaw: 0,
      orbitPitch: 0.66,
      orbitDistance: 24.2,
      dragPrevX: 0,
      dragPrevY: 0
    };

    // High-Contrast Studio Softbox HDR Environment Map for Satin-Piano Black Reflections
    function createStudioEnvironmentMap(webglRenderer) {
      const pmremGenerator = new THREE.PMREMGenerator(webglRenderer);
      pmremGenerator.compileEquirectangularShader();

      const envScene = new THREE.Scene();
      const softboxCanvas=document.createElement('canvas');softboxCanvas.width=256;softboxCanvas.height=128;
      const softboxCtx=softboxCanvas.getContext('2d');
      const softboxImage=softboxCtx.createImageData(256,128);
      for(let y=0;y<128;y++) for(let x=0;x<256;x++) {
        const edge=Math.min(x/28,(255-x)/28,y/22,(127-y)/22,1);
        const v=Math.round(255*Math.max(0,edge)*Math.max(0,edge));const k=(y*256+x)*4;
        softboxImage.data[k]=softboxImage.data[k+1]=softboxImage.data[k+2]=v;softboxImage.data[k+3]=255;
      }
      softboxCtx.putImageData(softboxImage,0,0);
      const softboxMap=new THREE.CanvasTexture(softboxCanvas);softboxMap.encoding=THREE.sRGBEncoding;
      const softboxMat=new THREE.MeshBasicMaterial({map:softboxMap,side:THREE.DoubleSide});
      envScene.background = new THREE.Color(0x08090d);

      // Large Overhead Main Studio Softbox (Creates wide silky sheen across satin-black shoulders & spool domes)
      const mainSoftbox = new THREE.Mesh(
        new THREE.PlaneGeometry(12, 8),
        softboxMat
      );
      mainSoftbox.position.set(0, 17, 3);
      mainSoftbox.rotation.x = Math.PI / 2 - 0.15;
      envScene.add(mainSoftbox);

      // Secondary Front-Top Specular Highlight Strip (Highlights keycap chrome rings & front lip)
      const frontStrip = new THREE.Mesh(
        new THREE.PlaneGeometry(24, 4.5),
        softboxMat
      );
      frontStrip.position.set(0, 11, 16);
      frontStrip.lookAt(0, 0, 0);
      envScene.add(frontStrip);

      // Cool Left Studio Rim Reflector
      const leftRim = new THREE.Mesh(
        new THREE.PlaneGeometry(8, 12),
        new THREE.MeshBasicMaterial({ color: 0xdbe7ff, side: THREE.DoubleSide })
      );
      leftRim.position.set(-18, 8, 2);
      leftRim.rotation.y = Math.PI / 2;
      envScene.add(leftRim);

      // Warm Right Rim Reflector
      const rightRim = new THREE.Mesh(
        new THREE.PlaneGeometry(8, 12),
        new THREE.MeshBasicMaterial({ color: 0xffe4d2, side: THREE.DoubleSide })
      );
      rightRim.position.set(18, 8, 2);
      rightRim.rotation.y = -Math.PI / 2;
      envScene.add(rightRim);

      const envRT = pmremGenerator.fromScene(envScene, 0.035);
      pmremGenerator.dispose();
      return envRT.texture;
    }

    // Ultra-Fine Satin Anodized / Piano Micro-Grain Bump Texture
    function createFineSatinBumpTexture() {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext('2d');
      const imgData = ctx.createImageData(256, 256);
      const d = imgData.data;
      for (let i = 0; i < d.length; i += 4) {
        const v = 122 + Math.floor(filmRandom() * 14);
        d[i] = v;
        d[i + 1] = v;
        d[i + 2] = v;
        d[i + 3] = 255;
      }
      ctx.putImageData(imgData, 0, 0);
      const tex = new THREE.CanvasTexture(canvas);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(12, 12);
      return tex;
    }

    // High-Res 256×256 Keycap Dish Legend Texture (Exact Video Look)
    function createKeycapLegendTexture(label, isOrangeAccent = false) {
      const c = document.createElement('canvas');
      c.width = 256;
      c.height = 256;
      const ctx = c.getContext('2d');

      // Concave Satin Dish Shading
      const grad = ctx.createRadialGradient(128, 92, 14, 128, 128, 120);
      if (isOrangeAccent) {
        // Exact video burnt-orange / terracotta keycap dish (#b84d32)
        grad.addColorStop(0, '#D45A3B');
        grad.addColorStop(0.72, '#B6462A');
        grad.addColorStop(1, '#8E321B');
      } else {
        // Deep satin-piano obsidian keycap dish (#17191e)
        grad.addColorStop(0, '#0B0C0F');
        grad.addColorStop(0.70, '#0E0F12');
        grad.addColorStop(1, '#15161A');
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 256, 256);

      // Subtle inner concave rim sheen
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.018)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(128, 128, 106, 0, Math.PI * 2);
      ctx.stroke();

      // Crisp Off-White Key Legend (#ECE8DF)
      ctx.fillStyle = '#ECE8DF';
      ctx.font = label.length > 1
        ? '700 44px "Inter", "Courier Prime", monospace'
        : '400 88px "Inter", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, 128, 132);

      const tex = new THREE.CanvasTexture(c);
      tex.encoding = THREE.sRGBEncoding;
      if (renderer) {
        tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
      }
      return tex;
    }

    // Helper: Create Sculpted Rounded Box Geometry with Smooth Bevels
    function createSculptedBoxGeometry(width, height, depth, radius = 0.35, bevelSegments = 6) {
      const shape = new THREE.Shape();
      const w = Math.max(0.05, width - radius * 2);
      const d = Math.max(0.05, depth - radius * 2);
      shape.moveTo(-w / 2, -d / 2 - radius);
      shape.lineTo(w / 2, -d / 2 - radius);
      shape.absarc(w / 2, -d / 2, radius, -Math.PI / 2, 0, false);
      shape.lineTo(w / 2 + radius, d / 2);
      shape.absarc(w / 2, d / 2, radius, 0, Math.PI / 2, false);
      shape.lineTo(-w / 2, d / 2 + radius);
      shape.absarc(-w / 2, d / 2, radius, Math.PI / 2, Math.PI, false);
      shape.lineTo(-w / 2 - radius, -d / 2);
      shape.absarc(-w / 2, -d / 2, radius, Math.PI, Math.PI * 1.5, false);

      const extrudeSettings = {
        depth: Math.max(0.05, height - radius * 1.1),
        bevelEnabled: true,
        bevelSegments: bevelSegments,
        steps: 1,
        bevelSize: radius * 0.72,
        bevelThickness: radius * 0.62
      };

      const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
      geo.rotateX(-Math.PI / 2);
      geo.center();
      geo.computeBoundingBox();
      const size = geo.boundingBox.getSize(new THREE.Vector3());
      geo.scale(width/size.x, height/size.y, depth/size.z);
      geo.computeVertexNormals();
      return geo;
    }

    // A closed cap loft: one continuous sidewall and rolled shoulder, no intersecting trim.
    function pillOutline(width,depth,inset=0,segments=64) {
      const radius=depth/2-inset,straight=(width-depth)/2,points=[];
      for(let i=0;i<segments;i++) {
        const a=-Math.PI/2+i/segments*Math.PI*2;
        const center=i<segments/2?straight:-straight;
        points.push(new THREE.Vector3(center+radius*Math.cos(a),0,radius*Math.sin(a)));
      }
      return points;
    }
    function createPillKeycapGeometry(width,height,depth) {
      const profile=[[-0.5,0.050],[-0.39,0.015],[-0.20,0],[0.15,0],[0.32,0.010],[0.44,0.035],[0.50,0.062]];
      const count=96,vertices=[],indices=[];
      profile.forEach(([y,inset])=>pillOutline(width,depth,inset,count).forEach(p=>vertices.push(p.x,y*height,p.z)));
      for(let r=0;r<profile.length-1;r++) for(let j=0;j<count;j++) {
        const a=r*count+j,b=r*count+(j+1)%count,c=a+count,d=b+count;
        indices.push(a,c,b,b,c,d);
      }
      const bottom=vertices.length/3;vertices.push(0,-height/2,0);
      const top=vertices.length/3;vertices.push(0,height/2,0);
      for(let j=0;j<count;j++) {
        const next=(j+1)%count,offset=(profile.length-1)*count;
        indices.push(bottom,j,next,top,offset+next,offset+j);
      }
      const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.setIndex(indices);geometry.computeVertexNormals();
      geometry.userData={closedKeycap:true,width,height,depth};return geometry;
    }
    let keyGlowMap=null;
    const reduceKeyMotion=false;
    function addKeyGlow(parent,width,depth,topY,pill=false) {
      if(!keyGlowMap) {
        const canvas=document.createElement('canvas');canvas.width=128;canvas.height=128;
        const ctx=canvas.getContext('2d'),g=ctx.createRadialGradient(64,64,3,64,64,64);
        g.addColorStop(0,'rgba(255,176,65,0.95)');g.addColorStop(.42,'rgba(255,98,28,0.70)');g.addColorStop(.75,'rgba(231,57,12,0.20)');g.addColorStop(1,'rgba(210,45,8,0)');
        ctx.fillStyle=g;ctx.fillRect(0,0,128,128);keyGlowMap=new THREE.CanvasTexture(canvas);keyGlowMap.encoding=THREE.sRGBEncoding;
      }
      const fxGroup=new THREE.Group();fxGroup.name='key-light-effects';parent.add(fxGroup);
      const wash=new THREE.Mesh(new THREE.PlaneGeometry(width*1.04,depth*1.04),new THREE.MeshBasicMaterial({map:keyGlowMap,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false,polygonOffset:true,polygonOffsetFactor:-3}));
      wash.rotation.x=-Math.PI/2;wash.position.y=topY+.005;wash.name='key-light-wash';fxGroup.add(wash);
      let points;
      if(pill) points=pillOutline(width+0.018,depth+0.018,0,96);
      else points=Array.from({length:96},(_,i)=>new THREE.Vector3(Math.cos(i/96*Math.PI*2)*width/2,0,Math.sin(i/96*Math.PI*2)*depth/2));
      const curve=new THREE.CatmullRomCurve3(points,true,'centripetal');
      const geometry=new THREE.TubeGeometry(curve,96,0.009,5,true);
      const edgeMaterial=new THREE.ShaderMaterial({
        uniforms:{uPhase:{value:0},uStrength:{value:0}},transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false,
        vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
        fragmentShader:'varying vec2 vUv;uniform float uPhase;uniform float uStrength;void main(){float tail=fract(uPhase-vUv.x+1.0);float streak=exp(-tail*14.0);float glow=(0.18+streak*0.82)*uStrength;gl_FragColor=vec4(vec3(1.0,0.34+streak*0.32,0.065+streak*0.13)*1.25,glow);}'
      });
      const edge=new THREE.Mesh(geometry,edgeMaterial);edge.position.y=topY;edge.name='key-light-travel';fxGroup.add(edge);
      const pulse=new THREE.Mesh(geometry,new THREE.MeshBasicMaterial({color:0xff8c32,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false}));
      pulse.position.y=topY-.015;pulse.name='key-light-ripple';fxGroup.add(pulse);
      fxGroup.visible=false;
      const emissive=[];parent.traverse(mesh=>{if(mesh.isMesh && mesh.geometry.type==='CircleGeometry' && mesh.material.emissive)emissive.push(mesh.material);});
      return {group:fxGroup,wash,edge,pulse,emissive};
    }
    function updateKeyGlow(entry,now) {
      const fx=entry.fx;if(!fx) return;
      const t=(now-(entry.glowStartedAt ?? -10000))/1000;
      const duration=reduceKeyMotion?.20:.62;
      if(t<0||t>duration) {
        fx.group.visible=false;fx.wash.material.opacity=0;fx.edge.material.uniforms.uStrength.value=0;fx.pulse.material.opacity=0;
        fx.emissive.forEach(m=>m.emissiveIntensity=0);return;
      }
      fx.group.visible=true;
      const strength=Math.min(1,t/.018)*Math.exp(-Math.max(0,t-.018)*6.4);
      fx.wash.material.opacity=strength*.72;
      fx.edge.material.uniforms.uStrength.value=strength;
      fx.edge.material.uniforms.uPhase.value=reduceKeyMotion?0:t*1.9;
      const expansion=reduceKeyMotion?0:Math.min(1,t/.43);
      fx.pulse.scale.set(1+expansion*.27,1,1+expansion*.27);
      fx.pulse.material.opacity=reduceKeyMotion?0:Math.sin(Math.min(1,t/.46)*Math.PI)*.50*Math.exp(-t*2.5);
      fx.emissive.forEach(m=>{m.emissive.setHex(0xc95012);m.emissiveIntensity=strength*.65;});
    }

    function addKeyLegend(parent,label,width,depth,y,key) {
      const canvas=document.createElement('canvas');canvas.width=512;canvas.height=160;
      const ctx=canvas.getContext('2d');ctx.strokeStyle='#dedfe3';ctx.fillStyle='#dedfe3';ctx.lineWidth=9;ctx.lineJoin='round';
      if(label==='SHIFT') {
        ctx.save();ctx.translate(256,80);ctx.scale(1.15,1.15);ctx.translate(-256,-80);ctx.beginPath();ctx.moveTo(218,83);ctx.lineTo(256,39);ctx.lineTo(294,83);ctx.lineTo(274,83);ctx.lineTo(274,112);ctx.lineTo(238,112);ctx.lineTo(238,83);ctx.closePath();ctx.stroke();ctx.restore();
      } else {
        ctx.globalAlpha=0.55;ctx.font='400 45px Inter, sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(label,256,82);
      }
      const map=new THREE.CanvasTexture(canvas);map.encoding=THREE.sRGBEncoding;map.anisotropy=renderer.capabilities.getMaxAnisotropy();
      const material=new THREE.MeshBasicMaterial({map,transparent:true,depthWrite:false,toneMapped:false,polygonOffset:true,polygonOffsetFactor:-2});
      const mesh=new THREE.Mesh(new THREE.PlaneGeometry(width,depth),material);mesh.rotation.x=-Math.PI/2;mesh.position.y=y;mesh.name='legend-'+label;mesh.userData={keyChar:key,hasLegend:true};parent.add(mesh);clickable3DObjects.push(mesh);
      return mesh;
    }
    function addSlottedScrew(parent,position,radius,material) {
      const screw=new THREE.Group();screw.name='slotted-screw';screw.position.copy(position);
      const head=new THREE.Mesh(new THREE.CylinderGeometry(radius,radius,0.022,20),material);screw.add(head);
      const slot=new THREE.Mesh(new THREE.BoxGeometry(radius*1.3,0.004,radius*0.16),new THREE.MeshStandardMaterial({color:0x0b0d12,roughness:0.8}));slot.position.y=0.013;slot.rotation.y=0.55;screw.add(slot);parent.add(screw);return screw;
    }

    function keyboardDeckHeight(z) {
      const t=THREE.MathUtils.clamp((2.45-z)/2.60,0,1);
      return 0.24+0.64*t*t;
    }
    function keyboardDeckPitch(z) {
      const t=THREE.MathUtils.clamp((2.45-z)/2.60,0,1);
      return Math.atan(1.28*t/2.60)*0.45;
    }
    function chassisDeckHeight(z) {
      const rise=Math.max(0,2.25-z)/2.6;
      return 0.18+0.70*(1-Math.exp(-rise*rise));
    }
    function curvedChassisGeometry(source) {
      // Long straight extrusion edges need subdivision before applying a curved profile.
      const g=source.index?source.toNonIndexed():source;
      const positions=g.attributes.position,uvs=g.attributes.uv;
      const output=[],outUV=[],index=[],merged=new Map();
      const emit=vertices=>vertices.forEach(v=>{
        const q=v.p.clone();
        q.y=q.y<0.05?-0.70+q.y:q.y-0.53+chassisDeckHeight(q.z);
        const key=[q.x,q.y,q.z].map(x=>Math.round(x*100000)).join(',');
        let i=merged.get(key);
        if(i===undefined){i=output.length/3;merged.set(key,i);output.push(q.x,q.y,q.z);outUV.push(v.uv.x,v.uv.y);}
        index.push(i);
      });
      function clip(polygon,z,keepAbove) {
        const result=[];
        for(let i=0;i<polygon.length;i++) {
          const a=polygon[i],b=polygon[(i+1)%polygon.length];
          const inA=keepAbove?a.p.z>=z-1e-8:a.p.z<=z+1e-8;
          const inB=keepAbove?b.p.z>=z-1e-8:b.p.z<=z+1e-8;
          if(inA)result.push(a);
          if(inA!==inB) {
            const t=(z-a.p.z)/(b.p.z-a.p.z);
            result.push({p:a.p.clone().lerp(b.p,t),uv:a.uv.clone().lerp(b.uv,t)});
          }
        }
        return result;
      }
      function split(a,b,c) {
        const tri=[a,b,c],step=0.25;
        const low=Math.floor(Math.min(a.p.z,b.p.z,c.p.z)/step);
        const high=Math.floor(Math.max(a.p.z,b.p.z,c.p.z)/step);
        for(let k=low;k<=high;k++) {
          const poly=clip(clip(tri,k*step,true),(k+1)*step,false);
          for(let i=1;i<poly.length-1;i++) {
            const area=new THREE.Vector3().subVectors(poly[i].p,poly[0].p).cross(new THREE.Vector3().subVectors(poly[i+1].p,poly[0].p)).lengthSq();
            if(area>1e-14)emit([poly[0],poly[i],poly[i+1]]);
          }
        }
      }
      for(let i=0;i<positions.count;i+=3) {
        const v=[];
        for(let j=0;j<3;j++)v.push({p:new THREE.Vector3().fromBufferAttribute(positions,i+j),uv:uvs?new THREE.Vector2().fromBufferAttribute(uvs,i+j):new THREE.Vector2()});
        split(...v);
      }
      const result=new THREE.BufferGeometry();result.setAttribute('position',new THREE.Float32BufferAttribute(output,3));result.setAttribute('uv',new THREE.Float32BufferAttribute(outUV,2));result.setIndex(index);result.computeVertexNormals();source.dispose();if(g!==source)g.dispose();return result;
    }

    function initThreeJSTypewriter() {
      const container = document.getElementById('webglStageContainer');
      const w = container.clientWidth || 1000;
      const h = container.clientHeight || 580;

      scene = new THREE.Scene();

      // 22° Telephoto Camera matching studio product photography (Zero keycap occlusion!)
      camera = new THREE.PerspectiveCamera(THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(11)) * Math.max(1, 1.65 / (w/h)))), w / h, 0.1, 140);
      camera.position.copy(anim3D.camPosCurrent);
      camera.lookAt(anim3D.camLookCurrent);

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 0.95;
      renderer.outputEncoding = THREE.sRGBEncoding;

      container.innerHTML = '';
      container.appendChild(renderer.domElement);

      const envMap = createStudioEnvironmentMap(renderer);
      scene.environment = envMap;

      raycaster = new THREE.Raycaster();
      mouseVec = new THREE.Vector2();

      // ================= STUDIO 3-POINT LIGHTING =================
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.35);
      scene.add(ambientLight);

      // Overhead Studio Softbox Key Light
      const keyLight = new THREE.DirectionalLight(0xffffff, 1.15);
      keyLight.position.set(4.5, 19.5, 12.5);
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.width = 2048;
      keyLight.shadow.mapSize.height = 2048;
      keyLight.shadow.camera.near = 5;
      keyLight.shadow.camera.far = 38;
      const d = 8.8;
      keyLight.shadow.camera.left = -d;
      keyLight.shadow.camera.right = d;
      keyLight.shadow.camera.top = d;
      keyLight.shadow.camera.bottom = -d;
      keyLight.shadow.bias = -0.0004;
      scene.add(keyLight);

      // Left Cool Studio Rim Light to sculpt the satin-black curves
      const leftRimLight = new THREE.DirectionalLight(0xf2f4ff, 0.42);
      leftRimLight.position.set(-11, 10, -7);
      scene.add(leftRimLight);

      // Right Warm Fill Light
      const rightFillLight = new THREE.DirectionalLight(0xffffff, 0.24);
      rightFillLight.position.set(11, 8, 10);
      scene.add(rightFillLight);

      // ================= STUDIO PBR MATERIALS LIBRARY =================
      const satinBump = createFineSatinBumpTexture();

      // 1. Satin-Piano Matte Black Unibody Material (#14161a)
      const pianoSatinBlackMat = new THREE.MeshPhysicalMaterial({
        color: 0x17191c,
        roughness: 0.40,
        metalness: 0.04,
        clearcoat: 0.26,
        clearcoatRoughness: 0.56,
        bumpMap: satinBump,
        bumpScale: 0.0008,
        envMapIntensity: 0.80
      });

      // 2. Deep Recessed Matte Obsidian Cavity Material (Keywell & Typebasket interior)
      const recessedDarkMat = new THREE.MeshStandardMaterial({
        color: 0x0b0c0f,
        roughness: 0.82,
        metalness: 0.12
      });

      // 3. High-Contrast Polished & Brushed Chrome Material
      const chromeMat = new THREE.MeshStandardMaterial({
        color: 0xa9adbd,
        roughness: 0.22,
        metalness: 0.98,
        envMapIntensity: 1.10
      });

      // 4. Machined Dark Gunmetal Steel Material (Typebars, Segment & Linkages)
      const machinedSteelMat = new THREE.MeshStandardMaterial({
        color: 0x34373e,
        roughness: 0.36,
        metalness: 0.86
      });

      // 5. Dense Matte Grip Rubber (Platen Roller & Paper Bail Pinch Rollers)
      const platenRubberMat = new THREE.MeshStandardMaterial({
        color: 0x15171c,
        roughness: 0.72,
        metalness: 0.08,
        bumpMap: satinBump,
        bumpScale: 0.015
      });

      // 6. Signature Burnt-Orange / Terracotta Polymer Material (Return Lever Tip & Accent Pill)
      const burntOrangeMat = new THREE.MeshPhysicalMaterial({
        color: 0xb84f36,
        roughness: 0.48,
        metalness: 0.08,
        clearcoat: 0.52,
        clearcoatRoughness: 0.22
      });

      const keyPlasticMat = pianoSatinBlackMat.clone();
      keyPlasticMat.color.setHex(0x0e1013);keyPlasticMat.roughness=0.30;keyPlasticMat.clearcoat=0.32;keyPlasticMat.clearcoatRoughness=0.42;keyPlasticMat.envMapIntensity=0.90;
      // ================= SOFT MULTI-LAYER GROUND CONTACT SHADOW =================
      const shadowPlane = new THREE.Mesh(
        new THREE.PlaneGeometry(24, 18),
        new THREE.ShadowMaterial({ opacity: 0.0 })
      );
      shadowPlane.rotation.x = -Math.PI / 2;
      shadowPlane.position.y = -1.18;
      shadowPlane.receiveShadow = true;
      scene.add(shadowPlane);

      // Soft radial contact shadow under the typewriter base (matches video 00:00 shadow)
      const aoCanvas = document.createElement('canvas');
      aoCanvas.width = 512;
      aoCanvas.height = 512;
      const aoCtx = aoCanvas.getContext('2d');
      const aoGrad = aoCtx.createRadialGradient(256, 256, 30, 256, 256, 245);
      aoGrad.addColorStop(0, 'rgba(10, 12, 16, 0.78)');
      aoGrad.addColorStop(0.55, 'rgba(10, 12, 16, 0.36)');
      aoGrad.addColorStop(0.82, 'rgba(10, 12, 16, 0.09)');
      aoGrad.addColorStop(1, 'rgba(10, 12, 16, 0)');
      aoCtx.fillStyle = aoGrad;
      aoCtx.fillRect(0, 0, 512, 512);
      const aoTex = new THREE.CanvasTexture(aoCanvas);
      const aoMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(14.8, 10.6),
        new THREE.MeshBasicMaterial({ map: aoTex, transparent: true, depthWrite: false })
      );
      aoMesh.rotation.x = -Math.PI / 2;
      aoMesh.position.set(0, -1.16, 0.65);
      scene.add(aoMesh);

      // ================= MASTER 3D TYPEWRITER ROOT GROUP =================
      typewriterRoot = new THREE.Group();
      scene.add(typewriterRoot);

      // Continuous bevelled housing, with real openings rather than stacked blocks.
      const basePaint = pianoSatinBlackMat.clone(); basePaint.color.setHex(0x101114);basePaint.roughness=0.46;basePaint.clearcoat=0.18;basePaint.envMapIntensity=0.50;
      const lowerBaseMesh = new THREE.Mesh(createSculptedBoxGeometry(11.3, 0.75, 7.8, 0.48, 8), basePaint);
      lowerBaseMesh.position.set(0, -0.75, 0.72);
      lowerBaseMesh.castShadow = true;
      lowerBaseMesh.receiveShadow = true;
      lowerBaseMesh.name='lower-shell';
      typewriterRoot.add(lowerBaseMesh);
      const outline = new THREE.Shape();
      outline.moveTo(-4.8, 3.12); outline.lineTo(4.8, 3.12);
      outline.quadraticCurveTo(5.22, 3.12, 5.28, 2.65);
      outline.lineTo(5.55, -3.6); outline.quadraticCurveTo(5.6, -4.45, 4.8, -4.45);
      outline.lineTo(-4.8, -4.45); outline.quadraticCurveTo(-5.6,-4.45,-5.55,-3.6);
      outline.lineTo(-5.28,2.65); outline.quadraticCurveTo(-5.22,3.12,-4.8,3.12);
      const well = new THREE.Path();
      well.moveTo(-4.55,0.12); well.lineTo(4.55,0.12);
      well.quadraticCurveTo(4.87,0.12,4.87,-0.32);
      well.lineTo(4.87,-3.58);well.quadraticCurveTo(4.87,-3.9,4.5,-3.9);
      well.lineTo(-4.5,-3.9);well.quadraticCurveTo(-4.87,-3.9,-4.87,-3.58);
      well.lineTo(-4.87,-0.32);well.quadraticCurveTo(-4.87,0.12,-4.55,0.12);
      outline.holes.push(well);
      const basketHole = new THREE.Path();
      basketHole.moveTo(-2.65,1.85);basketHole.quadraticCurveTo(-2.9,1.6,-2.3,1.28);
      basketHole.quadraticCurveTo(0,-0.05,2.3,1.28);basketHole.quadraticCurveTo(2.9,1.6,2.65,1.85);
      basketHole.lineTo(-2.65,1.85);outline.holes.push(basketHole);
      const shellGeo = new THREE.ExtrudeGeometry(outline,{depth:0.35,bevelEnabled:true,bevelSegments:8,steps:1,bevelSize:0.20,bevelThickness:0.18,curveSegments:40});
      shellGeo.rotateX(-Math.PI/2);
      const shell = new THREE.Mesh(curvedChassisGeometry(shellGeo),pianoSatinBlackMat);
      shell.position.y=0;shell.rotation.x=0;

      shell.name='upper-shell';shell.castShadow=true;shell.receiveShadow=true;typewriterRoot.add(shell);
      const spoolPaint = pianoSatinBlackMat.clone(); spoolPaint.color.setHex(0x111317);
      [-3.65,3.65].forEach(x=>{
        const spool=new THREE.Mesh(new THREE.CylinderGeometry(0.83,0.88,0.12,64),spoolPaint);
        spool.position.set(x,chassisDeckHeight(-1.95)+0.09,-1.95);spool.rotation.x=0.04;
        spool.name='ribbon-spool-'+(x<0?'left':'right');spool.castShadow=true;spool.receiveShadow=true;typewriterRoot.add(spool);
        const seam=new THREE.Mesh(new THREE.CylinderGeometry(0.89,0.90,0.035,64),recessedDarkMat);
        seam.position.set(x,chassisDeckHeight(-1.95)+0.025,-1.95);seam.rotation.x=0.04;typewriterRoot.add(seam);
      });

      // A flat front section blends gradually into the rising rear of the keybed.
      const keywellGeometry=new THREE.PlaneGeometry(9.65,4.25,1,40);keywellGeometry.rotateX(-Math.PI/2);
      const keywellPositions=keywellGeometry.attributes.position;
      for(let i=0;i<keywellPositions.count;i++) {
        const z=keywellPositions.getZ(i)+1.95;
        keywellPositions.setZ(i,z);keywellPositions.setY(i,keyboardDeckHeight(z)-0.57);
      }
      keywellGeometry.computeVertexNormals();
      const keywellBed=new THREE.Mesh(keywellGeometry,recessedDarkMat);keywellBed.name='curved-keybed';keywellBed.receiveShadow=true;typewriterRoot.add(keywellBed);

      // Type basket anatomy traced from the 00:05 reference frame.
      const basketGroup = new THREE.Group();basketGroup.name='type-basket';
      typewriterRoot.add(basketGroup);
      const bowl = new THREE.Mesh(new THREE.SphereGeometry(2.35,48,24,0,Math.PI*2,0,Math.PI/2),recessedDarkMat);
      bowl.scale.set(1,0.22,0.50);bowl.rotation.x=Math.PI;bowl.position.set(0,0.58,-1.33);basketGroup.add(bowl);
      const restPoints=[];
      for(let i=0;i<=64;i++) {
        const a=-1.06+i/64*2.12;
        restPoints.push(new THREE.Vector3(Math.sin(a)*2.57,0.69,-1.51+Math.cos(a)*0.93));
      }
      const restCurve=new THREE.CatmullRomCurve3(restPoints);
      const rest=new THREE.Mesh(new THREE.TubeGeometry(restCurve,64,0.055,8,false),platenRubberMat);basketGroup.add(rest);
      for(let i=0;i<44;i++) {
        const a=-1.04+i/43*2.08;
        const x=Math.sin(a)*2.48,z=-1.51+Math.cos(a)*0.91;
        const pivot=new THREE.Group();pivot.name='typebar-'+i;pivot.position.set(x,0.60,z);
        const end=new THREE.Vector3(-x*0.77,0.10,-1.65-z);
        const arm=new THREE.Mesh(new THREE.BoxGeometry(0.024,0.045,end.length()),machinedSteelMat);
        arm.position.copy(end).multiplyScalar(0.5);arm.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),end.clone().normalize());pivot.add(arm);
        const slug=new THREE.Mesh(new THREE.BoxGeometry(0.073,0.063,0.10),chromeMat);
        slug.position.set(0,0.075,0);slug.rotation.y=a;pivot.add(slug);
        basketGroup.add(pivot);typebar3DList.push({group:pivot,strikeProgress:0});
        const slot=new THREE.Mesh(new THREE.BoxGeometry(0.014,0.025,0.16),recessedDarkMat);
        slot.position.set(x*0.89,0.72,z-0.05);slot.rotation.y=-a;basketGroup.add(slot);
      }
      const shieldShape=new THREE.Shape();
      shieldShape.moveTo(-0.22,1.93);shieldShape.lineTo(0.22,1.93);shieldShape.lineTo(0.22,1.55);
      shieldShape.lineTo(1.14,1.55);shieldShape.quadraticCurveTo(0.75,0.72,0,0.73);
      shieldShape.quadraticCurveTo(-0.75,0.72,-1.14,1.55);shieldShape.lineTo(-0.22,1.55);shieldShape.closePath();
      const shieldGeo=new THREE.ExtrudeGeometry(shieldShape,{depth:0.035,bevelEnabled:true,bevelSize:0.018,bevelThickness:0.012,bevelSegments:2,steps:1,curveSegments:32});shieldGeo.rotateX(-Math.PI/2);
      const shield=new THREE.Mesh(shieldGeo,machinedSteelMat);shield.position.y=0.89;shield.name='segment-shield';basketGroup.add(shield);
      [-0.48,0.48].forEach(x=>addSlottedScrew(basketGroup,new THREE.Vector3(x,0.948,-1.03),0.07,machinedSteelMat));
      [-0.12,0.12].forEach(x=>{
        const guide=new THREE.Mesh(new THREE.BoxGeometry(0.05,0.40,0.05),machinedSteelMat);guide.position.set(x,1.03,-1.82);basketGroup.add(guide);
      });

      // Stationary Chrome V-Notch Type Guide & Woven Black/Red Ink Ribbon
      ribbonVibratorGroup = new THREE.Group();
      ribbonVibratorGroup.position.set(0, 1.75, -0.60);
      typewriterRoot.add(ribbonVibratorGroup);

      // Left & Right Chrome Guide Prongs forming the central V-notch
      [-0.14, 0.14].forEach((vx, idx) => {
        const prong = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.30, 0.045), machinedSteelMat);
        prong.position.set(vx, 0.02, 0.02);
        prong.rotation.z = idx === 0 ? -0.20 : 0.20;
        ribbonVibratorGroup.add(prong);
      });

      // Chrome Ribbon Roller Guide Pin Posts on Left & Right
      [-1.40, 1.40].forEach((gx) => {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.34, 14), chromeMat);
        post.position.set(gx, -0.06, 0.18);
        ribbonVibratorGroup.add(post);
      });

      // Woven Black/Red Ink Ribbon stretching from Left Spool Dome -> Guide Post -> Central Vibrator -> Right Dome
      const ribbonCanvas = document.createElement('canvas');
      ribbonCanvas.width = 128;
      ribbonCanvas.height = 32;
      const rCtx = ribbonCanvas.getContext('2d');
      rCtx.fillStyle = '#14161A';
      rCtx.fillRect(0, 0, 128, 29);
      rCtx.fillStyle = '#C83E26';
      rCtx.fillRect(0, 29, 128, 3);
      const ribbonTex = new THREE.CanvasTexture(ribbonCanvas);ribbonTex.encoding=THREE.sRGBEncoding;

      const centerRibbonMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(2.9, 0.11),
        new THREE.MeshBasicMaterial({ map: ribbonTex, side: THREE.DoubleSide })
      );
      centerRibbonMesh.position.set(0, -0.04, 0.08);
      ribbonVibratorGroup.add(centerRibbonMesh);

      // ================= 6. EXACT VIDEO 5-ROW STEPPED KEYBOARD (ZERO OCCLUSION!) =================
      const keysRootGroup = new THREE.Group();
      typewriterRoot.add(keysRootGroup);

      const keyRingGeo = new THREE.LatheGeometry([
        new THREE.Vector2(0.265,-0.11),new THREE.Vector2(0.296,-0.098),
        new THREE.Vector2(0.307,-0.073),new THREE.Vector2(0.308,0.057),
        new THREE.Vector2(0.302,0.095),new THREE.Vector2(0.289,0.114),new THREE.Vector2(0.282,0.114)
      ],64);
      const keyDishGeo = new THREE.CircleGeometry(0.282, 48);
      const dishPositions=keyDishGeo.attributes.position;
      for(let i=0;i<dishPositions.count;i++) {
        const r=Math.hypot(dishPositions.getX(i),dishPositions.getY(i))/0.282;
        dishPositions.setZ(i,-0.018*(1-r*r));
      }
      keyDishGeo.computeVertexNormals();
      const keyStemGeo = new THREE.CylinderGeometry(0.055, 0.055, 0.42, 12);
      const keyShadowGeo = new THREE.CircleGeometry(0.37, 24);
      const keyShadowMat = new THREE.MeshBasicMaterial({
        color: 0x050608,
        transparent: true,
        opacity: 0.55,
        depthWrite: false
      });

      VIDEO_KEYBOARD_ROWS.forEach((rowDef) => {
        const rIdx = rowDef.rowIndex;
        // Carefully stepped Y and Z coordinates so every single row sits cleanly inside the recessed well
        const rowZ = 0.48 + rIdx * 0.78;
        const rowY = keyboardDeckHeight(rowZ);
        const keySpacing = 0.77;
        const totalKeys = rowDef.keys.length;
        const startX = -((totalKeys - 1) * keySpacing) / 2;

        rowDef.keys.forEach((kObj, colIdx) => {
          const kx = startX + colIdx * keySpacing;
          const keyGroup = new THREE.Group();
          keyGroup.position.set(kx, rowY, rowZ);
          keyGroup.rotation.x = keyboardDeckPitch(rowZ); // Horizontal at the front, progressively inclined behind.

          if (kObj.pill) {
            const pillTop = new THREE.Mesh(createPillKeycapGeometry(0.82,0.22,0.53),keyPlasticMat);
            pillTop.position.y=0.015;pillTop.name='continuous-shift-cap';pillTop.castShadow=true;pillTop.receiveShadow=true;
            pillTop.userData={keyChar:kObj.id,keyLabel:'Shift'};
            keyGroup.add(pillTop);clickable3DObjects.push(pillTop);
            addKeyLegend(keyGroup,'SHIFT',0.72,0.41,0.130,kObj.id);

          } else {
            // Circular Vintage Keycap: Chrome Bezel Ring + Satin Concave Dish + Crisp Legend
            const ringMesh = new THREE.Mesh(keyRingGeo, keyPlasticMat);
            ringMesh.castShadow = true;
            ringMesh.receiveShadow = true;
            keyGroup.add(ringMesh);

            const legendTex = createKeycapLegendTexture(kObj.label, false);
            const dishMat = new THREE.MeshPhysicalMaterial({
              map: legendTex,
              emissiveMap: legendTex,
              roughness: 0.30,
              metalness: 0.02,
              clearcoat: 0.32,
              clearcoatRoughness: 0.42,
              envMapIntensity: 0.90,
              bumpMap: satinBump,
              bumpScale: 0.0006
            });
            const dishMesh = new THREE.Mesh(keyDishGeo, dishMat);
            dishMesh.rotation.x = -Math.PI / 2;
            dishMesh.position.y = 0.114;
            dishMesh.userData = { keyChar: kObj.id };
            clickable3DObjects.push(dishMesh);
            keyGroup.add(dishMesh);
          }

          // Vertical Metal Plunger Stem
          const stemMesh = new THREE.Mesh(keyStemGeo, machinedSteelMat);
          stemMesh.position.y = -0.22;
          keyGroup.add(stemMesh);

          // Individual Ambient Occlusion Contact Shadow Disc under each keycap
          const shadowDisc = new THREE.Mesh(keyShadowGeo, keyShadowMat);
          shadowDisc.rotation.x = -Math.PI / 2;
          shadowDisc.position.y = -0.28;
          keyGroup.add(shadowDisc);

          keyGroup.name = 'key-' + kObj.id;
          keysRootGroup.add(keyGroup);
          keycap3DMap.set(kObj.id, {
            group: keyGroup,
            baseY: rowY,
            currentDepression: 0,
            targetDepression: 0,
            fx: addKeyGlow(keyGroup,kObj.pill?0.82:0.626,kObj.pill?0.53:0.626,kObj.pill?0.131:0.125,!!kObj.pill)
          });
        });
      });

      // Row 5: Sculpted Satin-Black Rounded-Pill Spacebar (Full Clearance Above Front Lip!)
      const spacebarGroup = new THREE.Group();
      const spaceBaseY = keyboardDeckHeight(3.52);
      const spaceBaseZ = 3.52;
      spacebarGroup.position.set(0, spaceBaseY, spaceBaseZ);
      spacebarGroup.rotation.x = 0;

      const spaceTopMesh=new THREE.Mesh(createPillKeycapGeometry(5.06,0.22,0.53),keyPlasticMat);
      spaceTopMesh.position.y=0.015;spaceTopMesh.name='continuous-space-cap';spaceTopMesh.castShadow=true;spaceTopMesh.receiveShadow=true;
      spaceTopMesh.userData={keyChar:' '};spacebarGroup.add(spaceTopMesh);clickable3DObjects.push(spaceTopMesh);
      addKeyLegend(spacebarGroup,'SPACE',1.6,0.38,0.130,' ');
      // Mounts sit inside the cap footprint; no overlapping base bezel or protruding bright feet.
      [-1.85,1.85].forEach(x=>{
        const mount=new THREE.Mesh(new THREE.CylinderGeometry(0.045,0.045,0.31,16),recessedDarkMat);
        mount.position.set(x,-0.20,0);spacebarGroup.add(mount);
      });

      keysRootGroup.add(spacebarGroup);
      spacebarGroup.name = 'key-space';
      keycap3DMap.set(' ', {
        group: spacebarGroup,
        baseY: spaceBaseY,
        currentDepression: 0,
        targetDepression: 0,
        fx: addKeyGlow(spacebarGroup,5.06,0.53,0.131,true)
      });

      // ================= 7. MOVING 3D CARRIAGE & PLATEN ASSEMBLY (EXACT VIDEO DETAILS!) =================
      carriageGroup = new THREE.Group();
      carriageGroup.position.set(0, 1.92, -2.22);
      typewriterRoot.add(carriageGroup);

      // A) Dark Rubber Platen Roller Cylinder
      const platenGeo = new THREE.CylinderGeometry(0.64, 0.64, 9.4, 48);
      platenGeo.rotateZ(Math.PI / 2);
      platenRollerMesh = new THREE.Mesh(platenGeo, platenRubberMat);
      platenRollerMesh.castShadow = true;
      platenRollerMesh.receiveShadow = true;
      carriageGroup.add(platenRollerMesh);

      // Machined Chrome Platen End Rings & Side Carriage Plates (Exact Video Side Assemblies!)
      [-4.75, 4.75].forEach((endX, idx) => {
        // Chrome end ring on roller
        const ring = new THREE.Mesh(
          new THREE.CylinderGeometry(0.655, 0.655, 0.13, 48).rotateZ(Math.PI / 2),
          chromeMat
        );
        ring.position.x = endX;
        carriageGroup.add(ring);

        // Detailed Chrome Carriage Side End-Plate Bracket
        const sidePlate = new THREE.Mesh(
          createSculptedBoxGeometry(0.20, 1.15, 1.38, 0.08, 5),
          machinedSteelMat
        );
        sidePlate.position.set(endX + (idx === 0 ? -0.22 : 0.22), 0.05, -0.05);
        sidePlate.castShadow = true;
        carriageGroup.add(sidePlate);

        // Chrome Paper Release Lever Tab on top of side bracket
        const releaseTab = new THREE.Mesh(
          new THREE.BoxGeometry(0.14, 0.42, 0.24),
          idx === 1 ? chromeMat : machinedSteelMat
        );
        releaseTab.position.set(endX + (idx === 0 ? -0.28 : 0.28), 0.72, -0.25);
        releaseTab.rotation.x = -0.35;
        carriageGroup.add(releaseTab);
      });

      [-4.9,4.9].forEach(x=>{
        const collar=new THREE.Mesh(new THREE.CylinderGeometry(0.15,0.15,0.38,24),machinedSteelMat);
        collar.position.set(x,0.47,-0.22);carriageGroup.add(collar);
        addSlottedScrew(carriageGroup,new THREE.Vector3(x,0.67,-0.22),0.08,chromeMat);
      });
      const releaseButton=new THREE.Mesh(new THREE.CylinderGeometry(0.09,0.09,0.22,24),burntOrangeMat);
      releaseButton.position.set(-4.52,0.75,0.05);releaseButton.name='paper-release-button';carriageGroup.add(releaseButton);

      // Through-Axle Chrome Shaft & Left/Right Knurled Platen Knobs
      const axleShaft = new THREE.Mesh(
        new THREE.CylinderGeometry(0.14, 0.14, 12.6, 24).rotateZ(Math.PI / 2),
        chromeMat
      );
      carriageGroup.add(axleShaft);

      const knobGeo = new THREE.CylinderGeometry(0.58, 0.58, 0.56, 36);
      knobGeo.rotateZ(Math.PI / 2);
      leftKnobMesh = new THREE.Mesh(knobGeo, pianoSatinBlackMat);
      leftKnobMesh.position.x = -6.12;
      leftKnobMesh.castShadow = true;
      carriageGroup.add(leftKnobMesh);

      rightKnobMesh = new THREE.Mesh(knobGeo, pianoSatinBlackMat);
      rightKnobMesh.position.x = 6.12;
      rightKnobMesh.castShadow = true;
      carriageGroup.add(rightKnobMesh);

      const knobMetal=chromeMat.clone();knobMetal.roughness=0.34;knobMetal.color.setHex(0x77798b);
      [leftKnobMesh,rightKnobMesh].forEach((knob,index)=>{
        knob.name=index?'right-platen-knob':'left-platen-knob';knob.material=knobMetal;
        const direction=index?1:-1;
        // These are children of an axle group so ribbing turns with the paper feed.
        for(let i=0;i<80;i++) {
          const a=i/80*Math.PI*2;
          const rib=new THREE.Mesh(new THREE.BoxGeometry(0.48,0.016,0.024),machinedSteelMat);
          rib.position.set(0,Math.sin(a)*0.576,Math.cos(a)*0.576);rib.rotation.x=-a;knob.add(rib);
        }
        const endCap=new THREE.Mesh(new THREE.CylinderGeometry(0.47,0.47,0.035,64).rotateZ(Math.PI/2),knobMetal);
        endCap.position.x=direction*0.29;knob.add(endCap);
        const hub=new THREE.Mesh(new THREE.CylinderGeometry(0.19,0.19,0.06,48).rotateZ(Math.PI/2),machinedSteelMat);
        hub.position.x=direction*0.32;knob.add(hub);
        const collar=new THREE.Mesh(new THREE.CylinderGeometry(0.27,0.27,0.24,48).rotateZ(Math.PI/2),chromeMat);
        collar.position.x=-direction*0.43;knob.add(collar);
      });

      // B) Front Chrome Paper Bail Bar with Engraved Ruler Scale & 2 Black Rubber Pinch Rollers
      const bailBarGroup = new THREE.Group();
      bailBarGroup.position.set(0, 0.96, 1.65);
      carriageGroup.add(bailBarGroup);

      // Ruler Scale Texture on the Chrome Bail Bar
      const rulerCanvas = document.createElement('canvas');
      rulerCanvas.width = 512;
      rulerCanvas.height = 32;
      const rlrCtx = rulerCanvas.getContext('2d');
      rlrCtx.fillStyle = '#E8ECF2';
      rlrCtx.fillRect(0, 0, 512, 32);
      rlrCtx.fillStyle = '#2B2F36';
      for (let t = 16; t < 496; t += 8) {
        const h = t % 40 === 0 ? 18 : 10;
        rlrCtx.fillRect(t, 32 - h, 2, h);
      }
      const rulerTex = new THREE.CanvasTexture(rulerCanvas);

      const bailRod = new THREE.Mesh(
        new THREE.CylinderGeometry(0.068, 0.068, 9.6, 24).rotateZ(Math.PI / 2),
        new THREE.MeshStandardMaterial({
          map: rulerTex,
          roughness: 0.16,
          metalness: 0.90
        })
      );
      bailRod.castShadow = true;
      bailRod.material=chromeMat;bailRod.name='paper-bail';bailBarGroup.add(bailRod);
      [-4.57,4.57].forEach(x=>{
        const support=new THREE.Mesh(new THREE.BoxGeometry(0.08,0.63,0.13),chromeMat);
        support.position.set(x,-0.29,-0.03);support.rotation.x=-0.24;bailBarGroup.add(support);
      });
      const scaleRail=new THREE.Mesh(new THREE.BoxGeometry(8.8,0.10,0.14),machinedSteelMat);
      scaleRail.position.set(0,0.09,-0.22);scaleRail.name='carriage-scale';bailBarGroup.add(scaleRail);
      for(let i=0;i<=68;i++) {
        const tick=new THREE.Mesh(new THREE.BoxGeometry(0.011,i%5===0?0.063:0.031,0.003),chromeMat);
        tick.position.set(-4.15+i*8.3/68,0.10,-0.146);bailBarGroup.add(tick);
      }

      // Two Black Rubber Pinch Rollers with Chrome Brackets pressing paper at x = -2.2 and x = +2.2 (Exact Video!)
      [-2.15, 2.15].forEach((rx) => {
        const rollerWheel = new THREE.Mesh(
          new THREE.CylinderGeometry(0.20, 0.20, 0.58, 28).rotateZ(Math.PI / 2),
          platenRubberMat
        );
        rollerWheel.position.x = rx;
        rollerWheel.castShadow = true;
        rollerWheel.name='paper-pinch-roller';bailBarGroup.add(rollerWheel);
        [-0.28,0.28].forEach(offset=>{
          const seam=new THREE.Mesh(new THREE.TorusGeometry(0.193,0.010,6,32),recessedDarkMat);
          seam.rotation.y=Math.PI/2;seam.position.x=rx+offset;bailBarGroup.add(seam);
        });

        const rollerHub = new THREE.Mesh(
          new THREE.CylinderGeometry(0.21, 0.21, 0.08, 24).rotateZ(Math.PI / 2),
          chromeMat
        );
        rollerHub.position.x = rx;
        rollerHub.visible = false;
        bailBarGroup.add(rollerHub);
      });

      // C) Rear Slanted Paper Support Table with Chrome Top Lip
      const paperTable = new THREE.Mesh(
        new THREE.BoxGeometry(7.0, 0.6, 0.12),
        pianoSatinBlackMat
      );
      paperTable.position.set(0, 0.78, -0.78);
      paperTable.rotation.x = -0.22;
      paperTable.receiveShadow = true;
      carriageGroup.add(paperTable);

      const paperTableChromeLip = new THREE.Mesh(
        new THREE.CylinderGeometry(0.045, 0.045, 7.0, 16).rotateZ(Math.PI / 2),
        chromeMat
      );
      paperTableChromeLip.position.set(0, 0.5, -0.94);
      carriageGroup.add(paperTableChromeLip);

      // D) Signature Left Chrome Carriage Return Lever with Burnt-Orange/Red Handle Tip (Exact Video 00:00!)
      returnLeverGroup = new THREE.Group();
      returnLeverGroup.position.set(-4.95, 0.46, 0.18);
      carriageGroup.add(returnLeverGroup);

      // Chrome Pivot Joint Housing
      const pivotJoint = new THREE.Mesh(
        new THREE.CylinderGeometry(0.18, 0.18, 0.32, 20),
        chromeMat
      );
      returnLeverGroup.add(pivotJoint);

      const strapPath=new THREE.CatmullRomCurve3([
        new THREE.Vector3(0,0.43,-0.35),new THREE.Vector3(-0.30,0.46,0.28),
        new THREE.Vector3(-0.84,0.24,1.06),new THREE.Vector3(-1.24,-0.10,1.83)
      ]);
      const strapVertices=[],strapIndices=[],up=new THREE.Vector3(0,1,0);
      const strapSegments=48;
      for(let i=0;i<=strapSegments;i++) {
        const t=i/strapSegments,point=strapPath.getPoint(t),tangent=strapPath.getTangent(t);
        const across=new THREE.Vector3().crossVectors(up,tangent).normalize();
        const normal=new THREE.Vector3().crossVectors(tangent,across).normalize();
        const width=0.21+0.11*Math.sin(Math.PI*t);
        for(const [side,face] of [[-1,-1],[1,-1],[1,1],[-1,1]]) {
          const v=point.clone().addScaledVector(across,side*width/2).addScaledVector(normal,face*0.027);
          strapVertices.push(v.x,v.y,v.z);
        }
        if(i<strapSegments) for(let j=0;j<4;j++) {
          const a=i*4+j,b=i*4+(j+1)%4,c=(i+1)*4+j,d=(i+1)*4+(j+1)%4;
          strapIndices.push(a,b,c,b,d,c);
        }
      }
      const strapGeo=new THREE.BufferGeometry();strapGeo.setAttribute('position',new THREE.Float32BufferAttribute(strapVertices,3));strapGeo.setIndex(strapIndices);strapGeo.computeVertexNormals();
      const leverArm=new THREE.Mesh(strapGeo,chromeMat);leverArm.castShadow=true;returnLeverGroup.add(leverArm);
      const paddleMaterial=burntOrangeMat.clone();paddleMaterial.clearcoat=0.06;paddleMaterial.roughness=0.58;paddleMaterial.metalness=0;
      const paddleTipMesh=new THREE.Mesh(createSculptedBoxGeometry(0.24,0.08,0.50,0.065,6),paddleMaterial);
      paddleTipMesh.position.set(-1.23,-0.07,1.76);paddleTipMesh.rotation.set(0.40,-0.26,-0.18);
      paddleTipMesh.userData={isReturnLever:true};paddleTipMesh.castShadow=true;returnLeverGroup.add(paddleTipMesh);clickable3DObjects.push(paddleTipMesh,leverArm);
      leverArm.userData={isReturnLever:true};returnLeverGroup.name='carriage-return-lever';
      addSlottedScrew(returnLeverGroup,new THREE.Vector3(0,0.55,-0.22),0.09,chromeMat);
      // ================= 8. 3D CURVED COTTON PAPER SHEET MESH =================
      paperTexture3D = new THREE.CanvasTexture(paperCanvas);
      paperTexture3D.encoding = THREE.sRGBEncoding;
      paperTexture3D.anisotropy = renderer.capabilities.getMaxAnisotropy();
      paperTexture3D.minFilter = THREE.LinearFilter;
      paperTexture3D.magFilter = THREE.LinearFilter;

      const paperWidth = 7.0;
      const paperHeight = 5.05;
      const paperGeo = new THREE.PlaneGeometry(paperWidth, paperHeight, 32, 48);
      const posAttr = paperGeo.attributes.position;

      for (let i = 0; i < posAttr.count; i++) {
        const px = posAttr.getX(i);
        const py = posAttr.getY(i);
        const normY = (py + paperHeight / 2) / paperHeight;

        let pz = 0;
        let adjustedY = py;
        if (normY < 0.22) {
          const theta = (0.22 - normY) * 3.1;
          pz = 0.65 * Math.cos(theta) - 0.65;
          adjustedY = py + 0.14 * Math.sin(theta);
        } else {
          const rise = normY - 0.22;
          pz = -rise * 0.38 - Math.pow(rise, 2.2) * 0.24;
          pz -= Math.pow(px / (paperWidth * 0.5), 2) * 0.032;
        }
        posAttr.setY(i, adjustedY);
        posAttr.setZ(i, pz);
      }
      paperGeo.computeVertexNormals();
      paperGeo.userData.restY = Array.from(posAttr.array).filter((_, i) => i % 3 === 1);

      const paperMat3D = new THREE.MeshBasicMaterial({
        map: paperTexture3D,
        toneMapped: false,
        side: THREE.DoubleSide
      });

      paperMesh3D = new THREE.Mesh(paperGeo, paperMat3D);
      paperMesh3D.position.set(0, 2.15, 1.45);
      paperMesh3D.castShadow = true;
      paperMesh3D.receiveShadow = true;
      carriageGroup.add(paperMesh3D);

      // r128 numeric colors are linear; decode authored sRGB paint colors explicitly.
      const correctedMaterials = new Set();
      typewriterRoot.traverse(object => {
        if (!object.isMesh) return;
        for (const material of (Array.isArray(object.material) ? object.material : [object.material])) {
          if (!correctedMaterials.has(material)) {
            if (material.color) material.color.convertSRGBToLinear();
            correctedMaterials.add(material);
          }
        }
      });
      sync3DCarriageAndPaperTargets(false);

      new ResizeObserver(() => {
        const w=container.clientWidth,h=container.clientHeight;
        if(!w||!h) return;
        camera.aspect=w/h;
        camera.fov=THREE.MathUtils.radToDeg(2*Math.atan(Math.tan(THREE.MathUtils.degToRad(11))*Math.max(1,1.65/(w/h))));
        camera.updateProjectionMatrix();renderer.setSize(w,h);
      }).observe(container);

    }

    // Synchronize 3D Carriage Horizontal Position (Includes Live Pinyin Preview Offset!)
    function sync3DCarriageAndPaperTargets(isCarriageReturn = false) {
      const colStep3D = 7.0 * PAPER_COL_PX / PAPER_CANVAS_W;
      const leftMarginStartOffset = 3.5 - PAPER_LEFT_MARGIN * 7.0 / PAPER_CANVAS_W;

      // When user is typing Pinyin on the paper, advance the carriage smoothly by half the Pinyin preview length
      // so the live Pinyin syllables stay centered right in the V-guide!
      const pinyinExtraCols = 0;

      anim3D.carriageTargetX = leftMarginStartOffset - (state.currentColPos + pinyinExtraCols) * colStep3D;

      const effectiveLine = Math.max(0, state.currentLineIdx - state.manualScrollOffset);
      const visibleFeedSteps = Math.min(6, effectiveLine);
      const ejectOffset = state.paperEjectProgress * 6.6;
      anim3D.paperFeedTargetY = 2.15 + ejectOffset;

      anim3D.platenTargetRotX = -effectiveLine * 0.42;

      if (isCarriageReturn) {
        anim3D.leverTargetRotZ = -0.52;
        setTimeout(() => {
          anim3D.leverTargetRotZ = 0;
        }, 220);
      }
    }

    // Trigger 3D Keycap Depression + 3D Radial Typebar Swing + Ribbon Vibrator Jump
    function trigger3DMechanicalKeyAction(keyChar, isLightPinyinTap = false) {
      const lower = (keyChar || '').toLowerCase();
      const keyEntry = keycap3DMap.get(lower);
      if (keyEntry) {
        keyEntry.glowStartedAt=performance.now();
        updateKeyGlow(keyEntry,keyEntry.glowStartedAt+1);

        keyEntry.targetDepression = isLightPinyinTap ? -0.16 : -0.17;
        clearTimeout(keyEntry.releaseTimer);
        keyEntry.releaseTimer=setTimeout(() => {
          keyEntry.targetDepression = 0;
        }, 105);
      }

      if (lower !== ' ' && lower !== 'bksp' && !lower.startsWith('shift') && lower !== 'caps' && typebar3DList.length > 0) {
        const idx = (lower.charCodeAt(0) * 13) % typebar3DList.length;
        const barObj = typebar3DList[idx];
        // During Pinyin composition, typebar does a crisp half-swing; on final stamp, full strike!
        barObj.strikeProgress = isLightPinyinTap ? 0.86 : 1.0;

        anim3D.ribbonTargetY = isLightPinyinTap ? 0.08 : 0.16;
        setTimeout(() => {
          anim3D.ribbonTargetY = 0;
        }, 65);

        anim3D.chassisJoltY = isLightPinyinTap ? -0.015 : -0.03;
      }
    }

    // Set 3D Camera Angle Preset
    function set3DCameraPreset(mode) {
      anim3D.camMode = mode;
      document.querySelectorAll('.cam-btn').forEach((btn) => {
        if (btn.dataset.cam === mode) {
          btn.className = 'cam-btn px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#1B1D21] text-white transition cursor-pointer';
        } else {
          btn.className = 'cam-btn px-2.5 py-1 rounded-full text-[11px] font-medium text-[#5A5750] hover:text-[#1B1D21] transition cursor-pointer';
        }
      });

      if (mode === 'classic') {
        // Telephoto 22° studio elevation matching video (Zero keycap occlusion!)
        anim3D.camPosTarget.set(0, 17.7, 23.2);
        anim3D.camLookTarget.set(0, 0.75, 0.15);
      } else if (mode === 'macro') {
        // Close-up on V-Notch Type Guide, Woven Ribbon, Paper Bail & On-Paper Pinyin
        anim3D.camPosTarget.set(0, 6.4, 7.2);
        anim3D.camLookTarget.set(0, 2.05, -1.75);
      } else if (mode === 'side') {
        // 45-degree satin-piano profile view
        anim3D.camPosTarget.set(-13.8, 11.6, 15.2);
        anim3D.camLookTarget.set(0, 0.9, 0.0);
      } else if (mode === 'orbit') {
        anim3D.orbitYaw = 0.36;
        anim3D.orbitPitch = 0.62;
        anim3D.orbitDistance = 23.5;
      }
    }

    // 60FPS WebGL Render & Physics Loop
    let previousFrameTime = performance.now();
    function animate3DLoop(now = performance.now()) {
      const dt = Math.min(0.05, (now - previousFrameTime) / 1000); previousFrameTime = now;
      const smooth = n => 1 - Math.pow(1 - n, dt * 60);

      if (!renderer || !scene || !camera) return;

      anim3D.carriageCurrentX += (anim3D.carriageTargetX - anim3D.carriageCurrentX) * smooth(0.22);
      anim3D.paperFeedCurrentY += (anim3D.paperFeedTargetY - anim3D.paperFeedCurrentY) * smooth(0.16);
      anim3D.platenCurrentRotX += (anim3D.platenTargetRotX - anim3D.platenCurrentRotX) * smooth(0.18);
      anim3D.leverCurrentRotZ += (anim3D.leverTargetRotZ - anim3D.leverCurrentRotZ) * smooth(0.28);
      anim3D.ribbonCurrentY += (anim3D.ribbonTargetY - anim3D.ribbonCurrentY) * smooth(0.38);
      anim3D.chassisJoltY *= Math.pow(0.72, dt * 60);

      if (carriageGroup) carriageGroup.position.x = anim3D.carriageCurrentX;
      if (paperMesh3D) {
        paperMesh3D.position.y = anim3D.paperFeedCurrentY;
        const riseTarget = Math.min(6, Math.max(0, state.currentLineIdx-state.manualScrollOffset)) * 0.14;
        anim3D.sheetRise += (riseTarget-anim3D.sheetRise)*smooth(0.16);
        if(Math.abs(riseTarget-anim3D.sheetRise)>0.0001) {
          const geometry=paperMesh3D.geometry,positions=geometry.attributes.position;
          geometry.userData.restY.forEach((y,i)=>positions.setY(i,y+anim3D.sheetRise*Math.max(0,(y+1.8)/4.55)));
          positions.needsUpdate=true;
        }
      }
      if (platenRollerMesh && leftKnobMesh && rightKnobMesh) {
        platenRollerMesh.rotation.x = anim3D.platenCurrentRotX;
        leftKnobMesh.rotation.x = anim3D.platenCurrentRotX;
        rightKnobMesh.rotation.x = anim3D.platenCurrentRotX;
      }
      if (returnLeverGroup) returnLeverGroup.rotation.z = anim3D.leverCurrentRotZ;
      if (ribbonVibratorGroup) ribbonVibratorGroup.position.y = 1.75 + anim3D.ribbonCurrentY;
      if (typewriterRoot) typewriterRoot.position.y = anim3D.chassisJoltY;

      // Update 3D Keycap Depressions
      keycap3DMap.forEach((kData) => {
        kData.currentDepression += (kData.targetDepression - kData.currentDepression) * smooth(0.38);
        kData.group.position.y = kData.baseY + kData.currentDepression;
        updateKeyGlow(kData,now);
      });

      // Update the individually modelled typebar swings
      typebar3DList.forEach((bObj) => {
        if (bObj.strikeProgress > 0.01) {
          bObj.group.rotation.x = bObj.strikeProgress * 1.42;
          bObj.strikeProgress *= Math.pow(0.68, dt * 60);
        } else {
          bObj.group.rotation.x = 0;
          bObj.strikeProgress = 0;
        }
      });

      // Update Camera
      if (anim3D.camMode === 'orbit') {
        const cx = Math.sin(anim3D.orbitYaw) * Math.cos(anim3D.orbitPitch) * anim3D.orbitDistance;
        const cy = Math.sin(anim3D.orbitPitch) * anim3D.orbitDistance;
        const cz = Math.cos(anim3D.orbitYaw) * Math.cos(anim3D.orbitPitch) * anim3D.orbitDistance;
        anim3D.camPosTarget.set(cx, Math.max(1.8, cy), cz);
        anim3D.camLookTarget.set(0, 0.9, 0.0);
      }

      const targetWithParallaxX = anim3D.camPosTarget.x + (anim3D.camMode === 'side' ? anim3D.mouseParallaxX * 0.3 : 0);
      const targetWithParallaxY = anim3D.camPosTarget.y + (anim3D.camMode === 'side' ? anim3D.mouseParallaxY * 0.2 : 0);

      anim3D.camPosCurrent.x += (targetWithParallaxX - anim3D.camPosCurrent.x) * 0.1;
      anim3D.camPosCurrent.y += (targetWithParallaxY - anim3D.camPosCurrent.y) * 0.1;
      anim3D.camPosCurrent.z += (anim3D.camPosTarget.z - anim3D.camPosCurrent.z) * 0.1;
      anim3D.camLookCurrent.lerp(anim3D.camLookTarget, 0.12);

      camera.position.copy(anim3D.camPosCurrent);
      camera.lookAt(anim3D.camLookCurrent);

      renderer.render(scene, camera);
    }

    function bind3DStageInteractionEvents(container) {
      let pointerDownPos = { x: 0, y: 0 };

      container.addEventListener('pointerdown', (e) => {
        pointerDownPos = { x: e.clientX, y: e.clientY };
        if (anim3D.camMode === 'orbit') {
          anim3D.isDraggingOrbit = true;
          anim3D.dragPrevX = e.clientX;
          anim3D.dragPrevY = e.clientY;
        }
      });

      window.addEventListener('pointermove', (e) => {
        const rect = container.getBoundingClientRect();
        const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const normY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        anim3D.mouseParallaxX = Math.max(-1, Math.min(1, normX));
        anim3D.mouseParallaxY = Math.max(-1, Math.min(1, normY));
        if(e.target===renderer.domElement&&!anim3D.isDraggingOrbit) {
          mouseVec.set(normX,normY);raycaster.setFromCamera(mouseVec,camera);
          const hit=raycaster.intersectObjects(clickable3DObjects,false)[0];
          const key=hit?.object.userData.keyChar;
          renderer.domElement.title=hit?.object.userData.isReturnLever?'回车换行 · Enter':key===' '?'空格 · Space':key?.startsWith('shift')?'大写切换 · Shift':key==='bksp'?'退格 · Backspace':key==='caps'?'大写锁定 · Caps Lock':key?key.toUpperCase():'';
        }

        if (anim3D.isDraggingOrbit && anim3D.camMode === 'orbit') {
          const dx = e.clientX - anim3D.dragPrevX;
          const dy = e.clientY - anim3D.dragPrevY;
          anim3D.orbitYaw -= dx * 0.007;
          anim3D.orbitPitch = Math.max(0.16, Math.min(1.38, anim3D.orbitPitch + dy * 0.006));
          anim3D.dragPrevX = e.clientX;
          anim3D.dragPrevY = e.clientY;
        }
      });

      window.addEventListener('pointerup', (e) => {
        anim3D.isDraggingOrbit = false;
        const moveDist = Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y);
        if (moveDist < 6 && e.target === renderer.domElement) {
          const rect = renderer.domElement.getBoundingClientRect();
          mouseVec.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
          mouseVec.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
          raycaster.setFromCamera(mouseVec, camera);

          const hits = raycaster.intersectObjects(clickable3DObjects, false);
          if (hits.length > 0) {
            const hitData = hits[0].object.userData;
            if (hitData.isReturnLever) {
              queueControl('return');
            } else if (hitData.keyChar === 'bksp') {
              queueControl('backspace');
            } else if (hitData.keyChar === 'shift_l' || hitData.keyChar === 'shift_r') {
              state.virtualShift=!state.virtualShift;trigger3DMechanicalKeyAction(hitData.keyChar);
            } else if(hitData.keyChar === 'caps') {
              state.virtualCaps=!state.virtualCaps;trigger3DMechanicalKeyAction('caps');
            } else if (hitData.keyChar) {
              const letter=state.virtualShift!==state.virtualCaps?hitData.keyChar.toUpperCase():hitData.keyChar;
              acceptNativeText(letter);state.virtualShift=false;
            }
          }
          focusHiddenInput();
        }
      });

      container.addEventListener('wheel', (e) => {
        e.preventDefault();
        if (anim3D.camMode === 'orbit' && e.ctrlKey) {
          anim3D.orbitDistance = Math.max(12, Math.min(34, anim3D.orbitDistance + e.deltaY * 0.01));
          return;
        }
        if (e.deltaY < 0) {
          state.manualScrollOffset = Math.min(state.currentLineIdx, state.manualScrollOffset + 1);
        } else {
          state.manualScrollOffset = Math.max(0, state.manualScrollOffset - 1);
        }
        soundEngine.playBackspace();
        renderHighResPaperCanvas();
        sync3DCarriageAndPaperTargets(false);
      }, { passive: false });

      window.addEventListener('resize', () => {
        if (!renderer || !camera) return;
        const w = container.clientWidth;
        const h = container.clientHeight;
        camera.aspect = w / h;
        camera.fov = THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(11)) * Math.max(1, 1.65 / (w/h))));
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      });
    }

    /*************************************************************************
     * 6. LIVE ON-PAPER PINYIN IME UI & CANDIDATE COMMIT LOGIC
     *************************************************************************/
    function updateLivePinyinOnPaper(rawPinyin, isBuiltIn = false) {
      state.compositionText = rawPinyin || '';
      const bar = document.getElementById('imeCandidateBar');
      const pinyinEl = document.getElementById('imeLivePinyinStr');
      const candListEl = document.getElementById('imeCandidateList');

      if (!state.compositionText) {
        bar.classList.add('hidden');
        state.pinyinCandidates = [];
        renderHighResPaperCanvas();
        sync3DCarriageAndPaperTargets(false);
        return;
      }

      bar.classList.remove('hidden');
      pinyinEl.textContent = formatPinyinPreview(state.compositionText);

      if (isBuiltIn) {
        state.pinyinCandidates = computeBuiltinPinyinCandidates(state.compositionText);
        candListEl.innerHTML = '';
        state.pinyinCandidates.forEach((word, idx) => {
          const btn = document.createElement('button');
          btn.className = idx === 0
            ? 'px-2 py-0.5 rounded bg-[#1B1D21] text-white font-bold cursor-pointer hover:bg-[#D14B30] transition'
            : 'px-2 py-0.5 rounded bg-[#E6E3DA] text-[#1B1D21] cursor-pointer hover:bg-[#D5D1C6] transition';
          btn.textContent = `${idx + 1}.${word}`;
          btn.addEventListener('click', (ev) => {
            ev.stopPropagation();
            commitBuiltinPinyinCandidate(idx);
          });
          candListEl.appendChild(btn);
        });
      } else {
        // OS Native IME active: show live Pinyin synced with paper
        candListEl.innerHTML = `<span class="text-xs text-[#6E6B62]">正在 3D 稿纸上实时拼写 · 按空格或数字选词压印</span>`;
      }

      // Immediately re-render the 3D paper canvas so the Pinyin string appears on the paper sheet!
      renderHighResPaperCanvas();
      sync3DCarriageAndPaperTargets(false);
    }

    function commitBuiltinPinyinCandidate(index = 0) {
      if (!state.compositionText) return;
      const chosen = state.pinyinCandidates[index] || state.pinyinCandidates[0] || state.compositionText;
      state.compositionText = '';
      state.pinyinCandidates = [];
      document.getElementById('imeCandidateBar').classList.add('hidden');
      renderHighResPaperCanvas();
      enqueueIMECommit(chosen);
      focusHiddenInput();
    }

    // Animated Live On-Paper Pinyin Demonstration ("luobiwuhui" -> "落笔无悔")
    function runLiveOnPaperPinyinDemo() {
      stopDemoTypingIfRunning();
      if (state.heroVisible) exitHeroToActiveTyping();

      const steps = [
        { type: 'pinyin', val: 'l', key: 'l' },
        { type: 'pinyin', val: 'lu', key: 'u' },
        { type: 'pinyin', val: 'luo', key: 'o' },
        { type: 'pinyin', val: 'luob', key: 'b' },
        { type: 'pinyin', val: 'luobi', key: 'i' },
        { type: 'commit', word: '落笔' },
        { type: 'pinyin', val: 'w', key: 'w' },
        { type: 'pinyin', val: 'wu', key: 'u' },
        { type: 'pinyin', val: 'wuh', key: 'h' },
        { type: 'pinyin', val: 'wuhu', key: 'u' },
        { type: 'pinyin', val: 'wuhui', key: 'i' },
        { type: 'commit', word: '无悔，' },
        { type: 'pinyin', val: 'z', key: 'z' },
        { type: 'pinyin', val: 'zh', key: 'h' },
        { type: 'pinyin', val: 'zhe', key: 'e' },
        { type: 'pinyin', val: 'zizai', key: 'i' },
        { type: 'commit', word: '字字留痕。' }
      ];

      let stepIdx = 0;
      state.demoTimer = setInterval(() => {
        if (stepIdx >= steps.length) {
          stopDemoTypingIfRunning();
          return;
        }
        const st = steps[stepIdx++];
        if (st.type === 'pinyin') {
          soundEngine.playPinyinKeyTick();
          trigger3DMechanicalKeyAction(st.key, true);
          updateLivePinyinOnPaper(st.val, true);
        } else if (st.type === 'commit') {
          updateLivePinyinOnPaper('', false);
          const demoTimer = state.demoTimer;
          state.demoTimer = null;
          enqueueMechanicalBurstString(st.word);
          state.demoTimer = demoTimer;
        }
      }, 210);
    }

    /*************************************************************************
     * 7. PAPER CHARACTER STAMPING, OVERSTRIKE & CARRIAGE RETURN LOGIC
     *************************************************************************/
    function getCellIndexAtCol(line, targetCol) {
      let colAcc = 0;
      for (let i = 0; i < line.length; i++) {
        if (colAcc === targetCol) return i;
        colAcc += line[i].colWidth;
        if (colAcc > targetCol) return i;
      }
      return -1;
    }

    function stampCharacterOnPaper(char, forceRed = false, isTypoMark = false) {
      const colWidth = getCharColWidth(char);

      if (state.currentColPos + colWidth > MAX_COLS_PER_LINE) {
        triggerCarriageReturn(true);
      }

      const activeLine = state.lines[state.currentLineIdx];
      const existingCellIdx = getCellIndexAtCol(activeLine, state.currentColPos);

      const glyphLayer = {
        char,
        color: (forceRed || state.ribbonColor === 'red') ? 'red' : 'black',
        dx: ((filmRandom() - 0.5) * 0.62).toFixed(2),
        dy: ((filmRandom() - 0.5) * 0.70).toFixed(2),
        rot: ((filmRandom() - 0.5) * 1.15).toFixed(2),
        alpha: (0.89 + filmRandom() * 0.11).toFixed(2),
        isTape: state.typoMode === 'tape' && existingCellIdx !== -1,
        isTypo: isTypoMark
      };

      if (existingCellIdx !== -1) {
        const cell = activeLine[existingCellIdx];
        if (state.typoMode === 'overstrike' && cell.colWidth === colWidth) {
          if (cell.layers.some(l => l.char !== ' ')) state.overstrikeCount++;
          cell.layers.push(glyphLayer);
        } else {
          activeLine.splice(existingCellIdx, 1, { colWidth, layers: [glyphLayer] });
        }
      } else {
        activeLine.push({ colWidth, layers: [glyphLayer] });
      }
      state.currentColPos += colWidth;

      if (!state.bellRangOnCurrentLine && state.currentColPos >= BELL_WARN_COL) {
        state.bellRangOnCurrentLine = true;
        soundEngine.playMarginBell();
        showMarginBellToast();
      }

      state.manualScrollOffset = 0;
      renderHighResPaperCanvas();
      sync3DCarriageAndPaperTargets(false);
      updateFreewriteTelemetry();
    }

    function showMarginBellToast() {
      const toast = document.getElementById('bellRingToast');
      toast.classList.remove('opacity-0');
      toast.classList.add('opacity-100');
      setTimeout(() => {
        toast.classList.remove('opacity-100');
        toast.classList.add('opacity-0');
      }, 1400);
    }

    function handleBackspaceAction() {
      stopDemoTypingIfRunning();

      // If Built-in Pinyin composition is active on paper, backspace deletes the last Pinyin letter!
      if (state.compositionText.length > 0) {
        trigger3DMechanicalKeyAction('bksp', true);
        soundEngine.playBackspace();
        updateLivePinyinOnPaper(state.compositionText.slice(0, -1), state.builtinPinyinEnabled);
        return;
      }

      trigger3DMechanicalKeyAction('bksp');
      soundEngine.playBackspace();

      const activeLine = state.lines[state.currentLineIdx];
      if (state.currentColPos > 0 && activeLine.length > 0) {
        let colAcc = 0;
        let targetCellIdx = activeLine.length - 1;
        for (let i = 0; i < activeLine.length; i++) {
          if (colAcc + activeLine[i].colWidth >= state.currentColPos) {
            targetCellIdx = i;
            break;
          }
          colAcc += activeLine[i].colWidth;
        }
        const targetCell = activeLine[targetCellIdx];
        state.currentColPos = Math.max(0, state.currentColPos - targetCell.colWidth);

        if (state.typoMode === 'erase') {
          activeLine.splice(targetCellIdx, 1);
        }
      } else if (state.mode === 'freewrite' && state.typoMode === 'erase' && state.currentLineIdx > 0 && activeLine.length === 0) {
        state.lines.pop();
        state.currentLineIdx--;
        const prevLine = state.lines[state.currentLineIdx];
        state.currentColPos = prevLine.reduce((sum, c) => sum + c.colWidth, 0);
      }

      if (state.mode === 'practice' && !state.heroVisible && state.practiceCursorIdx > 0) {
        state.practiceCursorIdx--;
        renderPracticePrompt();
      }

      state.manualScrollOffset = 0;
      renderHighResPaperCanvas();
      sync3DCarriageAndPaperTargets(false);
      updateFreewriteTelemetry();
    }

    function triggerCarriageReturn(playSoundAndLever = true) {
      stopDemoTypingIfRunning();
      if (state.compositionText) {
        updateLivePinyinOnPaper('', false);
      }
      if (playSoundAndLever) {
        soundEngine.playCarriageReturn(state.currentColPos);
      }

      state.lines.push([]);
      state.currentLineIdx = state.lines.length - 1;
      state.currentColPos = 0;
      state.bellRangOnCurrentLine = false;
      state.manualScrollOffset = 0;

      renderHighResPaperCanvas();
      sync3DCarriageAndPaperTargets(playSoundAndLever);
      updateFreewriteTelemetry();
    }

    /*************************************************************************
     * 8. SEQUENTIAL MECHANICAL BURST QUEUE FOR CHINESE IME & PASTED TEXT
     *************************************************************************/
    function enqueueMechanicalBurstString(str) {
      if (!str) return;
      stopDemoTypingIfRunning();
      if (state.heroVisible) exitHeroToActiveTyping();
      if (state.tornCardVisible) closeTornCardAndReset();
      splitCharacters(str.replace(/\r\n?/g, '\n').replace(/\t/g, '    ')).forEach(ch => state.stampQueue.push(ch));
      processNextInStampQueue();
    }
    function applyQueuedAction(action) {
      const demoTimer = state.demoTimer;
      state.demoTimer = null;
      if(action && action.kind === 'imeCommit') {
        trigger3DMechanicalKeyAction('ime_commit',false);soundEngine.playKeyClack();
        for(const ch of splitCharacters(action.text.replace(/\r\n?/g,'\n'))) {
          if(ch==='\n') triggerCarriageReturn(true);
          else handleSingleCharacterAction(ch,false);
        }
      } else if (action === '\n') triggerCarriageReturn(true);
      else if (action && action.kind === 'backspace') handleBackspaceAction();
      else handleSingleCharacterAction(action);
      state.demoTimer = demoTimer;
    }
    function queueControl(kind) {
      stopDemoTypingIfRunning();
      if (state.heroVisible) exitHeroToActiveTyping();
      if (state.tornCardVisible) closeTornCardAndReset();
      state.stampQueue.push(kind === 'return' ? '\n' : {kind});
      processNextInStampQueue();
    }
    function processNextInStampQueue() {
      if (state.isProcessingQueue) return;
      if (!state.stampQueue.length) {
        document.getElementById('stampQueueBadge').classList.add('hidden');
        return;
      }
      state.isProcessingQueue = true;
      document.getElementById('stampQueueBadge').classList.toggle('hidden', state.stampQueue.length < 3);
      const session = state.sessionId;
      applyQueuedAction(state.stampQueue.shift());
      state.queueTimer = setTimeout(() => {
        if (session !== state.sessionId) return;
        state.isProcessingQueue = false;
        processNextInStampQueue();
      }, 38);
    }

    function handleSingleCharacterAction(char, animate = true) {
      stopDemoTypingIfRunning();
      if(animate) {
      trigger3DMechanicalKeyAction(char, false);

      if (char === ' ') {
        soundEngine.playSpacebar();
      } else {
        soundEngine.playKeyClack();
      }
      }

      if (state.mode === 'practice') {
        handlePracticeCharacterInput(char);
      } else {
        handleFreewriteCharacterInput(char);
      }
    }

    /*************************************************************************
     * 9. LITERARY PRACTICE MODE & FREEWRITE STUDIO LOGIC
     *************************************************************************/
    function initPracticeQuote(quoteIndex = 0) {
      cancelPendingInput();
      state.selectedQuoteIdx = quoteIndex;
      const quoteObj = LITERARY_QUOTES[quoteIndex];
      state.practiceTargetText = quoteObj.text;
      state.practiceCursorIdx = 0;
      state.practiceCharStates = new Array(Array.from(quoteObj.text).length).fill('pending');
      state.practiceStartTime = null;
      state.practiceTotalKeystrokes = 0;
      state.practiceTyposCount = 0;
      state.overstrikeCount = 0;
      state.compositionText = '';

      // Automatically enable Built-in On-Paper Pinyin if user selects a Chinese quote!
      const isCJKQuote = /[\u4e00-\u9fa5]/.test(quoteObj.text);
      setBuiltinPinyinMode(isCJKQuote);

      state.lines = [[]];
      state.currentLineIdx = 0;
      state.currentColPos = 0;
      state.manualScrollOffset = 0;
      state.bellRangOnCurrentLine = false;
      state.paperEjectProgress = 0;

      renderPracticePrompt();
      renderHighResPaperCanvas();
      sync3DCarriageAndPaperTargets(true);
      updatePracticeLiveStats();
    }

    function renderPracticePrompt() {
      const box = document.getElementById('practicePromptBox');
      if (!box) return;
      box.innerHTML = '';

      const chars = Array.from(state.practiceTargetText);
      chars.forEach((ch, idx) => {
        const span = document.createElement('span');
        span.className = 'relative inline';

        if (idx === state.practiceCursorIdx) {
          const caret = document.createElement('span');
          caret.className = 'orange-caret absolute -left-[2px] top-[2px] bottom-[2px] w-[2.5px] bg-[#D95338] rounded-full z-10';
          span.appendChild(caret);
        }

        const textNode = document.createElement('span');
        textNode.textContent = ch;

        const st = state.practiceCharStates[idx];
        if (idx < state.practiceCursorIdx) {
          if (st === 'typo') {
            textNode.className = 'text-[#D14B30] bg-[#D14B30]/12 underline decoration-[#D14B30] rounded-xs';
          } else if (st === 'fixed') {
            textNode.className = 'text-[#1B1D21] border-b-2 border-[#D95338]';
          } else {
            textNode.className = 'text-[#1B1D21]';
          }
        } else {
          textNode.className = 'text-[#B2AEA4]';
        }

        span.appendChild(textNode);
        box.appendChild(span);
      });

      const isCJKQuote = /[\u4e00-\u9fa5]/.test(state.practiceTargetText);
      if (isCJKQuote) {
        document.getElementById('practiceWordProgress').textContent = `${state.practiceCursorIdx}/${chars.length}`;
      } else {
        const words = state.practiceTargetText.trim().split(/\s+/);
        const totalWords = words.length;
        const typedSub = chars.slice(0, state.practiceCursorIdx).join('').trim();
        const completedWords = typedSub ? typedSub.split(/\s+/).length : 0;
        document.getElementById('practiceWordProgress').textContent = `${Math.min(completedWords, totalWords)}/${totalWords}`;
      }
    }

    function updatePracticeLiveStats() {
      let wpm = 0;
      if (state.practiceStartTime && state.practiceCursorIdx > 0) {
        const elapsedMin = Math.max(0.02, (Date.now() - state.practiceStartTime) / 60000);
        const isCJKQuote = /[\u4e00-\u9fa5]/.test(state.practiceTargetText);
        wpm = Math.round((isCJKQuote ? state.practiceCursorIdx / 2 : state.practiceCursorIdx / 5) / elapsedMin);
      }
      const acc = state.practiceTotalKeystrokes > 0
        ? Math.max(0, Math.round(((state.practiceTotalKeystrokes - state.practiceTyposCount) / state.practiceTotalKeystrokes) * 100))
        : 100;

      document.getElementById('liveWpmStat').textContent = wpm;
      document.getElementById('liveAccStat').textContent = `${acc}%`;
      document.getElementById('liveTypoStat').textContent = state.practiceTyposCount;
    }

    function handlePracticeCharacterInput(inputChar) {
      if (state.heroVisible) exitHeroToActiveTyping();
      if (state.tornCardVisible) closeTornCardAndReset();
      if (!state.practiceStartTime) state.practiceStartTime = Date.now();

      const targetChars = Array.from(state.practiceTargetText);
      if (state.practiceCursorIdx >= targetChars.length) return;

      const expectedChar = targetChars[state.practiceCursorIdx];
      const isCorrect = inputChar === expectedChar;
      state.practiceTotalKeystrokes++;

      const prevState = state.practiceCharStates[state.practiceCursorIdx];
      if (!isCorrect) {
        state.practiceTyposCount++;
        state.practiceCharStates[state.practiceCursorIdx] = 'typo';
      } else {
        state.practiceCharStates[state.practiceCursorIdx] = (prevState === 'typo') ? 'fixed' : 'correct';
      }

      stampCharacterOnPaper(inputChar, false, !isCorrect);

      state.practiceCursorIdx++;
      renderPracticePrompt();
      updatePracticeLiveStats();

      if (state.practiceCursorIdx >= targetChars.length) {
        const session = state.sessionId;
        setTimeout(() => {
          if (session === state.sessionId && state.practiceCursorIdx >= targetChars.length) triggerPaperTearOffAndShowCard();
        }, 280);
      }
    }

    function handleFreewriteCharacterInput(inputChar) {
      if (state.heroVisible) exitHeroToActiveTyping();
      if (state.tornCardVisible) closeTornCardAndReset();
      if (!state.practiceStartTime) state.practiceStartTime = Date.now();
      state.practiceTotalKeystrokes++;
      stampCharacterOnPaper(inputChar, false, false);
    }

    function getPlainTextFromPaper() {
      return state.lines.map(line =>
        line.map(cell => cell.layers[cell.layers.length - 1]?.char || ' ').join('')
      ).join('\n');
    }

    function updateFreewriteTelemetry() {
      const plain = getPlainTextFromPaper();
      const nonSpaceChars = plain.replace(/\s+/g, '').length;
      document.getElementById('fwCharCount').textContent = nonSpaceChars;
      document.getElementById('fwLineCount').textContent = `${state.currentLineIdx + 1}/${state.lines.length}`;
      document.getElementById('fwColGauge').textContent = `${state.currentColPos}/${MAX_COLS_PER_LINE}`;
      document.getElementById('fwOverstrikeCount').textContent = state.overstrikeCount;

      const liveTranscriptEl = document.getElementById('fwLiveTranscript');
      const fullTextEl = document.getElementById('fullManuscriptText');
      const trimmed = plain.trim();
      if (liveTranscriptEl) {
        liveTranscriptEl.textContent = trimmed
          ? `当前行墨迹: ${plain.split('\n')[state.currentLineIdx] || '(空行)'}`
          : '支持系统中文输入法或点击顶部「纸面拼音: 内置」直接敲击字母，拼音过程会实时显示在 3D 稿纸当前落字位置上...';
      }
      if (fullTextEl) {
        fullTextEl.textContent = plain || '(当前稿纸尚无内容)';
      }
    }

    /*************************************************************************
     * 10. TORN-OFF MANUSCRIPT CARD & HIGH-RES PNG EXPORT (Video 00:17 - 00:19)
     *************************************************************************/
    function triggerPaperTearOffAndShowCard() {
      stopDemoTypingIfRunning();
      flushStampQueue();
      updateLivePinyinOnPaper('', false);

      const plainText = getPlainTextFromPaper().trim();
      if (!plainText && state.mode === 'freewrite') {
        enqueueMechanicalBurstString('Typos stay on paper.');
        return;
      }

      soundEngine.playPaperTear();
      const tearSession = state.sessionId;
      state.tornCardVisible = true;
      state.paperEjectProgress = 1;
      sync3DCarriageAndPaperTargets(false);

      const elapsedSec = state.practiceStartTime
        ? Math.max(1, Math.round((Date.now() - state.practiceStartTime) / 1000))
        : 13;
      const mins = Math.floor(elapsedSec / 60);
      const secs = String(elapsedSec % 60).padStart(2, '0');
      const durationStr = `${mins}:${secs} min`;

      const totalChars = Math.max(1, state.practiceTotalKeystrokes);
      const wpm = Math.max(12, Math.round((totalChars / 5) / Math.max(0.05, elapsedSec / 60)));
      const typos = state.mode === 'practice' ? state.practiceTyposCount : state.overstrikeCount;
      const acc = Math.max(60, Math.min(100, Math.round(((totalChars - typos) / totalChars) * 100)));

      const now = new Date();
      const dateStamp = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

      document.getElementById('cardDateStamp').textContent = dateStamp;
      document.getElementById('cardBigMetric').textContent = state.mode === 'practice' ? wpm : plainText.replace(/\s+/g, '').length;
      document.getElementById('cardBigMetricUnit').textContent = state.mode === 'practice' ? 'wpm' : '字 (手稿)';
      document.getElementById('cardAccuracyText').textContent = `${acc}% accuracy`;
      document.getElementById('cardTyposText').textContent = `${typos} ${state.mode === 'practice' ? 'typos' : '处重印留痕'}`;
      document.getElementById('cardDurationText').textContent = durationStr;

      renderManuscriptCardPreviewDOM();

      saveCurrentManuscriptToArchive({
        id: Date.now(),
        title: state.mode === 'freewrite'
          ? (document.getElementById('manuscriptTitleInput').value || '未命名手稿')
          : LITERARY_QUOTES[state.selectedQuoteIdx].title,
        date: dateStamp,
        plainText,
        wpm,
        acc,
        typos,
        durationStr,
        linesSnapshot: JSON.parse(JSON.stringify(state.lines))
      });

      setTimeout(() => {
        if (tearSession !== state.sessionId) return;
        state.tornCardVisible = true;
        document.getElementById('heroPanel').classList.add('hidden');
        document.getElementById('practiceTopPanel').classList.add('hidden');
        document.getElementById('freewriteTopPanel').classList.add('hidden');
        document.getElementById('tornCardOverlay').classList.remove('hidden');
      }, 340);
    }

    function renderManuscriptCardPreviewDOM() {
      const container = document.getElementById('cardManuscriptContent');
      container.innerHTML = '';

      state.lines.forEach((lineCells) => {
        if (lineCells.length === 0) return;
        const lineDiv = document.createElement('div');
        lineDiv.className = 'flex flex-wrap items-end min-h-[24px] mb-[3px]';

        lineCells.forEach((cell) => {
          const cellSpan = document.createElement('span');
          cellSpan.className = `card-char-cell ${cell.colWidth === 2 ? 'cjk-cell' : ''}`;

          const hasMultipleLayers = cell.layers.length > 1;
          const hasTypoFlag = cell.layers.some(l => l.isTypo);

          cell.layers.forEach((layer) => {
            if (layer.isTape) {
              const patch = document.createElement('span');
              patch.className = 'card-tape-patch';
              cellSpan.appendChild(patch);
            }
            const glyph = document.createElement('span');
            glyph.className = 'card-stamped-glyph';
            glyph.textContent = layer.char;
            glyph.style.color = layer.color === 'red' ? '#D14B30' : '#1B1D21';
            glyph.style.opacity = layer.alpha;
            glyph.style.transform = `translate(${layer.dx}px, ${layer.dy}px) rotate(${layer.rot}deg)`;
            cellSpan.appendChild(glyph);
          });

          if (hasMultipleLayers || hasTypoFlag) {
            const slash = document.createElement('span');
            slash.className = 'card-stamped-glyph text-[#D14B30] font-bold pointer-events-none';
            slash.style.transform = 'rotate(-14deg) scale(1.15)';
            slash.style.opacity = '0.86';
            slash.textContent = '/';
            cellSpan.appendChild(slash);
          }

          lineDiv.appendChild(cellSpan);
        });

        container.appendChild(lineDiv);
      });
    }

    function closeTornCardAndReset() {
      cancelPendingInput();
      state.tornCardVisible = false;
      state.paperEjectProgress = 0;
      state.compositionText = '';
      document.getElementById('tornCardOverlay').classList.add('hidden');
      document.getElementById('imeCandidateBar').classList.add('hidden');

      if (state.mode === 'practice') {
        document.getElementById('practiceTopPanel').classList.remove('hidden');
        initPracticeQuote(state.selectedQuoteIdx);
      } else {
        document.getElementById('freewriteTopPanel').classList.remove('hidden');
        state.lines = [[]];
        state.currentLineIdx = 0;
        state.currentColPos = 0;
        state.manualScrollOffset = 0;
        state.overstrikeCount = 0;
        state.practiceStartTime = null;
        state.practiceTotalKeystrokes = 0;
        renderHighResPaperCanvas();
        sync3DCarriageAndPaperTargets(true);
        updateFreewriteTelemetry();
      }
      focusHiddenInput();
    }

    function exportManuscriptCardAsPNG() {
      const scale = 2;
      const width = 620;
      const validLines = state.lines.filter(l => l.length > 0);
      const lineHeight = 34;
      const contentHeight = Math.max(130, validLines.length * lineHeight + 36);
      const height = 255 + contentHeight;

      const canvas = document.createElement('canvas');
      canvas.width = width * scale;
      canvas.height = height * scale;
      const ctx = canvas.getContext('2d');
      ctx.scale(scale, scale);

      ctx.fillStyle = '#FBF9F3';
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = '#DDD7C8';
      ctx.lineWidth = 2;
      ctx.strokeRect(14, 14, width - 28, height - 28);

      ctx.font = 'bold 19px "Courier Prime", monospace';
      ctx.fillStyle = '#1B1D21';
      ctx.fillText('clack', 44, 54);

      const dateStr = document.getElementById('cardDateStamp').textContent;
      ctx.font = '13px "Courier Prime", monospace';
      ctx.fillStyle = '#7D7970';
      ctx.textAlign = 'right';
      ctx.fillText(dateStr, width - 44, 54);
      ctx.textAlign = 'left';

      let y = 104;
      validLines.forEach((line) => {
        let x = 44;
        line.forEach((cell) => {
          const stepW = cell.colWidth === 2 ? 24 : 12;
          cell.layers.forEach((layer) => {
            if (layer.isTape) {
              ctx.fillStyle = '#FCFBF7';
              ctx.fillRect(x - 1, y - 16, stepW, 20);
            }
            ctx.save();
            ctx.translate(x + parseFloat(layer.dx), y + parseFloat(layer.dy));
            ctx.rotate((parseFloat(layer.rot) * Math.PI) / 180);
            ctx.font = '16.5px "Courier Prime", "Noto Serif SC", monospace';
            ctx.fillStyle = layer.color === 'red'
              ? `rgba(209, 75, 48, ${layer.alpha})`
              : `rgba(27, 29, 33, ${layer.alpha})`;
            ctx.fillText(layer.char, 0, 0);
            ctx.restore();
          });

          if (cell.layers.length > 1 || cell.layers.some(l => l.isTypo)) {
            ctx.save();
            ctx.font = 'bold 18px "Courier Prime", monospace';
            ctx.fillStyle = 'rgba(209, 75, 48, 0.85)';
            ctx.fillText('/', x + 1, y + 1);
            ctx.restore();
          }

          x += stepW;
        });
        y += lineHeight;
      });

      const footerY = height - 122;
      ctx.strokeStyle = '#E2DDD0';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(44, footerY);
      ctx.lineTo(width - 44, footerY);
      ctx.stroke();

      const bigVal = document.getElementById('cardBigMetric').textContent;
      const bigUnit = document.getElementById('cardBigMetricUnit').textContent;
      ctx.font = 'bold 44px "Courier Prime", monospace';
      ctx.fillStyle = '#1B1D21';
      ctx.fillText(bigVal, 44, footerY + 54);

      const valWidth = ctx.measureText(bigVal).width;
      ctx.font = '18px "Courier Prime", "Noto Serif SC", monospace';
      ctx.fillStyle = '#5A5750';
      ctx.fillText(bigUnit, 44 + valWidth + 10, footerY + 54);

      ctx.font = '12px "Courier Prime", monospace';
      ctx.fillStyle = '#6E6B62';
      const accTxt = document.getElementById('cardAccuracyText').textContent;
      const typoTxt = document.getElementById('cardTyposText').textContent;
      const durTxt = document.getElementById('cardDurationText').textContent;
      ctx.fillText(`${accTxt}   ·   ${typoTxt}   ·   ${durTxt}`, 44, footerY + 86);

      const link = document.createElement('a');
      link.download = `clack-3d-manuscript-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }

    function exportManuscriptAsTXT() {
      const text = getPlainTextFromPaper();
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
      const link = document.createElement('a');
      link.download = `clack-manuscript-${Date.now()}.txt`;
      link.href = URL.createObjectURL(blob);
      link.click();
    }

    /*************************************************************************
     * 11. ARCHIVE DRAWER STORAGE
     *************************************************************************/
    function loadArchiveFromStorage() {
      try {
        const raw = localStorage.getItem('clack_3d_archive_v3');
        if (raw) state.archive = JSON.parse(raw);
      } catch (e) {
        state.archive = [];
      }
      document.getElementById('archiveCountBadge').textContent = state.archive.length;
    }

    function saveCurrentManuscriptToArchive(item) {
      state.archive.unshift(item);
      if (state.archive.length > 30) state.archive.pop();
      try {
        localStorage.setItem('clack_3d_archive_v3', JSON.stringify(state.archive));
      } catch (e) {}
      document.getElementById('archiveCountBadge').textContent = state.archive.length;
    }

    function escapeHTML(value) {
      const span=document.createElement('span');span.textContent=String(value ?? '');return span.innerHTML;
    }
    function renderArchiveModalList() {
      const listEl = document.getElementById('archiveListContainer');
      if (state.archive.length === 0) {
        listEl.innerHTML = `
          <div class="text-center py-12 text-[#7D7970] font-typewriter">
            <p class="text-base mb-1">档案柜暂无撕下的手稿</p>
            <p class="text-xs">完成一段跟打或点击右上角「撕下稿纸」即可自动归档于此</p>
          </div>
        `;
        return;
      }

      listEl.innerHTML = '';
      state.archive.forEach((entry) => {
        const card = document.createElement('div');
        card.className = 'paper-card-surface p-4 rounded border border-[#D8D3C5] flex flex-col gap-2';
        card.innerHTML = `
          <div class="flex items-center justify-between text-xs font-typewriter text-[#77736A]">
            <strong class="text-[#1B1D21] text-sm">${escapeHTML(entry.title)}</strong>
            <span>${entry.date}</span>
          </div>
          <div class="font-typewriter text-xs text-[#222] whitespace-pre-wrap bg-white/60 p-2.5 rounded border border-[#EAE6DA] max-h-28 overflow-y-auto">${escapeHTML(entry.plainText || '(空白稿纸)')}</div>
          <div class="flex items-center justify-between text-[11px] font-mono text-[#6E6B62] pt-1">
            <span>速度: ${entry.wpm} WPM · 准确率: ${entry.acc}% · 留痕: ${entry.typos}</span>
            <button data-reload-id="${entry.id}" class="text-[#D14B30] hover:underline font-medium cursor-pointer">重新装入 3D 滚筒继续写 →</button>
          </div>
        `;
        card.querySelector('[data-reload-id]').addEventListener('click', () => {
          state.lines = JSON.parse(JSON.stringify(entry.linesSnapshot));
          state.currentLineIdx = state.lines.length - 1;
          state.currentColPos = state.lines[state.currentLineIdx].reduce((sum, c) => sum + c.colWidth, 0);
          state.paperEjectProgress = 0;
          document.getElementById('archiveModal').classList.add('hidden');
          switchMode('freewrite');
          exitHeroToActiveTyping();
          renderHighResPaperCanvas();
          sync3DCarriageAndPaperTargets(false);
          updateFreewriteTelemetry();
        });
        listEl.appendChild(card);
      });
    }

    /*************************************************************************
     * 12. HERO TRANSITION, BUILT-IN PINYIN TOGGLE & KEYBOARD BINDINGS
     *************************************************************************/
    function setBuiltinPinyinMode(enabled) {
      state.builtinPinyinEnabled = enabled;
      state.compositionText = '';
      document.getElementById('imeCandidateBar').classList.add('hidden');
      const dot = document.getElementById('pinyinStatusDot');
      const label = document.getElementById('pinyinStatusLabel');
      if (enabled) {
        dot.className = 'w-2 h-2 rounded-full bg-[#D14B30] ring-2 ring-[#D14B30]/35';
        label.textContent = '纸面拼音: 内置开启';
        label.className = 'text-[#D14B30] font-bold';
      } else {
        dot.className = 'w-2 h-2 rounded-full bg-[#8C887F]';
        label.textContent = '纸面拼音: 自动(OS)';
        label.className = '';
      }
      renderHighResPaperCanvas();
      sync3DCarriageAndPaperTargets(false);
    }

    function exitHeroToActiveTyping() {
      stopDemoTypingIfRunning();
      if (!state.heroVisible) return;
      state.heroVisible = false;

      const hero = document.getElementById('heroPanel');
      hero.classList.add('hero-hidden');

      state.lines = [[]];
      state.currentLineIdx = 0;
      state.currentColPos = 0;
      state.manualScrollOffset = 0;
      state.bellRangOnCurrentLine = false;
      state.paperEjectProgress = 0;
      state.compositionText = '';
      renderHighResPaperCanvas();
      sync3DCarriageAndPaperTargets(true);

      hero.classList.add('hidden');
      if (state.mode === 'practice') {
        document.getElementById('practiceTopPanel').classList.remove('hidden');
        initPracticeQuote(state.selectedQuoteIdx);
      } else {
        document.getElementById('freewriteTopPanel').classList.remove('hidden');
        updateFreewriteTelemetry();
      }

      focusHiddenInput();
    }

    function switchMode(newMode) {
      cancelPendingInput();
      stopDemoTypingIfRunning();
      state.mode = newMode;
      state.tornCardVisible = false;
      state.paperEjectProgress = 0;
      state.compositionText = '';
      document.getElementById('tornCardOverlay').classList.add('hidden');
      document.getElementById('imeCandidateBar').classList.add('hidden');

      document.querySelectorAll('.mode-tab').forEach(btn => {
        if (btn.dataset.mode === newMode) {
          btn.className = 'mode-tab px-3 py-1.5 rounded-full font-medium transition text-[#1B1D21] bg-[#DFDDD5] cursor-pointer';
        } else {
          btn.className = 'mode-tab px-3 py-1.5 rounded-full font-medium transition text-[#6E6B64] hover:text-[#1B1D21] cursor-pointer';
        }
      });

      if (state.heroVisible) {
        exitHeroToActiveTyping();
      } else {
        if (newMode === 'practice') {
          document.getElementById('freewriteTopPanel').classList.add('hidden');
          document.getElementById('practiceTopPanel').classList.remove('hidden');
          initPracticeQuote(state.selectedQuoteIdx);
        } else {
          document.getElementById('practiceTopPanel').classList.add('hidden');
          document.getElementById('freewriteTopPanel').classList.remove('hidden');
          state.lines = [[]];
          state.currentLineIdx = 0;
          state.currentColPos = 0;
          state.manualScrollOffset = 0;
          renderHighResPaperCanvas();
          sync3DCarriageAndPaperTargets(true);
          updateFreewriteTelemetry();
        }
      }
      focusHiddenInput();
    }

    function runHeroGreetingDemo() {
      const demoStr = 'hello there';
      let i = 0;
      state.demoTimer = setInterval(() => {
        if (!state.heroVisible || i >= demoStr.length) {
          stopDemoTypingIfRunning();
          return;
        }
        const ch = demoStr[i];
        trigger3DMechanicalKeyAction(ch, false);
        stampCharacterOnPaper(ch, false, false);
        i++;
      }, 115);
    }

    function stopDemoTypingIfRunning() {
      if (state.demoTimer) {
        clearInterval(state.demoTimer);
        state.demoTimer = null;
      }
    }

    function focusHiddenInput() {
      const active = document.activeElement;
      if (
        active === document.getElementById('manuscriptTitleInput') ||
        active === document.getElementById('pasteBurstInput') ||
        active === document.getElementById('quoteSelector')
      ) {
        return;
      }
      const ime = document.getElementById('imeInput');
      if (ime) ime.focus({ preventScroll: true });
    }

      function acceptNativeText(val) {
        if (!val) return;
        if (state.heroVisible) exitHeroToActiveTyping();
        if (state.builtinPinyinEnabled && /^[a-zA-Z]$/.test(val)) {
          flushStampQueue();
          soundEngine.playPinyinKeyTick();
          trigger3DMechanicalKeyAction(val, true);
          updateLivePinyinOnPaper(state.compositionText + val.toLowerCase(), true);
          return;
        }
        if (state.builtinPinyinEnabled && state.compositionText) {
          if (val === ' ' || /^[1-5]$/.test(val)) {
            playIMEKey(val);
            commitBuiltinPinyinCandidate(val === ' ' ? 0 : Number(val) - 1); return;
          }
          const raw = state.compositionText;
          updateLivePinyinOnPaper('', false);
          enqueueMechanicalBurstString(raw);
        }
        enqueueMechanicalBurstString(val);
      }

    function keyFromPhysicalEvent(e) {
      if (/^Key[A-Z]$/.test(e.code || '')) return e.code.slice(3).toLowerCase();
      if (/^Digit[0-9]$/.test(e.code || '')) return e.code.slice(5);
      const codes={Space:' ',Backspace:'bksp',Minus:'-',Equal:'=',BracketLeft:'[',BracketRight:']',Semicolon:';',Quote:"'",Comma:',',Period:'.',Slash:'/',Backslash:'\\'};
      if (codes[e.code] !== undefined) return codes[e.code];
      return /^[a-z0-9 ,.;'\[\]\/=-]$/i.test(e.key || '') ? e.key.toLowerCase() : null;
    }
    function playIMEKey(key) {
      if (key === null) return;
      trigger3DMechanicalKeyAction(key, true);
      if(key==='bksp') soundEngine.playBackspace();
      else if(key===' ') soundEngine.playSpacebar();
      else soundEngine.playPinyinKeyTick();
    }
    function animateIMEPhysicalEvent(e) {
      const key=keyFromPhysicalEvent(e);
      if(key === null) return;
      playIMEKey(key);
      state.imePhysicalPending=key;
    }
    function syncNativeIMEPreview(raw) {
      if(!state.isComposingIME) return;
      raw=raw || '';
      const old=state.imeVisualRaw;
      if(raw === old) return; // compositionupdate / beforeinput / input share one edit.
      state.imeVisualRaw=raw;
      let common=0;
      while(common<old.length && common<raw.length && old[common]===raw[common]) common++;
      const added=raw.slice(common).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
      // Hardware already animated this edit. Soft keyboards use the changed Latin suffix.
      if(state.imePhysicalPending === null) {
        const letters=Array.from(added).filter(ch=>/^[a-z]$/.test(ch));
        if(letters.length) letters.forEach((key,i)=>{
          if(i===0) playIMEKey(key);
          else state.imeVisualTimers.push(setTimeout(()=>{
            if(state.isComposingIME) playIMEKey(key);
          }, i*34));
        });
        else if(raw.length<old.length && /^[a-z ']*$/i.test(raw+old)) playIMEKey('bksp');
      }
      state.imePhysicalPending=null;
      updateLivePinyinOnPaper(raw,false);
    }
    function enqueueIMECommit(text) {
      if(!text) return;
      stopDemoTypingIfRunning();
      if(state.heroVisible) exitHeroToActiveTyping();
      if(state.tornCardVisible) closeTornCardAndReset();
      state.stampQueue.push({kind:'imeCommit',text});
      processNextInStampQueue();
    }

    function bindAllUIAndKeyboardEvents() {
      const imeInput = document.getElementById('imeInput');

      // Populate Quote Selector
      const selector = document.getElementById('quoteSelector');
      LITERARY_QUOTES.forEach((q, idx) => {
        const opt = document.createElement('option');
        opt.value = idx;
        opt.textContent = q.title;
        selector.appendChild(opt);
      });
      selector.addEventListener('change', (e) => {
        initPracticeQuote(parseInt(e.target.value, 10));
        focusHiddenInput();
      });

      // Composition is a transient overlay. Only compositionend commits it.
      // Match the browser's trailing echo by payload/type, never by a time window.
      imeInput.addEventListener('compositionstart', () => {
        const firstPhysicalKey = state.imePhysicalPending;
        stopDemoTypingIfRunning();
        if (state.heroVisible) exitHeroToActiveTyping();
        if (state.tornCardVisible) closeTornCardAndReset();
        flushStampQueue();
        state.pendingCompositionEcho = null;
        state.isComposingIME = true;
        state.imeVisualRaw='';state.imePhysicalPending=firstPhysicalKey;
        updateLivePinyinOnPaper('', false);
      });
      imeInput.addEventListener('compositionupdate', e => {
        if (!state.isComposingIME) return;
        syncNativeIMEPreview(e.data || '');
      });
      imeInput.addEventListener('compositionend', e => {
        if (!state.isComposingIME) { imeInput.value = ''; return; }
        state.isComposingIME = false;
        state.imeVisualTimers.forEach(clearTimeout);state.imeVisualTimers=[];
        state.imeVisualRaw='';state.imePhysicalPending=null;
        const committed = e.data || '';
        state.pendingCompositionEcho = committed;
        updateLivePinyinOnPaper('', false);
        imeInput.value = '';
        if (committed) enqueueIMECommit(committed);
      });
      imeInput.addEventListener('beforeinput', e => {
        if (state.isComposingIME || e.isComposing) {
          if(state.isComposingIME && e.inputType === 'insertCompositionText' && e.data !== null) syncNativeIMEPreview(e.data);
          return;
        }
        if (e.inputType === 'deleteContentBackward') {
          e.preventDefault(); queueControl('backspace');
        } else if (e.inputType === 'insertLineBreak' || e.inputType === 'insertParagraph') {
          e.preventDefault(); queueControl('return');
        } else if (!['insertFromComposition', 'insertCompositionText'].includes(e.inputType)) {
          // A fresh edit supersedes an old echo; the next real identical character is valid.
          if (e.inputType === 'insertText') state.pendingCompositionEcho = null;
        }
      });
      imeInput.addEventListener('input', e => {
        if (state.isComposingIME || e.isComposing) {
          if(state.isComposingIME && e.inputType === 'insertCompositionText') syncNativeIMEPreview(imeInput.value || e.data || '');
          return;
        }
        const val = imeInput.value || e.data || '';
        imeInput.value = '';
        const echo = state.pendingCompositionEcho;
        state.pendingCompositionEcho = null;
        if (echo !== null && (val === echo || e.inputType === 'insertFromComposition' || e.inputType === 'insertCompositionText')) return;
        acceptNativeText(val);
      });

      // Global Physical Keyboard Listener
      window.addEventListener('keydown', (e) => {
        if (
          document.activeElement === document.getElementById('manuscriptTitleInput') ||
          document.activeElement === document.getElementById('pasteBurstInput')
        ) {
          return;
        }
        if (!document.getElementById('archiveModal').classList.contains('hidden')) return;
        if (!document.getElementById('specModal').classList.contains('hidden')) return;

        // Windows Process/229 events carry the actual physical key in code.
        if (state.isComposingIME || e.isComposing || e.keyCode === 229) {
          if(state.heroVisible) exitHeroToActiveTyping();
          if(state.tornCardVisible) closeTornCardAndReset();
          animateIMEPhysicalEvent(e);
          return;
        }

        if (e.key === 'Shift') trigger3DMechanicalKeyAction(e.code === 'ShiftRight' ? 'shift_r' : 'shift_l');
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        state.pendingCompositionEcho = null;
        state.imePhysicalPending = null;
        if (e.target !== imeInput && e.target.closest('input,textarea,select,button,a')) return;

        if (e.key === 'Tab' && state.tornCardVisible) {
          e.preventDefault();
          closeTornCardAndReset();
          return;
        }

        if (e.key === 'Escape' && state.compositionText) {
          e.preventDefault();
          updateLivePinyinOnPaper('', false);
          return;
        }

        if (e.key === 'Enter') {
          e.preventDefault();
          if (state.heroVisible) {
            exitHeroToActiveTyping();
          } else if (state.compositionText) {
            // Commit raw English letters if Enter pressed during Built-in Pinyin
            const raw = state.compositionText;
            updateLivePinyinOnPaper('', false);
            enqueueMechanicalBurstString(raw);
          } else {
            queueControl('return');
          }
          return;
        }

        if (e.key === 'Backspace') {
          e.preventDefault();
          if (state.compositionText) handleBackspaceAction();
          else queueControl('backspace');
          return;
        }

        if (e.key.length === 1) {
          focusHiddenInput();
          if (document.activeElement !== imeInput) {
            e.preventDefault();
            if (state.builtinPinyinEnabled && /^[a-zA-Z]$/.test(e.key)) {
              soundEngine.playPinyinKeyTick();
              trigger3DMechanicalKeyAction(e.key, true);
              updateLivePinyinOnPaper(state.compositionText + e.key.toLowerCase(), true);
            } else if (state.builtinPinyinEnabled && state.compositionText && e.key === ' ') {
              commitBuiltinPinyinCandidate(0);
            } else if (state.builtinPinyinEnabled && state.compositionText && /^[1-5]$/.test(e.key)) {
              commitBuiltinPinyinCandidate(parseInt(e.key, 10) - 1);
            } else {
              handleSingleCharacterAction(e.key);
            }
          }
        }
      });

      // Paste Support
      window.addEventListener('paste', (e) => {
        if (
          document.activeElement === document.getElementById('manuscriptTitleInput') ||
          document.activeElement === document.getElementById('pasteBurstInput')
        ) {
          return;
        }
        e.preventDefault();
        const pasted = (e.clipboardData || window.clipboardData).getData('text');
        if (pasted) {
          if (state.heroVisible) exitHeroToActiveTyping();
          enqueueMechanicalBurstString(pasted);
        }
      });

      document.addEventListener('click', (e) => {
        const tag = (e.target.tagName || '').toLowerCase();
        if (tag !== 'input' && tag !== 'select' && tag !== 'button') {
          focusHiddenInput();
        }
      });

      // 3D Camera Preset Buttons
      document.querySelectorAll('.cam-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          set3DCameraPreset(btn.dataset.cam);
          focusHiddenInput();
        });
      });

      // Built-in Pinyin Mode Toggle Button
      document.getElementById('builtinPinyinBtn').addEventListener('click', () => {
        setBuiltinPinyinMode(!state.builtinPinyinEnabled);
        soundEngine.playBackspace();
        focusHiddenInput();
      });

      // Hero Buttons
      document.getElementById('startPracticeHeroBtn').addEventListener('click', () => {
        state.mode = 'practice';
        exitHeroToActiveTyping();
      });

      document.getElementById('startFreewriteHeroBtn').addEventListener('click', () => {
        switchMode('freewrite');
      });

      document.getElementById('heroTryPinyinBtn').addEventListener('click', () => {
        switchMode('freewrite');
        setBuiltinPinyinMode(true);
        setTimeout(() => {
          runLiveOnPaperPinyinDemo();
        }, 320);
      });

      document.getElementById('brandHomeBtn').addEventListener('click', () => {
        cancelPendingInput();
        stopDemoTypingIfRunning();
        state.heroVisible = true;
        state.tornCardVisible = false;
        state.paperEjectProgress = 0;
        state.compositionText = '';
        document.getElementById('tornCardOverlay').classList.add('hidden');
        document.getElementById('practiceTopPanel').classList.add('hidden');
        document.getElementById('freewriteTopPanel').classList.add('hidden');
        document.getElementById('imeCandidateBar').classList.add('hidden');
        const hero = document.getElementById('heroPanel');
        hero.classList.remove('hidden', 'hero-hidden');
        state.lines = [[]];
        state.currentLineIdx = 0;
        state.currentColPos = 0;
        renderHighResPaperCanvas();
        sync3DCarriageAndPaperTargets(true);
        runHeroGreetingDemo();
      });

      document.querySelectorAll('.mode-tab').forEach((btn) => {
        btn.addEventListener('click', () => switchMode(btn.dataset.mode));
      });

      // Ribbon Color Toggle
      document.getElementById('ribbonToggleBtn').addEventListener('click', () => {
        state.ribbonColor = state.ribbonColor === 'black' ? 'red' : 'black';
        const dotBlack = document.getElementById('ribbonDotBlack');
        const dotRed = document.getElementById('ribbonDotRed');
        const label = document.getElementById('ribbonLabel');
        if (state.ribbonColor === 'red') {
          dotBlack.className = 'w-2.5 h-2.5 rounded-full bg-[#1B1D21] opacity-40';
          dotRed.className = 'w-2.5 h-2.5 rounded-full bg-[#D14B30] -ml-1 ring-2 ring-offset-1 ring-[#D14B30]';
          label.textContent = '红墨';
          label.className = 'hidden xl:inline text-[#D14B30] font-bold';
        } else {
          dotBlack.className = 'w-2.5 h-2.5 rounded-full bg-[#1B1D21] ring-2 ring-offset-1 ring-[#1B1D21]';
          dotRed.className = 'w-2.5 h-2.5 rounded-full bg-[#D14B30] -ml-1 opacity-40';
          label.textContent = '黑墨';
          label.className = 'hidden xl:inline';
        }
        soundEngine.playBackspace();
        focusHiddenInput();
      });

      // Typo Mode Toggle
      document.getElementById('typoModeBtn').addEventListener('click', () => {
        const order = ['overstrike', 'tape', 'erase'];
        const labels = {
          overstrike: '退格: 重叠留痕',
          tape: '退格: 白色涂改带',
          erase: '退格: 现代擦除'
        };
        state.typoMode = order[(order.indexOf(state.typoMode) + 1) % order.length];
        document.getElementById('typoModeLabel').textContent = labels[state.typoMode];
        soundEngine.playBackspace();
        focusHiddenInput();
      });

      // Sound Toggle
      document.getElementById('soundToggleBtn').addEventListener('click', () => {
        soundEngine.enabled = !soundEngine.enabled;
        document.getElementById('soundLabel').textContent = `音效: ${soundEngine.enabled ? '开' : '关'}`;
        if (soundEngine.enabled) soundEngine.playKeyClack();
        focusHiddenInput();
      });

      // Tear Off Paper
      document.getElementById('tearOffBtn').addEventListener('click', () => {
        if (state.heroVisible) exitHeroToActiveTyping();
        triggerPaperTearOffAndShowCard();
      });

      // Writer Studio Controls
      document.getElementById('resetPracticeBtn').addEventListener('click', () => {
        initPracticeQuote(state.selectedQuoteIdx);
        focusHiddenInput();
      });

      document.getElementById('clearSheetBtn').addEventListener('click', closeTornCardAndReset);

      document.getElementById('demoPinyinProcessBtn').addEventListener('click', () => {
        setBuiltinPinyinMode(true);
        runLiveOnPaperPinyinDemo();
        focusHiddenInput();
      });

      document.getElementById('toggleFullManuscriptBtn').addEventListener('click', (e) => {
        const drawer = document.getElementById('fullManuscriptDrawer');
        drawer.classList.toggle('hidden');
        e.target.textContent = drawer.classList.contains('hidden') ? '展开全文对照' : '收起全文对照';
      });

      document.getElementById('pasteBurstInput').addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && e.target.value.trim()) {
          e.preventDefault();
          const txt = e.target.value;
          e.target.value = '';
          enqueueMechanicalBurstString(txt);
          focusHiddenInput();
        }
      });

      document.getElementById('scrollPaperUpBtn').addEventListener('click', () => {
        state.manualScrollOffset = Math.min(state.currentLineIdx, state.manualScrollOffset + 1);
        soundEngine.playBackspace();
        renderHighResPaperCanvas();
        sync3DCarriageAndPaperTargets(false);
      });

      document.getElementById('scrollPaperDownBtn').addEventListener('click', () => {
        state.manualScrollOffset = 0;
        soundEngine.playBackspace();
        renderHighResPaperCanvas();
        sync3DCarriageAndPaperTargets(false);
      });

      // Card Buttons
      document.getElementById('cardTryAgainBtn').addEventListener('click', closeTornCardAndReset);
      document.getElementById('cardDownloadPngBtn').addEventListener('click', exportManuscriptCardAsPNG);
      document.getElementById('cardDownloadTxtBtn').addEventListener('click', exportManuscriptAsTXT);

      // Modals
      document.getElementById('openArchiveBtn').addEventListener('click', () => {
        renderArchiveModalList();
        document.getElementById('archiveModal').classList.remove('hidden');
      });
      document.getElementById('closeArchiveBtn').addEventListener('click', () => {
        document.getElementById('archiveModal').classList.add('hidden');
        focusHiddenInput();
      });

      document.getElementById('openSpecBtn').addEventListener('click', () => {
        document.getElementById('specModal').classList.remove('hidden');
      });
      document.getElementById('closeSpecBtn').addEventListener('click', () => {
        document.getElementById('specModal').classList.add('hidden');
        focusHiddenInput();
      });

      document.querySelectorAll('[data-test-sound]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const type = btn.dataset.testSound;
          soundEngine.enabled = true;
          if (type === 'clack') {
            trigger3DMechanicalKeyAction('e', false);
            soundEngine.playKeyClack();
          } else if (type === 'space') {
            trigger3DMechanicalKeyAction(' ', false);
            soundEngine.playSpacebar();
          } else if (type === 'bell') {
            soundEngine.playMarginBell();
            showMarginBellToast();
          } else if (type === 'return') {
            triggerCarriageReturn(true);
          } else if (type === 'pinyin') {
            document.getElementById('specModal').classList.add('hidden');
            switchMode('freewrite');
            setBuiltinPinyinMode(true);
            runLiveOnPaperPinyinDemo();
          }
        });
      });
    }

    /*************************************************************************
     * 13. INITIALIZE ON WINDOW LOAD
     *************************************************************************/

let filmPaperCache='';
window.initClackFilm=()=>{
 state.mode='freewrite';state.heroVisible=false;state.tornCardVisible=false;soundEngine.enabled=false;
 initHighResPaperCanvas();initThreeJSTypewriter();renderer.setPixelRatio(1);renderer.setSize(1920,1080);camera.aspect=1920/1080;camera.fov=22;camera.updateProjectionMatrix();
 return {
  render(p){
   const t=p.time,ms=t*1000;
   const key=JSON.stringify([p.text||'',p.composition||'']);
   if(key!==filmPaperCache){
    filmPaperCache=key;state.lines=[[]];state.currentLineIdx=0;state.currentColPos=0;
    for(const [i,ch]of splitCharacters(p.text||'').entries()){
     const w=getCharColWidth(ch);
     if(ch==='\n'||state.currentColPos+w>MAX_COLS_PER_LINE){state.lines.push([]);state.currentLineIdx++;state.currentColPos=0;if(ch==='\n')continue;}
     state.lines[state.currentLineIdx].push({colWidth:w,layers:[{char:ch,color:'black',dx:Math.sin(i*7)*.13,dy:Math.sin(i*11)*.1,rot:Math.sin(i*17)*.45,alpha:.96,isTape:false,isTypo:false}]});state.currentColPos+=w;
    }
    state.compositionText=p.composition||'';state.manualScrollOffset=0;renderHighResPaperCanvas();
   }
   const cols=state.currentColPos;const step=7*PAPER_COL_PX/PAPER_CANVAS_W;
   carriageGroup.position.x=3.5-PAPER_LEFT_MARGIN*7/PAPER_CANVAS_W-cols*step+(p.recoil||0);
   paperMesh3D.position.y=2.15+(p.eject||0)*6.6;
   platenRollerMesh.rotation.x=-state.currentLineIdx*.42-(p.eject||0)*1.6;leftKnobMesh.rotation.x=platenRollerMesh.rotation.x;rightKnobMesh.rotation.x=platenRollerMesh.rotation.x;
   returnLeverGroup.rotation.z=p.lever||0;
   const recent=(p.events||[]).filter(e=>e.at<=t);
   for(const [id,k]of keycap3DMap){
    const event=recent.findLast(e=>e.key===id);const age=event?t-event.at:999;
    k.glowStartedAt=event?event.at*1000:-10000;
    updateKeyGlow(k,ms);
    const down=age<.105?-.16*(1-Math.exp(-age*110)):-.16*Math.exp(-(age-.105)*34);
    k.group.position.y=k.baseY+down;
   }
   for(let i=0;i<typebar3DList.length;i++){
    const event=recent.findLast(e=>e.key!==' '&&!e.key.startsWith('shift')&&((e.key.charCodeAt(0)*13)%typebar3DList.length)===i);
    const age=event?t-event.at:999;
    typebar3DList[i].group.rotation.x=age<.35?.98*Math.sin(Math.min(1,age/.025)*Math.PI/2)*Math.exp(-age*18):0;
   }
   const last=recent.findLast(e=>e.key!==' '),age=last?t-last.at:999;
   ribbonVibratorGroup.position.y=1.75+(age<.2?.14*Math.sin(Math.min(1,age/.02)*Math.PI/2)*Math.exp(-age*24):0);
   typewriterRoot.position.y=age<.15?-.018*Math.exp(-age*25):0;
   camera.position.set(...p.camera);camera.lookAt(new THREE.Vector3(...p.look));camera.updateMatrixWorld();renderer.render(scene,camera);
  }
 };
};
