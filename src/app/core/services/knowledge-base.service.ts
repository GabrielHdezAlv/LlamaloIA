import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { Inject, PLATFORM_ID } from '@angular/core';
import {
  KnowledgeSource,
  CreateKnowledgeSourceRequest,
  CreateKnowledgeSourceResponse,
  ListKnowledgeSourcesResponse,
  UpdateKnowledgeSourceResponse,
  DeleteKnowledgeSourceResponse,
  SearchKnowledgeBaseRequest,
  SearchKnowledgeBaseResponse,
  LinkKnowledgeSourcesToAgentRequest,
  LinkKnowledgeSourcesToAgentResponse,
  GetAgentKnowledgeSourcesResponse,
} from '../../shared/models/knowledge-source.model';

@Injectable({
  providedIn: 'root',
})
export class KnowledgeBaseService {
  private readonly baseUrl =
    'https://llamaloiabackend-5294.onrender.com/knowledge-base';
  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: object,
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  // Método para obtener los encabezados de autenticación
  private getAuthHeaders(): HttpHeaders {
    let token = '';
    if (
      this.isBrowser &&
      typeof window !== 'undefined' &&
      window.localStorage
    ) {
      token = localStorage.getItem('token') || '';
    }

    return new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: '*/*',
      Authorization: `Bearer ${token}`,
    });
  }

  /**
   * Create a new knowledge source
   */
  createKnowledgeSource(
    request: CreateKnowledgeSourceRequest,
  ): Observable<CreateKnowledgeSourceResponse> {
    return this.http.post<CreateKnowledgeSourceResponse>(
      `${this.baseUrl}/sources`,
      request,
    );
  }

  /**
   * Upload a PDF file as knowledge source
   */
  uploadPdfKnowledgeSource(
    file: File,
    name?: string,
    tags?: string[],
    isPublic?: boolean,
  ): Observable<CreateKnowledgeSourceResponse> {
    const formData = new FormData();
    formData.append('file', file);
    if (name) formData.append('name', name);
    if (tags) formData.append('tags', JSON.stringify(tags));
    if (isPublic !== undefined)
      formData.append('isPublic', isPublic.toString());

    return this.http.post<CreateKnowledgeSourceResponse>(
      `${this.baseUrl}/sources/pdf`,
      formData,
    );
  }

  /**
   * Get all knowledge sources
   */
  getKnowledgeSources(): Observable<ListKnowledgeSourcesResponse> {
    return this.http.get<ListKnowledgeSourcesResponse>(
      `${this.baseUrl}/sources`,
      { headers: this.getAuthHeaders() },
    );
  }

  /**
   * Get a specific knowledge source by ID
   */
  getKnowledgeSource(id: string): Observable<KnowledgeSource> {
    return this.http.get<KnowledgeSource>(`${this.baseUrl}/sources/${id}`);
  }

  /**
   * Update a knowledge source
   */
  updateKnowledgeSource(
    id: string,
    request: Partial<CreateKnowledgeSourceRequest>,
  ): Observable<UpdateKnowledgeSourceResponse> {
    return this.http.put<UpdateKnowledgeSourceResponse>(
      `${this.baseUrl}/sources/${id}`,
      request,
    );
  }

  /**
   * Delete a knowledge source
   */
  deleteKnowledgeSource(id: string): Observable<DeleteKnowledgeSourceResponse> {
    return this.http.delete<DeleteKnowledgeSourceResponse>(
      `${this.baseUrl}/sources/${id}`,
    );
  }

  /**
   * Search in knowledge base
   */
  searchKnowledgeBase(
    request: SearchKnowledgeBaseRequest,
  ): Observable<SearchKnowledgeBaseResponse> {
    const params = new HttpParams()
      .set('query', request.query)
      .set('limit', (request.limit || 10).toString());

    if (request.knowledgeSourceIds && request.knowledgeSourceIds.length > 0) {
      request.knowledgeSourceIds.forEach((id) =>
        params.append('knowledgeSourceIds', id),
      );
    }

    return this.http.post<SearchKnowledgeBaseResponse>(
      `${this.baseUrl}/search`,
      request,
      { params },
    );
  }

  /**
   * Link knowledge sources to an agent
   */
  linkKnowledgeSourcesToAgent(
    agentId: number,
    request: LinkKnowledgeSourcesToAgentRequest,
  ): Observable<LinkKnowledgeSourcesToAgentResponse> {
    return this.http.post<LinkKnowledgeSourcesToAgentResponse>(
      `${this.baseUrl}/agents/${agentId}/sources`,
      request,
    );
  }

  /**
   * Get knowledge sources linked to an agent
   */
  getAgentKnowledgeSources(
    agentId: number,
  ): Observable<GetAgentKnowledgeSourcesResponse> {
    return this.http.get<GetAgentKnowledgeSourcesResponse>(
      `${this.baseUrl}/agents/${agentId}/sources`,
    );
  }

  /**
   * Get preview of a knowledge source
   */
  getKnowledgeSourcePreview(
    id: string,
  ): Observable<{ content: string; metadata: any }> {
    return this.http.get<{ content: string; metadata: any }>(
      `${this.baseUrl}/sources/${id}/preview`,
    );
  }

  /**
   * Unlink knowledge sources from an agent
   */
  unlinkKnowledgeSourcesFromAgent(
    agentId: number,
    knowledgeSourceIds: string[],
  ): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${this.baseUrl}/agents/${agentId}/sources`,
      {
        body: { knowledgeSourceIds },
      },
    );
  }
}
