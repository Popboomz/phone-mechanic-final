import { addPhoneModel } from "../lib/data";
import { PHONE_MODELS } from "../lib/phoneModels";

const parse = (s: string): { brand: string; modelName: string; isActive: boolean; sortOrder: number } => {
  if (s.startsWith("iPhone")) return { brand: "Apple", modelName: s, isActive: true, sortOrder: 0 };
  if (s.startsWith("Samsung ")) return { brand: "Samsung", modelName: s.replace(/^Samsung\s+/, ""), isActive: true, sortOrder: 0 };
  if (s.startsWith("OPPO ")) return { brand: "OPPO", modelName: s.replace(/^OPPO\s+/, ""), isActive: true, sortOrder: 0 };
  if (s.startsWith("Motorola ")) return { brand: "Motorola", modelName: s.replace(/^Motorola\s+/, ""), isActive: true, sortOrder: 0 };
  if (s.startsWith("Google ")) return { brand: "Google", modelName: s.replace(/^Google\s+/, ""), isActive: true, sortOrder: 0 };
  if (s.startsWith("Xiaomi ")) return { brand: "Xiaomi", modelName: s.replace(/^Xiaomi\s+/, ""), isActive: true, sortOrder: 0 };
  if (s.startsWith("Redmi ")) return { brand: "Redmi", modelName: s.replace(/^Redmi\s+/, ""), isActive: true, sortOrder: 0 };
  if (s.startsWith("POCO ")) return { brand: "POCO", modelName: s.replace(/^POCO\s+/, ""), isActive: true, sortOrder: 0 };
  return { brand: "Apple", modelName: s, isActive: true, sortOrder: 0 };
};

const main = async (): Promise<void> => {
  const payloads = PHONE_MODELS.map(parse);
  await Promise.all(
    payloads.map((p) => addPhoneModel({ brand: p.brand, modelName: p.modelName, isActive: p.isActive, sortOrder: p.sortOrder }))
  );
  console.log(`Seeded ${payloads.length} phone models.`);
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
