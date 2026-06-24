import hoverSound from '@/assets/sounds/hover-sound.mp3';
import clickSound from '@/assets/sounds/click-sound.mp3';

class SoundManager {
  private hoverAudio: HTMLAudioElement | null = null;
  private clickAudio: HTMLAudioElement | null = null;
  private isInitialized = false;

  private init(): void {
    if (this.isInitialized) return;

    this.hoverAudio = new Audio(hoverSound);
    this.hoverAudio.volume = 0.15;
    this.hoverAudio.preload = 'auto';

    this.clickAudio = new Audio(clickSound);
    this.clickAudio.volume = 0.3;
    this.clickAudio.preload = 'auto';

    this.isInitialized = true;
  }

  playHoverSound(): void {
    this.init();
    if (this.hoverAudio) {
      this.hoverAudio.currentTime = 0;
      this.hoverAudio.play().catch((e) => console.log('Audio play failed:', e));
    }
  }

  playClickSound(): void {
    this.init();
    if (this.clickAudio) {
      this.clickAudio.currentTime = 0;
      this.clickAudio.play().catch((e) => console.log('Audio play failed:', e));
    }
  }
}

export const soundManager = new SoundManager();