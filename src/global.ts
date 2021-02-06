import { RuntimeConfiguration } from './helpers/ArgumentParser';
import { ErrorManager } from './helpers/ErrorManager';

export type SFCToken = 'script' | 'template' | 'styles' | 'other';
export type AttributeToken = 'data' | 'props' | 'computed' | 'watcher' | 'hooks' | 'methods' | 'other';

export function Alias(parameter: AttributeToken | SFCToken) {
  return function (target, propertyKey: string, descriptor: PropertyDescriptor) {
    target[parameter] = descriptor.value;
  };
}

Array.prototype.chunk = function(statement) {
  return this.reduce(
    ([validChunk, invalidChunk], value) => {
      const targetChunk = statement(value) ? validChunk : invalidChunk;
      targetChunk.push(value);
      return [validChunk, invalidChunk];
    },
    [[], []]
  );
};

declare global {
  namespace NodeJS {
    interface Global {
      config: RuntimeConfiguration;
      errors: ErrorManager;
    }
  }

  interface Array<T> {
    chunk(statement: (val: T) => boolean): [Array<T>, Array<T>];
  }
}
