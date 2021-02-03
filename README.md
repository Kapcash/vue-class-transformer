
Vue Class Transformer is a Nodejs CLI that transform your Vanilla Vue.js components to Typescript class based components.

> This project is still under development and is really likely to raise errors on usages.

> I'm a humble developer just like you, not a genius / robot.  
> If you like the idea, feel free to help me by opening detailed issues or even Pull Requests!

Table of content
- [How to use it?](#how-to-use-it)
  - [Prerequisites](#prerequisites)
  - [Simple Usage](#simple-usage)
- [The concept](#the-concept)
  - [CLI Options](#cli-options)
  - [Examples](#examples)
  - [Roadmap (Fancy Todos)](#roadmap-fancy-todos)

# How to use it?

Install it globally using npm or yarn

```bash
  npm install -g vue-class-transformer

  yarn global add vue-class-transformer
```

## Prerequisites
You only need Nodejs 12+ installed.

## Simple Usage

Then, you should have access to the cli:

```bash
  # Transform a single component
  vct ./components/index.vue

  # Transform multiple components
  vct ./components/**/*.vue
```

# The concept

The goal is to converts this vanilla Vue.js component

```javascript
import Vue from 'vue'
import { TextField } from '~/components/test-field.vue'

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
      required: false,
      default: false,
    },
    userId: {
      type: String,
      required: true,
    }
  },
  watch: {
    loading: function(newVal, oldVal) {
      console.log(newVal)
    },
  },
  computed: {
    hasQuery: {
      get (): boolean {
        return !!this.query
      }
    }
  },
  created () {
    this.watcher = this.$store.watch(() => this.$store.state.modals.isResetPasswordActive, (newVal) => {
      this.isOpen = newVal
    })
  },
  methods: {
    close () {
      this.isOpen = false
    }
  }
})
```

to this class based Typescript component:

```typescript
import { Vue, Component, Watch, Prop } from 'vue-property-decorator';
import { TextField } from "~/components/test-field.vue";

@Component<MyComponent>({ components: { TextField } })
export default class MyComponent extends Vue {
    get hasQuery(): boolean {
        return !!this.query;
    }

    @Watch('loading')
    onLoadingUpdate(newVal, oldVal) {
        console.log(newVal);
    }

    close() {
        this.isOpen = false;
    }

    created() {
        this.watcher = this.$store.watch(() => this.$store.state.modals.isResetPasswordActive, (newVal) => {
            this.isOpen = newVal;
        });
    }
}
```

It supposes you'll use the library `vue-property-decorator` (_or its nuxt variant `nuxt-property-decorator`_)

## CLI Options

| Name | Alias | Default value | Description |
|------|-------|---------------|-------------|
| version | | | Print the cli version. |
| nuxt |  -n   |    false      | Import the class properties from `nuxt-property-decorators` instead of `vue-property-decorators` |
| force | -f |  false | Transform the script in place, do not create a new file |
| output | -o | ./generated | Specify the transformed components output folder |
| verbose | -v | false | Trigger verbose mode. Display script details. |
| order | | data computed watcher hooks methods other | Specify the order of the component properties on the transformed script |

## Examples

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
  - !! List all errored components at the end
  - !! Keep directory tree for output files (don't create everything under generated/ or same name files will override themselves)