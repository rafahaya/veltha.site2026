/**
 * VELTHA 2026 — FLUID AIR & AERODYNAMIC INTERACTIVITY ENGINE
 */

// Global State
const state = {
  models: [],
  downloads: [],
  currentUser: JSON.parse(localStorage.getItem('veltha_user') || 'null'),
  simulator: {
    flow: 13500,
    pressure: 50,
    pollutant: 'fumos',
    sector: 'metalurgica',
    currentResult: null
  },
  chatHistory: []
};

// DOM Elements
const el = {
  heroCanvas: document.getElementById('heroCanvas'),
  // Simulator Elements
  sliderFlow: document.getElementById('sliderFlow'),
  inputFlow: document.getElementById('inputFlow'),
  sliderPressure: document.getElementById('sliderPressure'),
  inputPressure: document.getElementById('inputPressure'),
  pollutantPills: document.querySelectorAll('.pollutant-pill'),
  simResultContainer: document.getElementById('simResultContainer'),
  btnQuoteForModel: document.getElementById('btnQuoteForModel'),
  // Portal Elements
  portalGrid: document.getElementById('portalGrid'),
  btnOpenLogin: document.getElementById('btnOpenLogin'),
  userProfileChip: document.getElementById('userProfileChip'),
  modalAuth: document.getElementById('modalAuth'),
  authForm: document.getElementById('authForm'),
  authTitle: document.getElementById('authTitle'),
  authSwitchBtn: document.getElementById('authSwitchBtn'),
  // Chatbot Elements
  chatbotWidget: document.getElementById('chatbotWidget'),
  btnToggleChatbot: document.getElementById('btnToggleChatbot'),
  chatbotWindow: document.getElementById('chatbotWindow'),
  chatbotBody: document.getElementById('chatbotBody'),
  chatbotInput: document.getElementById('chatbotInput'),
  btnChatSend: document.getElementById('btnChatSend'),
  btnChatClose: document.getElementById('btnChatClose'),
  // Contact Form
  quoteForm: document.getElementById('quoteForm'),
  formRecommendedModel: document.getElementById('formRecommendedModel')
};

// ========================================================
// 1. INITIALIZATION
// ========================================================
document.addEventListener('DOMContentLoaded', async () => {
  initAirFlowCanvas();
  await loadCatalogAndDownloads();
  initSimulator();
  initPortalAuth();
  initChatbot();
  initQuoteForm();
  updateAuthUI();
});

// ========================================================
// 2. INTERACTIVE FLUID AIR FLOW CANVAS
// ========================================================
function initAirFlowCanvas() {
  const canvas = el.heroCanvas;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];
  let mouse = { x: -1000, y: -1000, radius: 150 };

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = canvas.parentElement.offsetHeight;
    createParticles();
  }

  function createParticles() {
    particles = [];
    const count = Math.min(Math.floor(width / 14), 90);
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: 1.2 + Math.random() * 2.2,
        vy: (Math.random() - 0.5) * 0.6,
        length: 30 + Math.random() * 80,
        width: 1 + Math.random() * 2,
        opacity: 0.15 + Math.random() * 0.45,
        color: Math.random() > 0.4 ? '0, 229, 255' : '16, 185, 129' // Cyan or Emerald
      });
    }
  }

  window.addEventListener('resize', resize);
  window.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });

  function draw() {
    ctx.clearRect(0, 0, width, height);

    particles.forEach(p => {
      // Wind acceleration & trajectory
      p.x += p.vx;
      p.y += p.vy + Math.sin(p.x * 0.005) * 0.4;

      // Mouse turbulence interaction
      const dx = mouse.x - p.x;
      const dy = mouse.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < mouse.radius) {
        const force = (mouse.radius - dist) / mouse.radius;
        p.y -= dy * force * 0.05;
        p.x += force * 3;
      }

      // Reset when exiting right edge
      if (p.x - p.length > width) {
        p.x = -p.length;
        p.y = Math.random() * height;
      }

      // Render air streamline with glowing gradient
      const grad = ctx.createLinearGradient(p.x - p.length, p.y, p.x, p.y);
      grad.addColorStop(0, `rgba(${p.color}, 0)`);
      grad.addColorStop(0.7, `rgba(${p.color}, ${p.opacity})`);
      grad.addColorStop(1, `rgba(255, 255, 255, ${p.opacity * 1.5})`);

      ctx.beginPath();
      ctx.strokeStyle = grad;
      ctx.lineWidth = p.width;
      ctx.lineCap = 'round';
      ctx.moveTo(p.x - p.length, p.y);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    });

    requestAnimationFrame(draw);
  }

  resize();
  draw();
}

