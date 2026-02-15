import {
  ComparatorDto,
  CreateDraftVersionDto,
  CreateLabDto,
  HandsOnLabEmbedMongo,
  HandsOnLabMongo,
  HandsOnLabVersionMongo,
  LabRunnerConfigDto,
  LabTestCaseDto,
  PublishVersionDto,
  ReferenceSolutionDto,
  UpdateDraftVersionDto,
  UpdateLabDto,
} from '@tmdjr/coding-labs-contracts';

export type {
  ComparatorDto,
  CreateDraftVersionDto,
  CreateLabDto,
  HandsOnLabEmbedMongo,
  HandsOnLabMongo,
  HandsOnLabVersionMongo,
  LabRunnerConfigDto,
  LabTestCaseDto,
  PublishVersionDto,
  ReferenceSolutionDto,
  UpdateDraftVersionDto,
  UpdateLabDto,
};

export type LabStatus = 'draft' | 'published' | 'archived';
export type LabDifficulty = 'intro' | 'easy' | 'medium' | 'hard';
export type LabLanguage = 'typescript' | 'javascript';

export type LabEntity = HandsOnLabMongo & {
  _id?: string;
  id?: string;
  workshopId?: string;
  workshopDocumentGroupId?: string;
  slug?: string;
  title?: string;
  summary?: string;
  tags?: string[];
  difficulty?: LabDifficulty;
  estimatedMinutes?: number;
  status?: LabStatus;
  currentDraftVersionId?: string;
  latestPublishedVersionId?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type LabVersionEntity = HandsOnLabVersionMongo & {
  _id?: string;
  id?: string;
  labId?: string;
  versionNumber?: number;
  isDraft?: boolean;
  language?: LabLanguage;
  promptMarkdown?: string;
  hints?: string[];
  starterCode?: string;
  referenceSolution?: ReferenceSolutionDto;
  sampleTests?: LabTestCaseDto[];
  hiddenTests?: LabTestCaseDto[];
  runner?: LabRunnerConfigDto;
  contentHash?: string;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
};

export type LabEmbedEntity = HandsOnLabEmbedMongo & {
  _id?: string;
  id?: string;
  labId?: string;
  workshopId?: string;
  workshopDocumentId?: string;
  blockId?: string;
  blockType?: 'handsOnLab';
  pinnedVersionId?: string;
  createdAt?: string;
  updatedAt?: string;
};

export interface ListLabsQuery {
  workshopId?: string;
  status?: string;
  tag?: string;
  q?: string;
  limit?: number;
  skip?: number;
}

export interface ListEmbedsQuery {
  labId?: string;
  workshopId?: string;
  workshopDocumentId?: string;
}
