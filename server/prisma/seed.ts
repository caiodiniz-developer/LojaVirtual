/* eslint-disable no-console */
import { PrismaClient, type Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const u = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=80`;

const categories = [
  { name: 'Tênis', slug: 'tenis', description: 'Performance e estilo em cada passo', image: u('photo-1542291026-7eec264c27ff') },
  { name: 'Corrida', slug: 'corrida', description: 'Equipamento para quebrar seus recordes', image: u('photo-1552674605-db6ffd4facb5') },
  { name: 'Basquete', slug: 'basquete', description: 'Domine a quadra', image: u('photo-1546519638-68e109498ffc') },
  { name: 'Treino & Academia', slug: 'treino', description: 'Força, resistência e superação', image: u('photo-1517836357463-d25dfeac3438') },
  { name: 'Roupas', slug: 'roupas', description: 'Streetwear e performance para o dia a dia', image: u('photo-1556821840-3a63f95609a7') },
  { name: 'Acessórios', slug: 'acessorios', description: 'Os detalhes que completam o jogo', image: u('photo-1553062407-98eeb64c6a62') },
  { name: 'Futebol', slug: 'futebol', description: 'Do futsal ao gramado profissional', image: u('photo-1579952363873-27f3bade9f55') },
  { name: 'Ciclismo', slug: 'ciclismo', description: 'Pedale mais longe, mais rápido', image: u('photo-1485965120184-e220f721d03e') },
  { name: 'Natação', slug: 'natacao', description: 'Performance dentro da água', image: u('photo-1530549387789-4c1017266635') },
  { name: 'Outdoor & Trilha', slug: 'outdoor', description: 'Equipado para qualquer aventura', image: u('photo-1551632811-561732d1e306') },
  { name: 'Lutas', slug: 'lutas', description: 'Força, técnica e disciplina', image: u('photo-1549719386-74dfcbf7dbed') },
];

type SeedProduct = {
  title: string;
  slug: string;
  description: string;
  price: number;
  discount?: number;
  images: string[];
  category: string;
  stock: number;
  tags: string[];
  isFeatured?: boolean;
};

const products: SeedProduct[] = [
  // ---- Tênis
  { title: 'Sphere Runner X Pro', slug: 'sphere-runner-x-pro', description: 'O flagship da corrida: espuma NitroFoam com 85% de retorno de energia, placa de carbono e cabedal em mesh de engenharia. Desenvolvido com atletas de elite para voar baixo do primeiro ao último quilômetro.', price: 79900, discount: 25, images: [u('photo-1542291026-7eec264c27ff'), u('photo-1549298916-b41d501d3772')], category: 'tenis', stock: 48, tags: ['corrida', 'performance', 'carbono'], isFeatured: true },
  { title: 'AeroSphere Boost 2', slug: 'aerosphere-boost-2', description: 'Amortecimento responsivo AeroCell e drop de 8mm para treinos diários. Leve, respirável e pronto para qualquer ritmo — do trote regenerativo ao tiro de velocidade.', price: 89900, images: [u('photo-1606107557195-0e29a4b5b4aa')], category: 'tenis', stock: 35, tags: ['corrida', 'boost', 'diario'], isFeatured: true },
  { title: 'Sphere Court Classic', slug: 'sphere-court-classic', description: 'O clássico das quadras reinventado: couro premium, sola de borracha vulcanizada e o conforto que atravessa décadas. Do tênis ao streetwear em um só ícone.', price: 59900, images: [u('photo-1549298916-b41d501d3772'), u('photo-1525966222134-fcfa99b8ae77')], category: 'tenis', stock: 62, tags: ['casual', 'couro', 'classico'] },
  { title: 'Vertex Street Low', slug: 'vertex-street-low', description: 'Silhueta baixa com atitude urbana. Cabedal em camurça e nylon, entressola EVA macia e detalhes reflexivos para a cidade que nunca dorme.', price: 54900, discount: 15, images: [u('photo-1600185365483-26d7a4cc7519')], category: 'tenis', stock: 44, tags: ['streetwear', 'casual', 'urbano'] },
  { title: 'Sphere Flyknit Racer', slug: 'sphere-flyknit-racer', description: 'Cabedal em malha Flyknit de uma peça que abraça o pé como uma meia. 198g de pura velocidade para provas de 5K a 21K.', price: 99900, discount: 10, images: [u('photo-1491553895911-0055eca6402d')], category: 'tenis', stock: 27, tags: ['corrida', 'competicao', 'leve'], isFeatured: true },
  { title: "Retro Sphere '89", slug: 'retro-sphere-89', description: 'Direto dos arquivos: a silhueta que definiu uma geração, com paleta vintage, espuma atualizada e materiais premium. Nostalgia com conforto de 2026.', price: 74900, images: [u('photo-1605348532760-6753d2c43329')], category: 'tenis', stock: 31, tags: ['retro', 'colecionavel', 'lifestyle'] },
  { title: 'Sphere Blaze High', slug: 'sphere-blaze-high', description: 'Cano alto com personalidade: amarelo vibrante, colarinho acolchoado e sola serrilhada. Feito para quem não pede licença para chegar.', price: 69900, discount: 20, images: [u('photo-1560769629-975ec94e6a86')], category: 'tenis', stock: 22, tags: ['streetwear', 'cano-alto', 'statement'] },
  { title: 'Urban Sphere Canvas', slug: 'urban-sphere-canvas', description: 'Lona resistente, construção vulcanizada e minimalismo que combina com tudo. O essencial do guarda-roupa urbano pelo melhor preço.', price: 39900, images: [u('photo-1579338559194-a162d19bf842')], category: 'tenis', stock: 80, tags: ['casual', 'lona', 'essencial'] },
  { title: 'Sphere Marathon Elite', slug: 'sphere-marathon-elite', description: 'A escolha dos pódios: placa de carbono full-length, espuma PEBA superleve e aderência em qualquer asfalto. Recordes pessoais têm um novo aliado.', price: 119900, images: [u('photo-1595950653106-6c9ebd614d3a')], category: 'tenis', stock: 15, tags: ['corrida', 'maratona', 'elite'], isFeatured: true },
  { title: 'Sphere All-Day Comfort', slug: 'sphere-all-day-comfort', description: 'Espuma de conforto contínuo para quem passa o dia inteiro em pé. Palmilha anatômica, cabedal flexível e leveza do primeiro ao último compromisso.', price: 49900, discount: 30, images: [u('photo-1552346154-21d32810aba3')], category: 'tenis', stock: 57, tags: ['conforto', 'dia-a-dia', 'casual'] },

  // ---- Corrida
  { title: 'Jaqueta Corta-Vento AeroLight', slug: 'jaqueta-corta-vento-aerolight', description: 'Proteção contra vento e chuva fina em apenas 98g. Dobra no próprio bolso, tem refletivos 360° e ventilação nas costas para longões sem superaquecimento.', price: 34900, discount: 10, images: [u('photo-1591047139829-d91aecb6caea')], category: 'corrida', stock: 38, tags: ['jaqueta', 'corta-vento', 'refletivo'] },
  { title: 'Camiseta Dry-Run Performance', slug: 'camiseta-dry-run', description: 'Tecido DryWeave que afasta o suor da pele e seca em minutos. Costuras planas anti-atrito e proteção UV50+ para treinar sob o sol.', price: 12900, images: [u('photo-1618354691373-d851c5c3a990')], category: 'corrida', stock: 95, tags: ['camiseta', 'dry-fit', 'uv50'] },
  { title: 'Shorts 2-em-1 Sphere Run', slug: 'shorts-2-em-1-sphere-run', description: 'Shorts leve com bermuda de compressão integrada, bolso traseiro com zíper para chaves e gel, e cós elástico com cadarço interno.', price: 16900, images: [u('photo-1434682881908-b43d0467b798')], category: 'corrida', stock: 64, tags: ['shorts', 'compressao', 'treino'] },
  { title: 'Meia de Corrida Anti-Bolha (3 pares)', slug: 'meia-corrida-anti-bolha', description: 'Malha de dupla camada que elimina o atrito, calcanhar reforçado e suporte de arco. O upgrade mais barato para os seus treinos.', price: 7900, images: [u('photo-1586350977771-b3b0abd50c82')], category: 'corrida', stock: 120, tags: ['meia', 'kit', 'anti-bolha'] },
  { title: 'Boné Dri-Sphere Run', slug: 'bone-dri-sphere-run', description: 'Aba flexível, tecido de secagem rápida e faixa interna anti-suor. Ajuste por fivela e refletivos para correr de dia ou de noite.', price: 9900, discount: 15, images: [u('photo-1521369909029-2afed882baee')], category: 'corrida', stock: 73, tags: ['bone', 'corrida', 'refletivo'] },

  // ---- Basquete
  { title: 'Sphere Jump Elite', slug: 'sphere-jump-elite', description: 'Explosão vertical: câmara de ar visível no calcanhar, travamento de tornozelo e tração multidirecional para cortes agressivos. Assinado pela nossa linha pro.', price: 84900, discount: 15, images: [u('photo-1519861531473-9200262188bf'), u('photo-1546519638-68e109498ffc')], category: 'basquete', stock: 26, tags: ['basquete', 'quadra', 'pro'], isFeatured: true },
  { title: 'Bola Sphere Pro Indoor', slug: 'bola-sphere-pro-indoor', description: 'Couro composto premium com absorção de umidade, canais profundos e quique consistente. Aprovada para competições oficiais indoor.', price: 24900, images: [u('photo-1546519638-68e109498ffc')], category: 'basquete', stock: 41, tags: ['bola', 'indoor', 'oficial'] },
  { title: 'Regata Sphere Hoops', slug: 'regata-sphere-hoops', description: 'Malha ultra-respirável com recortes ergonômicos para liberdade total de movimento. Tecnologia anti-odor para jogos que viram madrugada.', price: 14900, discount: 20, images: [u('photo-1518063319789-7217e6706b04')], category: 'basquete', stock: 52, tags: ['regata', 'quadra', 'respiravel'] },

  // ---- Treino & Academia
  { title: 'Kit Halteres Ajustáveis 24kg', slug: 'kit-halteres-ajustaveis-24kg', description: 'Par de halteres com ajuste por dial de 2,5kg a 24kg em segundos. Substitui 15 pares convencionais e cabe embaixo da cama.', price: 149900, discount: 10, images: [u('photo-1571902943202-507ec2618e8f')], category: 'treino', stock: 18, tags: ['halteres', 'home-gym', 'forca'] },
  { title: 'Kettlebell Sphere 16kg', slug: 'kettlebell-sphere-16kg', description: 'Ferro fundido de peça única com pintura eletrostática e base plana. Alça larga para swings, cleans e snatches com pegada segura.', price: 39900, images: [u('photo-1517836357463-d25dfeac3438')], category: 'treino', stock: 29, tags: ['kettlebell', 'funcional', 'cross'] },
  { title: 'Tapete Yoga Align Pro', slug: 'tapete-yoga-align-pro', description: 'Borracha natural de 6mm com linhas de alinhamento e aderência absoluta mesmo com suor. Inclui alça de transporte em algodão.', price: 21900, images: [u('photo-1544367567-0f2fcb009e0b')], category: 'treino', stock: 47, tags: ['yoga', 'pilates', 'mobilidade'] },
  { title: 'Corda de Pular Speed Pro', slug: 'corda-pular-speed-pro', description: 'Rolamentos duplos de esferas, cabo de aço revestido e empunhaduras de alumínio. Ajuste rápido para double unders perfeitos.', price: 8900, discount: 10, images: [u('photo-1583454110551-21f2fa2afe61')], category: 'treino', stock: 88, tags: ['corda', 'cardio', 'cross'] },
  { title: 'Luva de Treino Grip Max', slug: 'luva-treino-grip-max', description: 'Palma em couro sintético microperfurado com grip texturizado e proteção de calos. Punho com velcro para suporte extra.', price: 11900, images: [u('photo-1526506118085-60ce8714f8c5')], category: 'treino', stock: 66, tags: ['luva', 'musculacao', 'grip'] },

  // ---- Roupas
  { title: 'Moletom Sphere Oversized', slug: 'moletom-sphere-oversized', description: 'Fleece pesado de 400g/m², capuz duplo e logo bordado no peito. O oversized perfeito: estruturado no ombro, solto no corpo.', price: 29900, discount: 20, images: [u('photo-1556821840-3a63f95609a7')], category: 'roupas', stock: 54, tags: ['moletom', 'streetwear', 'oversized'], isFeatured: true },
  { title: 'Camiseta Essential Sphere', slug: 'camiseta-essential-sphere', description: 'Algodão penteado de 220g/m² pré-encolhido, gola reforçada e caimento reto. A base de todo look, feita para durar.', price: 9900, images: [u('photo-1521572163474-6864f9cf17ab')], category: 'roupas', stock: 130, tags: ['camiseta', 'basico', 'algodao'] },
  { title: 'Legging Sculpt High-Rise', slug: 'legging-sculpt-high-rise', description: 'Cintura alta compressiva, tecido squat-proof de dupla face e bolso lateral para celular. Do agachamento ao café sem trocar de roupa.', price: 19900, images: [u('photo-1571945153237-4929e783af4a')], category: 'roupas', stock: 61, tags: ['legging', 'treino', 'squat-proof'], isFeatured: true },
  { title: 'Jaqueta Puffer Street', slug: 'jaqueta-puffer-street', description: 'Acolchoado térmico com tratamento repelente à água, capuz removível e bolsos aquecidos. O inverno virou desculpa para se vestir melhor.', price: 45900, discount: 25, images: [u('photo-1515886657613-9f3515b0c78f')], category: 'roupas', stock: 33, tags: ['jaqueta', 'puffer', 'inverno'] },
  { title: 'Camiseta Oversized Off-Court', slug: 'camiseta-oversized-off-court', description: 'Modelagem ampla com ombro caído e malha dupla de toque seco. Estampa gráfica exclusiva da coleção Off-Court.', price: 13900, images: [u('photo-1620799140408-edc6dcb6d633')], category: 'roupas', stock: 76, tags: ['camiseta', 'oversized', 'grafica'] },

  // ---- Acessórios
  { title: 'Mochila Urban Commuter 22L', slug: 'mochila-urban-commuter-22l', description: 'Compartimento acolchoado para notebook 16", bolso antifurto nas costas, tecido impermeável e passagem para cabo USB.', price: 32900, discount: 15, images: [u('photo-1553062407-98eeb64c6a62')], category: 'acessorios', stock: 45, tags: ['mochila', 'notebook', 'impermeavel'] },
  { title: 'Smartwatch Pulse S2', slug: 'smartwatch-pulse-s2', description: 'GPS integrado, monitoramento de sono e frequência cardíaca 24h, tela AMOLED e 14 dias de bateria. Resistente à água 5ATM.', price: 129900, discount: 20, images: [u('photo-1622560480605-d83c853bc5c3')], category: 'acessorios', stock: 23, tags: ['smartwatch', 'gps', 'fitness'], isFeatured: true },
  { title: 'Garrafa Térmica Sphere 1L', slug: 'garrafa-termica-sphere-1l', description: 'Aço inox de parede dupla: 24h gelado, 12h quente. Bocal largo para gelo, tampa com alça e acabamento soft-touch.', price: 12900, images: [u('photo-1602143407151-7111542de6e8')], category: 'acessorios', stock: 92, tags: ['garrafa', 'termica', 'hidratacao'] },
  { title: 'Boné Snapback Sphere Classic', slug: 'bone-snapback-sphere-classic', description: 'Aba reta, coroa estruturada de 6 gomos e logo bordado em alto relevo. Ajuste snap para qualquer tamanho.', price: 11900, images: [u('photo-1521369909029-2afed882baee')], category: 'acessorios', stock: 68, tags: ['bone', 'snapback', 'streetwear'] },
  { title: 'Meião Performance Cano Alto', slug: 'meiao-performance-cano-alto', description: 'Compressão gradual na panturrilha, calcanhar anatômico e malha respirável. O detalhe que segura o jogo inteiro.', price: 5900, images: [u('photo-1586350977771-b3b0abd50c82')], category: 'acessorios', stock: 140, tags: ['meiao', 'compressao', 'kit'] },

  // ---- Futebol
  { title: 'Chuteira Sphere Strike FG', slug: 'chuteira-sphere-strike-fg', description: 'Cabedal texturizado para controle absoluto da bola, travas cônicas para gramado natural e solado de propulsão lateral. Finalize como um camisa 9.', price: 64900, discount: 20, images: [u('photo-1579952363873-27f3bade9f55'), u('photo-1517466787929-bc90951d0974')], category: 'futebol', stock: 42, tags: ['chuteira', 'campo', 'gramado'], isFeatured: true },
  { title: 'Bola Sphere League Pro', slug: 'bola-sphere-league-pro', description: 'Bola oficial de match: 12 gomos termocolados, voo estável e toque macio. Aprovada pelos padrões FIFA Quality Pro.', price: 29900, images: [u('photo-1517466787929-bc90951d0974')], category: 'futebol', stock: 55, tags: ['bola', 'oficial', 'match'] },
  { title: 'Camisa Sphere FC 2026 Home', slug: 'camisa-sphere-fc-2026', description: 'O manto da temporada: tecido DryWeave com mapeamento térmico, escudo bordado e corte atlético. Vista a paixão.', price: 24900, discount: 10, images: [u('photo-1508098682722-e99c43a406b2')], category: 'futebol', stock: 78, tags: ['camisa', 'time', 'torcida'], isFeatured: true },
  { title: 'Caneleira Guard Lite', slug: 'caneleira-guard-lite', description: 'Casco de polipropileno com espuma EVA de absorção e faixa de compressão antideslizante. Proteção que você esquece que está usando.', price: 7900, images: [u('photo-1560272564-c83b66b1ad12')], category: 'futebol', stock: 90, tags: ['caneleira', 'protecao', 'treino'] },
  { title: 'Luva de Goleiro GripShot Pro', slug: 'luva-goleiro-gripshot-pro', description: 'Palma em látex alemão de 4mm com corte negativo e punho elástico duplo. Aderência máxima em qualquer clima.', price: 18900, discount: 15, images: [u('photo-1431324155629-1a6deb1dec8d')], category: 'futebol', stock: 34, tags: ['goleiro', 'luva', 'latex'] },
  { title: 'Kit Treino Futebol (10 cones + escada)', slug: 'kit-treino-futebol', description: 'Escada de agilidade de 4m, 10 cones chineses e bolsa de transporte. Monte seu circuito de treino em qualquer lugar.', price: 9900, images: [u('photo-1560272564-c83b66b1ad12')], category: 'futebol', stock: 61, tags: ['treino', 'agilidade', 'kit'] },

  // ---- Ciclismo
  { title: 'Bike Speed Sphere R1 Carbon', slug: 'bike-speed-sphere-r1', description: 'Quadro full carbon de 8,2kg, grupo de 22 velocidades e freios a disco hidráulicos. A máquina definitiva para o asfalto.', price: 1299900, discount: 12, images: [u('photo-1485965120184-e220f721d03e'), u('photo-1571068316344-75bc76f77890')], category: 'ciclismo', stock: 7, tags: ['bike', 'speed', 'carbono'], isFeatured: true },
  { title: 'Capacete Aero Sphere V2', slug: 'capacete-aero-sphere-v2', description: 'Estrutura in-mold com 22 entradas de ar, ajuste micrométrico e luz traseira integrada recarregável por USB.', price: 34900, discount: 10, images: [u('photo-1571068316344-75bc76f77890')], category: 'ciclismo', stock: 29, tags: ['capacete', 'seguranca', 'aero'] },
  { title: 'Óculos Photochromic Ride', slug: 'oculos-photochromic-ride', description: 'Lentes fotocromáticas que escurecem em 0,3s, armação TR90 de 24g e borrachas antideslizantes. Do amanhecer ao pôr do sol.', price: 19900, images: [u('photo-1572635196237-14b3f281503f')], category: 'ciclismo', stock: 45, tags: ['oculos', 'fotocromatico', 'pedal'] },
  { title: 'Bermuda Ciclismo Gel Pro', slug: 'bermuda-ciclismo-gel-pro', description: 'Forro de gel de densidade dupla para pedais de 4h+, tecido compressivo e faixas refletivas nas pernas.', price: 16900, images: [u('photo-1541625602330-2277a4c46182')], category: 'ciclismo', stock: 52, tags: ['bermuda', 'gel', 'conforto'] },
  { title: 'Farol Bike 1000 Lúmens USB', slug: 'farol-bike-1000-lumens', description: 'LED de 1000 lúmens com 5 modos, bateria de 8h e carcaça em alumínio à prova de chuva. Pedale seguro à noite.', price: 12900, discount: 20, images: [u('photo-1485965120184-e220f721d03e')], category: 'ciclismo', stock: 66, tags: ['farol', 'luz', 'seguranca'] },

  // ---- Natação
  { title: 'Óculos HydroVision Race', slug: 'oculos-hydrovision-race', description: 'Lentes espelhadas antiembaçantes com proteção UV, vedação de silicone hipoalergênico e 3 tamanhos de ponte nasal.', price: 9900, images: [u('photo-1530549387789-4c1017266635')], category: 'natacao', stock: 74, tags: ['oculos', 'piscina', 'race'] },
  { title: 'Touca Silicone Sphere Pro', slug: 'touca-silicone-sphere-pro', description: 'Silicone 3D de 50g que não repuxa, hidrodinâmica otimizada e resistência ao cloro. Disponível em 4 cores.', price: 4900, images: [u('photo-1519315901367-f34ff9154487')], category: 'natacao', stock: 110, tags: ['touca', 'silicone', 'treino'] },
  { title: 'Maiô Competition AquaFlex', slug: 'maio-competition-aquaflex', description: 'Tecido com 30% de elastano e repelência à água, costura soldada e abertura traseira. Homologado para competições.', price: 22900, discount: 15, images: [u('photo-1530549387789-4c1017266635')], category: 'natacao', stock: 38, tags: ['maio', 'competicao', 'piscina'] },
  { title: 'Prancha + Pull Buoy EVA Kit', slug: 'prancha-pull-buoy-kit', description: 'Kit de treino em EVA de célula fechada: prancha ergonômica e pull buoy de densidade progressiva para pernada e braçada.', price: 11900, images: [u('photo-1519315901367-f34ff9154487')], category: 'natacao', stock: 47, tags: ['prancha', 'treino', 'kit'] },

  // ---- Outdoor & Trilha
  { title: 'Bota Trilha TerraGrip Mid', slug: 'bota-trilha-terragrip-mid', description: 'Membrana impermeável respirável, solado Vibram com cravos de 5mm e proteção de tornozelo. Encara lama, pedra e serra.', price: 54900, discount: 15, images: [u('photo-1551632811-561732d1e306'), u('photo-1501554728187-ce583db33af7')], category: 'outdoor', stock: 31, tags: ['bota', 'trilha', 'impermeavel'], isFeatured: true },
  { title: 'Barraca UltraLight 2P', slug: 'barraca-ultralight-2p', description: 'Apenas 1,8kg na mochila: varetas de alumínio aeronáutico, coluna d\'água de 3000mm e montagem em 5 minutos.', price: 79900, discount: 10, images: [u('photo-1504280390367-361c6d9f38f4')], category: 'outdoor', stock: 19, tags: ['barraca', 'camping', 'ultraleve'] },
  { title: 'Mochila Cargueira Summit 45L', slug: 'mochila-cargueira-summit-45l', description: 'Sistema de suspensão ajustável, capa de chuva integrada, saída para hidratação e 9 bolsos de organização.', price: 42900, images: [u('photo-1501554728187-ce583db33af7')], category: 'outdoor', stock: 26, tags: ['mochila', 'trekking', '45l'] },
  { title: 'Jaqueta Trail 3-em-1', slug: 'jaqueta-trail-3-em-1', description: 'Casca impermeável + fleece removível: use separados ou juntos. Costuras seladas e capuz compatível com capacete.', price: 59900, discount: 20, images: [u('photo-1464822759023-fed622ff2c3b')], category: 'outdoor', stock: 23, tags: ['jaqueta', 'impermeavel', 'inverno'] },

  // ---- Lutas
  { title: 'Luva de Boxe Sphere Punch 14oz', slug: 'luva-boxe-sphere-punch-14oz', description: 'Injeção de espuma multicamada, forro antimicrobiano e fecho de velcro largo. Proteção de nível profissional para treino diário.', price: 24900, discount: 15, images: [u('photo-1549719386-74dfcbf7dbed')], category: 'lutas', stock: 40, tags: ['boxe', 'luva', 'muay-thai'], isFeatured: true },
  { title: 'Bandagem Elástica 5m (par)', slug: 'bandagem-elastica-5m', description: 'Algodão com elastano de 5cm x 5m, fecho de velcro e alça de polegar. Estabilidade total para punhos e metacarpos.', price: 4900, images: [u('photo-1517438322307-e67111335449')], category: 'lutas', stock: 95, tags: ['bandagem', 'boxe', 'protecao'] },
  { title: 'Saco de Pancada Pro 120cm', slug: 'saco-pancada-pro-120cm', description: 'Lona náutica de alta resistência, alças em corrente com rolamento giratório e enchimento balanceado de 35kg.', price: 39900, images: [u('photo-1549719386-74dfcbf7dbed')], category: 'lutas', stock: 17, tags: ['saco', 'pancada', 'treino'] },
  { title: 'Corda Naval 12m Battle Rope', slug: 'corda-naval-12m', description: 'Polidacron trançado de 38mm com pontas emborrachadas. Cardio e força explosiva no mesmo movimento.', price: 29900, discount: 10, images: [u('photo-1517438322307-e67111335449')], category: 'lutas', stock: 21, tags: ['corda-naval', 'funcional', 'cardio'] },

  // ---- Tênis (mais)
  { title: 'Sphere Trail Runner GTX', slug: 'sphere-trail-runner-gtx', description: 'Tênis de trail running com membrana impermeável, solado de cravos agressivos e placa de proteção contra pedras. Feito para a montanha.', price: 84900, discount: 10, images: [u('photo-1606107557195-0e29a4b5b4aa')], category: 'tenis', stock: 33, tags: ['trail', 'corrida', 'impermeavel'] },
  { title: 'Sphere Slip-On Comfort', slug: 'sphere-slip-on-comfort', description: 'Calce sem cadarço, palmilha de memória e cabedal em malha elástica. O tênis do dia a dia que veste como um chinelo premium.', price: 42900, images: [u('photo-1552346154-21d32810aba3')], category: 'tenis', stock: 71, tags: ['casual', 'conforto', 'slip-on'] },
  { title: 'Sphere Skate Deck Pro', slug: 'sphere-skate-deck-pro', description: 'Cabedal em suede reforçado nas áreas de atrito, cupsole vulcanizada e drop-in de espuma. Aderência total no shape.', price: 49900, discount: 15, images: [u('photo-1525966222134-fcfa99b8ae77')], category: 'tenis', stock: 40, tags: ['skate', 'street', 'suede'] },

  // ---- Corrida (mais)
  { title: 'Cinto de Hidratação Trail 500ml', slug: 'cinto-hidratacao-trail', description: 'Dois flasks de 250ml, bolso elástico para o celular e ajuste sem repuxo. Hidrate-se sem parar a passada.', price: 13900, images: [u('photo-1508162942367-e4a1b8a5c9c2')], category: 'corrida', stock: 58, tags: ['hidratacao', 'trail', 'acessorio'] },
  { title: 'Relógio GPS Sphere Run 2', slug: 'relogio-gps-sphere-run-2', description: 'GPS multibanda, VO2 máx, planos de treino e 30h de bateria em modo GPS. O parceiro de treino no seu pulso.', price: 149900, discount: 12, images: [u('photo-1523275335684-37898b6baf30')], category: 'corrida', stock: 24, tags: ['relogio', 'gps', 'performance'], isFeatured: true },

  // ---- Treino (mais)
  { title: 'Banco Ajustável FID Pro', slug: 'banco-ajustavel-fid-pro', description: 'Sete ângulos de encosto, estofamento de alta densidade e estrutura que aguenta 300kg. A base de todo home gym sério.', price: 89900, discount: 10, images: [u('photo-1534438327276-14e5300c3a48')], category: 'treino', stock: 15, tags: ['banco', 'home-gym', 'musculacao'] },
  { title: 'Anilhas Bumper 10kg (par)', slug: 'anilhas-bumper-10kg', description: 'Borracha reciclada de alta densidade, furo de aço de 50mm e quique reduzido. Para levantamentos olímpicos sem medo.', price: 59900, images: [u('photo-1517963879433-6ad2b056d712')], category: 'treino', stock: 28, tags: ['anilha', 'crossfit', 'peso'] },
  { title: 'Faixa Elástica Kit 5 Níveis', slug: 'faixa-elastica-kit-5', description: 'Cinco resistências de látex natural, do leve ao extra-forte, com bolsa e guia de exercícios. Treino completo em qualquer lugar.', price: 8900, discount: 20, images: [u('photo-1598289431512-b97b0917affc')], category: 'treino', stock: 84, tags: ['faixa', 'mobilidade', 'kit'] },

  // ---- Futebol (mais)
  { title: 'Chuteira Society Sphere Grip', slug: 'chuteira-society-sphere-grip', description: 'Solado de borracha com micro-travas para grama sintética, cabedal macio e forma anatômica. Domínio total no society.', price: 44900, discount: 10, images: [u('photo-1511426463457-0571e247d816')], category: 'futebol', stock: 47, tags: ['chuteira', 'society', 'sintetico'] },
  { title: 'Meião Futebol Pro (par)', slug: 'meiao-futebol-pro', description: 'Compressão na canela, reforço na sola e tecido que segura a caneleira no lugar. Detalhe de quem leva o jogo a sério.', price: 5900, images: [u('photo-1580087433295-ab2600c1030e')], category: 'futebol', stock: 130, tags: ['meiao', 'futebol', 'acessorio'] },

  // ---- Basquete (mais)
  { title: 'Sphere Guard Low', slug: 'sphere-guard-low', description: 'Cano baixo para armadores: leveza extrema, amortecimento no antepé e tração em espinha de peixe para mudanças de direção.', price: 72900, discount: 10, images: [u('photo-1552346154-21d32810aba3')], category: 'basquete', stock: 30, tags: ['basquete', 'cano-baixo', 'armador'] },
  { title: 'Tabela de Basquete Portátil', slug: 'tabela-basquete-portatil', description: 'Altura ajustável de 2,3m a 3,05m, base preenchível e aro com molas. Leve a quadra para a sua garagem.', price: 129900, images: [u('photo-1546519638-68e109498ffc')], category: 'basquete', stock: 11, tags: ['tabela', 'aro', 'outdoor'] },

  // ---- Ciclismo (mais)
  { title: 'Bike MTB Sphere Trail 29', slug: 'bike-mtb-sphere-trail-29', description: 'Quadro de alumínio hidroformado, aro 29, suspensão de 120mm e freios a disco. Encare qualquer trilha com confiança.', price: 649900, discount: 8, images: [u('photo-1576435728678-68d0fbf94e91')], category: 'ciclismo', stock: 9, tags: ['bike', 'mtb', 'trilha'], isFeatured: true },
  { title: 'Kit Reparo + Bomba Portátil', slug: 'kit-reparo-bomba-portatil', description: 'Mini bomba de 120psi, remendos, espátulas e multi-ferramenta de 16 funções numa bolsa compacta de selim.', price: 9900, images: [u('photo-1541625602330-2277a4c46182')], category: 'ciclismo', stock: 72, tags: ['reparo', 'bomba', 'kit'] },

  // ---- Natação (mais)
  { title: 'Nadadeira de Treino Sphere Fin', slug: 'nadadeira-treino-sphere-fin', description: 'Pé de pato curto em silicone para fortalecer a pernada sem sobrecarregar o tornozelo. Aumenta a propulsão nos treinos.', price: 15900, images: [u('photo-1560090995-01632a28895b')], category: 'natacao', stock: 43, tags: ['nadadeira', 'treino', 'silicone'] },

  // ---- Outdoor (mais)
  { title: 'Saco de Dormir -5°C UltraTherm', slug: 'saco-dormir-ultratherm', description: 'Enchimento sintético de alta compressibilidade, capuz ajustável e zíper anti-enrosco. Conforto térmico até -5°C.', price: 34900, discount: 15, images: [u('photo-1504280390367-361c6d9f38f4')], category: 'outdoor', stock: 27, tags: ['saco-dormir', 'camping', 'inverno'] },
  { title: 'Lanterna de Cabeça 500lm USB-C', slug: 'lanterna-cabeca-500lm', description: 'Facho de 500 lúmens, sensor de gesto, luz vermelha de visão noturna e recarga USB-C. Mãos livres na escuridão.', price: 12900, images: [u('photo-1476081718509-d5d0b661a376')], category: 'outdoor', stock: 55, tags: ['lanterna', 'trilha', 'recarregavel'] },

  // ---- Acessórios (mais)
  { title: 'Fone Esportivo Sphere Beat', slug: 'fone-esportivo-sphere-beat', description: 'Intra-auricular à prova de suor IPX7, ganchos ergonômicos e 32h com estojo. Não sai do ouvido nem no sprint final.', price: 29900, discount: 20, images: [u('photo-1590658268037-6bf12165a8df')], category: 'acessorios', stock: 62, tags: ['fone', 'bluetooth', 'ipx7'], isFeatured: true },
  { title: 'Óculos de Sol Sphere Active', slug: 'oculos-sol-sphere-active', description: 'Lentes polarizadas UV400, armação TR90 flexível e hastes emborrachadas. Proteção e estilo em qualquer esporte ao ar livre.', price: 17900, images: [u('photo-1572635196237-14b3f281503f')], category: 'acessorios', stock: 58, tags: ['oculos', 'polarizado', 'uv400'] },
];

const reviewPool = [
  { rating: 5, title: 'Superou as expectativas', comment: 'Qualidade impecável, chegou antes do prazo e a embalagem é linda. Recomendo demais!' },
  { rating: 5, title: 'Compra perfeita', comment: 'Exatamente como nas fotos. O acabamento é premium e o custo-benefício é excelente.' },
  { rating: 4, title: 'Muito bom', comment: 'Produto de ótima qualidade. Só demorou um pouco mais que o esperado para chegar.' },
  { rating: 5, title: 'Recomendo!', comment: 'Segunda compra na loja e mais uma vez tudo perfeito. Atendimento nota 10.' },
  { rating: 4, title: 'Vale a pena', comment: 'Bom produto pelo preço. O material é resistente e o design é ainda mais bonito pessoalmente.' },
  { rating: 5, title: 'Sensacional', comment: 'Uso todos os dias desde que chegou. Melhor investimento que fiz este ano.' },
  { rating: 5, title: 'Virou meu favorito', comment: 'Conforto absurdo. Já garanti uma segunda unidade antes que acabe o estoque.' },
];

async function main() {
  console.log('🌱 Seeding database...');

  await prisma.$transaction([
    prisma.payment.deleteMany(),
    prisma.orderItem.deleteMany(),
    prisma.order.deleteMany(),
    prisma.review.deleteMany(),
    prisma.cartItem.deleteMany(),
    prisma.wishlistItem.deleteMany(),
    prisma.address.deleteMany(),
    prisma.coupon.deleteMany(),
    prisma.product.deleteMany(),
    prisma.category.deleteMany(),
    prisma.newsletterSubscriber.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  // ---- Users
  const adminPassword = await bcrypt.hash('Admin@123', 10);
  const customerPassword = await bcrypt.hash('Cliente@123', 10);

  await prisma.user.create({
    data: { name: 'Caio Admin', email: 'admin@shopsphere.dev', password: adminPassword, role: 'ADMIN' },
  });

  const customerNames = [
    ['Ana Souza', 'ana@example.com'],
    ['Bruno Lima', 'bruno@example.com'],
    ['Carla Mendes', 'carla@example.com'],
    ['Diego Rocha', 'diego@example.com'],
    ['Elisa Martins', 'elisa@example.com'],
    ['Felipe Torres', 'felipe@example.com'],
  ] as const;

  const customers = [];
  for (const [name, email] of customerNames) {
    customers.push(
      await prisma.user.create({ data: { name, email, password: customerPassword, role: 'CUSTOMER' } })
    );
  }

  await prisma.address.create({
    data: {
      userId: customers[0].id,
      label: 'Casa',
      street: 'Rua das Palmeiras',
      number: '123',
      district: 'Jardim Europa',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01449-000',
      isDefault: true,
    },
  });

  // ---- Categories & Products
  const categoryMap = new Map<string, string>();
  for (const cat of categories) {
    const created = await prisma.category.create({ data: cat });
    categoryMap.set(cat.slug, created.id);
  }

  const createdProducts = [];
  for (const p of products) {
    const { category, ...data } = p;
    createdProducts.push(
      await prisma.product.create({
        data: {
          ...data,
          discount: p.discount ?? 0,
          isFeatured: p.isFeatured ?? false,
          categoryId: categoryMap.get(category)!,
        },
      })
    );
  }

  // ---- Reviews (and denormalized rating aggregates)
  for (const product of createdProducts) {
    const count = 2 + Math.floor(Math.random() * 5); // 2-6 reviews
    const reviewers = [...customers].sort(() => Math.random() - 0.5).slice(0, count);
    let sum = 0;
    for (const reviewer of reviewers) {
      const review = reviewPool[Math.floor(Math.random() * reviewPool.length)];
      sum += review.rating;
      await prisma.review.create({
        data: { userId: reviewer.id, productId: product.id, ...review },
      });
    }
    await prisma.product.update({
      where: { id: product.id },
      data: { rating: Math.round((sum / reviewers.length) * 10) / 10, reviewCount: reviewers.length },
    });
  }

  // ---- Coupons
  await prisma.coupon.createMany({
    data: [
      { code: 'BEMVINDO10', type: 'PERCENTAGE', value: 10 },
      { code: 'SPHERE20', type: 'PERCENTAGE', value: 20, minSubtotal: 20000 },
      { code: 'VIP50', type: 'FIXED', value: 5000, minSubtotal: 30000, maxUses: 100 },
    ],
  });

  // ---- Historic orders (last 6 months) so the admin dashboard has data
  const statuses = ['DELIVERED', 'DELIVERED', 'DELIVERED', 'SHIPPED', 'PROCESSING', 'PAID'] as const;
  const now = Date.now();
  let orderIndex = 0;

  for (let i = 0; i < 48; i++) {
    const customer = customers[i % customers.length];
    const itemCount = 1 + Math.floor(Math.random() * 3);
    const chosen = [...createdProducts].sort(() => Math.random() - 0.5).slice(0, itemCount);

    const items = chosen.map((p) => ({
      productId: p.id,
      title: p.title,
      image: (p.images as string[])[0],
      price: Math.round(p.price * (1 - p.discount / 100)),
      quantity: 1 + Math.floor(Math.random() * 2),
    }));
    const subtotal = items.reduce((s, it) => s + it.price * it.quantity, 0);
    const shippingCost = subtotal >= 25000 ? 0 : 1990;
    const total = subtotal + shippingCost;
    const createdAt = new Date(now - Math.floor(Math.random() * 180) * 24 * 60 * 60 * 1000);

    await prisma.order.create({
      data: {
        code: `SS-SEED${String(++orderIndex).padStart(3, '0')}`,
        userId: customer.id,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        subtotal,
        discount: 0,
        shippingCost,
        total,
        shippingMethod: 'Econômico · SphereLog',
        shippingAddress: {
          label: 'Casa', street: 'Rua das Palmeiras', number: '123', complement: null,
          district: 'Jardim Europa', city: 'São Paulo', state: 'SP', zipCode: '01449-000',
        } as Prisma.InputJsonValue,
        createdAt,
        items: { create: items },
        payment: {
          create: {
            method: i % 3 === 0 ? 'PIX' : 'CREDIT_CARD',
            status: 'APPROVED',
            amount: total,
            cardLast4: i % 3 === 0 ? null : '4242',
            transactionId: `txn_seed_${i}_${Date.now()}`,
            paidAt: createdAt,
          },
        },
      },
    });

    // Keep "sold" consistent with the historic orders
    for (const it of items) {
      await prisma.product.update({
        where: { id: it.productId },
        data: { sold: { increment: it.quantity } },
      });
    }
  }

  console.log('✅ Seed complete!');
  console.log('   Admin   → admin@shopsphere.dev / Admin@123');
  console.log('   Cliente → ana@example.com / Cliente@123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
