# 【Butter - EOR Onboarding】SD 签证预评估审核与处置

---

## 1. 业务背景（Background）

- **现状 (As-Is)**：SD 在正式 Confirm Order 阶段才完成签证可行性判断，此时客户已提交完整的 Onboarding 信息，若签证无法办理，流程回退成本高。
- **问题 (Pain)**：签证资格判断滞后，导致无效 Request 进入接单流程；SD 缺乏结构化的评估入口，评估结论也无法有效记录和追溯。
- **目标 (To-Be)**：在正式接单前，为 SD 提供专门的签证预评估审核入口（Confirm Visa Assessment）。SD 可查看客户提交的候选人信息和评估材料，给出通过、不通过或退回补充三种处置结论，并由系统驱动 Request 进入对应下一阶段。
- **受影响角色**：SD（Service Delivery）、Client HR（被动接收通知）

**叙事**：过去 SD 只能在 Confirm Order 阶段发现签证问题，此时已是流程末端，退回或关闭的代价极高。本次在 Request 流转链路中插入 `Confirm Visa Assessment` 节点，让 SD 在客户提交预评估信息后第一时间进入结构化的审核弹窗，并通过三个清晰的处置按钮驱动流程：通过则进入后续 Onboarding 补全，不通过则关闭 Request 并通知客户，材料不足则退回客户补充。整个审核过程的结论、操作人和时间都完整记录在 Request 历史中，形成可追溯的评估档案。

---

## 2. 本卡范围（Scope）

- **适用角色**：SD
- **适用场景**：Client 提交需要线上预评估的 Request 后，SD 处理 `Confirm Visa Assessment` 任务
- **入口**：Request 列表 → `View` → Request Info → 当前节点 `Confirm Visa Assessment [EoR - Onboarding]` → `Process`
- **主流程**：
  1. SD 在 Request Info 点击当前节点的 `Process` 按钮
  2. 弹窗打开，SD 查看三个 Tab 中的候选人信息、签证材料和客户备注
  3. SD 选择处置结论：
     - `Return to Client`：退回补充，Request 进入 `client_supplement` 阶段
     - `Assessment Not Approved`：不通过，弹二次确认，填写原因后 Request 关闭
     - `Assessment Approved`：通过，弹二次确认，可填写备注后 Request 进入 `onboarding_info_completion` 阶段
- **Out of scope**：
  - Client 提交预评估表单——见 Story 1
  - Client 补料（Supplement Assessment Materials）和后续 Complete Onboarding Info——见 Story 3
  - Confirm Order 流程——见 Story 3

---

## 3. 用户故事（User Story）

> 作为 **SD**，我希望在正式接单前有一个结构化的签证预评估审核入口，能查看候选人资质信息和评估材料，并给出通过、不通过或退回三种处置结论，以便于在早期识别签证风险、避免无效 Request 进入正式接单流程。

---

## 4. Story AC（验收标准）

### 逻辑明细（Details）

#### (1) 页面结构 / 信息架构

**Request 列表**：
- 该 Request `Status = Pending`
- Status hover tooltip 展示：`Pending Task: Confirm Visa Assessment` + 当前处理人信息
- 操作列统一展示 `View`，不单独暴露处置按钮

**Request Info**：
- 当前 records 节点展示 `Confirm Visa Assessment [EoR - Onboarding]`，并有 `Process` 按钮
- 历史节点展示操作人、时间、动作，提供 `View`

**Confirm Visa Assessment 弹窗**：
- 弹窗标题：`SD Confirm Visa Assessment`
- 标题下方说明文案：`This is the candidate basic information and visa pre-assessment material submitted by the client. Please assess whether the candidate is eligible for visa application. If there are any issues, you can edit directly or return it to the client for correction.`
- 说明文案下方展示三个普通 Tab（无 step 进度条）：
  - `Candidate Info`
  - `Visa Requirements`
  - `Remark & Attachment`
- 弹窗底部按钮（从左到右）：`Cancel` / `Return to Client` / `Assessment Not Approved` / `Assessment Approved`

#### (2) 关键字段（Attribute）

**Candidate Info Tab**（只读展示，来自 Story 1 的 Candidate Info 子步骤）：

| 字段 | 说明 |
| :--- | :--- |
| Candidate Name | 候选人姓名 |
| Candidate Email | 邮箱 |
| Nationality / Citizenship | 国籍 |
| Current Residence | 当前居住地 |
| Work Location | 工作地 |
| Job Title / Position | 岗位 |
| Salary | 薪资 |
| Degree / Education Level | 学历 |
| Expected Start Date | 预计入职日期 |

**Visa Requirements Tab**（只读展示，来自 Story 1 的 Visa Requirements 子步骤）：

| 内容区块 | 说明 |
| :--- | :--- |
| Visa Application Type | Employment Visa / Dependant Visa / Employment + Dependant |
| Employment / Dependant Visa Info | Visa Type、申请地、出发地、Within Issuing Country? 等 |
| Evaluation Materials | 客户已上传的材料列表及状态 |
| Document Checklist | 系统按地区带出的材料清单（含 required / optional 标记） |

**Remark & Attachment Tab**（只读展示，来自 Other Remarks & Attachment 步骤）：

| 字段 | 说明 |
| :--- | :--- |
| Remark | Client 填写的补充说明 |
| Attachments | Client 上传的附件 |

**Assessment Not Approved 二次确认弹窗**：

| 字段 | 必填 | 说明 |
| :--- | :--- | :--- |
| Remarks | 是 | SD 填写评估不通过原因，用于通知 Client 并记录到 Request 历史 |

