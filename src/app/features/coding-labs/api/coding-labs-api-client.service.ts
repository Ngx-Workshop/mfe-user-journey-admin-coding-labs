import {
  HttpClient,
  HttpParams,
} from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
  CODING_LABS_ACTOR_ID,
  CODING_LABS_API_BASE_URL,
} from '../../../config/coding-labs.config';
import {
  CreateDraftVersionDto,
  CreateLabDto,
  LabEmbedEntity,
  LabEntity,
  LabVersionEntity,
  ListEmbedsQuery,
  ListLabsQuery,
  PublishVersionDto,
  UpdateDraftVersionDto,
  UpdateLabDto,
} from '../models/coding-labs.models';

@Injectable({ providedIn: 'root' })
export class CodingLabsApiClient {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(CODING_LABS_API_BASE_URL);
  private readonly actorId = inject(CODING_LABS_ACTOR_ID);

  listLabs(query: ListLabsQuery = {}): Observable<LabEntity[]> {
    return this.http.get<LabEntity[]>(`${this.baseUrl}/labs`, {
      params: buildHttpParams(query),
    });
  }

  getLab(labId: string): Observable<LabEntity> {
    return this.http.get<LabEntity>(`${this.baseUrl}/labs/${labId}`);
  }

  createLab(dto: CreateLabDto): Observable<LabEntity> {
    return this.http.post<LabEntity>(`${this.baseUrl}/labs`, dto);
  }

  updateLab(
    labId: string,
    dto: UpdateLabDto
  ): Observable<LabEntity> {
    return this.http.patch<LabEntity>(
      `${this.baseUrl}/labs/${labId}`,
      dto
    );
  }

  archiveLab(labId: string, archivedBy = this.actorId): Observable<void> {
    const params = new HttpParams().set('archivedBy', archivedBy);
    return this.http.delete<void>(`${this.baseUrl}/labs/${labId}`, {
      params,
    });
  }

  listVersions(labId: string): Observable<LabVersionEntity[]> {
    return this.http.get<LabVersionEntity[]>(
      `${this.baseUrl}/labs/${labId}/versions`
    );
  }

  getVersion(
    labId: string,
    versionId: string
  ): Observable<LabVersionEntity> {
    return this.http.get<LabVersionEntity>(
      `${this.baseUrl}/labs/${labId}/versions/${versionId}`
    );
  }

  createDraftVersion(
    labId: string,
    dto: CreateDraftVersionDto
  ): Observable<LabVersionEntity> {
    return this.http.post<LabVersionEntity>(
      `${this.baseUrl}/labs/${labId}/versions/draft`,
      dto
    );
  }

  updateDraftVersion(
    labId: string,
    versionId: string,
    dto: UpdateDraftVersionDto
  ): Observable<LabVersionEntity> {
    return this.http.patch<LabVersionEntity>(
      `${this.baseUrl}/labs/${labId}/versions/${versionId}`,
      dto
    );
  }

  publishVersion(
    labId: string,
    versionId: string,
    dto: PublishVersionDto
  ): Observable<LabVersionEntity> {
    return this.http.post<LabVersionEntity>(
      `${this.baseUrl}/labs/${labId}/versions/${versionId}/publish`,
      dto
    );
  }

  listEmbeds(query: ListEmbedsQuery = {}): Observable<LabEmbedEntity[]> {
    return this.http.get<LabEmbedEntity[]>(`${this.baseUrl}/embeds`, {
      params: buildHttpParams(query),
    });
  }
}

function buildHttpParams(
  value: object
): HttpParams {
  let params = new HttpParams();

  for (const [key, current] of Object.entries(
    value as Record<string, unknown>
  )) {
    if (
      current === null ||
      current === undefined ||
      current === ''
    ) {
      continue;
    }

    params = params.set(key, String(current));
  }

  return params;
}
