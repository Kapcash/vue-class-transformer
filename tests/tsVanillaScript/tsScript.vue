<template>
  <h1>Simple component</h1>
</template>

<script lang="ts">
import Vue, { PropOptions } from 'vue'
import { TextField } from '~/components/test-field.vue'

export default Vue.extend({
  name: 'MyComponent',
  components: { TextField },
  data () {
    const loading: boolean = true
    return {
      isOpen: false,
      query: '',
      loading
    }
  },
  props: {
    loading: {
      type: Boolean,
      required: false,
      default: false,
    } as PropOptions<Boolean>,
    userId: {
      type: String,
      required: true,
    }
  },
  watch: {
    loading: function(newVal: boolean, oldVal: boolean) {
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
    console.log('I\'m aliiiive!')
  },
  methods: {
    close (): void {
      this.isOpen = false
    }
  }
})
</script>

<style scoped>
.h1 {
  color: darkblue;
}
</style>