import { Card, Badge, SectionTitle, Field, Select, NumberInput, Checkbox, AddButton, DynamicItem, cn } from "../ui";
import { RuleTooltip, TOOLTIP_BASE, TOOLTIP_COLLECTIVE, TOOLTIP_POLITICAL, TOOLTIP_SOCIAL, TOOLTIP_PENALTY } from "../RuleTooltip";
import { CollapsibleList, moveUp, moveDown } from "../CollapsibleList";
import { PENALTY_TYPES } from "../../data/constants";

export function ConductTab({ scores, basePass, setBasePass, collectiveMode, setCollectiveMode, collectiveCount, setCollectiveCount,
  collectivePerActivity, setCollectivePerActivity, collectiveManual, setCollectiveManual, collectiveOutstanding, setCollectiveOutstanding,
  politicalStudy, setPoliticalStudy, socialService, setSocialService, penalties, setPenalties }) {

  return (
    <div className="space-y-4">
      <SectionTitle icon="📋" title="品行素质分" subtitle="基准分 + 集体活动 + 思政学习 + 社会服务 − 扣分" score={scores.conduct.total} maxScore={80} color="teal" />

      <Card>
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">基准分<RuleTooltip content={TOOLTIP_BASE} /></h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">经班级评议合格、书院审定通过</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge color={basePass ? "emerald" : "red"}>{basePass ? "+70" : "0"}</Badge>
            <Checkbox checked={basePass} onChange={setBasePass} label="" />
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-3 gap-2">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">集体活动分<RuleTooltip content={TOOLTIP_COLLECTIVE} /> <Badge color="teal">上限 3</Badge></h3>
          <Badge color={collectiveOutstanding ? "emerald" : "slate"}>{collectiveOutstanding ? "满分" : `+${scores.conduct.collective.toFixed(1)}`}</Badge>
        </div>
        <Checkbox checked={collectiveOutstanding} onChange={setCollectiveOutstanding} label="对集体荣誉有突出贡献（一次性获满分 3 分）" />
        {!collectiveOutstanding && (
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
            <div className="flex gap-1 rounded-lg p-0.5 mb-3 bg-slate-100 dark:bg-slate-700">
              {["count", "manual"].map(m => (
                <button key={m} onClick={() => setCollectiveMode(m)}
                  className={cn("flex-1 py-1.5 px-3 rounded-md text-xs font-medium transition-all",
                    collectiveMode === m ? "bg-white text-slate-800 shadow-sm dark:bg-slate-600 dark:text-slate-100" : "text-slate-500 dark:text-slate-400")}>
                  {m === "count" ? "按次数计算" : "手动填写"}
                </button>
              ))}
            </div>
            {collectiveMode === "count" ? (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <label className="text-sm text-slate-600 dark:text-slate-400">次数</label>
                  <NumberInput value={collectiveCount} onChange={setCollectiveCount} min={0} max={30} />
                  <span className="text-xs text-slate-400 dark:text-slate-500">×</span>
                  <label className="text-sm text-slate-600 dark:text-slate-400">每次</label>
                  <NumberInput value={collectivePerActivity} onChange={setCollectivePerActivity} min={0.1} max={1} step={0.05} />
                  <span className="text-xs text-slate-400 dark:text-slate-500">分</span>
                </div>
                <div className="text-xs px-3 py-2 rounded-lg text-slate-500 bg-slate-50 dark:text-slate-400 dark:bg-slate-800/50">
                  {collectiveCount} × {collectivePerActivity} = {(collectiveCount * collectivePerActivity).toFixed(1)}
                  {collectiveCount * collectivePerActivity > 3 && <span className="text-amber-600 dark:text-amber-400 font-medium ml-2">→ 封顶 3.0</span>}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <input type="range" min={0} max={3} step={0.1} value={collectiveManual} onChange={e => setCollectiveManual(Number(e.target.value))} className="flex-1 accent-teal-500" />
                <span className="font-mono text-sm w-10 text-right font-semibold text-slate-700 dark:text-slate-200">{collectiveManual.toFixed(1)}</span>
              </div>
            )}
          </div>
        )}
      </Card>

      <Card>
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">思政学习分<RuleTooltip content={TOOLTIP_POLITICAL} /> <Badge color="teal">上限 3</Badge></h3>
        <div className="space-y-2.5">
          <Checkbox checked={politicalStudy.basic} onChange={v => setPoliticalStudy(p => ({ ...p, basic: v }))} label="参加党团组织理论学习培训（含网络学习）(+1)" />
          <Checkbox checked={politicalStudy.provincial} onChange={v => setPoliticalStudy(p => ({ ...p, provincial: v }))} label="参加省、部级理论学习培训 (+2)" />
          <Checkbox checked={politicalStudy.outstanding} onChange={v => setPoliticalStudy(p => ({ ...p, outstanding: v }))} label="获得优秀学员 (额外+1)" />
        </div>
        <div className="mt-2 text-right"><Badge color="teal">+{scores.conduct.political.toFixed(1)}</Badge></div>
      </Card>

      <Card>
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">社会服务分<RuleTooltip content={TOOLTIP_SOCIAL} /> <Badge color="teal">上限 4</Badge></h3>
        <Field label="志愿服务时长（小时/学年）" hint="≥32h 得 1 分，不足按比例">
          <div className="flex items-center gap-3">
            <NumberInput value={socialService.volunteerHours} onChange={v => setSocialService(p => ({ ...p, volunteerHours: v }))} max={200} />
            <span className="text-xs text-slate-500 dark:text-slate-400">→ +{Math.min(1, socialService.volunteerHours / 32).toFixed(2)}</span>
          </div>
        </Field>
        <Checkbox checked={socialService.socialPractice} onChange={v => setSocialService(p => ({ ...p, socialPractice: v }))} label="参加校级社会实践，考核合格 (+1)" />
        <Field label="挂职锻炼/政府见习">
          <Select value={socialService.internLevel} onChange={v => setSocialService(p => ({ ...p, internLevel: v }))}
            options={[{ value: "none", label: "未参加" }, { value: "city", label: "市、县级 (+1)" }, { value: "province", label: "省、部级 / 国际组织 (+2)" }]} />
        </Field>
        <Checkbox checked={socialService.advancedIndividual} onChange={v => setSocialService(p => ({ ...p, advancedIndividual: v }))} label="获先进个人及表彰 (额外+1)" />
        <div className="mt-2 text-right"><Badge color="teal">+{scores.conduct.social.toFixed(1)}</Badge></div>
      </Card>

      <Card>
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">扣分项<RuleTooltip content={TOOLTIP_PENALTY} /> <Badge color="red">不设上限</Badge></h3>
        <CollapsibleList
          items={penalties}
          threshold={3}
          renderItem={(p, i) => (
            <DynamicItem key={i} onRemove={() => setPenalties(ps => ps.filter((_, j) => j !== i))}
              onMoveUp={i > 0 ? () => setPenalties(ps => moveUp(ps, i)) : null}
              onMoveDown={i < penalties.length - 1 ? () => setPenalties(ps => moveDown(ps, i)) : null}
              showReorder={penalties.length > 1}
              score={-((PENALTY_TYPES[p.type]?.score || 0) * (p.count || 1))}>
              <div className="flex-1 min-w-[140px]">
                <Select value={p.type} onChange={v => setPenalties(ps => ps.map((pp, j) => j === i ? { ...pp, type: Number(v) } : pp))}
                  options={PENALTY_TYPES.map((t, idx) => ({ value: idx, label: `${t.label} (-${t.score})` }))} />
              </div>
              <div className="w-20"><NumberInput value={p.count} onChange={v => setPenalties(ps => ps.map((pp, j) => j === i ? { ...pp, count: v } : pp))} min={1} max={20} /></div>
            </DynamicItem>
          )}
          renderAdd={() => <AddButton onClick={() => setPenalties(ps => [...ps, { type: 0, count: 1 }])} label="添加扣分项" />}
        />
        {scores.conduct.penalty > 0 && <div className="mt-2 text-right"><Badge color="red">−{scores.conduct.penalty.toFixed(1)}</Badge></div>}
      </Card>
    </div>
  );
}
