import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { AlertCircle, ArrowLeft, Check, ExternalLink, Eye, Loader2, Monitor, PenLine, Smartphone } from 'lucide-react';
import { usePageConfigs } from '../../../hooks/api/usePageConfigs';
import { usePublishWebsite, useWebsiteStatus } from '../../../hooks/api/useWebsite';
import { useAdminToast } from '../../../context/AdminToastContext';
import { draftPreviewUrl, useDraftSave } from '../../../context/DraftSaveContext';
import { useRestaurant } from '../../../../context/RestaurantContext';
import { Button } from '../../../components/Button';
import { SitePreviewFrame, type PreviewDevice } from '../../../components/SitePreviewFrame';
import type { AutoSaveStatus } from '../../../hooks/useAutoSave';
import { EDITOR_SOURCE, LANDING_EXTRAS_SECTION, isPreviewMessage, type EditorToPreviewMessage, type MessageBody } from '../../../../preview/bridge';
import { EDITOR_PAGES, EDITOR_PAGE_BY_KEY, TAB_LABEL, editorPageForHash, isEditorPageKey, type EditorTab } from './editorPages';
import { SectionsPanel } from './panels/SectionsPanel';
import { PageContentPanel } from './panels/PageContentPanel';
import { LayoutPanel } from './panels/LayoutPanel';
import { PageSettingsPanel } from './panels/PageSettingsPanel';
import { BrandPanel } from './panels/BrandPanel';
import type { HomepageSectionType, TemplateVariant } from '../../../../types';

function SaveStatus({ status, publishedAt }: { status: AutoSaveStatus; publishedAt?: string | null }) {
  if (status === 'saving') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-secondary">
        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving…
      </span>
    );
  }
  if (status === 'error') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-error">
        <AlertCircle className="h-3.5 w-3.5" /> Couldn't save - retrying
      </span>
    );
  }
  if (status === 'saved') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
        <Check className="h-3.5 w-3.5" /> Saved to draft
      </span>
    );
  }
  return (
    <span className="text-xs text-secondary truncate">
      {publishedAt ? `Last published ${new Date(publishedAt).toLocaleString()}` : 'Not published yet'}
    </span>
  );
}

/**
 * Website → Site Editor → <page>: one place per page for sections, text & images, layout and settings,
 * next to a live preview (Wix / WordPress Customizer style). Edits auto-save to the draft; the preview
 * refetches after each save; Publish pushes the draft live.
 */
