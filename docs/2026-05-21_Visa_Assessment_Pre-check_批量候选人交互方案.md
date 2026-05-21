# 交互方案：Visa Assessment Pre-check 批量候选人提交

> 本文只描述批量候选人场景。单个候选人场景沿用现有交互细则。
>
> 本期批量模式先按同一批候选人共用同一个 visa 判断路径设计。若后续需要支持同一批候选人中部分需要 visa、部分不需要 visa，需要在候选人维度增加 visa decision 表格。

## 1. 设计目标

Client 可以在一次 `Submit Request` 中添加多个候选人。系统在提交后按候选人拆分为多个 request，每个候选人对应一个 request，后续分别进入 `Confirm Visa Assessment` 或 `Confirm Order [EoR - Onboarding]`。

批量模式不保留 `batchSubmissionId`，不在列表和详情页展示批次关系。

## 2. 总体步骤

Client 仍从现有 submit wizard 进入：

```text
1. Service Module
2. Service Location & Project
3. Collect Work Visa Requirements
   3.1 Add Candidate Mode，不展示左侧小步骤导航
   3.2 Visa Application Type
   3.3 Basic Candidate Info，仅 visa + pre-assessment 时展示
   3.4 Visa Requirements，仅 visa + pre-assessment 时展示
4. Provide Candidate Information，仅不走预评估时展示
5. Other Remarks & Attachment
6. Submit
```

## 3. Collect Work Visa Requirements / Add Candidate Mode

进入 `Collect Work Visa Requirements` 后，先展示候选人添加方式选择页。

该页面不展示左侧 `STEPS` 小步骤导航，只展示模式选择卡片。底部 footer 仍展示 `Cancel / Back / Next`，其中 `Back` 返回上一个主步骤 `Service Location & Project`，`Next` 在选择模式后进入 `Visa Application Type`。

标题：

```text
How would you like to add candidates?
```

副标题：

```text
Choose the method that best fits your needs.
```

选项：

| 选项 | 说明 | 后续处理 |
| --- | --- | --- |
| Add one new hire | 创建单个候选人的 request，逐步填写信息 | 进入现有单候选人交互 |
| Add multiple new hires | 一次添加多个候选人，支持导入或手动新增 | 进入批量候选人交互 |

选择 `Add multiple new hires` 后，点击 `Next` 进入批量 visa 判断。

## 4. Collect Work Visa Requirements / Visa Application Type

批量模式下，该步骤只判断整批候选人的 visa 路径。

该步骤进入后开始展示左侧小步骤导航。说明文案需提醒客户确认这批候选人是 local 还是 expat：如果候选人是 expat 且需要 work authorization，请为这一批候选人办理 visa；如果需要 visa support，请同时确认是否需要 visa pre-assessment。

字段：

| 字段 | 选项 | 展示条件 |
| --- | --- | --- |
| Is a visa application required? | Yes / No | 始终展示 |
| Is visa pre-assessment required? | Yes / No | 选择 `Yes` 需要办理 visa 后展示 |

批量模式下不展示：

```text
Which type of visa do you need to apply for?
```

具体每个候选人的签证类型在后续 `Visa Requirements` 列表的明细中填写。

按钮规则：

- 页面内部只展示 `Continue`，不展示内部 `Back`。
- 点击内部 `Continue` 进入下一个小步骤。
- 底部 footer 的 `Back` 返回 `Add Candidate Mode` 模式选择页。
- 底部 footer 的 `Next` 控制主步骤流转，不用于小步骤内部流转。

## 5. 分支 A：需要 visa，且需要预评估

选择：

```text
Is a visa application required? = Yes
Is visa pre-assessment required? = Yes
```

步骤流转：

```text
Collect Work Visa Requirements / Basic Candidate Info
-> Collect Work Visa Requirements / Visa Requirements
-> Other Remarks & Attachment
-> Submit
```

提交后，每个候选人生成一个 request，并进入：

```text
currentStage = visa_assessment
currentTask = Confirm Visa Assessment
```

### 5.1 Basic Candidate Info 小步骤

该步骤展示为列表形式，用于收集签证预评估所需的候选人基础信息。

