import { AvatarInfo, PastryCharacter } from '../types/game';

export const AVATARS: AvatarInfo[] = [
  { id: 0, name: 'Neko Cyber', animal: 'Chat', badgeBg: 'bg-rose-500', avatarColor: '#f43f5e', instrument: 'Synthé Néon', imageSrc: '/images/avatar_cat_neko_1791823670581.jpg' },
  { id: 1, name: 'Usagi Pop', animal: 'Lapine', badgeBg: 'bg-cyan-400', avatarColor: '#22d3ee', instrument: 'Micro Laser', imageSrc: '/images/avatar_bunny_usagi_1791823680229.jpg' },
  { id: 2, name: 'Shiba Rock', animal: 'Shiba', badgeBg: 'bg-amber-400', avatarColor: '#fbbf24', instrument: 'Guitare Électrique', imageSrc: '/images/avatar_shiba_dog_1791823690008.jpg' },
  { id: 3, name: 'Panda Beat', animal: 'Panda', badgeBg: 'bg-emerald-400', avatarColor: '#34d399', instrument: 'Batterie Fluo', imageSrc: '/images/avatar_panda_beat_1791823699556.jpg' },
  { id: 4, name: 'Kitsune Solo', animal: 'Renarde', badgeBg: 'bg-fuchsia-500', avatarColor: '#d946ef', instrument: 'Guitare Lead', imageSrc: '/images/avatar_fox_kitsune_1791823710889.jpg' },
  { id: 5, name: 'Kuma Bass', animal: 'Ours', badgeBg: 'bg-blue-500', avatarColor: '#3b82f6', instrument: 'Basse 5 Cordes', imageSrc: '/images/avatar_bear_kuma_1791823720468.jpg' },
  { id: 6, name: 'Kero Tempo', animal: 'Grenouille', badgeBg: 'bg-lime-400', avatarColor: '#a3e635', instrument: 'Platines DJ', imageSrc: '/images/avatar_frog_kero_1791823730969.jpg' },
  { id: 7, name: 'Pingu Riff', animal: 'Pingouin', badgeBg: 'bg-indigo-400', avatarColor: '#818cf8', instrument: 'Basse Fretless', imageSrc: '/images/avatar_penguin_pingu_1791823741237.jpg' },
  { id: 8, name: 'Hamu Groove', animal: 'Hamster', badgeBg: 'bg-orange-400', avatarColor: '#fb923c', instrument: 'Baguettes Éclair', imageSrc: '/images/avatar_hamster_hamu_1791823751200.jpg' },
  { id: 9, name: 'Koala Chill', animal: 'Koala', badgeBg: 'bg-teal-400', avatarColor: '#2dd4bf', instrument: 'Ukulélé Cyber', imageSrc: '/images/avatar_koala_chill_1791823760517.jpg' },
  { id: 10, name: 'Loutre Funk', animal: 'Loutre', badgeBg: 'bg-violet-400', avatarColor: '#a78bfa', instrument: 'Keytar Rétro', imageSrc: '/images/avatar_otter_funk_1791823771231.jpg' },
  { id: 11, name: 'Ryu Kawaii', animal: 'Dragon', badgeBg: 'bg-pink-400', avatarColor: '#f472b6', instrument: 'Triangle Cosmique', imageSrc: '/images/avatar_dragon_ryu_1791823780040.jpg' },
];

