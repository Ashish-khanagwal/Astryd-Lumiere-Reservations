import { usePublicData } from '../context/PublicDataContext';
import { usePageContent } from '../context/usePageContent';

interface ChefStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChefStoryModal: React.FC<ChefStoryModalProps> = ({ isOpen, onClose }) => {
  const { sections, mediaMap } = usePublicData();
  const c = usePageContent('global');
  if (!isOpen) return null;

  const about = sections.find((s) => s.type === 'about');
  const content = about?.type === 'about' ? about.content : undefined;
  const chefName = content?.chefName ?? c.text('chefNameFallback');
  const chefQuote = content?.chefQuote ?? '';
  const chefBio = content?.chefBio ?? '';
  const chefImage = content?.chefImageMediaId ? mediaMap.get(content.chefImageMediaId)?.fileUrl : undefined;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div className="bg-surface w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden border border-outline-variant/20 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 bg-surface-container flex items-center justify-between border-b border-outline-variant/20 font-sans">
          <div>
            <span className="font-label-sm text-tertiary uppercase tracking-[0.2em] font-bold">{c.text('chefEyebrow')}</span>
            <h3 className="font-serif text-2xl text-on-surface font-semibold">{chefName}</h3>
          </div>
          <button
            onClick={onClose}
            aria-label={c.text('chefCloseAriaLabel')}
            className="w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center text-secondary hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto space-y-6 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {chefImage && (
              <img
                src={chefImage}
                alt={chefName}
                className="w-full aspect-[4/5] object-cover rounded-xl shadow-lg border border-outline-variant/20"
              />
            )}
            <div className="md:col-span-2 space-y-4">
              {chefQuote && (
                <blockquote className="font-body-lg text-primary font-medium italic border-l-2 border-primary pl-4 py-1">
                  "{chefQuote}"
                </blockquote>
              )}
              {chefBio && <p className="font-body-md text-secondary leading-relaxed">{chefBio}</p>}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-surface-container border-t border-outline-variant/20 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-primary text-on-primary font-body-md font-semibold hover:bg-primary-container transition-all"
          >
            {c.text('chefCloseButton')}
          </button>
        </div>
      </div>
    </div>
  );
};
