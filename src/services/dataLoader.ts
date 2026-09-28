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

  // Sort lessons by number extracted from lesson_id or lesson_name
  lessons.sort((a, b) => {
    const numA = parseInt(a.lesson_id.replace(/\D/g, ''), 10) || 0;
    const numB = parseInt(b.lesson_id.replace(/\D/g, ''), 10) || 0;
    return numA - numB;
  });

  return lessons;
};
