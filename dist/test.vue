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
<script lang="ts">
import { Vue, Component, Watch, Prop } from 'nuxt-property-decorator';
import { PasswordField, Test } from "~/components/login/fields/password-field.vue";
import Tooltip from "~/components/login/tooltip.vue";
@Component<ResetPasswordModal>({ components: { PasswordField, Tooltip } })
export default class ResetPasswordModal extends Vue {
    isOpen: boolean = this.$store.state.modals.isResetPasswordActive;
    newPassword: string = "";
    confirmedPassword: string = "";
    isFormValid: boolean = false;
    showServerTooltip: boolean = false;
    @Prop({
        type: Boolean, required: false, default: false
    })
    readonly loading!: boolean;
    @Prop({
        type: Object, required: true
    })
    readonly val!: Object;
    @Watch('$route')
    on$routeUpdate(newVal, oldVal: string) {
        this.foo = newVal;
    }
    @Watch('foo')
    onFooUpdate(newVal, oldVal: string) {
        this.foo = newVal;
    }
    async updatePassword(newPassword: string): Promise<void> {
        this.showServerTooltip = false;
        try {
            await this.$vrc().accounts().updateAccount({ password: newPassword });
            this.$store.commit("user/SET_PROFILE_PROPERTY", { property: "password", newValue: newPassword });
            this.window = 1;
        }
        catch (error) {
            this.showServerTooltip = true;
            console.error(error);
        }
    }
    close(): void {
        this.$store.commit("modals/SET_RESET_PASSWORD_ACTIVE", false);
        this.$router.replace({ path: "/" });
    }
    get arePasswordsEquals(): boolean {
        return this.newPassword === this.confirmedPassword;
    }
    set arePasswordsEquals(val) {
        return val;
    }
    get arePasswordsFilled(): boolean {
        return this.newPassword !== "" && this.confirmedPassword !== "";
    }
    created() {
        this.watcher = this.$store.watch(() => this.$store.state.modals.isResetPasswordActive, (newVal: boolean) => {
            this.isOpen = newVal;
        });
    }
    head() {
        return { meta: "test" };
    }
}
</script>
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
<i18n src="~/lang/json/seo-header.json"></i18n>
