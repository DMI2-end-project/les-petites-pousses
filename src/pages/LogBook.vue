<template>
  <div class="bg-log-book w-screen h-screen bg-cover bg-center">
    <Transition name="fade">
      <Book v-if="isLoad" />
    </Transition>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import Book from '../components/log-book/Book.vue'
import {useLogBookStore} from "../stores/logBookStore";
import {useMainStore} from "../stores/mainStore";

export default defineComponent({
  name: 'LogBookComponent',
  components: {
    Book
  },
  data() {
    return {
      logBookStore: useLogBookStore(),
      mainStore: useMainStore(),
      isLoad: false,
    }
  },
   watch: {
    'mainStore.roomId': {
       handler() {
        this.fetchData()
      },
    }
  },
  mounted() {
    this.fetchData()
  },
  methods: {
    async fetchData() {
      if (this.mainStore.roomId) {
        await this.logBookStore.fetchPages(this.mainStore.roomId)
        await this.logBookStore.fetchPhotos(this.mainStore.roomId)
        await this.logBookStore.fetchDraws(this.mainStore.roomId)
        this.isLoad = true
      }
    }
  }
});
</script>

<style lang="css">
</style>
