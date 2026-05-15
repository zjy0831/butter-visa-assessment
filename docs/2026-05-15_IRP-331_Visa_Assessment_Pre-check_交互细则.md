# 交互细则：Visa Assessment Pre-check Request Flow

> 对应产品方案：`docs/2026-05-15_IRP-331_Visa_Assessment_Pre-check_产品方案.md`
>
> 本文只描述界面交互，不重复业务背景和字段方案。

## 1. 交互原则

本期界面交互应尽量贴近 Butter 现有 request 交互，不在列表页直接暴露不同 task 的操作按钮。

核心原则：

- Requests 列表只做状态概览，不直接处理 task。
- 列表操作按钮统一为 `View`。
- 用户点击 `View` 后进入 `Request Info`。
- 所有任务处理都从 `Request Info` 当前 records 节点的 `Process` 按钮进入。
- `Confirm Order [EoR - Onboarding]` 沿用 Butter 现有交互，不因 Visa Assessment Pre-check 改造重做。

## 2. Requests 列表

Requests 列表保持现有结构和交互，只做状态信息补充：

| 展示项 | 展示规则 |
| --- | --- |
| `Status` | 展示现有 request status：`Pending` / `Processing` / `Revoked` / `Canceled` / `Closed` / `Completed` |
| `Pending Task` | 展示当前待处理 task；无待办时显示 `N/A` |
| `Operation` | 统一展示 `View`，不按 task 类型切换按钮 |

`Status` 区域可沿用现有 tooltip 样式展示详情，例如：

```text
Request Status: Pending (N/A)
Pending Task Name: Confirm Order [EoR - Onboarding]
Pending Task Assignee: [BIPO Service Delivery] SD-MichelleHou hou, SD-Jelena Zhang
```

签证预评估相关阶段的列表展示建议如下：

| `currentStage` | `currentTask` | Status 展示 | Pending Task 展示 |
| --- | --- | --- | --- |
| `visa_assessment` | `Confirm Visa Assessment` | `Pending` | `Confirm Visa Assessment` |
| `client_supplement` | `Supplement Assessment Materials` | `Pending` | `Supplement Assessment Materials` |
| `onboarding_info_completion` | `Complete Onboarding Info` | `Pending` | `Complete Onboarding Info` |
| `submit_order` | `Submit Order` | `Pending` | `Submit Order` |
| `confirm_order` | `Confirm Order [EoR - Onboarding]` | `Pending` | `Confirm Order` |
| `service_order` | 当前 service order task | `Processing` | 当前 service order task 或进度 |

## 3. View 进入 Request Info

用户在列表点击 `View` 后，统一进入现有 `Request Info` 页面。

`Request Info` 页面继续使用现有 records timeline：

- 历史节点展示操作人、时间、动作，并提供 `View`。
- 当前待办节点展示 `Process`。
- 不在列表页处理 task，所有处理动作都从 Request Info 当前 records 节点进入。

当前 records 节点与 `currentTask` 的对应关系如下：

| `currentStage` | `currentTask` | Request Info 当前节点 |
| --- | --- | --- |
| `visa_assessment` | `Confirm Visa Assessment` | `Confirm Visa Assessment [EoR - Onboarding]` |
| `client_supplement` | `Supplement Assessment Materials` | `Supplement Assessment Materials [EoR - Onboarding]` |
| `onboarding_info_completion` | `Complete Onboarding Info` | `Complete Onboarding Info [EoR - Onboarding]` |
| `submit_order` | `Submit Order` | `Submit Order [EoR - Onboarding]` |
| `confirm_order` | `Confirm Order [EoR - Onboarding]` | `Confirm Order [EoR - Onboarding]` |
| `service_order` | 当前 service order task | 现有 service order 节点 |

## 4. Process 分流

Request Info 当前节点点击 `Process` 后，根据 `currentTask` 打开对应页面或弹窗：

| `currentTask` | `Process` 打开 |
| --- | --- |
| `Confirm Visa Assessment` | SD 预评估确认页或弹窗 |
| `Supplement Assessment Materials` | Client 补料页 |
| `Complete Onboarding Info` | Client / Candidate onboarding 信息补全页 |
| `Submit Order` | Client 修改并重新提交页 |
| `Confirm Order [EoR - Onboarding]` | 现有 Confirm Order 交互 |
| 当前 service order task | 现有 service order task |

## 5. Confirm Order 交互

`Confirm Order [EoR - Onboarding]` 交互沿用 Butter 现有实现，不因 Visa Assessment Pre-check 改造重做。

进入 Confirm Order 时，应满足：

```text
requestStatus = Pending
currentStage = confirm_order
currentTask = Confirm Order [EoR - Onboarding]
```

Confirm Order 中仍按现有方式完成以下动作：

- SD 复核 request 信息、candidate 信息、visa 信息、remarks、attachments。
- SD 可 `Return to Client`，此时 request 回到 `currentStage = submit_order`，`currentTask = Submit Order`。
- SD 可 `Confirm Order`，之后进入 `Open Service Order`，request status 从 `Pending` 变为 `Processing`。
- Confirm Order 后续 service order、cancel、complete 等交互继续沿用现有逻辑。

## 6. 完整闭环演示路径

为了验证改造后的闭环，界面应至少能走通以下路径：

1. Client 选择 `Yes, visa support is required`。
2. Client 填写并提交 `Visa Assessment Pre-check`。
3. Request 列表显示 `Status = Pending`，`Pending Task = Confirm Visa Assessment`，操作为 `View`。
4. SD 点击 `View` 进入 Request Info。
5. 当前 records 节点为 `Confirm Visa Assessment [EoR - Onboarding]`，SD 点击 `Process`。
6. SD 选择 `Return to Client`，request 进入 `currentStage = client_supplement`，`currentTask = Supplement Assessment Materials`。
7. Client 补料后重新提交，request 回到 `currentStage = visa_assessment`，`currentTask = Confirm Visa Assessment`。
8. SD 再次进入预评估并选择 `Approved`。
9. request 进入 `currentStage = onboarding_info_completion`，`currentTask = Complete Onboarding Info`。
10. Client / Candidate 补全并提交 onboarding 信息。
11. request 进入 `currentStage = confirm_order`，`currentTask = Confirm Order [EoR - Onboarding]`。
12. SD 点击 `View` 进入 Request Info，并在当前 `Confirm Order` 节点点击 `Process`。
13. 使用现有 Confirm Order 交互完成接单。
14. 系统执行 `Open Service Order`，request status 变为 `Processing`，`currentStage = service_order`。
