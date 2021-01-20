import { Configuration } from '../../src/helpers/ArgumentParser';
import { convertScript } from '../../src/main';
import { getSfcDescriptor, FileDescriptor } from '../../src/helpers/FileReader';

describe('auth', () => {
  const testPath = process.cwd() + '/tests/test.vue'
  const testConfig: Configuration = {
    outputDir: '',
    overrideFiles: false,
    isNuxt: false,
    sfcOrder: ['script', 'template', 'styles', 'other'],
    propertiesOrder: ['data', 'props', 'watcher', 'hooks', 'methods', 'computed', 'other'],
  }

  it('should resolve with true and valid userId for hardcoded token', () => {
    const sfc = getSfcDescriptor(new FileDescriptor(testPath))
    const convertedScript = convertScript(testConfig, sfc)
    expect(convertedScript).toMatchSnapshot();
  })
})