**Assessment Approved 二次确认弹窗**：

| 字段 | 必填 | 说明 |
| :--- | :--- | :--- |
| Remarks | 否 | SD 给 Client 的补充说明，用于指导后续 Complete Onboarding Info；空时仍可 Confirm |

#### (3) 规则逻辑（核心）

**进入条件**：
```
visaRequired = true
visaAssessmentRequired = true
currentTask = Confirm Visa Assessment
```

**按钮行为规则**：

| 按钮 | 二次确认 | Remark 必填 | Confirm 后状态变更 |
| :--- | :--- | :--- | :--- |
| `Cancel` | 无 | — | 关闭弹窗，Request 状态不变 |
| `Return to Client` | 无（直接执行） | — | `currentStage = client_supplement`，`currentTask = Supplement Assessment Materials`；通知 Client 补充 |
| `Assessment Not Approved` | 有（弹二次确认） | 是 | `requestStatus = Closed`，`currentStage = closed`，`currentTask = Close Request`；通知 Client |
| `Assessment Approved` | 有（弹二次确认） | 否 | `requestStatus = Pending`，`currentStage = onboarding_info_completion`，`currentTask = Complete Onboarding Info`；通知 Client |

**Assessment Not Approved 二次确认弹窗规则**：
- 弹窗标题：`Confirmation to Reject Visa Assessment`
- 说明文案：`Please enter the reason why the visa assessment is not approved. After confirmation, this request will be cancelled and the client will be notified.`
- `Remarks` 为空时，`Confirm` 按钮 disabled；校验失败展示 `Remark is required`
- 点击 `Close` 关闭二次确认弹窗，不改变 Request 状态
- 点击 `Confirm` 后：系统更新状态，记录操作人和操作时间，通知 Client

**Assessment Approved 二次确认弹窗规则**：
- 弹窗标题：`Confirmation to Approve Visa Assessment`
- 说明文案：`You can add remarks for the client below. After confirmation, this request will be routed to the client to complete additional onboarding candidate information.`
- `Remarks` 可为空；为空时 `Confirm` 仍可点击
- 点击 `Close` 关闭二次确认弹窗，不改变 Request 状态
- 点击 `Confirm` 后：系统更新状态，记录 SD 备注、操作人和操作时间；SD 备注带入后续 Complete Onboarding Info 页面顶部展示

**评估结论记录**（需写入 Request 历史）：
- 评估结果（Approved / Not Approved / Return to Client）
- 结果原因 / 备注
- 评估确认人（SD 账号）
- 确认时间

#### (4) 异常 & 提示

- `Return to Client` 点击后直接执行，不弹二次确认；建议在 UI 层有视觉区分（如次要按钮样式），避免 SD 误点
- `Assessment Not Approved` 的 `Remarks` 为空时 `Confirm` disabled，并展示 `Remark is required` 提示
- 网络异常导致状态更新失败时，弹窗保持打开，提示 `Operation failed, please try again`；不允许 Request 停留在中间状态

#### (5) 权限（Permission）

- 仅 SD 可见 `Confirm Visa Assessment` 节点的 `Process` 入口及弹窗操作按钮
- Client 可在 Request Info 历史记录中查看评估结论（只读），不可修改
- LS 是否可处理该任务，取决于预评估 task 是否分配给 LS，本期按现有任务分配规则执行

---

### 验收清单（Acceptance Criteria）

**场景 – 主路径（Happy Path）**

- AC1：Client 提交需要预评估的 Request 后，Request 列表该条目 `Status = Pending`，Status tooltip 显示 `Pending Task: Confirm Visa Assessment`
- AC2：SD 点击 `View` 进入 Request Info，当前节点为 `Confirm Visa Assessment [EoR - Onboarding]`，展示 `Process` 按钮
- AC3：点击 `Process` 后，打开 `SD Confirm Visa Assessment` 弹窗，展示三个 Tab（Candidate Info / Visa Requirements / Remark & Attachment）及说明文案
- AC4：`Candidate Info` Tab 只读展示客户填写的 9 个预评估候选人字段，不展示 Employment Visa 下原有的 Candidate Info 区块
- AC5：`Visa Requirements` Tab 展示签证类型、Visa Info、已上传材料和地区材料清单，不重复展示 Candidate Info
- AC6：SD 点击 `Assessment Approved` → 弹出二次确认弹窗 → Remarks 可为空 → 点击 `Confirm` → Request 进入 `currentStage = onboarding_info_completion`，通知 Client
- AC7：SD 点击 `Assessment Not Approved` → 弹出二次确认弹窗 → Remarks 为空时 `Confirm` disabled → 填写原因后点击 `Confirm` → `requestStatus = Closed`，通知 Client
- AC8：SD 点击 `Return to Client` → 直接执行 → `currentStage = client_supplement`，`currentTask = Supplement Assessment Materials`，通知 Client
- AC9：评估操作完成后，Request Info 历史记录中新增对应节点，展示操作人、时间和评估结论

**场景 – 异常路径（Edge Cases）**

- AC1：`Assessment Not Approved` 二次确认弹窗 Remarks 为空时，`Confirm` 不可点击，展示 `Remark is required`
- AC2：点击任意二次确认弹窗的 `Close` 后，弹窗关闭，Request 状态不变，主弹窗保持打开
- AC3：点击主弹窗 `Cancel` 后，弹窗关闭，Request 状态不变
- AC4：状态更新接口失败时，弹窗保持打开，展示错误提示，不产生状态中间态
