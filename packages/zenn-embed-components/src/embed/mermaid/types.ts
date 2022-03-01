export type ErrorContainer = {
  hasError: boolean;
  message: string;
};

export type ValidateResult = {
  charLimitOver: ErrorContainer;
  chainingOfLinksOver: ErrorContainer;
};
