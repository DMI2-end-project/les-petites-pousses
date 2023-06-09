<template>
  <button @click="modify" class="edit-element p-0 text-beige-dark outline outline-8 transition-all duration-400"
          ref="container"
          :class="classProperty + ' ' + (textData.id || drawData.id ? 'bg-transparent' : 'bg-beige-medium/50') + ' ' + (onModify ? 'outline-yellow' : 'outline-transparent')">
    <PenIcon v-if="!textData.id && !drawData.id" class="w-1/3 mx-auto object-contain"
             :class="onModify ? 'text-yellow' : ''"/>
    <div v-if="textData.id" class="flex flex-col justify-between h-full bg-green-light p-4 drop-shadow-lg">
      <p class="text-sm text-left text-green font-semibold break-words line-clamp-4">{{ textData.content }}</p>
      <p class="text-right mt-4 font-hand-written text-xs text-green">{{ textData.signature }}</p>
    </div>
    <div v-if="drawData.id" class="flex flex-col justify-between h-full relative">
      <div class="w-full h-full"><img alt="" :src="drawUrl" class="w-full h-full object-contain my-auto"></div>
      <p class="text-right font-hand-written text-xs text-green p-1 pt-2 absolute bottom-0 right-0 bg-beige m-2">
        {{ drawData.signature }}</p>
    </div>
  </button>
  <div v-if="onModify"
       class="fixed z-40 w-screen h-screen flex justify-center items-center top-0 left-0 pt-24"
       :class="!onSignature ? 'bg-green/80' : ''">
    <div v-if="!onSignature" class="h-[90%] w-full m-12 rounded-xl" :class="!onDraw ? 'bg-beige p-8' : ''">
      <div v-if="!onWrite && !onDraw" class="edit-corner h-full w-full flex gap-12 p-12">
        <button @click="onWrite = true"
                class="bg-beige-light relative flex-1 max-h-full p-16 text-green text-xl font-bold">
          <span class="w-[96%] h-[96%] block absolute top-[2%] left-[2%] border border-beige-dark rounded-lg"/>
          <WriteIcon class="mx-auto h-1/3 w-auto object-contain"/>
          <p class="mt-16">Écrire</p>
        </button>
        <button @click="onDraw = true" class="bg-beige-light relative flex-1 h-full text-green text-xl font-bold">
          <span class="w-[96%] h-[96%] block absolute top-[2%] left-[2%] border border-beige-dark rounded-lg"/>
          <DrawIcon class="mx-auto h-1/3 w-auto object-contain"/>
          <p class="mt-16">Faire un dessin</p>
        </button>
      </div>
      <div v-if="onWrite" class="edit-corner w-full h-full p-6 flex flex-col items-end">
        <textarea v-model="textData.content" autofocus @input="onWriting"
                  class="w-full h-full resize-none text-xl p-12 font-bold bg-transparent border-none outline-none">
        </textarea>
        <RoundButton @click="saveText" class="mt-10 min-h-[80px]" :color="COLOR.GREEN_MEDIUM_BEIGE">
          <CheckIcon/>
        </RoundButton>
      </div>
      <div v-if="onDraw" class="w-full h-full p-0 flex flex-col items-end">
        <Draw @save="saveDraw" :lastDrawUrl="drawUrl" :ratio="ratio"/>
      </div>
    </div>
  </div>
  <ModalView class="z-20" v-if="onSignature" :close="false" :click-outside="false">
    <div class="relative my-2 flex flex-col items-center">
      <h3 v-if="onWrite" class="mt-8">Qui a écrit ce souvenir ?</h3>
      <h3 v-if="onDraw" class="mt-8">Qui a réalisé ce dessin ?</h3>
      <input type="text" v-model="signature" class="mt-6 px-6 py-4 rounded-lg min-w-[400px] outline-green-medium"
             placeholder="Écris ton prénom">
      <RoundButton :isActive="signature != ''" @click="saveData" :color="COLOR.GREEN_MEDIUM_BEIGE" class="mt-12">
        <CheckIcon/>
      </RoundButton>
    </div>
  </ModalView>
</template>

<script lang="ts">
import {DatabaseManagerInstance} from "./../../../common/DatabaseManager";
import {useMainStore} from "./../../../stores/mainStore";
import {useLogBookStore} from "./../../../stores/logBookStore";
import Draw from "./../Draw.vue"
import type {DrawData, TextData} from './../../../common/Interfaces'
import {base64ToFile} from './../../../common/Lib';
import {AUDIO, COLOR, LOGBOOK_STEP} from './../../../common/Constants';
import RoundButton from "./../../common/RoundButton.vue"
import ModalView from "./../../common/ModalView.vue";
import WriteIcon from "./../../../assets/svg/ico-write.svg?component"
import DrawIcon from "./../../../assets/svg/ico-draw.svg?component"
import CheckIcon from "./../../../assets/svg/ico-check.svg?component"
import PenIcon from "./../../../assets/svg/ico-pen.svg?component"
import {AudioManagerInstance} from "../../../common/AudioManager";

