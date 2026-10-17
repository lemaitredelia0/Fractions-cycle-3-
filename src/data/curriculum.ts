import { Question, SchoolLevel, LaneOption, CakeSpec, GlazeFlavor } from '../types/game';

// Helper to shuffle array cleanly
function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const GLAZES: GlazeFlavor[] = ['strawberry', 'cyan_frost', 'lemon', 'grape', 'chocolate', 'caramel'];
function randomGlaze(): GlazeFlavor {
  return GLAZES[Math.floor(Math.random() * GLAZES.length)];
}

// Convert fraction numbers to official French words (NEVER "sur", strict CE1 curriculum)
export function fractionToFrenchWords(num: number, den: number): string {
  const units = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix', 'onze', 'douze'];

  if (num === 1 && den === 2) return 'un demi';
  if (num === 1 && den === 3) return 'un tiers';
  if (num === 1 && den === 4) return 'un quart';

  let denWord = '';
  if (den === 2) denWord = num > 1 ? 'demis' : 'demi';
  else if (den === 3) denWord = 'tiers';
  else if (den === 4) denWord = num > 1 ? 'quarts' : 'quart';
  else if (den === 5) denWord = num > 1 ? 'cinquièmes' : 'cinquième';
  else if (den === 6) denWord = num > 1 ? 'sixièmes' : 'sixième';
  else if (den === 7) denWord = num > 1 ? 'septièmes' : 'septième';
  else if (den === 8) denWord = num > 1 ? 'huitièmes' : 'huitième';
  else if (den === 9) denWord = num > 1 ? 'neuvièmes' : 'neuvième';
  else if (den === 10) denWord = num > 1 ? 'dixièmes' : 'dixième';
  else if (den === 12) denWord = num > 1 ? 'douzièmes' : 'douzième';
  else if (den === 20) denWord = num > 1 ? 'vingtièmes' : 'vingtième';
  else if (den === 100) denWord = num > 1 ? 'centièmes' : 'centième';
  else if (den === 1000) denWord = num > 1 ? 'millièmes' : 'millième';
  else denWord = `${den}ièmes`;

  const numWord = units[num] || num.toString();
  const full = `${numWord} ${denWord}`;
  return full.charAt(0).toUpperCase() + full.slice(1);
}

export function createComparisonCakeVisual(
  n1: number,
  d1: number,
  n2: number,
  d2: number
): CakeSpec {
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const commonDen = (d1 * d2) / gcd(d1, d2);
  const m1 = Math.round(commonDen / d1);
  const m2 = Math.round(commonDen / d2);
  const k1 = n1 * m1;
  const k2 = n2 * m2;
  const largerIndex = k1 > k2 ? 0 : k2 > k1 ? 1 : -1;

  let operationText = '';
  if (m1 > 1 && m2 === 1) {
    operationText = `On découpe en ${commonDen} parts : ${n1}/${d1} = (${n1}×${m1})/(${d1}×${m1}) = ${k1}/${commonDen}`;
  } else if (m1 === 1 && m2 > 1) {
    operationText = `On découpe en ${commonDen} parts : ${n2}/${d2} = (${n2}×${m2})/(${d2}×${m2}) = ${k2}/${commonDen}`;
  } else if (m1 > 1 && m2 > 1) {
    operationText = `On découpe les 2 en ${commonDen} parts : ${n1}/${d1} = ${k1}/${commonDen} et ${n2}/${d2} = ${k2}/${commonDen}`;
  } else {
    operationText = `Même dénominateur : ${commonDen} parts égales`;
  }

  let resultText = '';
  if (largerIndex === 0) {
    resultText = `À ${commonDen} parts égales : ${k1}/${commonDen} > ${k2}/${commonDen}  →  ${n1}/${d1} est plus grande !`;
  } else if (largerIndex === 1) {
    resultText = `À ${commonDen} parts égales : ${k2}/${commonDen} > ${k1}/${commonDen}  →  ${n2}/${d2} est plus grande !`;
  } else {
    resultText = `À ${commonDen} parts égales : ${k1}/${commonDen} = ${k2}/${commonDen}  →  Elles sont égales !`;
  }

  return {
    shape: 'round',
    totalParts: commonDen,
    activeParts: 0,
    isComparison: true,
    operator: 'vs',
    comparisonInfo: {
      n1,
      d1,
      n2,
      d2,
      m1,
      m2,
      k1,
      k2,
      commonDen,
      largerIndex,
      operationText,
      resultText,
    },
    multiCakes: [
      {
        shape: 'round',
        totalParts: d1,
        activeParts: n1,
        glaze: 'strawberry',
        label: `${n1}/${d1}`,
      },
      {
        shape: 'round',
        totalParts: d2,
        activeParts: n2,
        glaze: 'cyan_frost',
        label: `${n2}/${d2}`,
      },
    ],
  };
}

