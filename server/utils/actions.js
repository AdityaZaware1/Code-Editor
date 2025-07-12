const ACTIONS = {
  JOIN_REQUEST: "join-request",
  JOIN_ACCEPTED: "join-accepted",
  USER_JOINED: "user-joined",
  USER_DISCONNECTED: "user-disconnected",
  USERNAME_EXISTS: "username-exists",
  SYNC_FILES: "sync-files",
  FILE_CREATED: "file-created",
  FILE_UPDATED: "file-updated",
  FILE_RENAMED: "file-renamed",
  FILE_DELETED: "file-deleted",
  USER_OFFLINE: "user-offline",
  USER_ONLINE: "user-online",
  TYPING_START: "typing-start",
  TYPING_PAUSE: "typing-pause",
  SEND_MESSAGE: "send-message",
  RECEIVE_MESSAGE: "receive-message",

  // 👇 Video Call Actions
  VIDEO_OFFER: "video-offer",
  VIDEO_ANSWER: "video-answer",
  ICE_CANDIDATE: "ice-candidate",
}

module.exports = ACTIONS
