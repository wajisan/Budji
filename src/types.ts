export type Bill = {
  label: string;
  value: number;
};

export type BudgetTable = {
  name: string;
  bills: Bill[];
  countMe: boolean;
};
