
import type { AchievementId, GameStats, PhoneDesign, Achievement, CustomProcessor } from './types';
import { ACHIEVEMENT_DEFINITIONS, LOCAL_STORAGE_ACHIEVEMENTS_KEY, LOCAL_STORAGE_CUSTOM_PROCESSORS_KEY } from './types';
import type { Language } from '@/context/LanguageContext'; // Assuming Language type might be needed for 't'

// Function to check and unlock a single achievement
function checkAndUnlockAchievement(
  achievementId: AchievementId,
  stats: GameStats,
  phones: PhoneDesign[],
  toast: (options: { title: string; description?: string; variant?: 'default' | 'destructive' }) => void,
  t: (key: string, replacements?: Record<string, string | number>) => string,
  language: string
) {
  const achievement = ACHIEVEMENT_DEFINITIONS.find(a => a.id === achievementId);
  if (!achievement) return;

  const storedAchievementsString = localStorage.getItem(LOCAL_STORAGE_ACHIEVEMENTS_KEY);
  const unlockedAchievements: AchievementId[] = storedAchievementsString ? JSON.parse(storedAchievementsString) : [];

  if (unlockedAchievements.includes(achievementId)) {
    return; // Already unlocked
  }

  // Pass other relevant data to condition if needed. For now, customProcessors for 'innovatorCPU'
  let otherData: any = {};
  if (achievementId === 'innovatorCPU') {
    const customProcessors = JSON.parse(localStorage.getItem(LOCAL_STORAGE_CUSTOM_PROCESSORS_KEY) || '[]') as CustomProcessor[];
    otherData.customProcessors = customProcessors;
  }


  if (achievement.condition(stats, phones, otherData)) {
    unlockedAchievements.push(achievementId);
    localStorage.setItem(LOCAL_STORAGE_ACHIEVEMENTS_KEY, JSON.stringify(unlockedAchievements));

    let updatedStats = { ...stats };
    if (achievement.xpReward) {
      updatedStats.xp += achievement.xpReward;
      // Note: GameStats update (like totalFunds from level up) should ideally be handled by a central stats update mechanism
      // For now, we directly update xp. If level ups happen here, they should also update totalFunds.
      // This simple XP addition is fine for now, actual level up logic is in page.tsx / design.tsx / rd.tsx
    }
    // Dispatch event or update stats centrally if other rewards affect GameStats directly
    localStorage.setItem(LOCAL_STORAGE_GAME_STATS_KEY, JSON.stringify(updatedStats)); // Save updated XP
    window.dispatchEvent(new CustomEvent('gameStatsChanged'));


    toast({
      title: t('achievementUnlockedToastTitle'),
      description: t(achievement.descriptionKey),
    });
  }
}

// Function to check all achievements
export function checkAllAchievements(
  stats: GameStats,
  phones: PhoneDesign[],
  toast: (options: { title: string; description?: string; variant?: 'default' | 'destructive' }) => void,
  t: (key: string, replacements?: Record<string, string | number>) => string,
  language: string
) {
  ACHIEVEMENT_DEFINITIONS.forEach(achievement => {
    checkAndUnlockAchievement(achievement.id, stats, phones, toast, t, language);
  });
}
