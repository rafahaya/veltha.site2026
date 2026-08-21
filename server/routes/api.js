import express from 'express';
import { Storage } from '../storage.js';

const router = express.Router();

router.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  next();
});

// ----------------------------------------------------
// 1. EQUIPMENT CATALOG & SIZING SIMULATOR
// ----------------------------------------------------
router.get('/models', (req, res) => {
  const models = Storage.getModels();
  res.json(models);
});

router.post('/simulate', (req, res) => {
  const { flow, pressure, pollutant, sector } = req.body;
  if (!flow || !pressure) {
    return res.status(400).json({ error: 'Vazão e pressão são obrigatórios para simulação.' });
  }

  const result = Storage.simulateEquipment(flow, pressure, pollutant);
  res.json({
    input: { flow: Number(flow), pressure: Number(pressure), pollutant, sector },
    ...result
  });
});

// ----------------------------------------------------
// 2. CLIENT & ENGINEERING PORTAL (CAD & DOWNLOADS)
// ----------------------------------------------------
router.get('/downloads', (req, res) => {
  const downloads = Storage.getDownloads();
  res.json(downloads);
});

router.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'E-mail e senha são obrigatórios' });
  }

  const user = Storage.findUserByEmail(email);
  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'E-mail ou senha incorretos' });
  }

  res.json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      company: user.company,
      email: user.email,
      role: user.role
    }
  });
});

router.post('/auth/register', (req, res) => {
  const { name, company, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Preencha todos os campos obrigatórios' });
  }

  const result = Storage.registerUser({ name, company, email, password });
  if (result.error) {
    return res.status(400).json({ error: result.error });
  }

  res.status(201).json({
    success: true,
    user: {
      id: result.user.id,
      name: result.user.name,
      company: result.user.company,
      email: result.user.email,
      role: result.user.role
    }
  });
});

// ----------------------------------------------------
// 3. VELTHA CHATBOT ESPECIALISTA EM ENGENHARIA DO AR
// ----------------------------------------------------
router.post('/chatbot', (req, res) => {
  const { message, history } = req.body;
  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'Mensagem vazia' });
  }

  const lower = message.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  let reply = '';
  let suggestedAction = null;

  if (lower.includes('vtd') || lower.includes('tecnologia') || lower.includes('multiventuri') || lower.includes('funciona') || lower.includes('centrifugacao')) {
    reply = `A tecnologia exclusiva patenteada pela Veltha é a **Centrifugação Líquida Multiventuri®**. Ela opera em fluxo binário com microgotículas e turbo centrifugação de alta intensidade, capturando até 99.8% de fumos, névoas de óleo, pós e odores de forma contínua e autolimpante. Essa inovação equipa os nossos Precipitadores VTD, Câmaras CSU e Air Cleaners!`;
    suggestedAction = { label: '🎛️ Testar Simulador de Modelos', target: 'simulator' };
  } else if (lower.includes('simular') || lower.includes('dimensionar') || lower.includes('vazao') || lower.includes('modelo') || lower.includes('preco') || lower.includes('comprar')) {
    reply = `Para dimensionar o modelo exato para a sua indústria, utilize o nosso **Simulador Interativo** logo abaixo na página. Você informa a vazão em m³/h e o tipo de poluente (solda, CNC, fundição, etc.) e o sistema indica o equipamento ideal com relatório técnico instantâneo!`;
    suggestedAction = { label: 'Ir para o Simulador', target: 'simulator' };
  } else if (lower.includes('cad') || lower.includes('dwg') || lower.includes('step') || lower.includes('manual') || lower.includes('download') || lower.includes('laudo')) {
    reply = `Os arquivos CAD 2D/3D (DWG, STEP), Manuais de Instalação e Laudos de Emissão da CETESB/IBAMA estão disponíveis gratuitamente no nosso **Portal da Engenharia**. Basta fazer um login rápido para baixar os pacotes completos.`;
    suggestedAction = { label: '🔐 Acessar Portal do Cliente', target: 'portal' };
  } else if (lower.includes('contato') || lower.includes('telefone') || lower.includes('whatsapp') || lower.includes('visita') || lower.includes('orcamento')) {
    reply = `Nossa equipe técnica de engenharia está pronta para analisar a sua planta fabril. Você pode preencher o formulário de proposta ou entrar em contato direto pelo WhatsApp corporativo da Veltha!`;
    suggestedAction = { label: '💬 Abrir Proposta Técnica', target: 'contact' };
  } else if (lower.includes('solda') || lower.includes('metalurgica') || lower.includes('usinagem') || lower.includes('oleo') || lower.includes('cnc')) {
    reply = `Para usinagem CNC e células de solda, os modelos da série **VTD 1.0** e **VTD 08.20 (15cv)** são os mais indicados, pois capturam névoas de óleo de corte e fumos metálicos densos em circuito fechado com retorno de óleo reaproveitável.`;
    suggestedAction = { label: 'Ver Soluções para Metalurgia', target: 'sectors' };
  } else {
    reply = `Olá! Sou o **Assistente de Engenharia da Veltha**. Como posso te ajudar hoje? Posso te guiar no dimensionamento do equipamento ideal, tirar dúvidas sobre a tecnologia Multiventuri® ou liberar o acesso aos arquivos CAD e laudos técnicos.`;
    suggestedAction = { label: '🎛️ Simular Meu Equipamento', target: 'simulator' };
  }

  res.json({
    reply,
    suggestedAction,
    timestamp: new Date().toISOString()
  });
});

// ----------------------------------------------------
// 4. QUOTES & LEADS
// ----------------------------------------------------
router.post('/quotes', (req, res) => {
  const { name, email, phone, company, sector, pollutant, flow, pressure, recommendedModel, message } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Nome e e-mail são obrigatórios' });
  }

  const lead = Storage.addLead({ name, email, phone, company, sector, pollutant, flow, pressure, recommendedModel, message });
  res.status(201).json({
    success: true,
    message: 'Proposta técnica recebida! Nosso departamento de engenharia entrará em contato em breve.',
    lead
  });
});

export default router;