export const PASTRY_CHARACTERS: PastryCharacter[] = [
  // 1-20: Communes
  { id: 1, name: 'Choco-Slash', title: 'Le Soliste Cacao', rarity: 'commune', instrument: 'Guitare biscuit', flavor: 'Chocolat 70%', tagline: 'Riffs fondants garantis !', color: '#854d0e', emoji: '🍫' },
  { id: 2, name: 'Fraisier-Pop', title: 'La Chanteuse Acidulée', rarity: 'commune', instrument: 'Micro crème chantilly', flavor: 'Fraise Tagada', tagline: 'Une voix sucrée sans fausse note.', color: '#f43f5e', emoji: '🍓' },
  { id: 3, name: 'Mochi-Vibes', title: 'Le Batteur Moelleux', rarity: 'commune', instrument: 'Batterie pâte de riz', flavor: 'Fleur de cerisier', tagline: 'Un tempo tout doux et rebondissant.', color: '#ec4899', emoji: '🍡' },
  { id: 4, name: 'Éclair-Laser', title: 'Le Bassiste Fusée', rarity: 'commune', instrument: 'Basse chocolat blanc', flavor: 'Café glacé', tagline: 'Plus rapide qu’un éclair gourmand.', color: '#d97706', emoji: '⚡' },
  { id: 5, name: 'Donut-Galaxie', title: 'Le Rythmique Cosmique', rarity: 'commune', instrument: 'Guitare anneau étoilé', flavor: 'Glaçage myrtille', tagline: 'Des pépites de son dans l’espace.', color: '#8b5cf6', emoji: '🍩' },
  { id: 6, name: 'Cupcake-Punk', title: 'Le Pogo Gourmand', rarity: 'commune', instrument: 'Mini guitare vermicelles', flavor: 'Vanille bourbon', tagline: 'Petite taille, grosse distorsion !', color: '#06b6d4', emoji: '🧁' },
  { id: 7, name: 'Tarte-Néon', title: 'La Claviériste Citron', rarity: 'commune', instrument: 'Clavier pâte sablée', flavor: 'Citron meringué', tagline: 'Des notes qui piquent juste ce qu’il faut.', color: '#eab308', emoji: '🍋' },
  { id: 8, name: 'Macaron-Synth', title: 'L’Arpégiateur Pistache', rarity: 'commune', instrument: 'Boîte à rythmes coque', flavor: 'Pistache grillée', tagline: 'Croustillant à l’extérieur, fondant dedans.', color: '#84cc16', emoji: '🍪' },
  { id: 9, name: 'Madeleine-Rock', title: 'La Riffette Dorée', rarity: 'commune', instrument: 'Guitare coquille', flavor: 'Fleur d’oranger', tagline: 'Un souvenir de rock inoubliable.', color: '#f59e0b', emoji: '🥐' },
  { id: 10, name: 'Gaufre-Rythme', title: 'Le Percussionniste Carré', rarity: 'commune', instrument: 'Caisse claire alvéolée', flavor: 'Sucre perlé', tagline: 'Chaque case a son propre battement.', color: '#ea580c', emoji: '🧇' },
  { id: 11, name: 'Canelé-Groove', title: 'Le Tromboniste Cannelé', rarity: 'commune', instrument: 'Cuivre caramélisé', flavor: 'Vanille rhum léger', tagline: 'Une basse chaude et croustillante.', color: '#78350f', emoji: '🍮' },
  { id: 12, name: 'Chouquette-Duo', title: 'Les Jumelles Sucre', rarity: 'commune', instrument: 'Shakers perles de sucre', flavor: 'Pâte à choux', tagline: 'Deux fois plus d’énergie sur scène.', color: '#fde047', emoji: '🥯' },
  { id: 13, name: 'Babka-Twist', title: 'Le Torsadeur Mélodique', rarity: 'commune', instrument: 'Basse tressée', flavor: 'Noisette noisette', tagline: 'Des accords entrelacés comme une brioche.', color: '#a16207', emoji: '🥨' },
  { id: 14, name: 'Brioche-Funky', title: 'Le Chœur Moelleux', rarity: 'commune', instrument: 'Harmonica beurré', flavor: 'Beurre frais', tagline: 'Chantez en chœur pour la fraction !', color: '#facc15', emoji: '🍞' },
  { id: 15, name: 'Financier-Solo', title: 'Le Virtuose Amande', rarity: 'commune', instrument: 'Violon beurre noisette', flavor: 'Amande douce', tagline: 'Des solos riches et croustillants.', color: '#d97706', emoji: '🥖' },
  { id: 16, name: 'Sablé-Laser', title: 'Le Percuteur Breton', rarity: 'commune', instrument: 'Tambour fleur de sel', flavor: 'Beurre salé', tagline: 'Un impact bien salé sur la mesure.', color: '#ca8a04', emoji: '🥞' },
  { id: 17, name: 'Meringue-Air', title: 'La Soprano Nuage', rarity: 'commune', instrument: 'Harpe aérienne', flavor: 'Sucre glace', tagline: 'Des notes aiguës aussi légères que l’air.', color: '#e2e8f0', emoji: '☁️' },
  { id: 18, name: 'Kouign-Amann-Heavy', title: 'Le Riff Beurré', rarity: 'commune', instrument: 'Guitare 8 cordes', flavor: 'Caramel breton', tagline: 'Le son le plus lourd de la scène.', color: '#b45309', emoji: '🧈' },
  { id: 19, name: 'Clafoutis-Pop', title: 'Le Rythme Cerise', rarity: 'commune', instrument: 'Bongos noyaux', flavor: 'Cerise noire', tagline: 'Le fruit du bon partage.', color: '#be123c', emoji: '🍒' },
  { id: 20, name: 'Palmier-Echo', title: 'L’Onde Feuilletée', rarity: 'commune', instrument: 'Double manche croustillant', flavor: 'Caramel cristal', tagline: 'Chaque battement se déplie en deux.', color: '#ca8a04', emoji: '🌴' },

  // 21-32: Rares (12)
  { id: 21, name: 'Mille-Feuille-Overdrive', title: 'L’Empileur d’Accords', rarity: 'rare', instrument: 'Synthé 1000 couches', flavor: 'Crème diplomate', tagline: 'Mille couches de son rock superposées.', color: '#0284c7', emoji: '🍰' },
  { id: 22, name: 'Opéra-Metal', title: 'La Diva Noire', rarity: 'rare', instrument: 'Guitare café ganache', flavor: 'Café noir intense', tagline: 'Un solo dramatique en 6 mouvements.', color: '#451a03', emoji: '🎭' },
  { id: 23, name: 'Paris-Brest-Drift', title: 'La Roue du Tempo', rarity: 'rare', instrument: 'Basse couronne pralinée', flavor: 'Praliné noisette', tagline: 'Elle tourne sans jamais dérailler.', color: '#c2410c', emoji: '🚲' },
  { id: 24, name: 'Forêt-Noire-Goth', title: 'Le Maître des Ombres', rarity: 'rare', instrument: 'Orgue génoise chantilly', flavor: 'Griotte kirschée', tagline: 'Mystérieuse, sombre et gourmande.', color: '#881337', emoji: '🌲' },
  { id: 25, name: 'Tiramisu-Chill', title: 'Le Bassiste Velours', rarity: 'rare', instrument: 'Contrebasse mascarpone', flavor: 'Cacao & biscuit imbibé', tagline: 'Un groove crémeux qui pose le tempo.', color: '#78350f', emoji: '☕' },
  { id: 26, name: 'Crumble-Punk', title: 'L’Émietteur de Mesures', rarity: 'rare', instrument: 'Batterie morceaux croustillants', flavor: 'Pomme cannelle', tagline: 'Morceaux inégaux ? Jamais en concert !', color: '#ea580c', emoji: '🍏' },
  { id: 27, name: 'Religieuse-Stéréo', title: 'Le Double Cœur', rarity: 'rare', instrument: 'Double micro café-chocolat', flavor: 'Crème vanillée', tagline: 'Deux boules pour une harmonie parfaite.', color: '#7c2d12', emoji: '🎙️' },
  { id: 28, name: 'Cheesecake-Néon', title: 'Le New-York Electro', rarity: 'rare', instrument: 'Sampler coulis framboise', flavor: 'Fromage blanc velouté', tagline: 'Un style ultra moderne venu des étoiles.', color: '#f43f5e', emoji: '🗽' },
  { id: 29, name: 'Bûche-Overdrive', title: 'Le Rouleau Compresseur', rarity: 'rare', instrument: 'Guitare tronc glacé', flavor: 'Marron glacé', tagline: 'Un solo qui traverse tous les hivers.', color: '#9a3412', emoji: '🪵' },
  { id: 30, name: 'Entremets-Miroir', title: 'Le Reflet Sonore', rarity: 'rare', instrument: 'Basse nappe luisante', flavor: 'Glaçage miroir framboise', tagline: 'Tu vois ton combo briller dedans.', color: '#e11d48', emoji: '🪞' },
  { id: 31, name: 'Tatin-Inversée', title: 'Le Retourneur de Rythme', rarity: 'rare', instrument: 'Guitare caramel retourné', flavor: 'Pomme rôtie fondante', tagline: 'Même à l’envers, la fraction est juste !', color: '#b45309', emoji: '🍎' },
  { id: 32, name: 'Profiterole-Burst', title: 'L’Explosif Chaud-Froid', rarity: 'rare', instrument: 'Synthé fontaine chocolat', flavor: 'Glace vanille nappée', tagline: 'Le choc thermique qui électrise la salle.', color: '#581c87', emoji: '🍨' },

  // 33-38: Épiques (6)
  { id: 33, name: 'Pièce-Montée-Titan', title: 'Le Colosse du Rythme', rarity: 'epique', instrument: 'Harpe 7 étages nougatine', flavor: 'Choux caramélisés', tagline: 'Plus haut est le niveau, plus fort il frappe !', color: '#f59e0b', emoji: '🏰' },
  { id: 34, name: 'Pavlova-Nébuleuse', title: 'L’Étoile Filante', rarity: 'epique', instrument: 'Micro chantilly stellaire', flavor: 'Fruits de la passion', tagline: 'Légère comme la lumière, vive comme un éclair.', color: '#ec4899', emoji: '🌟' },
  { id: 35, name: 'Croquembouche-Cyber', title: 'Le Pyrotechnicien', rarity: 'epique', instrument: 'Lance-flammes caramel', flavor: 'Sucre filé doré', tagline: 'Des étincelles sur chaque note réussie !', color: '#f97316', emoji: '🎆' },
  { id: 36, name: 'Rainbow-Cake-Spectrum', title: 'L’Orchestre des 7 Nuances', rarity: 'epique', instrument: 'Keytar arc-en-ciel néon', flavor: 'Couleurs fruitées', tagline: 'Toutes les fractions réunies en une seule part.', color: '#a855f7', emoji: '🌈' },
  { id: 37, name: 'Soufflé-Quantum', title: 'Le Maître de l’Expansion', rarity: 'epique', instrument: 'Guitare air chaud quantique', flavor: 'Grand Marnier étincelant', tagline: 'Il gonfle le score jusqu’à l’infini !', color: '#06b6d4', emoji: '🌋' },
  { id: 38, name: 'Galette-Solaire', title: 'La Couronne d’Or', rarity: 'epique', instrument: 'Basse fève dorée', flavor: 'Frangipane royale', tagline: 'Qui trouve la bonne part devient le roi du rythme !', color: '#eab308', emoji: '👑' },

  // 39-40: Légendaires (2)
  { id: 39, name: 'Gâteau-Diviseur-Zéro', title: 'L’Entité Cosmique des Fractions', rarity: 'legendaire', instrument: 'Guitare quantique dimensionnelle', flavor: 'Matière sucrée primordiale', tagline: 'La légende dit qu’il peut couper l’univers en parts égales.', color: '#ec4899', emoji: '🌌' },
  { id: 40, name: 'Infinity-Pastry-Core', title: 'Le Cœur Éternel du Rock Pâtissier', rarity: 'legendaire', instrument: 'Synthé cœur de néon infini', flavor: 'Essence pure de gâteau', tagline: 'Le gardien suprême de toutes les proportions parfaites.', color: '#06b6d4', emoji: '💎' },
];