// ========================================================
// 3. API DATA FETCHING
// ========================================================
async function loadCatalogAndDownloads() {
  try {
    const [resModels, resDl] = await Promise.all([
      fetch('/api/models'),
      fetch('/api/downloads')
    ]);
    state.models = await resModels.json();
    state.downloads = await resDl.json();
    renderPortalDownloads();
  } catch (err) {
    console.error('Erro ao carregar dados:', err);
  }
}

// ========================================================
// 4. 🎛️ SIMULADOR & DIMENSIONADOR VELTHA
// ========================================================
function initSimulator() {
  const syncFlow = (val) => {
    state.simulator.flow = Math.max(250, Math.min(45000, Number(val)));
    el.sliderFlow.value = state.simulator.flow;
    if (el.inputFlow) el.inputFlow.textContent = state.simulator.flow.toLocaleString('pt-BR');
    runSimulation();
  };

  const syncPressure = (val) => {
    state.simulator.pressure = Math.max(5, Math.min(100, Number(val)));
    el.sliderPressure.value = state.simulator.pressure;
    if (el.inputPressure) el.inputPressure.textContent = state.simulator.pressure;
    runSimulation();
  };

  el.sliderFlow.addEventListener('input', (e) => syncFlow(e.target.value));
  el.sliderPressure.addEventListener('input', (e) => syncPressure(e.target.value));

  el.pollutantPills.forEach(pill => {
    pill.addEventListener('click', () => {
      el.pollutantPills.forEach(p => p.classList.remove('selected'));
      pill.classList.add('selected');
      state.simulator.pollutant = pill.getAttribute('data-pollutant');
      runSimulation();
    });
  });

  if (el.btnQuoteForModel) {
    el.btnQuoteForModel.addEventListener('click', () => {
      if (state.simulator.currentResult) {
        if (el.formRecommendedModel) {
          el.formRecommendedModel.value = `${state.simulator.currentResult.model} (${state.simulator.flow} m³/h @ ${state.simulator.pressure} mm.ca)`;
        }
        document.getElementById('contato').scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  // Initial simulation calculation
  runSimulation();
}

async function runSimulation() {
  try {
    const res = await fetch('/api/simulate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        flow: state.simulator.flow,
        pressure: state.simulator.pressure,
        pollutant: state.simulator.pollutant,
        sector: state.simulator.sector
      })
    });

    const data = await res.json();
    if (data.recommended) {
      state.simulator.currentResult = data.recommended;
      renderSimulatorResult(data.recommended, data.alternatives);
    }
  } catch (err) {
    console.error('Erro na simulação:', err);
  }
}

function renderSimulatorResult(rec, alternatives = []) {
  if (!el.simResultContainer) return;

  const pollutantLabels = {
    fumos: 'Fumos de Solda & Corte',
    oleo: 'Névoas de Óleo / CNC',
    po: 'Pós e Particulados Finos',
    fuligem: 'Fuligem e Cinzas',
    odores: 'Vapores & Odores'
  };

  el.simResultContainer.innerHTML = `
    <div class="result-badge-top">
      <span class="badge-recommended">★ Equipamento Mais Adequado</span>
      <span style="font-size: 0.8rem; color: var(--veltha-cyan); font-weight: 700;">Tecnologia Multiventuri®</span>
    </div>

    <div>
      <div style="font-size: 0.82rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">Família ${rec.family}</div>
      <h3 class="result-model-name">${rec.model}</h3>
      <p class="result-desc-text">${rec.description}</p>
    </div>

    <div class="result-specs-grid">
      <div class="spec-box">
        <span>Potência Motor</span>
        <strong>${rec.powerCv} CV</strong>
      </div>
      <div class="spec-box">
        <span>Eficiência</span>
        <strong style="color: var(--veltha-emerald);">${rec.efficiency}</strong>
      </div>
      <div class="spec-box">
        <span>Faixa de Vazão</span>
        <strong>${rec.minFlow.toLocaleString()} - ${rec.maxFlow.toLocaleString()} m³/h</strong>
      </div>
      <div class="spec-box">
        <span>Pressão Máxima</span>
        <strong>${rec.maxPressure} mm.ca</strong>
      </div>
      <div class="spec-box">
        <span>Nível de Ruído</span>
        <strong>${rec.noiseLevel}</strong>
      </div>
      <div class="spec-box">
        <span>Dimensões (LxPxA)</span>
        <strong style="font-size: 0.95rem;">${rec.dimensions}</strong>
      </div>
    </div>

    <div style="background: rgba(0,0,0,0.25); border-radius: var(--radius-md); padding: 14px; border: 1px dashed rgba(255,255,255,0.1);">
      <div style="font-size: 0.78rem; color: var(--text-muted); margin-bottom: 4px; font-weight: 700;">APLICAÇÃO RECOMENDADA:</div>
      <div style="font-size: 0.88rem; color: #FFFFFF;">${rec.applications.join(' • ')}</div>
    </div>

    <button type="button" class="btn-generate-quote" id="btnRequestThisModel">
      <span>Solicitar Proposta para ${rec.model}</span>
      <span>➔</span>
    </button>
  `;

  document.getElementById('btnRequestThisModel')?.addEventListener('click', () => {
    if (el.formRecommendedModel) {
      el.formRecommendedModel.value = `${rec.model} (Vazão: ${state.simulator.flow.toLocaleString()} m³/h | Pressão: ${state.simulator.pressure} mm.ca)`;
    }
    document.getElementById('contato').scrollIntoView({ behavior: 'smooth' });
  });
}

// ========================================================
// 5. 🔐 PORTAL DA ENGENHARIA (CAD, DWG, LAUDOS)
// ========================================================
function renderPortalDownloads() {
  if (!el.portalGrid) return;
  const isLogged = !!state.currentUser;

  el.portalGrid.innerHTML = state.downloads.map(dl => {
    const locked = dl.isLocked && !isLogged;
    return `
      <div class="download-card ${locked ? 'locked' : ''}">
        <div>
          <div class="dl-card-header">
            <span class="dl-format-badge">${dl.format}</span>
            <span class="dl-lock-icon">${locked ? '🔒 Bloqueado' : '✅ Liberado'}</span>
          </div>
          <h4 class="dl-title" style="margin: 12px 0 6px 0;">${dl.title}</h4>
          <p class="dl-desc">${dl.desc}</p>
        </div>

        <div>
          <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 8px;">Tamanho: ${dl.size}</div>
          <button type="button" class="btn-download-file" data-dl-id="${dl.id}" data-locked="${locked}">
            ${locked ? '<span>🔐 Fazer Login para Baixar</span>' : `<span>📥 Baixar Arquivo (${dl.format})</span>`}
          </button>
        </div>
      </div>
    `;
  }).join('');

  el.portalGrid.querySelectorAll('[data-dl-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      const isLocked = btn.getAttribute('data-locked') === 'true';
      if (isLocked) {
        openAuthModal('login');
      } else {
        showToast('📥 Iniciando download do pacote técnico de engenharia!', 'success');
      }
    });
  });
}

