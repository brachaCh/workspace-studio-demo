import type { FormStepId } from "@/lib/db/payload";
import type { SelectionState } from "@/lib/selection";

const STORE_KEY = "workspace-studio-demo:records:v1";

export type SaveBody = SelectionState & {
  currentStep: FormStepId;
};

export type SaveResponse =
  | {
      ok: true;
      characterizationId: string;
      customerId: string;
      savedAt: string;
    }
  | { ok: false; message: string; status?: number };

export type LoadResponse =
  | {
      ok: true;
      found: true;
      characterizationId: string;
      customerId: string;
      status: "draft" | "submitted";
      currentStep: FormStepId;
      updatedAt: string;
      state: SelectionState;
    }
  | { ok: true; found: false }
  | { ok: false; message: string; status?: number };

export type SubmitResponse =
  | { ok: true; requestId: string }
  | { ok: false; message: string; status?: number };

export type SubmitBody = Omit<SaveBody, "currentStep">;

type StoredRecord = {
  characterizationId: string;
  customerId: string;
  status: "draft" | "submitted";
  currentStep: FormStepId;
  updatedAt: string;
  state: SelectionState;
};

function emailOf(fields: Record<string, unknown>): string {
  const email = fields.contact__email;
  return typeof email === "string" ? email.trim().toLowerCase() : "";
}

function readAll(): Record<string, StoredRecord> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, StoredRecord>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeAll(all: Record<string, StoredRecord>) {
  window.localStorage.setItem(STORE_KEY, JSON.stringify(all));
}

export async function saveCharacterization(body: SaveBody): Promise<SaveResponse> {
  const email = emailOf(body.fields);
  if (!email) return { ok: false, message: "יש למלא מייל לפני שמירה" };

  const all = readAll();
  const prev = all[email];
  const id = prev?.characterizationId ?? crypto.randomUUID();
  const savedAt = new Date().toISOString();
  const { currentStep, ...state } = body;
  all[email] = {
    characterizationId: id,
    customerId: id,
    status: prev?.status ?? "draft",
    currentStep,
    updatedAt: savedAt,
    state,
  };
  writeAll(all);
  return { ok: true, characterizationId: id, customerId: id, savedAt };
}

export async function loadCharacterization(email: string): Promise<LoadResponse> {
  const entry = readAll()[email.trim().toLowerCase()];
  if (!entry) return { ok: true, found: false };
  return { ok: true, found: true, ...entry };
}

export async function submitCharacterization(body: SubmitBody): Promise<SubmitResponse> {
  const saved = await saveCharacterization({ ...body, currentStep: "notes" });
  if (!saved.ok) return { ok: false, message: saved.message, status: saved.status };
  const email = emailOf(body.fields);
  const all = readAll();
  const entry = all[email];
  if (entry) {
    entry.status = "submitted";
    writeAll(all);
  }
  return { ok: true, requestId: saved.characterizationId };
}