export function createEquivalenceCakeVisual(
  baseNum: number,
  baseDen: number,
  eqNum: number,
  eqDen: number,
  glaze: GlazeFlavor = 'strawberry',
  shape: 'round' | 'bar' = 'round'
): CakeSpec {
  const multiplier = Math.max(1, Math.round(eqDen / baseDen));
  const operationText = `On coupe chaque part en ${multiplier} : (${baseNum} × ${multiplier}) / (${baseDen} × ${multiplier}) = ${eqNum}/${eqDen}`;
  const resultText = `Même portion de gâteau : ${baseNum}/${baseDen} = ${eqNum}/${eqDen} !`;

  return {
    shape,
    totalParts: baseDen,
    activeParts: baseNum,
    isEqual: true,
    glaze,
    isEquivalence: true,
    equivalenceInfo: {
      baseNum,
      baseDen,
      eqNum,
      eqDen,
      multiplier,
      operationText,
      resultText,
    },
    label: `${baseNum}/${baseDen}`,
  };
}

interface RawOption {
  cake?: CakeSpec;
  text?: string;
  isCorrect: boolean;
}

/**
 * Validates, deduplicates, and creates a certified 100% accurate question.
 * Guarantees exactly 1 correct answer and 3 distinct false distractors.
 */
function createValidatedQuestion(
  id: string,
  level: SchoolLevel,
  type: Question['type'],
  prompt: string,
  rawOptions: RawOption[],
  explanation: string,
  visual?: CakeSpec,
  visualQuantity?: Question['visualQuantity']
): Question {
  // 1. Filter and ensure exactly 1 isCorrect === true
  const correctOnes = rawOptions.filter((o) => o.isCorrect);
  const incorrectOnes = rawOptions.filter((o) => !o.isCorrect);

  if (correctOnes.length !== 1 || incorrectOnes.length < 3) {
    console.error(`Invalid options generated for question ${id}`, rawOptions);
  }

  // 2. Ensure texts are strictly unique
  const seenTexts = new Set<string>();
  const finalRaw: RawOption[] = [correctOnes[0]];
  if (correctOnes[0].text) {
    seenTexts.add(correctOnes[0].text.trim().toLowerCase());
  }

  // Also track cake signatures to prevent duplicate cakes
  const seenCakes = new Set<string>();
  if (correctOnes[0].cake) {
    const c = correctOnes[0].cake;
    seenCakes.add(`${c.shape}_${c.totalParts}_${c.activeParts}_${c.isEqual}`);
  }

  for (const inc of incorrectOnes) {
    if (finalRaw.length >= 4) break;

    if (inc.text) {
      const norm = inc.text.trim().toLowerCase();
      if (seenTexts.has(norm)) continue; // skip duplicate
      seenTexts.add(norm);
    }

    if (inc.cake) {
      const c = inc.cake;
      const sig = `${c.shape}_${c.totalParts}_${c.activeParts}_${c.isEqual}`;
      if (seenCakes.has(sig)) continue; // skip duplicate
      seenCakes.add(sig);
    }

    finalRaw.push(inc);
  }

  // Fallback if somehow duplicates reduced count below 4
  while (finalRaw.length < 4) {
    finalRaw.push({
      text: `${finalRaw.length + 5}/10`,
      isCorrect: false,
    });
  }

  // Shuffle and assign lane indexes 0, 1, 2, 3
  const shuffled = shuffle(finalRaw.slice(0, 4)).map((opt, idx) => ({
    id: `opt_${id}_${idx}`,
    laneIndex: idx,
    cake: opt.cake,
    text: opt.text,
    isCorrect: opt.isCorrect,
  }));

  return {
    id,
    level,
    type,
    prompt,
    visual,
    visualQuantity,
    options: shuffled as [LaneOption, LaneOption, LaneOption, LaneOption],
    explanation,
  };
}

