import { CapacitorUpdater } from '@capgo/capacitor-updater';
import { Capacitor } from '@capacitor/core';
import './style.css';
import { Recaptcha } from '@capgo/capacitor-recaptcha';

const output = document.getElementById('plugin-output');
const siteKeyInput = document.getElementById('site-key');
const actionInput = document.getElementById('action-name');
const enterpriseInput = document.getElementById('enterprise-mode');
const loadButton = document.getElementById('load-client');
const executeButton = document.getElementById('execute-action');
const versionButton = document.getElementById('get-version');

const setOutput = (value) => {
  output.textContent = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
};

const getOptions = () => {
  const siteKey = siteKeyInput.value.trim();
  return {
    ...(siteKey ? { siteKey } : {}),
    enterprise: enterpriseInput.checked,
  };
};

loadButton.addEventListener('click', async () => {
  try {
    const result = await Recaptcha.load(getOptions());
    setOutput(result);
  } catch (error) {
    setOutput(`Error: ${error?.message ?? error}`);
  }
});

executeButton.addEventListener('click', async () => {
  try {
    const result = await Recaptcha.execute({
      ...getOptions(),
      action: actionInput.value.trim(),
    });
    setOutput({
      ...result,
      token: `${result.token.slice(0, 18)}...`,
    });
  } catch (error) {
    setOutput(`Error: ${error?.message ?? error}`);
  }
});

versionButton.addEventListener('click', async () => {
  try {
    const result = await Recaptcha.getPluginVersion();
    setOutput(result);
  } catch (error) {
    setOutput(`Error: ${error?.message ?? error}`);
  }
});

if (Capacitor.isNativePlatform()) {
  CapacitorUpdater.notifyAppReady().catch((error) => {
    console.error('Capgo notifyAppReady failed', error);
  });
}
