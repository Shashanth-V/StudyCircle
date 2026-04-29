export const calculateMatchScore = (userA, userB) => {
  let score = 0;
  let breakdown = { subjects: 0, levels: 0, availability: 0, style: 0, location: 0 };
  let mutualSubjects = [];

  // Subject overlap (+10 per subject, max 40)
  const aSubjects = userA.subjects || [];
  const bSubjects = userB.subjects || [];
  
  aSubjects.forEach(subA => {
    const matchB = bSubjects.find(subB => subB.name.toLowerCase() === subA.name.toLowerCase());
    if (matchB) {
      breakdown.subjects += 10;
      mutualSubjects.push(subA.name);
      
      // Level match (+5 per subject where same level, max 20)
      if (subA.level === matchB.level) {
        breakdown.levels += 5;
      }
    }
  });

  breakdown.subjects = Math.min(breakdown.subjects, 40);
  breakdown.levels = Math.min(breakdown.levels, 20);

  // Availability overlap
  const aAvail = userA.availability || [];
  const bAvail = userB.availability || [];
  let availMatches = 0;

  aAvail.forEach(slotA => {
    const match = bAvail.find(slotB => slotB.day === slotA.day && slotB.startTime === slotA.startTime);
    if (match) availMatches++;
  });
  
  breakdown.availability = Math.min(availMatches * 5, 20);

  // Study Style
  if (userA.studyStyle === userB.studyStyle) {
    breakdown.style = 10;
  } else if (userA.studyStyle === 'mixed' || userB.studyStyle === 'mixed') {
    breakdown.style = 5;
  }

  // Location
  if (userA.city && userB.city && userA.city.toLowerCase() === userB.city.toLowerCase()) {
    breakdown.location = 10;
  }

  score = breakdown.subjects + breakdown.levels + breakdown.availability + breakdown.style + breakdown.location;

  return { score, breakdown, mutualSubjects };
};
