<template>
  <h1>Getter and setter computed</h1>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  computed: {
    currentValue: {
      get (): string {
        return this.$store.state.title
      },
      set(val: string) {
        this.$store.commit('SET_TITLE', val)
      }
    }
  },
})
</script>

<style lang="scss" scoped>
.h1 {
  color: darkblue;
}
</style>