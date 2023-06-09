<template>
  <div class="w-full h-full grid grid-cols-1 sm:grid-cols-12 gap-4 px-8 flex text-black">
    <Reading v-if="chapterStore.currentStep === CHAPTER_STEP.STORY" @next="next"/>

    <div
        v-show="chapterStore.currentStep === CHAPTER_STEP.INTRODUCTION || chapterStore.currentStep === CHAPTER_STEP.END"
        class="relative flex flex-col justify-end items-end sm:col-span-8 lg:col-span-9">
      <div class="absolute w-full aspect-[4/3] -left-8 bottom-0">
        <div class="relative w-full h-full flex">
          <img class="mt-auto" src="/chapter/book.png" alt=""/>
          <div
              class="absolute w-[55%] h-[80%] bottom-[2%] lg:bottom-[8%] right-[12%] -rotate-[3.52deg] flex flex-col items-center justify-center text-center">
            <div class="w-[50%] sm:w-[65%] lg:w-[70%] xl:w-[80%] aspect-square relative">
              <Transition name="scale-speed">
                <img v-show="show" class="absolute w-[80%] object-contain inset-0 m-auto" src="/chapter/001/first-page/circle.svg" alt="" >
              </Transition>
              <div class="mask absolute w-[100%] inset-0 m-auto w-full h-full">
                <Transition name="appear1">
                  <img v-show="show" class="absolute w-[70%] inset-0 bottom-[10%] left-[-6%] m-auto h-full object-contain origin-bottom" src="/chapter/001/first-page/feuille.png" alt=""/>
                </Transition>
                <Transition name="appear2">
                  <img v-show="show" class="absolute w-[50%] inset-0 left-[20%] bottom-[-10%] m-auto h-full object-contain origin-bottom" src="/chapter/001/first-page/pinpin.png" alt=""/>
                </Transition>
                <Transition name="appear3">
                  <img v-show="show" class="absolute w-[30%] inset-0 left-[-10%] bottom-[-60%] m-auto object-contain origin-bottom" src="/chapter/001/first-page/capu.png" alt=""/>
                </Transition>
              </div>
            </div>
            <h2 class="font-bold text-green-medium">Chapitre {{ mainStore.chapterId }}</h2>
            <h1 class="font-hand-written text-sm sm:text-md lg:text-xl text-green leading-snug mt-2 lg:mt-6">
              {{ chapterStore.data ? chapterStore.data.title : '' }}</h1>
          </div>
        </div>
      </div>
    </div>

    <div
        v-show="chapterStore.currentStep === CHAPTER_STEP.INTRODUCTION || chapterStore.currentStep === CHAPTER_STEP.END"
        class="mt-28 col-span-4 lg:col-span-3 lg:col-start flex flex-col gap-4 sm:gap-8 items-center">
      <div class="flex flex-col items-center">
        <Connexion v-if="chapterStore.currentStep === CHAPTER_STEP.INTRODUCTION" class="pb-20" :status-needed="false"/>
        <div class="bg-beige rounded-full p-4"
             :class="chapterStore.currentStep === CHAPTER_STEP.INTRODUCTION ? '-translate-y-1/2' :''">
          <RoundButton :color="COLOR.PINK" @click="next">
            <Arrow class="rotate-180"/>
          </RoundButton>
        </div>
      </div>
      <CircleButton v-show="chapterStore.currentStep === CHAPTER_STEP.INTRODUCTION" @click="openSheet"
                    :text="chapterStore.sheetUnlocked ? 'Ouvrir la fiche' : 'Débloquer la fiche'"
                    :color="chapterStore.sheetUnlocked ? COLOR.BLUE : COLOR.GREEN_MEDIUM_BEIGE" :size="SIZE.MD"
                    :colorReverse="true">
        <Sheet/>
      </CircleButton>
    </div>
  </div>
  <ModalView v-if="isModalOpen" @close="closeModal" :close="true" :click-outside="true" :padding="false" full>
    <div class="w-full h-full">
      <img class="w-full" src="/chapter/001/knowledge-sheet-001.jpg" alt="Fiche connaissance"/>
    </div>
  </ModalView>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import {useRouter} from "vue-router";
