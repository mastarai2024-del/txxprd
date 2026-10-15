---
name: txxprd
description: 编写/更新飞书 PRD（产品需求文档）的工作流：按 PRD 模板结构定位章节、往功能说明表增改功能行、插入或更新产品流程图（飞书画板）、插入交互原型图与规则表格。当用户要求"写进 PRD / 需求文档 / 飞书文档"、"更新文档里的流程图/原型图/功能说明"、"把 XX 加到功能说明里"时使用。
agent_created: true
---

# txxprd — PRD 飞书文档写入

把产品需求内容按规范写入/更新飞书 PRD 文档（基于 lark-cli 的 docx 块级操作）。

## 目标文档

- 把本节替换为你的 PRD 文档信息（技能工作时以此为准）：
  - URL：`https://<你的租户>.feishu.cn/wiki/<node_token>`
  - docx token：`<obj_token>`（解析：`lark-cli wiki +node-get --as user --node-token "<url>"`）
- 权限报错（131006 / 3380004）说明当前账号无此文档权限——换文档或加权限，不要反复重试。

## 环境自举（新电脑 / 未装飞书套件时）

本技能自带飞书 CLI 套件**完整副本**（`vendor/lark-unified/`，飞书套件 v2.3.0），无需另装飞书套件。新电脑首次使用按此顺序：

1. **检查状态**：`python3 vendor/lark-unified/scripts/lark_status.py --json`
   - exit 0 = 可用；exit 3 = CLI 未安装；exit 4 = 未配置；exit 5 = 输出异常（手动看 `lark-cli config show`）
2. **安装 CLI**（exit 3 时）：`npx -y @larksuite/cli@latest install`（需 Node 18+，安装需数分钟）
3. **配置与授权**（exit 4 时）：按 `vendor/lark-unified/SKILL.md` 第 2 节的 split 流程，关键点：
   - 应用注册：`python3 vendor/lark-unified/scripts/lark_setup.py --print-url-only` → 授权链接发给用户 → **结束回合**等用户确认 → 再执行 `--device-code <code>`
   - 用户登录：`lark-cli auth login --scope "wiki:node:read wiki:node:retrieve docx:document:readonly docx:document:write_only docs:document.media:upload space:document:delete" --no-wait --json` → 链接发给用户 → 确认后 `lark-cli auth login --device-code <code>`
   - ⚠️ 授权链接必须作为该回合的**最后一条消息**发给用户，不要同回合轮询/阻塞
4. **验证**：`lark-cli whoami`，再直接 fetch 目标 PRD 文档确认权限
5. 完整命令、权限范围与排错：`vendor/lark-unified/SKILL.md` 及 `vendor/lark-unified/references/`（lark-doc / lark-wiki / lark-drive / api_reference 等）

## 核心工作流（每次改动按此执行）

1. **先读现状**：`docs +fetch --scope outline --detail with-ids` 拿章节 block id；再读目标章节 `--scope section --start-block-id <id> --detail with-ids`。
   要插到某小节末尾时，用 `--scope range --start-block-id <本节标题> --end-block-id <下一节标题> --detail with-ids` 取该节最后一个块的 id 作锚点。
   ⚠️ 用户可能已手动编辑过内容，以最新读取为准，不要覆盖用户编辑。
2. **构造内容**：XML（默认，精确控制）或 markdown（纯文本追加）；语法见 `references/feishu-docx-cli.md`；复杂内容先读官方指南 `lark-cli skills read lark-doc/references/lark-doc-xml.md`。
3. **临时文档验证**：新写法（整表重建、画板、图片入格等）先在临时文档验证——
   `docs +create`（标题写「临时测试-请忽略」）→ 插入 → fetch 复核（画板用 `whiteboard +export` 导出预览检查）→ 通过后才改正式文档 → `drive +delete --yes` 删临时文档。
4. **应用**：`block_insert_after`（插入）/ `block_replace`（整块替换）/ `block_delete`（删除，多 id 逗号分隔）/ `block_move_after`（移动定位）。
5. **验证**：改完 `fetch` 复核结构、文字与图片 token。
6. **清理**：临时文件、临时文档、预览图。

## 内容规范

- **功能说明表**：5 列（序号 / 模块 / 功能 / 功能详细说明 / 交互图）；「功能详细说明」用嵌套编号列表（1. / a. / i.）；「交互图」列放图片缩略图（宽 160px，入格方式见技术手册）。
- **产品流程图**：用**飞书画板**（`<whiteboard type="mermaid">`）；建议把 mermaid 源文件保存在项目里（如 `build/flow.mmd`），改流程后重新插入画板。
- **交互原型图**：把 HTML 原型渲染成 PNG（脚本 `scripts/render-html.cjs`）再插入。
- **项目口径**（术语 / 文案 / 本地资产）：在 `references/project-context.md` 中维护。

## 关键坑（踩过的）

- 上传本地图片必须用 `<img path="@./相对路径"/>`；**不要用 `src=token` 复制已有图片**（元数据会写成 test.jpg / jpeg）。
- `media-insert` 只能追加到文末；要放到指定位置：先 `media-insert`，再 `block_move_after` 移到锚点后。
- 本地文件路径一律 cwd 相对；任何写操作后受影响 block id 失效，链式编辑前重新 fetch。
- 画板导出预览是 **jpg**（`--output ./x.jpg`，扩展名不匹配会报错）。
- 所有命令建议带 `LARKSUITE_CLI_NO_UPDATE_NOTIFIER=1 LARKSUITE_CLI_NO_SKILLS_NOTIFIER=1`，并显式 `--as user`。

## 资源

- `references/feishu-docx-cli.md` — lark-cli 文档操作技术手册（命令表 / XML 语法 / 排错）
- `references/project-context.md` — 项目上下文模板（文档信息 / 口径 / 本地资产）
- `scripts/render-html.cjs` — HTML 原型 → PNG 渲染脚本（puppeteer-core）
- `vendor/lark-unified/` — 飞书 CLI 套件完整副本（v2.3.0：SKILL.md + references + scripts + meegle 子技能），供新电脑自举与全套命令参考
