#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const rootDir = process.env.CAPACITOR_ROOT_DIR;
const platform = process.env.CAPACITOR_PLATFORM_NAME;

const managedBlockStart = '// Capgo reCAPTCHA desugaring (auto-generated)';
const managedBlockEnd = '// End Capgo reCAPTCHA desugaring';
const managedBlock = `${managedBlockStart}
android {
    compileOptions {
        coreLibraryDesugaringEnabled true
    }
}

dependencies {
    coreLibraryDesugaring "com.android.tools:desugar_jdk_libs:\${rootProject.ext.has('desugarJdkLibsVersion') ? rootProject.ext.desugarJdkLibsVersion : '2.1.5'}"
}
${managedBlockEnd}`;

function log(message) {
  console.log(`[CapgoRecaptcha] ${message}`);
}

function warn(message) {
  console.warn(`[CapgoRecaptcha] ${message}`);
}

function removeManagedBlock(content) {
  const escapedStart = managedBlockStart.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const escapedEnd = managedBlockEnd.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`\\n?${escapedStart}[\\s\\S]*?${escapedEnd}\\n?`, 'm');
  return content.replace(pattern, '\n');
}

function configureAndroid() {
  if (platform !== 'android') {
    return;
  }

  if (!rootDir) {
    warn('Skipping Android configuration because CAPACITOR_ROOT_DIR is missing.');
    return;
  }

  const buildGradlePath = path.join(rootDir, 'android', 'app', 'build.gradle');
  if (!fs.existsSync(buildGradlePath)) {
    warn('Skipping Android configuration because android/app/build.gradle was not found.');
    return;
  }

  const currentContent = fs.readFileSync(buildGradlePath, 'utf8');
  const withoutManagedBlock = removeManagedBlock(currentContent).trimEnd();
  const nextContent = `${withoutManagedBlock}\n\n${managedBlock}\n`;

  if (currentContent === nextContent) {
    log('Android core library desugaring is already configured.');
    return;
  }

  fs.writeFileSync(buildGradlePath, nextContent, 'utf8');
  log('Configured Android core library desugaring for the Google reCAPTCHA SDK.');
}

configureAndroid();
