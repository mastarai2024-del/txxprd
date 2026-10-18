# 设计系统与 MasterGo

用于给飞书 PRD 制作交互原型、截图和 HTML 附件。目标是先对齐项目现有的 MasterGo 设计规范和最终画板，再生成页面；不凭截图或记忆猜一套“差不多”的视觉。

## 每次设计前的硬门禁

开始写 HTML 或画图前，完成并记录以下检查。缺少其中任何一项时，先补齐或明确标注阻塞，不能直接开始设计。

| 检查 | 必须取得的证据 | 用途 |
|---|---|---|
| 项目设计规范 | MasterGo「设计规范」画板名称、节点 ID、导出预览 | 确认色板、字号、圆角、间距、字体和状态 |
| 最终版页面 | `After` / 最新版 V2 / 已确认的最终画板名称与节点 ID | 确认页面结构、组件形态和真实内容 |
| 同模块其他状态 | 至少一个相同模块的弹窗、表单、按钮或空状态 | 确认新增状态不是“另起一套” |
| 旧版识别 | 明确排除 `Before`、旧版页面和废弃画板 | 防止误用历史设计 |
| 组件样式 | 主按钮、次按钮、选中态、未选中态、输入框、卡片、圆角 | 复用已有视觉规则 |
| 字体可用性 | 规范字体与本机可用性 | 避免本地截图和设计稿字体不一致 |

检查结果写入项目私有任务目录的 `design-baseline.md`，至少包含：

```markdown
# Design baseline

- MasterGo file: <file name / URL>
- Design system: <画板名> / <node id>
- Final pages: <页面名> / <node id>
- Excluded: <Before / 旧版 / 废弃画板>
- Spacing: <N>
- Radius: <values>
- Type scale: <values>
- Colors: <roles and hex>
- Fonts: <CJK / Latin>
- Buttons: <primary / secondary / selected / disabled>
```

## MasterGo MCP 安装与连接

当项目使用 MasterGo 时，默认使用 MasterGo 桌面端内的本地 MCP daemon，加 `@mastergo/vibe-mcp` 客户端。

### 1. 前置条件

- 安装并登录 MasterGo 桌面端。
- 打开目标设计文件。
- 确认 MasterGo 内显示 MCP 已启动。
- 本机 Node.js 可用；命令由 `npx` 启动。

### 2. Codex 配置

在 `~/.codex/config.toml` 的 `[mcp_servers]` 下增加：

```toml
[mcp_servers.mastergo]
command = "npx"
args = ["-y", "@mastergo/vibe-mcp@1.0.31", "--url=http://localhost:30678"]
```

固定版本便于复现。升级前先查看 MCP 版本与工具参数变化；不要无确认地自动升级并继续批量写画布。

Codex 当前使用 `30678`；其他宿主（如 WorkBuddy）可能使用不同端口或由插件自动注入 MCP 配置。以宿主实际配置和 `lsof` 监听结果为准，不把端口号写死到业务代码。

### 3. 连接检查

```bash
# daemon 应监听本机端口
lsof -nP -iTCP:30678 -sTCP:LISTEN

# MCP 客户端可启动
npx -y @mastergo/vibe-mcp@1.0.31 --url=http://localhost:30678

# 在 Codex 中调用 get_version
```

`http://localhost:30678/` 直接访问返回 `Bad Request` 不代表 daemon 不可用；它是 MCP 协议端口，不是普通网页。以 `lsof`、MCP 工具调用和 MasterGo 内的 MCP 状态为准。

### 4. 工作目录

所有 MasterGo 工具调用都传入项目根目录的绝对路径作为 `projectDir`。不要使用桌面根目录或临时目录，避免 `.mastergo/` 缓存散落。

## 读取设计规范与最终画板

### 找页面与图层

优先用 MasterGo 原生搜索或页面树，而不是靠坐标猜：

1. 在页面列表找到模块，例如「此刻 - 巴布机器人的朋友圈」「意见反馈」。
2. 在图层列表搜索「设计规范」「After」「最新版」「最终」「V2」。
3. 选中目标画板，确认画板尺寸、名称和节点 ID。
4. 用 `get_selection_node` 读取结构和实际颜色、字号、圆角。
5. 用 `get_screenshot` 导出画板预览，和结构一起核对。

### 推荐调用顺序

```text
get_version
→ 搜索 / 选择画板
→ get_selection_node
→ get_screenshot
→ 记录 design-baseline.md
→ 再开始 HTML
```

读取阶段只做读取，不修改 MasterGo。`get_screenshot` 返回的路径可以复制到项目资产目录；不要依赖临时目录长期保存。

### 如何判断最终版

按以下优先级判断，不能只看页面名称：

1. 用户本轮明确指定的画板。
2. 画板名称含 `After`、`最新版`、`最终`、`V2`。
3. 同模块页面中组件最完整、状态最全、最近更新的画板。
4. 仍无法判断时，停止写入并向用户确认；不把 `Before` 或旧版当最终版。

## 从设计稿到 HTML 原型

### 正确做法

