// ═══════════════════════════════════════════════════════
// SCORING ENGINE
// ═══════════════════════════════════════════════════════
function scoreCrop(key, inp) {
  const db = CROP_DB[key];
  const params = [
    ['N',    inp.n,    db.N,    1.4],
    ['P',    inp.p,    db.P,    0.9],
    ['K',    inp.k,    db.K,    0.9],
    ['temp', inp.temp, db.temp, 2.0],
    ['hum',  inp.hum,  db.hum,  1.5],
    ['ph',   inp.ph,   db.ph,   1.8],
    ['rain', inp.rain, db.rain, 2.0]
  ];
  
  let tw = 0, ws = 0, matched = [], missed = [];
  
  params.forEach(([name, val, range, w]) => {
    const [iMin, iMax, aMin, aMax] = range;
    tw += w;
    let s;
    if (val >= iMin && val <= iMax) {
      s = 100;
      matched.push(name);
    } else if (val < aMin || val > aMax) {
      s = 0;
      missed.push(name);
    } else if (val < iMin) {
      s = ((val - aMin) / (iMin - aMin)) * 70;
    } else {
      s = 100 - ((val - iMax) / (aMax - iMax)) * 70;
    }
    ws += s * w;
  });
  
  let fs = ws / tw;
  const soil = document.getElementById('soil-type')?.value || 'any';
  if (soil !== 'any' && SOIL_BONUS[key]?.[soil]) {
    fs = Math.min(100, fs + SOIL_BONUS[key][soil] * fs);
  }
  
  return { score: fs, matched, missed };
}

function getAllRanked(inp) {
  return Object.keys(CROP_DB).map(k => {
    const db = CROP_DB[k];
    const params = [
      ['N',    inp.n,    db.N,    1.4],
      ['P',    inp.p,    db.P,    0.9],
      ['K',    inp.k,    db.K,    0.9],
      ['temp', inp.temp, db.temp, 2.0],
      ['hum',  inp.hum,  db.hum,  1.5],
      ['ph',   inp.ph,   db.ph,   1.8],
      ['rain', inp.rain, db.rain, 2.0]
    ];
    
    let tw = 0, ws = 0, matched = [], missed = [];
    
    params.forEach(([name, val, range, w]) => {
      const [iMin, iMax, aMin, aMax] = range;
      tw += w;
      let s;
      if (val >= iMin && val <= iMax) {
        s = 100;
        matched.push(name);
      } else if (val < aMin || val > aMax) {
        s = 0;
        missed.push(name);
      } else if (val < iMin) {
        s = ((val - aMin) / (iMin - aMin)) * 70;
      } else {
        s = 100 - ((val - iMax) / (aMax - iMax)) * 70;
      }
      ws += s * w;
    });
    
    let fs = ws / tw;
    const soil = document.getElementById('soil-type')?.value || 'any';
    if (soil !== 'any' && SOIL_BONUS[k]?.[soil]) {
      fs = Math.min(100, fs + SOIL_BONUS[k][soil] * fs);
    }
    
    return { k, score: fs, matched, missed };
  }).sort((a, b) => b.score - a.score);
}

function getInputs() {
  return {
    n:    +document.getElementById('n').value,
    p:    +document.getElementById('p').value,
    k:    +document.getElementById('k').value,
    temp: +document.getElementById('temp').value,
    hum:  +document.getElementById('hum').value,
    ph:   +document.getElementById('ph').value,
    rain: +document.getElementById('rain').value
  };
}

// ═══════════════════════════════════════════════════════
// UI HELPERS
// ═══════════════════════════════════════════════════════
function updateSlider(id) {
  const el = document.getElementById(id);
  const dv = document.getElementById(id + '-value');
  if (el && dv) {
    dv.textContent = parseFloat(el.value) % 1 !== 0 ? parseFloat(el.value).toFixed(1) : el.value;
  }
}

function updateAllSliders() {
  ['n', 'p', 'k', 'temp', 'hum', 'ph', 'rain', 'yn', 'yp', 'yk', 'ya'].forEach(id => {
    const el = document.getElementById(id);
    if (el) updateSlider(id);
  });
}

