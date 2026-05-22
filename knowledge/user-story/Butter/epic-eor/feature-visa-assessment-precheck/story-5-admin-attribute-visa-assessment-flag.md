# 【Butter - EOR Onboarding】Attribute 配置新增签证预评估适用标记

---

## 1. 业务背景（Background）

- **现状 (As-Is)**：EOR System Attributes 中的字段通过 `required`、角色访问控制、`applicable service versions` 等维度控制字段的展示和行为，但没有"该字段是否用于签证预评估"这一维度；签证预评估表单的 Candidate Info 字段集目前是写死的默认字段列表，无法通过配置灵活调整。
- **问题 (Pain)**：不同国家/地区的签证评估所需候选人信息可能存在差异，写死字段无法满足后续按地区差异化配置的需求；同时，运营人员无法在不改代码的情况下增减预评估候选人信息字段。
- **目标 (To-Be)**：在 EOR System Attributes 的属性配置中新增 `Used for Visa Assessment` 开关，Admin 可通过配置界面标记哪些字段用于签证预评估；前端签证预评估 Candidate Info 子步骤动态读取该标记进行字段渲染，而非硬编码字段列表。
- **受影响角色**：Admin / 运营配置人员（配置侧）；Client HR（间接受益，预评估表单字段由配置驱动）

**叙事**：当前签证预评估的 Candidate Info 字段集是开发硬编码的，每次调整都需要走代码发布流程，运营团队无法自助维护。本次在 Attribute 配置层引入 `Used for Visa Assessment` 开关，让 Admin 像管理其他字段属性一样管理签证评估所需字段——哪些字段需要进预评估表单，勾选即生效，无需改代码。这也为后续按国家/地区差异化配置预评估字段打下基础。

---

## 2. 本卡范围（Scope）

- **适用角色**：Admin / 运营配置人员
- **适用场景**：在 EOR System Attributes 管理页维护签证预评估候选人信息字段集
- **入口**：Settings → System → System Attributes → EOR/PEO Tab → 属性列表 / 属性编辑表单
- **主流程**：
  1. Admin 进入 EOR System Attributes 管理页
  2. 在属性列表中查看 `Used for Visa Assessment` 列的当前标记状态
  3. 进入单个属性的编辑表单，开启或关闭 `Used for Visa Assessment` 开关并保存
  4. 或通过 Batch Update 批量修改多个属性的该标记
  5. 前端签证预评估 Candidate Info 步骤通过 Schema 查询接口读取标记为 `true` 的字段并渲染
- **Out of scope**：
  - Location Attributes 层面的覆盖（本期在 System 层配置即可，不下沉到 Location 层）
  - `Visa Requirements` 子步骤的字段不通过此机制控制（签证类型、申请地等字段由业务逻辑固定）
  - 按国家/地区差异化配置预评估字段（本期统一使用系统级配置）

---

## 3. 用户故事（User Story）

> 作为 **Admin**，我希望能在 EOR System Attributes 管理页为每个属性配置"是否用于签证预评估"的开关，以便于系统根据配置动态渲染签证预评估的候选人信息字段，而不需要通过代码发布来调整预评估表单的字段集。

---

## 4. Story AC（验收标准）

### 逻辑明细（Details）

#### (1) 页面结构 / 信息架构

**System Attributes 属性列表**：
- 在现有表格中新增 `Used for Visa Assessment` 列
- 列值展示：`Yes` / `No`（或 Toggle 状态图标）
- 该列按 `businessTag / versionTab` 区分展示，仅在 EOR/PEO Tab 下展示（V1 / V2 均展示，因为 V2 是主要目标版本）
- 列配置通过现有 table schema 机制（`domainType=Attribute`）动态获取，不写死

**属性编辑表单**：
- 在现有编辑表单的"业务适用性"区域（现有 `candidate visit`、`employee visit`、`applicable service versions` 等开关附近）新增 `Used for Visa Assessment` 开关（Toggle）
- 默认值：`false`（新建属性默认不用于签证评估）
- 保存后立即生效

**Batch Update**：
- 现有批量更新（`BatchUpdateDialog`）中新增 `Used for Visa Assessment` 字段，支持批量将多个属性的该标记设为 `true` 或 `false`
- 批量更新字段通过现有 `GET /attributes/{businessTag}/setting-fields` 接口返回，后端新增该字段到返回列表

