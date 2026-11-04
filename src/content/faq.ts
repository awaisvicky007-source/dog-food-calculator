/** Visible FAQ copy. The same array feeds the FAQPage JSON-LD (FR-43). No external links here. */
export interface Faq {
  q: string;
  a: string;
}

export const FAQ: Faq[] = [
  {
    q: 'How many calories does my dog need each day?',
    a: 'Veterinary references estimate a dog\u2019s resting energy requirement (RER) as 70 \u00d7 body weight in kg to the power 0.75, then multiply it by a factor for life stage and status - for example 1.6 for a neutered adult and 1.8 for an intact adult. This calculator shows every step so you can see where the number comes from.',
  },
  {
    q: 'Why should I enter kcal per cup from the food bag?',
    a: 'Calories per cup differ widely between foods, so cups are only exact when they use your food\u2019s own label value. If you leave it blank you get a clearly labelled approximate range instead of a single number. Pet food labels list calories as kcal per kg and per familiar unit such as a cup.',
  },
  {
    q: 'How many meals a day should I feed?',
    a: 'Veterinary feeding schedules suggest 4 meals for puppies 6-12 weeks old, 3 meals from 3-6 months, 2 meals from 6-12 months, and 1 or 2 meals for adults. This tool defaults to 2 meals for adults.',
  },
  {
    q: 'How many treats can my dog have?',
    a: 'A common guideline is to keep treats to 10% or less of daily calories. The calculator shows that treat allowance and how much food to reduce if you use it.',
  },
  {
    q: 'Is this calculator suitable for puppies, seniors, or dogs with health conditions?',
    a: 'It gives a starting estimate for healthy dogs. Puppies (especially large breeds), pregnant or nursing dogs, working dogs, and dogs with medical conditions or on medication can need very different amounts, so ask your veterinarian.',
  },
  {
    q: 'Is my dog\u2019s information stored anywhere?',
    a: 'No account is needed and calculations run in your browser. If you choose to save a pet, it is stored only on your own device. You can export it as a file or erase everything with the Clear all data button.',
  },
];