import {getSocket} from "../../../client";
import {useMainStore} from "../../../stores/mainStore";
import {useGameStore} from "../../../stores/gameStore";
import {useChapterStore} from "../../../stores/chapterStore";
import {GameMasterManagerInstance} from "../../../common/GameMasterManager";
import {CHAPTER_STEP, COLOR, SIZE} from "../../../common/Constants";
import Reading from "./Reading.vue";
import ModalView from "../../common/ModalView.vue";
import RoundButton from "../../common/RoundButton.vue";
import CircleButton from "../../common/CircleButton.vue";
import Connexion from "../../game/teacher/Connexion.vue";

import Arrow from "../../../assets/svg/ico-arrow.svg?component";
import Sheet from "../../../assets/svg/ico-book.svg?component";

export default defineComponent({
  name: 'TeacherChapter',
  components: {Arrow, CircleButton, Connexion, ModalView, Reading, RoundButton, Sheet},
  data() {
    return {
      step: 0,
      socket: getSocket(),
      mainStore: useMainStore(),
      gameStore: useGameStore(),
      chapterStore: useChapterStore(),
      GMInstance: GameMasterManagerInstance,
      router: useRouter(),
      isModalOpen: false,
      show: false
    }
  },
  computed: {
    SIZE() {
      return SIZE
    },
    COLOR() {
      return COLOR
    },
    CHAPTER_STEP() {
      return CHAPTER_STEP
    },
    totalParts() {
      return this.chapterStore.data?.sections.length;
    },
    totalTexts() {
      return this.chapterStore.data?.sections[this.mainStore.gameId].length;
    }
  },
  mounted() {
    setTimeout(() => {
      this.show = true
    }, 300)
  },
  methods: {
    next() {
      switch (this.chapterStore.currentStep) {
        case CHAPTER_STEP.INTRODUCTION:
          this.GMInstance.startChapter();
          this.chapterStore.currentStep = CHAPTER_STEP.STORY;
          break;
        case CHAPTER_STEP.STORY:
          if (this.chapterStore.currentParagraph < this.totalTexts - 1) {
            this.chapterStore.currentParagraph += 1;
            this.GMInstance.nextParagraph();
            break;
          } else {
            if (this.mainStore.gameId < this.totalParts - 1) {
              // this.mainStore.gameId += 1;
              this.GMInstance.launchGame(this.mainStore.gameId + 1)
              break;
            } else {
              this.chapterStore.currentStep = CHAPTER_STEP.END;
              break;
            }
          }
        case CHAPTER_STEP.END:
          this.GMInstance.endChapter();
      }
    },
    openSheet() {
      if (this.chapterStore.sheetUnlocked) {
        this.isModalOpen = true;
        this.mainStore.openModal()
      } else {
        this.router.push('/scan');
      }
    },
    closeModal() {
      setTimeout(() => {
        this.isModalOpen = false
      }, 600)
      this.mainStore.closeModal()
    }
  }
});
</script>


<style scoped>
.mask {
  -webkit-mask-image: url('/chapter/001/first-page/mask.svg');
  mask-image: url('/chapter/001/first-page/mask.svg');
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  -webkit-mask-position: top;
  mask-position: top;
  -webkit-mask-size: contain;
  mask-size: contain;
}

.appear1-enter-from {
    opacity: 0;
    transform: scale(0.6) translateY(10%) rotate(25deg);
}

.appear1-enter-active, .appear2-enter-active, .appear3-enter-active{
    transition: opacity 0.1s ease-out, transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.appear1-enter-active {
  transition-delay: 0.2s;
}

.appear2-enter-from {
    opacity: 0;
    transform: scale(0.8) translate(20%, 20%) rotate(-15deg);
}

.appear2-enter-active {
  transition-delay: 0.3s;
}

.appear3-enter-from {
    opacity: 0;
    transform: scale(0.8) translate(-20%, 20%) rotate(15deg);
}

.appear3-enter-active {
  transition-delay: 0.5s;
}
</style>
