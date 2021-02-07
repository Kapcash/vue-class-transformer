
Vue Class Transformer is a Nodejs CLI that transform your Vanilla Vue.js components to Typescript class based components,   
following the syntax provided by the awesome [vue-property-decorator](https://github.com/kaorun343/vue-property-decorator) library.

Table of content
- [Usage](#usage)
  - [Disclaimer](#disclaimer)
- [Documentation](#documentation)
  - [Select components](#select-components)
  - [CLI Options](#cli-options)
  - [Examples with options](#examples-with-options)
  - [Roadmap (Fancy Todos)](#roadmap-fancy-todos)

# Usage

Install it globally using npm or yarn

```bash
# With npm
$ npm install -g vue-class-transformer
# With Yarn
$ yarn global add vue-class-transformer
```

```bash
# You should have access to the `vct` command
$ vct components/my-component.vue
```

<table>
<tr><th> components/my-component.vue </th><th> generated/my-component.vue </th></tr>
<tr><td>

```html
<template>
  <h1>Hello world</h1>
</template>

<script>
import Vue from 'vue'

export default Vue.extend({
  name: 'MyComponent',
  components: { TextField },
  data () {
    return {
      isOpen: false,
      query: '',
    }
  },
  props: {
    loading: {
      type: Boolean,
      default: false,
    }
  },
  computed: {
    hasQuery: {
      get (): boolean {
        return !!this.query
      }
    }
  },
  watch: {
    loading: function(newVal, oldVal) {
      console.log(newVal)
    },
  },
  methods: {
    close () {
      this.isOpen = false
    }
  }
})
</script>
```

</td><td>

```html
<template>
  <h1>Hello world</h1>
</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator';
import { TextField } from "~/components/test-field.vue";

@Component<MyComponent>({
  components: { TextField },
})
export default class MyComponent extends Vue {
  isOpen = false
  query = ''

  get hasQuery(): boolean {
    return !!this.query;
  }

  @Prop({ type: Boolean, default: false })
  loading!: boolean;

  @Watch('loading')
  onLoadingUpdate(newVal, oldVal) {
    console.log(newVal);
  }

  close() {
    this.isOpen = false;
  }
}
</script>
```

</td></tr>
</table>

## Disclaimer

> This project is still under development and is likely to raise errors on usages.
> Feel free to open a GitHub issue for any bug encountered!

> I'm a humble developer just like you, not a genius / robot.  
> Any help or feedback is more than welcome :)

# Documentation

The Typescript transformation supposes you will use the library `vue-property-decorator` (_or its nuxt variant `nuxt-property-decorator`_).

## Select components

You should only select .vue files.  
It will work even if your SFC imports an external script like so: `<script src="./index.js" />`

```bash
  # Transform a single component
  vct ./components/index.vue

  # Select all .vue files under the components/ folder (deep search).
  vct ./components/**/*.vue
```

## CLI Options

| Name | Alias | Default value | Description |
|------|-------|---------------|-------------|
| version | | | Print the cli version. |
| nuxt |  -n   |    false      | Import the class properties from `nuxt-property-decorators` instead of `vue-property-decorators` |
| force | -f |  false | Transform the script in place, do not create a new file |
| output | -o | ./generated | Specify the transformed components output folder |
| verbose | -v | false | Trigger verbose mode. Display script details. |
| order | | "data props computed watcher hooks methods other" | Specify the order of the component properties on the transformed script.<br>Currently, if you omit one of the section, it won't be present on the converted component script. |

## Examples with options

```bash
  # Use the nuxt library and write the transformed components in a new transformed/ folder.
  vct -n -o ./components/transformed/ ./components/*.vue

  # Write the transformed components in the existing files
  # and specify the order of the class properties.
  # Do not forget to use the -- at the end to separate the order parameters and the files glob argument.
  vct -f --order data hooks watcher computed methods other -- components/*.vue
```

## Roadmap (Fancy Todos)
  - !!! Add more unit tests (edge cases, normal cases, typescript vanilla syntax etc.)
  - !! Keep directory tree for output files (don't create everything under generated/ or same name files will override themselves)