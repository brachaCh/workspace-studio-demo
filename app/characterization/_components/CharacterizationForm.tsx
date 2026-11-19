"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  type Feature,
  type Field,
  businessFields,
  contactFields,
  features,
  fields,
  tabs,
} from "@/lib/schema";
import {
  cleanSubmittedContactFields,
  editableContactFieldLabel,
  isCustomContactFieldId,
  newCustomContactField,
} from "@/lib/contact-fields";
import { editableBusinessFieldLabel, isCustomBusinessFieldId } from "@/lib/business-fields";
import { CUSTOM_DASHBOARD_TAB_PREFIX } from "@/lib/dashboard-tabs";
import {
  cleanSubmittedBusinessFields,
  cleanSubmittedFields,
  groupFeaturesByTab,
  groupFieldsByFeature,
  mergeDashboardTabs,
  mergeModuleFeatures,
  missingRequiredFields,
  moduleAllowsCustomFeatures,
  newCustomBusinessField,
  newCustomDashboardTab,
  newCustomModuleFeature,
  newCustomModuleField,
  normalizeSelectionState,
  pruneSelectionsForTabs,
  toggleInList,
  visibleFields,
  type SelectionState,
} from "@/lib/selection";
import {
  loadCharacterization,
  saveCharacterization,
  submitCharacterization,
} from "@/lib/client/characterization-api";
import { isValidMailRecipient } from "@/lib/email-format";
import { effectiveCustomArrays } from "@/lib/catalog-custom";
import {
  customFieldsForFeature,
  editableModuleFieldLabel,
  isCustomModuleFieldId,
  mergeModuleFieldLabels,
} from "@/lib/custom-fields";
import {
  FIELD_ORDER_BUSINESS,
  FIELD_ORDER_CONTACT,
  FIELD_ORDER_GENERAL,
  fieldOrderSectionForFeature,
  insertFieldRelative,
  removeFieldFromOrder,
  resolveFieldOrder,
} from "@/lib/field-order";
import { upsertLabel } from "@/lib/label-override";
import type {
  CustomBusinessField,
  CustomContactField,
  CustomDashboardTab,
  CustomModuleFeature,
  CustomModuleField,
  Tab,
} from "@/lib/schema";
import { Button, CardButton, Section } from "@/app/characterization/_components/ui";
import { DashboardDesignStep } from "@/app/characterization/_components/DashboardDesignStep";
import { NotesStepSection } from "@/app/characterization/_components/NotesStepSection";
import { DemoPreviewModal } from "@/app/characterization/_components/demos/DemoPreviewModal";
import { hasDemo, getDemoMini } from "@/app/characterization/_components/demos/registry";
import { NOTES_CUSTOMER_FIELD_ID } from "@/lib/notes";
import {
  accentForTab,
  accentStyles,
  stepAccents,
  type FormStepId,
  type AccentId,
} from "@/lib/theme";
import { demoCatalog } from "@/lib/catalog";

const STORAGE_KEY = "characterization-form:v6";
const STEP_STORAGE_KEY = "characterization-form:step:v1";
const SESSION_EMAIL_KEY = "characterization-form:session-email:v1";
const CUSTOMER_ID_KEY = "characterization-form:customer-id";
const SAMPLE_EMAIL = "noa.barak@example.com";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function contactEmailFromFields(fields: Record<string, unknown>): string {
  const email = fields.contact__email;
  return typeof email === "string" ? normalizeEmail(email) : "";
}

function draftStorageKey(email: string): string {
  return `${STORAGE_KEY}:${normalizeEmail(email)}`;
}

function stepStorageKey(email: string): string {
  return `${STEP_STORAGE_KEY}:${normalizeEmail(email)}`;
}

function customerIdKey(email: string): string {
  return `${CUSTOMER_ID_KEY}:${normalizeEmail(email)}`;
}

function persistSessionId(email: string, characterizationId: string) {
  const normalized = normalizeEmail(email);
  window.localStorage.setItem(SESSION_EMAIL_KEY, normalized);
  window.localStorage.setItem(customerIdKey(normalized), characterizationId);
}

function readSessionId(email: string): string | null {
  return window.localStorage.getItem(customerIdKey(normalizeEmail(email)));
}

function clearSessionId(email?: string) {
  if (email) {
    window.localStorage.removeItem(customerIdKey(normalizeEmail(email)));
    return;
  }
  window.localStorage.removeItem(CUSTOMER_ID_KEY);
}

function parseStoredStep(raw: string | null): StepId {
  if (raw === "contact" || raw === "business" || raw === "design" || raw === "notes") return raw;
  const n = Number(raw);
  if (n === 1 || n === 2 || n === 3) return n;
  return "contact";
}

function clearDraftForEmail(email: string) {
  const normalized = normalizeEmail(email);
  window.localStorage.removeItem(draftStorageKey(normalized));
  window.localStorage.removeItem(stepStorageKey(normalized));
}

function removeLegacyGlobalDraftKeys() {
  window.localStorage.removeItem(STORAGE_KEY);
  window.localStorage.removeItem(STEP_STORAGE_KEY);
}

type StepId = FormStepId;

type SaveStatus =
  | { kind: "idle" }
  | { kind: "saving" }
  | { kind: "saved"; at: string }
  | { kind: "error"; message: string };

function stepHeaderLabel(step: StepId): string {
  if (step === "contact") return "פרטי הלקוח";
  if (step === "business") return "אפיון העסק";
  if (step === 1) return "על הדשבורד";
  if (step === "design") return "דשבורד 2";
  if (step === 2) return "פיצ׳רים";
  if (step === 3) return "שדות";
  if (step === "notes") return "הערות";
  return "אפיון";
}

function emptyState(): SelectionState {
  return {
    tabs: [],
    features: [],
    fields: {},
    fieldOrder: {},
    designLayout: {},
    customBusinessFields: [],
    customContactFields: [],
    customDashboardTabs: [],
    customModuleFeatures: [],
    customModuleFields: [],
  };
}

function sampleDemoState(): SelectionState {
  const seeded = emptyState();
  seeded.tabs = ["dashboard", "tasks", "projects", "customers", "finance"];
  seeded.fields = {
    contact__organization_name: "סטודיו הדגמה",
    contact__client_name: "נועה ברק",
    contact__email: SAMPLE_EMAIL,
    contact__phone: "050-0000000",
  };
  return seeded;
}

type StoredSession = {
  state: SelectionState;
  step: StepId;
  characterizationId: string | null;
  sessionEmail: string | null;
};

function readStoredSession(): StoredSession {
  const empty: StoredSession = {
    state: emptyState(),
    step: "contact",
    characterizationId: null,
    sessionEmail: null,
  };
  if (typeof window === "undefined") return empty;

  removeLegacyGlobalDraftKeys();
  clearSessionId();

  const sessionEmail = window.localStorage.getItem(SESSION_EMAIL_KEY);
  if (!sessionEmail) return empty;

  let restoredState = emptyState();
  const saved = window.localStorage.getItem(draftStorageKey(sessionEmail));
  if (saved) {
    try {
      const parsed = normalizeSelectionState(JSON.parse(saved) as Partial<SelectionState>);
      if (draftBelongsToEmail(parsed, sessionEmail)) {
        restoredState = parsed;
      } else {
        clearDraftForEmail(sessionEmail);
      }
    } catch {
      // ignore
    }
  }

  return {
    state: restoredState,
    step: parseStoredStep(window.localStorage.getItem(stepStorageKey(sessionEmail))),
    characterizationId: readSessionId(sessionEmail),
    sessionEmail,
  };
}

/** Combine the customer's own items/** Combine the customer's own items with shared catalog items, deduped by id. */
function unionById<T extends { id: string }>(mine: T[], extra: T[]): T[] {
  const seen = new Set(mine.map((m) => m.id));
  return [...mine, ...extra.filter((e) => !seen.has(e.id))];
}

function draftBelongsToEmail(draft: SelectionState, email: string): boolean {
  const draftEmail = contactEmailFromFields(draft.fields);
  return Boolean(draftEmail) && draftEmail === normalizeEmail(email);
}

function readValidatedDraft(email: string): SelectionState | null {
  const raw = window.localStorage.getItem(draftStorageKey(email));
  if (!raw) return null;
  try {
    const parsed = normalizeSelectionState(JSON.parse(raw) as Partial<SelectionState>);
    if (!draftBelongsToEmail(parsed, email)) {
      clearDraftForEmail(email);
      return null;
    }
    return parsed;
  } catch {
    clearDraftForEmail(email);
    return null;
  }
}