function initPortalAuth() {
  if (el.btnOpenLogin) {
    el.btnOpenLogin.addEventListener('click', () => {
      if (state.currentUser) {
        logoutUser();
        showToast('Você saiu da sua conta do portal.', 'info');
      } else {
        openAuthModal('login');
      }
    });
  }

  el.authForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const isRegister = el.authForm.getAttribute('data-mode') === 'register';
    const email = document.getElementById('authEmail').value;
    const password = document.getElementById('authPassword').value;
    const name = document.getElementById('authName')?.value;
    const company = document.getElementById('authCompany')?.value;

    const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
    const payload = isRegister ? { name, company, email, password } : { email, password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.error) {
        showToast(data.error, 'error');
        return;
      }

      state.currentUser = data.user;
      localStorage.setItem('veltha_user', JSON.stringify(data.user));
      closeAuthModal();
      updateAuthUI();
      renderPortalDownloads();
      showToast(`Bem-vindo, ${data.user.name}! Arquivos CAD e laudos liberados.`, 'success');
    } catch (err) {
      showToast('Erro na autenticação. Tente novamente.', 'error');
    }
  });

  el.authSwitchBtn?.addEventListener('click', () => {
    const currentMode = el.authForm.getAttribute('data-mode');
    openAuthModal(currentMode === 'login' ? 'register' : 'login');
  });

  document.getElementById('modalAuthClose')?.addEventListener('click', closeAuthModal);
}

function openAuthModal(mode = 'login') {
  if (!el.modalAuth) return;
  el.authForm.setAttribute('data-mode', mode);
  const isRegister = mode === 'register';

  el.authTitle.textContent = isRegister ? 'Criar Cadastro de Engenharia' : 'Acessar Portal do Cliente';
  document.getElementById('registerFields').style.display = isRegister ? 'block' : 'none';
  document.getElementById('authSubmitBtn').textContent = isRegister ? 'Cadastrar e Liberar Downloads' : 'Entrar no Portal';
  el.authSwitchBtn.textContent = isRegister ? 'Já possui cadastro? Faça login' : 'Não tem conta? Cadastre-se grátis';
  el.modalAuth.style.display = 'flex';
}

function closeAuthModal() {
  if (el.modalAuth) el.modalAuth.style.display = 'none';
}

function logoutUser() {
  state.currentUser = null;
  localStorage.removeItem('veltha_user');
  updateAuthUI();
  renderPortalDownloads();
}

function updateAuthUI() {
  if (state.currentUser) {
    if (el.btnOpenLogin) el.btnOpenLogin.innerHTML = `<span>👤 ${state.currentUser.name.split(' ')[0]} (Sair)</span>`;
  } else {
    if (el.btnOpenLogin) el.btnOpenLogin.innerHTML = `<span>🔐 Área do Cliente</span>`;
  }
}

