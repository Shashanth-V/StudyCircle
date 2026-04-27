/**
 * Calculate match score between two users
 * Scoring:
 *  +40 pts: subject overlap
 *  +20 pts: same skill level per overlapping subject
 *  +20 pts: availability overlap
 *  +10 pts: same study style
 *  +10 pts: same city
 * @param {Object} userA
 * @param {Object} userB
 * @returns {number} score 0-100
 */
export const calculateMatchScore = (userA, userB) => {
  let score = 0;

  // Subject overlap (+40 max)
  const subjectsA = userA.subjects || [];
  const subjectsB = userB.subjects || [];
  const subjectNamesA = new Set(subjectsA.map(s => s.name.toLowerCase()));
  const subjectNamesB = new Set(subjectsB.map(s => s.name.toLowerCase()));

  const commonSubjects = [...subjectNamesA].filter(name => subjectNamesB.has(name));
  const subjectOverlap = commonSubjects.length / Math.max(subjectNamesA.size, subjectNamesB.size, 1);
  score += Math.round(subjectOverlap * 40);

  // Same skill level for overlapping subjects (+20 max)
  if (commonSubjects.length > 0) {
    let levelMatches = 0;
    for (const subName of commonSubjects) {
      const levelA = subjectsA.find(s => s.name.toLowerCase() === subName)?.level;
      const levelB = subjectsB.find(s => s.name.toLowerCase() === subName)?.level;
      if (levelA && levelB && levelA === levelB) {
        levelMatches++;
      }
    }
    const levelOverlap = levelMatches / commonSubjects.length;
    score += Math.round(levelOverlap * 20);
  }

  // Availability overlap (+20 max)
  const availA = userA.availability || [];
  const availB = userB.availability || [];
  const daysA = new Set(availA.map(a => a.day));
  const daysB = new Set(availB.map(a => a.day));
  const commonDays = [...daysA].filter(d => daysB.has(d));
  const availOverlap = commonDays.length / Math.max(daysA.size, daysB.size, 1);
  score += Math.round(availOverlap * 20);

  // Same study style (+10)
  if (userA.studyStyle && userB.studyStyle && userA.studyStyle === userB.studyStyle) {
    score += 10;
  }

  // Same city (+10)
  if (userA.city && userB.city && userA.city.toLowerCase() === userB.city.toLowerCase()) {
    score += 10;
  }

  return Math.min(100, score);
};

