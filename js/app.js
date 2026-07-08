// ═══════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════
let isChatVisible = true;

// ═══════════════════════════════════════════════════════
// API KEY MANAGEMENT
// ═══════════════════════════════════════════════════════
function showModal() {
  document.getElementById('apiModal').style.display = 'flex';
  setTimeout(() => document.getElementById('apiKeyInput').focus(), 100);
}

function closeModal() {
  document.getElementById('apiModal').style.display = 'none';
}

function saveKey() {
  const k = document.getElementById('apiKeyInput').value.trim();
  if (!k.startsWith('gsk_') || k.length < 20) {
    alert('❌ Invalid key. Groq keys start with gsk_...');
    return;
  }
  _groqKey = k;
  localStorage.setItem(KEY_STORE, k);
  closeModal();
  updateApiBar(true);
  toast('✅ Groq AI connected! Full AI mode active.');
}

function updateApiBar(connected) {
  const bar = document.getElementById('apiBar');
  const txt = document.getElementById('apiBarText');
  bar.className = 'api-bar ' + (connected ? 'connected' : 'disconnected');
  txt.textContent = connected
    ? '⚡ Groq AI Connected — Direct API, No Server Needed  (click to change key)'
    : '🔑 Click to enter your FREE Groq API key — works directly in browser, no server needed';
}

// ═══════════════════════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  // Load saved API key
  const saved = localStorage.getItem(KEY_STORE);
  if (saved) {
    _groqKey = saved;
    updateApiBar(true);
  } else {
    updateApiBar(false);
    setTimeout(showModal, 800);
  }
  
  // API modal event listeners
  document.getElementById('apiKeyInput').addEventListener('keypress', e => {
    if (e.key === 'Enter') saveKey();
  });
  document.getElementById('apiModal').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeModal();
  });
  
  // Initialize all components
  updateAllSliders();
  loadMarketPrices();
  applyTranslations();
  livePreviewCrop();
  predictYield();
  renderCalendar();
  
  // Set welcome message
  const wEl = document.getElementById('welcome-message');
  if (wEl) wEl.textContent = t('chat_welcome');
  
  // Preload voices for speech synthesis
  if ('speechSynthesis' in window) {
    speechSynthesis.getVoices();
    speechSynthesis.onvoiceschanged = () => speechSynthesis.getVoices();
  }
  
  console.log('🌿 JeevanMitra AI v2.0 — Standalone, No Server, Direct Groq API');
});

// ═══════════════════════════════════════════════════════
// RESIZE HANDLER
// ═══════════════════════════════════════════════════════
window.addEventListener('resize', () => {
  if (document.getElementById('tab-market')?.classList.contains('active')) {
    drawChart();
  }
});

// ═══════════════════════════════════════════════════════
// EXPOSE TO GLOBAL SCOPE (for onclick attributes)
// ═══════════════════════════════════════════════════════
window.saveKey = saveKey;
window.closeModal = closeModal;
