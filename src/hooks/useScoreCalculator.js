import { useMemo } from "react";
import { ACADEMIC_COMP, PAPER_SCORES, ART_COMP, SPORT_COMP, ORG_LEVELS, HONOR_LEVELS, PENALTY_TYPES } from "../data/constants";

export function useScoreCalculator(state) {
  const {
    basePass, collectiveMode, collectiveCount, collectivePerActivity,
    collectiveManual, collectiveOutstanding, politicalStudy, socialService,
    penalties, academicComps, papers, artComps, sportComps,
    recordBreak, orgPosition, honors, goodDeeds,
  } = state;

  const scores = useMemo(() => {
    const base = basePass ? 70 : 0;
    const collectiveRaw = collectiveOutstanding ? 3 : collectiveMode === "count" ? collectiveCount * collectivePerActivity : collectiveManual;
    const collective = Math.min(3, Math.max(0, collectiveRaw));

    let political = 0;
    if (politicalStudy.basic) political += 1;
    if (politicalStudy.provincial) political += 2;
    if (politicalStudy.outstanding) political += 1;
    political = Math.min(3, political);

    let social = Math.min(1, socialService.volunteerHours / 32);
    if (socialService.socialPractice) social += 1;
    if (socialService.internLevel === "city") social += 1;
    if (socialService.internLevel === "province") social += 2;
    if (socialService.advancedIndividual) social += 1;
    social = Math.min(4, social);

    const penaltyTotal = penalties.reduce((s, p) => s + (PENALTY_TYPES[p.type]?.score || 0) * (p.count || 1), 0);
    const conductCapped = Math.min(80, Math.max(0, base + collective + political + social - penaltyTotal));

    let academicCompTotal = 0;
    academicComps.forEach(c => {
      const t = ACADEMIC_COMP[c.level]; if (!t) return;
      if (c.award === "special" || c.award === "first") academicCompTotal += t.first;
      else if (c.award === "second") academicCompTotal += t.second;
      else if (c.award === "third") academicCompTotal += t.third;
      else if (c.award === "excellence") academicCompTotal += t.excellence || 0;
    });
    let paperTotal = 0;
    papers.forEach(p => {
      const t = PAPER_SCORES[p.type]; if (!t) return;
      let s = t.scores[Math.min(p.authorRank - 1, 3)] || 0;
      if (p.type === "book" && p.authorRank > 3) s = Math.max(1, 6 - (p.authorRank - 3));
      if (p.outstandingPaper) s += 1;
      paperTotal += s;
    });
    const academicTotal = Math.min(10, academicCompTotal + paperTotal);

    let artTotal = 0;
    artComps.forEach(c => { const t = ART_COMP[c.level]; if (t) artTotal += t[c.award] || 0; });
    let sportTotal = 0;
    sportComps.forEach(c => { const t = SPORT_COMP[c.level]; if (t) sportTotal += t[c.rank] || 0; });
    const recordBonus = recordBreak === "provincial" ? 5 : recordBreak === "school" ? 3 : 0;
    const artSportTotal = Math.min(6, artTotal + sportTotal + recordBonus);

    let orgScore = 0;
    if (orgPosition.level >= 0 && orgPosition.rating !== "none") orgScore = ORG_LEVELS[orgPosition.level]?.scores[orgPosition.rating] || 0;
    const orgCapped = Math.min(4, orgScore);
    const abilityTotal = Math.min(20, academicTotal + artSportTotal + orgCapped);

    let honorTotal = 0;
    honors.forEach(h => { honorTotal += HONOR_LEVELS[h.level]?.score || 0; });
    const rewardCapped = Math.min(5, honorTotal + goodDeeds);

    return {
      conduct: { base, collective, political, social, penalty: penaltyTotal, total: conductCapped },
      ability: { academic: academicTotal, artSport: artSportTotal, org: orgCapped, total: abilityTotal },
      reward: { honor: Math.min(5, honorTotal), deeds: goodDeeds, total: rewardCapped },
      total: conductCapped + abilityTotal + rewardCapped,
    };
  }, [basePass, collectiveMode, collectiveCount, collectivePerActivity, collectiveManual, collectiveOutstanding,
    politicalStudy, socialService, penalties, academicComps, papers, artComps, sportComps, recordBreak, orgPosition, honors, goodDeeds]);

  return scores;
}

export const getAcademicCompScore = (c) => { const t = ACADEMIC_COMP[c.level]; if (!t) return 0; if (c.award === "special" || c.award === "first") return t.first; if (c.award === "second") return t.second; if (c.award === "third") return t.third; return t.excellence || 0; };
export const getPaperScore = (p) => { const t = PAPER_SCORES[p.type]; if (!t) return 0; let s = t.scores[Math.min(p.authorRank - 1, 3)] || 0; if (p.type === "book" && p.authorRank > 3) s = Math.max(1, 6 - (p.authorRank - 3)); if (p.outstandingPaper) s += 1; return s; };
export const getArtScore = (c) => { const t = ART_COMP[c.level]; return t?.[c.award] || 0; };
export const getSportScore = (c) => { const t = SPORT_COMP[c.level]; return t?.[c.rank] || 0; };
