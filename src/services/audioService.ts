// Audio TTS Service using Google Translate TTS (Primary) & Web Speech API / Native Capacitor (Fallback)
import { TextToSpeech } from '@capacitor-community/text-to-speech';
import { Capacitor } from '@capacitor/core';

let currentAudio: HTMLAudioElement | null = null;

export const speakJapanese = async (text: string, rate: number = 0.9): Promise<void> => {
  if (!text || !text.trim()) return;
  const cleanText = text.trim();

  // Stop any currently playing audio
  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    } catch {}
    currentAudio = null;
  }

  // Method 1: Google Translate TTS High-Quality MP3 Stream (100% reliable on all phones/browsers)
  try {
    const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=ja&q=${encodeURIComponent(cleanText)}`;
    const audio = new Audio(audioUrl);
    currentAudio = audio;
    audio.playbackRate = rate;

    await new Promise<void>((resolve, reject) => {
      audio.onended = () => resolve();
      audio.onerror = (e) => reject(e);
      const playPromise = audio.play();
      if (playPromise) {
        playPromise.catch(reject);
      }
    });
    return;
  } catch (err) {
    console.warn('Google Audio TTS failed, attempting fallback...', err);
  }

  // Method 2: Native Capacitor TTS (if packaged as APK)
  if (Capacitor.isNativePlatform()) {
    try {
      await TextToSpeech.speak({
        text: cleanText,
        lang: 'ja-JP',
        rate: rate,
      });
      return;
    } catch (e) {
      console.warn('Native TTS error, falling back to Web Speech', e);
    }
  }

  // Method 3: Browser Web Speech API
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported in this browser.');
      resolve();
      return;
    }

    try {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'ja-JP';
      utterance.rate = rate;

      const voices = window.speechSynthesis.getVoices();
      const jaVoice = voices.find((v) => v.lang.startsWith('ja') || v.lang.includes('JP'));
      if (jaVoice) {
        utterance.voice = jaVoice;
      }

      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();

      window.speechSynthesis.speak(utterance);
    } catch {
      resolve();
    }
  });
};

export const speakVietnamese = async (text: string, rate: number = 1.0): Promise<void> => {
  if (!text || !text.trim()) return;
  const cleanText = text.trim();

  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    } catch {}
    currentAudio = null;
  }

  // Method 1: Google Translate TTS High-Quality MP3 Stream
  try {
    const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=vi&q=${encodeURIComponent(cleanText)}`;
    const audio = new Audio(audioUrl);
    currentAudio = audio;
    audio.playbackRate = rate;

    await new Promise<void>((resolve, reject) => {
      audio.onended = () => resolve();
      audio.onerror = (e) => reject(e);
      const playPromise = audio.play();
      if (playPromise) {
        playPromise.catch(reject);
      }
    });
    return;
  } catch (err) {
    console.warn('Google Audio TTS failed, attempting fallback...', err);
  }

  // Method 2: Native Capacitor TTS
  if (Capacitor.isNativePlatform()) {
    try {
      await TextToSpeech.speak({
        text: cleanText,
        lang: 'vi-VN',
        rate: rate,
      });
      return;
    } catch (e) {
      console.warn('Native TTS error, falling back to Web Speech', e);
    }
  }

  // Method 3: Browser Web Speech API
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) {
      resolve();
      return;
    }

    try {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'vi-VN';
      utterance.rate = rate;

      const voices = window.speechSynthesis.getVoices();
      const viVoice = voices.find((v) => v.lang.startsWith('vi') || v.lang.includes('VN'));
      if (viVoice) {
        utterance.voice = viVoice;
      }

      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();

      window.speechSynthesis.speak(utterance);
    } catch {
      resolve();
    }
  });
};

// Play sound feedback for test results (Ding / Error buzz)
export const playFeedbackSound = (type: 'correct' | 'wrong'): void => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    if (type === 'correct') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    } else {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, audioCtx.currentTime); // A3
      osc.frequency.linearRampToValueAtTime(130.81, audioCtx.currentTime + 0.2); // C3
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    }
  } catch (e) {
    // Ignore audio context errors
  }
};
