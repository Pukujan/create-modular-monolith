import { Navigate, Outlet, Route, Routes, useParams } from "react-router-dom";
import { AppLayout, AppModeProvider, DataProvider } from "../modules/app-shell/index.js";
import { MarketingLayout } from "../modules/marketing/components/MarketingLayout.jsx";
import { HomePage } from "../modules/marketing/pages/HomePage.jsx";
import { StaticPage } from "../modules/marketing/pages/StaticPage.jsx";
import { CaseSessionProvider } from "../modules/case-management/context/CaseSessionProvider.jsx";
import {
  CaseInfoPage,
  ConferencesPage,
  CorrespondencePage,
  CourtAlertsPage,
  DashboardPage,
  DefenseContactsPage,
  DocumentsPage,
  EmailsPage,
  RulesAuthorityPage,
  SectionPage
} from "../modules/case-management/pages/index.js";
import { CaseIdProvider, CaseIdRedirect } from "../shared/hooks/useCaseId.js";
import { DEFAULT_CASE_ID } from "../shared/constants/case.js";
import {
  AiOpsRunRedirect,
  AiOpsRunProvider,
  AiOpsCaseScopeProvider,
  DocumentVaultPage
} from "../modules/ai-ops/index.js";
import {
  AiOpsWireframeLayout,
  RulePipelinePage,
  AgentWorkbenchPage
} from "../modules/ai-ops/wireframe/index.js";
import {
  AiOpsArchivedShell,
  AiOpsOverviewPage as ArchivedAiOpsOverviewPage,
  AgentInspectorPage as ArchivedAgentInspectorPage,
  AiOpsRunRedirect as ArchivedAiOpsRunRedirect
} from "../modules/ai-ops/archive/simplified-tabs-v1/index.js";

const SECTION_ROUTES = [
  ["docket", "Docket"],
  ["calendar", "Calendar"],
  ["tasks", "Tasks"],
  ["discovery", "Discovery"],
  ["depositions", "Depositions"],
  ["pleadings", "Pleadings"],
  ["medical", "Medical"],
  ["experts", "Experts"],
  ["insurance", "Insurance"],
  ["liens-costs", "Liens / Costs"],
  ["notes", "Notes"],
  ["history", "History"]
];

const HISTORY_COLS = [
  { key: "timestamp", label: "When" },
  { key: "title", label: "Event" },
  { key: "user", label: "User" },
  { key: "status", label: "Status" }
];

const TABLE_COLS = [
  { key: "date", label: "Date" },
  { key: "title", label: "Title" },
  { key: "type", label: "Type" },
  { key: "assignedTo", label: "Assigned" },
  { key: "status", label: "Status" }
];

function CaseShell() {
  return (
    <CaseSessionProvider>
      <AppModeProvider>
        <CaseIdProvider>
          <CaseIdRedirect />
          <DataProvider>
            <AppLayout />
          </DataProvider>
        </CaseIdProvider>
      </AppModeProvider>
    </CaseSessionProvider>
  );
}

function workspaceCaseRoutes(prefix) {
  const casesRoot = `${prefix}/cases`;
  const caseBase = `${casesRoot}/:caseId`;
  return (
    <>
      <Route path={casesRoot} element={<Navigate to={`${casesRoot}/${DEFAULT_CASE_ID}`} replace />} />
      <Route path={`${caseBase}/*`} element={<CaseShell />}>
        <Route index element={<DashboardPage />} />
        <Route path="case-info" element={<CaseInfoPage />} />
        <Route path="emails" element={<EmailsPage />} />
        <Route path="court-alerts" element={<CourtAlertsPage />} />
        <Route path="conferences" element={<ConferencesPage />} />
        <Route path="defense-contacts" element={<DefenseContactsPage />} />
        <Route path="rules-authority" element={<RulesAuthorityPage />} />
        <Route path="correspondence" element={<CorrespondencePage />} />
        <Route path="documents" element={<DocumentsPage />} />
        <Route path="contacts" element={<Navigate to="../defense-contacts" replace />} />
        <Route path="liens" element={<Navigate to="../liens-costs" replace />} />
        <Route path="costs" element={<Navigate to="../liens-costs" replace />} />
        {SECTION_ROUTES.map(([key, title]) => (
          <Route
            key={key}
            path={key}
            element={
              <SectionPage
                sectionKey={key}
                title={title}
                columns={key === "history" ? HISTORY_COLS : TABLE_COLS}
              />
            }
          />
        ))}
      </Route>
    </>
  );
}

