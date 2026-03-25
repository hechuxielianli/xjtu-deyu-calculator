export const ACADEMIC_COMP = {
  national: { label: "国际/国家级", first: 10, second: 9, third: 8 },
  provincial: { label: "省级", first: 8, second: 6, third: 4 },
  school: { label: "校级/地方/行业", first: 4, second: 3, third: 2, excellence: 1 },
};

export const PAPER_SCORES = {
  intl_journal: { label: "国际期刊论文", scores: [10, 8, 6, 2] },
  core_journal: { label: "国内核心/国际会议", scores: [6, 5, 4, 1] },
  general: { label: "国内一般期刊/会议", scores: [3, 2, 1, 0] },
  book: { label: "出版专著", scores: [10, 8, 6, 0] },
  invention_patent: { label: "发明专利", scores: [10, 8, 6, 2] },
  utility_patent: { label: "实用新型/软著", scores: [6, 5, 4, 1] },
};

export const ART_COMP = {
  national: { label: "国际/国家级", first: 6, second: 5, third: 4, excellence: 3 },
  provincial: { label: "省级", first: 4, second: 3.5, third: 3, excellence: 2 },
  school: { label: "校级", first: 2, second: 1.5, third: 1 },
};

export const SPORT_COMP = {
  national: { label: "国际/国家级", r1: 6, r2: 5, r3: 4, r48: 3 },
  provincial: { label: "省级", r1: 4, r2: 3.5, r3: 3, r48: 2 },
  school: { label: "校级", r1: 2, r2: 1.5, r3: 1, r48: 0.5 },
};

export const ORG_LEVELS = [
  { label: "一级（大学生党委副书记/院级及以上学生组织正职等）", scores: { excellent: 4, good: 3.5, pass: 3 } },
  { label: "二级（党总支委员/院级及以上学生组织副职/优秀社团正职等）", scores: { excellent: 3.5, good: 3, pass: 2.5 } },
  { label: "三级（党支部委员/部长/甲级社团正职/团支书/班长等）", scores: { excellent: 2, good: 1.5, pass: 1 } },
  { label: "四级（干事/班级一般干部/宿舍长等）", scores: { excellent: 1, good: 0.75, pass: 0.5 } },
];

export const HONOR_LEVELS = [
  { label: "全国级", score: 5 },
  { label: "省级", score: 4 },
  { label: "市级", score: 3 },
  { label: "校级", score: 2 },
  { label: "院级", score: 1 },
];

export const PENALTY_TYPES = [
  { label: "通报批评", score: 2 },
  { label: "警告处分", score: 4 },
  { label: "严重警告处分", score: 6 },
  { label: "记过处分", score: 8 },
  { label: "留校察看处分", score: 10 },
  { label: "旷课（未达处分）", score: 1 },
  { label: "宿舍卫生不合格", score: 1 },
];

export const STORAGE_KEY = "xjtu-deyu-data";
export const STORAGE_VERSION = 1;
export const DEFAULT_STATE = {
  basePass: true, collectiveMode: "count", collectiveCount: 0, collectivePerActivity: 0.3,
  collectiveManual: 0, collectiveOutstanding: false,
  politicalStudy: { basic: false, provincial: false, outstanding: false },
  socialService: { volunteerHours: 0, socialPractice: false, internLevel: "none", advancedIndividual: false },
  penalties: [], academicComps: [], papers: [], artComps: [], sportComps: [],
  recordBreak: "none", orgPosition: { level: -1, rating: "none" }, honors: [], goodDeeds: 0,
};
