import { getAllFilesToUpgrade, FileDescriptor } from './helpers/FilesHelper';
import { parseArguments } from './helpers/ArgumentParser';
import { upgradeComponent } from './main'
import cliProgress from 'cli-progress'

// ===== MAIN ===== //

(async function() {
  // Sets as global the script configuration
  global.config = parseArguments()

  const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
  
  try {
    const vueFilesToUpgrade: FileDescriptor[] = getAllFilesToUpgrade(global.config.inputPaths)
    progressBar.start(vueFilesToUpgrade.length, 0)
    
    vueFilesToUpgrade.forEach((file) => {
      upgradeComponent(file)
      progressBar.increment();
    })
  } catch (err) {
    // Catch all script error here and print them cleanly
    console.error(err.message)
  } finally {
    progressBar.stop()
  }
})()

// ===================== //
