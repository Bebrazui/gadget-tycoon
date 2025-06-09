
import type { AchievementId, GameStats, PhoneDesign, Achievement, CustomProcessor, Employee } from './types'; // Added Employee
import { ACHIEVEMENT_DEFINITIONS, LOCAL_STORAGE_ACHIEVEMENTS_KEY, LOCAL_STORAGE_CUSTOM_PROCESSORS_KEY, LOCAL_STORAGE_GAME_STATS_KEY, LOCAL_STORAGE_HIRED_EMPLOYEES_KEY } from './types'; // Added LOCAL_STORAGE_HIRED_EMPLOYEES_KEY
import type { toast as ToastType } from "@/hooks/use-toast";
import type { Language } from '@/context/LanguageContext';

// Function to check and unlock a single achievement
function checkAndUnlockAchievement(
  achievementId: AchievementId,
  stats: GameStats,
  phones: PhoneDesign[],
  toast: typeof ToastType,
  t: (key: string, replacements?: Record<string, string | number>) => string,
  language: string, 
  otherData?: any // Made otherData optional
) {
  const achievement = ACHIEVEMENT_DEFINITIONS.find(a => a.id === achievementId);
  if (!achievement) return;

  const storedAchievementsString = localStorage.getItem(LOCAL_STORAGE_ACHIEVEMENTS_KEY);
  const unlockedAchievements: AchievementId[] = storedAchievementsString ? JSON.parse(storedAchievementsString) : [];

  if (unlockedAchievements.includes(achievementId)) {
    return; // Already unlocked
  }

  let dataForCondition = { ...otherData }; // Start with any passed otherData

  if (achievementId === 'innovatorCPU' && !dataForCondition.customProcessors) {
    try {
        const customProcessors = JSON.parse(localStorage.getItem(LOCAL_STORAGE_CUSTOM_PROCESSORS_KEY) || '[]') as CustomProcessor[];
        dataForCondition.customProcessors = customProcessors;
    } catch (e) {
        console.error("Error parsing custom processors for achievement check:", e);
        dataForCondition.customProcessors = [];
    }
  }

  if (achievementId === 'firstHire' && !dataForCondition.hiredEmployees) {
    try {
        const hiredEmployees = JSON.parse(localStorage.getItem(LOCAL_STORAGE_HIRED_EMPLOYEES_KEY) || '[]') as Employee[];
        dataForCondition.hiredEmployees = hiredEmployees;
    } catch (e) {
        console.error("Error parsing hired employees for achievement check:", e);
        dataForCondition.hiredEmployees = [];
    }
  }


  if (achievement.condition(stats, phones, dataForCondition)) {
    unlockedAchievements.push(achievementId);
    localStorage.setItem(LOCAL_STORAGE_ACHIEVEMENTS_KEY, JSON.stringify(unlockedAchievements));

    let updatedStats = { ...stats };
    if (achievement.xpReward) {
      updatedStats.xp += achievement.xpReward;
    }
    
    localStorage.setItem(LOCAL_STORAGE_GAME_STATS_KEY, JSON.stringify(updatedStats));
    window.dispatchEvent(new CustomEvent('gameStatsChanged'));


    toast({
      title: t('achievementUnlockedToastTitle'),
      description: `${t(achievement.titleKey)}: ${t(achievement.descriptionKey)} (+${achievement.xpReward} XP)`,
    });
  }
}

// Function to check all achievements
export function checkAllAchievements(
  stats: GameStats,
  phones: PhoneDesign[],
  toast: typeof ToastType,
  t: (key: string, replacements?: Record<string, string | number>) => string,
  language: string,
  otherData?: any // Made otherData optional
) {
  ACHIEVEMENT_DEFINITIONS.forEach(achievement => {
    checkAndUnlockAchievement(achievement.id, stats, phones, toast, t, language, otherData);
  });
}

    