# Chartres Blue Theme

Chartres Blue Theme 是一个 VS Code 主题扩展，包含以下两套主题：

- **Chartres Blue Dark**（深色）
- **Chartres Blue Light**（浅色）

灵感来自沙特尔大教堂（Chartres Cathedral）彩绘玻璃的标志性蓝色。

## 安装引导

> 当前版本暂未发布到 VS Code Marketplace，请使用 VSIX 离线安装。

### 方式：离线安装 VSIX（二进制包）

仓库已包含可直接安装的 VSIX 文件（位于 `release/` 目录）：

- `release/chartres-blue-theme-vscode-0.4.0.vsix`

安装步骤：

1. 打开 VS Code。
2. 打开命令面板（`Ctrl/Cmd + Shift + P`）。
3. 执行 `Extensions: Install from VSIX...`。
4. 选择 `release/chartres-blue-theme-vscode-0.4.0.vsix` 完成安装。

也可使用命令行：

```bash
code --install-extension release/chartres-blue-theme-vscode-0.4.0.vsix
```

安装后通过 `Preferences: Color Theme` 选择：

- `Chartres Blue Dark`
- `Chartres Blue Light`

## 开发与本地预览

1. 克隆仓库后在 VS Code 中打开。
2. 按 `F5` 启动 Extension Development Host。
3. 在新窗口中切换主题进行预览。

## 项目结构

- `themes/`：主题定义文件
- `release/`：已打包的 VSIX 文件
- `demo/`：用于展示主题效果的示例文件
- `docs/`：设计与研究文档

## 许可证

MIT
