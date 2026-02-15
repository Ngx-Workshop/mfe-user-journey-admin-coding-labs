import {
  ComparatorDto,
  LabEntity,
  LabVersionEntity,
  LabStatus,
  LabTestCaseDto,
} from '../models/coding-labs.models';

export function entityId(entity: {
  _id?: string;
  id?: string;
}): string {
  return entity._id ?? entity.id ?? '';
}

export function labStatus(lab: LabEntity): LabStatus {
  return (lab.status as LabStatus) ?? 'draft';
}

export function stringOrEmpty(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

export function strArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string');
}

export function safeComparator(
  comparator?: ComparatorDto
): ComparatorDto {
  return {
    kind: comparator?.kind ?? 'strictEqual',
    tolerance: comparator?.tolerance,
    normalizeWhitespace: comparator?.normalizeWhitespace ?? false,
    ignoreCase: comparator?.ignoreCase ?? false,
    customComparatorId: comparator?.customComparatorId,
  };
}

export function createDefaultIoTest(
  name = 'sample'
): LabTestCaseDto {
  return {
    name,
    kind: 'io',
    input: {},
    expected: {},
    comparator: {
      kind: 'deepEqual',
      normalizeWhitespace: false,
      ignoreCase: false,
    },
  };
}

export function newestFirst<T extends { createdAt?: string }>(
  rows: T[]
): T[] {
  return [...rows].sort((a, b) => {
    const aTs = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bTs = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return bTs - aTs;
  });
}

export function selectDraftVersion(
  lab: LabEntity,
  versions: LabVersionEntity[]
): LabVersionEntity | undefined {
  const draftId = lab.currentDraftVersionId;
  if (draftId) {
    const matched = versions.find((v) => entityId(v) === draftId);
    if (matched) return matched;
  }

  return versions.find((version) => Boolean(version.isDraft));
}
