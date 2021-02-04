<template>
  <h1>Simple component</h1>
</template>

<script lang="ts">
import Vue from 'vue'
import { TextField } from '~/components/test-field.vue'

export default Vue.extend({
  name: 'MyComponent',
  components: { TextField },
  data () {
    const loading = true
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
  },
  i18n: {
    lang: 'en',
  },
})
</script>

<style lang="scss" scoped>
.h1 {
  color: darkblue;
}
</style>