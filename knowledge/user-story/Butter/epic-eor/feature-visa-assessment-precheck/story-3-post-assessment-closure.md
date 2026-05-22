# 【Butter - EOR Onboarding】预评估通过后续闭环

---

## 1. 业务背景（Background）

- **现状 (As-Is)**：签证预评估通过后，客户需要在一个全新的 Request 中重新填写完整的 Onboarding 信息，评估阶段填写的候选人基础信息无法复用；SD 在 Confirm Order 阶段也缺乏查看线上预评估结论的统一视图。
- **问题 (Pain)**：评估信息与 Onboarding 信息割裂，客户需要重复填写已提交过的字段；SD 在接单阶段难以关联评估结论进行复核；当材料不足时，客户补充路径不清晰。
- **目标 (To-Be)**：评估通过后，同一个 Request 继续流转：客户直接在 `Complete Onboarding Info` 中补全剩余入职信息（评估字段自动带入），SD 的审批备注展示在页面顶部供参考；Confirm Order 中 SD 可查看完整的签证路径信息；整个闭环在同一个 Request 内完成，无需重复建单。
- **受影响角色**：Client HR、Candidate、SD

**叙事**：预评估通过只是起点，真正的价值在于让评估结论无缝衔接到后续流程。本次通过三个串联场景实现完整闭环：材料不足时 Client 有清晰的补料页面；评估通过后客户直接在原 Request 上补全信息，不必重头填写；SD 最终在 Confirm Order 中能看到签证路径的全貌，并根据是否走过线上预评估看到差异化的内容。整个过程在单个 Request 内形成闭环，杜绝信息孤岛。

---

## 2. 本卡范围（Scope）

- **适用角色**：Client HR（补料、Complete Onboarding Info）、Candidate（Complete Onboarding Info）、SD（Confirm Order）
- **适用场景**：SD 退回 Client 补料 → Client 补充重提 → SD 评估通过 → Client/Candidate 补全 Onboarding 信息 → SD Confirm Order（含三场景签证展示适配）
- **入口**：
  - Supplement：Request Info → 当前节点 `Supplement Assessment Materials [EoR - Onboarding]` → `Process`
  - Complete Onboarding Info：Request Info → 当前节点 `Complete Onboarding Info [EoR - Onboarding]` → `Process`
  - Confirm Order：Request Info → 当前节点 `Confirm Order [EoR - Onboarding]` → `Process`
- **主流程**：
  1. [可选] SD `Return to Client` → Client 进入补料页补充字段/材料 → 重新提交 → 回到 SD 审核
  2. SD `Assessment Approved` → Request 进入 `onboarding_info_completion`
  3. Client/Candidate 进入 `Complete Onboarding Info`，顶部展示 SD 备注，补全剩余必填信息后提交
  4. Request 进入 `confirm_order`，SD 在 Confirm Order 中完成最终接单
- **Out of scope**：
  - SD 处置动作（Return to Client / Approved / Not Approved）——见 Story 2
  - Submit Request Wizard——见 Story 1
  - 批量候选人——见 Story 4

---

## 3. 用户故事（User Story）

> 作为 **Client HR / Candidate**，我希望在签证预评估通过后，能在原 Request 中直接补全剩余的正式 Onboarding 信息（评估阶段填写的内容自动带入，无需重填），以便于 SD 在 Confirm Order 时复核完整的候选人信息和签证评估结论，高效完成接单。

---

## 4. Story AC（验收标准）

### 逻辑明细（Details）

#### (1) 页面结构 / 信息架构

**场景一：Supplement Assessment Materials（补料）**

- 进入条件：`currentStage = client_supplement`，`currentTask = Supplement Assessment Materials`
- 入口：Request Info → 当前节点 `Supplement Assessment Materials [EoR - Onboarding]` → `Process`
- 页面内容：展示 SD 退回时填写的补充原因；Client 在对应字段或材料上完成补充
- 提交后：`currentStage = visa_assessment`，`currentTask = Confirm Visa Assessment`；通知 SD 继续评估

**场景二：Complete Onboarding Info**

- 进入条件：`currentStage = onboarding_info_completion`，`currentTask = Complete Onboarding Info`
- 入口：Request Info → 当前节点 `Complete Onboarding Info [EoR - Onboarding]` → `Process`
- 页面顶部：若 SD 在 `Assessment Approved` 二次确认弹窗中填写了备注，展示 `Modification Remarks` 卡片（浅暖色背景）：
  ```
  Modification Remarks
  [SD 填写的审批备注文本]
  ```
  若 SD 未填写备注，不展示该卡片
- 页面主体：沿用现有 `Provide Candidate Information` / Onboarding 信息补全交互，自动带入评估阶段已填写字段
- 提交后：`currentStage = confirm_order`，`currentTask = Confirm Order [EoR - Onboarding]`

**场景三：Confirm Order 签证信息差异展示（三种场景）**

- 进入条件：`currentStage = confirm_order`，`currentTask = Confirm Order [EoR - Onboarding]`
- 整体沿用现有 Confirm Order 交互，仅 `Visa Requirements` Tab 和 `Confirm Visa Type` step 根据前序选择展示差异内容

#### (2) 关键字段（Attribute）

**Complete Onboarding Info 带入规则**：

| 评估阶段字段 | 带入规则 |
| :--- | :--- |
| Candidate Name、Email、Work Location 等 Candidate Info 字段 | 若 Onboarding 对应字段为空，自动带入；若客户在后续修改，保留最新值并在 Confirm Order 提示 SD 复核差异 |
| Visa Requirements 字段及评估材料 | 关联到同一 Request 的文档区，保留来源标记 |
| SD 评估结论和备注 | 只读，不可被客户覆盖 |