export function CharacterizationForm() {
  const [step, setStep] = useState<StepId>("contact");
  const [activeModuleTab, setActiveModuleTab] = useState(tabs[0]?.id ?? "dashboard");
  const [state, setState] = useState<SelectionState>(emptyState);
  const [submitting, setSubmitting] = useState(false);
  const [missing, setMissing] = useState<Field[]>([]);
  const [contactMissing, setContactMissing] = useState<Field[]>([]);
  const [submitResult, setSubmitResult] = useState<
    | { ok: true; requestId: string }
    | { ok: false; message: string }
    | null
  >(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>({ kind: "idle" });
  const catalog = demoCatalog;
  const [loadingFromDb, setLoadingFromDb] = useState(false);
  const [loadedNotice, setLoadedNotice] = useState<string | null>(null);
  const [characterizationId, setCharacterizationId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [demoTabId, setDemoTabId] = useState<string | null>(null);
  const saveMutexRef = useRef<Promise<boolean>>(Promise.resolve(true));
  const stepRef = useRef(step);
  const suppressAutoSaveRef = useRef(true);
  const autoSaveTimerRef = useRef<number | null>(null);
  const sessionEmailRef = useRef<string | null>(null);
  const stateRef = useRef(state);
  const catalogRef = useRef(catalog);
  const saveToDbRef = useRef<
    (currentStep: StepId, options?: { silent?: boolean }) => Promise<boolean>
  >(() => Promise.resolve(true));

  useEffect(() => {
    stepRef.current = step;
  }, [step]);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    catalogRef.current = catalog;
  }, [catalog]);

  useLayoutEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- restore client session before paint */
    let cancelled = false;

    const urlParams = new URLSearchParams(window.location.search);
    const urlEmailRaw = urlParams.get("email");
    const urlEmail =
      typeof urlEmailRaw === "string" && urlEmailRaw.includes("@")
        ? normalizeEmail(urlEmailRaw)
        : "";

    if (urlParams.get("sample") === "1") {
      window.history.replaceState({}, "", "/characterization");
      const existing = readValidatedDraft(SAMPLE_EMAIL);
      if (existing) {
        setState(existing);
        setStep(parseStoredStep(window.localStorage.getItem(stepStorageKey(SAMPLE_EMAIL))));
        setCharacterizationId(readSessionId(SAMPLE_EMAIL));
      } else {
        setState(sampleDemoState());
        setStep(1);
        setActiveModuleTab("dashboard");
        setCharacterizationId(null);
      }
      sessionEmailRef.current = SAMPLE_EMAIL;
      window.localStorage.setItem(SESSION_EMAIL_KEY, SAMPLE_EMAIL);
      suppressAutoSaveRef.current = false;
      setHydrated(true);
      return () => {
        cancelled = true;
      };
    }

    if (urlEmail) {
      const seeded = emptyState();
      seeded.fields = { ...seeded.fields, contact__email: urlEmail };
      setState(seeded);
      setStep("contact");
      setCharacterizationId(null);
      sessionEmailRef.current = urlEmail;
      window.localStorage.setItem(SESSION_EMAIL_KEY, urlEmail);
      window.history.replaceState({}, "", "/characterization");

      void (async () => {
        const result = await loadCharacterization(urlEmail);
        if (cancelled) return;
        if (!result.ok) {
          setSaveStatus({ kind: "error", message: result.message });
          suppressAutoSaveRef.current = false;
          setHydrated(true);
          return;
        }
        if (!result.found) {
          suppressAutoSaveRef.current = false;
          setHydrated(true);
          return;
        }
        await applyRemoteLoad(result, { restoreStep: true });
        setHydrated(true);
      })();

      return () => {
        cancelled = true;
      };
    }

    const session = readStoredSession();
    setState(session.state);
    setStep(session.step);
    setCharacterizationId(session.characterizationId);
    sessionEmailRef.current = session.sessionEmail;

    const email = contactEmailFromFields(session.state.fields);
    if (!email || !email.includes("@")) {
      suppressAutoSaveRef.current = false;
      setHydrated(true);
      return () => {
        cancelled = true;
      };
    }

    void (async () => {
      const result = await loadCharacterization(email);
      if (cancelled) return;
      if (contactEmailFromFields(stateRef.current.fields) !== email) {
        suppressAutoSaveRef.current = false;
        setHydrated(true);
        return;
      }
      if (!result.ok) {
        setSaveStatus({ kind: "error", message: result.message });
        setHydrated(true);
        return;
      }
      if (!result.found) {
        suppressAutoSaveRef.current = false;
        setHydrated(true);
        return;
      }

      await applyRemoteLoad(result);
      setHydrated(true);
    })();

    return () => {
      cancelled = true;
    };
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const email = contactEmailFromFields(state.fields);
    if (!email || email !== sessionEmailRef.current) return;
    window.localStorage.setItem(SESSION_EMAIL_KEY, email);
    window.localStorage.setItem(stepStorageKey(email), String(step));
  }, [step, hydrated, state.fields]);

  useEffect(() => {
    if (!hydrated) return;
    const email = contactEmailFromFields(state.fields);
    if (!email || email !== sessionEmailRef.current) return;
    window.localStorage.setItem(SESSION_EMAIL_KEY, email);
    window.localStorage.setItem(draftStorageKey(email), JSON.stringify(state));
  }, [state, hydrated]);

  // Auto-save in this browser after changes (debounced)
  useEffect(() => {
    if (!hydrated || suppressAutoSaveRef.current) return;

    const email = contactEmailFromFields(state.fields);
    if (!email || email !== sessionEmailRef.current) return;

    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = window.setTimeout(() => {
      void saveToDbRef.current(stepRef.current, { silent: true });
    }, 1000);

    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [state, hydrated, step]);



  const effectiveActiveModuleTab = useMemo(() => {
    if (!state.tabs.length) return activeModuleTab;
    return state.tabs.includes(activeModuleTab) ? activeModuleTab : state.tabs[0];
  }, [state.tabs, activeModuleTab]);

  const allCustomDashboardTabs = useMemo(
    () => unionById(state.customDashboardTabs, catalog.dashboardTabs),
    [state.customDashboardTabs, catalog.dashboardTabs],
  );
  const allCustomModuleFeatures = useMemo(
    () => unionById(state.customModuleFeatures, catalog.moduleFeatures),
    [state.customModuleFeatures, catalog.moduleFeatures],
  );
  const allCustomModuleFields = useMemo(
    () => unionById(state.customModuleFields, catalog.moduleFields),
    [state.customModuleFields, catalog.moduleFields],
  );
  const allCustomContactFields = useMemo(
    () => unionById(state.customContactFields, catalog.contactFields),
    [state.customContactFields, catalog.contactFields],
  );
  const allCustomBusinessFields = useMemo(
    () => unionById(state.customBusinessFields, catalog.businessFields),
    [state.customBusinessFields, catalog.businessFields],
  );

  const catalogTabIds = useMemo(
    () => new Set(catalog.dashboardTabs.map((t) => t.id)),
    [catalog.dashboardTabs],
  );
  const catalogBusinessIds = useMemo(
    () => new Set(catalog.businessFields.map((f) => f.id)),
    [catalog.businessFields],
  );
  const catalogContactIds = useMemo(
    () => new Set(catalog.contactFields.map((f) => f.id)),
    [catalog.contactFields],
  );

  const dashboardModules = useMemo(
    () => mergeDashboardTabs(tabs, allCustomDashboardTabs),
    [allCustomDashboardTabs],
  );
  const selectedDashboardItems = useMemo(() => {
    const byId = new Map(dashboardModules.map((t) => [t.id, t]));
    return state.tabs
      .map((id) => byId.get(id))
      .filter((t): t is Tab => Boolean(t));
  }, [dashboardModules, state.tabs]);
  const allFeatures = useMemo(
    () => mergeModuleFeatures(features, allCustomModuleFeatures),
    [allCustomModuleFeatures],
  );

  const relevantFields = visibleFields(fields, {
    ...state,
    customModuleFields: allCustomModuleFields,
  });
  const relevantFieldsWithLabels = useMemo(
    () => mergeModuleFieldLabels(relevantFields, allCustomModuleFields),
    [relevantFields, allCustomModuleFields],
  );
  const featureGroups = groupFeaturesByTab(dashboardModules, allFeatures, state.tabs, {
    includeEmptyTabs: true,
  });
  const activeFeatureGroup = featureGroups.find((g) => g.tab.id === effectiveActiveModuleTab);
  const activeCustomModuleFeatures = state.customModuleFeatures.filter(
    (f) => f.tabId === effectiveActiveModuleTab,
  );
  const myDashboardTabs = state.customDashboardTabs.filter(
    (t) => !catalogTabIds.has(t.id),
  );
  const myBusinessFields = state.customBusinessFields.filter(
    (f) => isCustomBusinessFieldId(f.id) && !catalogBusinessIds.has(f.id),
  );
  const myContactFields = state.customContactFields.filter(
    (f) => isCustomContactFieldId(f.id) && !catalogContactIds.has(f.id),
  );
  const catalogBusinessFieldDefs: Field[] = useMemo(
    () =>
      catalog.businessFields
        .filter((f) => isCustomBusinessFieldId(f.id))
        .map((f) => ({
          id: f.id,
          type: "textarea" as const,
          label: editableBusinessFieldLabel(f.id, allCustomBusinessFields, businessFields),
        })),
    [catalog.businessFields, allCustomBusinessFields],
  );
  const catalogOnlyDashboardTabs = useMemo(
    () => catalog.dashboardTabs.filter((t) => t.id.startsWith(CUSTOM_DASHBOARD_TAB_PREFIX)),
    [catalog.dashboardTabs],
  );
  const catalogOnlyContactFields = useMemo(
    () => catalog.contactFields.filter((f) => isCustomContactFieldId(f.id)),
    [catalog.contactFields],
  );
  const contactSectionFieldIds = useMemo(() => {
    const ids = contactFields.map((f) => f.id);
    for (const f of catalogOnlyContactFields) {
      if (!ids.includes(f.id)) ids.push(f.id);
    }
    for (const f of myContactFields) {
      if (!ids.includes(f.id)) ids.push(f.id);
    }
    return ids;
  }, [catalogOnlyContactFields, myContactFields]);
  const orderedContactFieldIds = useMemo(
    () => resolveFieldOrder(state.fieldOrder[FIELD_ORDER_CONTACT], contactSectionFieldIds),
    [state.fieldOrder, contactSectionFieldIds],
  );
  const businessSectionFieldIds = useMemo(() => {
    const ids = businessFields.map((f) => f.id);
    for (const f of catalogBusinessFieldDefs) {
      if (!ids.includes(f.id)) ids.push(f.id);
    }
    for (const f of myBusinessFields) {
      if (!ids.includes(f.id)) ids.push(f.id);
    }
    return ids;
  }, [catalogBusinessFieldDefs, myBusinessFields]);
  const orderedBusinessFieldIds = useMemo(
    () => resolveFieldOrder(state.fieldOrder[FIELD_ORDER_BUSINESS], businessSectionFieldIds),
    [state.fieldOrder, businessSectionFieldIds],
  );
  const fieldGroups = groupFieldsByFeature(
    relevantFieldsWithLabels,
    allFeatures,
    state.features,
  );
  function scheduleAutoSave() {
    window.setTimeout(() => {
      void saveToDb(stepRef.current, { silent: true });
    }, 150);
  }

  function onToggleTab(tabId: string) {
    setActiveModuleTab(tabId);
    setState((prev) =>
      pruneSelectionsForTabs(
        { ...prev, tabs: toggleInList(prev.tabs, tabId) },
        allFeatures,
      ),
    );
    scheduleAutoSave();
  }

  function onToggleFeature(featureId: string) {
    const feature = allFeatures.find((f) => f.id === featureId);
    setState((prev) => {
      const nextFeatures = toggleInList(prev.features, featureId);
      const nextTabs =
        feature && !prev.tabs.includes(feature.tabId)
          ? [...prev.tabs, feature.tabId]
          : prev.tabs;
      return pruneSelectionsForTabs(
        { ...prev, tabs: nextTabs, features: nextFeatures },
        allFeatures,
      );
    });
    scheduleAutoSave();
  }

  function onFieldChange(fieldId: string, value: unknown) {
    if (fieldId === "contact__email") {
      onContactEmailChange(value);
      return;
    }
    setState((prev) => ({ ...prev, fields: { ...prev.fields, [fieldId]: value } }));
  }

  function onContactEmailChange(value: unknown) {
    const raw = typeof value === "string" ? value : "";
    setState((prev) => ({ ...prev, fields: { ...prev.fields, contact__email: raw } }));
  }

  function onDashboardTabLabelChange(tabId: string, label: string) {
    setState((prev) => ({
      ...prev,
      customDashboardTabs: upsertLabel(prev.customDashboardTabs, { id: tabId, label }),
    }));
    scheduleAutoSave();
  }

  function onDesignLayoutChange(layout: SelectionState["designLayout"]) {
    setState((prev) => ({ ...prev, designLayout: layout }));
    scheduleAutoSave();
  }

  function onAddCustomDashboardTab() {
    const custom = newCustomDashboardTab();
    setState((prev) => ({
      ...prev,
      customDashboardTabs: [...prev.customDashboardTabs, custom],
      tabs: prev.tabs.includes(custom.id) ? prev.tabs : [...prev.tabs, custom.id],
    }));
    setActiveModuleTab(custom.id);
    scheduleAutoSave();
  }

  function onRemoveCustomDashboardTab(tabId: string) {
    setState((prev) =>
      pruneSelectionsForTabs(
        {
          ...prev,
          tabs: prev.tabs.filter((id) => id !== tabId),
          customDashboardTabs: prev.customDashboardTabs.filter((t) => t.id !== tabId),
          customModuleFeatures: prev.customModuleFeatures.filter((f) => f.tabId !== tabId),
        },
        mergeModuleFeatures(features, unionById(prev.customModuleFeatures, catalog.moduleFeatures)),
      ),
    );
    if (effectiveActiveModuleTab === tabId) {
      setActiveModuleTab(tabs[0]?.id ?? "dashboard");
    }
  }

  function onModuleFeatureLabelChange(featureId: string, label: string) {
    setState((prev) => {
      const existing = prev.customModuleFeatures.find((f) => f.id === featureId);
      const tabId = existing?.tabId ?? features.find((f) => f.id === featureId)?.tabId ?? "";
      return {
        ...prev,
        customModuleFeatures: upsertLabel(prev.customModuleFeatures, {
          id: featureId,
          tabId,
          label,
        }),
      };
    });
    scheduleAutoSave();
  }

  function onAddCustomModuleFeature(tabId: string) {
    const custom = newCustomModuleFeature(tabId);
    setState((prev) => ({
      ...prev,
      customModuleFeatures: [...prev.customModuleFeatures, custom],
      features: prev.features.includes(custom.id) ? prev.features : [...prev.features, custom.id],
      tabs: prev.tabs.includes(tabId) ? prev.tabs : [...prev.tabs, tabId],
    }));
    scheduleAutoSave();
  }

  function onRemoveCustomModuleFeature(featureId: string) {
    setState((prev) => {
      const nextFields = { ...prev.fields };
      for (const custom of prev.customModuleFields.filter((f) => f.featureId === featureId)) {
        delete nextFields[custom.id];
      }
      return pruneSelectionsForTabs(
        {
          ...prev,
          fields: nextFields,
          features: prev.features.filter((id) => id !== featureId),
          customModuleFeatures: prev.customModuleFeatures.filter((f) => f.id !== featureId),
          customModuleFields: prev.customModuleFields.filter((f) => f.featureId !== featureId),
        },
        mergeModuleFeatures(features, unionById(prev.customModuleFeatures, catalog.moduleFeatures)),
      );
    });
  }

  function onModuleFieldLabelChange(fieldId: string, label: string) {
    setState((prev) => {
      const existing = prev.customModuleFields.find((f) => f.id === fieldId);
      const schemaField = fields.find((f) => f.id === fieldId);
      const featureId = existing?.featureId ?? schemaField?.when?.featuresAny?.[0] ?? "";
      return {
        ...prev,
        customModuleFields: upsertLabel(prev.customModuleFields, {
          id: fieldId,
          featureId,
          label,
        }),
      };
    });
    scheduleAutoSave();
  }

  function onRemoveCustomModuleField(fieldId: string) {
    setState((prev) => {
      const custom = prev.customModuleFields.find((f) => f.id === fieldId);
      const section = custom
        ? fieldOrderSectionForFeature(custom.featureId)
        : FIELD_ORDER_GENERAL;
      const nextFields = { ...prev.fields };
      delete nextFields[fieldId];
      const remainingIds = (prev.fieldOrder[section] ?? []).filter((id) => id !== fieldId);
      return {
        ...prev,
        customModuleFields: prev.customModuleFields.filter((f) => f.id !== fieldId),
        fields: nextFields,
        fieldOrder: {
          ...prev.fieldOrder,
          [section]: removeFieldFromOrder(prev.fieldOrder[section], remainingIds, fieldId),
        },
      };
    });
    scheduleAutoSave();
  }

  function onAddCustomBusinessField() {
    setState((prev) => {
      const field = newCustomBusinessField();
      const fieldIds = [...businessSectionFieldIds, field.id];
      const anchorId = businessSectionFieldIds[businessSectionFieldIds.length - 1] ?? field.id;
      const nextOrder = insertFieldRelative(
        prev.fieldOrder[FIELD_ORDER_BUSINESS],
        fieldIds,
        field.id,
        anchorId,
        "after",
      );
      return {
        ...prev,
        customBusinessFields: [...prev.customBusinessFields, field],
        fields: { ...prev.fields, [field.id]: "" },
        fieldOrder: { ...prev.fieldOrder, [FIELD_ORDER_BUSINESS]: nextOrder },
      };
    });
    scheduleAutoSave();
  }

  function onRemoveCustomBusinessField(fieldId: string) {
    setState((prev) => {
      const nextFields = { ...prev.fields };
      delete nextFields[fieldId];
      const remainingIds = businessSectionFieldIds.filter((id) => id !== fieldId);
      return {
        ...prev,
        customBusinessFields: prev.customBusinessFields.filter((f) => f.id !== fieldId),
        fields: nextFields,
        fieldOrder: {
          ...prev.fieldOrder,
          [FIELD_ORDER_BUSINESS]: removeFieldFromOrder(
            prev.fieldOrder[FIELD_ORDER_BUSINESS],
            remainingIds,
            fieldId,
          ),
        },
      };
    });
    scheduleAutoSave();
  }

  function onBusinessFieldLabelChange(fieldId: string, label: string) {
    setState((prev) => ({
      ...prev,
      customBusinessFields: upsertLabel(prev.customBusinessFields, { id: fieldId, label }),
    }));
    scheduleAutoSave();
  }

  function onContactFieldLabelChange(fieldId: string, label: string) {
    setState((prev) => ({
      ...prev,
      customContactFields: upsertLabel(prev.customContactFields, { id: fieldId, label }),
    }));
    scheduleAutoSave();
  }

  function onAddCustomContactField() {
    setState((prev) => {
      const field = newCustomContactField();
      const fieldIds = [...contactSectionFieldIds, field.id];
      const anchorId = contactSectionFieldIds[contactSectionFieldIds.length - 1] ?? field.id;
      const nextOrder = insertFieldRelative(
        prev.fieldOrder[FIELD_ORDER_CONTACT],
        fieldIds,
        field.id,
        anchorId,
        "after",
      );
      return {
        ...prev,
        customContactFields: [...prev.customContactFields, field],
        fields: { ...prev.fields, [field.id]: "" },
        fieldOrder: { ...prev.fieldOrder, [FIELD_ORDER_CONTACT]: nextOrder },
      };
    });
    scheduleAutoSave();
  }

  function onRemoveCustomContactField(fieldId: string) {
    setState((prev) => {
      const nextFields = { ...prev.fields };
      delete nextFields[fieldId];
      const remainingIds = contactSectionFieldIds.filter((id) => id !== fieldId);
      return {
        ...prev,
        customContactFields: prev.customContactFields.filter((f) => f.id !== fieldId),
        fields: nextFields,
        fieldOrder: {
          ...prev.fieldOrder,
          [FIELD_ORDER_CONTACT]: removeFieldFromOrder(
            prev.fieldOrder[FIELD_ORDER_CONTACT],
            remainingIds,
            fieldId,
          ),
        },
      };
    });
    scheduleAutoSave();
  }

  function onAddModuleFieldNear(
    featureId: string,
    anchorId: string,
    position: "before" | "after",
    fieldIds: string[],
  ) {
    setState((prev) => {
      const field = newCustomModuleField(featureId);
      const allIds = [...fieldIds, field.id].filter((id, i, arr) => arr.indexOf(id) === i);
      const section =
        featureId === "_general"
          ? FIELD_ORDER_GENERAL
          : fieldOrderSectionForFeature(featureId);
      const nextOrder = insertFieldRelative(
        prev.fieldOrder[section],
        allIds,
        field.id,
        anchorId,
        position,
      );
      return {
        ...prev,
        customModuleFields: [...prev.customModuleFields, field],
        fields: { ...prev.fields, [field.id]: "" },
        fieldOrder: { ...prev.fieldOrder, [section]: nextOrder },
      };
    });
    scheduleAutoSave();
  }

  function fieldOrderToolbar(fieldId: string, opts?: { onRemove?: () => void }) {
    return <FieldOrderToolbar fieldId={fieldId} onRemove={opts?.onRemove} />;
  }

  function resolvedCustomArrays() {
    return effectiveCustomArrays(
      {
        tabs: state.tabs,
        features: state.features,
        fields: state.fields,
        customDashboardTabs: state.customDashboardTabs,
        customModuleFeatures: state.customModuleFeatures,
        customBusinessFields: state.customBusinessFields,
        customContactFields: state.customContactFields,
        customModuleFields: state.customModuleFields,
      },
      catalog,
    );
  }

  function buildSaveBody(currentStep: StepId) {
    const s = stateRef.current;
    const eff = effectiveCustomArrays(
      {
        tabs: s.tabs,
        features: s.features,
        fields: s.fields,
        customDashboardTabs: s.customDashboardTabs,
        customModuleFeatures: s.customModuleFeatures,
        customBusinessFields: s.customBusinessFields,
        customContactFields: s.customContactFields,
        customModuleFields: s.customModuleFields,
      },
      catalogRef.current,
    );
    return {
      currentStep,
      tabs: s.tabs,
      features: s.features,
      fields: s.fields,
      fieldOrder: s.fieldOrder,
      designLayout: s.designLayout,
      ...eff,
    };
  }

  async function saveToDb(currentStep: StepId, options?: { silent?: boolean }) {
    const email =
      typeof stateRef.current.fields.contact__email === "string"
        ? stateRef.current.fields.contact__email.trim()
        : "";
    if (!email) {
      if (!options?.silent) {
        setSaveStatus({ kind: "error", message: "יש למלא מייל לפני שמירה" });
      }
      return false;
    }

    const normalizedEmail = normalizeEmail(email);
    if (sessionEmailRef.current && sessionEmailRef.current !== normalizedEmail) {
      if (!options?.silent) {
        setSaveStatus({
          kind: "error",
          message: "המייל השתנה — ממתינים לטעינת הלקוח החדש",
        });
      }
      return false;
    }

    const run = async (): Promise<boolean> => {
      if (!options?.silent) setSaveStatus({ kind: "saving" });
      const result = await saveCharacterization(buildSaveBody(currentStep));
      if (!result.ok) {
        if (!options?.silent || (result.status ?? 0) >= 500) {
          setSaveStatus({ kind: "error", message: result.message });
        }
        return false;
      }
      sessionEmailRef.current = normalizedEmail;
      setCharacterizationId(result.characterizationId);
      persistSessionId(normalizedEmail, result.characterizationId);
      if (!options?.silent) setSaveStatus({ kind: "saved", at: result.savedAt });
      return true;
    };

    const next = saveMutexRef.current.then(run, run);
    saveMutexRef.current = next;
    return next;
  }
  saveToDbRef.current = saveToDb;

  async function applyRemoteLoad(
    result: Extract<Awaited<ReturnType<typeof loadCharacterization>>, { found: true }>,
    options?: { restoreStep?: boolean },
  ) {
    suppressAutoSaveRef.current = true;
    const loaded = normalizeSelectionState(result.state);
    const email = contactEmailFromFields(loaded.fields);
    setState(loaded);
    if (options?.restoreStep) {
      setStep(result.currentStep);
      if (loaded.tabs.length > 0) {
        setActiveModuleTab(loaded.tabs[0]);
      }
    }
    if (email) {
      sessionEmailRef.current = email;
      window.localStorage.setItem(SESSION_EMAIL_KEY, email);
    }
    setCharacterizationId(result.characterizationId);
    if (email) {
      persistSessionId(email, result.characterizationId);
    }
    const updatedAt = result.updatedAt
      ? new Date(result.updatedAt).toLocaleString("he-IL")
      : "";
    setLoadedNotice(updatedAt ? `נטענו נתונים שמורים (${updatedAt})` : "נטענו נתונים שמורים");
    setSaveStatus({ kind: "idle" });
    window.setTimeout(() => {
      suppressAutoSaveRef.current = false;
    }, 500);
  }

  async function switchToEmail(rawEmail: string) {
    const email = normalizeEmail(rawEmail);
    if (!isValidMailRecipient(email)) return;

    if (sessionEmailRef.current === email) {
      suppressAutoSaveRef.current = false;
      return;
    }

    suppressAutoSaveRef.current = true;
    setLoadedNotice(null);
    setSubmitResult(null);
    setSaveStatus({ kind: "idle" });

    const localDraft = readValidatedDraft(email);
    const localStep = parseStoredStep(window.localStorage.getItem(stepStorageKey(email)));
    const savedId = readSessionId(email);

    const result = await loadCharacterization(email);
    if (result.ok && result.found) {
      const currentEmail = contactEmailFromFields(stateRef.current.fields);
      if (currentEmail !== email) {
        suppressAutoSaveRef.current = false;
        return;
      }
      await applyRemoteLoad(result);
      setStep(localStep);
      return;
    }

    if (localDraft) {
      setState(localDraft);
      setStep(localStep);
      setCharacterizationId(savedId);
      sessionEmailRef.current = email;
      window.localStorage.setItem(SESSION_EMAIL_KEY, email);
    } else {
      setState((prev) => ({
        ...prev,
        fields: { ...prev.fields, contact__email: rawEmail.trim() },
      }));
      setCharacterizationId(null);
      clearSessionId(email);
      sessionEmailRef.current = email;
      window.localStorage.setItem(SESSION_EMAIL_KEY, email);
    }

    window.setTimeout(() => {
      suppressAutoSaveRef.current = false;
    }, 500);
  }

  async function loadFromDb() {
    const email =
      typeof state.fields.contact__email === "string"
        ? state.fields.contact__email.trim()
        : "";
    if (!email) {
      setSaveStatus({ kind: "error", message: "יש למלא מייל לטעינת נתונים" });
      return;
    }

    setLoadingFromDb(true);
    setLoadedNotice(null);
    try {
      const result = await loadCharacterization(email);
      if (!result.ok) {
        setSaveStatus({ kind: "error", message: result.message });
        return;
      }
      if (!result.found) {
        setLoadedNotice("לא נמצאו נתונים שמורים למייל זה — מתחילים אפיון חדש");
        await switchToEmail(email);
        return;
      }

      await applyRemoteLoad(result, { restoreStep: true });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "שגיאה בטעינה";
      setSaveStatus({ kind: "error", message: msg });
    } finally {
      setLoadingFromDb(false);
    }
  }

  function onReset() {
    const email = contactEmailFromFields(state.fields);
    if (email) clearDraftForEmail(email);
    setState(emptyState());
    setMissing([]);
    setContactMissing([]);
    setSubmitResult(null);
    setSaveStatus({ kind: "idle" });
    setLoadedNotice(null);
    setCharacterizationId(null);
    if (email) clearSessionId(email);
    sessionEmailRef.current = null;
    window.localStorage.removeItem(SESSION_EMAIL_KEY);
    setStep("contact");
  }

  async function onContinueFromContact() {
    const stillMissing = missingRequiredFields(contactFields, state.fields);
    if (stillMissing.length) {
      setContactMissing(stillMissing);
      return;
    }
    setContactMissing([]);
    await saveToDb("contact", { silent: true });
    setStep("business");
  }

  async function goToStep(next: StepId) {
    await saveToDb(step, { silent: true });
    setStep(next);
  }

  async function onSubmit() {
    const missingContact = missingRequiredFields(contactFields, state.fields);
    if (missingContact.length) {
      setContactMissing(missingContact);
      setStep("contact");
      setSubmitResult(null);
      return;
    }
    const stillMissing = missingRequiredFields(relevantFields, state.fields);
    if (stillMissing.length) {
      setMissing(stillMissing);
      setSubmitResult(null);
      return;
    }
    setContactMissing([]);
    setMissing([]);
    setSubmitResult(null);

    setSubmitting(true);
    const eff = resolvedCustomArrays();
    try {
      const result = await submitCharacterization({
        tabs: state.tabs,
        features: state.features,
        fields: {
          ...cleanSubmittedContactFields(
            state.fields,
            contactFields.map((f) => f.id),
            eff.customContactFields,
          ),
          ...cleanSubmittedFields(relevantFields, state.fields),
          ...cleanSubmittedBusinessFields(
            state.fields,
            eff.customBusinessFields,
            businessFields.map((f) => f.id),
          ),
          ...(typeof state.fields[NOTES_CUSTOMER_FIELD_ID] === "string" &&
          state.fields[NOTES_CUSTOMER_FIELD_ID].trim()
            ? { [NOTES_CUSTOMER_FIELD_ID]: state.fields[NOTES_CUSTOMER_FIELD_ID].trim() }
            : {}),
        },
        ...eff,
        fieldOrder: state.fieldOrder,
        designLayout: state.designLayout,
      });
      if (!result.ok) {
        setSubmitResult({ ok: false, message: result.message });
        return;
      }
      setSubmitResult({ ok: true, requestId: result.requestId });
      await saveToDb("notes", { silent: true });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "שגיאה בשליחה";
      setSubmitResult({ ok: false, message: msg });
    } finally {
      setSubmitting(false);
    }
  }

  const hasAnySelection =
    state.tabs.length > 0 ||
    state.features.length > 0 ||
    Object.keys(state.fields).length > 0;

  const submittedContactFields = cleanSubmittedContactFields(
    state.fields,
    contactFields.map((f) => f.id),
    allCustomContactFields,
  );
  const submittedBusinessFields = cleanSubmittedBusinessFields(
    state.fields,
    allCustomBusinessFields,
    businessFields.map((f) => f.id),
  );
  const filledCount =
    Object.keys(submittedContactFields).length +
    Object.keys(cleanSubmittedFields(relevantFields, state.fields)).length +
    Object.keys(submittedBusinessFields).length;

  function wrapFieldRow(
    fieldId: string,
    _section: string,
    _fieldIds: string[],
    toolbar: ReactNode,
    content: ReactNode,
  ) {
    return (
      <FieldOrderRow key={fieldId} toolbar={toolbar}>
        {content}
      </FieldOrderRow>
    );
  }

  function renderContactFieldRow(fieldId: string) {
    const toolbar = fieldOrderToolbar(fieldId, {
      onRemove: myContactFields.some((f) => f.id === fieldId)
        ? () => onRemoveCustomContactField(fieldId)
        : undefined,
    });

    const staticField = contactFields.find((f) => f.id === fieldId);
    if (staticField) {
      return wrapFieldRow(
        fieldId,
        FIELD_ORDER_CONTACT,
        contactSectionFieldIds,
        toolbar,
        <EditableContactFieldRow
          field={staticField}
          label={editableContactFieldLabel(fieldId, allCustomContactFields, contactFields)}
          value={state.fields[fieldId]}
          onLabelChange={(label) => onContactFieldLabelChange(fieldId, label)}
          onChange={(v) =>
            fieldId === "contact__email" ? onContactEmailChange(v) : onFieldChange(fieldId, v)
          }
          onBlur={
            fieldId === "contact__email"
              ? () => {
                  const email = stateRef.current.fields.contact__email;
                  if (typeof email === "string" && isValidMailRecipient(email)) {
                    void switchToEmail(email);
                  }
                }
              : undefined
          }
        />,
      );
    }

    const myCustom = myContactFields.find((f) => f.id === fieldId);
    if (myCustom) {
      return wrapFieldRow(
        fieldId,
        FIELD_ORDER_CONTACT,
        contactSectionFieldIds,
        toolbar,
        <CustomContactFieldRow
          field={myCustom}
          value={state.fields[fieldId]}
          onLabelChange={(label) => onContactFieldLabelChange(fieldId, label)}
          onValueChange={(v) => onFieldChange(fieldId, v)}
        />,
      );
    }

    const catalogCustom = catalogOnlyContactFields.find((f) => f.id === fieldId);
    if (catalogCustom) {
      const schemaField = contactFields.find((f) => f.id === fieldId);
      const field: Field =
        schemaField ??
        ({
          id: fieldId,
          type: "text",
          label: catalogCustom.label,
          when: { contactStep: true },
        } as Field);
      return wrapFieldRow(
        fieldId,
        FIELD_ORDER_CONTACT,
        contactSectionFieldIds,
        toolbar,
        <EditableContactFieldRow
          field={field}
          label={editableContactFieldLabel(fieldId, allCustomContactFields, contactFields)}
          value={state.fields[fieldId]}
          onLabelChange={(label) => onContactFieldLabelChange(fieldId, label)}
          onChange={(v) => onFieldChange(fieldId, v)}
          shared
        />,
      );
    }

    return null;
  }

  function renderBusinessFieldRow(fieldId: string) {
    const toolbar = fieldOrderToolbar(fieldId, {
      onRemove: myBusinessFields.some((f) => f.id === fieldId)
        ? () => onRemoveCustomBusinessField(fieldId)
        : undefined,
    });

    const staticField = businessFields.find((f) => f.id === fieldId);
    if (staticField) {
      return wrapFieldRow(
        fieldId,
        FIELD_ORDER_BUSINESS,
        businessSectionFieldIds,
        toolbar,
        <EditableBusinessFieldRow
          field={staticField}
          label={editableBusinessFieldLabel(fieldId, allCustomBusinessFields, businessFields)}
          value={state.fields[fieldId]}
          onLabelChange={(label) => onBusinessFieldLabelChange(fieldId, label)}
          onChange={(v) => onFieldChange(fieldId, v)}
        />,
      );
    }

    const myCustom = myBusinessFields.find((f) => f.id === fieldId);
    if (myCustom) {
      return wrapFieldRow(
        fieldId,
        FIELD_ORDER_BUSINESS,
        businessSectionFieldIds,
        toolbar,
        <CustomBusinessFieldRow
          field={myCustom}
          value={state.fields[fieldId]}
          onLabelChange={(label) => onBusinessFieldLabelChange(fieldId, label)}
          onValueChange={(v) => onFieldChange(fieldId, v)}
        />,
      );
    }

    const catalogField = catalogBusinessFieldDefs.find((f) => f.id === fieldId);
    if (catalogField) {
      return wrapFieldRow(
        fieldId,
        FIELD_ORDER_BUSINESS,
        businessSectionFieldIds,
        toolbar,
        <EditableBusinessFieldRow
          field={catalogField}
          label={editableBusinessFieldLabel(fieldId, allCustomBusinessFields, businessFields)}
          value={state.fields[fieldId]}
          onLabelChange={(label) => onBusinessFieldLabelChange(fieldId, label)}
          onChange={(v) => onFieldChange(fieldId, v)}
          shared
        />,
      );
    }

    return null;
  }

  return (
    <div dir="rtl" className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10">
      <header className="fade-rise border-b-2 border-[#17140f]/10 pb-6">
        <div className="eyebrow mb-2 text-[0.7rem] font-semibold text-[#e0431f]">
          {stepHeaderLabel(step)}
        </div>
        <h1 className="font-display text-4xl font-normal leading-tight text-[#17140f] sm:text-5xl">
          טופס האפיון
        </h1>
        <SaveStatusBar
          saveStatus={saveStatus}
          loadedNotice={loadedNotice}
          characterizationId={characterizationId}
        />
      </header>

      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[236px_minmax(0,1fr)] lg:items-start lg:gap-8">
        <nav className="fade-rise fade-rise-1 flex gap-2 overflow-x-auto pb-1 lg:sticky lg:top-6 lg:flex-col lg:overflow-visible lg:pb-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <StepPill
          id="contact"
          current={step}
          label="פרטי הלקוח"
          onClick={() => goToStep("contact")}
        />
        <StepPill
          id="business"
          current={step}
          label="אפיון העסק"
          onClick={() => goToStep("business")}
        />
        <StepPill id={1} current={step} label="1. על הדשבורד" onClick={() => goToStep(1)} />
        <StepPill
          id="design"
          current={step}
          label="2. דשבורד 2"
          onClick={() => goToStep("design")}
        />
        <DemoDashboardNoticePill />
        <StepPill id={2} current={step} label="3. פיצ׳רים" onClick={() => goToStep(2)} />
        <StepPill id={3} current={step} label="4. שדות" onClick={() => goToStep(3)} />
        <StepPill
          id="notes"
          current={step}
          label="5. הערות"
          onClick={() => goToStep("notes")}
        />
      </nav>

      <div className="flex min-w-0 flex-col gap-6">
      {step === "contact" ? (
        <Section
          title="פרטי הלקוח"
          description="מלאו את פרטי ההתקשרות. הם נשמרים רק בדפדפן הזה."
          accent="indigo"
        >
          <div className="flex flex-col gap-3">
            {orderedContactFieldIds.map((fieldId) => renderContactFieldRow(fieldId))}
          </div>

          {contactMissing.length ? (
            <div className="mt-4 rounded-2xl border border-orange-200/70 bg-orange-50/80 p-4 text-sm text-orange-900">
              יש למלא את שדות החובה הבאים:{" "}
              {contactMissing.map((f) => f.label).join(", ")}
            </div>
          ) : null}

          {loadedNotice ? (
            <div className="mt-4 rounded-2xl border border-orange-200/70 bg-orange-50/80 p-4 text-sm text-orange-900">
              {loadedNotice}
            </div>
          ) : null}

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="secondary"
                onClick={loadFromDb}
                disabled={loadingFromDb}
              >
                {loadingFromDb ? "טוען..." : "טען טיוטה מהדפדפן"}
              </Button>
              <Button variant="secondary" onClick={onAddCustomContactField}>
                + הוסף שדה
              </Button>
              <Button variant="secondary" onClick={() => saveToDb("contact")}>
                שמור
              </Button>
            </div>
            <Button onClick={onContinueFromContact}>המשך לאפיון העסק</Button>
          </div>
        </Section>
      ) : null}

      {step === "business" ? (
        <Section
          title="אפיון העסק"
          description="מלאו את פרטי האפיון הכללי על העסק. ניתן גם להוסיף שדות נוספים."
          accent="rose"
        >
          <div className="flex flex-col gap-3">
            {orderedBusinessFieldIds.map((fieldId) => renderBusinessFieldRow(fieldId))}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="secondary" onClick={() => goToStep("contact")}>
                חזרה לפרטי הלקוח
              </Button>
              <Button variant="secondary" onClick={onAddCustomBusinessField}>
                + הוסף שדה
              </Button>
              <Button variant="secondary" onClick={() => saveToDb("business")}>
                שמור
              </Button>

            </div>
            <Button onClick={() => goToStep(1)}>המשך לדשבורד</Button>
          </div>
        </Section>
      ) : null}

      {step === 1 ? (
        <Section
          title="חלק 1 — על הדשבורד"
          description="בחרו את המודולים שיופיעו על הדשבורד. ניתן גם להוסיף כפתורים מותאמים."
          accent="violet"
        >
          <ModuleTabsNav
            items={dashboardModules}
            activeId={effectiveActiveModuleTab}
            selectedIds={state.tabs}
            onSelect={setActiveModuleTab}
          />

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {tabs.map((t) => {
              const merged = dashboardModules.find((m) => m.id === t.id) ?? t;
              const demoAvailable = hasDemo(t.id);
              const Mini = getDemoMini(t.id);
              return (
                <div key={t.id} className="flex flex-col gap-2">
                  <CardButton
                    title={merged.label}
                    description={t.description}
                    selected={state.tabs.includes(t.id)}
                    onClick={() => onToggleTab(t.id)}
                    accent={accentForTab(t.id)}
                    onTitleChange={(label) => onDashboardTabLabelChange(t.id, label)}
                    media={Mini ? <Mini /> : undefined}
                  />
                  {demoAvailable ? (
                    <button
                      type="button"
                      onClick={() => setDemoTabId(t.id)}
                      className="group inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#e0431f]/30 bg-[#e0431f]/[0.06] px-3 py-2 text-xs font-bold text-[#e0431f] transition-all duration-200 hover:bg-[#e0431f]/[0.12]"
                    >
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#e0431f] text-white transition-transform duration-200 group-hover:scale-110">
                        <svg viewBox="0 0 12 12" fill="currentColor" className="h-2.5 w-2.5" aria-hidden>
                          <path d="M4 3l5 3-5 3V3z" />
                        </svg>
                      </span>
                      צפייה בדמו חי
                    </button>
                  ) : null}
                </div>
              );
            })}

            {catalogOnlyDashboardTabs.map((shared) => {
              const merged =
                dashboardModules.find((m) => m.id === shared.id) ??
                ({ id: shared.id, label: shared.label.trim() || "כפתור משותף" } as Tab);
              return (
                <CardButton
                  key={shared.id}
                  title={merged.label}
                  description="כפתור לדוגמה"
                  selected={state.tabs.includes(shared.id)}
                  onClick={() => onToggleTab(shared.id)}
                  accent="indigo"
                  onTitleChange={(label) => onDashboardTabLabelChange(shared.id, label)}
                />
              );
            })}

            {myDashboardTabs.map((custom) => (
              <CustomDashboardTabCard
                key={custom.id}
                tab={custom}
                selected={state.tabs.includes(custom.id)}
                onLabelChange={(label) => onDashboardTabLabelChange(custom.id, label)}
                onToggle={() => onToggleTab(custom.id)}
                onRemove={() => onRemoveCustomDashboardTab(custom.id)}
              />
            ))}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="ghost" onClick={onReset} disabled={!hasAnySelection}>
                נקה הכל
              </Button>
              <Button variant="secondary" onClick={onAddCustomDashboardTab}>
                + הוסף כפתור
              </Button>
              <Button variant="secondary" onClick={() => saveToDb(1)}>
                שמור
              </Button>

            </div>
            <Button onClick={() => goToStep("design")} disabled={!state.tabs.length}>
              המשך לדשבורד 2
            </Button>
          </div>
        </Section>
      ) : null}

      {step === "design" ? (
        <Section
          title="חלק 2 — דשבורד 2"
          description="שלב לשליחה וקבלה של הדשבורד, תצוגת wireframe ועורך דיאגרמות."
          accent="amber"
        >
          <DashboardDesignStep
            items={selectedDashboardItems}
            layout={state.designLayout}
            onLayoutChange={onDesignLayoutChange}
          />

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="secondary" onClick={() => goToStep(1)}>
                חזרה לדשבורד
              </Button>
              <Button variant="secondary" onClick={() => saveToDb("design")}>
                שמור
              </Button>

            </div>
            <Button onClick={() => goToStep(2)} disabled={!state.tabs.length}>
              המשך לפיצ׳רים
            </Button>
          </div>
        </Section>
      ) : null}

      {step === 2 ? (
        <Section
          title="חלק 3 — ספריית פיצ׳רים"
          description="לכל מודול שבחרתם על הדשבורד — בחרו פיצ׳רים רלוונטיים."
          accent="sky"
        >
          {!state.tabs.length ? (
            <div className="rounded-xl bg-orange-50/80 px-4 py-3 text-sm text-orange-900">
              כדי לבחור פיצ׳רים צריך לבחור קודם מודולים על הדשבורד.
            </div>
          ) : (
            <>
              <ModuleTabsNav
                items={dashboardModules.filter((t) => state.tabs.includes(t.id))}
                activeId={effectiveActiveModuleTab}
                selectedIds={state.tabs}
                onSelect={setActiveModuleTab}
              />

              {activeFeatureGroup ? (
                <FeaturePanel
                  group={activeFeatureGroup}
                  selectedFeatureIds={state.features}
                  customFeatures={activeCustomModuleFeatures}
                  allowAddCustom={moduleAllowsCustomFeatures(effectiveActiveModuleTab)}
                  onToggleFeature={onToggleFeature}
                  onAddCustomFeature={() => onAddCustomModuleFeature(effectiveActiveModuleTab)}
                  onCustomFeatureLabelChange={onModuleFeatureLabelChange}
                  onRemoveCustomFeature={onRemoveCustomModuleFeature}
                />
              ) : (
                <div className="mt-5 rounded-xl bg-orange-50/80 px-4 py-3 text-sm text-orange-900">
                  בחרו מודול מהרשימה למעלה.
                </div>
              )}
            </>
          )}

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="secondary" onClick={() => goToStep("design")}>
                חזרה לדשבורד 2
              </Button>
              <Button variant="secondary" onClick={() => saveToDb(2)}>
                שמור
              </Button>

            </div>
            <Button onClick={() => goToStep(3)} disabled={!state.tabs.length}>
              המשך לשדות
            </Button>
          </div>
        </Section>
      ) : null}

      {step === 3 ? (
        <Section
          title="חלק 4 — שדות לסגירה"
          description="השדות מוצגים דינמית לפי מה שנבחר בחלקים 1 ו-3. סמנו/מלאו את הרלוונטיים."
          accent="emerald"
        >
          <div className="flex flex-col gap-5">
            {fieldGroups.map((group) => {
              const groupCustomFields =
                group.key !== "_general"
                  ? customFieldsForFeature(allCustomModuleFields, group.key).filter((f) =>
                      isCustomModuleFieldId(f.id),
                    )
                  : [];
              const catalogGroupFields =
                group.key !== "_general"
                  ? customFieldsForFeature(allCustomModuleFields, group.key).filter(
                      (f) => !isCustomModuleFieldId(f.id),
                    )
                  : [];
              const catalogCustomModuleFields =
                group.key !== "_general"
                  ? customFieldsForFeature(allCustomModuleFields, group.key).filter((f) =>
                      isCustomModuleFieldId(f.id),
                    )
                  : [];
              const canAddCustomField =
                group.key !== "_general" && state.features.includes(group.key);
              const section =
                group.key === FIELD_ORDER_GENERAL
                  ? FIELD_ORDER_GENERAL
                  : fieldOrderSectionForFeature(group.key);
              const groupFieldIds = [
                ...new Set([
                  ...group.fields.map((f) => f.id),
                  ...groupCustomFields.map((f) => f.id),
                  ...catalogGroupFields.map((f) => f.id),
                  ...catalogCustomModuleFields
                    .filter((c) => !groupCustomFields.some((g) => g.id === c.id))
                    .map((f) => f.id),
                ]),
              ];
              const orderedGroupFieldIds = resolveFieldOrder(
                state.fieldOrder[section],
                groupFieldIds,
              );

              function renderModuleFieldRow(fieldId: string) {
                const toolbar = fieldOrderToolbar(fieldId, {
                  onRemove: groupCustomFields.some((f) => f.id === fieldId)
                    ? () => onRemoveCustomModuleField(fieldId)
                    : undefined,
                });

                const staticField = group.fields.find((f) => f.id === fieldId);
                if (staticField) {
                  return wrapFieldRow(
                    fieldId,
                    section,
                    groupFieldIds,
                    toolbar,
                    <EditableModuleFieldCard
                      field={staticField}
                      label={editableModuleFieldLabel(fieldId, allCustomModuleFields, fields)}
                      value={state.fields[fieldId]}
                      onLabelChange={(label) => onModuleFieldLabelChange(fieldId, label)}
                      onChange={(v) => onFieldChange(fieldId, v)}
                    />,
                  );
                }

                const myCustom = groupCustomFields.find((f) => f.id === fieldId);
                if (myCustom) {
                  return wrapFieldRow(
                    fieldId,
                    section,
                    groupFieldIds,
                    toolbar,
                    <CustomModuleFieldRow
                      field={myCustom}
                      value={state.fields[fieldId]}
                      onLabelChange={(label) => onModuleFieldLabelChange(fieldId, label)}
                      onValueChange={(v) => onFieldChange(fieldId, v)}
                    />,
                  );
                }

                const catalogStatic = catalogGroupFields.find((f) => f.id === fieldId);
                if (catalogStatic) {
                  return wrapFieldRow(
                    fieldId,
                    section,
                    groupFieldIds,
                    toolbar,
                    <CustomModuleFieldRow
                      field={{
                        ...catalogStatic,
                        label: editableModuleFieldLabel(fieldId, allCustomModuleFields, fields),
                      }}
                      value={state.fields[fieldId]}
                      onLabelChange={(label) => onModuleFieldLabelChange(fieldId, label)}
                      onValueChange={(v) => onFieldChange(fieldId, v)}
                      shared
                    />,
                  );
                }

                const catalogCustom = catalogCustomModuleFields.find((f) => f.id === fieldId);
                if (catalogCustom) {
                  return wrapFieldRow(
                    fieldId,
                    section,
                    groupFieldIds,
                    toolbar,
                    <CustomModuleFieldRow
                      field={{
                        ...catalogCustom,
                        label: editableModuleFieldLabel(fieldId, allCustomModuleFields, fields),
                      }}
                      value={state.fields[fieldId]}
                      onLabelChange={(label) => onModuleFieldLabelChange(fieldId, label)}
                      onValueChange={(v) => onFieldChange(fieldId, v)}
                      shared
                    />,
                  );
                }

                return null;
              }

              return (
                <div
                  key={group.key}
                  className="rounded-xl border border-black/[0.08] border-r-4 border-r-emerald-500 bg-[#fffdf7] p-4 shadow-sm"
                >
                  <h3 className="mb-3 font-display text-base font-normal text-[#17140f]">
                    {group.label}
                  </h3>
                  <div className="flex flex-col gap-3">
                    {orderedGroupFieldIds.map((fieldId) => renderModuleFieldRow(fieldId))}
                  </div>

                  {canAddCustomField ? (
                    <div className="mt-4">
                      <Button
                        variant="secondary"
                        onClick={() =>
                          onAddModuleFieldNear(
                            group.key,
                            orderedGroupFieldIds[orderedGroupFieldIds.length - 1] ?? group.key,
                            "after",
                            groupFieldIds,
                          )
                        }
                      >
                        + הוסף שדה
                      </Button>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>

          <div className="glass-panel mt-6 rounded-2xl p-5">
            <div className="text-sm font-bold tracking-tight text-[#17140f]">סיכום בחירה</div>
            <div className="mt-3 flex flex-wrap gap-2 text-sm">
              <span className="rounded-full bg-orange-100/80 px-3 py-1 font-medium text-orange-800">
                על הדשבורד: {state.tabs.length}
              </span>
              <span className="rounded-full bg-teal-100/80 px-3 py-1 font-medium text-teal-800">
                פיצ׳רים: {state.features.length}
              </span>
              <span className="rounded-full bg-emerald-100/80 px-3 py-1 font-medium text-emerald-800">
                שדות: {filledCount}
              </span>
            </div>
          </div>

          {missing.length ? (
            <div className="mt-4 rounded-2xl border border-orange-200/70 bg-orange-50/80 p-4 text-sm text-orange-900">
              יש למלא את שדות החובה הבאים לפני המשך:{" "}
              {missing.map((f) => f.label).join(", ")}
            </div>
          ) : null}

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <Button variant="secondary" onClick={() => goToStep(2)}>
              חזרה לפיצ׳רים
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="secondary" onClick={() => saveToDb(3)}>
                שמור
              </Button>

              <Button onClick={() => goToStep("notes")} disabled={!!missing.length}>
                המשך להערות
              </Button>
            </div>
          </div>
        </Section>
      ) : null}

      {step === "notes" ? (
        <Section
          title="חלק 5 — הערות"
          description="כתבו הערות נוספות. למטה מוצגת הערת דוגמה."
          accent="indigo"
        >
          <NotesStepSection
            value={state.fields[NOTES_CUSTOMER_FIELD_ID]}
            onChange={(text) => {
              setState((prev) => ({
                ...prev,
                fields: { ...prev.fields, [NOTES_CUSTOMER_FIELD_ID]: text },
              }));
              scheduleAutoSave();
            }}
            approvedNotes={catalog.approvedNotes}
          />

          

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <Button variant="secondary" onClick={() => goToStep(3)}>
              חזרה לשדות
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="secondary" onClick={() => saveToDb("notes")} disabled={submitting}>
                שמור
              </Button>

              <Button variant="ghost" onClick={onReset} disabled={submitting}>
                נקה הכל
              </Button>
              <Button onClick={onSubmit} disabled={submitting}>
                {submitting ? "שומר..." : "שמירת סיכום"}
              </Button>
            </div>
          </div>

          {submitResult ? (
            <div
              className={[
                "mt-4 rounded-2xl border p-4 text-sm",
                submitResult.ok
                  ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                  : "border-red-200 bg-red-50 text-red-900",
              ].join(" ")}
            >
              {submitResult.ok ? (
                <div>
                  הסיכום נשמר בדפדפן הזה בלבד. לא נשלח מייל ולא בוצע תשלום.
                </div>
              ) : (
                <div>שגיאה: {submitResult.message}</div>
              )}
            </div>
          ) : null}
        </Section>
      ) : null}
      </div>
      </div>

      <DemoPreviewModal tabId={demoTabId} onClose={() => setDemoTabId(null)} />
    </div>
  );
}

function SaveStatusBar({
  saveStatus,
  loadedNotice,
  characterizationId,
}: {
  saveStatus: SaveStatus;
  loadedNotice: string | null;
  characterizationId: string | null;
}) {
  if (
    saveStatus.kind === "idle" &&
    !loadedNotice &&
    !characterizationId
  ) {
    return null;
  }

  return (
    <div className="mt-3 flex flex-col gap-1 text-xs text-[#6f665a]">
      {characterizationId ? (
        <div>מזהה אפיון: {characterizationId.slice(0, 8)}…</div>
      ) : null}
      {loadedNotice && saveStatus.kind === "idle" ? (
        <div className="text-orange-700">{loadedNotice}</div>
      ) : null}
      {saveStatus.kind === "saving" ? (
        <div className="text-orange-700">שומר בדפדפן...</div>
      ) : null}
      {saveStatus.kind === "saved" ? (
        <div className="text-emerald-700">
          נשמר בדפדפן ({new Date(saveStatus.at).toLocaleString("he-IL")})
        </div>
      ) : null}
      {saveStatus.kind === "error" ? (
        <div className="text-red-600">{saveStatus.message}</div>
      ) : null}
    </div>
  );
}

function ModuleTabsNav({
  items,
  activeId,
  selectedIds,
  onSelect,
}: {
  items: Tab[];
  activeId: string;
  selectedIds: string[];
  onSelect: (tabId: string) => void;
}) {
  return (
    <nav
      className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      aria-label="ניווט על הדשבורד"
    >
      {items.map((t) => {
        const accent = accentForTab(t.id);
        const a = accentStyles[accent];
        const active = activeId === t.id;
        const selected = selectedIds.includes(t.id);
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onSelect(t.id)}
            className={[
              "shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200",
              active
                ? a.pillActive
                : "border border-black/[0.1] bg-[#fffdf7] text-[#6f665a] shadow-sm hover:bg-white hover:text-[#17140f]",
            ].join(" ")}
          >
            <span className="flex items-center gap-1.5">
              {selected ? (
                <span
                  className={[
                    "inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px]",
                    active ? "bg-white/25 text-white" : "bg-orange-100/80 text-orange-700",
                  ].join(" ")}
                  aria-hidden
                >
                  ✓
                </span>
              ) : null}
              {t.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

function FeaturePanel({
  group,
  selectedFeatureIds,
  customFeatures,
  allowAddCustom,
  onToggleFeature,
  onAddCustomFeature,
  onCustomFeatureLabelChange,
  onRemoveCustomFeature,
}: {
  group: { tab: Tab; features: Feature[] };
  selectedFeatureIds: string[];
  customFeatures: CustomModuleFeature[];
  allowAddCustom: boolean;
  onToggleFeature: (featureId: string) => void;
  onAddCustomFeature: () => void;
  onCustomFeatureLabelChange: (featureId: string, label: string) => void;
  onRemoveCustomFeature: (featureId: string) => void;
}) {
  const accent = accentForTab(group.tab.id);
  const a = accentStyles[accent];
  const customFeatureIds = new Set(customFeatures.map((c) => c.id));
  const baseFeatures = group.features.filter((f) => !customFeatureIds.has(f.id));
  const totalCount = baseFeatures.length + customFeatures.length;
  const selectedCount =
    baseFeatures.filter((f) => selectedFeatureIds.includes(f.id)).length +
    customFeatures.filter((f) => selectedFeatureIds.includes(f.id)).length;

  return (
    <div
      className={`mt-5 rounded-2xl border border-white/60 p-4 shadow-sm ${a.groupBorder} ${a.groupBg}`}
    >
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-base font-bold text-[#17140f]">{group.tab.label}</h3>
        {totalCount > 0 ? (
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${a.badge}`}>
            {selectedCount}/{totalCount} נבחרו
          </span>
        ) : null}
      </div>

      {totalCount === 0 ? (
        <div className="flex min-h-[5.5rem] items-center justify-center rounded-xl border border-dashed border-black/[0.12] bg-white/50 px-4 py-6 text-center text-sm text-[#6f665a]">
          אין פיצ׳רים למודול זה
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {group.features
            .filter((f) => !customFeatures.some((c) => c.id === f.id))
            .map((f) => (
              <CardButton
                key={f.id}
                title={f.label}
                description={f.description}
                selected={selectedFeatureIds.includes(f.id)}
                onClick={() => onToggleFeature(f.id)}
                accent={accent}
                onTitleChange={(label) => onCustomFeatureLabelChange(f.id, label)}
              />
            ))}

          {customFeatures.map((custom) => (
            <CustomModuleFeatureCard
              key={custom.id}
              feature={custom}
              selected={selectedFeatureIds.includes(custom.id)}
              accent={accent}
              onLabelChange={(label) => onCustomFeatureLabelChange(custom.id, label)}
              onToggle={() => onToggleFeature(custom.id)}
              onRemove={() => onRemoveCustomFeature(custom.id)}
            />
          ))}
        </div>
      )}

      {allowAddCustom ? (
        <div className="mt-4">
          <Button variant="secondary" onClick={onAddCustomFeature}>
            + הוסף כפתור
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function CustomModuleFieldRow({
  field,
  value,
  onLabelChange,
  onValueChange,
  onRemove,
  shared,
}: {
  field: CustomModuleField;
  value: unknown;
  onLabelChange: (label: string) => void;
  onValueChange: (v: unknown) => void;
  onRemove?: () => void;
  shared?: boolean;
}) {
  const inputClass =
    "field-input";

  return (
    <div className="field-card">
      <div className="mb-3 flex items-start justify-between gap-3">
        <label className="flex min-w-0 flex-1 flex-col gap-2">
          <span className="text-xs font-medium text-[#e0431f]">
            {shared ? "שדה משותף" : "שדה מותאם"}
          </span>
          <input
            className={`h-11 ${inputClass}`}
            type="text"
            value={field.label}
            placeholder="שם השדה..."
            onChange={(e) => onLabelChange(e.target.value)}
          />
        </label>
        {onRemove ? (
          <button
            type="button"
            onClick={onRemove}
            className="mt-6 shrink-0 rounded-lg px-2 py-1 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50"
          >
            הסר
          </button>
        ) : null}
      </div>
      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium text-[#17140f]">תוכן</span>
        <textarea
          className={`min-h-28 ${inputClass}`}
          value={typeof value === "string" ? value : ""}
          placeholder="הקלידו כאן..."
          onChange={(e) => onValueChange(e.target.value)}
        />
      </label>
    </div>
  );
}

function EditableModuleFieldCard({
  field,
  label,
  value,
  onLabelChange,
  onChange,
}: {
  field: Field;
  label: string;
  value: unknown;
  onLabelChange: (label: string) => void;
  onChange: (v: unknown) => void;
}) {
  if (field.type === "checkbox") {
    const checked = Boolean(value);
    return (
    <div className="field-card">
      <input
        className="field-title mb-3"
        type="text"
        value={label}
        placeholder="כותרת השדה..."
        onChange={(e) => onLabelChange(e.target.value)}
      />
        <label
          className={[
            "flex cursor-pointer items-start gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition-colors",
            checked
              ? "bg-orange-100/80 text-orange-900"
              : "border border-orange-200 bg-orange-50/60 text-orange-900 hover:bg-orange-100/70",
          ].join(" ")}
        >
          <input
            className="mt-1 h-4 w-4 accent-[#e0431f]"
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
          />
          <span>{checked ? "נבחר" : "בחרו שדה זה"}</span>
        </label>
      </div>
    );
  }

  return (
    <div className="field-card">
      <input
        className="field-title mb-3"
        type="text"
        value={label}
        placeholder="כותרת השדה..."
        onChange={(e) => onLabelChange(e.target.value)}
      />
      <FieldRenderer field={field} value={value} onChange={onChange} hideLabel />
    </div>
  );
}

function EditableBusinessFieldRow({
  field,
  label,
  value,
  onLabelChange,
  onChange,
  shared,
}: {
  field: Field;
  label: string;
  value: unknown;
  onLabelChange: (label: string) => void;
  onChange: (v: unknown) => void;
  shared?: boolean;
}) {
  return (
    <div className="field-card">
      <div className="mb-3 flex flex-col gap-2">
        {shared ? (
          <span className="text-xs font-medium text-[#e0431f]">שדה משותף</span>
        ) : null}
        <input
          className="field-title"
          type="text"
          value={label}
          placeholder="כותרת השדה..."
          onChange={(e) => onLabelChange(e.target.value)}
        />
      </div>
      <FieldRenderer field={field} value={value} onChange={onChange} hideLabel />
    </div>
  );
}

function EditableContactFieldRow({
  field,
  label,
  value,
  onLabelChange,
  onChange,
  onBlur,
  shared,
}: {
  field: Field;
  label: string;
  value: unknown;
  onLabelChange: (label: string) => void;
  onChange: (v: unknown) => void;
  onBlur?: () => void;
  shared?: boolean;
}) {
  return (
    <div className="field-card">
      <div className="mb-3 flex flex-col gap-2">
        {shared ? (
          <span className="text-xs font-medium text-[#e0431f]">שדה משותף</span>
        ) : null}
        <input
          className="field-title"
          type="text"
          value={label}
          placeholder="כותרת השדה..."
          onChange={(e) => onLabelChange(e.target.value)}
        />
      </div>
      <FieldRenderer
        field={{ ...field, label }}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        hideLabel
      />
    </div>
  );
}

function CustomContactFieldRow({
  field,
  value,
  onLabelChange,
  onValueChange,
  onRemove,
}: {
  field: CustomContactField;
  value: unknown;
  onLabelChange: (label: string) => void;
  onValueChange: (v: unknown) => void;
  onRemove?: () => void;
}) {
  const inputClass =
    "field-input";

  return (
    <div className="field-card">
      <div className="mb-3 flex items-start justify-between gap-3">
        <label className="flex min-w-0 flex-1 flex-col gap-2">
          <span className="text-sm font-medium text-[#17140f]">שם השדה</span>
          <input
            className={`h-11 ${inputClass}`}
            type="text"
            value={field.label}
            placeholder="כותרת השדה..."
            onChange={(e) => onLabelChange(e.target.value)}
          />
        </label>
        {onRemove ? (
          <button
            type="button"
            onClick={onRemove}
            className="mt-7 shrink-0 rounded-lg px-2 py-1 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50"
          >
            הסר
          </button>
        ) : null}
      </div>
      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium text-[#17140f]">תוכן</span>
        <input
          className={`h-11 ${inputClass}`}
          type="text"
          value={typeof value === "string" ? value : ""}
          placeholder="הקלידו כאן..."
          onChange={(e) => onValueChange(e.target.value)}
        />
      </label>
    </div>
  );
}

function CustomModuleFeatureCard({
  feature,
  selected,
  accent,
  onLabelChange,
  onToggle,
  onRemove,
}: {
  feature: CustomModuleFeature;
  selected: boolean;
  accent: AccentId;
  onLabelChange: (label: string) => void;
  onToggle: () => void;
  onRemove: () => void;
}) {
  const a = accentStyles[accent];
  const inputClass =
    "field-input w-full font-semibold";

  return (
    <div
      className={[
        "rounded-xl border p-4 text-right transition-all duration-200",
        selected
          ? a.cardSelected
          : `border-dashed border-orange-300 bg-[#fffdf7] text-[#17140f] shadow-sm ${a.cardHover}`,
      ].join(" ")}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <span
          className={
            selected ? "text-xs font-medium text-white/80" : "text-xs font-medium text-[#e0431f]"
          }
        >
          כפתור מותאם
        </span>
        <button
          type="button"
          onClick={onRemove}
          className={[
            "shrink-0 rounded-lg px-2 py-0.5 text-xs font-semibold transition-colors",
            selected ? "text-white/90 hover:bg-white/15" : "text-red-600 hover:bg-red-50",
          ].join(" ")}
        >
          הסר
        </button>
      </div>
      <input
        className={[
          inputClass,
          selected
            ? "border-white/50 bg-white text-[#17140f] placeholder:text-slate-400"
            : "",
        ].join(" ")}
        type="text"
        value={feature.label}
        placeholder="שם הכפתור..."
        onChange={(e) => onLabelChange(e.target.value)}
        onClick={(e) => e.stopPropagation()}
      />
      <button
        type="button"
        onClick={onToggle}
        className={[
          "mt-3 w-full rounded-xl px-3 py-2 text-sm font-semibold transition-colors",
          selected
            ? "bg-white/20 text-white hover:bg-white/30"
            : "border border-orange-200 bg-orange-50/60 text-orange-900 hover:bg-orange-100/70",
        ].join(" ")}
      >
        {selected ? "✓ נבחר" : "בחרו כפתור זה"}
      </button>
    </div>
  );
}

function CustomDashboardTabCard({
  tab,
  selected,
  onLabelChange,
  onToggle,
  onRemove,
}: {
  tab: CustomDashboardTab;
  selected: boolean;
  onLabelChange: (label: string) => void;
  onToggle: () => void;
  onRemove: () => void;
}) {
  const accent = "indigo" as const;
  const a = accentStyles[accent];
  const inputClass =
    "field-input w-full font-semibold";

  return (
    <div
      className={[
        "rounded-xl border p-4 text-right transition-all duration-200",
        selected
          ? a.cardSelected
          : `border-dashed border-orange-300 bg-[#fffdf7] text-[#17140f] shadow-sm ${a.cardHover}`,
      ].join(" ")}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <span
          className={
            selected ? "text-xs font-medium text-white/80" : "text-xs font-medium text-[#e0431f]"
          }
        >
          כפתור מותאם
        </span>
        <button
          type="button"
          onClick={onRemove}
          className={[
            "shrink-0 rounded-lg px-2 py-0.5 text-xs font-semibold transition-colors",
            selected ? "text-white/90 hover:bg-white/15" : "text-red-600 hover:bg-red-50",
          ].join(" ")}
        >
          הסר
        </button>
      </div>
      <input
        className={[
          inputClass,
          selected
            ? "border-white/50 bg-white text-[#17140f] placeholder:text-slate-400"
            : "",
        ].join(" ")}
        type="text"
        value={tab.label}
        placeholder="שם הכפתור..."
        onChange={(e) => onLabelChange(e.target.value)}
        onClick={(e) => e.stopPropagation()}
      />
      <button
        type="button"
        onClick={onToggle}
        className={[
          "mt-3 w-full rounded-xl px-3 py-2 text-sm font-semibold transition-colors",
          selected
            ? "bg-white/20 text-white hover:bg-white/30"
            : "border border-orange-200 bg-orange-50/60 text-orange-900 hover:bg-orange-100/70",
        ].join(" ")}
      >
        {selected ? "✓ נבחר" : "בחרו כפתור זה"}
      </button>
    </div>
  );
}

function CustomBusinessFieldRow({
  field,
  value,
  onLabelChange,
  onValueChange,
  onRemove,
}: {
  field: CustomBusinessField;
  value: unknown;
  onLabelChange: (label: string) => void;
  onValueChange: (v: unknown) => void;
  onRemove?: () => void;
}) {
  const inputClass =
    "field-input";

  return (
    <div className="field-card">
      <div className="mb-3 flex items-start justify-between gap-3">
        <label className="flex min-w-0 flex-1 flex-col gap-2">
          <span className="text-sm font-medium text-[#17140f]">שם השדה</span>
          <input
            className={`h-11 ${inputClass}`}
            type="text"
            value={field.label}
            placeholder="כותרת השדה..."
            onChange={(e) => onLabelChange(e.target.value)}
          />
        </label>
        {onRemove ? (
          <button
            type="button"
            onClick={onRemove}
            className="mt-7 shrink-0 rounded-lg px-2 py-1 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50"
            aria-label="הסר שדה"
          >
            הסר
          </button>
        ) : null}
      </div>
      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium text-[#17140f]">תוכן</span>
        <textarea
          className={`min-h-28 ${inputClass}`}
          value={typeof value === "string" ? value : ""}
          placeholder="הקלידו כאן..."
          onChange={(e) => onValueChange(e.target.value)}
        />
      </label>
    </div>
  );
}

function FieldOrderRow({
  toolbar,
  children,
}: {
  toolbar: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="relative">
      {toolbar}
      {children}
    </div>
  );
}

function FieldOrderToolbar({
  onRemove,
}: {
  fieldId: string;
  onRemove?: () => void;
}) {
  if (!onRemove) return null;
  return (
    <div className="absolute left-3 top-3 z-10">
      <button
        type="button"
        className="rounded-full border border-red-200 bg-white/90 px-3 py-1 text-xs font-semibold text-red-600 shadow-sm transition-colors hover:bg-red-50"
        onClick={onRemove}
      >
        הסר
      </button>
    </div>
  );
}

function DemoDashboardNoticePill() {
  return (
    <span
      className={[
        "inline-flex min-h-[6rem] min-w-[14rem] flex-col items-center justify-center gap-1.5 rounded-xl px-8 py-5 text-center text-base font-semibold leading-snug shadow-md select-none lg:w-full lg:min-w-0",
        accentStyles.indigo.pillActive,
      ].join(" ")}
      aria-hidden="true"
    >
      <span className="text-lg font-bold">עצור!</span>
      <span className="max-w-[14rem] text-sm font-medium leading-snug opacity-95">
        זה השלב לשלוח ולקבל דמו - דשבורד
      </span>
    </span>
  );
}

function StepPill({
  id,
  current,
  label,
  onClick,
}: {
  id: StepId;
  current: StepId;
  label: string;
  onClick: () => void;
}) {
  const active = current === id;
  const accent = stepAccents[id];
  const a = accentStyles[accent];
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "shrink-0 rounded-lg px-4 py-2.5 text-right text-sm font-semibold transition-all duration-200 lg:w-full",
        active
          ? a.pillActive
          : "border border-black/[0.1] bg-[#fffdf7] text-[#6f665a] shadow-sm hover:bg-white hover:text-[#17140f]",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

function FieldRenderer({
  field,
  value,
  onChange,
  onBlur,
  hideLabel,
}: {
  field: Field;
  value: unknown;
  onChange: (v: unknown) => void;
  onBlur?: () => void;
  hideLabel?: boolean;
}) {
  const label = field.label;
  const required = Boolean(field.required);

  const inputClass =
    "field-input";
  const textareaClass =
    field.type === "textarea" && field.size === "double"
      ? `min-h-56 ${inputClass}`
      : `min-h-28 ${inputClass}`;

  if (field.type === "checkbox") {
    const checked = Boolean(value);
    return (
      <label
        className={[
          "flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors",
          checked
            ? "border-orange-400 bg-orange-50/70"
            : "border-black/[0.1] bg-[#fffdf7] hover:border-orange-200",
        ].join(" ")}
      >
        <input
          className="mt-1 h-4 w-4 accent-[#e0431f]"
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div className="min-w-0">
          <div className="text-sm font-medium text-[#17140f]">
            {label} {required ? <span className="text-red-500">*</span> : null}
          </div>
        </div>
      </label>
    );
  }

  return (
    <label
      className={
        hideLabel
          ? "flex flex-col gap-2"
          : "field-card flex flex-col gap-2 transition-colors"
      }
    >
      {!hideLabel ? (
        <div className="text-sm font-medium text-[#17140f]">
          {label} {required ? <span className="text-red-500">*</span> : null}
        </div>
      ) : null}
      {field.type === "textarea" ? (
        <textarea
          className={textareaClass}
          value={typeof value === "string" ? value : ""}
          placeholder={field.placeholder ?? ""}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
        />
      ) : field.type === "select" ? (
        <select
          className={`h-11 ${inputClass}`}
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
        >
          <option value="">בחרו...</option>
          {field.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          className={`h-11 ${inputClass}`}
          type={field.type}
          value={typeof value === "string" ? value : ""}
          placeholder={field.placeholder ?? ""}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
        />
      )}
    </label>
  );
}
