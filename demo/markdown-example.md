# Chartres Blue ⛪ — 主题预览

> 灵感源自沙特尔大教堂的彩窗玻璃——深邃的**钴蓝色**，跨越八个世纪的传奇。

---

## 📖 目录

- [色彩体系](#色彩体系)
- [代码展示](#代码展示)
- [表格与数据](#表格与数据)
- [引用与脚注](#引用与脚注)

---

## 色彩体系

| 名称 | 色值 | 用途 |
|------|------|------|
| Chartres Blue | `#1A2A6C` | 主色调 / 关键词 |
| Rose Window | `#9B1B30` | 错误 / 警告 |
| Gold Leaf | `#C9A84C` | 警告 / 高亮 |
| Limestone | `#8E8B82` | 注释 / 次要文字 |
| Strategy Blue | `#6B8FD4` | 链接 / 函数名 |
| Forest Green | `#2D6B4F` | 字符串 |

### 色阶渐变

```text
深蓝      #111622  →  #1A2235  →  #1F2740  →  #2A3555  →  #3D5280     浅蓝
```

---

## 代码展示

### TypeScript 类型定义

```typescript
interface ThemeColors {
  /** Primary text color */
  foreground: string;
  /** Editor background */
  'editor.background': `#${string}`;
  /** Token colors for syntax highlighting */
  tokenColors: TokenColor[];
}

type ThemeType = 'dark' | 'light';
```

### Python 数据类

```python
@dataclass(slots=True)
class Pigment:
    name: str
    chemical_formula: str
    color_hex: str
    rarity: Literal["common", "rare", "legendary"]

    def is_medieval(self) -> bool:
        return self.name in {"cobalt oxide", "copper sulfate", "silver stain"}
```

### Shell 命令

```bash
# 构建 & 打包 VS Code 主题
npm run build
vsce package --out dist/

# 检查主题 JSON 格式
cat themes/chartres-blue-dark.json | jq '.tokenColors | length'
# Output: 128
```

---

## 表格与数据

### 中世纪彩窗颜料

| 颜料 | 化学式 | 颜色 | 来源 | 稀有度 |
|------|--------|------|------|--------|
| Cobalt oxide | CoO | 🔵 蓝 | 中欧 | ⭐⭐⭐ |
| Copper oxide | Cu₂O | 🔴 红 | 本地 | ⭐⭐ |
| Silver stain | AgNO₃ | 🟡 金黄 | 东方 | ⭐⭐⭐ |
| Iron oxide | Fe₂O₃ | 🟤 棕 | 本地 | ⭐ |

---

## 引用与脚注

> 沙特尔蓝的奥秘在于其**钴含量**——中世纪工匠将钴氧化物与熔融玻璃混合，在超过 1200°C 的温度下烧制，产生了独一无二的深邃蓝色。[^1]

> "The most beautiful stained glass in the world."  
> — *Art historian Émile Mâle*, 1927

[^1]: Pastoureau, Michel. *Blue: The History of a Color*. Princeton University Press, 2001.

---

### ✅ 任务清单

- [x] 研究沙特尔蓝的历史色值
- [x] 设计 Dark 主题配色
- [x] 设计 Light 主题配色
- [ ] 添加 Workbench 颜色定制
- [ ] 发布到 VS Code Marketplace

---

### 💡 提示

> **Note:** 沙特尔蓝 (`#1A2A6C`) 是一种偏紫的深蓝，在 dark 主题中作为关键词强调色，在 light 主题中作为标题色使用。

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  © 2026 Chartres Blue Theme · MIT License
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
