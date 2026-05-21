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
- Client `Submit Request` 继续沿用当前前端 wizard：先选择 `Service Module`，再选择 `Service Location & Project`，之后进入 `Collect Work Visa Requirements` 做签证分流。

## 2. Requests 列表

Requests 列表保持现有结构和交互，只做状态信息补充：

| 展示项            | 展示规则                                                                                           |
| -------------- | ---------------------------------------------------------------------------------------------- |
| `Status`       | 展示现有 request status：`Pending` / `Processing` / `Revoked` / `Canceled` / `Closed` / `Completed` |
| `Pending Task` | 主要通过 `Status` hover tooltip 展示；表格可沿用现有 `N/A` / 进度数字展示                                          |
| `Operation`    | 统一展示 `View`，不按 task 类型切换按钮                                                                     |

`Status` 区域可沿用现有 tooltip 样式展示详情，例如：

```text
Request Status: Pending (N/A)
Pending Task Name: Confirm Order [EoR - Onboarding]
Pending Task Assignee: [BIPO Service Delivery] SD-MichelleHou hou, SD-Jelena Zhang
```

签证预评估相关阶段的列表展示建议如下。若列表不新增显式 Pending Task 列，则 `Pending Task 展示` 主要进入 `Status` hover tooltip：

| `currentStage`               | `currentTask`                      | Status 展示    | Pending Task 展示                   |
| ---------------------------- | ---------------------------------- | ------------ | --------------------------------- |
| `visa_assessment`            | `Confirm Visa Assessment`          | `Pending`    | `Confirm Visa Assessment`         |
| `client_supplement`          | `Supplement Assessment Materials`  | `Pending`    | `Supplement Assessment Materials` |
| `onboarding_info_completion` | `Complete Onboarding Info`         | `Pending`    | `Complete Onboarding Info`        |
| `submit_order`               | `Submit Order`                     | `Pending`    | `Submit Order`                    |
| `confirm_order`              | `Confirm Order [EoR - Onboarding]` | `Pending`    | `Confirm Order`                   |
| `service_order`              | 当前 service order task              | `Processing` | 当前 service order task 或进度         |

## 3. View 进入 Request Info

用户在列表点击 `View` 后，统一进入现有 `Request Info` 页面。

`Request Info` 页面继续使用现有 records timeline：

- 历史节点展示操作人、时间、动作，并提供 `View`。
- 当前待办节点展示 `Process`。
- 不在列表页处理 task，所有处理动作都从 Request Info 当前 records 节点进入。

当前 records 节点与 `currentTask` 的对应关系如下：

| `currentStage`               | `currentTask`                      | Request Info 当前节点                                    |
| ---------------------------- | ---------------------------------- | ---------------------------------------------------- |
| `visa_assessment`            | `Confirm Visa Assessment`          | `Confirm Visa Assessment [EoR - Onboarding]`         |
| `client_supplement`          | `Supplement Assessment Materials`  | `Supplement Assessment Materials [EoR - Onboarding]` |
| `onboarding_info_completion` | `Complete Onboarding Info`         | `Complete Onboarding Info [EoR - Onboarding]`        |
| `submit_order`               | `Submit Order`                     | `Submit Order [EoR - Onboarding]`                    |
| `confirm_order`              | `Confirm Order [EoR - Onboarding]` | `Confirm Order [EoR - Onboarding]`                   |
| `service_order`              | 当前 service order task              | 现有 service order 节点                                  |

## 4. Process 分流

Request Info 当前节点点击 `Process` 后，根据 `currentTask` 打开对应页面或弹窗：

| `currentTask`                      | `Process` 打开                        |
| ---------------------------------- | ----------------------------------- |
| `Confirm Visa Assessment`          | SD 预评估确认弹窗                          |
| `Supplement Assessment Materials`  | Client 补料页                          |
| `Complete Onboarding Info`         | Client / Candidate onboarding 信息补全页 |
| `Submit Order`                     | Client 修改并重新提交页                     |
| `Confirm Order [EoR - Onboarding]` | 现有 Confirm Order 交互                 |
| 当前 service order task              | 现有 service order task               |

