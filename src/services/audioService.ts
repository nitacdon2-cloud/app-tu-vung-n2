// Audio TTS Service using Youdao & Google Translate TTS (Primary) & Web Speech API / Native Capacitor (Fallback)
import { TextToSpeech } from '@capacitor-community/text-to-speech';
import { Capacitor } from '@capacitor/core';

let currentAudio: HTMLAudioElement | null = null;

const stopCurrentAudio = () => {
  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    } catch {}
    currentAudio = null;
  }
};

const playAudioUrl = (url: string, rate: number = 1.0): Promise<void> => {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    (audio as any).referrerPolicy = 'no-referrer';
    audio.src = url;
    audio.playbackRate = rate;
    currentAudio = audio;

    const cleanup = () => {
      audio.onended = null;
      audio.onerror = null;
    };

    audio.onended = () => {
      cleanup();
      resolve();
    };

    audio.onerror = (e) => {
      cleanup();
      reject(e);
    };

    const playPromise = audio.play();
    if (playPromise) {
      playPromise.catch((e) => {
        cleanup();
        reject(e);
      });
    }
  });
};

const speakWithWebSpeech = (text: string, lang: string, rate: number): Promise<void> => {
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

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = rate;

      const voices = window.speechSynthesis.getVoices();
      const prefix = lang.slice(0, 2);
      const matchVoice = voices.find((v) => v.lang.startsWith(prefix));
      if (matchVoice) {
        utterance.voice = matchVoice;
      }

      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();

      window.speechSynthesis.speak(utterance);
    } catch {
      resolve();
    }
  });
};

export const speakJapanese = async (text: string, rate: number = 0.9): Promise<void> => {
  if (!text || !text.trim()) return;
  const cleanText = text.trim();

  stopCurrentAudio();

  // Method 1: Youdao Japanese Audio Stream (Fast, high-quality native Japanese, never blocked by Referer)
  try {
    const youdaoUrl = `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(cleanText)}&le=jap`;
    await playAudioUrl(youdaoUrl, rate);
    return;
  } catch (err1) {
    console.warn('Youdao TTS failed, trying Google TTS...', err1);
  }

  // Method 2: Google Translate TTS Stream
  try {
    const googleUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=ja&q=${encodeURIComponent(cleanText)}`;
    await playAudioUrl(googleUrl, rate);
    return;
  } catch (err2) {
    console.warn('Google Audio TTS failed, attempting Native/Web Speech fallback...', err2);
  }

  // Method 3: Native Capacitor TTS (if inside APK)
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

  // Method 4: Browser Web Speech API
  return speakWithWebSpeech(cleanText, 'ja-JP', rate);
};

export const speakVietnamese = async (text: string, rate: number = 1.0): Promise<void> => {
  if (!text || !text.trim()) return;
  const cleanText = text.trim();

  stopCurrentAudio();

  // Method 1: Google Translate TTS
  try {
    const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=vi&q=${encodeURIComponent(cleanText)}`;
    await playAudioUrl(audioUrl, rate);
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
  return speakWithWebSpeech(cleanText, 'vi-VN', rate);
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
