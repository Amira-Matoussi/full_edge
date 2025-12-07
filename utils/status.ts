export const getStatus = (
  isRecording: boolean,
  isProcessing: boolean,
  isPlaying: boolean,
  hasMemory: number,
): string => {
  if (isRecording) {
    return "listening"
  } else if (isProcessing) {
    return "thinking"
  } else if (isPlaying) {
    return "speaking"
  } else {
    return hasMemory > 0 ? "ready" : "clickToStart"
  }
}
