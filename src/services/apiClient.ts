import axios, { AxiosError } from 'axios';
import type { OpenApiSummary } from '@/src/types/api';

export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/+$/, '') ||
  'http://127.0.0.1:8000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 6000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

const REQUIRED_PATHS = [
  '/learners',
  '/questions',
  '/learners/{id}/assessments',
  '/learners/{id}/profile',
  '/learners/{id}/recommendation',
  '/learners/{id}/misconceptions',
  '/learners/{id}/history',
];

/**
 * Queries FastAPI's OpenAPI specification (/openapi.json) to verify live server availability
 * and inspect whether the expected LearnerTwin endpoints are exposed.
 */
export async function inspectOpenApiSpec(): Promise<OpenApiSummary> {
  try {
    const response = await apiClient.get<{
      info?: { title?: string; version?: string };
      paths?: Record<string, unknown>;
    }>('/openapi.json', { timeout: 3500 });

    const data = response.data;
    if (!data || typeof data !== 'object' || !data.paths) {
      return {
        reachable: true,
        verified: false,
        paths: [],
        errorMessage: 'Server responded, but /openapi.json did not return an OpenAPI schema.',
      };
    }

    const availablePaths = Object.keys(data.paths);
    const hasCoreEndpoints = REQUIRED_PATHS.some((required) =>
      availablePaths.some((path) => path === required || path.replace(/\{[^}]+\}/g, '{id}') === required)
    );

    return {
      reachable: true,
      verified: hasCoreEndpoints,
      title: data.info?.title,
      version: data.info?.version,
      paths: availablePaths,
      errorMessage: hasCoreEndpoints
        ? undefined
        : 'Connected service OpenAPI schema does not match LearnerTwin endpoints.',
    };
  } catch (err) {
    const axiosErr = err as AxiosError;
    return {
      reachable: false,
      verified: false,
      paths: [],
      errorMessage:
        axiosErr.message || `Unable to reach FastAPI server at ${API_BASE_URL}`,
    };
  }
}

export function extractApiErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const detail = (err.response?.data as { detail?: string } | undefined)?.detail;
    if (typeof detail === 'string' && detail.trim()) {
      return detail;
    }
    return err.message || 'Network request to FastAPI failed.';
  }
  if (err instanceof Error) {
    return err.message;
  }
  return 'An unexpected error occurred.';
}
