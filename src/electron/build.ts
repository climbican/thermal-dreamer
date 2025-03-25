
import { build } from 'electron-builder';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

// ES Module compatibility for __dirname
const __dirname = dirname(fileURLToPath(import.meta.url));

// Build the Electron application
build({
  config: {
    directories: {
      output: 'release',
      app: '.',
    },
    files: [
      'dist/**/*',
      'build/**/*',
      'src/electron/**/*.js',
      'node_modules/**/*'
    ],
    appId: 'com.thermal-dreamer.app',
    productName: 'Thermal Dreamer',
    mac: {
      category: 'public.app-category.business',
      target: ['dmg']
    },
    win: {
      target: ['nsis']
    },
    linux: {
      target: ['AppImage', 'deb'],
      category: 'Office'
    },
    nsis: {
      oneClick: false,
      allowToChangeInstallationDirectory: true
    }
  }
})
  .then(() => console.log('Build completed successfully'))
  .catch((err) => {
    console.error('Build failed:', err);
    process.exit(1);
  });
