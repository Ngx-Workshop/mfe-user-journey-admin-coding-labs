import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
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
  VerificationDto,
} from '../models/coding-labs.models';

@Injectable({ providedIn: 'root' })
export class CodingLabsApiClient {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(CODING_LABS_API_BASE_URL);
  private readonly actorId = inject(CODING_LABS_ACTOR_ID);
  private readonly options = { withCredentials: true };

  listLabs(query: ListLabsQuery = {}) {
    return this.http.get<LabEntity[]>(this.baseUrl + '/labs', {
      ...this.options,
      params: buildHttpParams(query),
    });
  }
  getLab(id: string) {
    return this.http.get<LabEntity>(
      this.baseUrl + '/labs/' + id,
      this.options
    );
  }
  createLab(dto: CreateLabDto) {
    return this.http.post<LabEntity>(
      this.baseUrl + '/labs',
      dto,
      this.options
    );
  }
  updateLab(id: string, dto: UpdateLabDto) {
    return this.http.patch<LabEntity>(
      this.baseUrl + '/labs/' + id,
      dto,
      this.options
    );
  }
  archiveLab(id: string, archivedBy = this.actorId) {
    return this.http.delete<void>(this.baseUrl + '/labs/' + id, {
      ...this.options,
      params: new HttpParams().set('archivedBy', archivedBy),
    });
  }
  listVersions(id: string) {
    return this.http.get<LabVersionEntity[]>(
      this.baseUrl + '/labs/' + id + '/versions',
      this.options
    );
  }
  getVersion(id: string, version: string) {
    return this.http.get<LabVersionEntity>(
      this.versionUrl(id, version),
      this.options
    );
  }
  createDraftVersion(id: string, dto: CreateDraftVersionDto) {
    return this.http.post<LabVersionEntity>(
      this.versionUrl(id, 'draft'),
      dto,
      this.options
    );
  }
  updateDraftVersion(
    id: string,
    version: string,
    dto: UpdateDraftVersionDto
  ) {
    return this.http.patch<LabVersionEntity>(
      this.versionUrl(id, version),
      dto,
      this.options
    );
  }
  verifyVersion(id: string, version: string) {
    return this.http.post<VerificationDto>(
      this.versionUrl(id, version) + '/verify',
      {},
      this.options
    );
  }
  publishVersion(
    id: string,
    version: string,
    dto: PublishVersionDto
  ) {
    return this.http.post<LabVersionEntity>(
      this.versionUrl(id, version) + '/publish',
      dto,
      this.options
    );
  }
  listEmbeds(query: ListEmbedsQuery = {}) {
    return this.http.get<LabEmbedEntity[]>(this.baseUrl + '/embeds', {
      ...this.options,
      params: buildHttpParams(query),
    });
  }
  private versionUrl(id: string, version: string) {
    return this.baseUrl + '/labs/' + id + '/versions/' + version;
  }
}
function buildHttpParams(value: object): HttpParams {
  let params = new HttpParams();
  for (const [key, current] of Object.entries(value)) {
    if (current !== null && current !== undefined && current !== '')
      params = params.set(key, String(current));
  }
  return params;
}
