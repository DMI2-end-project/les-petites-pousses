<script lang="ts">
import {defineComponent} from 'vue'
import {useRouter} from "vue-router";
import {getSocket} from "../client";
import {useMainStore} from "../stores/mainStore";
import {useChapterStore} from "../stores/chapterStore";
import {DatabaseManagerInstance} from "../common/DatabaseManager";
import {CHAPTER_STEP, GAME_STEP, ROLE} from "../common/Constants";

import Breadcrumb from "../components/Breadcrumb.vue";
import GameHeader from "../components/game/GameHeader.vue";

import gameData from "../assets/json/games-data.json";

interface GameData {
  [key: string]: any;
}

export default defineComponent({
  name: 'ChapterLayout',
  computed: {
    ROLE() {
      return ROLE
    },
    CHAPTER_STEP() {
      return CHAPTER_STEP
    },
    GAMESTEP() {
      return GAME_STEP
    },
    gameData(): { [key: string]: any } {
      return gameData;
    }
  },
  components: {GameHeader, Breadcrumb},
  data() {
    return {
      mainStore: useMainStore(),
      chapterStore: useChapterStore(),
      router: useRouter(),
      socket: getSocket(),
      pb: DatabaseManagerInstance.pb,
    }
  },
  created() {
    if (this.mainStore.getFullGameId) {
      const key = this.mainStore.getFullGameId as string;
      const data: GameData = gameData;
    }
  },
  methods: {
    DatabaseManagerInstance() {
      return DatabaseManagerInstance
    },
    disconnect() {
      this.socket.disconnect();
      this.pb.authStore.clear();
      this.mainStore.reset();
      this.router.push({
        name: 'Login'
      });
    }
  }
});
</script>

<template>
  <div class="fixed top-0 left-0 right-0 bottom-0 flex flex-col">
    <header class="w-full flex items-center">
    </header>
    <main class="relative w-full h-full bg-cover bg-center"
          :class="chapterStore.currentStep === CHAPTER_STEP.INTRODUCTION  || mainStore.role === ROLE.TEACHER ? 'bg-texture-beige' : 'bg-texture-green'">
      <slot></slot>
    </main>
  </div>
</template>
