import { convertScript } from '../../src/main';
import { FileDescriptor } from '../../src/helpers/FilesHelper';

describe('Simple conversions', () => {
  global.config = {
    inputPaths: [],
    outputDir: '',
    overrideFiles: false,
    isNuxt: false,
    propertiesOrder: ['data', 'props', 'watcher', 'hooks', 'methods', 'computed', 'other'],
  };

  it('Convert an empty Vue SFC', () => {
    const testPath = __dirname + '/empty.vue';
    const convertedScript = convertScript(new FileDescriptor(testPath));
    expect(convertedScript.sourceScript).toMatchSnapshot();
  });

  it('Convert a simple Vue SFC', () => {
    const testPath = __dirname + '/simple.vue';
    const convertedScript = convertScript(new FileDescriptor(testPath));
    expect(convertedScript.sourceScript).toMatchSnapshot();
  });

  it('Do not remove eventual custom options in SFC', () => {
    const testPath = __dirname + '/customOption.vue';
    const convertedScript = convertScript(new FileDescriptor(testPath));
    expect(convertedScript.sourceScript).toMatchSnapshot();
  });
  it('Transform both getters and setters in computed', () => {
    const testPath = __dirname + '/getterSetter.vue';
    const convertedScript = convertScript(new FileDescriptor(testPath));
    expect(convertedScript.sourceScript).toMatchSnapshot();
  });
});