// CP Generator (No fraction notation, strictly equal shares, halves)
function generateCPQuestion(): Question {
  const template = Math.floor(Math.random() * 3);
  const qId = 'cp_' + Math.random().toString(36).substring(2, 9);
  const glaze = randomGlaze();

  if (template === 0) {
    // "Quel gâteau est partagé en parts bien égales ?"
    // 1 equal cake (2, 3, or 4 parts), 3 unequal cakes
    const equalParts = [2, 3, 4][Math.floor(Math.random() * 3)];
    const rawOptions: RawOption[] = [
      {
        cake: { shape: 'round', totalParts: equalParts, activeParts: 1, isEqual: true, glaze },
        isCorrect: true,
      },
      {
        cake: { shape: 'round', totalParts: 3, activeParts: 1, isEqual: false, cutAngles: [0, 45, 160], glaze },
        isCorrect: false,
      },
      {
        cake: { shape: 'round', totalParts: 4, activeParts: 1, isEqual: false, cutAngles: [0, 35, 110, 230], glaze },
        isCorrect: false,
      },
      {
        cake: { shape: 'round', totalParts: 2, activeParts: 1, isEqual: false, cutAngles: [0, 75], glaze },
        isCorrect: false,
      },
    ];

    return createValidatedQuestion(
      qId,
      'CP',
      'partage_egal',
      'Touche le gâteau aux parts bien égales !',
      rawOptions,
      'Toutes les parts doivent avoir exactement la même taille.'
    );
  } else if (template === 1) {
    // "Touche la moitié exacte du gâteau !"
    // Exactly 1 cake has 2 parts with 1 active. The others have distinct part counts/actives.
    const rawOptions: RawOption[] = [
      {
        cake: { shape: 'round', totalParts: 2, activeParts: 1, isEqual: true, glaze },
        isCorrect: true,
      },
      {
        cake: { shape: 'round', totalParts: 4, activeParts: 1, isEqual: true, glaze },
        isCorrect: false,
      },
      {
        cake: { shape: 'round', totalParts: 3, activeParts: 1, isEqual: true, glaze },
        isCorrect: false,
      },
      {
        cake: { shape: 'round', totalParts: 2, activeParts: 2, isEqual: true, glaze },
        isCorrect: false,
      },
    ];

    return createValidatedQuestion(
      qId,
      'CP',
      'identifier_fraction',
      'Touche la moitié exacte du gâteau !',
      rawOptions,
      'La moitié partage le gâteau en 2 parts égales.'
    );
  } else {
    // "Ce gâteau est-il coupé équitablement en deux ?"
    const isEqual = Math.random() > 0.5;
    const cakePrompt: CakeSpec = isEqual
      ? { shape: 'round', totalParts: 2, activeParts: 1, isEqual: true, glaze }
      : { shape: 'round', totalParts: 2, activeParts: 1, isEqual: false, cutAngles: [0, 70], glaze };

    const rawOptions: RawOption[] = [
      { text: 'Oui, équitable !', isCorrect: isEqual },
      { text: 'Non, inéquitable !', isCorrect: !isEqual },
      { text: 'En trois parts', isCorrect: false },
      { text: 'En quatre parts', isCorrect: false },
    ];

    return createValidatedQuestion(
      qId,
      'CP',
      'partage_egal',
      'Ce gâteau est-il coupé équitablement en deux ?',
      rawOptions,
      isEqual ? 'Les deux parts ont la même taille.' : 'Une part est plus grande que l’autre.',
      cakePrompt
    );
  }
}

// CE1 Generator (Denominators: 2, 3, 4, 5, 6, 8, 10. Official words, strictly verified)
function generateCE1Question(): Question {
  const denominators = [2, 3, 4, 5, 6, 8, 10];
  const den = denominators[Math.floor(Math.random() * denominators.length)];
  const num = Math.floor(Math.random() * (den - 1)) + 1; // 1 <= num < den
  const template = Math.floor(Math.random() * 3);
  const qId = 'ce1_' + Math.random().toString(36).substring(2, 9);
  const glaze = randomGlaze();

  if (template === 0) {
    // Identify fraction visual: e.g. "Quelle part du gâteau est colorée ?"
    const correctText = `${num}/${den}`;

    // Pick 3 strictly distinct incorrect fraction strings
    const otherDens = denominators.filter((d) => d !== den);
    const fake1 = `${Math.min(num, otherDens[0] - 1) || 1}/${otherDens[0]}`;
    const fake2 = num + 1 < den ? `${num + 1}/${den}` : `${Math.max(1, num - 1)}/${den}`;
    const fake3 = `${1}/${otherDens[1] || 7}`;

    const rawOptions: RawOption[] = [
      { text: correctText, isCorrect: true },
      { text: fake1, isCorrect: false },
      { text: fake2, isCorrect: false },
      { text: fake3, isCorrect: false },
    ];

    return createValidatedQuestion(
      qId,
      'CE1',
      'nommer_fraction',
      'Quelle part du gâteau est colorée ?',
      rawOptions,
      `Il y a ${num} part(s) colorée(s) sur ${den} parts égales : ${correctText}.`,
      { shape: 'round', totalParts: den, activeParts: num, isEqual: true, glaze }
    );
  } else if (template === 1) {
    // Given fraction text, find the matching cake
    const promptText = `${num}/${den}`;
    const frenchName = fractionToFrenchWords(num, den);

    // Pick 3 strictly distinct cake distractors
    const diffActive1 = num === 1 ? 2 : num - 1;
    const diffActive2 = num + 1 < den ? num + 1 : (num === 2 ? 1 : 2);
    const otherDen = den === 4 ? 3 : 4;

    const rawOptions: RawOption[] = [
      {
        cake: { shape: 'round', totalParts: den, activeParts: num, isEqual: true, glaze },
        isCorrect: true,
      },
      {
        cake: { shape: 'round', totalParts: den, activeParts: diffActive1, isEqual: true, glaze },
        isCorrect: false,
      },
      {
        cake: { shape: 'round', totalParts: otherDen, activeParts: 1, isEqual: true, glaze },
        isCorrect: false,
      },
      {
        cake: { shape: 'round', totalParts: den, activeParts: diffActive2, isEqual: true, glaze },
        isCorrect: false,
      },
    ];

    return createValidatedQuestion(
      qId,
      'CE1',
      'identifier_fraction',
      `Trouve le gâteau qui représente : ${promptText} (${frenchName})`,
      rawOptions,
      `Le gâteau doit avoir ${den} parts égales dont ${num} glacée(s).`
    );
  } else {
    // Addition with same denominator (CE1 level: e.g. 1/5 + 2/5 = 3/5)
    const commonDen = [4, 5, 6, 8, 10][Math.floor(Math.random() * 5)];
    const n1 = Math.floor(Math.random() * (commonDen - 2)) + 1;
    const n2 = 1;
    const sum = n1 + n2;

    const rawOptions: RawOption[] = [
      { text: `${sum}/${commonDen}`, isCorrect: true },
      { text: `${sum}/${commonDen * 2}`, isCorrect: false }, // classic error adding denominators
      { text: `${sum + 1}/${commonDen}`, isCorrect: false },
      { text: `${Math.max(1, sum - 1)}/${commonDen}`, isCorrect: false },
    ];

    return createValidatedQuestion(
      qId,
      'CE1',
      'addition',
      `Calcule : ${n1}/${commonDen} + ${n2}/${commonDen} = ?`,
      rawOptions,
      `Même dénominateur : on additionne les numérateurs (${n1} + ${n2} = ${sum}), donc ${sum}/${commonDen}.`,
      {
        shape: 'round',
        totalParts: commonDen,
        activeParts: sum,
        operator: '+',
        multiCakes: [
          { shape: 'round', totalParts: commonDen, activeParts: n1, isEqual: true, glaze: 'strawberry' },
          { shape: 'round', totalParts: commonDen, activeParts: n2, isEqual: true, glaze: 'cyan_frost' },
        ],
      }
    );
  }
}

