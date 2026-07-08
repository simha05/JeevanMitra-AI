// ═══════════════════════════════════════════════════════
// YIELD PREDICTION
// ═══════════════════════════════════════════════════════
function predictYield() {
  const crop = document.getElementById('yield-crop').value;
  const n = +document.getElementById('yn').value;
  const p = +document.getElementById('yp').value;
  const k = +document.getElementById('yk').value;
  const area = +document.getElementById('ya').value || 1;
  const iF = +document.getElementById('irrigation').value || 1.15;
  
  const pr = yProf[crop];
  if (!pr) return;
  
  const ts = pr.nS + pr.pS + pr.kS;
  const nF = Math.min(1, 0.4 + (n / 140) * 0.7) * pr.nS;
  const pF = Math.min(1, 0.4 + (p / 145) * 0.7) * pr.pS;
  const kF = Math.min(1, 0.4 + (k / 205) * 0.7) * pr.kS;
  
  const pred = Math.min(pr.peak, pr.base * (0.6 + ((nF + pF + kF) / ts) * 0.8) * iF);
  const total = pred * area;
  const pct = ((pred / pr.peak) * 100).toFixed(0);
  
  const db = CROP_DB[crop];
  const isNuts = pr.unit === 'nuts/ha';
  const rev = isNuts 
    ? (total * (db.market / 100)).toLocaleString('en-IN')
    : (total * 10 * db.market).toLocaleString('en-IN');
  
  const tips = [];
  if (n < 60) tips.push('⚠️ Increase nitrogen (e.g. Urea 45%)');
  if (p < 40) tips.push('⚠️ Add phosphatic fertilizer (DAP)');
  if (k < 40) tips.push('⚠️ Apply potash fertilizer (MOP)');
  if (iF < 1.15) tips.push('💧 Consider drip/sprinkler irrigation');
  if (!tips.length) tips.push('✅ Nutrient levels are well balanced!');
  
  const resArea = document.getElementById('yield-result-area');
  resArea.innerHTML = `
    <div class="res-card res-success">
      <h3>🌱 ${lcn(crop)} ${db.emoji} Yield Estimate</h3>
      <div style="font-size:2rem;font-weight:800;color:var(--green);margin:0.4rem 0;">
        ${isNuts ? Math.round(total).toLocaleString() : pred.toFixed(2)} 
        <span style="font-size:0.85rem;font-weight:400;">${pr.unit}</span>
      </div>
      ${!isNuts ? `<p style="font-size:0.8rem;color:var(--text2);">Total for ${area} ha: <strong>${total.toFixed(2)} tons</strong></p>` : ''}
      <div style="margin-top:0.6rem;">
        <div style="font-size:0.73rem;color:var(--text3);margin-bottom:0.2rem;">Yield efficiency: ${pct}% of peak</div>
        <div class="progress"><div class="progress-fill" style="width:${pct}%"></div></div>
      </div>
    </div>
    <div class="res-card res-info">
      <h3>💰 Revenue Estimate</h3>
      <p style="font-size:0.82rem;">
        Market: <strong>₹${db.market}${isNuts ? '/100 nuts' : '/quintal'}</strong> (${db.marketLoc})<br>
        Revenue: <strong>₹${rev}</strong><br>
        <span style="color:var(--text3);font-size:0.75rem;">Seasons: ${db.seasons.join(', ')}</span>
      </p>
    </div>
    <div class="res-card ${tips[0].includes('⚠️') || tips[0].includes('💧') ? 'res-warning' : 'res-success'}">
      <h3>${t('optimization_tips')}</h3>
      <div style="font-size:0.81rem;">
        ${tips.map(tp => `<p style="margin:0.2rem 0;">${tp}</p>`).join('')}
      </div>
    </div>`;
  
  document.querySelector('#yield-results-card > p')?.style.setProperty('display', 'none');
}
