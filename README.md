# @capgo/capacitor-recaptcha

<a href="https://capgo.app/"><img src="https://capgo.app/readme-banner.svg?repo=Cap-go/capacitor-recaptcha" alt="Capgo - Instant updates for Capacitor" /></a>

<div align="center">
  <h2><a href="https://capgo.app/?ref=plugin_recaptcha"> ➡️ Get Instant updates for your App with Capgo</a></h2>
  <h2><a href="https://capgo.app/consulting/?ref=plugin_recaptcha"> Missing a feature? We’ll build the plugin for you 💪</a></h2>
</div>

Capacitor plugin for generating reCAPTCHA tokens on Web, Android, and iOS.

It supports:

- Web reCAPTCHA v3 with `api.js`
- Web reCAPTCHA Enterprise with `enterprise.js`
- Android and iOS reCAPTCHA Enterprise/mobile SDKs

Use it before sensitive actions such as login, signup, checkout, password reset, or abuse-prone form submissions. The token must be sent to your backend and verified by creating a reCAPTCHA assessment.

## Compatibility

| Plugin version | Capacitor compatibility | Maintained |
| -------------- | ----------------------- | ---------- |
| v8.*.*         | v8.*.*                  | Yes        |
| v7.*.*         | v7.*.*                  | On demand  |
| v6.*.*         | v6.*.*                  | No         |
| v5.*.*         | v5.*.*                  | No         |

The major version of this plugin follows the major version of Capacitor.

## Install

```bash
npm install @capgo/capacitor-recaptcha
npx cap sync
```

## Configuration

```typescript
import type { CapacitorConfig } from '@capacitor/cli';
import '@capgo/capacitor-recaptcha';

const config: CapacitorConfig = {
  appId: 'com.example.app',
  appName: 'Example',
  webDir: 'dist',
  plugins: {
    Recaptcha: {
      androidSiteKey: 'ANDROID_SITE_KEY',
      iosSiteKey: 'IOS_SITE_KEY',
      webSiteKey: 'WEB_SITE_KEY',
      enterprise: true,
    },
  },
};

export default config;
```

You can also pass `siteKey` directly to `load()` or `execute()` when the key is environment-specific.

## Usage

```typescript
import { Recaptcha } from '@capgo/capacitor-recaptcha';

await Recaptcha.load();

const { token } = await Recaptcha.execute({
  action: 'login',
});

await fetch('/api/recaptcha-assessment', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ token, action: 'login' }),
});
```

For regular Web reCAPTCHA v3:

```typescript
const { token } = await Recaptcha.execute({
  siteKey: 'WEB_V3_SITE_KEY',
  enterprise: false,
  action: 'signup',
});
```

## Platform Setup

### Android

Create an Android mobile application key in Google Cloud reCAPTCHA and use it as `androidSiteKey` or `siteKey`.

Android uses Google's mobile reCAPTCHA SDK. Regular, non-Enterprise reCAPTCHA v3 is only available on Web in this plugin; `enterprise: false` is rejected on Android.

The plugin depends on:

```gradle
com.google.android.recaptcha:recaptcha:18.8.0
```

Google's Android reCAPTCHA SDK requires core library desugaring in the consuming app. The plugin enables it automatically during `npx cap sync android` and adds:

```gradle
com.android.tools:desugar_jdk_libs:2.1.5
```

You can override the version from your app Gradle config with `recaptchaVersion`.
You can override the desugaring dependency with `desugarJdkLibsVersion`.

### iOS

Create an iOS mobile application key in Google Cloud reCAPTCHA and use it as `iosSiteKey` or `siteKey`.

iOS uses Google's `RecaptchaEnterprise` mobile SDK. Regular, non-Enterprise reCAPTCHA v3 is only available on Web in this plugin; `enterprise: false` is rejected on iOS.

The plugin ships both Swift Package Manager and CocoaPods metadata and depends on Google's `RecaptchaEnterprise` iOS SDK.

### Web

Use a website key. Set `enterprise: true` for reCAPTCHA Enterprise or `enterprise: false` for regular reCAPTCHA v3.

## Notes

- Tokens are single-use and should be generated immediately before the protected backend request.
- Validate every token on your backend by creating a reCAPTCHA assessment.
- The old Cordova `sitekeyAndroid` and `sitekeyWeb` option names are accepted as migration aliases in call options and Capacitor config.
- `sitekeyIos` and `sitekeyIOS` are accepted as iOS migration aliases in call options and Capacitor config.

## Example App

The `example-app/` folder links to the local plugin with `file:..`.

```bash
cd example-app
npm install
npm run start
```

## API

<docgen-index>