function resetSliders() {
  const d = { n: 50, p: 50, k: 50, temp: 25, hum: 65, ph: 6.5, rain: 150 };
  Object.entries(d).forEach(([id, v]) => {
    const el = document.getElementById(id);
    if (el) {
      el.value = v;
      updateSlider(id);
    }
  });
  document.getElementById('live-preview').innerHTML = '';
  document.getElementById('crop-result-area').innerHTML = '';
  livePreviewCrop();
  toast('Sliders reset');
}

// ═══════════════════════════════════════════════════════
// LIVE PREVIEW
// ═══════════════════════════════════════════════════════
let lvt;

function livePreviewCrop() {
  clearTimeout(lvt);
  lvt = setTimeout(() => {
    const inp = getInputs();
    const ranked = getAllRanked(inp);
    const top = ranked[0];
    const cls = top.score > 70 ? 'res-success' : top.score > 45 ? 'res-warning' : 'res-danger';
    document.getElementById('live-preview').innerHTML = `
      <div class="res-card ${cls}" style="display:flex;justify-content:space-between;align-items:center;padding:0.5rem 0.75rem;">
        <span style="font-size:0.83rem;font-weight:600;">${CROP_DB[top.k].emoji} Top match: <strong>${lcn(top.k)}</strong></span>
        <span style="font-weight:800;color:var(--green);">${top.score.toFixed(0)}%</span>
      </div>`;
  }, 80);
}

// ═══════════════════════════════════════════════════════
// SOIL METER
// ═══════════════════════════════════════════════════════
function soilMeter(label, val, min, max, unit = '') {
  const pct = ((val - min) / (max - min)) * 100;
  const mid = (max - min) * 0.5 + min;
  const cls = val < mid * 0.5 ? 's-low' : val > mid * 1.5 ? 's-high' : 's-ok';
  const txt = val < mid * 0.5 ? 'Low' : val > mid * 1.5 ? 'High' : 'OK';
  return `<div class="soil-meter">
    <div class="m-label">${label}</div>
    <div class="m-val">${Number.isInteger(val) ? val : val.toFixed(1)}${unit}</div>
    <div class="m-status ${cls}">${txt}</div>
  </div>`;
}

// ═══════════════════════════════════════════════════════
// RECOMMEND CROP
// ═══════════════════════════════════════════════════════
function recommendCrop() {
  const btn = document.getElementById('recommendBtn');
  btn.disabled = true;
  btn.innerHTML = '⏳ Analyzing…';
  
  setTimeout(() => {
    btn.disabled = false;
    btn.innerHTML = `🔮 <span data-i18n="get_recommendations">${t('get_recommendations')}</span>`;
  }, 700);
  
  const inp = getInputs();
  const ranked = getAllRanked(inp);
  const top5 = ranked.slice(0, 5);
  const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
  
  let html = `<p style="font-size:0.78rem;color:var(--text3);margin-bottom:0.6rem;">${t('top_crops')}</p>`;
  html += `<div class="soil-meters">
    ${soilMeter('N', inp.n, 0, 140)}
    ${soilMeter('P', inp.p, 5, 145)}
    ${soilMeter('K', inp.k, 5, 205)}
    ${soilMeter('Temp', inp.temp, 8, 45, '°C')}
    ${soilMeter('Hum', inp.hum, 14, 100, '%')}
    ${soilMeter('pH', inp.ph, 3.5, 9.5)}
  </div>`;
  
  top5.forEach((crop, i) => {
    const db = CROP_DB[crop.k];
    const factors = crop.matched.slice(0, 3).join(', ');
    const seasons = db.seasons.map(s => `<span class="s-tag">${s}</span>`).join(' ');
    
    html += `<div class="crop-card">
      <div class="crop-score">${crop.score.toFixed(0)}%</div>
      <h3>${medals[i]} ${lcn(crop.k)} ${db.emoji}</h3>
      <div class="conf-bar"><div class="conf-fill" style="width:${crop.score}%"></div></div>
      <div class="tags">
        ${factors ? `<span class="tag tag-green">✓ ${factors}</span>` : ''}
        <span class="tag">₹${db.market}/qtl</span>
        <span class="tag">${db.marketLoc}</span>
        ${seasons}
      </div>
      ${crop.missed.length ? `<p style="font-size:0.72rem;color:var(--amber);margin-top:0.4rem;">⚠️ Sub-optimal: ${crop.missed.join(', ')}</p>` : ''}
    </div>`;
  });
  
  const top = top5[0];
  const db = CROP_DB[top.k];
  
  html += `<div class="res-card res-info" style="margin-top:0.6rem;font-size:0.8rem;">
    <strong>${t('why_recommendation')}</strong><br>
    • Temp ${inp.temp}°C → ideal ${db.temp[0]}–${db.temp[1]}°C<br>
    • Rainfall ${inp.rain}mm → ideal ${db.rain[0]}–${db.rain[1]}mm<br>
    • pH ${inp.ph} → ideal ${db.ph[0]}–${db.ph[1]}<br>
    • N ${inp.n} kg/ha → ideal ${db.N[0]}–${db.N[1]}
  </div>
  <div class="res-card res-warning" style="margin-top:0.4rem;font-size:0.79rem;">
    <strong>📋 All 20 crops ranked</strong>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.2rem;margin-top:0.35rem;">
      ${ranked.slice(0, 12).map(c => `<span>${CROP_DB[c.k].emoji} ${lcn(c.k)}: <b>${c.score.toFixed(0)}%</b></span>`).join('')}
    </div>
  </div>`;
  
  document.getElementById('crop-result-area').innerHTML = html;
  document.querySelector('#crop-results-card > p[data-i18n]')?.style.setProperty('display', 'none');
  document.getElementById('crop-results-card').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  speakText(`I recommend ${lcn(top.k)} with ${top.score.toFixed(0)} percent confidence.`);
}

