// CarbonIQ calculation coefficients and rules
// Expanded 8-category model for comprehensive carbon footprint analysis

export const COEFF = {
  transport: {
    car: 4600,
    public: 1500,
    bike: 0,
    walking: 0
  },
  commuteDistance: {
    // Additional modifier based on distance (multiplier applied to transport)
    'under 5 km': 0.3,
    '5-15 km': 0.7,
    '15-30 km': 1.0,
    'over 30 km': 1.5
  },
  diet: {
    'meat daily': 3300,
    'meat sometimes': 2000,
    vegetarian: 1500,
    vegan: 1000
  },
  foodWaste: {
    'a lot': 1100,       // ~30% of food wasted
    'some': 500,          // ~15% wasted
    'very little': 150    // ~5% wasted, composting etc.
  },
  electricityPerHour: 1.5 * 365, // Multiply hours × 1.5 × 365
  digital: {
    // Streaming, gaming, cloud services per hour daily
    // Data centers + network energy ~ 50-80g CO₂/hr streaming
    perHourPerYear: 25  // ~25 kg CO₂/year per daily hour of streaming
  },
  shopping: {
    weekly: 1200,
    monthly: 600,
    rarely: 200
  },
  flightPerTrip: 500
};

export const GLOBAL_AVG = 4800;
export const INDIA_AVG = 1900;
export const TARGET_2050 = 2000;

// All 8 category keys in order
export const CATEGORY_KEYS = [
  'transport',
  'commuteDistance',
  'diet',
  'foodWaste',
  'electricity',
  'digital',
  'shopping',
  'flights'
];

/**
 * Calculates the score for a specific category based on user response.
 * @param {string} category 
 * @param {string|number} value 
 * @param {object} [allAnswers] - Full answers object (needed for commuteDistance modifier)
 * @returns {number}
 */
export function calculateCategoryScore(category, value, allAnswers = {}) {
  if (value === null || value === undefined) {
    return 0;
  }

  switch (category) {
    case 'transport': {
      const transportVal = String(value).toLowerCase();
      let base = 0;
      if (transportVal.includes('car')) base = COEFF.transport.car;
      else if (transportVal.includes('public') || transportVal.includes('transport')) base = COEFF.transport.public;
      // Apply distance modifier if available
      if (allAnswers.commuteDistance && base > 0) {
        const distVal = String(allAnswers.commuteDistance).toLowerCase();
        const modifier = COEFF.commuteDistance[distVal] || 1.0;
        return Math.round(base * modifier);
      }
      return base;
    }
    case 'commuteDistance': {
      // This doesn't add independently — it modifies transport
      // Return 0 as standalone; the modifier is applied in transport calculation
      return 0;
    }
    case 'diet': {
      const dietVal = String(value).toLowerCase();
      if (dietVal.includes('meat daily')) return COEFF.diet['meat daily'];
      if (dietVal.includes('meat sometimes')) return COEFF.diet['meat sometimes'];
      if (dietVal.includes('vegetarian')) return COEFF.diet.vegetarian;
      if (dietVal.includes('vegan')) return COEFF.diet.vegan;
      return COEFF.diet['meat sometimes']; // fallback
    }
    case 'foodWaste': {
      const wasteVal = String(value).toLowerCase();
      if (wasteVal.includes('a lot') || wasteVal.includes('lot')) return COEFF.foodWaste['a lot'];
      if (wasteVal.includes('some')) return COEFF.foodWaste['some'];
      if (wasteVal.includes('very little') || wasteVal.includes('little') || wasteVal.includes('minimal')) return COEFF.foodWaste['very little'];
      return COEFF.foodWaste['some']; // fallback
    }
    case 'electricity': {
      const hours = Number(value);
      return isNaN(hours) ? 0 : hours * COEFF.electricityPerHour;
    }
    case 'digital': {
      const hrs = Number(value);
      return isNaN(hrs) ? 0 : hrs * COEFF.digital.perHourPerYear;
    }
    case 'shopping': {
      const shopVal = String(value).toLowerCase();
      if (shopVal.includes('weekly')) return COEFF.shopping.weekly;
      if (shopVal.includes('monthly')) return COEFF.shopping.monthly;
      if (shopVal.includes('rarely')) return COEFF.shopping.rarely;
      return COEFF.shopping.monthly; // fallback
    }
    case 'flights': {
      const trips = Number(value);
      return isNaN(trips) ? 0 : trips * COEFF.flightPerTrip;
    }
    default:
      return 0;
  }
}

/**
 * Calculates the total score across all 8 categories.
 * @param {object} answers
 * @returns {number}
 */
export function calculateTotalScore(answers) {
  let total = 0;
  // Transport score (with distance modifier applied internally)
  total += calculateCategoryScore('transport', answers.transport, answers);
  // commuteDistance is a modifier, not additive — skip standalone
  total += calculateCategoryScore('diet', answers.diet);
  total += calculateCategoryScore('foodWaste', answers.foodWaste);
  total += calculateCategoryScore('electricity', answers.electricity);
  total += calculateCategoryScore('digital', answers.digital);
  total += calculateCategoryScore('shopping', answers.shopping);
  total += calculateCategoryScore('flights', answers.flights);
  return total;
}

/**
 * Returns per-category scores for breakdown display.
 * commuteDistance is folded into transport.
 */
