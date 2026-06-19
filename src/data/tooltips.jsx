// 评分规则提示文案（纯内容，与 RuleTooltip 组件解耦，便于 HMR / 复用）。
import { ACADEMIC_COMP, PAPER_SCORES, ART_COMP, SPORT_COMP, ORG_LEVELS, HONOR_LEVELS, PENALTY_TYPES } from "./constants";
import { RuleTable } from "../components/RuleTable";

export const TOOLTIP_BASE = <div><p className="font-semibold mb-1">基准分（70分）</p><p>合格即得70分。未通过基准考核则为0分。</p></div>;
export const TOOLTIP_COLLECTIVE = <div><p className="font-semibold mb-1">集体活动分（0~3分）</p><p>每参加一次学校/书院集体活动得0.1~0.5分，累计上限3分。被评为集体活动优秀个人直接得3分。</p></div>;
export const TOOLTIP_POLITICAL = <div><p className="font-semibold mb-1">思政学习分（0~3分）</p><p>党团理论学习培训 +1；省、部级培训 +2；获优秀学员 <span className="font-semibold">额外</span> +1（需先参加至少一项培训）。累计上限 3 分。</p></div>;
export const TOOLTIP_SOCIAL = <div><p className="font-semibold mb-1">社会服务分（0~4分）</p><p>志愿服务≥32h 得 1 分（按比例）；社会实践合格 +1；挂职市级 +1 / 省级 +2；先进个人 <span className="font-semibold">额外</span> +1（需先参加任一服务）。上限 4 分。</p></div>;
export const TOOLTIP_PENALTY = (<div><p className="font-semibold mb-1">扣分项</p><RuleTable headers={["类型", "扣分"]} rows={PENALTY_TYPES.map(p => [p.label, p.score])} /></div>);
export const TOOLTIP_ACADEMIC = (<div><p className="font-semibold mb-1">学科/科技竞赛（上限10分）</p><p className="mb-1">同一项目取最高奖，不同项目累加。特等奖按一等奖计。</p><RuleTable headers={["级别", "一等", "二等", "三等"]} rows={Object.values(ACADEMIC_COMP).map(r => [r.label, r.first, r.second, r.third])} /></div>);
export const TOOLTIP_PAPER = (<div><p className="font-semibold mb-1">论文/专利/专著</p><p className="mb-1">与竞赛合计上限10分。按作者排名(1~4+)递减。</p><RuleTable headers={["类型", "第1", "第2", "第3", "第4+"]} rows={Object.values(PAPER_SCORES).map(r => [r.label, ...r.scores])} /></div>);
export const TOOLTIP_ART = (<div><p className="font-semibold mb-1">文艺竞赛评分标准</p><RuleTable headers={["级别", "一等", "二等", "三等", "优秀"]} rows={Object.values(ART_COMP).map(r => [r.label, r.first, r.second, r.third, r.excellence || "-"])} /></div>);
export const TOOLTIP_SPORT = (<div><p className="font-semibold mb-1">体育竞赛评分标准</p><p className="mb-1">破省级及以上纪录+5，破校纪录+3。</p><RuleTable headers={["级别", "第1", "第2", "第3", "4~8名"]} rows={Object.values(SPORT_COMP).map(r => [r.label, r.r1, r.r2, r.r3, r.r48])} /></div>);
export const TOOLTIP_ORG = (<div><p className="font-semibold mb-1">组织任职评分（上限4分）</p><p className="mb-1">多职务取最高分，不累加。</p><RuleTable headers={["级别", "优", "良", "合格"]} rows={ORG_LEVELS.map(l => [l.label.split("（")[0], l.scores.excellent, l.scores.good, l.scores.pass])} /></div>);
export const TOOLTIP_HONOR = (<div><p className="font-semibold mb-1">荣誉表彰评分</p><p className="mb-1">官方文件分两类，分值结构相同，可独立累加：</p><ul className="text-xs space-y-0.5 mb-1.5 list-disc list-inside"><li>（一）精神文明集体 / 个人荣誉称号</li><li>（二）见义勇为 / 勇斗歹徒 / 舍己救人 / 拾金不昧表彰</li></ul><RuleTable headers={["级别", "得分"]} rows={HONOR_LEVELS.map(l => [l.label, l.score])} /></div>);
export const TOOLTIP_DEEDS = <div><p className="font-semibold mb-1">好人好事加分（0~5分）</p><p>视具体情况由学校/书院认定，每次0.5~5分。</p></div>;