## 5. Client Submit Request 交互

本期先只考虑单个候选人场景。Client 点击 `Submit Request` 后，继续沿用当前前端 wizard 结构，并在现有基础上调整签证预评估分支。

### 5.1 主步骤结构

默认主步骤为：

```text
1. Service Module
2. Service Location & Project
3. Collect Work Visa Requirements
4. Provide Candidate Information 或 Other Remarks & Attachment
5. Submit
```

不同签证分支下，`Collect Work Visa Requirements` 后续步骤不同：

| 分支                | 后续主步骤                                                           |
| ----------------- | --------------------------------------------------------------- |
| 不需要办理 visa        | `Provide Candidate Information` -> `Other Remarks & Attachment` |
| 需要办理 visa，但不需要预评估 | `Provide Candidate Information` -> `Other Remarks & Attachment` |
| 需要办理 visa，且需要预评估  | `Other Remarks & Attachment`                                    |

说明：

- `Provide Candidate Information` 是正式 onboarding 用的完整 candidate 创建 / 信息补全页面，沿用当前项目中的前端交互。
- 如果走签证预评估，初次提交阶段不进入完整 `Provide Candidate Information`；SD 评估通过后，再进入 `Complete Onboarding Info` 阶段补全正式 onboarding 信息。
- `Other Remarks & Attachment` 是 `Collect Work Visa Requirements` 后面的独立主步骤，不属于 `Visa Requirements` 内部。

### 5.2 Service Module

保持当前前端交互。

Client 选择服务模块，例如 `EoR - Onboarding`，点击 `Next` 进入下一步。

### 5.3 Service Location & Project

保持当前前端交互。

Client 选择 service project / service location。所选 location 继续用于后续签证材料清单加载。

### 5.4 Collect Work Visa Requirements

该步骤用于完成签证分流。内部子步骤根据 Client 的选择动态展示。

默认进入 `Visa Application Type`。

#### 5.4.1 Visa Application Type

页面提示文案调整为：

```text
Please confirm whether the candidate you are onboarding is local or expat. If the candidate is an expat and requires work authorization, please apply for a visa for this candidate.
```

字段和展示规则：

| 字段                                 | 选项                                                              | 展示条件         |
| ---------------------------------- | --------------------------------------------------------------- | ------------ |
| `Is a visa application required?`  | `Yes` / `No`                                                    | 始终展示         |
| `Visa Application Type`            | `Employment Visa` / `Dependant Visa` / `Employment + Dependant` | 选择 `Yes` 后展示 |
| `Is visa pre-assessment required?` | `Yes` / `No`                                                    | 选择 `Yes` 后展示 |

交互规则：

- 不让 Client 显式选择 `Local / Expat`；`Local / Expat` 只出现在提示文案里，帮助 Client 判断是否需要办理签证。
- 如果 `Is a visa application required? = No`，不展示 `Visa Application Type`，也不展示 `Is visa pre-assessment required?`。
- 如果 `Is a visa application required? = Yes`，必须选择 `Visa Application Type`。
- 如果 `Is a visa application required? = Yes`，还必须选择 `Is visa pre-assessment required?`。
- 如果 Client 选择不需要预评估，不要求填写线下预评估说明，也不要求上传线下预评估附件。

#### 5.4.2 Candidate Info

仅在以下条件同时满足时展示：

```text
Is a visa application required? = Yes
Is visa pre-assessment required? = Yes
```

这是签证预评估所需的候选人信息，从原 `Employment Visa > Candidate Info` 中提出来，作为 `Collect Work Visa Requirements` 下的独立子步骤。

字段示例：

| 字段                        |
| ------------------------- |
| Candidate Name            |
| Candidate Email           |
| Nationality / Citizenship |
| Current Residence         |
| Work Location             |
| Job Title / Position      |
| Salary                    |
| Degree / Education Level  |
| Expected Start Date       |

