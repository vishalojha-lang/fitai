export function calculateBMR(weight: number, height: number, age: number, gender: string): number {
  if (gender === 'male') {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  }
  return 10 * weight + 6.25 * height - 5 * age - 161;
}

export const activityMultipliers: Record<string, number> = {
  sedentary: 1.2,
  lightly_active: 1.375,
  moderately_active: 1.55,
  very_active: 1.725,
  extra_active: 1.9,
};

export function calculateTDEE(bmr: number, activityLevel: string): number {
  return bmr * (activityMultipliers[activityLevel] || 1.2);
}

export function calculateDailyCalories(tdee: number, fitnessGoal: string): number {
  switch (fitnessGoal) {
    case 'fat_loss': return tdee - 500;
    case 'muscle_gain': return tdee + 300;
    case 'strength_training': return tdee + 100;
    case 'bodybuilding': return tdee + 400;
    default: return tdee;
  }
}

export function calculateMacros(calories: number, fitnessGoal: string): { protein: number; carbs: number; fat: number } {
  let proteinRatio: number, carbRatio: number, fatRatio: number;
  switch (fitnessGoal) {
    case 'fat_loss':
      proteinRatio = 0.40; carbRatio = 0.30; fatRatio = 0.30; break;
    case 'muscle_gain':
    case 'bodybuilding':
      proteinRatio = 0.35; carbRatio = 0.45; fatRatio = 0.20; break;
    case 'strength_training':
      proteinRatio = 0.30; carbRatio = 0.50; fatRatio = 0.20; break;
    default:
      proteinRatio = 0.25; carbRatio = 0.50; fatRatio = 0.25;
  }
  return {
    protein: Math.round((calories * proteinRatio) / 4),
    carbs: Math.round((calories * carbRatio) / 4),
    fat: Math.round((calories * fatRatio) / 9),
  };
}
