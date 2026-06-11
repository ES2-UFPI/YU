import { config } from "dotenv";
import { fileURLToPath } from "node:url";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client.js";

config({ path: fileURLToPath(new URL("../../.env", import.meta.url)) });

const wellnessGoals = [
  {
    id: "hydration",
    name: "Beber mais agua",
    shortDescription: "Manter uma hidratacao mais consistente ao longo do dia.",
    icon: "droplet"
  },
  {
    id: "screen_time_balance",
    name: "Reduzir tempo de tela",
    shortDescription: "Equilibrar o uso do dispositivo e incentivar pausas saudaveis.",
    icon: "smartphone"
  },
  {
    id: "physical_activity",
    name: "Praticar atividade fisica",
    shortDescription: "Aumentar o movimento diario com exercicios leves ou moderados.",
    icon: "activity"
  },
  {
    id: "read_more",
    name: "Ler mais livros",
    shortDescription: "Incentivar a leitura regular para estimular o aprendizado e a criatividade.",
    icon: "book-open"
  },
  {
    id: "study",
    name: "Estudar mais",
    shortDescription: "Dedicar tempo ao aprendizado contínuo para desenvolver competências.",
    icon: "graduation-cap"
  }, 
  {
    id: "healthy_eating",
    name: "Alimentação saudável",
    shortDescription: "Incentivar uma alimentação balanceada e nutritiva.",
    icon: "apple"
  }
];

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL
});

const prisma = new PrismaClient({ adapter });

async function main() {
  for (const goal of wellnessGoals) {
    await prisma.wellnessGoal.upsert({
      where: { id: goal.id },
      update: {
        name: goal.name,
        shortDescription: goal.shortDescription,
        icon: goal.icon
      },
      create: goal
    });
  }

  console.log(`${wellnessGoals.length} objetivos de bem-estar cadastrados.`);
}

main()
  .catch((error) => {
    console.error("Erro ao cadastrar objetivos de bem-estar:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
