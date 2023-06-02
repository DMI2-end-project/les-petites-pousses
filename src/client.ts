import {io, Socket} from "socket.io-client";
import {Pinia} from "pinia";
import {pinia} from "./main";
import {useMainStore} from "./stores/mainStore";
import {useChapterStore} from "./stores/chapterStore";
import {useGameStore} from "./stores/gameStore";
import {EVENT, ROLE} from "./common/Constants";
import {ChapterData, GameData} from "./common/Interfaces";

import chapterDataJSON from "./assets/chapters-data/chapters-data.json";
import gameDataJSON from "./assets/game-data/game-data-v2.json";

// TODO : for production
// "undefined" means the URL will be computed from the `window.location` object
const URL = process.env.NODE_ENV === "production" ? "https://botanium-node-server.fly.dev/" : "http://172.28.59.22:8080";

let socket: Socket;
export const getSocket = () => socket;


export const initClient = (pinia: Pinia) => {
  const mainStore = useMainStore(pinia);
  const chapterStore = useChapterStore(pinia);
  const gameStore = useGameStore(pinia);
  
  const chapterData: ChapterData = chapterDataJSON;
  const gameData: GameData = gameDataJSON;
  
  socket = io(URL, {
    autoConnect: false,
    rejectUnauthorized: false // WARN: please do not do this in production
  });
  
  socket.on("connect", () => {
    mainStore.connected = true;
  });
  
  socket.on("disconnect", () => {
    mainStore.connected = false;
  });
  
  socket.on("join", () => {
    console.log("join", mainStore.roomId);
  });
  
  // TODO
  socket.on(EVENT.ROOM_STATUS, (arg) => {
    console.log('EVENT.ROOM_STATUS', arg);
    
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
    
    chapterData.data = chapterData[mainStore.getChapterId];
    gameStore.data = gameData[mainStore.getFullGameId];
    
    /*
    if (arg.teamsValidation && gameStore.teamId && arg.teamsValidation[gameStore.teamId]) {
      gameStore.currentStep = GAMESTEP.WAIT
    } else {
      if (arg.step) {
        gameStore.currentStep = arg.step
      }
    }
    
     */
    
    /*
    if (arg.isPlaying) {
      router.push('/exercice/' + mainStore.getFullGameId);
    }
    
     */
  });
  
  socket.on(EVENT.TOTAL_TEAMS, (arg) => {
    console.log('EVENT.TOTAL_TEAMS', arg)
    gameStore.totalTeams = arg.totalTeams.length;
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
