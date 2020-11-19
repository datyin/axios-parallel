export default (input: unknown): number => {
  const num = parseFloat(input as string);

  if (isNaN(num)) {
    return 0;
  }

  return num;
};
