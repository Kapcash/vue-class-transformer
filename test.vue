<template>
  <v-dialog v-model="isOpen" width="500px" persistent content-class="reset-password-modal">
    <v-card>
      <v-img class="logo" :src="require('~/assets/img/shared/logo_en.png')" />
      <v-btn class="close" fab small color="primary" @click="close">
        <v-icon>
          mdi-close
        </v-icon>
      </v-btn>
      <v-window v-model="window">
        <v-window-item :key="0" eager>
          <v-img class="lock" :src="require('~/assets/img/shared/reset-password-lock.png')" position="-115px 0px" width="25%" :height="80" />
          <p class="primary--text">
            {{ $t('reset-your-password') }}
          </p>
          <p>
            {{ $t('type-your-password') }}
          </p>
          <v-form ref="form" v-model="isFormValid" @submit.prevent="updatePassword(newPassword)">
            <password-field class="field" :shared-scope="false" register-mode @update:scope="newPassword = $event" />
            <div style="position:relative">
              <password-field
                class="field"
                register-mode
                :shared-scope="false"
                :label="$t('confirm-password')"
                no-tooltip
                @update:scope="confirmedPassword = $event"
              />
              <tooltip :message="$t('errors.password-does-not-match')" :is-active="!arePasswordsEquals" />
            </div>
            <div style="position:relative">
              <v-btn block color="primary" type="submit" class="submit" :disabled="!arePasswordsEquals || !isFormValid || !arePasswordsFilled">
                {{ $t('reset') }}
              </v-btn>
              <tooltip :message="$t('errors.server')" :is-active="showServerTooltip" />
            </div>
          </v-form>
        </v-window-item>
        <v-window-item :key="1">
          <v-img class="lock" :src="require('~/assets/img/shared/reset-password-lock.png')" position="-10px 0px" width="25%" :height="80" />
          <p class="primary--text">
            {{ $t('success') }}
          </p>
          <v-btn block color="primary" type="submit" class="submit" @click="close">
            {{ $t('return') }}
          </v-btn>
        </v-window-item>
      </v-window>
    </v-card>
  </v-dialog>
</template>

<style lang="sass" scoped>
.v-dialog__content::v-deep
  .v-dialog
    overflow-y: visible
    position: absolute
    top: 10%
    .v-card
      text-align: center
      padding: 40px 75px
      .submit
        margin: 30px 0 0 0
      .logo
        width: 70%
        margin: 0 auto
      .close
        right: -20px
        top: -20px
        position: absolute
      .lock
        margin: 20px auto
</style>

<script lang="ts">
import Vue from 'vue'
import Vue, { Other } from 'vue'
import { PasswordField, Test } from '~/components/login/fields/password-field.vue'
import Tooltip from '~/components/login/tooltip.vue'

export default Vue.extend({
  name: 'ResetPasswordModal',
  components: { PasswordField, Tooltip },
  data () {
    const isOpen: boolean = this.$store.state.modals.isResetPasswordActive
    const newPassword: string = ''
    const confirmedPassword: string = ''
    const isFormValid: boolean = false
    const showServerTooltip: boolean = false
    return {
      isOpen,
      newPassword,
      confirmedPassword,
      foo: 'bar' as string,
      isFormValid,
      showServerTooltip,
    }
  },
  props: {
    loading: {
      type: Boolean,
      required: false,
      default: false,
    } as PropOptions<boolean>,
    val: {
      type: Object,
      required: true,
    }
  },
  watch: {
    $route(newVal, oldVal: string) {
      this.foo = newVal
    },
    foo: function(newVal, oldVal: string) {
      this.foo = newVal
    },
  },
  computed: {
    arePasswordsEquals: {
      get (): boolean {
        return this.newPassword === this.confirmedPassword
      },
      set (val) {
        return val
      }
    },
    arePasswordsFilled: {
      get (): boolean {
        return this.newPassword !== '' && this.confirmedPassword !== ''
      }
    }
  },
  created () {
    this.watcher = this.$store.watch(() => this.$store.state.modals.isResetPasswordActive, (newVal:boolean) => {
      this.isOpen = newVal
    })
  },
  head () {
    return { meta: 'test' }
  },
  newThing: 'hello',
  methods: {
    async updatePassword (newPassword: string): Promise<void> {
      this.showServerTooltip = false
      try {
        await this.$vrc().accounts().updateAccount({ password: newPassword })
        this.$store.commit('user/SET_PROFILE_PROPERTY', {property: 'password', newValue: newPassword})
        this.window = 1
      } catch (error) {
        this.showServerTooltip = true
        console.error(error)
      }
    },
    close (): void {
      this.$store.commit('modals/SET_RESET_PASSWORD_ACTIVE', false)
      this.$router.replace({ path: '/' })
    }
  }
})
</script>

<i18n src="~/lang/json/seo-header.json"/>
