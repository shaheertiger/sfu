import 'server-only';
import type { Workspace } from './auth';
import { HttpError } from './http-error';

/** Owners, editors and API keys can change workspace automations; members can only look. */
export function requireEditor(workspace: Workspace) {
  if (!['owner', 'editor', 'api'].includes(workspace.role)) throw new HttpError(403, 'Only the workspace owner or an editor can change this');
}
