import { getAllFilesToUpgrade, FileDescriptor } from './helpers/FilesHelper';
import { parseArguments } from './helpers/ArgumentParser';
import { ErrorManager } from './helpers/ErrorManager';
import { printFinalErrors, upgradeComponent } from './main';
import cliProgress from 'cli-progress';

// ===== MAIN ===== //
(async function() {
  const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
  try {
    // Sets as global the script configuration
    global.config = parseArguments();
    global.errors = new ErrorManager();

    const vueFilesToUpgrade: FileDescriptor[] = getAllFilesToUpgrade(global.config.inputPaths);
    progressBar.start(vueFilesToUpgrade.length, 0);
      
    for (const file of vueFilesToUpgrade) {
      try {
        await upgradeComponent(file);
      } catch (err) {
        global.errors.addError('file', err);
      }
      progressBar.increment();
    }

    progressBar.stop();
    printFinalErrors(vueFilesToUpgrade.length);
  } catch (err) {
    console.error(err);
  }
})();
// ===================== //
