# Changelog

## 0.6.2

- 深色主题：资源管理器中「新增」（已暂存）文件与文件夹的绿色，由中世纪绿亮 `#3D8B63` 改为薄荷玉 `#7FC8A0`
  - 原色在钴蓝侧栏底 `#152646` 上只有 3.63:1；选中行（`#4070D033` 叠底后为 `#1E3562`）与悬停行更低至 2.91:1 / 2.96:1，低于 3:1 下限，发闷，选中时糊成一片
  - 薄荷玉在普通行 / 选中行 / 悬停行分别为 7.64:1 / 6.13:1 / 6.22:1，三种状态全部过关；色相偏青，与钴蓝同源、与哑光金互补，归入沙特尔彩窗的玻璃色系
  - 评审方式：在扩展开发宿主里并排试了 5 个备选（A 翠玻璃 `#4E9E70`、B 铜绿 `#56A88E`、C 玉 `#63B58C`、D 薄荷玉 `#7FC8A0`、E 瓷青 `#6FC7D6`），选定 D
  - 只动 `gitDecoration.addedResourceForeground` 一键；编辑器字符串绿 `#2D6B4F` 与终端 ANSI green 保持不变（语法色继续安静），浅色主题的 `#1A804C` 不动

## 0.6.1

- 修复新版 VS Code 的 Modern UI 下标签栏退化为纯白（`#F3F3F3`）/ 纯黑（`#252526`）的问题：标签栏条带与未激活标签一度完全丢失主题色调
  - 根因是 Modern UI 的标签栏改读另一套颜色键，主题此前只定义了旧版 `tab.*`，新键缺省回退到 VS Code 内置默认色
  - 补上 `editorGroupHeader.tabsBackground` / `connectedTabsBackground` / `tabsBorder`，条带底色与未激活标签连成一片：深色 `#0D1836`、浅色 `#F0EBE0`，激活标签（`#1A2C4E` / `#F5F0E8`）从中浮起
  - 补上 `modernTab.*` 与 `modernEditorTab.*` 色键，此前激活标签与悬停标签只能取 `list.*` 的默认值（浅色悬停曾是一片偏艳的 `#A8C4E8`）
  - 旧版 UI 下的 `tab.*` 全部保留，两种 UI 观感一致
- 浅色主题的"抬升面"由纯白改为暖象牙 `#FBF7EF`：Modern UI 的菜单/下拉/快速输入是「底色 × 80% 不透明度 + 12px 模糊」的毛玻璃（`workbench.modernUIFrostedGlassOpacity` 默认 80），纯白 `#FFFFFF` 压在奶油色标题栏（`#F0EBE0`）上会合成出无彩的惨白 `#FCFBF9`，既不是干净的白、也丢了主题的奶油基调
  - 与深色主题的模型对齐：`input.*` / `dropdown.*` / `menu.*` / `quickInput.*` 共用同一个抬升面色调（深色为 `#152646`），此前浅色下只有 `input.background` 还是纯白，破了这个一致性
  - 涉及 `input.background`、`dropdown.background`、`dropdown.listBackground`、`menu.background`、`quickInput.background`
  - 该色值是按两条渲染路径同时定的：经典 UI 下不透明呈现 (251,247,239)，Modern UI 玻璃合成后 (249,245,236)——两侧都是同一档暖象牙，不依赖任何未修复的行为
- 浅色主题：修复 Modern UI 下浮动卡片的分割线不在主题色系内的问题
  - 补上 `surface.border`、`editor.border`、`modernPanel.border` 为 `#E0DACF`。这三个键此前未定义，注册默认值是 `foreground` 15% 的冷灰，而 Modern UI 下浮动卡片的描边正走它们；只改 `sideBar.border` / `panel.border` 不会生效
  - 补上失焦层次：`titleBar.inactiveBackground` 由与 active 同值改为 `#EAE4D7`。该键在 Modern UI 下驱动整个工作台外壳，改后窗口失焦会明显下沉一档
