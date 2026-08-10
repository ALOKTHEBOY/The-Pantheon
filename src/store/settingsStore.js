export const settingsStore = {
  // Check local storage to see if they muted the site on a previous visit
  isMuted: localStorage.getItem('pantheon_muted') === 'true',

  toggleMute() {
    this.isMuted = !this.isMuted;
    localStorage.setItem('pantheon_muted', this.isMuted);
    window.dispatchEvent(new CustomEvent('settingsUpdated'));
  },

  playSound(soundName) {
    if (this.isMuted) return; // Abort if muted
    
    try {
      // Look for the file in the public/sounds/ folder
      const audio = new Audio(`/sounds/${soundName}.mp3`);
      audio.volume = 0.6; // Keep it from being deafening
      audio.play().catch(e => console.log('Browser blocked autoplay:', e));
    } catch (error) {
      console.error("Audio playback failed", error);
    }
  }
};