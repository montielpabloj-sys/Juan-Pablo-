export interface Ingredient {
  item: string;
  amount: string;
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  ingredients: Ingredient[];
  steps: string[];
  prepTime: string;
  cookTime: string;
  servings: number;
  difficulty: 'Fácil' | 'Media' | 'Difícil';
}

export interface CookingState {
  recipe: Recipe | null;
  currentStep: number;
  isCooking: boolean;
}
