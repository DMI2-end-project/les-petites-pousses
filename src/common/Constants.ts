export enum ROLE {
  TEACHER = 'teacher',
  STUDENT = 'student',
  PARENT = 'parent'
}

export enum EVENT {
  TOTAL_TEAMS = 'TotalTeams',
  LAUNCH_STORY = 'LaunchStory',
  LAUNCH_GAME = 'LaunchGame',
  START_GAME = 'StartGame',
  TEAM_VALIDATION = 'TeamValidation',
  GAME_VALIDATION = 'GameValidation',
  END_GAME = 'EndGame',
  BACK_STORY = 'BackStory',
  END_STORY = 'EndStory',
}

export enum STEP {
  INSTRUCTION,
  PLAY,
  WAIT,
  END
}