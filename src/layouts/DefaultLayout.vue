<script lang="ts">
import {defineComponent} from "vue";
import {useRouter} from "vue-router";
import RoundButton from "../components/common/RoundButton.vue";
import {COLOR, ROLE} from "../common/Constants";
import {useMainStore} from "../stores/mainStore";
import Home from "../assets/svg/ico-home.svg?component";

export default defineComponent({
  name: "DefaultLayout",
  components: {Home, RoundButton},
  data() {
    return {
      router: useRouter(),
      mainStore: useMainStore()
    }
  },
  computed: {
    ROLE() {
      return ROLE
    },
    COLOR() {
      return COLOR
    },
    show() {
      return this.router.currentRoute.name !== 'Dashboard' && this.router.currentRoute.name !== 'Home';
    }
  },
});
</script>

<template>
  <div class="bg-texture-beige bg-cover min-h-screen flex flex-col">
    <header class=" w-full flex items-center z-20">
      <RoundButton v-if="show" :color="COLOR.YELLOW" class="!absolute top-6 left-8"
                   @click="router.push({name: mainStore.role === ROLE.STUDENT ? 'Home' : 'Dashboard'})">
        <Home/>
      </RoundButton>
      <slot name="header"></slot>
    </header>
    <main class="flex-1 flex flex-col w-full h-full relative overflow-hidden">
      <slot></slot>
    </main>
  </div>
</template>