说明：

- 该步骤不是完整 onboarding 的 `Provide Candidate Information`。
- 后续 SD 在 `Confirm Visa Assessment` 中以独立 tab 查看这些信息。
- SD 评估通过后，这些字段可带入后续 `Complete Onboarding Info`，但 Client / Candidate 仍需按正式 onboarding 要求补全完整 candidate 信息。

#### 5.4.3 Visa Requirements

仅在以下条件同时满足时展示：

```text
Is a visa application required? = Yes
Is visa pre-assessment required? = Yes
```

内容沿用现有签证预评估表单，但层级调整为：

```text
Employment Visa
- Visa Info
- Evaluation Materials

Dependant Visa
- Dependant Info
- Visa Info
- Evaluation Materials
```

展示规则：

- `Employment Visa` 下不再展示 `Candidate Info`。
- `Candidate Info` 已作为 `Collect Work Visa Requirements` 下的独立子步骤。
- 如果 `Visa Application Type = Employment Visa`，只展示 Employment Visa requirements。
- 如果 `Visa Application Type = Dependant Visa`，只展示 Dependant Visa requirements。
- 如果 `Visa Application Type = Employment + Dependant`，展示两类 requirements。

### 5.5 分支流转

#### 分支 A：不需要办理 visa

选择：

```text
Is a visa application required? = No
```

步骤流转：

```text
Service Module
-> Service Location & Project
-> Collect Work Visa Requirements / Visa Application Type
-> Provide Candidate Information
-> Other Remarks & Attachment
-> Submit
```

提交后：

```text
currentStage = confirm_order
currentTask = Confirm Order [EoR - Onboarding]
```

#### 分支 B：需要办理 visa，但不需要预评估

选择：

```text
Is a visa application required? = Yes
Is visa pre-assessment required? = No
```

步骤流转：

```text
Service Module
-> Service Location & Project
-> Collect Work Visa Requirements / Visa Application Type
-> Provide Candidate Information
-> Other Remarks & Attachment
-> Submit
```

说明：

- 不展示 `Candidate Info` 预评估子步骤。
- 不展示 `Visa Requirements` 预评估子步骤。
- 不要求填写线下预评估说明或上传线下预评估附件。

提交后：

```text
currentStage = confirm_order
currentTask = Confirm Order [EoR - Onboarding]
```

#### 分支 C：需要办理 visa，且需要预评估

选择：

```text
Is a visa application required? = Yes
Is visa pre-assessment required? = Yes
```

步骤流转：

```text
Service Module
-> Service Location & Project
-> Collect Work Visa Requirements / Visa Application Type
-> Collect Work Visa Requirements / Candidate Info
-> Collect Work Visa Requirements / Visa Requirements
-> Other Remarks & Attachment
-> Submit
```

提交后：

```text
currentStage = visa_assessment
currentTask = Confirm Visa Assessment
```

### 5.6 Other Remarks & Attachment

`Other Remarks & Attachment` 是 `Collect Work Visa Requirements` 后面的独立主步骤，三种分支都展示。

内容保持现有：

| 字段            | 说明            |
| ------------- | ------------- |
| Other Remarks | Client 补充说明   |
| Attachment    | Client 上传补充附件 |

查看规则：

- 如果进入 `Confirm Visa Assessment`，SD 在预评估弹窗的 `Remark & Attachment` tab 查看。
- 如果跳过预评估直接进入 `Confirm Order [EoR - Onboarding]`，SD 在 Confirm Order 交互中查看。

## 6. SD Confirm Visa Assessment

SD 在 Request Info 点击 `Confirm Visa Assessment` 当前节点的 `Process` 后，打开预评估确认弹窗。

进入条件：

```text
visaRequired = true
visaAssessmentRequired = true
currentTask = Confirm Visa Assessment
```

弹窗标题：

```text
SD Confirm Visa Assessment
```

