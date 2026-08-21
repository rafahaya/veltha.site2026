/**
 * VELTHA 2026 — DEDICATED ENGINEERING PORTAL CONTROLLER
 */

const portalState = {
  currentUser: JSON.parse(localStorage.getItem('veltha_user') || 'null'),
  downloads: [],
  activeCategory: 'all'
};

const dom = {
  portalAuthView: document.getElementById('portalAuthView'),
  portalDashboardView: document.getElementById('portalDashboardView'),
  portalUserBadge: document.getElementById('portalUserBadge'),
  userNameDisplay: document.getElementById('userNameDisplay'),
  userCompanyDisplay: document.getElementById('userCompanyDisplay'),
  btnLogoutPortal: document.getElementById('btnLogoutPortal'),
  // Tabs
  tabBtnLogin: document.getElementById('tabBtnLogin'),
  tabBtnRegister: document.getElementById('tabBtnRegister'),
  formPortalLogin: document.getElementById('formPortalLogin'),
  formPortalRegister: document.getElementById('formPortalRegister'),
  // Dashboard Elements
  portalGridContainer: document.getElementById('portalGridContainer'),
  filterPills: document.querySelectorAll('.portal-filter-pill')
};

document.addEventListener('DOMContentLoaded', async () => {
  initTabs();
  initAuthForms();
  initFilterPills();
  await loadDownloads();
  renderPortalState();
});

// ========================================================
// 1. DATA LOADING
// ========================================================
async function loadDownloads() {
  try {
    const res = await fetch('./downloads.json');
    portalState.downloads = await res.json();
  } catch (err) {
    console.error('Erro ao carregar downloads:', err);
  }
}

// ========================================================
// 2. STATE ROUTING (AUTH vs DASHBOARD)
// ========================================================
function renderPortalState() {
  const user = portalState.currentUser;

  if (user) {
    dom.portalAuthView.style.display = 'none';
    dom.portalDashboardView.style.display = 'block';
    dom.portalUserBadge.style.display = 'flex';
    dom.userNameDisplay.textContent = user.name;
    dom.userCompanyDisplay.textContent = user.company || 'Cliente Veltha';
    renderDownloadsGrid();
  } else {
    dom.portalAuthView.style.display = 'block';
    dom.portalDashboardView.style.display = 'none';
    dom.portalUserBadge.style.display = 'none';
  }
}

// ========================================================
// 3. TABS (LOGIN VS CADASTRO)
// ========================================================
function initTabs() {
  dom.tabBtnLogin?.addEventListener('click', () => {
    dom.tabBtnLogin.classList.add('active');
    dom.tabBtnLogin.style.background = '#FFFFFF';
    dom.tabBtnLogin.style.color = 'var(--veltha-teal-dark)';
    dom.tabBtnLogin.style.boxShadow = '0 2px 6px rgba(0,0,0,0.06)';

    dom.tabBtnRegister.classList.remove('active');
    dom.tabBtnRegister.style.background = 'transparent';
    dom.tabBtnRegister.style.color = 'var(--text-secondary)';
    dom.tabBtnRegister.style.boxShadow = 'none';

    dom.formPortalLogin.style.display = 'block';
    dom.formPortalRegister.style.display = 'none';
  });

  dom.tabBtnRegister?.addEventListener('click', () => {
    dom.tabBtnRegister.classList.add('active');
    dom.tabBtnRegister.style.background = '#FFFFFF';
    dom.tabBtnRegister.style.color = 'var(--veltha-teal-dark)';
    dom.tabBtnRegister.style.boxShadow = '0 2px 6px rgba(0,0,0,0.06)';

    dom.tabBtnLogin.classList.remove('active');
    dom.tabBtnLogin.style.background = 'transparent';
    dom.tabBtnLogin.style.color = 'var(--text-secondary)';
    dom.tabBtnLogin.style.boxShadow = 'none';

    dom.formPortalRegister.style.display = 'block';
    dom.formPortalLogin.style.display = 'none';
  });

  dom.btnLogoutPortal?.addEventListener('click', () => {
    portalState.currentUser = null;
    localStorage.removeItem('veltha_user');
    renderPortalState();
    showToast('Você saiu da sua conta do portal.', 'info');
  });
}