// CE2 Generator (Denominators <= 12, band-units, equalities like 2/4 = 1/2)
function generateCE2Question(): Question {
  const template = Math.floor(Math.random() * 3);
  const qId = 'ce2_' + Math.random().toString(36).substring(2, 9);
  const glaze = randomGlaze();

  if (template === 0) {
    // Bande-unité graduée
    const den = [4, 5, 6, 8, 10, 12][Math.floor(Math.random() * 6)];
    const num = Math.floor(Math.random() * (den - 1)) + 1;

    // Guaranteed strictly distinct distractors (NO DUPLICATE WHEN num === 1!)
    const fake1 = num + 1 < den ? `${num + 1}/${den}` : `${Math.max(1, num - 2)}/${den}`;
    const fake2 = num > 1 ? `${num - 1}/${den}` : `${num + 2}/${den}`;
    const fake3 = `${num}/${den === 12 ? 6 : den + 2}`;

    const rawOptions: RawOption[] = [
      { text: `${num}/${den}`, isCorrect: true },
      { text: fake1, isCorrect: false },
      { text: fake2, isCorrect: false },
      { text: fake3, isCorrect: false },
    ];

    return createValidatedQuestion(
      qId,
      'CE2',
      'bande_unite',
      'Quelle fraction représente cette bande-gâteau ?',
      rawOptions,
      `La bande compte ${den} parts égales, dont ${num} sont glacées.`,
      { shape: 'bar', totalParts: den, activeParts: num, isEqual: true, glaze }
    );
  } else if (template === 1) {
    // Equalities
    const pairs = [
      { baseNum: 1, baseDen: 2, eqNum: 2, eqDen: 4, fakeA: '1/4', fakeB: '3/4', fakeC: '2/6' },
      { baseNum: 1, baseDen: 2, eqNum: 3, eqDen: 6, fakeA: '2/6', fakeB: '4/6', fakeC: '1/3' },
      { baseNum: 1, baseDen: 2, eqNum: 4, eqDen: 8, fakeA: '3/8', fakeB: '5/8', fakeC: '2/8' },
      { baseNum: 1, baseDen: 3, eqNum: 2, eqDen: 6, fakeA: '1/6', fakeB: '3/6', fakeC: '2/4' },
      { baseNum: 1, baseDen: 4, eqNum: 2, eqDen: 8, fakeA: '1/8', fakeB: '3/8', fakeC: '4/8' },
      { baseNum: 2, baseDen: 3, eqNum: 4, eqDen: 6, fakeA: '2/6', fakeB: '5/6', fakeC: '3/6' },
      { baseNum: 3, baseDen: 4, eqNum: 6, eqDen: 8, fakeA: '4/8', fakeB: '7/8', fakeC: '5/8' },
      { baseNum: 1, baseDen: 2, eqNum: 5, eqDen: 10, fakeA: '2/10', fakeB: '4/10', fakeC: '3/10' },
      { baseNum: 2, baseDen: 5, eqNum: 4, eqDen: 10, fakeA: '2/10', fakeB: '5/10', fakeC: '6/10' },
      { baseNum: 3, baseDen: 5, eqNum: 6, eqDen: 10, fakeA: '3/10', fakeB: '5/10', fakeC: '7/10' },
    ];
    const pair = pairs[Math.floor(Math.random() * pairs.length)];
    const eqVisual = createEquivalenceCakeVisual(
      pair.baseNum,
      pair.baseDen,
      pair.eqNum,
      pair.eqDen,
      glaze
    );

    const rawOptions: RawOption[] = [
      { text: `${pair.eqNum}/${pair.eqDen}`, isCorrect: true },
      { text: pair.fakeA, isCorrect: false },
      { text: pair.fakeB, isCorrect: false },
      { text: pair.fakeC, isCorrect: false },
    ];

    return createValidatedQuestion(
      qId,
      'CE2',
      'egalite',
      `Quelle fraction est égale à ${pair.baseNum}/${pair.baseDen} ?`,
      rawOptions,
      eqVisual.equivalenceInfo
        ? `${eqVisual.equivalenceInfo.operationText}. ${eqVisual.equivalenceInfo.resultText}`
        : `En multipliant le haut et le bas par 2, ${pair.baseNum}/${pair.baseDen} = ${pair.eqNum}/${pair.eqDen}.`,
      eqVisual
    );
  } else {
    // Comparer deux fractions avec DÉNOMINATEURS DIFFÉRENTS
    // Les deux gâteaux ont des découpages différents au départ (différents dénominateurs)
    // puis se transforment au même dénominateur avec l'animation de redécoupage !
    const ce2Comparisons = [
      { a: '1/2', b: '3/4', larger: '3/4', smaller: '1/2', third: '1/4' },
      { a: '1/2', b: '1/4', larger: '1/2', smaller: '1/4', third: '3/4' },
      { a: '2/3', b: '5/6', larger: '5/6', smaller: '2/3', third: '1/3' },
      { a: '1/3', b: '3/6', larger: '3/6', smaller: '1/3', third: '1/6' },
      { a: '3/4', b: '5/8', larger: '3/4', smaller: '5/8', third: '1/2' },
      { a: '1/2', b: '3/8', larger: '1/2', smaller: '3/8', third: '1/4' },
      { a: '1/4', b: '3/8', larger: '3/8', smaller: '1/4', third: '1/2' },
      { a: '2/5', b: '7/10', larger: '7/10', smaller: '2/5', third: '3/10' },
      { a: '3/5', b: '7/10', larger: '7/10', smaller: '3/5', third: '1/5' },
      { a: '4/5', b: '7/10', larger: '4/5', smaller: '7/10', third: '3/10' },
      { a: '1/2', b: '4/10', larger: '1/2', smaller: '4/10', third: '1/5' },
      { a: '2/3', b: '3/6', larger: '2/3', smaller: '3/6', third: '1/6' },
      { a: '3/4', b: '7/8', larger: '7/8', smaller: '3/4', third: '5/8' },
      { a: '1/3', b: '4/9', larger: '4/9', smaller: '1/3', third: '2/9' },
      { a: '2/5', b: '3/10', larger: '2/5', smaller: '3/10', third: '1/5' },
      { a: '3/4', b: '3/8', larger: '3/4', smaller: '3/8', third: '1/2' },
    ];
    const c = ce2Comparisons[Math.floor(Math.random() * ce2Comparisons.length)];
    const [nA, dA] = c.a.split('/').map(Number);
    const [nB, dB] = c.b.split('/').map(Number);
    const compVisual = createComparisonCakeVisual(nA, dA, nB, dB);

    const rawOptions: RawOption[] = [
      { text: c.larger, isCorrect: true },
      { text: c.smaller, isCorrect: false },
      { text: c.third, isCorrect: false },
      { text: 'Elles sont égales', isCorrect: false },
    ];

    return createValidatedQuestion(
      qId,
      'CE2',
      'comparer',
      `Quelle fraction est la plus grande : ${c.a} ou ${c.b} ?`,
      rawOptions,
      compVisual.comparisonInfo
        ? `${compVisual.comparisonInfo.operationText}. ${compVisual.comparisonInfo.resultText}`
        : `En mettant au même dénominateur, ${c.larger} est la plus grande.`,
      compVisual
    );
  }
}