标题：

```text
Basic Candidate Info
```

副文案：

```text
Total X candidates added for visa pre-assessment.
```

右上角操作：

```text
Import / Add
```

列表字段：

| 字段 | 说明 |
| --- | --- |
| Candidate Name | 候选人姓名 |
| Candidate Email | 邮箱 |
| Nationality / Citizenship | 国籍 |
| Current Residence | 当前所在地 |
| Work Location | 工作地 |
| Job Title / Position | 岗位 |
| Salary | 薪资 |
| Degree / Education Level | 学历 |
| Expected Start Date | 预计入职日期 |
| Operation | Edit / Remove |

交互规则：

- `Import`：上传 Excel，批量导入候选人预评估基础信息。
- `Add`：手动新增一个候选人。
- `Edit`：编辑单个候选人的预评估基础信息。
- `Remove`：从本次批量提交中移除该候选人。
- 页面内部展示 `Back / Continue`，分别返回 `Visa Application Type` 或进入 `Visa Requirements`。
- 底部 footer 的 `Back / Next` 仍控制主步骤流转。

### 5.2 Visa Requirements 小步骤

该步骤展示为列表形式，用于收集每个候选人的签证申请信息和评估材料。

标题：

```text
Visa Requirements
```

副文案：

```text
Total X candidates require visa pre-assessment.
```

列表字段参考签证申请信息，不再重复展示 `Is a visa application required?`。

该页面不展示 `Import` 和 `Add` 按钮；候选人名单来自上一小步骤的 `Basic Candidate Info`。

| 字段 | 说明 |
| --- | --- |
| Name | 候选人姓名 |
| Which type of visa do you want to apply for? | Employment Visa / Dependant Visa / Employment + Dependant |
| Employment Visa Type | 如 Employment Pass，按候选人明细填写 |
| Dependant Visa Type | 如 Dependent Pass，按候选人明细填写 |
| Within the Issuing Country/Region? | out of country / in country，仅 Employment Visa 相关时展示或填写 |
| Country / Region at the time of Visa application | 申请时所在国家/地区 |
| Departure Country / Region before entering Visa Location | 入境签证地前出发国家/地区 |
| Evaluation Materials | Uploaded / Missing / Not uploaded |
| Operation | Edit / Upload / Remove |

交互规则：

- 每一行对应一个候选人的 visa requirements。
- 除 `Name` 外，其他列应支持 inline editable；下拉项、文本输入和材料状态按字段类型展示。
- `Operation` 列固定展示在表格右侧，横向滚动时保持可见。
- 该步骤不再展示或询问 `Is a visa application required?`，因为整批已经选择 `Yes`。
- 点击 `Edit` 打开该候选人的 visa requirements 明细页。
- 点击 `Upload` 上传或补充该候选人的 evaluation materials。
- 点击 `Remove` 从本次批量提交中移除该候选人。
- 明细页中可填写：
  - `Which type of visa do you want to apply for?`
  - Employment / Dependant 具体 visa type
  - `Within the Issuing Country/Region?`
  - `Country / Region at the time of Visa application`
  - `Departure Country / Region before entering Visa Location`
  - Evaluation materials
- 如果选择 `Employment + Dependant`，该候选人的明细中同时展示 Employment Visa 和 Dependant Visa 信息。
- 页面内部只展示 `Back`，不展示内部 `Continue`；点击内部 `Back` 返回 `Basic Candidate Info`。
- 底部 footer 的 `Next` 进入主步骤 `Other Remarks & Attachment`。

## 6. 分支 B：需要 visa，但不需要预评估

选择：

```text
Is a visa application required? = Yes
Is visa pre-assessment required? = No
```

步骤流转：

```text
Provide Candidate Information
-> Other Remarks & Attachment
-> Submit
```

不展示：

```text
Collect Work Visa Requirements / Basic Candidate Info
Collect Work Visa Requirements / Visa Requirements
```

提交后，每个候选人生成一个 request，并进入：

```text
currentStage = confirm_order
currentTask = Confirm Order [EoR - Onboarding]
```

### 6.1 Provide Candidate Information

