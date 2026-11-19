export const NOTES_CUSTOMER_FIELD_ID = "notes__customer";
export const CUSTOM_CATALOG_NOTE_PREFIX = "notes__catalog__";
export const NOTES_STEP_GROUP = "הערות";
export const MAX_CATALOG_NOTE_LENGTH = 4000;

export function isCustomCatalogNoteId(id: string): boolean {
  return id.startsWith(CUSTOM_CATALOG_NOTE_PREFIX);
}
