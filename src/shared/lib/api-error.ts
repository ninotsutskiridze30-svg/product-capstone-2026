export async function getApiErrorMessage(response: Response) {
  try {
    const body = (await response.json()) as { error?: string };
    return body.error ?? "Request failed";
  } catch {
    return "Request failed";
  }
}

export function getMutationErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unexpected error";
}
