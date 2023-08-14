export const categoriesArray= [
  'Articles & Tutorials',
  'Opinions & Advice',
  'Launches & Tools',
  'Miscellaneous',
  'Quick Links',
  'Big Tech & Startups',
  'Science & Futuristic Technology',
  'Programming, Design & Data Science',
] as const;

export type Categories = typeof categoriesArray[number];