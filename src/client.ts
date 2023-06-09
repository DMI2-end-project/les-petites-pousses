import {io, Socket} from "socket.io-client";
import {Pinia} from "pinia";
import {pinia} from "./main";
import {useMainStore} from "./stores/mainStore";
import {useChapterStore} from "./stores/chapterStore";
import {useGameStore} from "./stores/gameStore";
import {CHAPTER_STEP, EVENT, GAME_STEP, ROLE} from "./common/Constants";
import {ChapterData, GameData} from "./common/Interfaces";

import chapterDataJSON from "./assets/json/chapters-data.json";
import gameDataJSON from "./assets/json/games-data.json";
import router from "./router";

// TODO : for production
// "undefined" means the URL will be computed from the `window.location` object
const URL = process.env.NODE_ENV === "production" ? "https://botanium-node-server.fly.dev/" : "http://localhost:8080";

let socket: Socket;
export const getSocket = () => socket;

export const initClient = (pinia: Pinia) => {
  const mainStore = useMainStore(pinia);
  const chapterStore = useChapterStore(pinia);
  const gameStore = useGameStore(pinia);

  const chapterData: ChapterData = chapterDataJSON;
  const gameData: GameData = gameDataJSON;

  socket = io(URL, {
    reconnectionDelay: 500,
    timeout: 3000,
    closeOnBeforeunload: false,
    rejectUnauthorized: false // WARN: please do not do this in production
  });

  socket.on("connect", () => {
    mainStore.connected = true;
  });

  socket.on("disconnect", () => {
    mainStore.connected = false;
  });

  socket.on(EVENT.ROOM_STATUS, (arg) => {
    console.log('Client EVENT.ROOM_STATUS', arg);

    if (arg.chapterId) {
      mainStore.chapterId = arg.chapterId
    }
    if (arg.gameId) {
      mainStore.gameId = arg.gameId
    }
    if (arg.chapterStep) {
      chapterStore.currentStep = arg.chapterStep;
    }
    if (arg.gameStep) {
      gameStore.currentStep = arg.gameStep;
    }
    if (arg.currentParagraph) {
      chapterStore.currentParagraph = arg.currentParagraph;
    }
    if (arg.currentSequence) {
      gameStore.currentSequence = arg.currentSequence;
    }
    if (arg._teams) {
      gameStore.teams = arg._teams;
    }

    chapterStore.data = chapterData[mainStore.getChapterId];
    gameStore.data = gameData[mainStore.getFullGameId];

    if (arg._teams && gameStore.teamId !== undefined) {
      let team = arg._teams.find((team: any) => team._teamId === gameStore.teamId);
      if (team && arg.gameStep === GAME_STEP.PLAY && team.isValidated) {
        gameStore.currentStep = GAME_STEP.WAIT
      }
    }

    if (arg.tasksScanned) {
      chapterStore.tasksScanned = arg.tasksScanned;
    }

    setTimeout(() => {
      if (mainStore.role === ROLE.STUDENT) { // TODO : && localStorage.getItem('join') !== 'false'
        if ((router.currentRoute.value.name !== 'Scan') && (arg.chapterStep !== CHAPTER_STEP.IDLE && router.currentRoute.value.name !== 'Chapter') || (arg.gameStep !== GAME_STEP.IDLE && router.currentRoute.value.name !== 'Game')) {
          console.log('arg.chapterStep', arg.chapterStep, 'arg.gameStep', arg.gameStep, 'router.currentRoute.value.name', router.currentRoute.value.name)
          mainStore.askForRedirection = true
        }
      }
    }, 800)
  });
}

export const connectClient = async () => {
  const mainStore = useMainStore(pinia);
  const gameStore = useGameStore(pinia);

  await socket.connect();
  await socket.emit('join', {
    role: mainStore.role,
    roomId: mainStore?.roomId,
    teamId: gameStore?.teamId,
    teamName: gameStore?.teamName
  });
}

export const taskScanned = async () => {
  const mainStore = useMainStore(pinia);

  await socket.emit('taskScanned', {
    roomId: mainStore.roomId
  });
}
