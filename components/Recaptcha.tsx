'use client';

import { useEffect, useImperativeHandle, useRef, useState, type Ref } from 'react';

/**
 * Google reCAPTCHA v2 "I'm not a robot" checkbox (the CollegeDecision keys are v2 checkbox).
 * When NEXT_PUBLIC_RECAPTCHA_ENABLED=false the widget is not rendered and the script is not loaded.
 * Loads Google's script once, renders the widget and reports the token through `onToken`.
 * Send the token to the backend as `recaptchaToken` (e.g. POST /api/v1/otp/send); tokens are
 * single-use and expire after ~2 minutes, so call `reset()` after every submit attempt.
 *
 *   const captcha = useRef<RecaptchaHandle>(null);
 *   const [token, setToken] = useState<string | null>(null);
 *   <Recaptcha ref={captcha} onToken={setToken} />
 *   ...after submit: captcha.current?.reset();
 */

export type RecaptchaHandle = {
  /** Current token, or null if the box is not ticked / the token expired. */
  getToken: () => string | null;
  /** Clears the widget so the user ticks it again (required after each submit). */
  reset: () => void;
};

type Props = {
  onToken?: (token: string | null) => void;
  /** Called with true once the widget has rendered, false if it failed to load. */
  onReady?: (ready: boolean) => void;
  /** Defaults to NEXT_PUBLIC_RECAPTCHA_SITE_KEY. */
  siteKey?: string;
  theme?: 'light' | 'dark';
  size?: 'normal' | 'compact';
  className?: string;
  ref?: Ref<RecaptchaHandle>;
};

type Grecaptcha = {
  ready: (cb: () => void) => void;
  render: (container: HTMLElement, params: Record<string, unknown>) => number;
  reset: (widgetId?: number) => void;
  getResponse: (widgetId?: number) => string;
};

declare global {
  interface Window {
    grecaptcha?: Grecaptcha;
    __cdRecaptchaOnLoad?: () => void;
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '';
/** Missing, empty, or any value other than "false" keeps the widget enabled (production default). */
export const RECAPTCHA_ENABLED = process.env.NEXT_PUBLIC_RECAPTCHA_ENABLED?.trim().toLowerCase() !== 'false';
const SCRIPT_ID = 'google-recaptcha-api';
let loader: Promise<Grecaptcha> | null = null;

function loadRecaptcha(): Promise<Grecaptcha> {
  if (window.grecaptcha?.render) return Promise.resolve(window.grecaptcha);
  if (loader) return loader;
  loader = new Promise<Grecaptcha>((resolve, reject) => {
    window.__cdRecaptchaOnLoad = () => {
      if (window.grecaptcha) resolve(window.grecaptcha);
      else reject(new Error('reCAPTCHA failed to load'));
    };
    if (document.getElementById(SCRIPT_ID)) return;
    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.src = 'https://www.google.com/recaptcha/api.js?onload=__cdRecaptchaOnLoad&render=explicit';
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      loader = null;
      script.remove();
      reject(new Error('reCAPTCHA failed to load'));
    };
    document.head.appendChild(script);
  });
  return loader;
}

export default function Recaptcha({ onToken, onReady, siteKey = SITE_KEY, theme = 'light', size = 'normal', className, ref }: Props) {
  const container = useRef<HTMLDivElement>(null);
  const widgetId = useRef<number | null>(null);
  const tokenRef = useRef<string | null>(null);
  const onTokenRef = useRef(onToken);
  const onReadyRef = useRef(onReady);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    onTokenRef.current = onToken;
    onReadyRef.current = onReady;
  }, [onToken, onReady]);

  const setToken = (token: string | null) => {
    tokenRef.current = token;
    onTokenRef.current?.(token);
  };

  useImperativeHandle(ref, () => ({
    getToken: () => tokenRef.current,
    reset: () => {
      if (widgetId.current !== null) window.grecaptcha?.reset(widgetId.current);
      setToken(null);
    }
  }));

  useEffect(() => {
    if (!RECAPTCHA_ENABLED) {
      onReadyRef.current?.(true);
      return;
    }
    if (!siteKey) return;
    let cancelled = false;
    loadRecaptcha()
      .then((grecaptcha) => {
        grecaptcha.ready(() => {
          if (cancelled || !container.current || widgetId.current !== null) return;
          widgetId.current = grecaptcha.render(container.current, {
            sitekey: siteKey,
            theme,
            size,
            callback: (token: string) => setToken(token),
            'expired-callback': () => setToken(null),
            'error-callback': () => {
              setToken(null);
              setError('Could not load the verification check. Please check your connection and try again.');
              onReadyRef.current?.(false);
            }
          });
          onReadyRef.current?.(true);
        });
      })
      .catch(() => {
        onReadyRef.current?.(false);
        if (!cancelled) setError('Could not load the verification check. Please check your connection and try again.');
      });
    return () => {
      cancelled = true;
    };
    // The widget is rendered once per mount; theme/size changes need a remount (use a `key`).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteKey]);

  if (!RECAPTCHA_ENABLED || !siteKey) return null;
  return (
    <div className={className}>
      <div ref={container} />
      {error ? (
        <p role="alert" style={{ color: '#b42318', fontSize: 13, marginTop: 6 }}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
