import { getAllFilesToUpgrade, FileDescriptor } from './helpers/FileReader';
import { parseArguments, printHelp, RuntimeConfiguration } from './helpers/ArgumentParser';
import { upgradeComponent } from './main'
import cliProgress from 'cli-progress'

// ===== MAIN ===== //

(async function() {
  let config: RuntimeConfiguration
  try {
    config = await parseArguments(process.argv.slice(2))
  } catch (err) {
    if (err === false) {
      printHelp()
      process.exit(0)
    } else {
      console.error("Failed to parse the input arguments.", err)
      process.exit(9)
    }
  }

  const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
  
  try {
    const vueFilesToUpgrade: FileDescriptor[] = getAllFilesToUpgrade(config.inputPaths)
    progressBar.start(vueFilesToUpgrade.length, 0)
    
    const upgradeVueComponent = upgradeComponent(config)
    vueFilesToUpgrade.forEach(async (file) => {
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