// ========================================================
// 4. AUTH FORMS
// ========================================================
function initAuthForms() {
  // Login Submit
  dom.formPortalLogin?.addEventListener('submit', async (e) => {
    
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
      const user = { name: 'Usuário', email, company: 'Empresa', role: 'engenheiro' };
      portalState.currentUser = user;
      localStorage.setItem('veltha_user', JSON.stringify(user));
      renderPortalState();
      showToast(`Bem-vindo, ${user.name}! Acesso liberado aos arquivos técnicos.`, 'success');
    } catch (err) {
      showToast('Erro ao realizar login. Tente novamente.', 'error');
    }
  });

  // Register Submit
  dom.formPortalRegister?.addEventListener('submit', async (e) => {
    
    e.preventDefault();
    const name = document.getElementById('regName').value;
    const company = document.getElementById('regCompany').value;
    const email = document.getElementById('regEmail').value;

    try {
      const user = { name: name || 'Novo Usuário', email, company, role: 'engenheiro' };
      portalState.currentUser = user;
      localStorage.setItem('veltha_user', JSON.stringify(user));
      renderPortalState();
      showToast(`Cadastro realizado com sucesso! Bem-vindo, ${user.name}.`, 'success');
    } catch (err) {
      showToast('Erro ao cadastrar. Tente novamente.', 'error');
    }
  });
}

// ========================================================
// 5. DOWNLOADS GRID & FILTERS
// ========================================================
function initFilterPills() {
  dom.filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      dom.filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      portalState.activeCategory = pill.getAttribute('data-cat');
      renderDownloadsGrid();
    });
  });
}

function renderDownloadsGrid() {
  if (!dom.portalGridContainer) return;

  const filtered = portalState.downloads.filter(dl => {
    if (portalState.activeCategory === 'all') return true;
    return dl.category === portalState.activeCategory;
  });

  dom.portalGridContainer.innerHTML = filtered.map(dl => `
    <div class="download-card">
      <div>
        <div class="dl-card-header">
          <span class="dl-format-badge">${dl.format}</span>
          <span class="dl-lock-icon" style="color: var(--veltha-green); font-weight: 700;">✅ Liberado</span>
        </div>
        <h4 class="dl-title" style="margin: 14px 0 8px 0;">${dl.title}</h4>
        <p class="dl-desc">${dl.desc}</p>
      </div>

      <div>
        <div style="font-size: 0.76rem; color: var(--text-muted); margin-bottom: 10px; font-weight: 600;">
          Tamanho: ${dl.size} • Arquivo: ${dl.file}
        </div>
        <button type="button" class="btn-generate-quote" style="width: 100%; font-size: 0.88rem; padding: 10px 16px;" data-file="${dl.file}">
          <span>📥 Baixar Pacote (${dl.format})</span>
        </button>
      </div>
    </div>
  `).join('');

  dom.portalGridContainer.querySelectorAll('[data-file]').forEach(btn => {
    btn.addEventListener('click', () => {
      const fileName = btn.getAttribute('data-file');
      showToast(`📥 Download iniciado: ${fileName}`, 'success');
    });
  });
}

// ========================================================
// 6. TOAST NOTIFICATIONS
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
  const bg = type === 'success' ? '#10B981' : (type === 'error' ? '#EF4444' : '#0F686F');
  toast.style.cssText = `background: ${bg}; color: #FFFFFF; font-family: var(--font-body); font-weight: 700; font-size: 0.88rem; padding: 12px 20px; border-radius: 10px; box-shadow: 0 10px 25px rgba(0,0,0,0.15); pointer-events: auto; animation: slideIn 0.3s ease;`;
  toast.textContent = message;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}
