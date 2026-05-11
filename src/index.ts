import { registerPlugin } from '@capacitor/core';

import type { RecaptchaPlugin } from './definitions';

const Recaptcha = registerPlugin<RecaptchaPlugin>('Recaptcha', {
  web: () => import('./web').then((m) => new m.RecaptchaWeb()),
});

export * from './definitions';
export { Recaptcha };
