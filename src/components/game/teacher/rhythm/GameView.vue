<template>
  <div class="relative">
    <div class="fixed -z-10 bg-dig bg-width-full bg-bottom bg-no-repeat w-screen h-screen inset-0" />
    <Gauge :content="score" />
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import {getSocket} from "../../../../client";
import {useMainStore} from "../../../../stores/mainStore";
import {useGameStore} from "../../../../stores/gameStore";
import {GAME_STEP, AUDIO_EVENT, AUDIO} from "../../../../common/Constants";
import {GameMasterManagerInstance} from "../../../../common/GameMasterManager";
import {AudioManagerInstance} from "../../../../common/AudioManager";
import Gauge from './Gauge.vue';

export default defineComponent({
    name: "TeacherGameView",
    data() {
        return {
            publicPath: window.location.origin,
            mainStore: useMainStore(),
            gameStore: useGameStore(),
            socket: getSocket(),
            score: 0 as number,
        };
    },
    mounted() {
        this.updateScore = this.updateScore.bind(this)
        this.socket.on(AUDIO_EVENT.CLAP_SCORE, this.updateScore);
        this.socket.emit(AUDIO_EVENT.AUDIO_GAME_READY, {
          roomId: this.mainStore.roomId,
        }, (response: number) => {
            if (!response) {
            this.next()
          }
        });
    },
    computed: {
        GAMESTEP() {
            return GAME_STEP;
        },
    },
    methods: {
    next() {
        GameMasterManagerInstance.endGame();
    },
    updateScore(score: number) {
      this.score = score;
      if (this.score > 80) {
        AudioManagerInstance.play(AUDIO.VICTORY);
        setTimeout(() => { this.next() }, 1400)
      }
    }
    },
    components: { Gauge }
});
</script>
