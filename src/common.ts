export const DEFAULT_ASYNC_REQUEST_LIMIT = 30;

export function toFinite(input: number) {
  input = Number(input || 0);
  return Number.isFinite(input) ? input : 0;
}

export function isArray(input: any[]) {
  return input && Array.isArray(input) ? true : false;
}

export function isNotEmptyArray(input: any[]) {
  return isArray(input) && input.length;
}