export function getCategoryBreakdown(answers) {
  return [
    { key: 'transport', icon: '🚗', label: 'Transport', color: 'hsl(207, 90%, 61%)',
      score: calculateCategoryScore('transport', answers.transport, answers) },
    { key: 'diet', icon: '🍽️', label: 'Diet', color: 'hsl(186, 94%, 52%)',
      score: calculateCategoryScore('diet', answers.diet) },
    { key: 'foodWaste', icon: '🗑️', label: 'Food Waste', color: 'hsl(15, 85%, 55%)',
      score: calculateCategoryScore('foodWaste', answers.foodWaste) },
    { key: 'electricity', icon: '⚡', label: 'Energy', color: 'hsl(38, 95%, 55%)',
      score: calculateCategoryScore('electricity', answers.electricity) },
    { key: 'digital', icon: '📱', label: 'Digital', color: 'hsl(260, 70%, 65%)',
      score: calculateCategoryScore('digital', answers.digital) },
    { key: 'shopping', icon: '🛍️', label: 'Shopping', color: 'hsl(170, 80%, 50%)',
      score: calculateCategoryScore('shopping', answers.shopping) },
    { key: 'flights', icon: '✈️', label: 'Flights', color: 'hsl(280, 70%, 65%)',
      score: calculateCategoryScore('flights', answers.flights) }
  ].filter(c => c.score > 0);
}

/**
 * Generates an action plan containing exactly 3 items based on the highest categories.
 * @param {object} answers 
 * @returns {Array} List of actions
 */
export function generateActionPlan(answers) {
  const scores = [
    { name: 'transport', score: calculateCategoryScore('transport', answers.transport, answers), value: answers.transport },
    { name: 'diet', score: calculateCategoryScore('diet', answers.diet), value: answers.diet },
    { name: 'foodWaste', score: calculateCategoryScore('foodWaste', answers.foodWaste), value: answers.foodWaste },
    { name: 'electricity', score: calculateCategoryScore('electricity', answers.electricity), value: answers.electricity },
    { name: 'digital', score: calculateCategoryScore('digital', answers.digital), value: answers.digital },
    { name: 'shopping', score: calculateCategoryScore('shopping', answers.shopping), value: answers.shopping },
    { name: 'flights', score: calculateCategoryScore('flights', answers.flights), value: answers.flights }
  ];

  scores.sort((a, b) => b.score - a.score);

  const actionPool = {
    transport: [
      { action: 'Switch to public transport or carpool for daily commutes', saving: 3100, difficulty: 'Medium', category: 'transport' },
      { action: 'Replace short car trips with biking or walking', saving: 800, difficulty: 'Easy', category: 'transport' }
    ],
    diet: [
      { action: 'Adopt a vegetarian diet or introduce Meatless Mondays', saving: 1800, difficulty: 'Medium', category: 'diet' },
      { action: 'Transition to a plant-based (vegan) diet', saving: 2300, difficulty: 'Hard', category: 'diet' }
    ],
    foodWaste: [
      { action: 'Plan meals weekly and use leftovers creatively', saving: 600, difficulty: 'Easy', category: 'foodWaste' },
      { action: 'Start composting organic waste at home', saving: 400, difficulty: 'Medium', category: 'foodWaste' }
    ],
    electricity: [
      { action: 'Set thermostat 2°C higher in summer or lower in winter', saving: 400, difficulty: 'Easy', category: 'electricity' },
      { action: 'Upgrade to energy-efficient appliances and LED lighting', saving: 350, difficulty: 'Medium', category: 'electricity' },
      { action: 'Install solar panels or switch to green energy provider', saving: 800, difficulty: 'Hard', category: 'electricity' }
    ],
    digital: [
      { action: 'Reduce streaming quality to SD when possible', saving: 30, difficulty: 'Easy', category: 'digital' },
      { action: 'Limit screen time by 2 hours daily and delete unused cloud storage', saving: 50, difficulty: 'Medium', category: 'digital' }
    ],
    shopping: [
      { action: 'Embrace secondhand shopping and repair electronics', saving: 600, difficulty: 'Easy', category: 'shopping' },
      { action: 'Adopt a buy-nothing challenge for non-essential goods', saving: 1000, difficulty: 'Medium', category: 'shopping' }
    ],
    flights: [
      { action: 'Replace one flight with a train journey this year', saving: 450, difficulty: 'Medium', category: 'flights' },
      { action: 'Hold video conferences instead of business trips', saving: 500, difficulty: 'Easy', category: 'flights' }
    ]
  };

  const actions = [];
  const addedCategories = new Set();

  for (const item of scores) {
    if (actions.length >= 3) break;
    const cat = item.name;
    const pool = actionPool[cat];

    if (pool && pool.length > 0 && item.score > 0) {
      let actionObj = pool[0];

      if (cat === 'transport' && String(item.value).includes('public')) {
        actionObj = pool[1];
      }
      if (cat === 'diet' && String(item.value).includes('vegetarian')) {
        actionObj = pool[1];
      }

      actions.push(actionObj);
      addedCategories.add(cat);
    }
  }

  // Fallback fill
  const allCats = Object.keys(actionPool);
  for (const cat of allCats) {
    if (actions.length >= 3) break;
    if (!addedCategories.has(cat)) {
      const pool = actionPool[cat];
      if (pool && pool.length > 0) {
        actions.push(pool[0]);
        addedCategories.add(cat);
      }
    }
  }

  return actions.slice(0, 3);
}
