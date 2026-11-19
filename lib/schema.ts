import tabsRaw from "@/schema/tabs.json";
import featuresRaw from "@/schema/features.json";
import fieldsRaw from "@/schema/fields.json";
import businessFieldsRaw from "@/schema/business-fields.json";
import contactFieldsRaw from "@/schema/contact-fields.json";

export type Tab = {
  id: string;
  label: string;
  description?: string;
};

export type Feature = {
  id: string;
  tabId: string;
  group?: string;
  label: string;
  description?: string;
};

export type FieldWhen = {
  tabsAny?: string[];
  featuresAny?: string[];
  businessStep?: boolean;
  contactStep?: boolean;
};

export type FieldOption = { value: string; label: string };

export type Field =
  | {
      id: string;
      type: "text" | "email" | "tel";
      label: string;
      placeholder?: string;
      required?: boolean;
      when?: FieldWhen;
    }
  | {
      id: string;
      type: "textarea";
      label: string;
      placeholder?: string;
      required?: boolean;
      when?: FieldWhen;
      /** Taller textarea — twice the default height. */
      size?: "double";
    }
  | {
      id: string;
      type: "checkbox";
      label: string;
      required?: boolean;
      when?: FieldWhen;
    }
  | {
      id: string;
      type: "select";
      label: string;
      required?: boolean;
      when?: FieldWhen;
      options: FieldOption[];
    };

export type CustomBusinessField = {
  id: string;
  label: string;
};

export type CustomContactField = {
  id: string;
  label: string;
};

export type CustomDashboardTab = {
  id: string;
  label: string;
};

export type CustomModuleFeature = {
  id: string;
  tabId: string;
  label: string;
};

export type CustomModuleField = {
  id: string;
  featureId: string;
  label: string;
};

export const tabs = tabsRaw as Tab[];
export const features = featuresRaw as Feature[];
export const moduleFields = fieldsRaw as Field[];
export const businessFields = businessFieldsRaw as Field[];
export const contactFields = contactFieldsRaw as Field[];
export const fields = [...moduleFields, ...businessFields, ...contactFields] as Field[];

export function isBusinessStepField(field: Field): boolean {
  return Boolean(field.when?.businessStep);
}

export function isContactStepField(field: Field): boolean {
  return Boolean(field.when?.contactStep);
}