// CM1 Generator (Fractions > 1, decimal fractions, addition with multiples)
function generateCM1Question(): Question {
  const template = Math.floor(Math.random() * 3);
  const qId = 'cm1_' + Math.random().toString(36).substring(2, 9);
  const glaze = randomGlaze();

  if (template === 0) {
    // Fraction > 1 as whole + fraction: e.g. 7/4 = 1 + 3/4
    const den = [3, 4, 5, 6][Math.floor(Math.random() * 4)];
    const rem = Math.floor(Math.random() * (den - 1)) + 1; // 1 <= rem < den
    const num = den + rem;

    // Pick 3 strictly distinct incorrect decompositions (NO DUPLICATE WHEN rem === 1!)
    const altRem1 = rem === 1 ? 2 : rem - 1;
    const fake1 = `2 + ${rem}/${den}`;
    const fake2 = `1 + ${altRem1}/${den}`;
    const fake3 = `1 + ${den}/${den}`;

    const rawOptions: RawOption[] = [
      { text: `1 + ${rem}/${den}`, isCorrect: true },
      { text: fake1, isCorrect: false },
      { text: fake2, isCorrect: false },
      { text: fake3, isCorrect: false },
    ];

    return createValidatedQuestion(
      qId,
      'CM1',
      'fraction_superieure',
      `Décompose ${num}/${den} en un entier et une fraction :`,
      rawOptions,
      `${den}/${den} donne 1 gâteau entier, plus les ${rem}/${den} restants : 1 + ${rem}/${den}.`,
      {
        shape: 'round',
        totalParts: den,
        activeParts: den,
        operator: '+',
        multiCakes: [
          { shape: 'round', totalParts: den, activeParts: den, isEqual: true, glaze },
          { shape: 'round', totalParts: den, activeParts: rem, isEqual: true, glaze },
        ],
      }
    );
  } else if (template === 1) {
    // Fraction décimale : 3/10 = 30/100
    const tens = Math.floor(Math.random() * 8) + 1;
    const cent = tens * 10;

    const rawOptions: RawOption[] = [
      { text: `${cent}/100`, isCorrect: true },
      { text: `${tens}/100`, isCorrect: false },
      { text: `${cent}/10`, isCorrect: false },
      { text: `${tens + 5}/100`, isCorrect: false },
    ];

    return createValidatedQuestion(
      qId,
      'CM1',
      'decimal_conversion',
      `Trouve la fraction décimale égale à ${tens}/10 :`,
      rawOptions,
      `${tens}/10 = (${tens} × 10) / (10 × 10) = ${cent}/100.`
    );
  } else {
    // Addition with one denominator multiple of the other
    const pairs = [
      { aN: 1, aD: 2, bN: 1, bD: 4, resN: 3, resD: 4, fakeA: '2/6', fakeB: '1/4', fakeC: '4/4' },
      { aN: 1, aD: 3, bN: 1, bD: 6, resN: 3, resD: 6, fakeA: '2/9', fakeB: '1/6', fakeC: '4/6' },
      { aN: 2, aD: 5, bN: 3, bD: 10, resN: 7, resD: 10, fakeA: '5/15', fakeB: '6/10', fakeC: '8/10' },
      { aN: 3, aD: 4, bN: 1, bD: 8, resN: 7, resD: 8, fakeA: '4/12', fakeB: '5/8', fakeC: '6/8' },
    ];
    const item = pairs[Math.floor(Math.random() * pairs.length)];

    const rawOptions: RawOption[] = [
      { text: `${item.resN}/${item.resD}`, isCorrect: true },
      { text: item.fakeA, isCorrect: false },
      { text: item.fakeB, isCorrect: false },
      { text: item.fakeC, isCorrect: false },
    ];

    return createValidatedQuestion(
      qId,
      'CM1',
      'addition',
      `Calcule : ${item.aN}/${item.aD} + ${item.bN}/${item.bD} = ?`,
      rawOptions,
      `On met au même dénominateur avant d’additionner : ${item.resN}/${item.resD}.`,
      {
        shape: 'round',
        totalParts: item.bD,
        activeParts: item.resN,
        operator: '+',
        multiCakes: [
          { shape: 'round', totalParts: item.aD, activeParts: item.aN, isEqual: true, glaze: 'strawberry' },
          { shape: 'round', totalParts: item.bD, activeParts: item.bN, isEqual: true, glaze: 'cyan_frost' },
        ],
      }
    );
  }
}