export function SiteEditorPage() {
  const { page: pageParam } = useParams<{ page: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { restaurantId, sites } = useRestaurant();
  const { data: pageConfigs } = usePageConfigs();
  const { data: website } = useWebsiteStatus();
  const publishWebsite = usePublishWebsite();
  const { flushDraft } = useDraftSave();
  const { showToast } = useAdminToast();

  const def = isEditorPageKey(pageParam) ? EDITOR_PAGE_BY_KEY[pageParam] : undefined;
  const tabParam = searchParams.get('tab') as EditorTab | null;
  const tab: EditorTab = def && tabParam && def.tabs.includes(tabParam) ? tabParam : (def?.tabs[0] ?? 'content');
  const openSection = (searchParams.get('section') as HomepageSectionType | null) ?? null;
  const config = def?.module ? pageConfigs?.find((p) => p.module === def.module) : undefined;
  const vertical = sites.find((s) => s.id === restaurantId)?.vertical ?? 'restaurant';

  const [device, setDevice] = useState<PreviewDevice>('desktop');
  const [mobilePane, setMobilePane] = useState<'edit' | 'preview'>('edit');
  const [status, setStatus] = useState<AutoSaveStatus>('idle');
  const [previewVariant, setPreviewVariant] = useState<TemplateVariant>('a');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Reset per-page state when switching pages.
  useEffect(() => {
    setStatus('idle');
    if (config) setPreviewVariant(config.templateVariant);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [def?.key, config?.templateVariant]);

  const post = useCallback((message: MessageBody<EditorToPreviewMessage>) => {
    iframeRef.current?.contentWindow?.postMessage({ source: EDITOR_SOURCE, ...message }, window.location.origin);
  }, []);

  const refreshPreview = useCallback(() => post({ type: 'refresh' }), [post]);

  // The iframe keeps one URL while you move between pages (we message it to navigate instead of reloading);
  // it only reloads when previewing an unapplied layout, which has to be in the URL.
  const baseUrl = useMemo(() => `${draftPreviewUrl(restaurantId)}&editor=1`, [restaurantId]);
  const currentHashRef = useRef(def?.previewHash ?? '#/');
  currentHashRef.current = def?.previewHash ?? '#/';
  const layoutParam = def?.module && tab === 'layout' && config && previewVariant !== config.templateVariant ? `&layout=${def.module}:${previewVariant}` : '';
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const frameSrc = useMemo(() => `${baseUrl}${layoutParam}${currentHashRef.current}`, [baseUrl, layoutParam]);

  const focusTarget = def?.key === 'home' ? (tab === 'content' ? LANDING_EXTRAS_SECTION : openSection) : null;

  useEffect(() => {
    if (!def) return;
    post({ type: 'navigate', hash: def.previewHash });
  }, [def, post]);

  useEffect(() => {
    if (focusTarget) post({ type: 'scrollTo', section: focusTarget });
  }, [focusTarget, post]);

  // Preview → editor: follow page changes and "click to edit" on a section.
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || !isPreviewMessage(event.data)) return;
      const msg = event.data;
      if (msg.type === 'ready') {
        post({ type: 'navigate', hash: currentHashRef.current });
        if (focusTarget) window.setTimeout(() => post({ type: 'scrollTo', section: focusTarget }), 400);
      } else if (msg.type === 'navigated') {
        const key = editorPageForHash(msg.hash);
        if (key && key !== def?.key) navigate(`/admin/website/pages/${key}`);
      } else if (msg.type === 'selectSection') {
        if (msg.section === LANDING_EXTRAS_SECTION) navigate('/admin/website/pages/home?tab=content');
        else navigate(`/admin/website/pages/home?tab=sections&section=${msg.section}`);
        setMobilePane('edit');
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [def?.key, focusTarget, navigate, post]);

  if (!def) return <Navigate to="/admin/website/pages" replace />;

  const setTab = (next: EditorTab) => setSearchParams(next === def.tabs[0] ? {} : { tab: next });
  const setOpenSection = (type: HomepageSectionType | null) => setSearchParams(type ? { tab: 'sections', section: type } : { tab: 'sections' });
  const callbacks = { onSaved: refreshPreview, onStatus: setStatus };

  const handlePublish = async () => {
    await flushDraft();
    await publishWebsite.mutateAsync();
    showToast('Website published - your changes are live.');
    refreshPreview();
  };

  const title = config?.navLabel || def.title;
  const Icon = def.icon;

  const renderPanel = () => {
    switch (tab) {
      case 'sections':
        return (
          <SectionsPanel
            openSection={openSection}
            onOpenSection={setOpenSection}
            onOpenExtras={() => setTab('content')}
            {...callbacks}
          />
        );
      case 'content':
        return def.contentPage ? (
          <PageContentPanel key={def.contentPage} page={def.contentPage} vertical={vertical} activeVariant={config?.templateVariant} {...callbacks} />
        ) : null;
      case 'layout':
        return config ? (
          <LayoutPanel config={config} previewVariant={previewVariant} onPreviewVariant={setPreviewVariant} onApplied={refreshPreview} />
        ) : null;
      case 'settings':
        return config ? <PageSettingsPanel key={config.id} config={config} onSaved={refreshPreview} /> : null;
      case 'header':
        return <BrandPanel mode="header" {...callbacks} />;
      case 'style':
        return <BrandPanel mode="style" {...callbacks} />;
      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col bg-surface-container-low">
      {/* Editor top bar */}
      <div className="shrink-0 flex items-center gap-3 px-4 py-2.5 bg-surface border-b border-outline-variant/20">
        <Link to="/admin/website/pages" className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-secondary hover:bg-surface-container-high hover:text-on-surface transition-colors">
          <ArrowLeft className="h-4 w-4" /> <span className="hidden sm:inline">Pages</span>
        </Link>
        <div className="h-6 w-px bg-outline-variant/30" />
        <label className="relative">
          <span className="sr-only">Page</span>
          <select
            value={def.key}
            onChange={(e) => navigate(`/admin/website/pages/${e.target.value}`)}
            className="appearance-none rounded-lg border border-outline-variant/40 bg-surface pl-3 pr-8 py-1.5 text-sm font-semibold text-on-surface hover:border-primary/50 focus:border-primary outline-none cursor-pointer"
          >
            <optgroup label="Site-wide">
              {EDITOR_PAGES.filter((p) => p.group === 'site').map((p) => (
                <option key={p.key} value={p.key}>
                  {p.title}
                </option>
              ))}
            </optgroup>
            <optgroup label="Pages">
              {EDITOR_PAGES.filter((p) => p.group === 'pages').map((p) => (
                <option key={p.key} value={p.key}>
                  {(p.module && pageConfigs?.find((c) => c.module === p.module)?.navLabel) || p.title}
                </option>
              ))}
            </optgroup>
          </select>
        </label>
        <div className="hidden md:block min-w-0">
          <SaveStatus status={status} publishedAt={website?.publishedAt} />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <div className="lg:hidden flex items-center gap-0.5 rounded-lg border border-outline-variant/40 p-0.5">
            {(['edit', 'preview'] as const).map((pane) => (
              <button
                key={pane}
                type="button"
                onClick={() => setMobilePane(pane)}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium capitalize ${mobilePane === pane ? 'bg-primary/10 text-primary' : 'text-secondary'}`}
              >
                {pane === 'edit' ? <PenLine className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />} {pane}
              </button>
            ))}
          </div>
          <div className="hidden lg:flex items-center gap-0.5 rounded-lg border border-outline-variant/40 p-0.5">
            {(['desktop', 'mobile'] as PreviewDevice[]).map((d) => {
              const DIcon = d === 'desktop' ? Monitor : Smartphone;
              return (
                <button
                  key={d}
                  type="button"
                  title={`${d === 'desktop' ? 'Desktop' : 'Mobile'} preview`}
                  onClick={() => setDevice(d)}
                  className={`flex items-center justify-center rounded-md p-1.5 transition-colors ${device === d ? 'bg-primary/10 text-primary' : 'text-secondary hover:bg-surface-container-high hover:text-on-surface'}`}
                >
                  <DIcon className="h-4 w-4" />
                </button>
              );
            })}
          </div>
          <button
            type="button"
            title="Open preview in a new tab"
            onClick={() => window.open(`${baseUrl.replace('&editor=1', '')}${layoutParam}${def.previewHash}`, '_blank', 'noopener,noreferrer')}
            className="hidden sm:flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-secondary hover:bg-surface-container-high hover:text-on-surface transition-colors"
          >
            <ExternalLink className="h-4 w-4" /> <span className="hidden xl:inline">Open preview</span>
          </button>
          <Button variant="primary" size="sm" loading={publishWebsite.isPending} onClick={() => void handlePublish()}>
            Publish
          </Button>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex">
        {/* Edit panel */}
        <aside className={`${mobilePane === 'edit' ? 'flex' : 'hidden'} lg:flex w-full lg:w-[440px] shrink-0 flex-col bg-surface border-r border-outline-variant/20 min-h-0`}>
          <div className="shrink-0 px-5 pt-5 pb-3">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <h1 className="text-lg font-bold text-on-surface tracking-tight leading-tight truncate">{title}</h1>
                <p className="text-xs text-secondary line-clamp-2">{def.description}</p>
              </div>
            </div>
            {def.tabs.length > 1 && (
              <div role="tablist" className="mt-4 flex gap-1 rounded-xl bg-surface-container-low p-1">
                {def.tabs.map((t) => (
                  <button
                    key={t}
                    role="tab"
                    aria-selected={t === tab}
                    type="button"
                    onClick={() => setTab(t)}
                    className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-semibold transition-colors ${
                      t === tab ? 'bg-surface text-primary shadow-sm' : 'text-secondary hover:text-on-surface'
                    }`}
                  >
                    {TAB_LABEL[t]}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto px-5 pb-6 pt-2" key={`${def.key}-${tab}`}>
            {renderPanel()}
          </div>
        </aside>

        {/* Live preview */}
        <section className={`${mobilePane === 'preview' ? 'flex' : 'hidden'} lg:flex flex-1 min-w-0 flex-col`} aria-label="Live preview">
          <div className="flex-1 min-h-0 p-3 lg:p-4">
            <div className="h-full rounded-xl overflow-hidden border border-outline-variant/30 shadow-sm">
              <SitePreviewFrame src={frameSrc} device={device} iframeRef={iframeRef} />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
