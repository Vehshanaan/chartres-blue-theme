# Chartres Blue — 色彩研究

> 沙特尔大教堂（Chartres Cathedral）12 世纪彩窗中传奇的钴蓝色。这份文档记录了设计两套 VS Code 主题之前的色彩调研。

## 历史背景

沙特尔蓝（bleu de Chartres）最早出现在 1140 年代圣但尼圣殿（Saint-Denis）的工坊中。修道院长叙热（Abbot Suger）相信"色彩即光，因而属于神圣"。从圣但尼传播到勒芒、旺多姆，最终抵达沙特尔。

著名的"美丽的玻璃圣母"（Notre-Dame de la Belle-Verrière）约制作于 1180 年，在 1194 年那场摧毁了大部分早期建筑的大火中幸存。只有中央的圣母圣子面板和三扇西立面柳叶窗得以保存。

12 世纪圣母崇拜的兴起是蓝色推广的核心动力。沙特尔保存着 *Sancta Camisia*——据说是圣母在天使报喜时所穿的圣衣。正如历史学家 Michel Pastoureau 所言，圣母成了"蓝色推广的首要代理人"。

**失传的配方**：沙特尔特蓝的确切配方据信已经失传。这种颜色是通过将氧化钴作为着色剂，配合苏打基助熔剂在窑炉中的特定还原条件下实现的（Hunault et al., 2016, *Journal of the American Ceramic Society*）。

## 视觉特征

- **色调**：深沉、发光、略带紫调的钴蓝——不是纯净的原蓝色，而是带有微妙紫/靛蓝底色的蓝
- **范围**：彩窗玻璃实际上涵盖了一系列蓝色，从非常淡的、通透的蓝（用于 Belle Verrière 中圣母的袍服，因气泡而变亮），到背景中使用的浓烈深蓝宝石色
- **"蓝色推进"效果**：艺术史学家 Louis Grodecki 观察到蓝色玻璃似乎会辐射到其物理边界之外，创造出深度幻觉，使蓝色看起来"置于"其他颜色之后
- **玻璃厚度**：中世纪玻璃相当厚（2-2.5 cm），不规则，含有微小的气泡和杂质，散射光线产生水晶般宝石般的闪烁

## 核心色值

> **重要**：沙特尔蓝没有官方标准化的十六进制色码。它不是现代色彩体系中的注册颜色。以下值基于历史描述推导，适用于 UI 主题设计。

### 主色系（蓝）

| 角色 | Hex | RGB | 说明 |
|---|---|---|---|
| **Primary/Anchor** | `#2E4C9B` | rgb(46, 76, 155) | 深紫调钴蓝 — 标志性沙特尔蓝核心 |
| **Luminous Tint** | `#6B8FD4` | rgb(107, 143, 212) | 淡色发光蓝 — 圣母袍服在 Belle Verrière 中的颜色 |
| **Soft Tint** | `#A8C4E8` | rgb(168, 196, 232) | 柔和的浅蓝带紫调底色 |
| **Pale Whisper** | `#D4E2F5` | rgb(212, 226, 245) | 极淡的蓝色低语 |
| **Deep Sapphire** | `#1A2D5E` | rgb(26, 45, 94) | 深夜蓝宝石色 |
| **Night Shadow** | `#0F1B3B` | rgb(15, 27, 59) | 极深近乎海军蓝 |
| **Bright Cobalt** | `#0047AB` | rgb(0, 71, 171) | 明亮钴蓝参考 |

### 辅色系（彩窗同伴色）

| 角色 | Hex | RGB | 来源 |
|---|---|---|---|
| **Ruby Red** | `#9B1B30` | rgb(155, 27, 48) | 氧化铜制的红宝石色（Belle Verrière 背景） |
| **Ruby Red Bright** | `#C7364A` | rgb(199, 54, 74) | 红宝石高亮变体 |
| **Medieval Green** | `#2D6B4F` | rgb(45, 107, 79) | 氧化铁制的中世纪绿 |
| **Medieval Green Bright** | `#3D8B63` | rgb(61, 139, 99) | 中世纪绿亮变体 |
| **Gold/Yellow** | `#C9A84C` | rgb(201, 168, 76) | 银染工艺的金色 |
| **Warm Gold** | `#B8862D` | rgb(184, 134, 45) | 暖调深金 |
| **Parchment White** | `#F5F0E8` | rgb(245, 240, 232) | 羊皮纸暖白（浅色主题背景） |
| **Stone Gray** | `#8B8589` | rgb(139, 133, 137) | 大教堂石灰岩灰 |
| **Medieval Purple** | `#6B5B8A` | rgb(107, 91, 138) | 中世纪紫（终端 ANSI magenta） |
| **Medieval Cyan** | `#3B7A9E` | rgb(59, 122, 158) | 中世纪青（终端 ANSI cyan） |

## 设计应用原则

### 主题中的色彩态度

蓝**不**作为大面积背景色使用。它始终是 UI 中的**强调色、焦点**——如同彩窗在暗色石墙中发光。这一原则来自大教堂本体：发光的窗户嵌在厚重的石灰岩墙体中，而非一个涂满蓝色的房间。

### 深色主题（黄昏大教堂）

- 编辑器背景 `#111622`：深蓝灰石材
- 侧边栏 `#0F141E`：稍深的阴影
- 活动栏 `#0B0F15`：最深的暗处
- 前景文字 `#D6E2F0`：月光照石的冷白
- 沙特尔蓝 `#2E4C9B`：用于选中、焦点、徽章、按钮
- 亮蓝 `#6B8FD4`：光标、括号高亮——"彩窗发光"
- 金色 `#C9A84C`：函数名——"烛光"
- 中世纪绿 `#2D6B4F`：字符串——铜绿古锈

### 浅色主题（清晨大教堂）

- 编辑器背景 `#F5F0E8`：温暖的羊皮纸
- 侧边栏 `#F0EBE0`：稍深的羊皮纸
- 活动栏 `#2E4C9B`：纯沙特尔蓝竖条——浅色主题最强色块
- 标题栏/状态栏 `#1A2D5E`：深蓝宝石色书挡
- 前景文字 `#1E293B`：暖调深灰
- 沙特尔蓝 `#2E4C9B`：关键字、链接、选中
- 金色 `#B8862D`：函数名——暖金
- 中世纪绿 `#2D6B4F`：字符串

## 参考文献

- **Wikipedia** — [Stained glass windows of Chartres Cathedral](https://en.wikipedia.org/?curid=63698590)
- **Chartres Cathedral** — [Some thoughts on Blue in the Middle Ages](https://www.cathedrale-chartres.org/en/mediasrc/some-thoughts-on-blue-in-the-middle-ages/) by Michel Pastoureau
- **Chartres Sanctuaire du Monde** — [Romanesque stained-glass windows](https://www.chartres-csm.org/en/the-cathedral/the-romanesque-cathedral/the-romanesque-stained-glass-windows/)
- **Hunault et al. (2016)** — Spectroscopic Investigation of the Coloration and Fabrication Conditions of Medieval Blue Glasses. *Journal of the American Ceramic Society*, Vol. 99, Issue 1
- **UNESCO** — [Chartres Cathedral World Heritage site](https://whc.unesco.org/en/list/81)
- **百度百科** — [沙特尔蓝](https://baike.baidu.com/item/%E6%B2%99%E7%89%B9%E5%B0%94%E8%93%9D/880991)
