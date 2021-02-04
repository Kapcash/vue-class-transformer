<template>
  <h1>Empty component</h1>
</template>

<script>
import Vue from 'vue'
import { TextField } from '~/components/test-field.vue'

export default Vue.extend({
  name: 'EmptyComponent',
})
</script>

<style lang="scss" scoped>
.h1 {
  color: darkblue;
}
</style>