弹窗内容沿用当前项目中的 visa assessment 表单内容，但不再展示顶部 step；`Candidate Info`、`Visa Requirements`、`Remark & Attachment` 直接作为普通 tab 展示。

标题下方先展示说明文案：

```text
This is the candidate basic information and visa pre-assessment material submitted by the client. Please assess whether the candidate is eligible for visa application. If there are any issues, you can edit directly or return it to the client for correction.
```

说明文案下方展示普通 tab：

```text
Candidate Info
Visa Requirements
Remark & Attachment
```

### 6.1 Candidate Info tab

展示 Client 在以下步骤填写的预评估候选人信息：

```text
Collect Work Visa Requirements / Candidate Info
```

字段示例：

| 字段                        |
| ------------------------- |
| Candidate Name            |
| Candidate Email           |
| Nationality / Citizenship |
| Current Residence         |
| Work Location             |
| Job Title / Position      |
| Salary                    |
| Degree / Education Level  |
| Expected Start Date       |

### 6.2 Visa Requirements tab

展示 Client 在以下步骤填写的签证预评估信息和材料：

```text
Collect Work Visa Requirements / Visa Requirements
```

内容包括：

```text
Visa Application Type
Employment / Dependant Visa Info
Evaluation Materials
Document Checklist
```

展示规则：

- 不再展示 `Employment Visa > Candidate Info`。
- Candidate Info 已经放到独立 tab。
- SD 可以查看客户填写的 visa info、评估材料和系统材料清单。

### 6.3 Remark & Attachment tab

展示 Client 在以下主步骤填写的备注和附件：

```text
Other Remarks & Attachment
```

内容包括：

| 字段          | 说明          |
| ----------- | ----------- |
| Remark      | Client 备注   |
| Attachments | Client 上传附件 |

操作按钮规则：

- 弹窗底部按钮顺序为：`Cancel` / `Return to Client` / `Assessment Not Approved` / `Assessment Approved`。
- `Cancel` 关闭弹窗，不改变 request 状态。
- `Return to Client` 用于退回客户补充预评估信息或材料。
- `Assessment Not Approved` 用于确认预评估不通过；点击后打开二次确认弹窗，要求 SD 填写不通过原因。
- `Assessment Approved` 用于确认预评估通过；点击后打开二次确认弹窗，允许 SD 添加给 Client 的备注。

按钮可使用中文文案：

```text
取消 / 退回客户 / 评估不通过 / 评估通过
```

或英文文案：

```text
Cancel / Return to Client / Assessment Not Approved / Assessment Approved
```

### 6.4 Assessment Not Approved 二次确认弹窗

SD 点击 `Assessment Not Approved` 后，打开二次确认弹窗。

弹窗标题：

```text
Confirmation to Reject Visa Assessment
```

说明文案：

```text
Please enter the reason why the visa assessment is not approved. After confirmation, this request will be cancelled and the client will be notified.
```

字段：

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| Remarks | 必填 | SD 填写评估不通过原因，后续通知 Client，并记录到 request history |

按钮：

```text
Close / Confirm
```

交互规则：

- `Remarks` 为空时，`Confirm` disabled，并在校验失败时展示 `remark is required`。
- 点击 `Close` 关闭二次确认弹窗，不改变 request 状态。
- 点击 `Confirm` 后，request 不再进入正式 onboarding 接单流程。
- 系统更新为 `requestStatus = Closed`，`currentStage = closed`，`currentTask = Close Request`。
- 系统记录 SD 的不通过原因、操作人和操作时间。
- 系统通知 Client：签证预评估不通过，request 已取消 / 关闭，并展示 SD 填写的原因。

### 6.5 Assessment Approved 二次确认弹窗

SD 点击 `Assessment Approved` 后，打开二次确认弹窗。

弹窗标题：

```text
Confirmation to Approve Visa Assessment
```

说明文案：

```text
You can add remarks for the client below. After confirmation, this request will be routed to the client to complete additional onboarding candidate information.
```

