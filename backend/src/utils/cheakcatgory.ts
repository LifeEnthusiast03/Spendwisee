const expenseCatagorires = [
  "FOOD",
  "TRANSPORT",
  "RENT",
  "SHOPPING",
  "ENTERTAINMENT",
  "BILLS",
  "OTHER",
] as const;

const incomeCatagorires = [
  "SALARY",
  "FREELANCE",
  "BUSINESS",
  "INVESTMENT",
  "GIFT",
  "OTHER",
] as const;

export type ExpenseCatagory = (typeof expenseCatagorires)[number];
export type IncomeCatagory = (typeof incomeCatagorires)[number];

export const validExpenseCatagory = (catagory: string): boolean => {
  if (typeof catagory !== "string" || catagory.trim().length === 0) {
    return false;
  }

  const normalizedCatagory = catagory.trim().toUpperCase();
  return expenseCatagorires.includes(normalizedCatagory as ExpenseCatagory);
};

export const validIncomeCatagory = (catagory: string): boolean => {
  if (typeof catagory !== "string" || catagory.trim().length === 0) {
    return false;
  }

  const normalizedCatagory = catagory.trim().toUpperCase();
  return incomeCatagorires.includes(normalizedCatagory as IncomeCatagory);
};

export const validCatagory = validExpenseCatagory;