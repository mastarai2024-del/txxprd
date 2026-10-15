# txxprd

**把 PRD 写进飞书文档的 AI 技能包** —— 按 PRD 模板结构定位章节，把产品需求内容直接写进飞书文档：功能说明表、飞书画板流程图、交互原型图、验收标准，全流程自动化且可复核。

> 适用于 WorkBuddy / Claude 类支持 Skill 的 AI 助手。基于官方 [lark-cli](https://github.com/larksuite/cli) 的文档块级操作实现。

## 它能做什么

| 能力 | 说明 |
|---|---|
| 功能说明表 | 按 5 列格式（序号 / 模块 / 功能 / 功能详细说明 / 交互图）增改功能行，嵌套编号列表 |
| 产品流程图 | mermaid 一键转飞书**原生画板**（节点可编辑，不是图片） |
| 交互原型图 | HTML 原型渲染成 PNG 插入文档，支持表格单元格内嵌图 |
| 验收标准 | 按模块成节写入可测试的验收项 |
| 安全写入 | 先读现状 → 临时文档验证 → 应用 → fetch 复核；不覆盖人工编辑 |

## 安装

```bash
git clone https://github.com/mastarai2024-del/txxprd.git ~/.workbuddy/skills/txxprd
# 项目级安装：放到 <项目>/.workbuddy/skills/txxprd
```

## 使用

直接对助手说：

- 「把这段规则写进 PRD 的功能说明里」
- 「产品流程图更新到文档的画板里」
- 「换一版交互原型图，同步更新文档里的图」

技能会自动执行：读文档现状 → 构造内容 → 临时文档验证 → 写入 → 复核。

## 环境自举（新电脑，无需预装飞书套件）

技能自带飞书 CLI 套件完整副本（`vendor/lark-unified/`）：

```bash
# 1. 检查状态（exit 0=可用 / 3=未安装 / 4=未配置）
python3 vendor/lark-unified/scripts/lark_status.py --json

# 2. 未安装则安装（需 Node 18+，约几分钟）
npx -y @larksuite/cli@latest install

# 3. 配置与授权：按技能内指引走 device-flow（在本机浏览器完成授权）
```

所有凭证只保存在本机（系统钥匙串），仓库内不含任何凭证。

## 首次配置

1. 编辑 `SKILL.md` 的「目标文档」一节，填入你的 PRD 文档链接与 docx token
2. 在 `references/project-context.md` 里维护项目口径（术语、格式约定、本地资产）

## 目录结构

```
txxprd/
├── SKILL.md                     # 技能主文件：工作流 / 内容规范 / 关键坑
├── references/
│   ├── feishu-docx-cli.md       # lark-cli 文档操作技术手册（命令表 / DocxXML 语法 / 排错）
│   └── project-context.md       # 项目上下文模板
├── scripts/
│   └── render-html.cjs          # HTML 原型 → PNG 渲染（puppeteer-core）
└── vendor/
    └── lark-unified/            # 飞书 CLI 套件完整副本（自举 + 全套命令参考）
```

## 技术要点（踩过的坑，都写在技能里了）

- 上传图片必须用 `<img path="@./本地图"/>`；用 `src=token` 复制会把元数据写脏
- 整表重建用 `block_replace` + colgroup，可完整保留高亮与列宽
- 画板导出预览是 jpg；block id 在写操作后会失效，链式编辑前要重新 fetch
- 所有改动先在临时文档验证，再动正式文档

## 致谢 / 说明

- 飞书 CLI：[larksuite/cli](https://github.com/larksuite/cli)（MIT）
- `vendor/lark-unified`：WorkBuddy 技能市场「飞书套件」v2.3.0 的完整副本，用于在新机器上自举；如权利人希望调整，欢迎提 Issue
