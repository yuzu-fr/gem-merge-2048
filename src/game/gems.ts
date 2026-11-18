export interface Gem {
  value: number
  name: string
  english: string
  color: string
  note: string
  asset: string
}
const definitions = [
  [2, '白水晶', 'Clear Quartz', '#c5c4ce', '一切璀璨，都始于一颗小小的光。'],
  [4, '粉水晶', 'Rose Quartz', '#d68eaa', '把温柔，藏进浅浅的粉色里。'],
  [8, '紫水晶', 'Amethyst', '#9e76be', '一抹紫色，是梦境留下的礼物。'],
  [16, '海蓝宝', 'Aquamarine', '#58aebd', '将一整片清澈的海，握在手心。'],
  [32, '橄榄石', 'Peridot', '#8d9d44', '像初夏的新叶，明亮而充满生机。'],
  [64, '黄水晶', 'Citrine', '#c59836', '把午后的阳光，慢慢收藏。'],
  [128, '石榴石', 'Garnet', '#a0455e', '深红的切面里，藏着沉静的热烈。'],
  [256, '蓝宝石', 'Sapphire', '#4f66b9', '夜空的蓝，是永不熄灭的浪漫。'],
  [512, '红宝石', 'Ruby', '#c63d60', '愿每一份热爱，都有自己的光。'],
  [1024, '祖母绿', 'Emerald', '#399777', '穿过时间的绿，温润而坚定。'],
  [2048, '钻石', 'Diamond', '#9b9abc', '所有美好的相遇，终于成为永恒。'],
] as const

export const GEMS: Gem[] = definitions.map(([value, name, english, color, note]) => ({
  value,
  name,
  english,
  color,
  note,
  asset: new URL(`../assets/gems/${value}.svg`, import.meta.url).href,
}))
export function gemFor(value: number): Gem {
  return (
    GEMS.find((gem) => gem.value === value) ?? {
      ...GEMS[10]!,
      value,
      name: '星耀钻石',
      english: 'Beyond Diamond',
    }
  )
}
