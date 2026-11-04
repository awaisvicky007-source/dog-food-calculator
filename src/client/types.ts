export interface FormValues {
  name: string;
  weight: string;
  weightUnit: 'lb' | 'kg';
  age: string;
  ageUnit: 'weeks' | 'months' | 'years';
  adultStatus: 'neutered' | 'intact' | 'obesity_prone';
  bcs: string;
  activity: 'typical' | 'light_work' | 'moderate_work';
  foodName: string;
  kcalCup: string;
  kcalKg: string;
  gramsCup: string;
  bagSize: string;
  bagUnit: 'lb' | 'kg';
}

export interface LocalPet {
  id: string;
  values: FormValues;
  updatedAt: string;
}