function AiOpsShell() {
  return (
    <AiOpsRunProvider>
      <AiOpsCaseScopeProvider>
        <Outlet />
      </AiOpsCaseScopeProvider>
    </AiOpsRunProvider>
  );
}

function CaseScopedAiOpsShell() {
  const { caseId } = useParams();
  return (
    <CaseIdProvider>
      <AiOpsRunProvider>
        <AiOpsCaseScopeProvider lockedCaseId={caseId}>
          <Outlet />
        </AiOpsCaseScopeProvider>
      </AiOpsRunProvider>
    </CaseIdProvider>
  );
}

function aiOpsRouteChildren() {
  return (
    <>
      <Route element={<AiOpsWireframeLayout />}>
        <Route index element={<RulePipelinePage />} />
        <Route path="agents/:agentId" element={<AgentWorkbenchPage />} />
        <Route path="document-vault" element={<DocumentVaultPage />} />
      </Route>
      <Route path="archive" element={<AiOpsArchivedShell />}>
        <Route index element={<ArchivedAiOpsOverviewPage />} />
        <Route path="document-vault" element={<DocumentVaultPage />} />
        <Route path="agents/:agentId" element={<ArchivedAgentInspectorPage />} />
        <Route path="runs/:runId" element={<ArchivedAiOpsRunRedirect />} />
      </Route>
      <Route path="runs/:runId" element={<AiOpsRunRedirect />} />
      <Route path="rule-discovery" element={<Navigate to=".." replace />} />
      <Route path="case-record" element={<Navigate to=".." replace />} />
      <Route path="workflow" element={<Navigate to=".." replace />} />
      <Route path="pipeline" element={<Navigate to=".." replace />} />
      <Route
        path="agents"
        element={<Navigate to="../agents/agent_case_document_ocr_v1" replace />}
      />
    </>
  );
}

function aiOpsRoutes(prefix) {
  const root = `${prefix}/ai-ops`;
  return (
    <>
      <Route path={root} element={<AiOpsShell />}>
        {aiOpsRouteChildren()}
      </Route>
      <Route path={`${prefix}/cases/:caseId/ai-ops`} element={<CaseScopedAiOpsShell />}>
        {aiOpsRouteChildren()}
      </Route>
    </>
  );
}

export function AppRouter() {
  return (
    <Routes>
      <Route element={<MarketingLayout />}>
        <Route index element={<HomePage />} />
        <Route
          path="about"
          element={
            <StaticPage
              title="About"
              body="Litigation Workflow Workspace brings case navigation, document review, and source verification into one neutral, vendor-agnostic interface."
            />
          }
        />
        <Route
          path="pricing"
          element={
            <StaticPage
              title="Pricing"
              body="Contact us for firm-wide licensing. The public demo runs entirely in the browser with local JSON — no API keys required."
            />
          }
        />
        <Route
          path="contact"
          element={
            <StaticPage
              title="Contact"
              body="Reach your implementation team to connect app mode to your case management API."
            />
          }
        />
      </Route>
      {workspaceCaseRoutes("/demo")}
      {workspaceCaseRoutes("/app")}
      {aiOpsRoutes("/demo")}
      <Route path="/app/ai-ops/*" element={<Navigate to="/demo/ai-ops" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
