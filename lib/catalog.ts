import type {
  CustomBusinessField,
  CustomContactField,
  CustomDashboardTab,
  CustomModuleFeature,
  CustomModuleField,
} from "@/lib/schema";

export type CatalogNote = {
  id: string;
  content: string;
};

export type CatalogData = {
  dashboardTabs: CustomDashboardTab[];
  moduleFeatures: CustomModuleFeature[];
  businessFields: CustomBusinessField[];
  contactFields: CustomContactField[];
  moduleFields: CustomModuleField[];
  approvedNotes: CatalogNote[];
};

export function emptyCatalog(): CatalogData {
  return {
    dashboardTabs: [],
    moduleFeatures: [],
    businessFields: [],
    contactFields: [],
    moduleFields: [],
    approvedNotes: [],
  };
}

/** הערת מסך בדויה. אין כאן קטלוג של לקוחות אמיתיים. */
export const demoCatalog: CatalogData = {
  ...emptyCatalog(),
  approvedNotes: [
    {
      id: "demo-note",
      content: "הערה לדוגמה בלבד. אין במסך הזה הערות או נתונים של לקוח אמיתי.",
    },
  ],
};