* [`load(...)`](#load)
* [`execute(...)`](#execute)
* [`getPluginVersion()`](#getpluginversion)
* [Interfaces](#interfaces)

</docgen-index>

<docgen-api>
<!--Update the source file JSDoc comments and rerun docgen to update the docs below-->

reCAPTCHA plugin API.

### load(...)

```typescript
load(options?: LoadOptions | undefined) => Promise<LoadResult>
```

Load and cache the reCAPTCHA client for the current platform.

`execute()` loads the client automatically when needed, so calling this method is optional.

| Param         | Type                                                |
| ------------- | --------------------------------------------------- |
| **`options`** | <code><a href="#loadoptions">LoadOptions</a></code> |

**Returns:** <code>Promise&lt;<a href="#loadresult">LoadResult</a>&gt;</code>

**Since:** 8.0.0

--------------------


### execute(...)

```typescript
execute(options: ExecuteOptions) => Promise<ExecuteResult>
```

Execute reCAPTCHA for an action and return a token for backend assessment.

| Param         | Type                                                      |
| ------------- | --------------------------------------------------------- |
| **`options`** | <code><a href="#executeoptions">ExecuteOptions</a></code> |

**Returns:** <code>Promise&lt;<a href="#executeresult">ExecuteResult</a>&gt;</code>

**Since:** 8.0.0

--------------------


### getPluginVersion()

```typescript
getPluginVersion() => Promise<PluginVersionResult>
```

Returns the platform implementation version marker.

**Returns:** <code>Promise&lt;<a href="#pluginversionresult">PluginVersionResult</a>&gt;</code>

**Since:** 8.0.0

--------------------


### Interfaces


#### LoadResult

Result returned after the client is loaded.

| Prop             | Type                                     | Description                            | Since |
| ---------------- | ---------------------------------------- | -------------------------------------- | ----- |
| **`loaded`**     | <code>boolean</code>                     | Whether the platform client is ready.  | 8.0.0 |
| **`siteKey`**    | <code>string</code>                      | Site key used to load the client.      | 8.0.0 |
| **`enterprise`** | <code>boolean</code>                     | Whether Enterprise mode was requested. | 8.0.0 |
| **`platform`**   | <code>'web' \| 'ios' \| 'android'</code> | Platform that loaded the client.       | 8.0.0 |


#### LoadOptions

Options used to load the reCAPTCHA client.

| Prop                 | Type                 | Description                                                                                                                                                                                                                                      | Default           | Since |
| -------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------- | ----- |
| **`siteKey`**        | <code>string</code>  | Site key to use for this call. If omitted, the plugin reads the platform-specific key from Capacitor config.                                                                                                                                     |                   | 8.0.0 |
| **`androidSiteKey`** | <code>string</code>  | Android site key.                                                                                                                                                                                                                                |                   | 8.0.0 |
| **`iosSiteKey`**     | <code>string</code>  | iOS site key.                                                                                                                                                                                                                                    |                   | 8.0.0 |
| **`webSiteKey`**     | <code>string</code>  | Web site key.                                                                                                                                                                                                                                    |                   | 8.0.0 |
| **`sitekeyAndroid`** | <code>string</code>  | Legacy Cordova Android site key alias.                                                                                                                                                                                                           |                   | 8.1.1 |
| **`sitekeyIos`**     | <code>string</code>  | Legacy-style iOS site key alias.                                                                                                                                                                                                                 |                   | 8.1.1 |
| **`sitekeyIOS`**     | <code>string</code>  | Legacy-style iOS site key alias.                                                                                                                                                                                                                 |                   | 8.1.1 |
| **`sitekeyWeb`**     | <code>string</code>  | Legacy Cordova Web site key alias.                                                                                                                                                                                                               |                   | 8.1.1 |
| **`enterprise`**     | <code>boolean</code> | Web mode switch. Web uses `enterprise.js` when true and regular reCAPTCHA v3 `api.js` when false. Android and iOS use Google's mobile reCAPTCHA SDK, which is Enterprise/mobile only. Passing `enterprise: false` on Android or iOS is rejected. | <code>true</code> | 8.0.0 |
| **`language`**       | <code>string</code>  | Optional language code for the Web reCAPTCHA script.                                                                                                                                                                                             |                   | 8.0.0 |


#### ExecuteResult

Result returned after executing a protected action.

| Prop             | Type                                     | Description                                                                             | Since |
| ---------------- | ---------------------------------------- | --------------------------------------------------------------------------------------- | ----- |
| **`token`**      | <code>string</code>                      | Token generated by reCAPTCHA. Send this to your backend and create an assessment there. | 8.0.0 |
| **`action`**     | <code>string</code>                      | Action name used to generate the token.                                                 | 8.0.0 |
| **`siteKey`**    | <code>string</code>                      | Site key used to generate the token.                                                    | 8.0.0 |
| **`enterprise`** | <code>boolean</code>                     | Whether Enterprise mode was requested.                                                  | 8.0.0 |
| **`platform`**   | <code>'web' \| 'ios' \| 'android'</code> | Platform that generated the token.                                                      | 8.0.0 |


#### ExecuteOptions

Options used to execute a protected action.

| Prop          | Type                | Description                                                                                                                                         | Since |
| ------------- | ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| **`action`**  | <code>string</code> | Action name to protect. Use meaningful names such as `login`, `signup`, `checkout`, or `password_reset`.                                            | 8.0.0 |
| **`timeout`** | <code>number</code> | Optional native execution timeout in milliseconds. Android and iOS enforce a minimum timeout of 5000ms when provided. This value is ignored on Web. | 8.0.0 |


#### PluginVersionResult

Plugin version payload.

| Prop          | Type                | Description                                                 | Since |
| ------------- | ------------------- | ----------------------------------------------------------- | ----- |
| **`version`** | <code>string</code> | Version identifier returned by the platform implementation. | 8.0.0 |

</docgen-api>
