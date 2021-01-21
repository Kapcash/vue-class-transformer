import { getAllFilesToUpgrade, FileDescriptor } from './helpers/FileReader';
import { parseArguments } from './helpers/ArgumentParser';
import { upgradeComponent } from './main'
import cliProgress from 'cli-progress'

// ===== MAIN ===== //

(async function() {
  global.config = parseArguments()

  const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
  
  try {
    const vueFilesToUpgrade: FileDescriptor[] = getAllFilesToUpgrade(global.config.inputPaths)
    progressBar.start(vueFilesToUpgrade.length, 0)
    
    const upgradeVueComponent = upgradeComponent(global.config)
    vueFilesToUpgrade.forEach((file) => {
      upgradeVueComponent(file)
      progressBar.increment();
    })
  } catch (err) {
    console.error(err.message)
  } finally {
    progressBar.stop()
  }
})()

// ===================== //
