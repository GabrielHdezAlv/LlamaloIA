/**
 * Knowledge Source interface for Base de Conocimientos
 */
export interface KnowledgeSource {
  id: string;
  userId: string;
  name: string;
  type: 'pdf' | 'web' | 'text';
  originalUrl?: string; // opcional
  fileName?: string; // opcional
  status: 'processing' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
  metadata: {
    size?: number; // opcional
    pageCount?: number; // opcional
    wordCount?: number; // opcional
    chunkCount: number;
  };
  tags: string[];
  isPublic: boolean;
}

/**
 * Request to create a new knowledge source
 */
export interface CreateKnowledgeSourceRequest {
  name: string;
  type: 'pdf' | 'web' | 'text';
  content?: string; // For text type
  url?: string; // For web type
  file?: File; // For PDF type (handled separately)
  tags?: string[];
  isPublic?: boolean;
}

/**
 * Response when creating a knowledge source
 */
export interface CreateKnowledgeSourceResponse {
  message: string;
  knowledgeSource: KnowledgeSource;
}

/**
 * Response when listing knowledge sources
 */
export interface ListKnowledgeSourcesResponse {
  knowledgeSources: KnowledgeSource[];
}

/**
 * Response when updating a knowledge source
 */
export interface UpdateKnowledgeSourceResponse {
  message: string;
  knowledgeSource: KnowledgeSource;
}

/**
 * Response when deleting a knowledge source
 */
export interface DeleteKnowledgeSourceResponse {
  message: string;
}

/**
 * Request to search in knowledge base
 */
export interface SearchKnowledgeBaseRequest {
  query: string;
  knowledgeSourceIds?: string[];
  limit?: number;
}

/**
 * Response when searching in knowledge base
 */
export interface SearchKnowledgeBaseResponse {
  results: {
    content: string;
    sourceId: string;
    sourceName: string;
    relevanceScore: number;
  }[];
  totalResults: number;
}

/**
 * Request to link knowledge sources to an agent
 */
export interface LinkKnowledgeSourcesToAgentRequest {
  knowledgeSourceIds: string[];
}

/**
 * Response when linking knowledge sources to an agent
 */
export interface LinkKnowledgeSourcesToAgentResponse {
  message: string;
  linkedSources: string[];
}

/**
 * Response when getting agent's knowledge sources
 */
export interface GetAgentKnowledgeSourcesResponse {
  knowledgeSources: KnowledgeSource[];
}
