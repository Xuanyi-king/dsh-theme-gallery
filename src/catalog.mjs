import { THEME as shanhe } from '../themes/shanhe/src/client.mjs';
import { THEME as ultraman } from '../themes/ultraman/src/client.mjs';
import { THEME as perfectWorld } from '../themes/perfect-world/src/client.mjs';
import { THEME as flameEmperor } from '../themes/flame-emperor/src/client.mjs';
import { THEME as greatSage } from '../themes/great-sage/src/client.mjs';
import { THEME as nezha } from '../themes/nezha/src/client.mjs';
import { THEME as whalePrince } from '../themes/whale-prince/src/client.mjs';
import { THEME as jianlaiAliang } from '../themes/jianlai-aliang/src/client.mjs';

const HERO_COPY = Object.freeze({
  shanhe: ['山河入墨，剑意问心', '一念为始 · 万里山河'],
  ultraman: ['以光之名，探索未知', '光在前方 · 向未知进发'],
  'perfect-world': ['诸天为卷，问道而行', '以身为种 · 一念开天'],
  'flame-emperor': ['异火为引，破云而行', '焰起苍穹 · 炼心成章'],
  'great-sage': ['踏云而来，万法皆通', '执一棒 · 问天地'],
  nezha: ['莲心未改，破浪而行', '燃一盏莲火 · 问乾坤'],
  'whale-prince': ['听潮问道，鲸游万象', '潮声为序 · 深海为章'],
  'jianlai-aliang': ['雨落江湖，执剑同行', '且行江湖路 · 静候一剑鸣'],
});

const entry = (slug, zh, en, detail, accent, intro, elapsed, english, placeholder, original) => Object.freeze({
  slug, id: `gallery-${slug}`, zh, en, detail, accent, intro, elapsed, english, placeholder,
  hero: HERO_COPY[slug][0], tagline: HERO_COPY[slug][1],
  definition: Object.freeze({ id: `gallery-${slug}`, colorScheme: original.colorScheme, tokens: original.tokens }),
});

export const CATALOG = Object.freeze([
  entry('shanhe', '山河剑意', 'Mountains & Ink', '宣纸 · 水墨 · 朱砂', '#ad5b4d', '墨意流转 · 凝神中', '墨意流转 · 已历', 'Ink tracing', '写下你的问题，或唤起一位同行者…', shanhe),
  entry('ultraman', '光之巨人', 'Giant of Light', '星空 · 红银 · 蓝光', '#69caff', '光能解析 · 聚焦中', '光能解析 · 已持续', 'Light scan', '输入你的问题，点亮下一程探索…', ultraman),
  entry('perfect-world', '荒天帝意象', 'Immortal Emperor', '宫阙 · 黑金 · 赤霞', '#d6a853', '推演诸天 · 悟道中', '推演诸天 · 已历', 'Realm divination', '以心问道，写下你的问题…', perfectWorld),
  entry('flame-emperor', '炎帝意象', 'Flame Emperor', '黑袍 · 异火 · 火莲', '#34c8c3', '异火推演 · 凝焰中', '异火推演 · 已炼', 'Flame forging', '落笔为火，写下你的问题…', flameEmperor),
  entry('great-sage', '齐天大圣', 'Great Sage', '火眼 · 金箍棒 · 云海', '#edba66', '腾云思索 · 正在推演', '腾云思索 · 已行', 'Cloudbound thinking', '且问天地，写下你的问题…', greatSage),
  entry('nezha', '哪吒 · 莲身破浪', 'Nezha', '莲火 · 混天绫 · 风火轮', '#e89c6e', '莲火推演 · 正在凝神', '莲火推演 · 已历', 'Lotus flame insight', '以心为火，写下你的问题…', nezha),
  entry('whale-prince', '鲸少 · 沧海之主', 'Whale Prince', '巨鲸 · 深海 · 冷金', '#49bde2', '鲸息推演 · 潮声渐起', '鲸息推演 · 已航', 'Deep sea thinking', '把问题交给深海…', whalePrince),
  entry('jianlai-aliang', '阿良 · 雨夜行', 'A Liang · Rain Road', '斗笠 · 雨夜 · 江湖', '#cfab74', '雨落江湖 · 问剑中', '雨落江湖 · 已行', 'Rain road · thinking', '说说这一路遇见的事…', jianlaiAliang),
]);
