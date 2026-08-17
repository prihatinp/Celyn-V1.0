// Celyn V1.0 — TOEFL Booster exercise bank.
// Each section maps to a real TOEFL iBT task type; "prompt" seeds the AI chat.

export const TOEFL_SECTIONS = [
  {
    id: "speaking-independent",
    title: "Independent Speaking",
    description: "Share your opinion on a familiar topic in under 45 seconds.",
    icon: "mic",
    tasks: [
      "Describe a teacher who had a positive influence on your life.",
      "Do you agree or disagree: students should be required to wear uniforms?",
      "Talk about a place you would like to visit and explain why.",
    ],
  },
  {
    id: "speaking-integrated",
    title: "Integrated Speaking",
    description: "Summarize a short passage or scenario, then give your view.",
    icon: "layers",
    tasks: [
      "Summarize the main argument for switching a university to online classes.",
      "Explain the professor's example about supply and demand in your own words.",
    ],
  },
  {
    id: "structure",
    title: "Structure & Grammar Drill",
    description: "Fast-paced sentence correction to sharpen accuracy under time pressure.",
    icon: "check",
    tasks: [
      "Correct this sentence: 'She don't like studying at night.'",
      "Correct this sentence: 'If I will have time, I will call you.'",
      "Correct this sentence: 'The informations was very useful.'",
    ],
  },
  {
    id: "vocabulary",
    title: "Academic Vocabulary",
    description: "Practice using high-frequency TOEFL academic words in context.",
    icon: "book",
    tasks: [
      "Use the word 'facilitate' in a sentence about education.",
      "Use the word 'controversial' in a sentence about technology.",
      "Use the word 'ultimately' in a sentence about your career goals.",
    ],
  },
];

export function getSection(id) {
  return TOEFL_SECTIONS.find((s) => s.id === id) || TOEFL_SECTIONS[0];
}
