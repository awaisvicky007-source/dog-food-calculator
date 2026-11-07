/** Visible FAQ copy. Same array feeds the FAQPage JSON-LD (FR-43). Inline links allowed in `a` — rendered unescaped. */
export interface Faq {
  q: string;
  a: string;
}

export const FAQ: Faq[] = [
  {
    q: 'How many calories should my dog eat per day?',
    a: 'Veterinary references estimate a dog\u2019s resting energy requirement (RER) as 70 × body weight in kg to the power 0.75, then multiply it by a factor for life stage and status — for example 1.6 for a neutered adult and 1.8 for an intact adult. For a 30 lb neutered adult, that works out to roughly 794 kcal per day. This calculator shows every step so you can see where the number comes from.',
  },
  {
    q: 'How do I calculate kcal for my dog?',
    a: 'Dog calorie needs are usually written as kcal (kilocalories) — one kcal equals one Calorie (capital C). The math is identical to calories: RER = 70 × body weight in kg to the power 0.75, then multiply by 1.6 for a neutered adult, 1.8 for intact, 1.4 for obesity-prone, and 2–3 for puppies and working dogs. A 30 lb neutered adult needs about 794 kcal per day. Enter your dog\u2019s weight above and the calculator shows kcal/day, cups, grams, treats and water.',
  },
  {
    q: 'How do I use this calculator by dog breed?',
    a: 'Breed doesn\u2019t change the calorie formula — weight, age and neuter status do. Breed mainly affects <em>when</em> a puppy becomes an adult (small breeds transition around 12 months, large breeds around 15, giant breeds around 18+). Enter your dog\u2019s current weight and age for an accurate estimate. For a breed-specific example, see our <a href="https://www.pawvortex.com/blogs/dog-care/labrador-retriever-feeding-guide-how-much-how-often-to-feed">Labrador Retriever feeding chart</a>.',
  },
  {
    q: 'How much dry food should I feed my dog?',
    a: 'Divide your dog\u2019s daily calories by the food\u2019s kcal per cup (printed on the bag as \u201ckcal per cup\u201d or \u201ckcal/ME per cup\u201d). A 794 kcal dog eating a 350 kcal/cup food needs about 2.27 cups per day. Enter kcal per cup in the Food label section above for an exact amount rather than an approximation. For full portion tables by weight and age, see our <a href="https://www.pawvortex.com/blogs/dog-care/how-much-to-feed-dog-portion-guide">dog feeding portion guide</a>.',
  },
  {
    q: 'How much wet food should I feed my dog?',
    a: 'The same daily calorie target applies — wet food just has different calorie density. Typical wet food is 70–120 kcal per 100 g or 200–400 kcal per 13 oz can. Divide your dog\u2019s daily calories by the can\u2019s total kcal to get cans per day. When mixing dry and wet, add the calories from both so the total equals the daily target. Wet food also provides water, so reduce the drinking-water target accordingly.',
  },
  {
    q: 'How many meals a day should I feed?',
    a: 'Veterinary feeding schedules suggest 4 meals for puppies 6–12 weeks old, 3 meals from 3–6 months, 2 meals from 6–12 months, and 1 or 2 meals for adults. This tool defaults to 2 meals for adults. For younger dogs, see our <a href="https://www.pawvortex.com/blogs/dog-care/puppy-feeding-schedule-guide">puppy feeding schedule guide</a>.',
  },
  {
    q: 'How many treats can my dog have?',
    a: 'A common guideline is to keep treats, chews, and table scraps to 10% or less of daily calories. For a dog eating 800 kcal a day, that\u2019s at most 80 kcal from treats — and food drops to 720 kcal to keep the total on target. For puppy-appropriate feeding supplies and slow feeders that help with training rewards, see our <a href="https://www.pawvortex.com/blogs/news/best-puppy-food-and-feeding-supplies-online-2026">puppy food and feeding supplies guide</a>.',
  },
  {
    q: 'How long will a bag of dog food last?',
    a: 'Enter the bag size in the Food label section above and the calculator estimates days of food. Formula: bag weight in grams ÷ daily grams (from daily calories ÷ kcal per kg). A 30 lb bag (about 13,600 g) with a dog eating 227 g/day lasts about 60 days. Enter both kcal and bag size for the exact figure.',
  },
  {
    q: 'Can I use this calculator for homemade or raw diets?',
    a: 'Yes for the <em>calorie target</em> — the RER × life-stage math is the same for any diet. But homemade and raw diets require veterinary nutritionist oversight for nutrient balance (protein, fat, calcium, phosphorus, vitamins, minerals), which this calculator does not assess. Use the daily calorie figure here as your target, then work with a board-certified veterinary nutritionist to convert it into a complete-and-balanced recipe. Raw diets should follow AAFCO or NRC nutrient profiles. For broader nutrition fundamentals, see our <a href="https://www.pawvortex.com/blogs/dog-care/complete-dog-nutrition-guide">complete dog nutrition guide</a>.',
  },
  {
    q: 'Why should I enter kcal per cup from the food bag?',
    a: 'Calories per cup differ widely between foods (typical range: 280–500 kcal/cup), so cups are only exact when they use your food\u2019s own label value. If you leave it blank you get a clearly labelled approximate range instead of a single number. Pet food labels list calories as kcal per kg and per familiar unit such as a cup (AAFCO model regulations).',
  },
  {
    q: 'What is the difference between RER and MER?',
    a: 'RER (Resting Energy Requirement) is the energy a dog needs at complete rest — calculated as 70 × body weight in kg raised to the power 0.75. MER (Maintenance Energy Requirement) multiplies RER by a factor for life stage and activity — 1.6 for neutered adults, 1.8 for intact, 1.4 for obesity-prone, and 2–3 for puppies and working dogs. MER is your daily feeding target. Both formulas come from the Merck Veterinary Manual.',
  },
  {
    q: 'Is this calculator suitable for puppies, seniors, or dogs with health conditions?',
    a: 'It gives a starting estimate for healthy dogs. Puppies (especially large breeds), pregnant or nursing dogs, working dogs, and dogs with medical conditions or on medication can need very different amounts, so ask your veterinarian. Read our <a href="https://www.pawvortex.com/blogs/dog-care/puppy-feeding-schedule-guide">puppy feeding schedule guide</a> and <a href="https://www.pawvortex.com/blogs/dog-care/senior-dog-nutrition-guide">senior dog nutrition guide</a> for more on feeding at those life stages.',
  },
  {
    q: 'Is my dog\u2019s information stored anywhere?',
    a: 'No account is needed and calculations run entirely in your browser. If you choose to save a pet, it is stored only on your own device (browser localStorage). You can export it as a JSON file or erase everything with the Clear all data button. No pet name, weight, or plan is ever sent to PawVortex.',
  },
];