字段：

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| Remarks | 否 | SD 给 Client 的补充说明，用于指导后续 Complete Onboarding Info |

按钮：

```text
Close / Confirm
```

交互规则：

- `Remarks` 可为空；为空时仍允许 `Confirm`。
- 点击 `Close` 关闭二次确认弹窗，不改变 request 状态。
- 点击 `Confirm` 后，request 进入 `currentStage = onboarding_info_completion`，`currentTask = Complete Onboarding Info`。
- 系统记录 SD 的评估通过备注、操作人和操作时间。
- 系统通知 Client：签证预评估已通过，请继续补充候选人正式入职信息。

## 7. Complete Onboarding Info 交互

当 SD 在 `Assessment Approved` 二次确认弹窗点击 `Confirm` 后，Client / Candidate 进入 `Complete Onboarding Info`。

进入条件：

```text
requestStatus = Pending
currentStage = onboarding_info_completion
currentTask = Complete Onboarding Info
```

页面顶部展示 SD 在 `Assessment Approved` 二次确认弹窗中填写的备注信息。若 SD 未填写备注，则不展示该区域。

展示样式参考现有 `Modification Remarks` 样式：

- 使用浅暖色背景卡片。
- 标题为 `Modification Remarks`。
- 标题下方展示 SD 的 general remark 文本。
- 如果后续支持字段级备注，可在同一卡片中按字段展示；本期至少展示 SD 在评估通过弹窗中填写的整体 remark。

示例：

```text
Modification Remarks

[SD assessment approval remark]
```

页面主体沿用现有 `Provide Candidate Information` / onboarding 信息补全交互，并自动带入预评估阶段已填写的 candidate info、visa requirements 和相关附件。

## 8. Confirm Order 交互

`Confirm Order [EoR - Onboarding]` 整体沿用 Butter 现有实现，但 visa 相关 tab / step 需要根据前序选择展示不同内容。

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

### 8.1 不需要办理 visa 的 Confirm Order

适用条件：

```text
visaRequired = false
```

`Visa Requirements` tab 只展示 Client 在 `Collect Work Visa Requirements / Visa Application Type` 中的判断结果：

| 字段                              | 展示值 |
| ------------------------------- | --- |
| Is a visa application required? | NO  |

展示规则：

- 不展示 `Visa Application Type`。
- 不展示 `Is visa pre-assessment required?`。
- 不展示 `Confirm Visa Type` step。
- 不展示 visa type、签证材料清单、线下预评估沟通记录等 visa 相关内容。

### 8.2 需要办理 visa，但不需要预评估的 Confirm Order

适用条件：

```text
visaRequired = true
visaAssessmentRequired = false
```

#### 8.2.1 Visa Requirements tab

`Visa Requirements` tab 只展示 Client 在 `Collect Work Visa Requirements / Visa Application Type` 中的判断结果：

| 字段                               | 展示值                                          |
| -------------------------------- | -------------------------------------------- |
| Is a visa application required?  | YES                                          |
| Visa Application Type            | Client 选择的签证申请类型，例如 `Employment + Dependant` |
| Is visa pre-assessment required? | No                                           |

说明：

- 该场景不展示预评估阶段的 `Candidate Info`。
- 该场景不展示预评估阶段的 `Visa Requirements` 填写内容，因为 Client 未走线上预评估。
- SD 后续在 `Confirm Visa Type` step 中确认正式 visa type 和材料要求。

#### 8.2.2 Confirm Visa Type step

`Confirm Visa Type` step 需要展示以下内容：

1. 页面顶部展示富文本框。
2. 富文本框用于 SD 填写与 Client 在线下预评估的沟通过程、判断依据、补充说明。
3. 富文本框支持上传附件，例如邮件截图、沟通凭证等。
4. 富文本框下方展示 visa type 确认区和材料清单。

visa type 确认区按 `Visa Application Type` 展示 tab：

```text
Employment Visa
Dependant Visa
```

展示规则：