#### (2) 关键字段（Attribute）

| 字段 | 类型 | 默认值 | 存储位置 | 说明 |
| :--- | :--- | :--- | :--- | :--- |
| `usedForVisaAssessment` | Boolean | `false` | Attribute 实体 | 标记该属性是否用于签证预评估 Candidate Info 步骤渲染 |

**接口变更**：

| 接口 | 变更说明 |
| :--- | :--- |
| `POST /attributes/eor/system` | 新增 `usedForVisaAssessment` 字段 |
| `PUT /attributes/eor/system` | 新增 `usedForVisaAssessment` 字段 |
| `GET /attributes/{businessTag}/setting-fields` | 在返回字段列表中新增 `usedForVisaAssessment` 供 Batch Update 使用 |
| `PUT /attributes/{businessTag}/batch-update` | 支持批量更新 `usedForVisaAssessment` |
| Schema 查询接口（`GET /schemas?referenceId=&versionTab=`） | 在 attribute 数据中透出 `usedForVisaAssessment`，供前端签证预评估表单消费 |

**System 同步到 Location**：
- `usedForVisaAssessment` 字段纳入现有 System → Location 同步字段范围（`SyncAttributeFields`），与其他字段同步规则一致

#### (3) 规则逻辑（核心）

**配置侧**：
- Admin 在编辑表单中开启/关闭 `Used for Visa Assessment` 开关后点击保存，立即生效
- Batch Update 中批量修改后，批量写入对应属性记录

**消费侧（签证预评估 Candidate Info 步骤）**：
- 前端通过 Schema 查询接口获取 EOR V2 System Attributes（或对应 Location Attributes）
- 过滤 `usedForVisaAssessment = true` 的字段，按字段在 schema 中的排序渲染 Candidate Info 表单
- 若无任何字段标记为 `true`，Candidate Info 步骤展示空状态提示（`No fields configured for visa assessment. Please contact your administrator.`）

**版本归属**：
- 本期主要在 EOR V2（`systemIdV2`）层面配置；V1 暂不强制要求，但开关在 V1 表单中同样展示，方便后续扩展
- 带 `versionTab` 参数时，接口按版本隔离返回，不跨版本混用

#### (4) 异常 & 提示

- 如果 Admin 将所有预评估字段的 `Used for Visa Assessment` 关闭，导致 Candidate Info 步骤无字段可渲染，前端展示空状态提示，不阻止配置保存，但建议 Admin 保持至少一个字段开启
- Batch Update 时，若选中属性中包含不支持该字段的类型，后端返回对应属性的跳过记录，前端展示操作结果摘要

#### (5) 权限（Permission）

- 仅 Admin / 运营配置人员可查看和修改 `Used for Visa Assessment` 配置
- SD 和 Client 不可见该配置项
- 配置变更不需要审批，保存即生效

---

### 验收清单（Acceptance Criteria）

**场景 – 主路径（Happy Path）**

- AC1：EOR System Attributes 属性列表新增 `Used for Visa Assessment` 列，展示每个属性的当前标记状态（Yes / No）
- AC2：进入单个属性编辑表单，在业务适用性区域能看到 `Used for Visa Assessment` 开关，默认为关闭（false）
- AC3：Admin 开启开关并保存后，属性列表对应行的 `Used for Visa Assessment` 列更新为 `Yes`
- AC4：Batch Update 弹窗中展示 `Used for Visa Assessment` 字段，支持批量设为开启或关闭
- AC5：Schema 查询接口返回结果中包含 `usedForVisaAssessment` 字段
- AC6：签证预评估 Candidate Info 步骤只渲染 `usedForVisaAssessment = true` 的字段，且按 schema 中的字段排序展示
- AC7：System Attributes 同步到 Location 时，`usedForVisaAssessment` 字段随其他字段一起同步

**场景 – 异常路径（Edge Cases）**

- AC1：所有属性的 `Used for Visa Assessment` 均为 false 时，签证预评估 Candidate Info 步骤展示空状态提示，不展示空表单
- AC2：Batch Update 批量操作部分属性不支持该字段时，前端展示操作结果摘要，列明成功和跳过的属性数量
- AC3：新建属性时，`Used for Visa Assessment` 开关默认为关闭，不会意外将新字段加入预评估表单
