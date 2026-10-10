import { WebPlugin } from '@capacitor/core';

import type {
  ExecuteOptions,
  ExecuteResult,
  LoadOptions,
  LoadResult,
  PluginVersionResult,
  RecaptchaPlugin,
  RecaptchaPluginConfig,
} from './definitions';

type RecaptchaExecutor = {
  ready: (callback: () => void) => void;
  execute: (siteKey: string, options: { action: string }) => Promise<string>;
};

declare global {
  interface Window {
    Capacitor?: {
      config?: {
        plugins?: {
          Recaptcha?: RecaptchaPluginConfig;
        };
      };
    };
    grecaptcha?: RecaptchaExecutor & {
      enterprise?: RecaptchaExecutor;
    };
  }
}

const RECAPTCHA_LOAD_TIMEOUT_MS = 10_000;

export class RecaptchaWeb extends WebPlugin implements RecaptchaPlugin {
  private scriptPromises = new Map<string, Promise<void>>();

  async load(options: LoadOptions = {}): Promise<LoadResult> {
    const resolved = this.resolveOptions(options);
    const scriptKey = this.scriptKey(resolved.siteKey, resolved.enterprise, resolved.language);
    await this.loadScript(scriptKey, resolved.siteKey, resolved.enterprise, resolved.language);
    await this.ready(resolved.enterprise, scriptKey);

    return {
      loaded: true,
      siteKey: resolved.siteKey,
      enterprise: resolved.enterprise,
      platform: 'web',
    };
  }

  async execute(options: ExecuteOptions): Promise<ExecuteResult> {
    const action = options?.action?.trim();
    if (!action) {
      throw new Error('action is required.');
    }

    const loaded = await this.load(options);
    const executor = this.getExecutor(loaded.enterprise);
    const token = await executor.execute(loaded.siteKey, { action });

    return {
      token,
      action,
      siteKey: loaded.siteKey,
      enterprise: loaded.enterprise,
      platform: 'web',
    };
  }

  async getPluginVersion(): Promise<PluginVersionResult> {
    return {
      version: 'web',
    };
  }

  private resolveOptions(
    options: LoadOptions,
  ): Required<Pick<LoadOptions, 'siteKey' | 'enterprise'>> & Pick<LoadOptions, 'language'> {
    const config = window.Capacitor?.config?.plugins?.Recaptcha ?? {};
    const siteKey = this.firstNonEmpty(
      options.webSiteKey,
      options.siteKey,
      options.sitekeyWeb,
      config.webSiteKey,
      config.siteKey,
      config.sitekeyWeb,
    );

    if (!siteKey) {
      throw new Error(
        'siteKey is required. Pass it to load/execute or set Recaptcha.webSiteKey/siteKey in Capacitor config.',
      );
    }

    return {
      siteKey,
      enterprise: options.enterprise ?? config.enterprise ?? true,
      language: options.language ?? config.language,
    };
  }

  private scriptKey(siteKey: string, enterprise: boolean, language?: string): string {
    const mode = enterprise ? 'enterprise' : 'standard';
    return `${mode}:${siteKey}:${language ?? ''}`;
  }

  private cleanupScript(scriptKey: string): void {
    this.scriptPromises.delete(scriptKey);
    document.querySelector<HTMLScriptElement>(`script[data-capgo-recaptcha="${scriptKey}"]`)?.remove();
  }

  private recaptchaLoadTimeoutError(): Error {
    return new Error('reCAPTCHA failed to load within 10s, check CSP, ad blockers or network');
  }

  private loadScript(scriptKey: string, siteKey: string, enterprise: boolean, language?: string): Promise<void> {
    if (typeof document === 'undefined') {
      return Promise.reject(new Error('reCAPTCHA can only be loaded in a browser context.'));
    }

    const existingPromise = this.scriptPromises.get(scriptKey);
    if (existingPromise) {
      return existingPromise;
    }

    const promise = new Promise<void>((resolve, reject) => {
      let settled = false;
      const finish = (outcome: 'resolve' | 'reject', error?: Error) => {
        if (settled) {
          return;
        }
        settled = true;
        window.clearTimeout(timeoutId);
        if (outcome === 'reject') {
          this.cleanupScript(scriptKey);
          reject(error ?? this.recaptchaLoadTimeoutError());
          return;
        }
        resolve();
      };

      const timeoutId = window.setTimeout(
        () => finish('reject', this.recaptchaLoadTimeoutError()),
        RECAPTCHA_LOAD_TIMEOUT_MS,
      );

      const existingScript = document.querySelector<HTMLScriptElement>(`script[data-capgo-recaptcha="${scriptKey}"]`);
      if (existingScript) {
        finish('resolve');
        return;
      }

      const script = document.createElement('script');
      const baseUrl = enterprise
        ? 'https://www.google.com/recaptcha/enterprise.js'
        : 'https://www.google.com/recaptcha/api.js';
      const params = new URLSearchParams({ render: siteKey });
      if (language) {
        params.set('hl', language);
      }

      script.async = true;
      script.defer = true;
      script.src = `${baseUrl}?${params.toString()}`;
      script.dataset.capgoRecaptcha = scriptKey;
      script.onload = () => finish('resolve');
      script.onerror = () => finish('reject', new Error('Failed to load the reCAPTCHA script.'));
      document.head.appendChild(script);
    });

    this.scriptPromises.set(scriptKey, promise);
    return promise;
  }

  private async ready(enterprise: boolean, scriptKey: string): Promise<void> {
    // The loader script only defines a `ready` stub: `execute` becomes available
    // once the actual reCAPTCHA library, injected by the loader, has loaded.
    const api = enterprise ? window.grecaptcha?.enterprise : window.grecaptcha;
    if (!api?.ready) {
      this.cleanupScript(scriptKey);
      throw new Error('reCAPTCHA script loaded but the expected API is unavailable.');
    }

    await new Promise<void>((resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        this.cleanupScript(scriptKey);
        reject(this.recaptchaLoadTimeoutError());
      }, RECAPTCHA_LOAD_TIMEOUT_MS);

      api.ready(() => {
        window.clearTimeout(timeoutId);
        resolve();
      });
    });
  }

  private getExecutor(enterprise: boolean): RecaptchaExecutor {
    const executor = enterprise ? window.grecaptcha?.enterprise : window.grecaptcha;
    if (!executor?.ready || !executor?.execute) {
      throw new Error('reCAPTCHA script loaded but the expected API is unavailable.');
    }

    return executor;
  }

  private firstNonEmpty(...values: (string | undefined)[]): string | undefined {
    return values.find((value) => typeof value === 'string' && value.trim().length > 0)?.trim();
  }
}
