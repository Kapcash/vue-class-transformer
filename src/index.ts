import { getAllFilesToUpgrade, FileDescriptor } from './helpers/FileReader';
import { parseArguments, printHelp, RuntimeConfiguration } from './helpers/ArgumentParser';
import { upgradeComponent } from './main'

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
  const vueFilesToUpgrade: FileDescriptor[] = getAllFilesToUpgrade(config.inputPath)
  vueFilesToUpgrade.forEach(upgradeComponent(config))
})()

// ===================== //