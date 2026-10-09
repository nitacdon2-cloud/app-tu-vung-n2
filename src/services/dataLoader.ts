import { Lesson } from '../types/vocab';

// Use Vite's eager glob import to bundle all lesson JSON files in src/data/
const lessonModules = import.meta.glob('../data/*.json', { eager: true });

export const getAllLessons = (): Lesson[] => {
  const lessons: Lesson[] = [];

  for (const path in lessonModules) {
    const mod = lessonModules[path] as any;
    const lessonData = mod.default || mod;

    if (lessonData && lessonData.lesson_id && Array.isArray(lessonData.words)) {
      lessons.push(lessonData);
    }
  }

  // Sort lessons cleanly by order or chapter and section numbers
  lessons.sort((a, b) => {
    if (a.order !== undefined && b.order !== undefined) {
      return a.order - b.order;
    }
    const partsA = a.lesson_id.match(/\d+/g)?.map(Number) || [0];
    const partsB = b.lesson_id.match(/\d+/g)?.map(Number) || [0];
    for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
      const diff = (partsA[i] || 0) - (partsB[i] || 0);
      if (diff !== 0) return diff;
    }
    return 0;
  });

  return lessons;
};