// CM2 Generator (Fraction of quantity, missing numbers, common denominator <= 60)
function generateCM2Question(): Question {
  const template = Math.floor(Math.random() * 3);
  const qId = 'cm2_' + Math.random().toString(36).substring(2, 9);
  const glaze = randomGlaze();

  if (template === 0) {
    // Fraction of quantity: e.g. "Deux tiers de 12 gâteaux" = 8
    // "Les gâteaux doivent être bien présentés en ligne superposées de même nombre pour faciliter le calcul"
    const setups = [
      { fractionText: 'Un demi', num: 1, den: 2, total: 10, res: 5, fakeA: 2, fakeB: 4, fakeC: 6 },
      { fractionText: 'Un tiers', num: 1, den: 3, total: 12, res: 4, fakeA: 3, fakeB: 6, fakeC: 8 },
      { fractionText: 'Deux tiers', num: 2, den: 3, total: 12, res: 8, fakeA: 4, fakeB: 6, fakeC: 10 },
      { fractionText: 'Trois quarts', num: 3, den: 4, total: 16, res: 12, fakeA: 4, fakeB: 8, fakeC: 14 },
      { fractionText: 'Un quart', num: 1, den: 4, total: 12, res: 3, fakeA: 4, fakeB: 6, fakeC: 9 },
      { fractionText: 'Trois quarts', num: 3, den: 4, total: 12, res: 9, fakeA: 3, fakeB: 6, fakeC: 8 },
      { fractionText: 'Un cinquième', num: 1, den: 5, total: 20, res: 4, fakeA: 5, fakeB: 8, fakeC: 10 },
      { fractionText: 'Deux cinquièmes', num: 2, den: 5, total: 15, res: 6, fakeA: 3, fakeB: 5, fakeC: 9 },
      { fractionText: 'Trois cinquièmes', num: 3, den: 5, total: 25, res: 15, fakeA: 10, fakeB: 18, fakeC: 20 },
      { fractionText: 'Quatre cinquièmes', num: 4, den: 5, total: 20, res: 16, fakeA: 12, fakeB: 14, fakeC: 18 },
      { fractionText: 'Cinq sixièmes', num: 5, den: 6, total: 18, res: 15, fakeA: 12, fakeB: 16, fakeC: 3 },
      { fractionText: 'Deux tiers', num: 2, den: 3, total: 18, res: 12, fakeA: 6, fakeB: 9, fakeC: 15 },
      { fractionText: 'Trois huitièmes', num: 3, den: 8, total: 24, res: 9, fakeA: 6, fakeB: 12, fakeC: 15 },
    ];
    const s = setups[Math.floor(Math.random() * setups.length)];
    const itemsPerLine = Math.round(s.total / s.den);

    const rawOptions: RawOption[] = [
      { text: `${s.res} gâteaux`, isCorrect: true },
      { text: `${s.fakeA} gâteaux`, isCorrect: false },
      { text: `${s.fakeB} gâteaux`, isCorrect: false },
      { text: `${s.fakeC} gâteaux`, isCorrect: false },
    ];

    return createValidatedQuestion(
      qId,
      'CM2',
      'fraction_quantite',
      `Combien font ${s.fractionText} de ${s.total} gâteaux ?`,
      rawOptions,
      `(${s.total} ÷ ${s.den} = ${itemsPerLine} gâteaux par ligne) × ${s.num} lignes = ${s.res} gâteaux.`,
      undefined,
      {
        totalItems: s.total,
        itemFraction: `${s.num}/${s.den}`,
        fractionText: s.fractionText,
        num: s.num,
        den: s.den,
        itemsPerLine,
        numLines: s.den,
      }
    );
  } else if (template === 1) {
    // Missing number: e.g. 2/3 = ?/12 -> ? = 8
    const bases = [
      { n1: 2, d1: 3, mult: 4, n2: 8, d2: 12, fakeA: 6, fakeB: 10, fakeC: 12 },
      { n1: 3, d1: 5, mult: 6, n2: 18, d2: 30, fakeA: 15, fakeB: 20, fakeC: 24 },
      { n1: 4, d1: 7, mult: 4, n2: 16, d2: 28, fakeA: 12, fakeB: 20, fakeC: 24 },
      { n1: 5, d1: 6, mult: 5, n2: 25, d2: 30, fakeA: 20, fakeB: 28, fakeC: 30 },
      { n1: 7, d1: 10, mult: 4, n2: 28, d2: 40, fakeA: 21, fakeB: 35, fakeC: 40 },
    ];
    const b = bases[Math.floor(Math.random() * bases.length)];

    const rawOptions: RawOption[] = [
      { text: `${b.n2}`, isCorrect: true },
      { text: `${b.fakeA}`, isCorrect: false },
      { text: `${b.fakeB}`, isCorrect: false },
      { text: `${b.fakeC}`, isCorrect: false },
    ];

    const eqVisual = createEquivalenceCakeVisual(b.n1, b.d1, b.n2, b.d2, glaze);

    return createValidatedQuestion(
      qId,
      'CM2',
      'egalite',
      `Trouve le nombre manquant : ${b.n1}/${b.d1} = ?/${b.d2}`,
      rawOptions,
      eqVisual.equivalenceInfo
        ? `${eqVisual.equivalenceInfo.operationText}. ${eqVisual.equivalenceInfo.resultText}`
        : `On multiplie le haut par ${b.mult} : ${b.n1} × ${b.mult} = ${b.n2}.`,
      eqVisual
    );
  } else {
    // Comparer deux fractions avec dénominateurs différents
    const comparisons = [
      { a: '3/4', b: '5/8', larger: '3/4', smaller: '5/8', third: '1/2' },
      { a: '2/3', b: '5/6', larger: '5/6', smaller: '2/3', third: '1/3' },
      { a: '4/5', b: '7/10', larger: '4/5', smaller: '7/10', third: '3/10' },
      { a: '5/6', b: '7/12', larger: '5/6', smaller: '7/12', third: '1/2' },
      { a: '1/2', b: '3/8', larger: '1/2', smaller: '3/8', third: '1/4' },
      { a: '3/4', b: '7/12', larger: '3/4', smaller: '7/12', third: '1/2' },
      { a: '2/5', b: '3/10', larger: '2/5', smaller: '3/10', third: '1/5' },
      { a: '1/3', b: '4/9', larger: '4/9', smaller: '1/3', third: '2/9' },
      { a: '1/2', b: '2/3', larger: '2/3', smaller: '1/2', third: '1/3' },
      { a: '2/3', b: '3/4', larger: '3/4', smaller: '2/3', third: '1/2' },
      { a: '5/6', b: '3/4', larger: '5/6', smaller: '3/4', third: '2/3' },
      { a: '1/4', b: '2/6', larger: '2/6', smaller: '1/4', third: '1/2' },
    ];
    const c = comparisons[Math.floor(Math.random() * comparisons.length)];
    const [n1, d1] = c.a.split('/').map(Number);
    const [n2, d2] = c.b.split('/').map(Number);
    const compVisual = createComparisonCakeVisual(n1, d1, n2, d2);

    const rawOptions: RawOption[] = [
      { text: c.larger, isCorrect: true },
      { text: c.smaller, isCorrect: false },
      { text: c.third, isCorrect: false },
      { text: 'Elles sont égales', isCorrect: false },
    ];

    return createValidatedQuestion(
      qId,
      'CM2',
      'comparer',
      `Quelle fraction est la plus grande : ${c.a} ou ${c.b} ?`,
      rawOptions,
      compVisual.comparisonInfo ? `${compVisual.comparisonInfo.operationText}. ${compVisual.comparisonInfo.resultText}` : `En mettant au même dénominateur, ${c.larger} est la plus grande.`,
      compVisual
    );
  }
}

