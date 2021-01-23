import { Configuration } from '../../src/helpers/ArgumentParser';
import { convertScript } from '../../src/main';
import { getSfcDescriptor, FileDescriptor } from '../../src/helpers/FilesHelper';

describe('auth', () => {
  const testPath = process.cwd() + '/tests/test.vue'
  global.config = {
    inputPaths: [],
    outputDir: '',
    overrideFiles: false,
    isNuxt: false,
    propertiesOrder: ['data', 'props', 'watcher', 'hooks', 'methods', 'computed', 'other'],
  }

  it('should resolve with true and valid userId for hardcoded token', () => {
    const sfc = getSfcDescriptor(new FileDescriptor(testPath))
    const convertedScript = convertScript(sfc)
    expect(convertedScript).toMatchSnapshot();
  })
})