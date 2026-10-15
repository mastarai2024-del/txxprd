# txxprd

按现有模板编写、更新和评审飞书 PRD 的 AI 技能包。支持功能说明表、飞书画板流程图、原型截图、验收标准，也支持根据评论修改正文，或只在文档中留下评审意见。

> 适用于 Codex、WorkBuddy、Claude 等支持 Skill 的 AI 助手。基于官方 [lark-cli](https://github.com/larksuite/cli) 的文档块与评论接口。

## 它能做什么

| 能力 | 说明 |
|---|---|
| 功能说明表 | 沿用现有模板；无模板时建议 5 列（序号 / 模块 / 功能 / 功能详细说明 / 交互图） |
| 产品流程图 | mermaid 一键转飞书**原生画板**（节点可编辑，不是图片） |
| 交互原型图 | HTML 原型渲染成 PNG 插入文档，支持表格单元格内嵌图 |
| 验收标准 | 按模块成节写入可测试的验收项 |
| 按评论修订 | 读取评论与回复，定位对应段落，局部修改并逐项核验 |
| 文档评审 | 在指定块留意见，保留正文；仅要求给建议时在当前对话反馈 |
| 权限诊断 | 区分账号、应用、登录、API 授权及资源访问权，按任务申请最小权限 |
| 写入验证 | 写前留存旧值；复杂新写法先测试；写后回读，图表另做视觉检查 |

## 安装

```bash
# Codex：安装到尚不存在的技能目录
git clone https://github.com/mastarai2024-del/txxprd.git ~/.codex/skills/txxprd

# WorkBuddy：选择对应环境执行
git clone https://github.com/mastarai2024-del/txxprd.git ~/.workbuddy/skills/txxprd
# 项目级安装：放到 <项目>/.workbuddy/skills/txxprd
```

## 使用

直接对助手说：

- 「把这段规则写进 PRD 的功能说明里」
- 「产品流程图更新到文档的画板里」
- 「换一版交互原型图，同步更新文档里的图」
- 「按我在这份 PRD 的评论修改正文，先保留评论状态」
- 「审阅这份 PRD，在有问题的段落留评论，不改正文」

提供真实文档链接及具体任务。技能按请求选择正文编辑或评论评审流程；已有明确授权的普通操作连续执行，缺少必要信息或遇到真实权限阻塞时说明原因。

## 环境自举（新电脑，无需预装飞书套件）

技能随附基于飞书套件 v2.3.0 的参考与自举脚本（`vendor/lark-unified/`），已补充部分新版本兼容说明：

```bash
# 1. 在技能目录检查（exit 0=配置存在 / 3=未安装 / 4=未配置 / 5=输出异常）
python3 vendor/lark-unified/scripts/lark_status.py --json

# 2. 未安装则安装（需 Node 18+，约几分钟）
npx -y @larksuite/cli@latest install

# 3. 按 references/auth-and-diagnostics.md 核对身份并按需授权
```

配置成功不等于用户已登录或目标文档可编辑。CLI 1.0.97 的裸 `auth login` 会请求所有已知业务域权限；本技能使用明确的最小 `--scope` 和分回合授权流程，不要求为编辑正文申请整份文档删除权限。凭证由 CLI 在本机管理，不写入技能文件或仓库。

## 首次配置

1. 对话中给出目标文档链接；以本次指定的目标为准，无需修改全局技能来绑定某一份 PRD。
2. 将 `references/project-context.md` 复制到项目的私有目录，维护术语、模板及本地资产。真实文档内容、评论快照、身份信息和回执留在本机，不提交公开仓库。

## 目录结构

```
txxprd/
├── SKILL.md                     # 工作方式 / 正文流程 / 验证口径
├── references/
│   ├── auth-and-diagnostics.md  # 身份、最小权限及错误分流
│   ├── document-review.md       # 按评论修订与文档评审
│   ├── feishu-docx-cli.md       # lark-cli 文档操作技术手册（命令表 / DocxXML 语法 / 排错）
│   └── project-context.md       # 项目上下文模板
├── scripts/
│   └── render-html.cjs          # HTML 原型 → PNG 渲染（puppeteer-core）
└── vendor/
    └── lark-unified/            # 飞书套件参考及自举脚本
```

## 技术要点（踩过的坑，都写在技能里了）

- 上传图片必须用 `<img path="@./本地图"/>`；用 `src=token` 复制会把元数据写脏
- 整表重建用 `block_replace` + colgroup，写后检查高亮、列宽与媒体是否保留
- 画板预览按工具要求导出为 jpg；结构修改后重新 fetch 再使用 block id
- 新的复杂写法先在获准的测试文档验证；普通文字修订做针对性回读
- 评论按真实 block 定位；任意文字范围的精准划词与 Markdown 格式无损转换需另行验证
- `render-html.cjs` 依赖 `puppeteer-core` 和 macOS Google Chrome，其他环境需适配浏览器路径

## 验证范围

文档命令已对照 CLI 1.0.97 的帮助及随附官方参考。安装检查、命令预览与离线校验均不能证明真实文档的写入权限；每份目标文档仍需实际读取、写后回读及必要的视觉检查。

## 致谢 / 说明

- 飞书 CLI：[larksuite/cli](https://github.com/larksuite/cli)（MIT）
- `vendor/lark-unified`：来源于 WorkBuddy 技能市场「飞书套件」v2.3.0，本仓库对其登录默认行为与配置状态判断做了文档兼容修订；如权利人希望调整，欢迎提 Issue