- 如果 `Visa Application Type = Employment Visa`，只展示 `Employment Visa` tab。
- 如果 `Visa Application Type = Dependant Visa`，只展示 `Dependant Visa` tab。
- 如果 `Visa Application Type = Employment + Dependant`，展示 `Employment Visa` 和 `Dependant Visa` 两个 tab。

`Employment Visa` tab 内容：

| 字段                                 | 规则                                       |
| ---------------------------------- | ---------------------------------------- |
| Visa Type                          | 下拉选择，例如 `Employment Pass`                |
| Within the Issuing Country/Region? | 下拉选择，选项为 `out of country` / `in country` |

`Dependant Visa` tab 内容：

| 字段        | 规则                       |
| --------- | ------------------------ |
| Visa Type | 下拉选择，例如 `Dependent Pass` |

材料清单展示在 visa type 字段下方，样式参考现有 Confirm Visa Type 交互：

| Name     | Type       | Is required | Reminder |
| -------- | ---------- | ----------- | -------- |
| Passport | Attachment | No          | -        |

说明：

- 材料清单根据 service location、visa application type、visa type 取系统配置。
- SD 可在该 step 中确认正式 visa type 和材料要求。
- `Employment Visa` 的 `Within the Issuing Country/Region?` 是本场景新增字段，仅在 Employment Visa tab 下展示。

### 8.3 需要办理 visa，且已完成线上预评估后的 Confirm Order

适用条件：

```text
visaRequired = true
visaAssessmentRequired = true
currentStage = confirm_order
```

该场景表示 SD 已在 `Confirm Visa Assessment` 中点击 `Assessment Approved`，Client / Candidate 已完成后续 onboarding 信息补全。

Confirm Order 中应能查看：

- 已通过的线上签证预评估信息。
- 预评估阶段填写的 `Candidate Info`。
- 预评估阶段填写的 `Visa Requirements` 和评估材料。
- `Other Remarks & Attachment`。

后续 `Confirm Visa Type` 和正式接单动作沿用现有 Confirm Order 交互。

## 9. 完整闭环演示路径

为了验证改造后的闭环，界面应至少能走通以下路径：

### 9.1 不需要办理 visa

1. Client 选择 `Service Module`。
2. Client 选择 `Service Location & Project`。
3. Client 在 `Visa Application Type` 中选择 `Is a visa application required? = No`。
4. Client 进入 `Provide Candidate Information`，按现有交互填写完整 onboarding candidate 信息。
5. Client 填写 `Other Remarks & Attachment`。
6. Client 提交 request。
7. Request 列表显示 `Status = Pending`，`Pending Task = Confirm Order [EoR - Onboarding]`，操作为 `View`。
8. SD 点击 `View` 进入 Request Info，并在当前 `Confirm Order` 节点点击 `Process`。
9. SD 在 Confirm Order 的 `Visa Requirements` tab 中只看到 `Is a visa application required? = NO`。
10. Confirm Order 不展示 `Confirm Visa Type` step。
11. SD 使用现有 Confirm Order 其他交互完成接单。
12. 系统执行 `Open Service Order`，request status 变为 `Processing`，`currentStage = service_order`。

### 9.2 需要办理 visa，但不需要预评估