// ========================================================
// 6. 💬 CHATBOT ESPECIALISTA "VELTHA IA"
// ========================================================
function initChatbot() {
  el.btnToggleChatbot?.addEventListener('click', () => {
    const isOpen = el.chatbotWindow.style.display === 'flex';
    el.chatbotWindow.style.display = isOpen ? 'none' : 'flex';
    if (!isOpen && el.chatbotBody.children.length === 0) {
      sendWelcomeBotMessage();
    }
  });

  el.btnChatClose?.addEventListener('click', () => {
    el.chatbotWindow.style.display = 'none';
  });

  const handleSend = async () => {
    const text = el.chatbotInput.value.trim();
    if (!text) return;

    appendChatMessage(text, 'user');
    el.chatbotInput.value = '';

    // Typing indicator
    const typingId = appendChatMessage('Digitando resposta técnica...', 'bot typing');

    try {
      const res = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });
      const data = await res.json();
      removeChatMessage(typingId);
      appendChatMessage(data.reply, 'bot', data.suggestedAction);
    } catch (err) {
      removeChatMessage(typingId);
      appendChatMessage('Desculpe, ocorreu uma falha de conexão. Por favor, tente novamente.', 'bot');
    }
  };

  el.btnChatSend?.addEventListener('click', handleSend);
  el.chatbotInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleSend();
  });
}

function sendWelcomeBotMessage() {
  appendChatMessage(
    'Olá! Sou o **Assistente de Engenharia da Veltha**. Posso te ajudar a dimensionar o melhor modelo VTD, explicar o funcionamento da tecnologia Multiventuri® ou direcionar seu atendimento.',
    'bot',
    { label: '🎛️ Simular Equipamento', target: 'simulator' }
  );
}

function appendChatMessage(text, type = 'bot', action = null) {
  const msgId = 'msg_' + Date.now() + Math.random().toString(36).substr(2, 4);
  const div = document.createElement('div');
  div.id = msgId;
  div.className = `chat-msg ${type}`;
  
  // Format simple markdown bold
  const formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  div.innerHTML = formatted;

  if (action) {
    const btn = document.createElement('button');
    btn.className = 'chat-suggest-btn';
    btn.textContent = action.label;
    btn.addEventListener('click', () => {
      if (action.target === 'simulator') {
        document.getElementById('simulador')?.scrollIntoView({ behavior: 'smooth' });
      } else if (action.target === 'portal') {
        document.getElementById('portal')?.scrollIntoView({ behavior: 'smooth' });
      } else if (action.target === 'contact') {
        document.getElementById('contato')?.scrollIntoView({ behavior: 'smooth' });
      } else if (action.target === 'sectors') {
        document.getElementById('setores')?.scrollIntoView({ behavior: 'smooth' });
      }
      el.chatbotWindow.style.display = 'none';
    });
    div.appendChild(btn);
  }

  el.chatbotBody.appendChild(div);
  el.chatbotBody.scrollTop = el.chatbotBody.scrollHeight;
  return msgId;
}

function removeChatMessage(id) {
  const elem = document.getElementById(id);
  if (elem) elem.remove();
}

// ========================================================
// 7. FORMULÁRIO DE PROPOSTA TÉCNICA
// ========================================================
function initQuoteForm() {
  el.quoteForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = {
      name: document.getElementById('quoteName').value,
      company: document.getElementById('quoteCompany').value,
      email: document.getElementById('quoteEmail').value,
      phone: document.getElementById('quotePhone').value,
      recommendedModel: el.formRecommendedModel?.value || 'Não especificado',
      message: document.getElementById('quoteMessage').value
    };

    try {
      const res = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      showToast('✅ Proposta enviada com sucesso! Nossa engenharia entrará em contato.', 'success');
      el.quoteForm.reset();
    } catch (err) {
      showToast('Erro ao enviar proposta. Tente novamente pelo WhatsApp.', 'error');
    }
  });
}

// ========================================================
// 8. TOAST NOTIFICATIONS
// ========================================================
function showToast(message, type = 'info') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.style.cssText = 'position: fixed; top: 24px; right: 24px; z-index: 9999; display: flex; flex-direction: column; gap: 10px; pointer-events: none;';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  const bg = type === 'success' ? '#10B981' : (type === 'error' ? '#EF4444' : '#0284C7');
  toast.style.cssText = `background: ${bg}; color: #FFFFFF; font-family: var(--font-body); font-weight: 700; font-size: 0.88rem; padding: 12px 20px; border-radius: 10px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); pointer-events: auto; animation: slideIn 0.3s ease;`;
  toast.textContent = message;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}
