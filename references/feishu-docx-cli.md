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

## 表格局部修订

只调整详细说明时，读取目标单元格内真实块 id。一个段落用 `--block-id`；多个同级段落可用 `--start-block-id` 与 `--end-block-id` 替换为完整嵌套列表。起止块须同属该单元格，不跨单元格或误含下一节。这样保留原图片、列宽和其他列，避免无必要的媒体重传。

写前比较目标块与备份，传入刚读取的 `--revision-id`；冲突或超时先回读。每次结构变化后重新定位 id。写后核对新文本、列表层级与编号，并比较未修改列及资源块；整表确需重建时仍按上文保留全部结构和样式。

批量整理多个单元格时，先在一个目标单元格验证已选写法，再逐格执行“读取最新内容 → 核对旧值 → 按当前 revision 写入 → 回读”。回读比较应保留文字、加粗、层级与顺序；列表新建导致的块 ID 变化单独记录。另行比较目标单元格之外的内容与资源，不能只数图片或附件。

数字主规则、字母分项的写法见 [需求描述的分层段落写法](prd-authoring.md#需求描述的分层段落写法)。用同一单元格内顶层同级块的范围替换为嵌套 `<ol>`，无需重建表格或重传媒体。核对 `seq-marker` 后，再检查飞书中的编号、缩进、换行和加粗。

原生验收项使用 `<checkbox done="false">…</checkbox>`。新写法可在本次获准的测试范围验证 `false → true → false`，回读确认状态；只清理本次新增的测试块并复核原内容。不要改动已有人工验收结果。

## 图片、附件与版本一致性

### 替换表格中的图片

`str_replace` 不支持资源替换。换图必须定位 `<img>` 块，使用：

```bash
lark-cli docs +update --doc <docx> --command block_replace \
  --block-id <img_block_id> \
  --content '<img path="@./shots/state.png" width="160"/>'
```

替换后图片块 ID、资源 token 和显示比例都会变化。不要复用旧 ID；重新 fetch 获取新块。

### 替换 HTML 附件

附件是 `<figure>` 块，不是普通文字。定位 `<figure>` 的 block ID，整体替换：

```bash
lark-cli docs +update --doc <docx> --command block_replace \
  --block-id <figure_block_id> \
  --content '<figure view-type="Preview"><source path="@./prototype.html" name="原型.html"/></figure>'
```

同一文档里替换附件后，旧 `source token` 可能仍留在文档历史版本，但当前正文只应出现新 token。回读全文确认旧 token 不再出现。

### 下载资源做哈希校验

```bash
# 图片
lark-cli docs +media-download --as user --token <image_token> --output ./verify/x.png --overwrite

# HTML / 文件附件
lark-cli docs +media-download --as user --token <source_token> --output ./verify/x.html --overwrite

shasum -a 256 ./本地文件 ./verify/x.png
```

下载成功但哈希不同，先重新下载到新文件名再比对；同一 token 的 CDN 缓存可能在替换后短暂返回旧内容。用当前文档回读出的新 token 重新下载，不能拿旧 token 的缓存结果判断新附件失败。

### 批量换图的顺序

1. 先备份全文。
2. 逐块替换并立即检查命令结果。
3. 全部替换后重新 fetch。
4. 统计图片数、附件数和 token 是否全部更新。
5. 下载新资源做 SHA-256 比对。
6. 目视检查最终截图。

一次替换 16 张图片时，不要在旧 fetch 结果上连续使用旧 block ID；每轮结构变化后重新读取。

### 冻结版本再批量替换

批量替换前先把 HTML、截图和文案冻结：

1. 完成最后一次 HTML 修改。
2. 重新渲染全部截图。
3. 确认截图、附件和设计核对表一致。
4. 再开始替换飞书资源。

如果在替换后又改了 CSS，已替换的图片会与本地新截图不一致，必须重新批量替换。不要在“只改一个字号”之后假设文档无需更新。

## DocxXML 语法要点

- 块级标签：`<p> <h1-h9> <blockquote> <hr> <img> <table> <ol>/<ul> <callout> <grid> <whiteboard> <checkbox> <pre>`
- 文本转义：`<`→`&lt;`、`>`→`&gt;`、`&`→`&amp;`；换行用 `<br/>`；属性必须带引号
- **表格**：`<table><colgroup><col width="100"/></colgroup><thead><tr><th><p>…</p></th></tr></thead><tbody><tr><td><p>…</p></td></tr></tbody></table>`
  - 单元格内容放在 `<p>` 等子块里；表头背景 `background-color="rgb(242,243,245)"`（原样回写即可保留）
  - 重建整表用 `block_replace`，把完整 `<table>…</table>` 作为 content
- **嵌套编号列表**：子列表放 `<li>` 内——`<ol><li>父<ol><li>子<ol><li>孙</li></ol></li></ol></li></ol>`（seq 自动生成，不用手写）
- **HTML 附件**：`<figure view-type="Preview"><source path="@./prototype.html" name="prototype.html"/></figure>`。上传后回读名称、大小及资源信息，再在飞书实际预览中操作关键状态；本地可打开不能替代附件验证。
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
| 只替换了图注，图片没变 | 改到了相邻 `<p>`，不是 `<img>` 块——重新 fetch，定位图片块 ID |
| 附件显示旧版 | 只改了本地 HTML，没替换 `<figure>`——替换 figure 块并下载新附件校验哈希 |
| 文档图片数量不对 | 插入和删除混用，旧块残留——统计 `<img>` / `<figure>` 数，核对表格结构 |
| 写入返回成功但页面没更新 | 飞书渲染缓存或看错版本——回读 token、下载资源、刷新页面三方核对 |
| 文档正文和截图版本错位 | 改了 HTML 没重渲染截图——先重渲染全部受影响状态，再替换文档 |
| 图片显示过大或裁切 | width 与列宽不匹配——表格窄列从 160px 起测，回读 scale |
| `media-download` 报 `unknown flag: --doc` | 该命令只需要 `--token` 和 `--output`；不要传 `--doc` |
| 下载成功但哈希仍对应旧版 | 同一 token 的 CDN 缓存可能短暂返回旧内容——换新文件名重试下载，再比对 |

## 每个目标文档的验证链路

1. `docs +fetch --scope outline --detail with-ids` 定位锚点，再读受影响章节，保存旧内容和必要样式。
2. 新的复杂写法先在获准的测试文档验证，再用 `docs +update --command block_insert_after --content @x.xml` 等命令应用；具体参数补全目标文档和块 ID。
3. 图片定位可用 `docs +media-insert` + `block_move_after`，每次结构变化后重新读取锚点。
4. `docs +fetch` 复核内容与结构；画板用 `whiteboard +export` 检查预览，图片检查实际显示；Markdown 转换检查格式与媒体是否保留。
5. 分别报告已通过与未验证项；保留交付源文件，仅清理已获授权的临时资源。

## 设计稿与文档的版本矩阵

交付前逐项确认：

| 对象 | 必须一致的内容 |
|---|---|
| 本地 HTML | 设计 token、交互状态、文案 |
| 本地截图 | 来自当前 HTML，尺寸和状态齐全 |
| 飞书图片 | 与本地截图 SHA-256 一致 |
| 飞书附件 | 与本地 HTML SHA-256 一致 |
| 功能表 | 每行截图与功能一一对应 |
| 设计说明 | 写清最终版画板与设计规范来源 |
