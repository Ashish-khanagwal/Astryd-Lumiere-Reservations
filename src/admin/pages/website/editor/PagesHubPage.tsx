import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ExternalLink, Globe, Lock, MousePointerClick, PanelsTopLeft } from 'lucide-react';
import { usePageConfigs, useUpdatePageConfig } from '../../../hooks/api/usePageConfigs';
import { useHomepageDraft, usePublishWebsite, useWebsiteStatus } from '../../../hooks/api/useWebsite';
import { useAdminToast } from '../../../context/AdminToastContext';
import { draftPreviewUrl } from '../../../context/DraftSaveContext';
import { useRestaurant } from '../../../../context/RestaurantContext';
import { PageHeader } from '../../../components/PageHeader';
import { ReorderableList } from '../../../components/ReorderableList';
import { ToggleField } from '../../../components/forms/ToggleField';
import { Button } from '../../../components/Button';
import { ListSkeleton } from '../../../components/Skeleton';
import { VARIANT_INFO } from '../../settings/pageConfigMeta';
import { EDITOR_PAGES, EDITOR_PAGE_BY_KEY, type EditorPageDef } from './editorPages';
import type { PageConfig } from '../../../../types';

function PageRow({
  def,
  title,
  meta,
  trailing,
  dragHandle,
  muted,
}: {
  def: EditorPageDef;
  title: string;
  meta: ReactNode;
  trailing?: ReactNode;
  dragHandle?: ReactNode;
  muted?: boolean;
}) {
  const navigate = useNavigate();
  const Icon = def.icon;
  return (
    <div className={`group flex items-center gap-3 rounded-2xl border border-outline-variant/25 px-3 py-3 transition-all hover:border-primary/40 hover:shadow-sm ${muted ? 'bg-surface-container-low/60' : 'bg-surface'}`}>
      {dragHandle ?? <span className="w-6 shrink-0" />}
      <button type="button" onClick={() => navigate(`/admin/website/pages/${def.key}`)} className="flex flex-1 min-w-0 items-center gap-3 text-left">
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${muted ? 'bg-surface-container-high text-secondary' : 'bg-primary/10 text-primary'}`}>
          <Icon className="h-5 w-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className={`block font-semibold truncate ${muted ? 'text-secondary' : 'text-on-surface'}`}>{title}</span>
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-0.5 text-xs text-secondary">{meta}</span>
        </span>
      </button>
      {trailing}
      <Button variant="outline" size="sm" onClick={() => navigate(`/admin/website/pages/${def.key}`)} className="shrink-0">
        Edit <ChevronRight className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

const Chip = ({ children }: { children: ReactNode }) => (
  <span className="inline-flex items-center gap-1 rounded-full bg-surface-container-high px-2 py-0.5 text-[11px] font-medium text-secondary">{children}</span>
);

/** Website → Site Editor: every page of the site in navigation order, plus site-wide settings - the entry point to the live editor. */
export function PagesHubPage() {
  const { restaurantId } = useRestaurant();
  const { data: pageConfigs, isLoading } = usePageConfigs();
  const { data: homepage } = useHomepageDraft();
  const { data: website } = useWebsiteStatus();
  const updateConfig = useUpdatePageConfig();
  const publishWebsite = usePublishWebsite();
  const { showToast } = useAdminToast();
  const [ordered, setOrdered] = useState<PageConfig[]>([]);

  useEffect(() => {
    if (pageConfigs) setOrdered([...pageConfigs].sort((a, b) => a.order - b.order));
  }, [pageConfigs]);

  const sectionSummary = useMemo(() => {
    const all = homepage?.sections ?? [];
    return `${all.filter((s) => s.visible).length} of ${all.length} sections shown`;
  }, [homepage]);

  const reorder = (next: PageConfig[]) => {
    setOrdered(next);
    next.forEach((row, order) => {
      if (row.order !== order) updateConfig.mutate({ module: row.module, patch: { order } });
    });
    showToast('Menu order updated.');
  };

  const pageDefFor = (config: PageConfig) => EDITOR_PAGES.find((p) => p.module === config.module)!;
  const home = EDITOR_PAGE_BY_KEY.home;
  const checkout = EDITOR_PAGE_BY_KEY.checkout;

  return (
    <div className="space-y-8">
      <PageHeader
        icon={PanelsTopLeft}
        title="Site Editor"
        description="Pick a page to edit its sections, text, images and layout side by side with a live preview."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" icon={ExternalLink} onClick={() => window.open(`${draftPreviewUrl(restaurantId)}#/`, '_blank', 'noopener,noreferrer')}>
              Preview site
            </Button>
            <Button
              variant="primary"
              icon={Globe}
              loading={publishWebsite.isPending}
              onClick={() => publishWebsite.mutate(undefined, { onSuccess: () => showToast('Website published - your changes are live.') })}
            >
              Publish
            </Button>
          </div>
        }
      />

      <div className="flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3">
        <MousePointerClick className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        <p className="text-sm text-on-surface">
          Your edits save automatically as a <strong>draft</strong> - visitors only see them after you press <strong>Publish</strong>.
          <span className="block text-xs text-secondary mt-0.5">
            {website?.publishedAt ? `Last published ${new Date(website.publishedAt).toLocaleString()}.` : 'Not published yet.'} In the editor, click any part of the preview to jump straight to it.
          </span>
        </p>
      </div>

      <section className="space-y-3">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-widest text-secondary">Site-wide</h2>
          <p className="text-xs text-secondary mt-1">Shown on every page.</p>
        </div>
        <div className="grid gap-3 lg:grid-cols-2">
          {EDITOR_PAGES.filter((p) => p.group === 'site').map((def) => (
            <PageRow key={def.key} def={def} title={def.title} meta={<span>{def.description}</span>} />
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-widest text-secondary">Pages</h2>
          <p className="text-xs text-secondary mt-1">In the order they appear in your site's menu - drag to reorder.</p>
        </div>

        <PageRow
          def={home}
          title="Home"
          meta={
            <>
              <Chip>
                <Lock className="h-3 w-3" /> Always first
              </Chip>
              <span>{sectionSummary}</span>
            </>
          }
        />

        {isLoading ? (
          <ListSkeleton rows={4} />
        ) : (
          <ReorderableList
            items={ordered}
            onReorder={reorder}
            renderItem={(config, dragHandle) => {
              const def = pageDefFor(config);
              return (
                <PageRow
                  def={def}
                  title={config.navLabel}
                  muted={!config.enabled}
                  dragHandle={dragHandle}
                  meta={
                    <>
                      <Chip>{def.title}</Chip>
                      <span>Layout: {VARIANT_INFO[config.module][config.templateVariant].name}</span>
                      {!config.enabled && <span className="font-semibold">Hidden from menu</span>}
                    </>
                  }
                  trailing={
                    <div className="shrink-0" title={config.enabled ? 'Shown in menu' : 'Hidden from menu'}>
                      <ToggleField
                        label=""
                        checked={config.enabled}
                        onChange={(enabled) =>
                          updateConfig.mutate({ module: config.module, patch: { enabled } }, { onSuccess: () => showToast(enabled ? `${config.navLabel} shown in menu.` : `${config.navLabel} hidden from menu.`) })
                        }
                      />
                    </div>
                  }
                />
              );
            }}
          />
        )}

        <PageRow def={checkout} title="Checkout" meta={<span>Not in the menu - opens from the cart</span>} />
      </section>
    </div>
  );
}
