"use client";

import type { ComponentType } from "react";
import { AttendanceClockDemo, MiniAttendanceClock } from "./AttendanceClockDemo";
import { DashboardDemo, MiniDashboard } from "./DashboardDemo";
import { TasksDemo, MiniTasks } from "./TasksDemo";
import { ProjectsDemo, MiniProjects } from "./ProjectsDemo";
import {
  MarketingDemo,
  MiniMarketing,
  ProposalsDemo,
  MiniProposals,
  AgreementsDemo,
  MiniAgreements,
} from "./HubDemos";
import { MediaDemo, MiniMedia } from "./MediaDemo";
import { FaqDemo, MiniFaq } from "./FaqDemo";
import { FinanceDemo, MiniFinance } from "./FinanceDemo";
import { ChatDemo, MiniChat } from "./ChatDemo";
import {
  CustomersDemo,
  MiniCustomers,
  MeetingsDemo,
  MiniMeetings,
  NotificationsDemo,
  MiniNotifications,
  PostsDemo,
  MiniPosts,
} from "./WorkspaceDemos";
import {
  IntegrationsDemo,
  MiniIntegrations,
  SettingsDemo,
  MiniSettings,
  PermissionsDemo,
  MiniPermissions,
  QuickLinksDemo,
  LinksDemo,
  MiniLinks,
} from "./SystemDemos";
import {
  CourseMaterialsDemo,
  MiniCourse,
  ContentCreationDemo,
  MiniContent,
  AssessmentsDemo,
  MiniAssessments,
  MarketingLeadsDemo,
  MiniMarketingLeads,
} from "./ContentDemos";

export type DemoEntry = {
  /** כותרת החלון */
  title: string;
  /** תיאור קצר מתחת לכותרת */
  subtitle?: string;
  /** רכיב הדמו החי (בחלון) */
  Component: ComponentType;
  /** תצוגה מוקטנת חיה להטמעה על כרטיס המודול בלוח */
  Mini?: ComponentType;
};

/**
 * מרשם דמואים לפי מזהה מודול (tab id) מתוך schema/tabs.json.
 * להוספת דמו חדש: מוסיפים רכיב תחת ./ ורושמים אותו כאן לפי המזהה.
 */
export const demoRegistry: Record<string, DemoEntry> = {
  dashboard: {
    title: "הדשבורד",
    subtitle: "מבט-על על כל המערכת — לחצו על מודול כדי להיכנס",
    Component: DashboardDemo,
    Mini: MiniDashboard,
  },
  attendance_clock: {
    title: "שעון נוכחות",
    subtitle: "כך העובדים יחתימו כניסה ויציאה — נסו בעצמכם",
    Component: AttendanceClockDemo,
    Mini: MiniAttendanceClock,
  },
  tasks: {
    title: "משימות",
    subtitle: "רשימת המשימות שלך — סמנו, הוסיפו ונהלו",
    Component: TasksDemo,
    Mini: MiniTasks,
  },
  projects: {
    title: "הפרויקטים",
    subtitle: "ניהול פרויקטים לפי שלבי תהליך — לחצו על שלב לסימון",
    Component: ProjectsDemo,
    Mini: MiniProjects,
  },
  marketing_materials_gantt: {
    title: "חומרי השיווק",
    subtitle: "מרכז השיווק — לידים, מיילים וחומרים במקום אחד",
    Component: MarketingDemo,
    Mini: MiniMarketing,
  },
  sales: {
    title: "הצעות מחיר",
    subtitle: "מהרעיון ועד הצעה מנצחת — נסו את המרכז",
    Component: ProposalsDemo,
    Mini: MiniProposals,
  },
  create_documents: {
    title: "הסכמים",
    subtitle: "סוגרים דברים כמו שצריך — הסכם מסודר בכמה דקות",
    Component: AgreementsDemo,
    Mini: MiniAgreements,
  },
  media: {
    title: "המדיה",
    subtitle: "העלאת תכנים למדיה — בחרו פלטפורמות, העלו קובץ ופרסמו",
    Component: MediaDemo,
    Mini: MiniMedia,
  },
  faq: {
    title: "שו״ת",
    subtitle: "שאלות ותשובות — חפשו, פתחו והוסיפו",
    Component: FaqDemo,
    Mini: MiniFaq,
  },
  finance: {
    title: "פיננסים",
    subtitle: "הכנסות, הוצאות ורווח — במבט אחד",
    Component: FinanceDemo,
    Mini: MiniFinance,
  },
  chat: {
    title: "צ׳אט",
    subtitle: "תקשורת צוותית בזמן אמת — נסו לשלוח הודעה",
    Component: ChatDemo,
    Mini: MiniChat,
  },
  customers: {
    title: "לקוחות",
    subtitle: "כל הלקוחות במקום אחד — חיפוש וסטטוס",
    Component: CustomersDemo,
    Mini: MiniCustomers,
  },
  meetings: {
    title: "מפגשים",
    subtitle: "סדר היום שלך — פגישות וסימון ביצוע",
    Component: MeetingsDemo,
    Mini: MiniMeetings,
  },
  notifications: {
    title: "התראות",
    subtitle: "כל העדכונים במקום אחד — נסו לסמן כנקרא",
    Component: NotificationsDemo,
    Mini: MiniNotifications,
  },
  posts: {
    title: "הפוסטים",
    subtitle: "פיד הפוסטים — פרסמו ותנו לייק",
    Component: PostsDemo,
    Mini: MiniPosts,
  },
  integrations: {
    title: "ממשקים",
    subtitle: "חיבור לכלים החיצוניים — הפעילו חיבור",
    Component: IntegrationsDemo,
    Mini: MiniIntegrations,
  },
  settings: {
    title: "הגדרות",
    subtitle: "התאמת המערכת אליך — נסו את המתגים",
    Component: SettingsDemo,
    Mini: MiniSettings,
  },
  permissions: {
    title: "מורשות",
    subtitle: "ניהול תפקידים והרשאות לצוות",
    Component: PermissionsDemo,
    Mini: MiniPermissions,
  },
  quick_links: {
    title: "קישורים מהירים",
    subtitle: "גישה מהירה לכלים — לחצו לפתיחה",
    Component: QuickLinksDemo,
    Mini: MiniLinks,
  },
  links: {
    title: "קישורים",
    subtitle: "כל הקישורים החשובים במקום אחד",
    Component: LinksDemo,
    Mini: MiniLinks,
  },
  course_materials: {
    title: "חומרי הקורס",
    subtitle: "שיעורים והתקדמות — סמנו מה שהושלם",
    Component: CourseMaterialsDemo,
    Mini: MiniCourse,
  },
  content_creation: {
    title: "יצירת התוכן",
    subtitle: "תבניות תוכן עם AI — בחרו וקבלו טיוטה",
    Component: ContentCreationDemo,
    Mini: MiniContent,
  },
  assessments: {
    title: "הערכות",
    subtitle: "טופס הערכה עם דירוג — דרגו בכוכבים",
    Component: AssessmentsDemo,
    Mini: MiniAssessments,
  },
  marketing: {
    title: "שיווק",
    subtitle: "צינור הלידים — העבירו ליד לשלב הבא",
    Component: MarketingLeadsDemo,
    Mini: MiniMarketingLeads,
  },
};

export function getDemoMini(tabId: string): ComponentType | undefined {
  return demoRegistry[tabId]?.Mini;
}

export function getDemo(tabId: string): DemoEntry | undefined {
  return demoRegistry[tabId];
}

export function hasDemo(tabId: string): boolean {
  return tabId in demoRegistry;
}
