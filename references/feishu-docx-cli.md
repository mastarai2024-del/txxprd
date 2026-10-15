# lark-cli 飞书文档操作技术手册

## 环境

- 命令：`lark-cli`；写用户文档一律 `--as user`（用 `lark-cli whoami` 确认当前身份）
- 建议前缀：`export LARKSUITE_CLI_NO_UPDATE_NOTIFIER=1 LARKSUITE_CLI_NO_SKILLS_NOTIFIER=1`
- 成功判定：`ok == true` 且 `result == "success"`（**不要**看 `code`）
- 输出统一 `--format json`，可用 `-q/--jq` 过滤
- 新电脑 / CLI 未安装未配置：按 SKILL.md「环境自举」流程处理（脚本在 `../vendor/lark-unified/scripts/`）

## 常用命令

| 目的 | 命令 |
|---|---|
| 解析 wiki 链接 | `lark-cli wiki +node-get --as user --node-token "<url>"` → 取 `data.node.obj_token` |
| 读大纲（含 block id） | `docs +fetch --doc <id> --scope outline --detail with-ids` |
| 读指定章节 | `docs +fetch --doc <id> --scope section --start-block-id <id> --detail with-ids` |
| 读区间（定章节尾部锚点） | `docs +fetch --doc <id> --scope range --start-block-id <起> --end-block-id <止> --detail with-ids` |
| 读整篇（markdown） | `docs +fetch --doc <id> --doc-format markdown` |
| 插入块 | `docs +update --doc <id> --command block_insert_after --block-id <锚> --content @x.xml` |
| 整块替换 | `docs +update --doc <id> --command block_replace --block-id <id> --content @x.xml` |
| 删除块 | `docs +update --doc <id> --command block_delete --block-id "id1,id2,id3"` |
| 移动块 | `docs +update --doc <id> --command block_move_after --block-id <锚> --src-block-ids <源>` |
| 文末追加（md） | `docs +update --doc <id> --command append --doc-format markdown --content @x.md` |
| 插入图片（到文末） | `docs +media-insert --doc <id> --file ./x.png --align center --width 900` |
| 换图（含表格单元格内的图片） | `docs +update --doc <id> --command block_replace --block-id <img块id> --content '<img path="@./新图.png" width="N"/>'` |
| 导出画板预览 | `whiteboard +export --whiteboard-token <wbcn…> --output-type preview --output ./x.jpg` |
| 新建临时文档 | `docs +create --content '<title>临时测试-请忽略</title>'` |
| 删除文档 | `drive +delete --file-token <docx_token> --type docx --yes` |
| 官方语法指南 | `lark-cli skills read lark-doc/references/lark-doc-xml.md`（写复杂内容前必读） |

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
| block id 失效 | 任何写操作后重新 `fetch --detail with-ids` 取最新 id |
| 131006 / 3380004 | 当前账号无该文档权限——换文档或让文档方加权限，不要重试 |
| 画板导出扩展名报错 | 预览是 jpg——`--output ./x.jpg` |
| 图片在单元格里太大 | `<img … width="160"/>` 控制显示宽（列宽约 180 时用 160） |

## 已验证的完整链路（参考）

1. `docs +fetch --scope outline --detail with-ids` 定位锚点 block id
2. `docs +update block_insert_after --content @x.xml` 插入新内容（图片/画板/表格均可行）
3. `docs +media-insert` + `block_move_after` 把图片定位到指定章节
4. `docs +fetch` 复核 + `whiteboard +export` 验证画板渲染
5. 临时文档全流程验证后再操作正式文档；结束删除临时文档
