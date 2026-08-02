/**
 * 将 timeline_journey.md 加工为 FitMemo seed JSON。
 * 运行: node scripts/build-journey-seed.mjs
 *
 * 标准化约定见输出文件头注释 / 控制台报告。
 */

import { writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

/** 小片 / 大片换算（日记未标明克数时） */
const SMALL = 1.25
const LARGE = 5

let setN = 0
let weN = 0
let dayN = 0

function sid() {
  setN += 1
  return `set_j${setN}`
}
function wid() {
  weN += 1
  return `we_j${weN}`
}
function did() {
  dayN += 1
  return `wd_j${dayN}`
}

function set(weightKg, reps) {
  return { id: sid(), weightKg, reps, done: true }
}

/** 同重量多组：w × r × n 或 w 配 reps 数组 */
function sets(weightKg, reps) {
  if (Array.isArray(reps)) return reps.map((r) => set(weightKg, r))
  return [set(weightKg, reps)]
}

function setsN(weightKg, reps, n) {
  return Array.from({ length: n }, () => set(weightKg, reps))
}

const EXERCISES = [
  { id: 'ex_smith_bench', name: '史密斯卧推', tags: ['胸'] },
  { id: 'ex_smith_incline_bench', name: '上斜史密斯卧推', tags: ['胸'] },
  { id: 'ex_bb_bench', name: '杠铃卧推', tags: ['胸'] },
  { id: 'ex_chest_press_machine', name: '推胸机', tags: ['胸'] },
  { id: 'ex_db_incline_shoulder', name: '坐姿上斜哑铃肩推', tags: ['肩'] },
  { id: 'ex_smith_shoulder', name: '史密斯肩推', tags: ['肩'] },
  { id: 'ex_db_shoulder', name: '哑铃肩推', tags: ['肩'] },
  { id: 'ex_rear_delt_fly', name: '肩后束蝴蝶机', tags: ['肩'] },
  { id: 'ex_db_lateral', name: '哑铃侧平举', tags: ['肩'] },
  { id: 'ex_face_pull', name: '绳索面拉', tags: ['肩', '背'] },
  { id: 'ex_tricep_pushdown', name: '绳索三头下压', tags: ['臂'] },
  { id: 'ex_assisted_dip', name: '辅助双杠臂屈伸', tags: ['臂'] },
  { id: 'ex_db_curl', name: '哑铃弯举', tags: ['臂'] },
  { id: 'ex_machine_curl', name: '器械弯举', tags: ['臂'] },
  { id: 'ex_goblet_squat', name: '高脚杯哑铃深蹲', tags: ['臀腿'] },
  { id: 'ex_smith_squat', name: '史密斯深蹲', tags: ['臀腿'] },
  { id: 'ex_bb_squat', name: '杠铃深蹲', tags: ['臀腿'] },
  { id: 'ex_rdl', name: '罗马尼亚硬拉', tags: ['臀腿'] },
  { id: 'ex_bb_dl', name: '杠铃硬拉', tags: ['臀腿'] },
  { id: 'ex_bulgarian', name: '保加利亚分腿蹲', tags: ['臀腿'] },
  { id: 'ex_hip_adduction', name: '坐姿髋内收', tags: ['臀腿'] },
  { id: 'ex_hip_abduction', name: '坐姿髋外展', tags: ['臀腿'] },
  { id: 'ex_back_extension', name: '山羊挺身', tags: ['背', '臀腿'] },
  { id: 'ex_hip_thrust', name: '臀推', tags: ['臀腿'] },
  { id: 'ex_band_lateral', name: '弹力带侧抬腿', tags: ['臀腿'] },
  { id: 'ex_row_plate', name: '坐姿划船（配重片）', tags: ['背'] },
  { id: 'ex_row_single', name: '坐姿划船（单滑轮）', tags: ['背'] },
  { id: 'ex_row_dual', name: '坐姿划船（双滑轮）', tags: ['背'] },
  { id: 'ex_assisted_pullup', name: '辅助引体向上', tags: ['背'] },
  { id: 'ex_reverse_row', name: '反握坐姿划船', tags: ['背'] },
  { id: 'ex_bb_row', name: '杠铃划船', tags: ['背'] },
  { id: 'ex_lat_plate', name: '高位下拉（配重片）', tags: ['背'] },
  { id: 'ex_lat_single', name: '高位下拉（单滑轮）', tags: ['背'] },
  { id: 'ex_lat_dual', name: '高位下拉（双滑轮）', tags: ['背'] },
  { id: 'ex_straight_arm', name: '直臂下压', tags: ['背'] },
  { id: 'ex_bosu_leg_raise', name: '波速球举腿', tags: ['核心'] },
]

const byId = Object.fromEntries(EXERCISES.map((e) => [e.id, e]))

function ex(exerciseId, setRows, extra = {}) {
  const lib = byId[exerciseId]
  if (!lib) throw new Error(`unknown exercise ${exerciseId}`)
  return {
    id: wid(),
    exerciseId,
    name: lib.name,
    sets: setRows,
    ...extra,
  }
}

function day(date, focus, exercises, note = '', scores = {}) {
  return {
    id: did(),
    date,
    focus,
    exercises,
    performance: scores.performance ?? 0,
    fatigue: scores.fatigue ?? 0,
    note,
    savedAt: `${date}T12:00:00.000Z`,
  }
}

const nameMapReport = [
  ['坐姿上斜哑铃肩推 / 坐姿哑铃肩推 / 哑铃坐姿肩推 / 哑铃肩推 / 肩推(胸肩日)', '坐姿上斜哑铃肩推（仅4.22）· 哑铃肩推（其余坐姿）· 史密斯肩推（史密斯）'],
  ['三头下压 / 绳索三头下压 / 肱三头肌绳索下压', '绳索三头下压'],
  ['辅助屈/曲臂支撑 / 曲臂支撑', '辅助双杠臂屈伸'],
  ['哑铃侧平举 / 哑铃侧平举飞鸟', '哑铃侧平举'],
  ['罗马尼亚哑铃硬拉 / 罗马尼亚硬拉 / RDL', '罗马尼亚硬拉'],
  ['硬拉 / 自由硬拉 / 杠铃硬拉（非RDL）', '杠铃硬拉'],
  ['自重/负重保加利亚*', '保加利亚分腿蹲'],
  ['坐姿髋内收 / 坐姿腿内收', '坐姿髋内收'],
  ['v字把/车把/宽距划船(20kg档)', '坐姿划船（配重片）'],
  ['单滑轮车把划船(~27kg)', '坐姿划船（单滑轮）'],
  ['双滑轮/宽距划船(~13.75kg)', '坐姿划船（双滑轮）'],
  ['高位/宽距下拉 按机器拆分', '高位下拉（配重片|单滑轮|双滑轮）'],
  ['自由卧推/空杆卧推/平板自由卧推', '杠铃卧推'],
  ['波速球垂悬举腿 / 波速球举腿', '波速球举腿'],
  ['有氧跑步/单车', '写入当日 note，不建组'],
]

const assumptions = [
  '日期年份按 2026（4.22–7.31）',
  `未标明克数：小片=${SMALL}kg，大片=${LARGE}kg；写「+1kg」则按 1kg；「+1片」默认小片`,
  '空杆且写 0kg/未写重量 → weightKg=0，备注空杆；「杠铃深蹲（20kg）5kg」主重量记 5，备注杠约20kg',
  '辅助引体/臂屈伸的公斤数为器械辅助重量（越大越轻松）',
  '史密斯深蹲括号内杠重仅作备注，组数据以日记主数字为准',
  '5.18 肱三头肌绳索下压无重量次数 → 跳过；6.5 二头弯举忘记重量 → 跳过并在日备注说明',
  '5.25 史密斯肩推未完成有效组 → 不入库，已改哑铃肩推',
]

/** @type {import('../src/lib/types').WorkoutDay[]} */
const workouts = []

// ——— 4.22 胸肩 ———
workouts.push(
  day(
    '2026-04-22',
    '胸肩',
    [
      ex('ex_smith_bench', [...setsN(5, 15, 2), ...setsN(7.5, 12, 2)], {
        note: '需要别人辅助',
      }),
      ex('ex_db_incline_shoulder', [
        set(4, 15),
        set(5, 18),
        set(5, 18),
        set(6, 15),
      ]),
      ex('ex_rear_delt_fly', [set(5, 11), set(5, 9), set(5, 9)], {
        note: '自觉偏重',
      }),
      ex('ex_db_lateral', [set(2.5, 12), set(2.5, 12), set(2.5, 12), set(4, 6)]),
      ex('ex_tricep_pushdown', setsN(8.75, 12, 4), { note: '有点太重了' }),
    ],
  ),
)

// ——— 4.25 臀腿 ———
workouts.push(
  day(
    '2026-04-25',
    '臀腿',
    [
      ex('ex_band_lateral', setsN(0, 12, 2), {
        bilateral: true,
        note: '热身；双边各12×2；弹力带无配重记0',
      }),
      ex('ex_goblet_squat', [set(8, 15), set(8, 15), set(12, 15), set(14, 15)]),
      ex('ex_rdl', setsN(10, 12, 4), {
        bilateral: true,
        note: '哑铃双边；腿有力但手腕握不住',
      }),
      ex('ex_hip_adduction', setsN(10, 12, 4)),
      ex('ex_hip_abduction', setsN(30, 15, 4)),
      ex('ex_back_extension', setsN(5, 12, 4)),
    ],
  ),
)

// ——— 4.26 背 ———
workouts.push(
  day(
    '2026-04-26',
    '背',
    [
      ex('ex_row_plate', setsN(20, 15, 4), { note: '原记：v字把划船' }),
      ex('ex_assisted_pullup', [...setsN(40, 12, 2), set(37.5, 10), set(37.5, 8)]),
      ex('ex_reverse_row', setsN(15, 10, 4), { note: '坐姿板凳反握；很累' }),
      ex('ex_face_pull', [set(10, 15), ...setsN(12.5, 12, 3)]),
      ex('ex_bb_row', [set(0, 12), set(0, 12), set(0, 12), set(0, 10)], {
        note: '空杆',
      }),
      ex('ex_db_curl', [set(4, 10), set(4, 10), set(4, 8), set(4, 8)], {
        note: '坐姿肱二头肌弯举',
      }),
    ],
    '有氧：跑步 7km/h×1km 心率约160；8km/h×0.5km 心率约170；共约25分钟',
  ),
)

// ——— 4.27 胸肩 ———
workouts.push(
  day(
    '2026-04-27',
    '胸肩',
    [
      ex('ex_smith_incline_bench', [set(5, 12), set(5, 10), set(5, 8), set(5, 8)], {
        note: '逐渐力竭',
      }),
      ex('ex_smith_shoulder', [set(2.5, 12), set(2.5, 12), set(2.5, 10), set(2.5, 10)]),
      ex('ex_db_lateral', [set(2.5, 18), set(2.5, 15), set(2.5, 15), set(4, 8)]),
      ex('ex_tricep_pushdown', [set(7.5, 15), set(7.5, 12), set(7.5, 12), set(7.5, 10)]),
      ex('ex_rear_delt_fly', [set(5, 8), set(5, 8), set(5, 7), set(5, 7)]),
      ex('ex_bosu_leg_raise', [set(0, 12), set(0, 10), set(0, 10), set(0, 10)]),
    ],
  ),
)

// ——— 4.29 臀腿 ———
workouts.push(
  day(
    '2026-04-29',
    '臀腿',
    [
      ex('ex_band_lateral', setsN(0, 12, 3), {
        bilateral: true,
        note: '热身 12×3×双边',
      }),
      ex(
        'ex_smith_squat',
        [...setsN(28, 15, 3), set(10, 12)],
        { note: '原记（13kg+7.5×2）≈28kg×15×3；另 10kg×12' },
      ),
      ex('ex_bulgarian', setsN(0, 15, 4), { note: '自重单边' }),
      ex('ex_bb_dl', [set(0, 15), ...setsN(2.5, 12, 2), set(5, 8)], {
        note: '空杆起；臀部发力合适但握不住',
      }),
      ex('ex_hip_thrust', setsN(0, 12, 4)),
      ex('ex_hip_abduction', [...setsN(30, 12, 2), set(35, 8)]),
      ex('ex_hip_adduction', setsN(10, 15, 2)),
    ],
  ),
)

// ——— 4.30 背 ———
workouts.push(
  day(
    '2026-04-30',
    '背',
    [
      ex('ex_row_plate', [...setsN(20, 15, 3), set(22.5, 15)], { note: '车把划船' }),
      ex('ex_assisted_pullup', [...setsN(40, 12, 3), set(37, 12)]),
      ex('ex_lat_plate', setsN(20 + SMALL, 12, 4), {
        note: `宽距下拉 20kg+小片 → ${20 + SMALL}kg`,
      }),
      ex('ex_reverse_row', setsN(15, 12, 4), { note: '坐姿板凳反握划船器械' }),
      ex('ex_bb_row', [set(0, 10), ...setsN(0, 12, 3)], { note: '空杆' }),
      ex('ex_db_curl', [...setsN(4, 12, 3), set(5, 4)], {
        note: '坐姿；自觉泵感强',
      }),
    ],
  ),
)

// ——— 5.7 胸肩 ———
workouts.push(
  day(
    '2026-05-07',
    '胸肩',
    [
      ex('ex_smith_incline_bench', [set(5, 12), set(5, 12), set(5, 11), set(5, 9)], {
        note: '假期后首次；力竭',
      }),
      ex('ex_db_shoulder', setsN(5, 12, 4), { note: '坐姿哑铃肩推' }),
      ex('ex_db_lateral', [...setsN(2.5, 15, 3), set(4, 8)]),
      ex('ex_face_pull', [...setsN(12.5, 12, 3), set(10, 12)], {
        note: '前几组标准一般；减重后标准且力竭',
      }),
      ex('ex_tricep_pushdown', [set(7.5, 15), ...setsN(7.5 + SMALL, 12, 3)], {
        note: `7.5 后加小片 → ${7.5 + SMALL}kg`,
      }),
    ],
    '假期回来后第一次练',
  ),
)

// ——— 5.8 臀腿 ———
workouts.push(
  day(
    '2026-05-08',
    '臀腿',
    [
      ex('ex_bb_squat', [...setsN(5, 12, 3), set(7.5, 6)], {
        note: '自由杠铃；杠约20kg，本组记所加片数',
      }),
      ex('ex_rdl', [set(5, 12), set(5, 12), set(5, 6), set(5, 8)], {
        note: '握不住',
      }),
      ex('ex_bulgarian', [...setsN(4, 12, 2), set(6, 8)], { note: '单腿负重' }),
      ex('ex_hip_thrust', [set(0, 12), ...setsN(5, 12, 3)]),
      ex('ex_hip_abduction', [set(30, 8), set(30, 10), set(30, 12)]),
      ex('ex_hip_adduction', [set(15, 12), set(15, 11)]),
    ],
  ),
)

// ——— 5.9 背 ———
workouts.push(
  day(
    '2026-05-09',
    '背',
    [
      ex('ex_lat_plate', [
        set(20 + SMALL, 12),
        set(20 + LARGE, 12),
        ...setsN(20 + 2 * LARGE, 12, 2),
      ], {
        note: `20+小片/大片/两片(按大片×2) → ${20 + SMALL}/${20 + LARGE}/${20 + 2 * LARGE}`,
      }),
      ex('ex_assisted_pullup', [
        ...setsN(37 + SMALL, 12, 2),
        set(37, 12),
        set(37, 9),
      ]),
      ex('ex_row_plate', setsN(20 + LARGE, 12, 4), { note: '宽距划船 20+大片' }),
      ex('ex_straight_arm', [set(10, 8), ...setsN(7.5, 15, 3)]),
    ],
  ),
)

// ——— 5.13 胸肩 ———
workouts.push(
  day(
    '2026-05-13',
    '胸肩',
    [
      ex('ex_bb_bench', setsN(0, 12, 4), {
        note: '空杆；最后一下力竭；稳定性一般',
      }),
      ex('ex_smith_shoulder', [...setsN(2.5, 12, 3), set(2.5, 10)]),
      ex('ex_db_lateral', [...setsN(2.5, 15, 2), set(4, 8), set(4, 10)]),
      ex('ex_rear_delt_fly', [set(5, 8), set(5, 8), set(5, 7), set(5, 7)]),
      ex('ex_tricep_pushdown', [set(8, 12), set(8, 12), set(8, 10), set(8, 10)]),
    ],
  ),
)

// ——— 5.14 臀腿 ———
workouts.push(
  day(
    '2026-05-14',
    '臀腿',
    [
      ex('ex_smith_squat', [set(7.5, 15), ...setsN(10, 12, 2), set(12.5, 8)], {
        note: '杠约13.6kg；太喘，不敢蹲太深',
      }),
      ex('ex_bb_dl', [...setsN(5, 12, 3), set(7.5, 12)]),
      ex('ex_bulgarian', [...setsN(6, 12, 2), set(8, 12)]),
      ex('ex_hip_abduction', [set(30, 12), set(30, 4)], {
        note: '原记 12+4，拆为两组',
      }),
      ex('ex_hip_adduction', [set(15, 8), set(15, 10)]),
    ],
    '热身约4分钟',
  ),
)

// ——— 5.16 背 ———
workouts.push(
  day(
    '2026-05-16',
    '背',
    [
      ex('ex_assisted_pullup', [
        ...setsN(37, 12, 2),
        set(34 + SMALL, 12),
        set(34, 10),
      ]),
      ex('ex_row_dual', setsN(13.75, 10, 4), {
        note: '车把；机器计数方式与配重片档不同',
      }),
      ex('ex_lat_dual', setsN(13.75, 10, 4), { note: '高位下拉；同上机器' }),
      ex('ex_straight_arm', setsN(7.5 + SMALL, 12, 3), {
        note: `7.5+小片 → ${7.5 + SMALL}；时间不够提前结束`,
      }),
    ],
    '来不及，提前结束',
  ),
)

// ——— 5.18 胸肩 ———
workouts.push(
  day(
    '2026-05-18',
    '胸肩',
    [
      ex('ex_bb_bench', setsN(0, 12, 4), { note: '自由空杆' }),
      ex('ex_db_shoulder', [...setsN(5, 15, 3), set(6, 12)]),
      ex('ex_db_lateral', setsN(4, 10, 4)),
      ex('ex_face_pull', [...setsN(10, 12, 2), ...setsN(12.5, 12, 2)]),
    ],
    '原日记绳索三头下压无重量次数，未入库',
  ),
)

// ——— 5.22 臀腿 ———
workouts.push(
  day(
    '2026-05-22',
    '臀腿',
    [
      ex('ex_smith_squat', [set(5, 15), ...setsN(7.5, 12, 2), set(10, 8)]),
      ex('ex_bb_dl', [
        set(2.5, 12),
        set(5, 12),
        set(5, 12),
        set(5, 12),
      ], { note: '自由硬拉；原记 2.5-5kg 12×4，按递增理解' }),
      ex('ex_hip_thrust', [set(0, 12), set(2.5, 12), set(5, 12), set(5, 12)]),
      ex('ex_bosu_leg_raise', setsN(0, 12, 3)),
    ],
    '中间生病后尝试；状态很差；四动作约50分钟',
    { fatigue: 5 },
  ),
)

// ——— 5.24 背 ———
workouts.push(
  day(
    '2026-05-24',
    '背',
    [
      ex('ex_row_dual', setsN(13.75, 12, 4), { note: '宽距划船' }),
      ex('ex_assisted_pullup', [...setsN(37, 12, 2), set(34, 10), set(34, 12)]),
      ex('ex_straight_arm', [set(10, 12), set(10, 8), set(7.5, 12), set(7.5, 12)]),
      ex('ex_lat_single', [
        set(20, 12),
        set(25, 12),
        set(25, 12),
        set(27, 10),
      ], { note: '单滑轮；原记 20 / 20+5 / 27' }),
      ex('ex_back_extension', setsN(5, 12, 4)),
      ex('ex_db_curl', [set(4, 12), set(4, 12), set(5, 10), set(6, 3)]),
    ],
  ),
)

// ——— 5.25 胸肩+有氧 ———
workouts.push(
  day(
    '2026-05-25',
    '胸肩',
    [
      ex('ex_smith_bench', [set(5, 12), ...setsN(7.5, 10, 3)]),
      ex('ex_db_shoulder', [set(5, 12), ...setsN(6, 12, 3)], {
        note: '史密斯2.5太轻、5做不满故改哑铃',
      }),
      ex('ex_db_lateral', setsN(4, 10, 4)),
    ],
    '有氧：6.5–7 配速约10min 心率160；间歇跑约10min；共约20min / 2.2km。史密斯肩推未记有效组。',
  ),
)

// ——— 5.26 臀腿 ———
workouts.push(
  day(
    '2026-05-26',
    '臀腿',
    [
      ex(
        'ex_smith_squat',
        [set(5, 12), set(7.5, 12), set(7.5, 8), set(7.5, 5), set(7.5, 5), set(7.5, 5)],
        { note: '减重蹲更深；心率约150' },
      ),
      ex('ex_bb_dl', [set(5, 12), ...setsN(6.25, 12, 3)]),
      ex('ex_hip_thrust', setsN(5, 12, 4)),
    ],
  ),
)

// ——— 5.28 背 ———
workouts.push(
  day(
    '2026-05-28',
    '背',
    [
      ex('ex_assisted_pullup', [
        set(37, 12),
        set(37, 12),
        set(34 + 1, 12),
        set(31, 5),
      ], { note: '原记 37×2；34+1kg；31kg×5（次数仅末组明确，前组按12）' }),
      ex('ex_lat_dual', setsN(13.75, 12, 4), { note: '宽距下拉双侧配重' }),
      ex('ex_row_plate', [...setsN(20 + LARGE, 12, 2), ...setsN(27, 12, 2)], {
        note: '宽距车把 20+大片 / 27',
      }),
      ex('ex_straight_arm', [
        ...setsN(10, 12, 2),
        ...setsN(7 + SMALL, 12, 2),
      ], { note: `7+小片 → ${7 + SMALL}` }),
      ex('ex_db_curl', [...setsN(5, 12, 2), set(6, 3)]),
    ],
  ),
)

// ——— 5.30 胸肩 ———
workouts.push(
  day(
    '2026-05-30',
    '胸肩',
    [
      ex('ex_chest_press_machine', [set(0, 6), set(0, 9), set(0, 8), set(0, 6)], {
        note: '空配重仍很重、难发力',
      }),
      ex('ex_db_shoulder', setsN(6, 12, 4)),
      ex('ex_db_lateral', [set(4, 12), set(4, 12), set(4, 10), set(4, 10)]),
      ex('ex_assisted_dip', setsN(37, 12, 4)),
    ],
    '有氧：7km/h 10min；间歇跑 5.5–8km/h 10min',
  ),
)

// ——— 6.3 臀 ———
workouts.push(
  day(
    '2026-06-03',
    '臀腿',
    [
      ex('ex_smith_squat', [set(5, 12), ...setsN(7.5, 6, 5)]),
      ex('ex_rdl', setsN(6.25, 12, 4)),
      ex('ex_hip_thrust', [set(5, 12), ...setsN(7.5, 12, 3)]),
    ],
  ),
)

// ——— 6.5 背 ———
workouts.push(
  day(
    '2026-06-05',
    '背',
    [
      ex('ex_assisted_pullup', setsN(34 + SMALL, 12, 4), {
        note: `34+1片 → ${34 + SMALL}`,
      }),
      ex('ex_lat_single', setsN(27, 12, 4)),
      ex('ex_row_dual', setsN(13.75, 12, 4), { note: '宽距划船双滑轮' }),
      ex('ex_straight_arm', setsN(7 + SMALL, 12, 4), {
        note: `7+1片 → ${7 + SMALL}`,
      }),
    ],
    '二头弯举重量忘记，未入库',
  ),
)

// ——— 6.8 胸肩 ———
workouts.push(
  day(
    '2026-06-08',
    '胸肩',
    [
      ex('ex_bb_bench', [set(0, 12), ...setsN(2.5, 8, 3)], {
        note: '空杆较轻松后加片',
      }),
      ex('ex_db_shoulder', [set(6, 12), set(7.5, 10), set(7.5, 10), set(7.5, 8)]),
      ex('ex_db_lateral', setsN(4, 12, 4)),
      ex('ex_assisted_dip', setsN(34, 12, 4)),
    ],
    '有氧：7.5km/h 10min；5.5–8.5 交替 10min',
  ),
)

// ——— 6.10 臀腿 ———
workouts.push(
  day(
    '2026-06-10',
    '臀腿',
    [
      ex('ex_rdl', [...setsN(6.25, 12, 3), set(7.5, 12)]),
      ex('ex_smith_squat', setsN(7.5, 8, 6)),
      ex('ex_hip_thrust', setsN(7.5, 12, 4)),
      ex('ex_bosu_leg_raise', setsN(0, 12, 3)),
    ],
  ),
)

// ——— 6.11 背 ———
workouts.push(
  day(
    '2026-06-11',
    '背',
    [
      ex('ex_assisted_pullup', setsN(34, 12, 4), { note: '未想象中累，下次可加' }),
      ex('ex_row_single', setsN(27, 12, 4), { note: '单滑轮车把划船' }),
      ex('ex_lat_dual', setsN(13.75, 12, 4), { note: '双滑轮高位下拉' }),
      ex('ex_machine_curl', [set(3.75, 15), set(5, 10), set(5, 8), set(5, 11)]),
      ex('ex_bosu_leg_raise', setsN(0, 12, 3)),
    ],
  ),
)

// ——— 6.13 胸肩 ———
workouts.push(
  day(
    '2026-06-13',
    '胸肩',
    [
      ex('ex_bb_bench', [set(2.5, 10), set(2.5, 8), set(2.5, 8), set(2.5, 8)]),
      ex('ex_db_shoulder', setsN(7.5, 8, 4)),
      ex('ex_db_lateral', setsN(4, 12, 4)),
      ex('ex_assisted_dip', setsN(31, 12, 4), { note: '下次不能再减辅助' }),
    ],
    '有氧：7.5km/h 10min + 间歇跑 10min',
  ),
)

// ——— 6.15 臀腿 ———
workouts.push(
  day(
    '2026-06-15',
    '臀腿',
    [
      ex('ex_smith_squat', setsN(7.5, 9, 6), {
        note: '心肺跟不上；蹲得较深',
      }),
      ex('ex_rdl', setsN(7.5, 12, 4), { note: '强度非常高' }),
      ex('ex_hip_thrust', setsN(7.5, 12, 4)),
      ex('ex_bosu_leg_raise', setsN(0, 12, 3)),
    ],
  ),
)

// ——— 6.17 背 ———
workouts.push(
  day(
    '2026-06-17',
    '背',
    [
      ex('ex_assisted_pullup', setsN(34, 12, 4)),
      ex('ex_lat_dual', [
        set(13, 12),
        set(13 + SMALL, 10),
        set(13 + SMALL, 10),
        set(13 + SMALL, 10),
      ], { note: `双滑轮；13 后+小片吃力 → ${13 + SMALL}` }),
      ex('ex_row_single', setsN(27, 12, 4), { note: '单滑轮划船；轻松' }),
      ex('ex_straight_arm', setsN(10, 12, 4), { note: '轻松' }),
      ex('ex_db_curl', [set(6.25, 8), set(6.25, 8), set(6.25, 7), set(6.25, 5)], {
        note: '最后一组做不起来',
      }),
    ],
    '人多忘热身，表现不佳',
  ),
)

// ——— 6.22 胸肩 ———
workouts.push(
  day(
    '2026-06-22',
    '胸肩',
    [
      ex('ex_db_shoulder', [set(7.5, 12), set(7.5, 12), set(7.5, 12), set(7.5, 10)], {
        note: '最后很痛苦',
      }),
      ex('ex_bb_bench', setsN(2.5, 8, 4), { note: '自由卧推' }),
      ex('ex_db_lateral', setsN(4, 12, 4), { note: '侧平举飞鸟；下次可试5kg' }),
      ex('ex_assisted_dip', [set(31, 12), set(31, 12), set(31, 8), set(31, 8)]),
    ],
    '室内单车 10min + 变速 10min',
  ),
)

// ——— 6.24 臀腿 ———
workouts.push(
  day(
    '2026-06-24',
    '臀腿',
    [
      ex('ex_smith_squat', setsN(7.5, 9, 6)),
      ex('ex_rdl', setsN(7.5, 12, 4), { note: '仍很难' }),
      ex('ex_hip_thrust', setsN(10, 12, 4)),
    ],
  ),
)

// ——— 6.27 背 ———
workouts.push(
  day(
    '2026-06-27',
    '背',
    [
      ex('ex_row_single', setsN(27 + 1, 12, 4), { note: '单滑轮车把 27+1' }),
      ex('ex_assisted_pullup', setsN(31 + 1, 8, 4), {
        note: '31+1；自觉变难（是否增重）',
      }),
      ex('ex_lat_dual', [set(13 + 1, 12), set(13 + 1, 12), set(13 + 1, 10), set(13 + 1, 10)]),
      ex('ex_straight_arm', [
        set(10 + 1, 10),
        set(10 + 1, 8),
        set(10 + 1, 8),
        set(10 + 1, 8),
      ]),
      ex('ex_db_curl', [set(6.25, 10), set(6.25, 8), set(6.25, 8)]),
    ],
  ),
)

// ——— 6.29 胸肩 ———
workouts.push(
  day(
    '2026-06-29',
    '胸肩',
    [
      ex('ex_db_shoulder', [set(6, 12), set(7.5, 12), set(7.5, 10), set(7.5, 8)], {
        note: '状态不好；6kg因器械被占',
      }),
      ex('ex_db_lateral', [set(5, 10), set(5, 8), set(5, 8), set(5, 8)], {
        note: '侧平举飞鸟；4kg被占用',
      }),
      ex('ex_assisted_dip', [set(31, 12), set(31, 12), set(31, 10), set(31, 10)], {
        note: '窄距',
      }),
      ex('ex_bb_bench', [set(0, 8), set(0, 8), set(0, 6), set(0, 6)], {
        note: '平板自由卧推空杆',
      }),
    ],
    '人多、器械难等；情绪低落、乏力，仍完成训练',
    { fatigue: 4, performance: 2 },
  ),
)

// ——— 7.1 臀腿 ———
workouts.push(
  day(
    '2026-07-01',
    '臀腿',
    [
      ex('ex_smith_squat', setsN(7.5, 10, 5), {
        note: '次数增幅不大但腿更有劲；出汗很多',
      }),
      ex('ex_rdl', setsN(7.5, 12, 4)),
      ex('ex_hip_thrust', setsN(10, 12, 4)),
    ],
  ),
)

// ——— 7.3 背 ———
workouts.push(
  day(
    '2026-07-03',
    '背',
    [
      ex('ex_assisted_pullup', [
        set(31 + 1, 10),
        set(31 + 1, 10),
        set(31 + 1, 8),
        set(31 + 1, 8),
      ]),
      ex('ex_row_single', setsN(27 + 1, 12, 4), { note: '更稳定' }),
      ex('ex_straight_arm', setsN(10 + 1, 12, 3)),
      ex('ex_lat_single', setsN(27 + 1, 12, 4), { note: '下次不用再加' }),
      ex('ex_db_curl', [set(6.25, 10), set(6.25, 8), set(6.25, 8), set(6.25, 6)]),
    ],
  ),
)

// ——— 7.11 胸肩（一周感冒后）———
workouts.push(
  day(
    '2026-07-11',
    '胸肩',
    [
      ex('ex_bb_bench', [set(1.25, 12), ...setsN(2.5, 8, 3)], {
        note: '1.25 热身；平板',
      }),
      ex('ex_db_shoulder', setsN(7.5, 10, 4)),
      ex('ex_db_lateral', setsN(5, 10, 4), { note: '侧平举飞鸟' }),
      ex('ex_assisted_dip', setsN(31, 12, 4)),
    ],
    '一周感冒后恢复训练',
  ),
)

// ——— 7.13 臀腿 ———
workouts.push(
  day(
    '2026-07-13',
    '臀腿',
    [
      ex('ex_smith_squat', [...setsN(7.5, 12, 4), set(10, 5)], {
        note: '7.5很累心肺差；10kg尝试，下次可试',
      }),
      ex('ex_bb_dl', setsN(7.5, 12, 4), { note: '硬拉；心肺爆炸' }),
      ex('ex_hip_thrust', setsN(12.5, 12, 4)),
    ],
  ),
)

// ——— 7.15 背 ———
workouts.push(
  day(
    '2026-07-15',
    '背',
    [
      ex('ex_assisted_pullup', [
        set(31 + 1, 10),
        set(31 + 1, 12),
        set(31 + 1, 12),
        set(31 + 1, 10),
      ], { note: '仍吃力' }),
      ex('ex_lat_single', [
        set(27 + 1, 12),
        set(27 + 1, 12),
        set(27 + 1, 10),
        set(27 + 1, 8),
      ], { note: '受不了了' }),
      ex('ex_row_dual', [
        set(13 + 1, 10),
        set(13 + 1, 12),
        set(13 + 1, 12),
        set(13 + 1, 12),
      ], { note: '宽距划船双滑轮' }),
      ex('ex_straight_arm', [set(10 + 1, 12), set(10 + 1, 12), set(10 + 1, 10)]),
    ],
    '耐力渐渐耗尽',
  ),
)

// ——— 7.17 胸肩 ———
workouts.push(
  day(
    '2026-07-17',
    '胸肩',
    [
      ex('ex_db_shoulder', setsN(7.5, 12, 4), { note: '坐姿' }),
      ex('ex_smith_bench', [set(7.5, 12), set(7.5, 10), set(7.5, 10), set(7.5, 10)], {
        note: '自由卧推人太多改史密斯',
      }),
      ex('ex_db_lateral', setsN(5, 10, 4), { note: '侧平举飞鸟' }),
      ex('ex_assisted_dip', [set(31, 12), set(31, 10), set(31, 10), set(31, 10)]),
    ],
  ),
)

// ——— 7.20 臀腿 ———
workouts.push(
  day(
    '2026-07-20',
    '臀腿',
    [
      ex('ex_smith_squat', setsN(10, 6, 6)),
      ex('ex_rdl', [...setsN(7.5, 12, 3), set(8.25, 12)], { note: '8.25 很痛苦' }),
      ex('ex_hip_thrust', setsN(12.5, 12, 4), { note: '强度极高' }),
    ],
    '今天要加班心情不好',
    { fatigue: 4 },
  ),
)

// ——— 7.22 背 ———
workouts.push(
  day(
    '2026-07-22',
    '背',
    [
      ex('ex_assisted_pullup', [
        set(31, 12),
        set(31, 10),
        set(31, 8),
        set(31, 8),
        set(31, 8),
      ], { note: '有意加大幅度，比上次标准' }),
      ex('ex_row_dual', setsN(13 + 1, 12, 4), { note: '双滑轮车把 13+1' }),
      ex('ex_straight_arm', [set(10, 12), ...setsN(10 + 1, 12, 2)]),
      ex('ex_lat_dual', [
        set(13 + 1, 10),
        set(13 + 1, 10),
        set(13 + 1, 8),
        set(13 + 1, 8),
      ], { note: '宽距双滑轮；顺序靠后已力竭' }),
    ],
    '人多，顺序受影响',
  ),
)

// ——— 7.24 胸 ———
workouts.push(
  day(
    '2026-07-24',
    '胸肩',
    [
      ex('ex_smith_bench', [set(7.5, 12), set(7.5, 10), set(7.5, 8), set(7.5, 8)], {
        note: '自觉状态差；怀疑晚餐过少',
      }),
      ex('ex_db_shoulder', [
        set(7.5, 12),
        set(7.5, 10),
        set(7.5, 8),
        set(7.5, 6),
        set(7.5, 6),
      ]),
      ex('ex_db_lateral', setsN(5, 10, 4)),
      ex('ex_tricep_pushdown', [...setsN(10, 12, 2), set(10, 10), set(11, 12)]),
    ],
  ),
)

// ——— 7.26 臀腿 ———
workouts.push(
  day(
    '2026-07-26',
    '臀腿',
    [
      ex('ex_smith_squat', setsN(10, 6, 6)),
      ex('ex_rdl', setsN(8.75, 10, 4)),
      ex('ex_hip_thrust', setsN(12.5, 12, 4)),
    ],
  ),
)

// ——— 7.29 背 ———
workouts.push(
  day(
    '2026-07-29',
    '背',
    [
      ex('ex_assisted_pullup', [
        set(31, 12),
        set(31, 10),
        set(31, 10),
        set(31, 8),
        set(31, 6),
      ]),
      ex('ex_lat_dual', [
        set(13 + 1, 10),
        set(13 + 1, 12),
        set(13 + 1, 12),
        set(13 + 3, 12),
      ], { note: '双滑轮；末组 13+3；原记带问号按12次录入' }),
      ex('ex_straight_arm', setsN(10 + 1, 10, 4)),
      ex('ex_row_dual', setsN(13 + 1, 12, 4), { note: '双滑轮车把' }),
      ex('ex_db_curl', [set(6.25, 12), set(6.25, 8), set(6.25, 8), set(6.25, 6)]),
    ],
  ),
)

// ——— 7.31 胸肩 ———
workouts.push(
  day(
    '2026-07-31',
    '胸肩',
    [
      ex('ex_bb_bench', [set(2.5, 12), set(2.5, 12), set(2.5, 10), set(2.5, 10)], {
        note: '自由卧推；自觉轻松，下次可加片',
      }),
      ex('ex_db_shoulder', [set(7.5, 8), set(7.5, 8), set(7.5, 8), set(7.5, 10)], {
        note: '肩推进步慢',
      }),
      ex('ex_db_lateral', setsN(5, 10, 4)),
      ex('ex_assisted_dip', setsN(28, 8, 4)),
    ],
  ),
)

// Templates from frequent recent patterns
const templates = [
  {
    id: 'tpl_chest_shoulder',
    name: '胸肩',
    exerciseIds: [
      'ex_bb_bench',
      'ex_db_shoulder',
      'ex_db_lateral',
      'ex_assisted_dip',
    ],
  },
  {
    id: 'tpl_legs',
    name: '臀腿',
    exerciseIds: ['ex_smith_squat', 'ex_rdl', 'ex_hip_thrust'],
  },
  {
    id: 'tpl_back',
    name: '背',
    exerciseIds: [
      'ex_assisted_pullup',
      'ex_row_dual',
      'ex_lat_dual',
      'ex_straight_arm',
      'ex_db_curl',
    ],
  },
]

const data = {
  version: 1,
  exercises: EXERCISES,
  templates,
  workouts: workouts.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0)),
  weights: [],
  measurements: [],
  bodyFat: [],
}

const outPath = join(__dirname, '../src/data/journeySeed.json')
writeFileSync(outPath, JSON.stringify(data, null, 2), 'utf8')

const totalSets = workouts.reduce(
  (n, w) => n + w.exercises.reduce((m, e) => m + e.sets.length, 0),
  0,
)

console.log('=== FitMemo journey seed ===')
console.log(`days: ${workouts.length}`)
console.log(`exercises: ${EXERCISES.length}`)
console.log(`templates: ${templates.length}`)
console.log(`sets: ${totalSets}`)
console.log(`wrote: ${outPath}`)
console.log('\n名称映射:')
for (const [from, to] of nameMapReport) console.log(`- ${from}\n  → ${to}`)
console.log('\n假设:')
for (const a of assumptions) console.log(`- ${a}`)
