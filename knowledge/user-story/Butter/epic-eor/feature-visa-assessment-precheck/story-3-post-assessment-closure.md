# 【Butter - EOR Onboarding】预评估通过后续闭环

***

## 1. 业务背景（Background）

- **目标 (To-Be)**：SD 签证预评估通过后，同一个 Request 继续流转：客户直接在 `Complete Onboarding Info` 中补全剩余入职信息（评估字段自动带入），SD 的审批备注展示在页面顶部供参考；Confirm Order 中 SD 可查看完整的签证路径信息；整个闭环在同一个 Request 内完成，无需重复建单。
- **受影响角色**：Client HR、Candidate、SD

**叙事**：预评估通过只是起点，真正的价值在于让评估结论无缝衔接到后续流程。本次通过三个串联场景实现完整闭环：材料不足时 Client 有清晰的补料页面；评估通过后客户直接在原 Request 上补全信息，不必重头填写；SD 最终在 Confirm Order 中能看到签证路径的全貌，并根据是否走过线上预评估看到差异化的内容。整个过程在单个 Request 内形成闭环，杜绝信息孤岛。

***

## 2. 本卡范围（Scope）

- **适用角色**：Client HR（Supplement Assessment Materials、Complete Onboarding Info）、SD（Confirm Order）
- **适用场景**：SD 退回 Client 补料 → Client 补充重提 → SD 评估通过 → Client 补全 Onboarding 信息 → SD Confirm Order（含三场景签证展示适配）
- **入口**：
  - Supplement：Request Info → 当前节点 `Supplement Assessment Materials`→ `Process`
  - Complete Onboarding Info：Request Info → 当前节点 `Complete Onboarding Info`→ `Process`
  - Confirm Order：Request Info → 当前节点 `Confirm Order`→ `Process`
- **主流程**：
  1. \[可选] SD `Return to Client` → Client 进入补料页补充字段/材料 → 重新提交 → 回到 SD 审核
  2. SD `Assessment Approved` → Request 进入 `Complete Onboarding Info`
  3. Client 进入 `Complete Onboarding Info`，顶部展示 SD 备注，修改相关信息后提交
  4. Request 进入 `confirm_order`，SD 在 Confirm Order 中完成最终接单
- **Out of scope**：
  - SD 处置动作（Return to Client / Approved / Not Approved）——见 Story 2
  - Submit Request Wizard——见 Story 1
  - 批量候选人——见 Story 4

***

## 3. 用户故事（User Story）

> 作为 **Client HR / Candidate**，我希望在签证预评估通过后，能在原 Request 中直接补全剩余的正式 Onboarding 信息（评估阶段填写的内容自动带入，无需重填），以便于 SD 在 Confirm Order 时复核完整的候选人信息和签证评估结论，高效完成接单。

***

## 4. Story AC（验收标准）

### 逻辑明细（Details）

#### (1) 页面结构 / 信息架构

**场景一：Supplement Assessment Materials（补料）**

- 进入条件：SD 在 `Confirm Visa Assessment` 中点击 `Return to Client` → `pendingTask = Supplement Assessment Materials`
- 入口：Request Info → 当前节点 `Supplement Assessment Materials` → `Process`
- 页面内容：直接进入材料补充视图；页面顶部展示 SD 填写的退回原因；Client 在对应字段或材料上完成补充或更新
- 提交后：`pendingTask = Confirm Visa Assessment`；通知 SD 继续评估

**场景二：Complete Onboarding Info**

- 进入条件：SD 在 `Confirm Visa Assessment` 中点击 `Assessment Approved` → `pendingTask = Complete Onboarding Info`
- 入口：Request Info → 当前节点 `Complete Onboarding Info` → `Process`
- 页面顶部：若 SD 在 `Assessment Approved` 二次确认弹窗中填写了备注，展示 `Modification Remarks` 卡片：
  ```
  Modification Remarks
  [SD 填写的审批备注文本]
  ```
  若 SD 未填写备注，不展示该卡片
- 页面主体：沿用现有 `Provide Candidate Information` 信息补全交互，自动带入评估阶段已填写字段，点击Create Candidate & Next 后需在项目中创建该候选人
- 提交后：`pendingTask = Confirm Order`

**场景三：Confirm Order 签证信息差异展示（三种场景）**

- 进入条件：Client 在 `Complete Onboarding Info` 中提交后 → `pendingTask = Confirm Order `  &#x20;
- 整体沿用现有 Confirm Order 交互，仅 `Visa Requirements` Tab 和 `Confirm Visa Type` step 根据前序选择展示差异内容

#### (2) 关键字段（Attribute）

**Complete Onboarding Info 带入规则**：

| 评估阶段字段                                                                         | 带入规则                              |
| :----------------------------------------------------------------------------- | :-------------------------------- |
| 评估阶段的 Basic Candidate Info 字段（Attributes 中`Used for Visa Assessment`为True 的字段） | 默认带入至候选人完整表单信息中                   |
| Visa Requirements 字段及评估材料                                                      | 默认导入至 Collect Visa Requirements 中 |
| SD 评估结论和备注                                                                     | 只读                                |

\*\*Confirm Order \*\*

&#x20;**Confirm Request Info Step- Visa Requirements Tab 差异展示**：

| 场景                                                     | 展示内容                                                                                                                       |
| :----------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------- |
| `visaRequired = false`                                 | 只展示 `Is a visa application required? = NO`                                                                                 |
| `visaRequired = true`，`visaAssessmentRequired = false` | 展示 `Is a visa application required? = YES`、`Visa Application Type`、`Is visa pre-assessment required? = No`                 |
| `visaRequired = true`，`visaAssessmentRequired = true`  | 展示已通过的线上预评估信息，包含 Employment Visa / Dependent Visa 相关的 Candidate Info/Dependent Info、Visa Requirements、Evaluation Materials |

**Confirm Visa Type step（仅** `visaRequired = true` **场景）**：

| 区域                  | 说明                                                                               | 显示条件                             |
| :------------------ | :------------------------------------------------------------------------------- | :------------------------------- |
| 页面顶部富文本框            | SD 填写线下预评估沟通过程、判断依据；支持上传附件（如邮件截图）                                                | `visaAssessmentRequired = false` |
| Employment Visa tab | Visa Type（下拉）+ `Within the Issuing Country/Region?`（out of country / in country） | -                                |
| Dependant Visa tab  | Visa Type（下拉）                                                                    | -                                |
| 材料清单                | 根据 Project Location、Visa  Type 等从系统配置取材料清单（同当前逻辑）                                | -                                |

Tab 展示规则：

- `Visa Application Type = Employment Visa` → 只展示 Employment Visa tab
- `Visa Application Type = Dependant Visa` → 只展示 Dependant Visa tab
- `Visa Application Type = Employment + Dependant` → 展示两个 tab

#### (3) 规则逻辑（核心）

**Supplement → 重新进入审核循环**：

- Client 补料并提交后，`pendingTask = Confirm Visa Assessment`
- SD 可多次退回，Client 可多次补充，循环直到 SD 给出 Approved 或 Not Approved

**Confirm Order 中评估结论处理**：

- SD 在 Confirm Order 阶段仍可 `Return to Client`（回到 `submit_order` 阶段）
- SD 确认接单并 `Open Service Order` 后，`requestStatus` 从 `Pending` 变为 `Processing`

  <br />

***

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