- 用真实画板导出图作为底图，保持页面结构、字体、圆角和状态一致。
- 新增弹窗、表单和反馈状态只扩展已有组件，不重新发明色板或按钮。
- 先锁定设计 token，再写 CSS 变量；页面中不散落近似色值。
- 用规范中的间距倍数（如 `N=8`）组织布局。
- 交互状态与真实业务状态一一对应，截图和 HTML 使用同一套 token。

### 常见错误

| 错误 | 后果 | 修正 |
|---|---|---|
| 只看一张截图就开始画 | 字体、圆角、按钮和同模块页面不一致 | 先读设计规范和至少一个同模块页面 |
| 把旧版背景当最终版 | 整页返工 | 明确记录 After / V2 节点，排除 Before |
| 自创棕色、紫色或渐变按钮 | 与现有设计系统冲突 | 使用规范主色和状态色 |
| 页面底与卡片同色 | 层级消失 | 按规范区分页面底、卡片、输入框 |
| 圆角和字号使用规范外数值 | 视觉不统一 | 收敛到规范列表；确需新值先确认 |
| 只改按钮颜色，不改选中态 | 页面仍像旧风格 | 同时检查主按钮、次按钮、选中、未选中、输入框 |
| 用截图代替 HTML 交互 | 无法验证状态切换 | 截图用于文档，HTML 用于交互验收 |
| HTML 改了但截图没重渲染 | 文档与附件版本错位 | 每次改 HTML 后重新渲染全部受影响截图 |
| 设计规范与页面实际值冲突，例如规范字号表没有 15px，但页面标题用了 15px | 无法判断应以规范还是页面为准 | 在 `design-baseline.md` 记录冲突并询问用户；不要静默自创折中值 |
| 只看了「此刻」一个 After 页面就推广到全站 | 其他模块仍使用不同组件规则 | 至少抽样设计规范、目标页面、同模块弹窗和表单 |

## 用 MasterGo MCP 生成或改稿

### 页面生成

- 页面级设计请求的第一个动作是 `design_page`，不要先问来源再绕过它调用组件工具。
- `design_page` 返回快照准备参数时，才调用 `get_component_info`；完成后带 `componentSnapshotsPrepared: true` 回到原 `design_page`。
- 最终页面用 `submit_page_to_canvas` 提交；一次只提交一个页面。
- 只有 `design_page` 已产出最终 HTML 后，才使用 `submit_page_to_canvas`。

### 修改已有画布

- 先 `get_selection_node` 读取节点快照，再 `agent_update_node`；只改用户指定属性，保留未修改的 style、class、子节点。
- 换图或修改 `<img src>` 用 `agent_replace_node`，不要用 `agent_update_node`。
- 本地 HTML 全量覆盖已有画布根节点时，才使用 `agent_sync_design`；必须由用户明确确认，并保证 HTML 唯一根节点的 `data-node-id` 与画布根节点一致。
- 不要为了“同步”而自动调用 `agent_sync_design`；新页面、页面交付和生成结果走 `design_page` → `submit_page_to_canvas`。

### 读取而不是改写

- 读取设计规范、最终画板、字体和变量时，使用 `get_selection_node`、`get_screenshot`、`get_fonts`、`get_variables`。
- 用户没有要求导出前端代码时，不调用 `get_frontend_code`。
- `get_selection_node` 报“没有选中图层”时，先在 MasterGo 桌面端选中目标画板，再重试；不要猜节点 ID。
- MCP 只连接当前 MasterGo 打开的文件。需要新文件时，先在桌面端新建并打开，再重新确认连接；不要在旧连接上假设已经切换文件。

## 本地渲染与验证

- HTML 截图前先确认 `puppeteer-core` 可解析。若项目未安装，显式设置 `NODE_PATH` 指向已有依赖目录，或安装到项目私有依赖。
- 8 个状态要逐张渲染，不能只渲染当前状态后复用旧截图。
- 大图内嵌 HTML 时优先用 JPEG 压缩底图，控制附件体积；保留 PNG 给需要透明背景的素材。
- 视觉检查使用本机截图；飞书网页端未能登录或有权限限制时，明确标注“未做网页端目检”，不要用本地截图冒充网页端验证。

## 设计规范核对表

写入飞书前逐项对照：

- 页面底色是否正确。
- 卡片背景、描边、圆角是否正确。
- 主按钮是否使用规范主色。
- 次按钮是否使用规范未选中背景。
- 选中胶囊是否黑底白字。
- 正文和辅助文字颜色是否符合字色规范。
- 字号是否来自规范字号表。
- 圆角是否来自规范圆角表。
- 间距是否按 8px 基准。
- 字体是否为规范字体，本地截图是否实际加载。
- 页面结构与最终版画板是否一致。
- 新增状态是否沿用同模块已有组件。

## 设计交付记录

每个原型任务保留：

- `design-baseline.md`
- MasterGo 设计规范截图
- 最终版页面截图
- 本地 HTML
- 渲染截图
- 设计核对表结果

设计稿、HTML 和飞书文档的图片版本必须一一对应；任何一处变更都要重新渲染和替换。
