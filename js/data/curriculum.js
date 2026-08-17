// Celyn V1.0 — structured curriculum for "Grammar & Vocab" module.
// Levels run Zero (absolute beginner) -> Advanced (TOEFL-adjacent).

export const LEVELS = [
  {
    id: "zero",
    label: "Zero",
    tagline: "First words & simple present",
    color: "#3182CE",
    grammarNotes: [
      {
        title: "To be: am / is / are",
        explanation: "Use 'am' with I, 'is' with he/she/it, 'are' with you/we/they.",
        examples: ["I am a student.", "She is happy.", "They are at home."],
      },
      {
        title: "Simple present for routines",
        explanation: "Use the base verb (+s for he/she/it) for habits and facts.",
        examples: ["I study every morning.", "She studies English.", "We live in Jakarta."],
      },
    ],
    vocab: [
      { word: "Hello", meaning: "A greeting used when meeting someone", example: "Hello, my name is Celyn." },
      { word: "Study", meaning: "To learn about a subject", example: "I study English every day." },
      { word: "Friend", meaning: "A person you like and trust", example: "She is my best friend." },
      { word: "Today", meaning: "This current day", example: "What did you do today?" },
      { word: "Practice", meaning: "To repeat an activity to improve", example: "Let's practice speaking." },
      { word: "Understand", meaning: "To know the meaning of something", example: "Do you understand this word?" },
    ],
    starterPrompt: "Let's start with the basics. Greet me in English and tell me your name!",
  },
  {
    id: "beginner",
    label: "Beginner",
    tagline: "Past tense & daily conversation",
    color: "#2B6CB0",
    grammarNotes: [
      {
        title: "Simple past tense",
        explanation: "Use verb+ed for regular verbs, or the irregular past form (go -> went).",
        examples: ["I went to the library yesterday.", "She watched a movie last night."],
      },
      {
        title: "Question words",
        explanation: "Who, what, where, when, why, how — start questions to get details.",
        examples: ["Where did you go?", "Why do you like English?"],
      },
    ],
    vocab: [
      { word: "Yesterday", meaning: "The day before today", example: "I went to the library yesterday." },
      { word: "Because", meaning: "Used to give a reason", example: "I study because I want a good score." },
      { word: "Improve", meaning: "To get better at something", example: "I want to improve my speaking." },
      { word: "Schedule", meaning: "A plan of things to do and when", example: "My schedule is busy this week." },
      { word: "Opinion", meaning: "What you personally think", example: "In my opinion, English is fun." },
    ],
    starterPrompt: "Tell me about something you did yesterday, using the past tense.",
  },
  {
    id: "intermediate",
    label: "Intermediate",
    tagline: "Complex sentences & academic tone",
    color: "#1A365D",
    grammarNotes: [
      {
        title: "Present perfect",
        explanation: "Have/has + past participle, for experiences and unfinished time.",
        examples: ["I have studied English for three years.", "She has never taken the TOEFL."],
      },
      {
        title: "Conditional sentences (1st type)",
        explanation: "If + present, will + base verb, for real future possibilities.",
        examples: ["If I practice daily, I will improve faster."],
      },
    ],
    vocab: [
      { word: "Achieve", meaning: "To successfully complete a goal", example: "I want to achieve a high TOEFL score." },
      { word: "Significant", meaning: "Important or noticeable", example: "There was a significant improvement." },
      { word: "Perspective", meaning: "A particular way of viewing things", example: "That's an interesting perspective." },
      { word: "Consequently", meaning: "As a result", example: "I practiced daily; consequently, I improved." },
    ],
    starterPrompt: "Describe a long-term goal you have, and explain how you plan to reach it.",
  },
  {
    id: "advanced",
    label: "Advanced / TOEFL",
    tagline: "Academic vocabulary & exam structures",
    color: "#0F2942",
    grammarNotes: [
      {
        title: "Passive voice in academic writing",
        explanation: "Subject + be + past participle, used to emphasize the action over the actor.",
        examples: ["The results were analyzed by the researchers.", "The theory is widely accepted."],
      },
      {
        title: "Complex noun phrases",
        explanation: "Combine adjectives and relative clauses for precise, exam-level sentences.",
        examples: ["The rapidly growing demand for renewable energy, which many experts predicted, has reshaped policy."],
      },
    ],
    vocab: [
      { word: "Substantial", meaning: "Considerable in size or importance", example: "There has been substantial progress." },
      { word: "Hypothesis", meaning: "A proposed explanation to be tested", example: "The hypothesis was confirmed by the data." },
      { word: "Nevertheless", meaning: "In spite of that", example: "It was difficult; nevertheless, she succeeded." },
      { word: "Ambiguous", meaning: "Open to more than one interpretation", example: "The instructions were ambiguous." },
    ],
    starterPrompt: "Let's practice a TOEFL-style independent speaking task. I'll give you a topic to discuss for 45 seconds.",
  },
];

export function getLevel(id) {
  return LEVELS.find((l) => l.id === id) || LEVELS[0];
}
