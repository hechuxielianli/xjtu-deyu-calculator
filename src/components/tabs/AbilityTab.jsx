import { Card, Badge, SectionTitle, Field, Select, Checkbox, AddButton, DynamicItem } from "../ui";
import { RuleTooltip, TOOLTIP_ACADEMIC, TOOLTIP_PAPER, TOOLTIP_ART, TOOLTIP_SPORT, TOOLTIP_ORG } from "../RuleTooltip";
import { CollapsibleList, moveUp, moveDown } from "../CollapsibleList";
import { ACADEMIC_COMP, PAPER_SCORES, ART_COMP, SPORT_COMP, ORG_LEVELS } from "../../data/constants";
import { getAcademicCompScore, getPaperScore, getArtScore, getSportScore } from "../../hooks/useScoreCalculator";

export function AbilityTab({ scores, academicComps, setAcademicComps, papers, setPapers, artComps, setArtComps,
  sportComps, setSportComps, recordBreak, setRecordBreak, orgPosition, setOrgPosition }) {

  return (
    <div className="space-y-4">
      <SectionTitle icon="🏆" title="能力拓展分" subtitle="学术科研（10）+ 文体竞赛（6）+ 组织任职（4）" score={scores.ability.total} maxScore={20} color="orange" />

      <div className="rounded-2xl border border-orange-200/60 bg-orange-50/40 dark:border-orange-800/40 dark:bg-orange-950/20 p-2 sm:p-3 space-y-3">
        <Card>
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">学科/科技竞赛获奖<RuleTooltip content={TOOLTIP_ACADEMIC} /></h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mb-3">同一项目取最高，不同项目累加。特等奖按一等奖。</p>
          <CollapsibleList
            items={academicComps}
            threshold={3}
            renderItem={(c, i) => (
              <DynamicItem key={i} onRemove={() => setAcademicComps(cs => cs.filter((_, j) => j !== i))}
                onMoveUp={i > 0 ? () => setAcademicComps(cs => moveUp(cs, i)) : null}
                onMoveDown={i < academicComps.length - 1 ? () => setAcademicComps(cs => moveDown(cs, i)) : null}
                showReorder={academicComps.length > 1}
                score={getAcademicCompScore(c)}>
                <div className="min-w-[120px] flex-1 sm:flex-none sm:w-36">
                  <Select value={c.level} onChange={v => setAcademicComps(cs => cs.map((cc, j) => j === i ? { ...cc, level: v } : cc))}
                    options={Object.entries(ACADEMIC_COMP).map(([k, v]) => ({ value: k, label: v.label }))} />
                </div>
                <div className="w-24 sm:w-28">
                  <Select value={c.award} onChange={v => setAcademicComps(cs => cs.map((cc, j) => j === i ? { ...cc, award: v } : cc))}
                    options={[{ value: "special", label: "特等奖" }, { value: "first", label: "一等奖" }, { value: "second", label: "二等奖" }, { value: "third", label: "三等奖" },
                      ...(c.level === "school" ? [{ value: "excellence", label: "优秀奖" }] : [])]} />
                </div>
              </DynamicItem>
            )}
            renderAdd={() => <AddButton onClick={() => setAcademicComps(cs => [...cs, { level: "national", award: "first" }])} label="添加竞赛获奖" />}
          />
        </Card>

        <Card>
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">论文 / 专利 / 专著<RuleTooltip content={TOOLTIP_PAPER} /></h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mb-3">与竞赛合计上限 10 分</p>
          <CollapsibleList
            items={papers}
            threshold={3}
            renderItem={(p, i) => (
              <DynamicItem key={i} onRemove={() => setPapers(ps => ps.filter((_, j) => j !== i))}
                onMoveUp={i > 0 ? () => setPapers(ps => moveUp(ps, i)) : null}
                onMoveDown={i < papers.length - 1 ? () => setPapers(ps => moveDown(ps, i)) : null}
                showReorder={papers.length > 1}
                score={getPaperScore(p)}>
                <div className="min-w-[120px] flex-1 sm:flex-none sm:w-40">
                  <Select value={p.type} onChange={v => setPapers(ps => ps.map((pp, j) => j === i ? { ...pp, type: v } : pp))}
                    options={Object.entries(PAPER_SCORES).map(([k, v]) => ({ value: k, label: v.label }))} />
                </div>
                <div className="w-24">
                  <Select value={p.authorRank} onChange={v => setPapers(ps => ps.map((pp, j) => j === i ? { ...pp, authorRank: Number(v) } : pp))}
                    options={[1,2,3,4,5,6].map(n => ({ value: n, label: `第${n}作者` }))} />
                </div>
                <Checkbox checked={p.outstandingPaper || false} onChange={v => setPapers(ps => ps.map((pp, j) => j === i ? { ...pp, outstandingPaper: v } : pp))} label="优秀论文" />
              </DynamicItem>
            )}
            renderAdd={() => <AddButton onClick={() => setPapers(ps => [...ps, { type: "intl_journal", authorRank: 1, outstandingPaper: false }])} label="添加论文/专利" />}
          />
        </Card>

        <div className="mt-1 pr-2 text-right"><Badge color="orange">学术: {scores.ability.academic.toFixed(1)}/10</Badge></div>
      </div>

      <Card>
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">文艺竞赛<RuleTooltip content={TOOLTIP_ART} /></h3>
        <p className="text-xs text-slate-400 dark:text-slate-500 mb-3">文体合计上限 6 分</p>
        <CollapsibleList
          items={artComps}
          threshold={3}
          renderItem={(c, i) => (
            <DynamicItem key={i} onRemove={() => setArtComps(cs => cs.filter((_, j) => j !== i))}
              onMoveUp={i > 0 ? () => setArtComps(cs => moveUp(cs, i)) : null}
              onMoveDown={i < artComps.length - 1 ? () => setArtComps(cs => moveDown(cs, i)) : null}
              showReorder={artComps.length > 1}
              score={getArtScore(c)}>
              <div className="min-w-[100px] flex-1 sm:flex-none sm:w-32">
                <Select value={c.level} onChange={v => setArtComps(cs => cs.map((cc, j) => j === i ? { ...cc, level: v } : cc))}
                  options={Object.entries(ART_COMP).map(([k, v]) => ({ value: k, label: v.label }))} />
              </div>
              <div className="w-24 sm:w-28">
                <Select value={c.award} onChange={v => setArtComps(cs => cs.map((cc, j) => j === i ? { ...cc, award: v } : cc))}
                  options={[{ value: "first", label: "一等奖" }, { value: "second", label: "二等奖" }, { value: "third", label: "三等奖" },
                    ...(c.level !== "school" ? [{ value: "excellence", label: "优秀奖" }] : [])]} />
              </div>
            </DynamicItem>
          )}
          renderAdd={() => <AddButton onClick={() => setArtComps(cs => [...cs, { level: "national", award: "first" }])} label="添加文艺获奖" />}
        />

        <div className="my-4 border-t border-slate-200/80 dark:border-slate-700/60" />

        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">体育竞赛<RuleTooltip content={TOOLTIP_SPORT} /></h3>
        <CollapsibleList
          items={sportComps}
          threshold={3}
          renderItem={(c, i) => (
            <DynamicItem key={i} onRemove={() => setSportComps(cs => cs.filter((_, j) => j !== i))}
              onMoveUp={i > 0 ? () => setSportComps(cs => moveUp(cs, i)) : null}
              onMoveDown={i < sportComps.length - 1 ? () => setSportComps(cs => moveDown(cs, i)) : null}
              showReorder={sportComps.length > 1}
              score={getSportScore(c)}>
              <div className="min-w-[100px] flex-1 sm:flex-none sm:w-32">
                <Select value={c.level} onChange={v => setSportComps(cs => cs.map((cc, j) => j === i ? { ...cc, level: v } : cc))}
                  options={Object.entries(SPORT_COMP).map(([k, v]) => ({ value: k, label: v.label }))} />
              </div>
              <div className="w-24 sm:w-28">
                <Select value={c.rank} onChange={v => setSportComps(cs => cs.map((cc, j) => j === i ? { ...cc, rank: v } : cc))}
                  options={[{ value: "r1", label: "第1名" }, { value: "r2", label: "第2名" }, { value: "r3", label: "第3名" }, { value: "r48", label: "4-8名" }]} />
              </div>
            </DynamicItem>
          )}
          renderAdd={() => <AddButton onClick={() => setSportComps(cs => [...cs, { level: "national", rank: "r1" }])} label="添加体育获奖" />}
        />
        <Field label="破纪录">
          <Select value={recordBreak} onChange={setRecordBreak}
            options={[{ value: "none", label: "未破纪录" }, { value: "provincial", label: "破省级及以上 (+5)" }, { value: "school", label: "破校级 (+3)" }]} />
        </Field>
        <div className="mt-2 text-right"><Badge color="orange">文体: {scores.ability.artSport.toFixed(1)}/6</Badge></div>
      </Card>

      <Card>
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">学生组织任职<RuleTooltip content={TOOLTIP_ORG} /> <Badge color="orange">上限 4</Badge></h3>
        <p className="text-xs text-slate-400 dark:text-slate-500 mb-3">多职务以最高分计，不累加</p>
        <Field label="最高职务级别">
          <Select value={orgPosition.level} onChange={v => setOrgPosition(p => ({ ...p, level: Number(v) }))}
            options={[{ value: -1, label: "未担任职务" }, ...ORG_LEVELS.map((l, i) => ({ value: i, label: l.label }))]} />
        </Field>
        {orgPosition.level >= 0 && (
          <Field label="考核结果">
            <Select value={orgPosition.rating} onChange={v => setOrgPosition(p => ({ ...p, rating: v }))}
              options={[{ value: "none", label: "请选择" }, { value: "excellent", label: "优" }, { value: "good", label: "良" }, { value: "pass", label: "合格" }]} />
          </Field>
        )}
        <div className="mt-2 text-right"><Badge color="orange">任职: {scores.ability.org.toFixed(1)}/4</Badge></div>
      </Card>
    </div>
  );
}
