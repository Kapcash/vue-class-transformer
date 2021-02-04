import { convertScript } from '../../src/main';
import { FileDescriptor } from '../../src/helpers/FilesHelper';

describe('auth', () => {
  const testPath = __dirname + '/tsScript.vue';

  global.config = {
    inputPaths: [],
    outputDir: '',
    overrideFiles: false,
    isNuxt: false,
    propertiesOrder: ['data', 'props', 'watcher', 'hooks', 'methods', 'computed', 'other'],
  };

  it('should resolve with true and valid userId for hardcoded token', () => {
    const convertedScript = convertScript(new FileDescriptor(testPath));
    expect(convertedScript.sourceScript).toMatchSnapshot();
  });
});