**Confirm Order - Visa Requirements Tab 差异展示**：

| 场景 | 展示内容 |
| :--- | :--- |
| `visaRequired = false` | 只展示 `Is a visa application required? = NO`；不展示 Visa Application Type、Is pre-assessment required?、Confirm Visa Type step |
| `visaRequired = true`，`visaAssessmentRequired = false` | 展示 `Is a visa application required? = YES`、`Visa Application Type`、`Is visa pre-assessment required? = No`；展示 `Confirm Visa Type` step（见下方） |
| `visaRequired = true`，`visaAssessmentRequired = true` | 展示已通过的线上预评估信息，包含 Candidate Info、Visa Requirements、评估材料、Other Remarks；后续 Confirm Visa Type 沿用现有交互 |

**Confirm Visa Type step（仅 `visaAssessmentRequired = false` 场景）**：

| 区域 | 说明 |
| :--- | :--- |
| 页面顶部富文本框 | SD 填写线下预评估沟通过程、判断依据；支持上传附件（如邮件截图） |
| Employment Visa tab | Visa Type（下拉）+ `Within the Issuing Country/Region?`（out of country / in country） |
| Dependant Visa tab | Visa Type（下拉） |
| 材料清单 | 根据 service location、visa application type、visa type 从系统配置取材料清单 |

Tab 展示规则：
- `Visa Application Type = Employment Visa` → 只展示 Employment Visa tab
- `Visa Application Type = Dependant Visa` → 只展示 Dependant Visa tab
- `Visa Application Type = Employment + Dependant` → 展示两个 tab

#### (3) 规则逻辑（核心）

**Supplement → 重新进入审核循环**：
- Client 补料并提交后，Request 回到 `currentStage = visa_assessment`
- SD 可多次退回，Client 可多次补充，循环直到 SD 给出 Approved 或 Not Approved

**字段带入覆盖规则（Complete Onboarding Info）**：
- 评估字段值仅在目标字段为空时自动填入
- 客户修改后，系统保留最新值；Confirm Order 阶段提示 SD 复核与评估阶段的差异
- SD 的评估结论和审批备注不受客户修改影响，作为只读记录保留

**Confirm Order 中评估结论处理**：
- SD 在 Confirm Order 阶段仍可 `Return to Client`（回到 `submit_order` 阶段）
- SD 确认接单并 `Open Service Order` 后，`requestStatus` 从 `Pending` 变为 `Processing`

#### (4) 异常 & 提示

- Complete Onboarding Info 中必填字段未填写时，阻止提交并标红提示对应字段
- SD 在 Confirm Visa Type step 中未填写必要的 Visa Type 时，阻止 Confirm Order 提交
- Supplement 页面若 SD 未填写退回原因，Client 无法知晓需补充内容；建议 Return to Client 时 SD 退回原因必填（可在 Story 2 AC 中约束，此处消费该数据展示）

#### (5) 权限（Permission）

- `Supplement Assessment Materials`：仅 Client HR 可操作
- `Complete Onboarding Info`：Client HR 或 Candidate 可操作（按现有 Onboarding 权限策略）
- `Confirm Order`：仅 SD 可操作
- SD 评估结论在 Request Info 历史记录中对 Client 只读可见
- `Modification Remarks` 卡片对 Client / Candidate 只读展示，不可编辑

---

### 验收清单（Acceptance Criteria）

**场景 – Supplement Assessment Materials**

- AC1：SD `Return to Client` 后，Request 列表该条目 Pending Task 更新为 `Supplement Assessment Materials`
- AC2：Client 进入 `Supplement Assessment Materials` 页面，能看到 SD 填写的退回原因
- AC3：Client 补充字段/材料并提交后，Request Pending Task 重新变为 `Confirm Visa Assessment`，通知 SD

**场景 – Complete Onboarding Info**

- AC4：SD `Assessment Approved` 后，Request Pending Task 更新为 `Complete Onboarding Info`
- AC5：Client/Candidate 进入 `Complete Onboarding Info`，若 SD 填写了审批备注，页面顶部展示 `Modification Remarks` 卡片及备注文本；若 SD 未填写备注，不展示卡片
- AC6：评估阶段的 Candidate Info 字段（如 Work Location、Nationality 等）自动带入 Onboarding 对应字段（目标字段为空时）
- AC7：Client/Candidate 提交后，Request Pending Task 更新为 `Confirm Order [EoR - Onboarding]`

**场景 – Confirm Order 签证信息差异展示**

- AC8：`visaRequired = false` 时，Confirm Order 的 `Visa Requirements` Tab 只展示 `Is a visa application required? = NO`，不展示 `Confirm Visa Type` step
- AC9：`visaRequired = true`，`visaAssessmentRequired = false` 时，Confirm Order 展示 `Confirm Visa Type` step；step 顶部有富文本框；Employment Visa tab 含 `Within the Issuing Country/Region?` 字段；材料清单根据 visa type 带出
- AC10：`visaRequired = true`，`visaAssessmentRequired = true` 时，Confirm Order 中可查看线上预评估 Candidate Info、Visa Requirements、评估材料及 Other Remarks
- AC11：SD 在 Confirm Order 完成接单并 Open Service Order 后，`requestStatus` 变为 `Processing`

**场景 – 异常路径（Edge Cases）**

- AC1：Complete Onboarding Info 必填字段未填时，提交被阻止，对应字段标红提示
- AC2：客户在 Complete Onboarding Info 修改了评估阶段带入的字段值后，Confirm Order 阶段展示差异提示，提示 SD 复核
