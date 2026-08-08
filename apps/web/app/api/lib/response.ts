export function apiSuccess<T>(data: T) {
  return { success: true, data };
}

export function apiError(message: string, status = 400) {
  return {
    success: false,
    error: message,
    status,
  };
}
