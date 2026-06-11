import { parseISO } from "date-fns";

const DEFAULT_BASE_URL = "http://localhost:3002";

function getBaseUrl() {
  return process.env.NEXT_PUBLIC_BASE_URL ?? DEFAULT_BASE_URL;
}

export function toServiceUrl(path: string) {
  if (typeof window === "undefined") {
    return `${getBaseUrl()}${path}`;
  }

  return path;
}

export async function fetchJson<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const response = await fetch(toServiceUrl(path), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    credentials: "include",
  });

  if (!response.ok) {
    let errorMessage = "Request failed";

    try {
      const body = (await response.json()) as { error?: string };
      errorMessage = body.error ?? errorMessage;
    } catch {
      errorMessage = response.statusText || errorMessage;
    }

    throw new Error(errorMessage);
  }

  return (await response.json()) as T;
}

export function parseIsoDate(value: string) {
  return parseISO(value);
}
