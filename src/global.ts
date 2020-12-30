export type SFCToken = 'script' | 'template' | 'styles' | 'other'
export type AttributeToken = 'data' | 'props' | 'computed' | 'watcher' | 'hooks' | 'methods' | 'other'

export function Alias(parameter: AttributeToken | SFCToken) {
  return function (target, propertyKey: string, descriptor: PropertyDescriptor) {
    target[parameter] = descriptor.value
  }
}