- 浅色主题：把活动栏与列表的"选中 / 悬停"配色对调，让蓝色落在持久状态上
  - 此前是反的：悬停是看得见的 `#A8C4E8`，而"已选中"只有 10% 钴蓝几乎不可见——蓝色只在鼠标扫过时闪一下，选中的东西停下来就不蓝了
  - 活动栏选中底改为 `#A8C4E8`：Modern UI 走 `modernActivityBarItem.activeBackground`，经典 UI 走 `activityBar.activeBackground`，两者都显式定义，以免再被 `modernTab.*` 的默认链牵着走（`activityBar.hoverBackground` 在 VS Code 里并未注册，是死键，未采用；经典 UI 的悬停本就由 `toolbar.hoverBackground` 驱动，其值正是 `#2E4C9B1A`）
  - 列表选中底用浅一档的 `#D4E2F5` 而非同一支 `#A8C4E8`：文件行上骑着 git 装饰字母，`#A8C4E8` 会把"新增"绿压到 2.77:1（低于 3:1），`#D4E2F5` 下最低仍有 3.78:1
  - `list.inactiveSelectionBackground` 与 `list.focusBackground` 同步改为 `#D4E2F5`：否则资源管理器一失焦、或改用键盘导航，蓝色就掉回灰调
  - `list.hoverBackground` **保持原值 `#A8C4E8`**：它并不只属于资源管理器——现代 VS Code 的下拉菜单/命令面板内部就是 `monaco-list`，菜单项的高亮走的正是 `.action-widget .monaco-list-row.action.focused { background-color: var(--vscode-list-hoverBackground) }`。把悬停改成灰调会让菜单一起失去蓝色。选中态那三个键则不在任何菜单规则里，可以安全地改
- 深色主题：活动栏选中项改用"发光"来标位置，而不是"色块"
  - **一条硬上限**：选中图标是浅色 `#D6E2F0`，必须比未选中的图标（`#6B7E9E`，4.00:1）更清楚，故色块亮度需 ≤ 0.128；而活动栏底色 `#0F1E3E` 亮度仅 0.0138 —— 于是**色块对底色的对比度上限只有 2.79:1**。试过的深紫块 `#6B5B8A` 实测 2.73:1，已经贴在天花板上，任何色相都突破不了，读起来必然像一块脏斑而不是点缀
  - 线条与图标不背这个上限（它们只需要跟底色比），所以把点缀移到"发光的边 + 发光的图标"：`activityBar.activeBorder`、`activityBar.foreground`、`modernActivityBarItem.activeForeground` 统一改用主题既有的发光蓝 `#80B0F0`（对底色 7.36:1，且与既有的 `activityBar.activeFocusBorder` 同色——选中态的一切归到一支颜色）
  - `modernActivityBarItem.activeBackground` 显式设为活动栏底色（等于不画块），顺带切断与 `modernTab.*` 的默认链耦合；同组 hover 两键显式钉住，值不变
  - 资源管理器的紫调一并撤销，三键回到 0.6.0（`#4070D033` / `#4070D026` / `#4070D040`）：那个选中底要"亮起来"会先压垮"新增"绿（已只剩 2.91:1），而单纯换色相不值得
  - 留档的教训：**在低对比的深色 chrome 上，"填色块"是受限工具**——要标位置，优先用线条与图标

## 0.6.0

- 换用新图标：蓝金玫瑰窗（源文件见 `docs/icon-proposals/08c-cobalt-gold.svg`）
- README 改为中英双语：英文在前，中文在后
- 深色主题配色调整：
  - 命令面板胶囊选中项由玻璃绿改为哑光金，不再与新增/成功语义的绿色混淆
  - 括号色 3 由红改为紫，不再与错误色撞色
  - 括号色 4 的绿对编辑器底对比度仅 2.20:1，提亮至 4.26:1
  - 面包屑由玻璃绿改为蓝紫，呼应沙特尔蓝基调
- 浅色主题配色调整：
  - 括号色 3 由宝石红改为沉紫，此前与错误色完全相同

## 0.5.1

- 旧 UI 兼容性修复：修复浅色主题在旧 UI 下标签栏被涂成蓝色的问题，标签栏恢复原版奶油色设计（激活标签奶油底 + 钴蓝激活顶线）

## 0.5.0

- Modern UI 兼容：标签栏深蓝 + 亮蓝激活标签、Command Center 浅蓝胶囊，适配新 UI 的透明标题栏/活动栏/状态栏
- 浅色主题文字配色：灰阶文字统一为微蓝暗灰，面包屑改沙特尔钴蓝，菜单 hover 与胶囊选中项区分
- 深色主题文字配色：活动栏 badge 宝石红、胶囊选中项玻璃绿、括号红提亮、面包屑/行号玻璃绿、子模块紫罗兰
- 补齐 Modern UI 相关颜色键（commandCenter.*、surface.* 验证、toolbar.*、widget.* 等）

## 0.4.1

- 更新 README，优化文档结构

## 0.4.0

- 深色主题：钴蓝色基础铺开，整个 UI chrome 呈现沙特尔蓝，不再是黑色块
- 浅色主题：色彩刷新，转向泥金手抄本宝石色调
- 扩展重命名为 `chartres-blue-theme-vscode`

## 0.3.0

- 首个 Marketplace 发布版本
- 包含 Chartres Blue Dark 和 Chartres Blue Light 两套主题
