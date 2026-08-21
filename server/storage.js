import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const MODELS_FILE = path.join(DATA_DIR, 'models.json');
const DOWNLOADS_FILE = path.join(DATA_DIR, 'downloads.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const LEADS_FILE = path.join(DATA_DIR, 'leads.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readJson(filePath, defaultValue) {
  ensureDataDir();
  try {
    if (!fs.existsSync(filePath)) return defaultValue;
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (err) {
    console.error(`[Storage] Erro ao ler ${filePath}:`, err.message);
    return defaultValue;
  }
}

function writeJson(filePath, data) {
  ensureDataDir();
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error(`[Storage] Erro ao salvar ${filePath}:`, err.message);
  }
}

// 17 Modelos Oficiais de Precipitadores VTD (Veltha)
const DEFAULT_MODELS = [
  {
    id: 'vtd-1-0-1-5',
    family: 'VTD 1.0',
    model: 'VTD 1.0 1,5cv',
    powerCv: 1.5,
    minFlow: 256,
    maxFlow: 812,
    minPressure: 10.0,
    maxPressure: 35.1,
    efficiency: '99.2%',
    noiseLevel: '< 68 dBA',
    description: 'Compacto e eficiente para estações de solda, corte a laser de pequeno porte e bancadas laboratoriais.',
    applications: ['Solda TIG/MIG', 'Gravação e Corte Laser', 'Microfusão', 'Laboratórios'],
    cadFile: 'VTD-1.0-Compact.step',
    dimensions: '650 x 580 x 1150 mm',
    weightKg: 120
  },
  {
    id: 'vtd-1-0-3-0',
    family: 'VTD 1.0',
    model: 'VTD 1.0 3,0cv',
    powerCv: 3.0,
    minFlow: 339,
    maxFlow: 998,
    minPressure: 4.9,
    maxPressure: 45.0,
    efficiency: '99.4%',
    noiseLevel: '< 70 dBA',
    description: 'Ideal para máquinas CNC, usinagem pontual e controle de névoas de óleo vegetal ou mineral.',
    applications: ['Usinagem CNC', 'Fornos de Tratamento Térmico', 'Impressão 3D Industrial'],
    cadFile: 'VTD-1.0-3cv.step',
    dimensions: '720 x 640 x 1280 mm',
    weightKg: 145
  },
  {
    id: 'vtd-1-0-4-0',
    family: 'VTD 1.0',
    model: 'VTD 1.0 4,0cv',
    powerCv: 4.0,
    minFlow: 256,
    maxFlow: 1338,
    minPressure: 10.0,
    maxPressure: 69.9,
    efficiency: '99.5%',
    noiseLevel: '< 71 dBA',
    description: 'Alta pressão estática para redes de dutos de médio comprimento e captação de fumos densos.',
    applications: ['Solda Robótica', 'Polimento e Esmerilhamento', 'Indústria Têxtil'],
    cadFile: 'VTD-1.0-4cv.step',
    dimensions: '780 x 680 x 1350 mm',
    weightKg: 165
  },
  {
    id: 'vtd-1-0-5-0',
    family: 'VTD 1.0',
    model: 'VTD 1.0 5,0cv',
    powerCv: 5.0,
    minFlow: 751,
    maxFlow: 2187,
    minPressure: 5.0,
    maxPressure: 80.0,
    efficiency: '99.6%',
    noiseLevel: '< 72 dBA',
    description: 'Alta versatilidade para captação simultânea de 2 a 4 pontos de emissão com pressão constante.',
    applications: ['Metalurgia', 'Baterias e Galvanoplastia', 'Processamento de Borracha'],
    cadFile: 'VTD-1.0-5cv.step',
    dimensions: '850 x 750 x 1480 mm',
    weightKg: 190
  },
  {
    id: 'vtd-01-04-2-0',
    family: 'VTD 01.04',
    model: 'VTD 01.04 2,0cv',
    powerCv: 2.0,
    minFlow: 1064,
    maxFlow: 4293,
    minPressure: 5.0,
    maxPressure: 30.1,
    efficiency: '99.3%',
    noiseLevel: '< 69 dBA',
    description: 'Excelente vazão com consumo energético reduzido para grandes volumes de ar com baixa perda de carga.',
    applications: ['Indústria Moveleira', 'Linhas de Embalagem', 'Ventilação Geral Diluidora'],
    cadFile: 'VTD-01.04-2cv.step',
    dimensions: '950 x 820 x 1620 mm',
    weightKg: 230
  },
  {
    id: 'vtd-01-04-4-0',
    family: 'VTD 01.04',
    model: 'VTD 01.04 4,0cv',
    powerCv: 4.0,
    minFlow: 718,
    maxFlow: 5462,
    minPressure: 5.1,
    maxPressure: 39.9,
    efficiency: '99.5%',
    noiseLevel: '< 72 dBA',
    description: 'Equipamento equilibrado para coifas industriais, fritadeiras contínuas e usinagem seriada.',
    applications: ['Cozinhas Industriais', 'Linhas de Fritura e Alimentos', 'Tornos Automáticos'],
    cadFile: 'VTD-01.04-4cv.step',
    dimensions: '1050 x 900 x 1750 mm',
    weightKg: 275
  },
  {
    id: 'vtd-01-04-7-5',
    family: 'VTD 01.04',
    model: 'VTD 01.04 7,5cv',
    powerCv: 7.5,
    minFlow: 3636,
    maxFlow: 9375,
    minPressure: 4.9,
    maxPressure: 80.1,
    efficiency: '99.7%',
    noiseLevel: '< 74 dBA',
    description: 'Potência e vazão para galpões de fundição, estampagem a quente e setores químicos.',
    applications: ['Fundição', 'Pintura Eletrostática', 'Indústria Química e Resinas'],
    cadFile: 'VTD-01.04-7.5cv.step',
    dimensions: '1150 x 980 x 1900 mm',
    weightKg: 340
  },
  {
    id: 'vtd-03-08-4-0',
    family: 'VTD 03.08',
    model: 'VTD 03.08 4,0cv',
    powerCv: 4.0,
    minFlow: 272,
    maxFlow: 8078,
    minPressure: 5.1,
    maxPressure: 40.1,
    efficiency: '99.5%',
    noiseLevel: '< 71 dBA',
    description: 'Ampla curva de operação com booster hidrodinâmico eficiente.',
    applications: ['Cerâmica e Vidro', 'Corte Plasma CNC', 'Tratamento de Superfícies'],
    cadFile: 'VTD-03.08-4cv.step',
    dimensions: '1200 x 1020 x 1950 mm',
    weightKg: 360
  },
  {
    id: 'vtd-03-08-7-5',
    family: 'VTD 03.08',
    model: 'VTD 03.08 7,5cv',
    powerCv: 7.5,
    minFlow: 5848,
    maxFlow: 9401,
    minPressure: 10.1,
    maxPressure: 80.1,
    efficiency: '99.7%',
    noiseLevel: '< 74 dBA',
    description: 'Solução robusta para controle de pós finos e gases condensáveis.',
    applications: ['Farmacêutica (Pós)', 'Alimentícia (Silos)', 'Cimentos e Minerais'],
    cadFile: 'VTD-03.08-7.5cv.step',
    dimensions: '1280 x 1080 x 2050 mm',
    weightKg: 410
  },
  {
    id: 'vtd-08-20-7-5',
    family: 'VTD 08.20',
    model: 'VTD 08.20 7,5cv',
    powerCv: 7.5,
    minFlow: 7051,
    maxFlow: 15553,
    minPressure: 5.0,
    maxPressure: 50.0,
    efficiency: '99.6%',
    noiseLevel: '< 75 dBA',
    description: 'Alta vazão para sistemas centralizados de exaustão em galpões fabris.',
    applications: ['Usinagem Pesada', 'Células de Solda Automatizadas', 'Misturadores Industriais'],
    cadFile: 'VTD-08.20-7.5cv.step',
    dimensions: '1450 x 1200 x 2250 mm',
    weightKg: 520
  },
  {
    id: 'vtd-08-20-12-5',
    family: 'VTD 08.20',
    model: 'VTD 08.20 12,5cv',
    powerCv: 12.5,
    minFlow: 11737,
    maxFlow: 18953,
    minPressure: 5.0,
    maxPressure: 80.1,
    efficiency: '99.8%',
    noiseLevel: '< 76 dBA',
    description: 'Modelo de referência para linhas de alta produtividade e processos contínuos 24/7.',
    applications: ['Siderurgia', 'Indústria Automotiva', 'Reciclagem e Granulação'],
    cadFile: 'VTD-08.20-12.5cv.step',
    dimensions: '1550 x 1300 x 2400 mm',
    weightKg: 630
  },
  {
    id: 'vtd-08-20-15',
    family: 'VTD 08.20',
    model: 'VTD 08.20 15cv',
    powerCv: 15.0,
    minFlow: 13106,
    maxFlow: 21235,
    minPressure: 5.0,
    maxPressure: 80.1,
    efficiency: '99.8%',
    noiseLevel: '< 77 dBA',
    description: '★ Mais vendido: Potência máxima para grandes linhas fabris com exaustão incorporada e zero chaminés.',
    applications: ['Grandes Centrais CNC', 'Fornos de Indução', 'Caldeiras e Biomassa'],
    cadFile: 'VTD-08.20-15cv.step',
    dimensions: '1650 x 1380 x 2550 mm',
    weightKg: 720
  },
  {
    id: 'vtd-20-35-25',
    family: 'VTD 20.35',
    model: 'VTD 20.35 25cv',
    powerCv: 25.0,
    minFlow: 20129,
    maxFlow: 24168,
    minPressure: 5.1,
    maxPressure: 49.9,
    efficiency: '99.7%',
    noiseLevel: '< 78 dBA',
    description: 'Volume extremo de ar para processos pesados de queima e transformação mecânica.',
    applications: ['Mineração', 'Asfalto e Concreto', 'Fundição Pesada'],
    cadFile: 'VTD-20.35-25cv.step',
    dimensions: '1850 x 1550 x 2800 mm',
    weightKg: 950
  },
  {
    id: 'vtd-20-35-30',
    family: 'VTD 20.35',
    model: 'VTD 20.35 30cv',
    powerCv: 30.0,
    minFlow: 19723,
    maxFlow: 29405,
    minPressure: 5.0,
    maxPressure: 80.1,
    efficiency: '99.8%',
    noiseLevel: '< 79 dBA',
    description: 'Capacidade pesada de retenção de partículas finas com lavagem centrífuga contínua.',
    applications: ['Papel e Celulose', 'Secadores Rotativos', 'Usinas de Açúcar e Etanol'],
    cadFile: 'VTD-20.35-30cv.step',
    dimensions: '1980 x 1650 x 2950 mm',
    weightKg: 1120
  },
  {
    id: 'vtd-20-35-40',
    family: 'VTD 20.35',
    model: 'VTD 20.35 40cv',
    powerCv: 40.0,
    minFlow: 26991,
    maxFlow: 36290,
    minPressure: 5.0,
    maxPressure: 80.2,
    efficiency: '99.85%',
    noiseLevel: '< 80 dBA',
    description: 'Performance superior para complexos industriais com alta carga poluente.',
    applications: ['Piderúrgicas e Aciarias', 'Geração de Energia', 'Química Pesada'],
    cadFile: 'VTD-20.35-40cv.step',
    dimensions: '2150 x 1780 x 3150 mm',
    weightKg: 1350
  },
  {
    id: 'vtd-30-45-40',
    family: 'VTD 30.45',
    model: 'VTD 30.45 40cv',
    powerCv: 40.0,
    minFlow: 15694,
    maxFlow: 29408,
    minPressure: 4.9,
    maxPressure: 99.5,
    efficiency: '99.85%',
    noiseLevel: '< 80 dBA',
    description: 'Pressão ultra alta de até 100 mm.ca para vencer perdas de carga complexas.',
    applications: ['Filtros Centralizados de Alta Pressão', 'Processos com Longa Tubulação'],
    cadFile: 'VTD-30.45-40cv.step',
    dimensions: '2300 x 1900 x 3350 mm',
    weightKg: 1580
  },
  {
    id: 'vtd-30-45-50',
    family: 'VTD 30.45',
    model: 'VTD 30.45 50cv',
    powerCv: 50.0,
    minFlow: 24006,
    maxFlow: 44502,
    minPressure: 5.0,
    maxPressure: 99.6,
    efficiency: '99.9%',
    noiseLevel: '< 81 dBA',
    description: 'O maior precipitador da linha: até 44.500 m³/h de ar puro com turbo centrifugação total.',
    applications: ['Mega Plantas Industriais', 'Complexos Petroquímicos', 'Siderúrgicas Integradas'],
    cadFile: 'VTD-30.45-50cv.step',
    dimensions: '2500 x 2100 x 3600 mm',
    weightKg: 1950
  }
];

const DEFAULT_DOWNLOADS = [
  {
    id: 'dl-1',
    category: 'cad',
    title: 'Modelos CAD 3D — Linha VTD Completa (.STEP / .IGES)',
    format: 'STEP / ZIP',
    size: '42.8 MB',
    file: 'Veltha_VTD_3D_Models_Full_Package.zip',
    desc: 'Arquivos 3D volumétricos e dimensionais para inclusão direta em projetos no SolidWorks, Inventor e AutoCAD.',
    isLocked: true
  },
  {
    id: 'dl-2',
    category: 'cad',
    title: 'Plantas Baixas e Cortes 2D (.DWG)',
    format: 'DWG / AutoCAD',
    size: '18.4 MB',
    file: 'Veltha_VTD_Plantas_Cortes_2D.dwg',
    desc: 'Desenhos técnicos 2D com detalhes de bocais de entrada/saída, flanges e fixação em piso.',
    isLocked: true
  },
  {
    id: 'dl-3',
    category: 'manual',
    title: 'Manual de Engenharia, Instalação e Operação VTD',
    format: 'PDF',
    size: '8.5 MB',
    file: 'Manual_Engenharia_Operacao_VTD_Veltha.pdf',
    desc: 'Guia completo de dimensionamento de dutos, conexões hidráulicas e automação do sistema.',
    isLocked: false
  },
  {
    id: 'dl-4',
    category: 'laudo',
    title: 'Laudos Laboratoriais de Emissão e Eficiência (CETESB/IBAMA)',
    format: 'PDF',
    size: '5.2 MB',
    file: 'Laudos_Eficiencia_Ambiental_CONAMA_CETESB.pdf',
    desc: 'Relatórios de ensaios e medições gravimétricas comprovando retenção de até 99.9% de poluentes.',
    isLocked: true
  },
  {
    id: 'dl-5',
    category: 'datasheet',
    title: 'Data Sheet Consolidado — 17 Modelos VTD',
    format: 'PDF',
    size: '3.1 MB',
    file: 'DataSheet_Tecnico_Precipitadores_VTD.pdf',
    desc: 'Tabela comparativa de potência, vazões, pressões de trabalho e consumo de água em circuito fechado.',
    isLocked: false
  }
];

const DEFAULT_USERS = [
  {
    id: 'user-demo',
    name: 'Eng. Roberto Santos',
    company: 'Indústria Metalmecânica S/A',
    email: 'engenharia@cliente.com',
    password: 'veltha2026', // In production hashed, here for demo portal
    role: 'engenheiro',
    createdAt: new Date().toISOString()
  }
];

function initSeeds() {
  ensureDataDir();
  if (!fs.existsSync(MODELS_FILE)) writeJson(MODELS_FILE, DEFAULT_MODELS);
  if (!fs.existsSync(DOWNLOADS_FILE)) writeJson(DOWNLOADS_FILE, DEFAULT_DOWNLOADS);
  if (!fs.existsSync(USERS_FILE)) writeJson(USERS_FILE, DEFAULT_USERS);
  if (!fs.existsSync(LEADS_FILE)) writeJson(LEADS_FILE, []);
}

initSeeds();

export class Storage {
  // MODELS & SIMULATOR
  static getModels() {
    return readJson(MODELS_FILE, DEFAULT_MODELS);
  }

  static simulateEquipment(flowM3h, pressureMmca, pollutant = null) {
    const models = this.getModels();
    const targetFlow = parseFloat(flowM3h);
    const targetPress = parseFloat(pressureMmca);

    // Filter models that can deliver target flow and pressure
    const candidates = models.filter(m => {
      const flowOk = targetFlow >= m.minFlow && targetFlow <= m.maxFlow * 1.15;
      const pressOk = targetPress <= m.maxPressure * 1.1;
      return flowOk && pressOk;
    });

    if (candidates.length > 0) {
      // Sort by best power / efficiency fit (closest maxFlow without being undersized)
      candidates.sort((a, b) => {
        const diffA = Math.abs(a.maxFlow - targetFlow) + (a.powerCv * 100);
        const diffB = Math.abs(b.maxFlow - targetFlow) + (b.powerCv * 100);
        return diffA - diffB;
      });
      return {
        recommended: candidates[0],
        alternatives: candidates.slice(1, 3),
        totalMatching: candidates.length
      };
    }

    // Fallback if very high: return largest model or nearest
    const largest = models[models.length - 1];
    return {
      recommended: largest,
      alternatives: [models[models.length - 2]],
      totalMatching: 1,
      note: 'Para vazões muito elevadas, recomendamos módulos VTD em paralelo.'
    };
  }

  // DOWNLOADS
  static getDownloads() {
    return readJson(DOWNLOADS_FILE, DEFAULT_DOWNLOADS);
  }

  // USERS
  static getUsers() {
    return readJson(USERS_FILE, DEFAULT_USERS);
  }

  static findUserByEmail(email) {
    const users = this.getUsers();
    return users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  static registerUser(userData) {
    const users = this.getUsers();
    if (this.findUserByEmail(userData.email)) {
      return { error: 'E-mail já cadastrado no portal' };
    }
    const newUser = {
      id: 'usr_' + Date.now(),
      name: userData.name.trim(),
      company: userData.company?.trim() || '',
      email: userData.email.toLowerCase().trim(),
      password: userData.password,
      role: userData.role || 'cliente',
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    writeJson(USERS_FILE, users);
    return { user: newUser };
  }

  // LEADS & QUOTES
  static getLeads() {
    return readJson(LEADS_FILE, []);
  }

  static addLead(leadData) {
    const leads = this.getLeads();
    const newLead = {
      id: 'lead_' + Date.now(),
      name: leadData.name,
      email: leadData.email,
      phone: leadData.phone || '',
      company: leadData.company || '',
      sector: leadData.sector || '',
      pollutant: leadData.pollutant || '',
      flow: leadData.flow || '',
      pressure: leadData.pressure || '',
      recommendedModel: leadData.recommendedModel || '',
      message: leadData.message || '',
      createdAt: new Date().toISOString()
    };
    leads.unshift(newLead);
    writeJson(LEADS_FILE, leads);
    return newLead;
  }
}
