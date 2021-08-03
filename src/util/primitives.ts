import obj from 'object-path';

type Path = string | Array<string | number> | undefined;

function num(input: unknown, path: Path = undefined, _default = 0): number {
  if (path) {
    input = obj.get(input as Record<string, unknown>, path);
  }

  if (typeof input !== 'string' && typeof input !== 'number' && typeof input !== 'bigint') {
    return _default;
  }

  const value = Number.parseFloat(input as string);
  return Number.isFinite(value) ? value : _default;
}

function str(input: unknown, path: Path = undefined, _default = ''): string {
  if (path) {
    input = obj.get(input as Record<string, unknown>, path);
  }

  if (typeof input !== 'string' && typeof input !== 'number' && typeof input !== 'bigint') {
    return _default;
  }

  return input.toString();
}

function bool(input: unknown, path: Path = undefined): boolean {
  if (path) {
    input = obj.get(input as Record<string, unknown>, path);
  }

  input = str(input).toLowerCase();

  switch (input) {
    case '1':
    case 'true':
    case 'on':
    case 'enabled': {
      return true;
    }
  }

  return false;
}

function arr(input: unknown, path: Path = undefined, _default = []): Array<unknown> {
  if (path) {
    input = obj.get(input as Record<string, unknown>, path);
  }

  return Array.isArray(input) ? input : _default;
}

function isEmptyArray(input: unknown): boolean {
  return !Array.isArray(input) || !input?.length ? true : false;
}

export { num, str, bool, arr, isEmptyArray };
