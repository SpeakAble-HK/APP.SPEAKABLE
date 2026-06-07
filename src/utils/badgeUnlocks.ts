export function getUnlockedBadges(userMissions: string[]) {
  const unlocked = [];
  if (userMissions.includes('mission_office')) unlocked.push('office-table');
  if (userMissions.includes('mission_chair')) unlocked.push('dining-chair');
  if (userMissions.includes('mission_utensils')) unlocked.push('utensils');
  if (userMissions.includes('mission_livingroom')) unlocked.push('living-room');
  return unlocked;
}
