interface RemitaInlineConfig {
  publicKey: string;
  rrr: string;
  orderId?: string;
  inlineScript: string;
}

interface RemitaResult {
  status: 'success' | 'closed' | 'error';
  response?: unknown;
}

declare global {
  interface Window {
    RmPaymentEngine?: {
      init: (opts: Record<string, unknown>) => { showPaymentWidget: () => void };
    };
  }
}

const loaded = new Set<string>();

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (loaded.has(src) || window.RmPaymentEngine) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => {
      loaded.add(src);
      resolve();
    };
    script.onerror = () => reject(new Error('Failed to load Remita payment script'));
    document.body.appendChild(script);
  });
}

/**
 * Opens the Remita inline payment widget for an already-generated RRR.
 * Resolves once the widget closes (with the outcome).
 */
export async function payWithRemita(config: RemitaInlineConfig): Promise<RemitaResult> {
  await loadScript(config.inlineScript);

  if (!window.RmPaymentEngine) {
    throw new Error('Remita payment engine unavailable');
  }

  return new Promise<RemitaResult>((resolve) => {
    let settled = false;
    const finish = (result: RemitaResult) => {
      if (settled) return;
      settled = true;
      resolve(result);
    };

    const engine = window.RmPaymentEngine!.init({
      key: config.publicKey,
      processRrr: true,
      transactionId: config.orderId || config.rrr,
      extendedData: {
        customFields: [{ name: 'rrr', value: config.rrr }],
      },
      onSuccess: (response: unknown) => finish({ status: 'success', response }),
      onError: (response: unknown) => finish({ status: 'error', response }),
      onClose: () => finish({ status: 'closed' }),
    });

    engine.showPaymentWidget();
  });
}
