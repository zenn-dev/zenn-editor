export type ValidationError = {
  message: string;
  isCritical: boolean;
  detailUrl?: string;
  detailUrlText?: string;
};
