export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export function actionError(message: string, fieldErrors?: Record<string, string[]>): ActionResult<never> {
  return { ok: false, error: message, fieldErrors };
}