该步骤展示为列表形式，用于收集正式 onboarding candidate 信息。

标题：

```text
Provide Candidate Information
```

副文案：

```text
Total X candidates added to this order.
```

右上角操作：

```text
Select / Import / Add
```

列表字段：

| 字段 | 说明 |
| --- | --- |
| Name | 员工姓名 |
| Employee ID | 员工编号 |
| Work Location | 工作地 |
| Email Address | 邮箱 |
| Nationality | 国籍 |
| Onboarding Date | 入职日期 |
| Operation | Edit / Remove |

交互规则：

- `Select`：从已有 candidate / talent pool 选择。
- `Import`：Excel 批量导入正式 onboarding candidate 信息。
- `Add`：手动新增一个候选人。
- `Edit`：编辑完整 onboarding candidate 信息。
- `Remove`：从本次批量提交中移除该候选人。
- `Operation` 列固定展示在表格右侧，横向滚动时保持可见。

Confirm Order 中：

- `Visa Requirements` tab 展示：
  - `Is a visa application required? = YES`
  - `Is visa pre-assessment required? = No`
- SD 在 `Confirm Visa Type` step 中填写线下沟通记录、上传凭证、确认 visa type 和材料清单。

## 7. 分支 C：不需要 visa

选择：

```text
Is a visa application required? = No
```

步骤流转：

```text
Provide Candidate Information
-> Other Remarks & Attachment
-> Submit
```

提交后，每个候选人生成一个 request，并进入：

```text
currentStage = confirm_order
currentTask = Confirm Order [EoR - Onboarding]
```

### 7.1 Provide Candidate Information

该步骤展示为列表形式，与分支 B 一致。

右上角操作：

```text
Select / Import / Add
```

列表字段：

| 字段 | 说明 |
| --- | --- |
| Name | 员工姓名 |
| Employee ID | 员工编号 |
| Work Location | 工作地 |
| Email Address | 邮箱 |
| Nationality | 国籍 |
| Onboarding Date | 入职日期 |
| Operation | Edit / Remove |

Confirm Order 中：

- `Visa Requirements` tab 只展示：
  - `Is a visa application required? = NO`
- 不展示 `Confirm Visa Type` step。
- `Operation` 列固定展示在表格右侧，横向滚动时保持可见。

## 8. Other Remarks & Attachment

三种批量分支都展示 `Other Remarks & Attachment` 主步骤。

建议本期先支持整体备注和整体附件：

| 字段 | 说明 |
| --- | --- |
| Other Remarks | 本次批量提交的整体备注 |
| Attachment | 本次批量提交的整体附件 |

提交拆分为多个 request 时，每个 request 都带同一份 remark 和 attachment。

## 9. Submit 后拆分规则

Client 虽然一次提交，但系统按候选人生成多个 request。

| 批量选择 | 每个候选人生成后的流向 |
| --- | --- |
| 不需要 visa | `Confirm Order [EoR - Onboarding]` |
| 需要 visa，但不需要预评估 | `Confirm Order [EoR - Onboarding]` |
| 需要 visa，且需要预评估 | `Confirm Visa Assessment` |

拆分规则：

- 每个候选人生成一个 request。
- request 继承本次批量提交的 service module、service location、project、remark、attachment。
- 不保留 `batchSubmissionId`。
- 不在 request 列表或详情中展示批次关系。

## 10. 关键交互原则

- 批量模式先选择 `Add one new hire` 或 `Add multiple new hires`。
- 模式选择页不展示左侧小步骤导航。
- 批量模式下不在 `Visa Application Type` 中选择 `Which type of visa do you need to apply for?`。
- 批量模式下 `Is a visa application required?` 决定是否继续展示 `Is visa pre-assessment required?`。
- 只有 `需要 visa + 需要预评估` 才展示批量 `Basic Candidate Info` 和批量 `Visa Requirements`。
- 不走预评估的两种情况，都进入批量 `Provide Candidate Information`。
- 批量页面以列表为主，不在主页面展示单个候选人的长表单。
- `Collect Work Visa Requirements` 内部小步骤使用页面内部按钮流转；底部 footer 的 `Back / Next` 控制主步骤流转。
