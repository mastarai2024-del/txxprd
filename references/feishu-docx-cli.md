# lark-cli 飞书文档操作技术手册

## 环境

- 命令：`lark-cli`；用户文档操作显式 `--as user`。身份、profile 和权限检查见 [身份、授权与诊断](auth-and-diagnostics.md)。
- 建议前缀：`export LARKSUITE_CLI_NO_UPDATE_NOTIFIER=1 LARKSUITE_CLI_NO_SKILLS_NOTIFIER=1`
- 成功判定：结合退出码及当前命令的结构化返回；不能把所有命令都套成 `result == "success"`，也不能只看 HTTP 状态或单个 `code`。写入完成仍需回读验证。
- 输出统一 `--format json`，可用 `-q/--jq` 过滤
- 新电脑、CLI 未配置或登录异常：按诊断手册处理（自举脚本在 `../vendor/lark-unified/scripts/`）。命令、参数及权限先查本机 `--help`；官方参考用 `lark-cli skills read` 读取。

## 常用命令

除标明 `lark-cli` 的完整命令外，下表省略此前缀。所有业务命令补上 `--as user`；多应用任务还需在 `lark-cli` 后加已确认的 `--profile '<profile>'`。多行内容优先保存文件再传 `@file`。

| 目的 | 命令 |
|---|---|
| 解析 wiki 链接 | `lark-cli wiki +node-get --as user --node-token "<url>"` → 取 `data.node.obj_token` |
| 读大纲（含 block id） | `docs +fetch --doc <id> --scope outline --detail with-ids` |
| 读指定章节 | `docs +fetch --doc <id> --scope section --start-block-id <id> --detail with-ids` |
| 读区间（定章节尾部锚点） | `docs +fetch --doc <id> --scope range --start-block-id <起> --end-block-id <止> --detail with-ids` |
| 读整篇（markdown） | `docs +fetch --doc <id> --doc-format markdown` |
| 单处文本替换 | `docs +update --doc <id> --command str_replace --pattern '<唯一原文>' --content '<新文本>'` |
| 插入块 | `docs +update --doc <id> --command block_insert_after --block-id <锚> --content @x.xml` |
| 整块替换 | `docs +update --doc <id> --command block_replace --block-id <id> --content @x.xml` |
| 删除块 | `docs +update --doc <id> --command block_delete --block-id "id1,id2,id3"` |
| 移动块 | `docs +update --doc <id> --command block_move_after --block-id <锚> --src-block-ids <源>` |
| 文末追加（md） | `docs +update --doc <id> --command append --doc-format markdown --content @x.md` |
| 插入图片（到文末） | `docs +media-insert --doc <id> --file ./x.png --align center --width 900` |
| 换图（含表格单元格内的图片） | `docs +update --doc <id> --command block_replace --block-id <img块id> --content '<img path="@./新图.png" width="N"/>'` |
| 导出画板预览 | `whiteboard +export --whiteboard-token <wbcn…> --output-type preview --output ./x.jpg` |
| 新建临时文档 | `docs +create --content '<title>临时测试-请忽略</title>'` |
| 删除本次临时文档（已有明确删除授权时） | `drive +delete --file-token <docx_token> --type docx --yes` |
| 官方语法指南 | `lark-cli skills read lark-doc/references/lark-doc-xml.md`（写复杂内容前必读） |

评论读取、定位、发表与验证见 [评论协作](document-review.md)。`str_replace` 仅用于已确认唯一的简单文本；多块或媒体内容用块编辑。范围操作前检查起止边界，避免包含下一章节。预览请求可加 `--dry-run`，不据此声称服务端已写入。

## DocxXML 语法要点

- 块级标签：`<p> <h1-h9> <blockquote> <hr> <img> <table> <ol>/<ul> <callout> <grid> <whiteboard> <checkbox> <pre>`
- 文本转义：`<`→`&lt;`、`>`→`&gt;`、`&`→`&amp;`；换行用 `<br/>`；属性必须带引号
- **表格**：`<table><colgroup><col width="100"/></colgroup><thead><tr><th><p>…</p></th></tr></thead><tbody><tr><td><p>…</p></td></tr></tbody></table>`
  - 单元格内容放在 `<p>` 等子块里；表头背景 `background-color="rgb(242,243,245)"`（原样回写即可保留）
  - 重建整表用 `block_replace`，把完整 `<table>…</table>` 作为 content
- **嵌套编号列表**：子列表放 `<li>` 内——`<ol><li>父<ol><li>子<ol><li>孙</li></ol></li></ol></li></ol>`（seq 自动生成，不用手写）
- **本地图片**：`<img path="@./x.png" width="160"/>`（写入时自动上传；支持放在表格单元格内）
- **画板**：`<whiteboard type="mermaid" path="@./flow.mmd"></whiteboard>`（mermaid 转原生画板；`classDef` 颜色生效；也可 `type="svg"` / `type="blank"`）
- 文本高亮保留：`<span background-color="rgba(255,246,122,0.8)" text-color="rgb(216,57,49)">…</span>` 可原样回写

## 排错

| 现象 | 处理 |
|---|---|
| 图片 name 变成 test.jpg / mime 变 jpeg | 用了 `src=token` 复制——删掉该块，改用 `path=@本地文件` 重插 |
| 报 `unsafe file path` | 绝对路径被拒——用 cwd 相对路径（`@./x.png`），或先 `cd` 到文件所在目录 |
| block id 失效 | 结构修改后重新 `fetch --detail with-ids` 取最新 id |
| 权限或登录错误 | 按 [身份、授权与诊断](auth-and-diagnostics.md) 区分身份、认证、scope 和资源权限 |
| 画板导出扩展名报错 | 预览是 jpg——`--output ./x.jpg` |
| 图片在单元格里太大 | `<img … width="160"/>` 控制显示宽（列宽约 180 时用 160） |

## 每个目标文档的验证链路

1. `docs +fetch --scope outline --detail with-ids` 定位锚点，再读受影响章节，保存旧内容和必要样式。
2. 新的复杂写法先在获准的测试文档验证，再用 `docs +update --command block_insert_after --content @x.xml` 等命令应用；具体参数补全目标文档和块 ID。
3. 图片定位可用 `docs +media-insert` + `block_move_after`，每次结构变化后重新读取锚点。
4. `docs +fetch` 复核内容与结构；画板用 `whiteboard +export` 检查预览，图片检查实际显示；Markdown 转换检查格式与媒体是否保留。
5. 分别报告已通过与未验证项；保留交付源文件，仅清理已获授权的临时资源。
