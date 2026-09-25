import { useEffect, useId, useRef, useState } from 'react';
import { usePageContent } from '../context/usePageContent';

interface FinixTokenResponse {
  data?: { id?: string };
}

interface FinixFormInstance {
  destroy?: () => void;
}

interface FinixGlobal {
  PaymentForm: (
    element: string | HTMLElement,
    environment: 'sandbox' | 'prod',
    applicationId: string,
    options: Record<string, unknown>,
  ) => FinixFormInstance;
}

declare global {
  interface Window {
    Finix?: FinixGlobal;
  }
}

let scriptPromise: Promise<void> | null = null;

function loadFinixScript() {
  if (window.Finix) return Promise.resolve();
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-finix-js]');
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('Unable to load secure card fields.')), { once: true });
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://js.finix.com/v/2/finix.js';
    script.async = true;
    script.dataset.finixJs = 'true';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Unable to load secure card fields.'));
    document.head.appendChild(script);
  });
  return scriptPromise;
}

interface FinixCardFormProps {
  amountCents: number;
  disabled?: boolean;
  onToken: (token: string) => Promise<void>;
  onError: (message: string) => void;
}

export function FinixCardForm({ amountCents, disabled, onToken, onError }: FinixCardFormProps) {
  const reactId = useId();
  const elementId = `finix-card-${reactId.replace(/:/g, '')}`;
  const formRef = useRef<FinixFormInstance | null>(null);
  const [loading, setLoading] = useState(true);
  const content = usePageContent('global');
  // Read through a ref so editing copy never re-initialises the hosted card form.
  const contentRef = useRef(content);
  contentRef.current = content;
  const applicationId = import.meta.env.VITE_FINIX_APPLICATION_ID as string | undefined;
  const environment = (import.meta.env.VITE_FINIX_ENVIRONMENT ?? 'sandbox') as 'sandbox' | 'prod';

  useEffect(() => {
    let active = true;
    if (!applicationId) {
      setLoading(false);
      onError(contentRef.current.text('cardNotConfigured'));
      return;
    }
    loadFinixScript()
      .then(() => {
        if (!active || !window.Finix) return;
        formRef.current = window.Finix.PaymentForm(elementId, environment, applicationId, {
          paymentMethods: ['card'],
          showAddress: false,
          theme: 'finix',
          submitLabel: contentRef.current.text('cardPayButton', { amount: (amountCents / 100).toFixed(2) }),
          onLoad: () => active && setLoading(false),
          onSubmit: async (error: unknown, response: FinixTokenResponse) => {
            if (error) {
              onError(contentRef.current.text('cardInvalid'));
              return;
            }
            const token = response?.data?.id;
            if (!token) {
              onError(contentRef.current.text('cardNoToken'));
              return;
            }
            await onToken(token);
          },
        });
      })
      .catch(() => {
        if (active) {
          setLoading(false);
          onError(contentRef.current.text('cardLoadError'));
        }
      });
    return () => {
      active = false;
      formRef.current?.destroy?.();
      formRef.current = null;
    };
  }, [amountCents, applicationId, elementId, environment, onError, onToken]);

  return (
    <div className={disabled ? 'pointer-events-none opacity-60' : undefined}>
      {loading && <p className="text-sm text-secondary">{content.text('cardLoading')}</p>}
      <div id={elementId} aria-busy={loading} />
    </div>
  );
}
