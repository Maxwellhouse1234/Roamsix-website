export const FIELDWORK_PROGRAM = [
  {
    slug: 'q1', quarter: 'Q1 · January–March', subject: 'Microbiome and Gut Health', title: 'The living system within us',
    recognition: 'It can be difficult to know which gut-health advice is useful, which is overstated, and what food, stress, sleep, and movement have to do with one another.',
    description: 'Explore how soil, food, the microbiome, the gut-brain axis, movement, and metabolic health influence one another.',
    outcome: 'Leave with a clearer picture of the system and a more grounded way to think about your own choices.',
    retreat: 'The Microbiome in Practice',
    fields: 'Gastroenterology · Nutrition · Regenerative agriculture · Culinary science · Movement · Recovery',
    months: [
      ['January', 'Soil, food, and microbial diversity', ['What does healthy soil change about the food we eat?', 'Which forms of microbial diversity matter to human health?', 'What happens between harvest, preparation, and the plate?', 'Where do prebiotics, probiotics, and postbiotics fit?']],
      ['February', 'The gut-brain and stress connection', ['How do the gut and brain communicate?', 'What does sustained stress change in digestion?', 'Where do sleep and circadian rhythm enter the picture?', 'Which everyday practices have credible evidence behind them?']],
      ['March', 'Fuel, movement, and metabolic health', ['How does the microbiome interact with energy regulation?', 'What changes before, during, and after physical effort?', 'How should practitioners discuss personalization responsibly?', 'What can professionals apply without overpromising?']],
    ],
  },
  {
    slug: 'q2', quarter: 'Q2 · April–June', subject: 'Sleep Science and Recovery', title: 'The architecture of recovery',
    recognition: 'You can take recovery seriously and still wonder why rest does not always leave you restored.',
    description: 'Explore how light, sleep, circadian rhythm, stress load, and the environment shape recovery and sustainable performance.',
    outcome: 'See how the different parts of recovery relate, so you can consider your own rhythms with greater clarity.',
    retreat: 'Recovery by Design',
    fields: 'Sleep science · Chronobiology · Neuroscience · Coaching · Environment · Recovery practice',
    months: [
      ['April', 'Light, timing, and the body clock', ['How does light set the body’s daily rhythm?', 'What changes when work and biology fall out of sync?', 'Can timing improve the effect of movement and meals?', 'How do we build realistic circadian practices?']],
      ['May', 'Sleep as a whole-body system', ['What actually drives sleep quality?', 'How do breathing, temperature, and environment matter?', 'What can wearables tell us, and what can’t they?', 'When does optimization become another source of stress?']],
      ['June', 'Stress load and sustainable performance', ['How do we recognize accumulated load?', 'What separates rest from meaningful recovery?', 'How can training and work demands coexist?', 'What makes a recovery practice sustainable?']],
    ],
  },
  {
    slug: 'q3', quarter: 'Q3 · July–September', subject: 'Stress, Focus, and Resilience', title: 'Attention under pressure',
    recognition: 'You can be focused and capable while still feeling how much modern life asks of your attention.',
    description: 'Examine focus, emotional regulation, neuroplasticity, and the physiology of resilience.',
    outcome: 'Understand what shapes attention and recovery, and find more room to return to what matters.',
    retreat: 'Attention, Stress, and Resilience',
    fields: 'Psychology · Neuroscience · Breath and movement · Leadership · Nature · Community',
    months: [
      ['July', 'Focus in a distracted world', ['What shapes attention before willpower enters the picture?', 'How does the environment change cognitive load?', 'Can movement improve the quality of focus?', 'Which rituals help people return to what matters?']],
      ['August', 'The physiology of resilience', ['What does resilience look like in the nervous system?', 'How do breath, movement, and recovery change state?', 'When does productive stress become overload?', 'How can practitioners teach regulation responsibly?']],
      ['September', 'Connection, trust, and performance', ['What helps people feel safe enough to contribute?', 'How does belonging affect health and performance?', 'What makes conversation change perspective?', 'How do relationships continue after the room clears?']],
    ],
  },
  {
    slug: 'q4', quarter: 'Q4 · October–December', subject: 'Strength, Mobility, and Longevity', title: 'Capacity for a longer life',
    recognition: 'Longevity can sound like a collection of numbers and protocols. Most people want something simpler: to stay capable, connected, and fully themselves.',
    description: 'Connect strength, mobility, cognition, nourishment, and social wellbeing to the systems that support healthy aging.',
    outcome: 'Build a more human picture of longevity and the capacities you may want to protect over time.',
    retreat: 'Strength for the Long Game',
    fields: 'Kinesiology · Geroscience · Nutrition · Cognitive health · Coaching · Social connection',
    months: [
      ['October', 'Strength, mobility, and independence', ['What physical capacities matter most over time?', 'How do strength and mobility support one another?', 'What changes in training across the lifespan?', 'How can professionals build adherence without fear?']],
      ['November', 'Brain health across the lifespan', ['How do movement and cardiovascular health affect the brain?', 'What roles do sleep, learning, and connection play?', 'How should we interpret emerging longevity research?', 'Which habits have value beyond a single metric?']],
      ['December', 'Building a life that can sustain itself', ['How do food, movement, recovery, and community reinforce one another?', 'Which signals are useful, and which can distract?', 'How do we turn knowledge into a durable practice?', 'What should we carry into the next year?']],
    ],
  },
];

export function getFieldworkQuarter(slug) {
  return FIELDWORK_PROGRAM.find((quarter) => quarter.slug === slug);
}
