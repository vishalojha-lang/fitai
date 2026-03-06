import { db } from './index';
import { foodDatabase } from './schema';

const foods = [
  // Proteins
  { name: 'Chicken Breast', calories: 165, protein: 31, carbs: 0, fat: 3.6, servingSize: '100g', category: 'Protein' },
  { name: 'Salmon', calories: 208, protein: 20, carbs: 0, fat: 13, servingSize: '100g', category: 'Protein' },
  { name: 'Tuna Canned in Water', calories: 116, protein: 26, carbs: 0, fat: 1, servingSize: '100g', category: 'Protein' },
  { name: 'Eggs', calories: 155, protein: 13, carbs: 1.1, fat: 11, servingSize: '100g', category: 'Protein' },
  { name: 'Lean Ground Beef', calories: 215, protein: 26, carbs: 0, fat: 12, servingSize: '100g', category: 'Protein' },
  { name: 'Turkey Breast', calories: 135, protein: 30, carbs: 0, fat: 1, servingSize: '100g', category: 'Protein' },
  { name: 'Cottage Cheese', calories: 98, protein: 11, carbs: 3.4, fat: 4.3, servingSize: '100g', category: 'Protein' },
  { name: 'Greek Yogurt', calories: 59, protein: 10, carbs: 3.6, fat: 0.4, servingSize: '100g', category: 'Protein' },
  { name: 'Whey Protein Powder', calories: 400, protein: 80, carbs: 8, fat: 5, servingSize: '100g', category: 'Protein' },

  // Grains
  { name: 'White Rice Cooked', calories: 130, protein: 2.7, carbs: 28, fat: 0.3, servingSize: '100g', category: 'Grains' },
  { name: 'Brown Rice Cooked', calories: 123, protein: 2.7, carbs: 26, fat: 1, servingSize: '100g', category: 'Grains' },
  { name: 'Oats', calories: 389, protein: 17, carbs: 66, fat: 7, servingSize: '100g', category: 'Grains' },
  { name: 'Whole Wheat Bread', calories: 247, protein: 13, carbs: 41, fat: 4.2, servingSize: '100g', category: 'Grains' },
  { name: 'Pasta Cooked', calories: 158, protein: 6, carbs: 31, fat: 0.9, servingSize: '100g', category: 'Grains' },
  { name: 'Quinoa Cooked', calories: 120, protein: 4.4, carbs: 22, fat: 1.9, servingSize: '100g', category: 'Grains' },
  { name: 'Sweet Potato', calories: 86, protein: 1.6, carbs: 20, fat: 0.1, servingSize: '100g', category: 'Grains' },
  { name: 'White Potato', calories: 77, protein: 2, carbs: 17, fat: 0.1, servingSize: '100g', category: 'Grains' },

  // Vegetables
  { name: 'Broccoli', calories: 34, protein: 2.8, carbs: 7, fat: 0.4, servingSize: '100g', category: 'Vegetables' },
  { name: 'Spinach', calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, servingSize: '100g', category: 'Vegetables' },
  { name: 'Kale', calories: 49, protein: 4.3, carbs: 9, fat: 0.9, servingSize: '100g', category: 'Vegetables' },
  { name: 'Carrots', calories: 41, protein: 0.9, carbs: 10, fat: 0.2, servingSize: '100g', category: 'Vegetables' },
  { name: 'Tomatoes', calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, servingSize: '100g', category: 'Vegetables' },
  { name: 'Cucumber', calories: 15, protein: 0.7, carbs: 3.6, fat: 0.1, servingSize: '100g', category: 'Vegetables' },
  { name: 'Bell Pepper Red', calories: 31, protein: 1, carbs: 6, fat: 0.3, servingSize: '100g', category: 'Vegetables' },
  { name: 'Onion', calories: 40, protein: 1.1, carbs: 9.3, fat: 0.1, servingSize: '100g', category: 'Vegetables' },
  { name: 'Mushrooms', calories: 22, protein: 3.1, carbs: 3.3, fat: 0.3, servingSize: '100g', category: 'Vegetables' },
  { name: 'Lettuce', calories: 15, protein: 1.4, carbs: 2.9, fat: 0.2, servingSize: '100g', category: 'Vegetables' },

  // Fruits
  { name: 'Banana', calories: 89, protein: 1.1, carbs: 23, fat: 0.3, servingSize: '100g', category: 'Fruits' },
  { name: 'Apple', calories: 52, protein: 0.3, carbs: 14, fat: 0.2, servingSize: '100g', category: 'Fruits' },
  { name: 'Orange', calories: 47, protein: 0.9, carbs: 12, fat: 0.1, servingSize: '100g', category: 'Fruits' },
  { name: 'Blueberries', calories: 57, protein: 0.7, carbs: 14, fat: 0.3, servingSize: '100g', category: 'Fruits' },
  { name: 'Strawberries', calories: 32, protein: 0.7, carbs: 7.7, fat: 0.3, servingSize: '100g', category: 'Fruits' },
  { name: 'Grapes', calories: 69, protein: 0.7, carbs: 18, fat: 0.2, servingSize: '100g', category: 'Fruits' },
  { name: 'Mango', calories: 60, protein: 0.8, carbs: 15, fat: 0.4, servingSize: '100g', category: 'Fruits' },
  { name: 'Avocado', calories: 160, protein: 2, carbs: 9, fat: 15, servingSize: '100g', category: 'Fruits' },

  // Dairy
  { name: 'Whole Milk', calories: 61, protein: 3.2, carbs: 4.8, fat: 3.3, servingSize: '100ml', category: 'Dairy' },
  { name: 'Skim Milk', calories: 34, protein: 3.4, carbs: 5, fat: 0.1, servingSize: '100ml', category: 'Dairy' },
  { name: 'Cheddar Cheese', calories: 402, protein: 25, carbs: 1.3, fat: 33, servingSize: '100g', category: 'Dairy' },
  { name: 'Mozzarella', calories: 280, protein: 28, carbs: 2.2, fat: 17, servingSize: '100g', category: 'Dairy' },
  { name: 'Butter', calories: 717, protein: 0.9, carbs: 0.1, fat: 81, servingSize: '100g', category: 'Dairy' },

  // Nuts & Seeds
  { name: 'Almonds', calories: 579, protein: 21, carbs: 22, fat: 50, servingSize: '100g', category: 'Nuts & Seeds' },
  { name: 'Walnuts', calories: 654, protein: 15, carbs: 14, fat: 65, servingSize: '100g', category: 'Nuts & Seeds' },
  { name: 'Peanut Butter', calories: 588, protein: 25, carbs: 20, fat: 50, servingSize: '100g', category: 'Nuts & Seeds' },
  { name: 'Chia Seeds', calories: 486, protein: 17, carbs: 42, fat: 31, servingSize: '100g', category: 'Nuts & Seeds' },
  { name: 'Sunflower Seeds', calories: 584, protein: 21, carbs: 20, fat: 51, servingSize: '100g', category: 'Nuts & Seeds' },

  // Legumes
  { name: 'Black Beans Cooked', calories: 132, protein: 8.9, carbs: 24, fat: 0.5, servingSize: '100g', category: 'Legumes' },
  { name: 'Lentils Cooked', calories: 116, protein: 9, carbs: 20, fat: 0.4, servingSize: '100g', category: 'Legumes' },
  { name: 'Chickpeas Cooked', calories: 164, protein: 8.9, carbs: 27, fat: 2.6, servingSize: '100g', category: 'Legumes' },

  // Fats & Oils
  { name: 'Olive Oil', calories: 884, protein: 0, carbs: 0, fat: 100, servingSize: '100ml', category: 'Fats & Oils' },
  { name: 'Coconut Oil', calories: 862, protein: 0, carbs: 0, fat: 100, servingSize: '100ml', category: 'Fats & Oils' },

  // Processed & Other
  { name: 'White Bread', calories: 265, protein: 9, carbs: 49, fat: 3.2, servingSize: '100g', category: 'Processed' },
  { name: 'Dark Chocolate', calories: 546, protein: 5, carbs: 60, fat: 31, servingSize: '100g', category: 'Processed' },
  { name: 'Honey', calories: 304, protein: 0.3, carbs: 82, fat: 0, servingSize: '100g', category: 'Processed' },
  { name: 'Orange Juice', calories: 45, protein: 0.7, carbs: 10, fat: 0.2, servingSize: '100ml', category: 'Beverages' },
];

async function seed() {
  try {
    console.log('Seeding food database...');
    await db.insert(foodDatabase).values(foods);
    console.log(`Seeded ${foods.length} foods successfully.`);
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
}

seed();
