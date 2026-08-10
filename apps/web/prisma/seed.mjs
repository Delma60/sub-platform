import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const plans = [
  {
    id: "single",
    name: "Single",
    price: 15000,
    frequency: "monthly",
    features: ["6-8 staple items", "Monthly delivery", "Pause anytime"],
  },
  {
    id: "family",
    name: "Family",
    price: 28000,
    frequency: "biweekly",
    features: [
      "14-16 staple items",
      "Weekly or bi-weekly delivery",
      "Swap up to 3 items",
      "Priority delivery slots",
    ],
  },
  {
    id: "bulk",
    name: "Bulk",
    price: 45000,
    frequency: "weekly",
    features: [
      "25+ items, larger quantities",
      "Weekly delivery",
      "Full item customization",
      "Dedicated support line",
    ],
  },
];

const products = [
  {
    id: "prd_tomatoes",
    name: "Fresh Tomatoes",
    slug: "fresh-tomatoes",
    category: "Vegetables",
    description: "Market-fresh tomatoes for stews, sauces, and daily cooking.",
    price: 2500,
    unit: "basket",
  },
  {
    id: "prd_rice",
    name: "Local Rice",
    slug: "local-rice",
    category: "Grains & staples",
    description: "Cleaned local rice packed for weekly household meals.",
    price: 9500,
    unit: "5kg",
  },
  {
    id: "prd_palm_oil",
    name: "Palm Oil",
    slug: "palm-oil",
    category: "Pantry",
    description: "Rich red palm oil sourced for soups and native dishes.",
    price: 4200,
    unit: "2L",
  },
];

async function main() {
  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { id: plan.id },
      update: plan,
      create: plan,
    });
  }

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: { ...product, active: true },
      create: { ...product, active: true },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
