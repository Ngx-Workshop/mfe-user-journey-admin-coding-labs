import {
  ComparatorDto,
  LabTestCaseDto,
} from '../models/coding-labs.models';

export interface IoTestRowJsonErrors {
  inputJson?: string;
  expectedJson?: string;
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function tryParseJson(value: string): {
  ok: boolean;
  parsed?: any;
} {
  if (!value.trim()) return { ok: false };
  try {
    return { ok: true, parsed: JSON.parse(value) };
  } catch {
    return { ok: false };
  }
}

export function formatJson(value: unknown): string {
  return value === undefined ? '' : JSON.stringify(value, null, 2);
}

export function apiError(
  error: unknown,
  fallback = 'The request failed. Try again.'
): string {
  const e = error as {
    status?: number;
    error?: { message?: string | string[] };
  };
  if (e?.status === 0)
    return 'Cannot reach the coding labs service. Check that it is running locally.';
  const message = e?.error?.message;
  return Array.isArray(message)
    ? message.join(' · ')
    : message || fallback;
}

export function normalizeComparator(
  comparator?: ComparatorDto
): ComparatorDto {
  return {
    kind: comparator?.kind ?? 'deepEqual',
    tolerance: comparator?.tolerance,
    normalizeWhitespace: comparator?.normalizeWhitespace ?? false,
    ignoreCase: comparator?.ignoreCase ?? false,
    customComparatorId: comparator?.customComparatorId,
  };
}

export function ensureIoTestcase(
  test: LabTestCaseDto
): LabTestCaseDto {
  return {
    ...test,
    kind: 'io',
    name: test.name || 'case',
    input: test.input,
    expected: test.expected,
    comparator: normalizeComparator(test.comparator),
  };
}