1. Client 选择 `Service Module`。
2. Client 选择 `Service Location & Project`。
3. Client 在 `Visa Application Type` 中选择 `Is a visa application required? = Yes`。
4. Client 选择 `Visa Application Type`。
5. Client 选择 `Is visa pre-assessment required? = No`。
6. Client 进入 `Provide Candidate Information`，按现有交互填写完整 onboarding candidate 信息。
7. Client 填写 `Other Remarks & Attachment`。
8. Client 提交 request。
9. Request 列表显示 `Status = Pending`，`Pending Task = Confirm Order [EoR - Onboarding]`，操作为 `View`。
10. SD 点击 `View` 进入 Request Info，并在当前 `Confirm Order` 节点点击 `Process`。
11. SD 在 Confirm Order 的 `Visa Requirements` tab 中看到 `Is a visa application required? = YES`、`Visa Application Type`、`Is visa pre-assessment required? = No`。
12. SD 进入 `Confirm Visa Type` step。
13. SD 先在富文本框中填写与 Client 线下预评估的沟通过程，必要时上传邮件截图等凭证。
14. SD 在下方 visa type 确认区选择正式 visa type；如为 `Employment Visa`，还需选择 `Within the Issuing Country/Region? = out of country / in country`。
15. SD 查看或确认系统带出的材料清单。
16. SD 使用现有 Confirm Order 其他交互完成接单。
17. 系统执行 `Open Service Order`，request status 变为 `Processing`，`currentStage = service_order`。

### 9.3 需要办理 visa，且需要预评估

1. Client 选择 `Service Module`。
2. Client 选择 `Service Location & Project`。
3. Client 在 `Visa Application Type` 中选择 `Is a visa application required? = Yes`。
4. Client 选择 `Visa Application Type`。
5. Client 选择 `Is visa pre-assessment required? = Yes`。
6. Client 填写 `Collect Work Visa Requirements / Candidate Info`。
7. Client 填写 `Collect Work Visa Requirements / Visa Requirements`。
8. Client 填写 `Other Remarks & Attachment`。
9. Client 提交 request。
10. Request 列表显示 `Status = Pending`，`Pending Task = Confirm Visa Assessment`，操作为 `View`。
11. SD 点击 `View` 进入 Request Info。
12. 当前 records 节点为 `Confirm Visa Assessment [EoR - Onboarding]`，SD 点击 `Process`。
13. SD 在弹窗中查看 `Candidate Info`、`Visa Requirements`、`Remark & Attachment` 三个 tab。
14. 如需补充，SD 点击 `Return to Client`，request 进入 `currentStage = client_supplement`，`currentTask = Supplement Assessment Materials`。
15. Client 补料后重新提交，request 回到 `currentStage = visa_assessment`，`currentTask = Confirm Visa Assessment`。
16. SD 再次进入预评估并点击 `Assessment Approved`。
17. 系统打开 `Confirmation to Approve Visa Assessment` 二次确认弹窗。
18. SD 可填写给 Client 的备注，并点击 `Confirm`。
19. request 进入 `currentStage = onboarding_info_completion`，`currentTask = Complete Onboarding Info`。
20. Client / Candidate 进入 `Complete Onboarding Info` 时，在页面顶部看到 SD 的 `Modification Remarks`。
21. Client / Candidate 补全并提交 onboarding 信息。
22. request 进入 `currentStage = confirm_order`，`currentTask = Confirm Order [EoR - Onboarding]`。
23. SD 点击 `View` 进入 Request Info，并在当前 `Confirm Order` 节点点击 `Process`。
24. 使用现有 Confirm Order 交互完成接单。
25. 系统执行 `Open Service Order`，request status 变为 `Processing`，`currentStage = service_order`。

### 9.4 需要办理 visa，且预评估不通过

1. Client 提交需要线上预评估的 request。
2. Request 列表显示 `Status = Pending`，`Pending Task = Confirm Visa Assessment`，操作为 `View`。
3. SD 点击 `View` 进入 Request Info。
4. 当前 records 节点为 `Confirm Visa Assessment [EoR - Onboarding]`，SD 点击 `Process`。
5. SD 在弹窗中查看 `Candidate Info`、`Visa Requirements`、`Remark & Attachment` 三个 tab。
6. SD 点击 `Assessment Not Approved`。
7. 系统打开 `Confirmation to Reject Visa Assessment` 二次确认弹窗。
8. SD 填写评估不通过原因并点击 `Confirm`。
9. request 更新为 `Status = Closed`，`currentStage = closed`，`currentTask = Close Request`。
10. 系统通知 Client：签证预评估不通过，request 已取消 / 关闭，并展示 SD 填写的不通过原因。