export default {
  name: "EditElementComponent",
  components: {
    Draw,
    RoundButton,
    ModalView,
    WriteIcon,
    DrawIcon,
    CheckIcon,
    PenIcon
  },
  props: {
    pageId: {
      type: String,
      default: null
    },
    slotNumber: {
      type: Number,
      default: null
    },
    classProperty: {
      type: String,
      default: null
    },
  },
  emits: ['onModify'],
  data: () => {
    return {
      mainStore: useMainStore(),
      logBookStore: useLogBookStore(),
      onModify: false as Boolean,
      onWrite: false as Boolean,
      onDraw: false as Boolean,
      onSignature: false as Boolean,
      textData: {} as TextData,
      drawData: {} as DrawData,
      signature: '' as string,
      ratio: 1 as number,
    }
  },
  computed: {
    drawUrl(): string {
      return DatabaseManagerInstance.getImageUrl(this.drawData)
    },
    COLOR() {
      return COLOR
    }
  },
  watch: {
    onDraw(value: Boolean) {
      if (value) {
        this.logBookStore.currentStep = LOGBOOK_STEP.DRAW
      }
    },
    onWrite(value: Boolean) {
      if (value) {
        this.logBookStore.currentStep = LOGBOOK_STEP.WRITE
      }
    },
    onModify(value: Boolean) {
      this.$emit('onModify', value)
    },
    signature(value: string) {
      this.textData.signature = this.drawData.signature = value;
    },
    'logBookStore.closeElements': {
      handler() {
        this.onModify = false
        this.logBookStore.closeElements = false
      },
      deep: true
    }
  },
  async mounted() {
    this.ratio = (this.$refs.container as HTMLElement).clientWidth / (this.$refs.container as HTMLElement).clientHeight;
    this.textData = await DatabaseManagerInstance.fetchText(this.pageId, this.slotNumber);
    if (this.mainStore.roomId) {
      this.drawData = this.logBookStore.draw(this.pageId, this.slotNumber, this.mainStore.roomId);
    }
    this.signature = (this.textData.id ? this.textData.signature : this.drawData.signature);
    this.textData.slot = this.drawData.slot = this.slotNumber;
    this.textData.page = this.drawData.page = this.pageId;
  },
  methods: {
    onWriting() {
      console.log('onChange');

      const randomIndex = Math.random() < 0.5 ? 0 : 1;
      const randomConstant = randomIndex === 0 ? AUDIO.WRITING1 : AUDIO.WRITING2;

      AudioManagerInstance.play(randomConstant);
    },
    modify() {
      this.onModify = true
      this.logBookStore.isClosable = true
      this.logBookStore.currentStep = LOGBOOK_STEP.WRITE_OR_DRAW;
    },
    async saveData() {
      if (this.onWrite) {
        if (this.textData.id === '') {
          this.textData = await DatabaseManagerInstance.createText(this.textData);
        } else {
          this.textData = await DatabaseManagerInstance.updateText(this.textData);
        }
        if (this.drawData.id != '') {
          await this.logBookStore.deleteDraw(this.drawData)
          this.drawData.id = ''
        }
      } else if (this.onDraw) {
        if (this.drawData.id === '') {
          this.drawData = await this.logBookStore.createDraw(this.drawData);
        } else {
          this.drawData = await this.logBookStore.updateDraw(this.drawData);
        }
        if (this.textData.id !== '') {
          await DatabaseManagerInstance.deleteText(this.textData)
          this.textData.id = ''
        }
      }

      this.mainStore.closeModal();
      this.logBookStore.currentStep = LOGBOOK_STEP.SELECT_ACTION;
      AudioManagerInstance.play(AUDIO.POP);

      setTimeout(() => {
        this.onWrite = false;
        this.onDraw = false;
        this.onModify = false;
        this.onSignature = false;
        this.logBookStore.isClosable = false
      }, 600);
    },
    saveDraw(data: string) {
      this.onSignature = true
      this.mainStore.openModal()
      this.logBookStore.currentStep = LOGBOOK_STEP.SIGN_DRAW;

      this.drawData.file = base64ToFile(data);
    },
    saveText() {
      this.onSignature = true
      this.mainStore.openModal()
      this.logBookStore.currentStep = LOGBOOK_STEP.SIGN_WRITE;
    }
  },
};
</script>

<style scoped>
.edit-corner {
  background: linear-gradient(to right, #E5D9B6 8px, transparent 8px) 0 0,
  linear-gradient(to right, #E5D9B6 8px, transparent 8px) 0 100%,
  linear-gradient(to left, #E5D9B6 8px, transparent 8px) 100% 0,
  linear-gradient(to left, #E5D9B6 8px, transparent 8px) 100% 100%,
  linear-gradient(to bottom, #E5D9B6 8px, transparent 8px) 0 0,
  linear-gradient(to bottom, #E5D9B6 8px, transparent 8px) 100% 0,
  linear-gradient(to top, #E5D9B6 8px, transparent 8px) 0 100%,
  linear-gradient(to top, #E5D9B6 8px, transparent 8px) 100% 100%;

  background-repeat: no-repeat;
  background-size: 40px 40px;
}
</style>