// ═══════════════════════════════════════════════════════
// WEATHER AUTO-FILL
// ═══════════════════════════════════════════════════════
function fillWeather() {
  if (!navigator.geolocation) {
    toast('❌ Geolocation not supported');
    return;
  }
  
  toast('📍 Getting location…');
  
  navigator.geolocation.getCurrentPosition(async pos => {
    const { latitude: lat, longitude: lon } = pos.coords;
    try {
      const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation`);
      const d = await r.json();
      const temp = d.current?.temperature_2m || 25;
      const hum = d.current?.relative_humidity_2m || 65;
      const prec = d.current?.precipitation || 0;
      
      document.getElementById('temp').value = Math.round(temp);
      updateSlider('temp');
      document.getElementById('hum').value = Math.round(hum);
      updateSlider('hum');
      document.getElementById('rain').value = Math.round(prec * 30 + 100);
      updateSlider('rain');
      
      livePreviewCrop();
      toast(t('weather_filled'));
    } catch {
      toast('❌ Weather API error');
    }
  }, () => toast('❌ Location denied'));
}

// ═══════════════════════════════════════════════════════
// RANDOM FARM DATA
// ═══════════════════════════════════════════════════════
function randomFarm() {
  const sc = [
    { n: 80, p: 45, k: 40, temp: 28, hum: 75, ph: 6.2, rain: 200 },
    { n: 100, p: 55, k: 50, temp: 20, hum: 45, ph: 7.0, rain: 80 },
    { n: 30, p: 60, k: 50, temp: 30, hum: 45, ph: 6.5, rain: 65 },
    { n: 70, p: 40, k: 90, temp: 25, hum: 80, ph: 6.0, rain: 180 },
    { n: 50, p: 80, k: 60, temp: 22, hum: 70, ph: 6.8, rain: 130 }
  ];
  
  const s = sc[Math.floor(Math.random() * sc.length)];
  Object.entries(s).forEach(([id, v]) => {
    const el = document.getElementById(id);
    if (el) {
      el.value = v;
      updateSlider(id);
    }
  });
  
  livePreviewCrop();
  toast('🎲 Random farm data loaded!');
}

// ═══════════════════════════════════════════════════════
// TAB SWITCHING
// ═══════════════════════════════════════════════════════
function switchTab(name) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(`tab-${name}`)?.classList.add('active');
  document.querySelector(`.tab-btn[data-tab="${name}"]`)?.classList.add('active');
  
  if (name === 'market') {
    loadMarketPrices();
    setTimeout(drawChart, 300);
  }
  if (name === 'calendar') renderCalendar();
}

// ═══════════════════════════════════════════════════════
// TOAST
// ═══════════════════════════════════════════════════════
function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.style.display = 'block';
  clearTimeout(el._t);
  el._t = setTimeout(() => el.style.display = 'none', 3000);
}
