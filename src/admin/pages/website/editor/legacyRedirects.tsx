import { Navigate, useParams } from 'react-router-dom';

/** /admin/website/homepage/:type → the Home page's Sections tab with that section open. */
export function LegacySectionRedirect() {
  const { type } = useParams<{ type: string }>();
  return <Navigate to={`/admin/website/pages/home?tab=sections&section=${type ?? ''}`} replace />;
}

const CONTENT_PAGE_TO_EDITOR: Record<string, string> = {
  landing: 'home',
  global: 'header-footer',
};

/** /admin/website/content/:page → that page's "Text & images" tab in the Site Editor. */
export function LegacyContentRedirect() {
  const { page } = useParams<{ page: string }>();
  const target = CONTENT_PAGE_TO_EDITOR[page ?? ''] ?? page ?? 'home';
  return <Navigate to={`/admin/website/pages/${target}?tab=content`} replace />;
}
