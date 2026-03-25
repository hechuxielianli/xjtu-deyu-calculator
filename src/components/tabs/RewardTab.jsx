import { Card, SectionTitle, Field, Select, NumberInput, AddButton, DynamicItem } from "../ui";
import { RuleTooltip, TOOLTIP_HONOR, TOOLTIP_DEEDS } from "../RuleTooltip";
import { CollapsibleList, moveUp, moveDown } from "../CollapsibleList";
import { HONOR_LEVELS } from "../../data/constants";

export function RewardTab({ scores, honors, setHonors, goodDeeds, setGoodDeeds }) {
  return (
    <div className="space-y-4">
      <SectionTitle icon="⭐" title="奖励分" subtitle="荣誉表彰 + 好人好事，累加上限 5 分" score={scores.reward.total} maxScore={5} color="amber" />
      <Card>
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">荣誉表彰<RuleTooltip content={TOOLTIP_HONOR} /></h3>
        <CollapsibleList
          items={honors}
          threshold={3}
          renderItem={(h, i) => (
            <DynamicItem key={i} onRemove={() => setHonors(hs => hs.filter((_, j) => j !== i))}
              onMoveUp={i > 0 ? () => setHonors(hs => moveUp(hs, i)) : null}
              onMoveDown={i < honors.length - 1 ? () => setHonors(hs => moveDown(hs, i)) : null}
              showReorder={honors.length > 1}
              score={HONOR_LEVELS[h.level]?.score || 0}>
              <div className="w-40">
                <Select value={h.level} onChange={v => setHonors(hs => hs.map((hh, j) => j === i ? { ...hh, level: Number(v) } : hh))}
                  options={HONOR_LEVELS.map((l, idx) => ({ value: idx, label: `${l.label} (+${l.score})` }))} />
              </div>
            </DynamicItem>
          )}
          renderAdd={() => <AddButton onClick={() => setHonors(hs => [...hs, { level: 0 }])} label="添加荣誉表彰" />}
        />
      </Card>
      <Card>
        <Field label={<>好人好事 / 突出贡献<RuleTooltip content={TOOLTIP_DEEDS} /></>} hint="每次 +1 分，可累加">
          <div className="flex items-center gap-3">
            <NumberInput value={goodDeeds} onChange={setGoodDeeds} min={0} max={10} />
            <span className="text-xs text-slate-500 dark:text-slate-400">次 → +{goodDeeds}</span>
          </div>
        </Field>
      </Card>
    </div>
  );
}
