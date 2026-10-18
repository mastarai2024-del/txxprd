# 身份、授权与诊断

本文命令参数已对照 lark-cli 1.0.90 的本机帮助（2026-10-18）。换版本先查 `--help` 和 CLI 随附官方参考，不根据入门文章或旧快照猜测默认行为。

## 检查安装与配置

在技能目录运行，或把脚本路径改成技能的实际绝对路径：

```bash
python3 vendor/lark-unified/scripts/lark_status.py --json
```

| 退出码 | 意义与下一步 |
|---|---|
| 0 | 找到应用配置；仍需核对用户身份和目标文档权限 |
| 3 | 未找到 CLI；在用户安装请求范围内执行 `npx -y @larksuite/cli@latest install`，需要 Node 18+ |
| 4 | 未配置；按随附套件的 split device-flow 配置应用 |
| 5 | 输出无法解析；读取具体错误，不直接重装或重新授权 |

脚本的 `userLoggedIn:false` 不等于必须重新登录；`needs_refresh` 可能只是访问令牌需要刷新。先读取 `lark-cli whoami`，必要时 `lark-cli auth status --json --verify` 检查；只有实际认证结果要求人工登录时才发起授权。配置检查成功不能证明登录或文档可用。

抑制通知可设置：

```bash
export LARKSUITE_CLI_NO_UPDATE_NOTIFIER=1
export LARKSUITE_CLI_NO_SKILLS_NOTIFIER=1
```

## 核对执行身份

```bash
lark-cli --version
lark-cli profile list
lark-cli whoami
```

核对 profile、应用、Feishu/Lark 品牌及用户是否符合本次目标。昵称不能单独证明同一用户或同一组织；不确定且会改变访问范围时集中询问。不要输出 token、secret 或完整凭证配置。

多应用任务使用已确认的 profile，后续认证检查与业务命令都保持一致：

```bash
lark-cli --profile '<profile>' whoami
lark-cli --profile '<profile>' docs +fetch --as user --doc '<doc_url>' --scope outline --detail with-ids
```

`profile use` 会修改全局默认配置。仅处理一份文档时优先逐命令指定 profile；用户未要求切换身份时，不更改默认 profile、不改用 bot 尝试绕过拒绝。

## 按任务申请权限

1. 从本机命令帮助、CLI 官方技能参考取得所需 scope；原生 API 可用 `lark-cli schema <service.resource.method>` 查接口，不能假设所有 shortcut 都有同名 schema。
2. `lark-cli auth check --scope '<needed_scopes>' --json` 检查当前已有授权，读取退出码和结构化结果。
3. 只对明确缺失的用户 scope 发起 split 登录。应用权限未开放与用户未授权需分开处理；根据实际错误提示行动。

以下是按功能查权限的起点，组合命令可能另需元数据权限，最终以本机参考及错误中的 `missing_scopes` 为准：

| 任务 | 常见权限 |
|---|---|
| 读取 docx 正文 | `docx:document:readonly` |
| 编辑正文及本次测试块 | `docx:document:write_only` |
| Wiki 节点解析 | 按命令要求检查 `wiki:node:read` / `wiki:node:retrieve` |
| 读取评论与回复 | `docs:document.comment:read` |
| 创建评论 | `docs:document.comment:create`；shortcut 还可能要求 `docs:document.comment:write_only`、正文及元数据读取权限 |
| 上传本地图片 | `docs:document.media:upload` |
| 创建测试文档 | `docx:document:create` |
| 删除整份云文档 | `space:document:delete`，仅在已获删除授权且本次确需删除时申请 |
| 导出已有画板预览 | `board:whiteboard:node:read` |

普通正文编辑不默认申请整份文档删除权限，也不包含发表评论、发消息或改共享权限的授权。

画板操作须区分“通过文档插入画板”“独立读写画板节点”“导出预览”这几个接口，按实际失败项诊断。额外 OAuth 链接过期时，先判断它是否仍是任务依赖；若现有授权接口和本人网页登录足以完成并验证，可继续使用。已有路径也须遵守相同资源权限，不借浏览器或换身份绕过明确的资源拒绝。权限流程完成本身不是功能完成标准。

### 画板权限 99991679 的实测处理

`docs +fetch` 能看到 `<whiteboard token="...">`，不代表当前用户 token 有权限读取画板节点。导出预览失败时，常见返回：

```text
code: 99991679
type: action_privilege_required
subject: board:whiteboard:node:read
```

处理顺序：

1. 运行 `lark-cli auth check --scope 'board:whiteboard:node:read' --json` 确认是否真的缺失。
2. 缺失时只申请这一个 scope，不使用裸 `auth login` 或 `--recommend`。
3. 先 `--no-wait` 取得授权链接，把链接原样交给用户；本回合结束，等待用户完成授权。
4. 用户确认后，在后续回合用同一 `device_code` 完成登录；不要把 device code 写入报告或仓库。
5. 授权后重试导出；仍失败时区分应用后台是否开放该权限与资源本身是否可读。

已知限制：应用后台未开放 `board:whiteboard:node:read` 时，补用户 OAuth 也不能成功。此时保留“画板已写入但预览未验证”的状态，不要反复登录、扩大权限或换身份。正文、图片、HTML 附件可单独完成验收。

```bash
# 仅在确实缺少本次需要的权限时发起
lark-cli auth login --scope '<missing_scopes>' --no-wait --json
# 将返回的授权 URL 原样交给用户，结束该回合。
# 用户确认后，在后续回合完成；device_code 不写入报告或仓库。
lark-cli auth login --device-code '<device_code>'
```

CLI 1.0.90 的帮助显示：裸 `auth login` 与 `--recommend` 都会请求全部已知业务域权限。因此本技能明确使用 `--scope`；不复制入门文档里的裸登录命令，也不把 `--recommend` 当成最小权限。

## 错误分流与停止条件

| 证据 | 处理 |
|---|---|
| 未登录、刷新失败或明确的认证错误 | 使用当前任务的最小 scope 登录；保留现有应用配置 |
| 错误明确给出 `missing_scopes` | 区分用户授权与应用后台权限，仅补实际缺项 |
| `permission_denied`，例如伴随资源拒绝提示的 `131006` | 先只读核对 profile、用户、目标类型；身份正确仍被拒绝时，请资源方开放相应访问权。不要循环重试、扩大 scope 或换身份碰权限 |
| `3380004` 等权限相关代码 | 同时读取 message、subtype、hint 和失败接口，不仅凭数字断言具体原因 |
| URL/token 类型不符 | 从用户链接核对 Wiki 与底层 docx；仅使用已读取到的真实 token，不猜造链接 |
| 网络失败、写入超时或结果未知 | 留存非敏感回执和操作范围，先回读受影响对象；查询仍失败时报告结果未知，不重复整批写入 |

报告具体失败层级、实际账号的可识别信息、错误代码及必要的下一步。资源拒绝后等待权限或目标变更，不能转用其他通道规避访问限制。`--dry-run`、命令退出 0 或配置存在均不能替代目标资源的真实访问与回读。
