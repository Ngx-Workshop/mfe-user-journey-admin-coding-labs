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
  parsed?: Record<string, any>;
} {
  const trimmed = value.trim();
  if (!trimmed) {
    return { ok: true, parsed: {} };
  }

  try {
    const parsed = JSON.parse(trimmed);
    if (parsed && typeof parsed === 'object') {
      return { ok: true, parsed: parsed as Record<string, any> };
    }
    return { ok: false };
  } catch {
    return { ok: false };
  }
}

export function formatJson(value: unknown): string {
  if (value === undefined) return '{}';
  try {
    return JSON.stringify(value ?? {}, null, 2);
  } catch {
    return '{}';
  }
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

export function ensureIoTestcase(test: LabTestCaseDto): LabTestCaseDto {
  return {
    ...test,
    kind: 'io',
    name: test.name || 'case',
    input: test.input ?? {},
    expected: test.expected ?? {},
    comparator: normalizeComparator(test.comparator),
  };
}
