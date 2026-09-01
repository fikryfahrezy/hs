export class ApiError extends Error {
  public constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function requestJson(path: string): Promise<unknown> {
  const response = await fetch(path, {
    credentials: "same-origin",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new ApiError("The request could not be completed.", response.status);
  }

  return response.json() as Promise<unknown>;
}