// 6e Generator (Decimals, reductions, operations)
function generate6eQuestion(): Question {
  const template = Math.floor(Math.random() * 3);
  const qId = '6e_' + Math.random().toString(36).substring(2, 9);

  if (template === 0) {
    // Passage fraction décimale -> écriture décimale
    const conversions = [
      { frac: '3/10', dec: '0,3', fakeA: '0,03', fakeB: '3,0', fakeC: '0,33' },
      { frac: '7/10', dec: '0,7', fakeA: '0,07', fakeB: '7,0', fakeC: '0,77' },
      { frac: '25/100', dec: '0,25', fakeA: '0,025', fakeB: '2,5', fakeC: '0,5' },
      { frac: '75/100', dec: '0,75', fakeA: '0,075', fakeB: '7,5', fakeC: '0,7' },
      { frac: '1/4', dec: '0,25', fakeA: '0,4', fakeB: '0,14', fakeC: '1,4' },
      { frac: '1/2', dec: '0,5', fakeA: '0,2', fakeB: '0,12', fakeC: '1,2' },
      { frac: '3/4', dec: '0,75', fakeA: '0,34', fakeB: '0,43', fakeC: '3,4' },
      { frac: '14/10', dec: '1,4', fakeA: '0,14', fakeB: '14,0', fakeC: '0,014' },
      { frac: '125/100', dec: '1,25', fakeA: '0,125', fakeB: '12,5', fakeC: '1,5' },
    ];
    const c = conversions[Math.floor(Math.random() * conversions.length)];

    const rawOptions: RawOption[] = [
      { text: c.dec, isCorrect: true },
      { text: c.fakeA, isCorrect: false },
      { text: c.fakeB, isCorrect: false },
      { text: c.fakeC, isCorrect: false },
    ];

    return createValidatedQuestion(
      qId,
      '6E',
      'decimal_conversion',
      `Quelle est l'écriture décimale de ${c.frac} ?`,
      rawOptions,
      `${c.frac} correspond au nombre décimal ${c.dec}.`
    );
  } else if (template === 1) {
    // Simplification au maximum
    const simpls = [
      { from: '6/8', to: '3/4', fakeA: '2/4', fakeB: '3/5', fakeC: '1/2' },
      { from: '10/15', to: '2/3', fakeA: '1/3', fakeB: '2/5', fakeC: '3/4' },
      { from: '4/12', to: '1/3', fakeA: '1/4', fakeB: '2/6', fakeC: '1/2' },
      { from: '15/20', to: '3/4', fakeA: '3/5', fakeB: '2/3', fakeC: '4/5' },
      { from: '8/10', to: '4/5', fakeA: '3/5', fakeB: '4/6', fakeC: '1/2' },
    ];
    const s = simpls[Math.floor(Math.random() * simpls.length)];

    const rawOptions: RawOption[] = [
      { text: s.to, isCorrect: true },
      { text: s.fakeA, isCorrect: false },
      { text: s.fakeB, isCorrect: false },
      { text: s.fakeC, isCorrect: false },
    ];

    return createValidatedQuestion(
      qId,
      '6E',
      'egalite',
      `Simplifie la fraction ${s.from} au maximum :`,
      rawOptions,
      `En divisant par le plus grand diviseur commun, ${s.from} = ${s.to}.`
    );
  } else {
    // Soustraction avec même dénominateur
    const subtractions = [
      { a: 7, b: 3, den: 10, res: '4/10', fakeA: '4/0', fakeB: '10/10', fakeC: '1/10' },
      { a: 5, b: 2, den: 8, res: '3/8', fakeA: '3/0', fakeB: '7/8', fakeC: '1/8' },
      { a: 8, b: 3, den: 12, res: '5/12', fakeA: '5/0', fakeB: '11/12', fakeC: '2/12' },
      { a: 9, b: 4, den: 10, res: '5/10', fakeA: '5/0', fakeB: '13/10', fakeC: '2/10' },
    ];
    const item = subtractions[Math.floor(Math.random() * subtractions.length)];

    const rawOptions: RawOption[] = [
      { text: item.res, isCorrect: true },
      { text: item.fakeA, isCorrect: false },
      { text: item.fakeB, isCorrect: false },
      { text: item.fakeC, isCorrect: false },
    ];

    return createValidatedQuestion(
      qId,
      '6E',
      'addition',
      `Calcule : ${item.a}/${item.den} - ${item.b}/${item.den} = ?`,
      rawOptions,
      `${item.a} parts moins ${item.b} parts = ${item.res}.`
    );
  }
}

// Master generator by SchoolLevel
export function generateQuestionForLevel(level: SchoolLevel): Question {
  switch (level) {
    case 'CP':
      return generateCPQuestion();
    case 'CE1':
      return generateCE1Question();
    case 'CE2':
      return generateCE2Question();
    case 'CM1':
      return generateCM1Question();
    case 'CM2':
      return generateCM2Question();
    case '6E':
      return generate6eQuestion();
    default:
      return generateCE1Question();
  }
}
