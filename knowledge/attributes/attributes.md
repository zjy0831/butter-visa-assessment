# Attributes 属性管理

> 适合读者：产品、业务、研发、测试  
> 代码范围：`service-online-webui-monorepo` 前端属性管理页，`dukang-service-online` 后端 basic/service/compute 相关模块

## 1. 业务定位

Attributes 是 Butter 中用于描述业务对象字段、表单字段、访问控制、数据脱敏、系统集成映射和动态渲染规则的基础能力。它不只是“字段配置”，而是多个业务表单和业务流程共用的元数据层。

核心对象关系如下：

| 概念 | 说明 |
| --- | --- |
| Attribute | 单个业务字段，如姓名、工作地点、合同、签证、附件、公式字段等 |
| Schema | 某个业务对象或 reference 下的一组属性配置 |
| Group | Schema 下的属性分组，用于表单分区和管理页分组展示 |
| referenceId | Schema 的归属对象，可能是系统、location、project 等 |
| businessTag | 业务线标识，例如 EOR/PEO、POB、GPO、Global Visa |
| versionTab / applicableServiceVersion | EOR 属性版本，当前主要是 `V1` 和 `V2` |

前端管理入口主要在：

- `app/service-delivery/src/router/modules/settings/system/index.ts`
- `app/service-delivery-app/src/pages/settings/system/system-attributes/index.vue`
- `app/service-delivery-app/src/pages/settings/system/location-attributes/index.vue`
- `app/service-delivery-app/src/pages/settings/system/project-attributes/index.vue`
- `common/components-v3/src/packages/SystemSettings/*`

后端能力主要在：

- `modules/basic.gateways/.../SchemasApi.java`
- `modules/basic.gateways/.../EORAttributeController.java`
- `modules/basic.gateways/.../BusinessAttributeController.java`
- `modules/basic.gateways/.../GPOAttributeController.java`
- `modules/basic.gateways/.../GlobalVisaAttributeController.java`
- `modules/basic.gateways/.../BatchUpdateAttributeController.java`
- `modules/basic.gateways/.../ImportAttributeController.java`

## 2. 管理视图

### 2.1 System Attributes

System Attributes 是系统级属性模板，作为 location 或业务对象属性的来源。页面位于：

- `common/components-v3/src/packages/SystemSettings/SystemAttributes/index.vue`
- `common/components-v3/src/packages/SystemSettings/SystemAttributes/components/AttributeView.vue`

当前 System Attributes 顶层按业务线切换：

| Tab | businessTag / referenceId | 说明 |
| --- | --- | --- |
| EOR/PEO | `systemId` / `systemIdV2` | EOR 系统属性，带 V1/V2 子视图 |
| POB | `pobSystemId` | Contractor / POB 系统属性 |
| GPO | `gpoSystemId` | Payroll outsourcing 系统属性 |
| Global Visa | `globalVisaSystemId` | Global Visa 系统属性 |

EOR System Attributes 额外有 V1/V2 子 tab：

- V1：`BusinessTabs.systemId`，后端 referenceId 为 `systemId`，`versionTab=V1`
- V2：`BusinessTabs.eorSystemId`，后端 referenceId 为 `systemIdV2`，`versionTab=V2`

前端通过 `useAttributesData()` 统一计算 `versionTab`：

- `businessTag === systemIdV2` 时固定为 `V2`
- `businessTag === systemId` 时固定为 `V1`
- location 等场景使用外部传入的 tab 值

### 2.2 Location Attributes

Location Attributes 是某个国家、地区或 location 下真正参与 EOR 表单渲染的属性配置。页面位于：

- `common/components-v3/src/packages/SystemSettings/LocationAttributes/index.vue`

页面左侧是 location 树，右侧是当前 location 的属性 schema。每个 location 下有 V1/V2 tab：

- `activeTab=V1` 查询和管理 V1 schema
- `activeTab=V2` 查询和管理 V2 schema

Location 的每个节点会展示两个版本的属性数量：`eorAttributeCount.V1` 和 `eorAttributeCount.V2`。切换 tab 后，列表、分组、排序、删除、复制、导入都会带当前 `versionTab`。

### 2.3 Project Attributes

Project Attributes 当前用于 POB 项目级属性。页面位于：

- `common/components-v3/src/packages/SystemSettings/ProjectAttributes/index.vue`
- `common/components-v3/src/packages/SystemSettings/ProjectAttributes/detail.vue`

Project Attributes 的主流程：

1. 按 service type 过滤 POB 项目。
2. 为项目初始化 attribute mapping。
3. 进入项目详情维护 project-level group 和 attribute。
4. 系统级属性不可直接编辑或删除，项目级自定义属性可维护。

目前 Project Attributes 不走 EOR 的 V1/V2 子 tab 分流，主要通过 `businessId/projectId` 访问业务 schema。

## 3. 核心业务功能

### 3.1 Schema 查询、创建、复制和删除

Schema 是属性管理的容器。前端 API 在 `common/api/src/schema.ts`：

| 功能 | 前端 API | 后端接口 |
| --- | --- | --- |
| 查询 schema | `getSchemas` | `GET /schemas?referenceId=&versionTab=` |
| 创建 schema | `addSchemas` | `POST /schemas` |
| 更新 schema | `putSchemas` | `PUT /schemas` |
| 复制 location schema | `copySchemas` | `POST /schemas/duplicate` |
| 删除 schema | `deleteSchemas` | `DELETE /schemas/{id}` |
| 按 object type 过滤 | `filterSchemas` | `POST /schemas/filter` |
| 查询属性树 | `getAttributesTree` | `GET /schemas/attribute-tree` |

后端 `SchemasApi.get()` 默认 `versionTab=V1`，因此未传版本时按 V1 兼容。

### 3.2 Attribute 新增和编辑

不同业务线使用不同 controller，但前端通过 `useAttributesData()` 做统一分发。

| 场景 | 新增接口 | 编辑接口 |
| --- | --- | --- |
| EOR System | `POST /attributes/eor/system` | `PUT /attributes/eor/system` |
| EOR Location | `POST /attributes/eor/location` | `PUT /attributes/eor/location` |
| POB System | `POST /attributes/business/system/pob/attribute` | `PUT /attributes/business/system/pob/attribute` |
| POB Project | `POST /attributes/business/project/attribute` | `PUT /attributes/business/project/attribute` |
| GPO System | `POST /attributes/gpo/system` | `PUT /attributes/gpo/system` |
| Global Visa System | `POST /attributes/global-visa/system` | `PUT /attributes/global-visa/system` |

常见字段能力包括：

- 基础信息：name、code、type、description、filling example。
- 表单行为：required、new row、schema data。
- 访问控制：candidate、employee、client contact、local service、SD 等角色可见/可编辑配置。
- 数据治理：data masking、data purge。
- 集成：HRMS integration、HRMS code。
- 业务适用性：candidate visit、employee visit、applicable service versions。

### 3.3 分组管理

Group 用于管理属性在表单和管理页中的分区。支持：

- 新增 group。
- 编辑 group 名称和 i18n。
- 删除空 group。
- 调整 group 下 attribute 顺序。
- 在 system/location/project 不同层级使用相同的 group 结构。

主要接口：

- `PUT /schemas`
- `PUT /schemas/{id}/update-group-name`
- `DELETE /schemas/{id}/{groupId}`
- `PUT /schemas/{id}/group`
- `PUT /schemas/{id}/group-without-sync-location`

### 3.4 排序

排序由 `AttributesSortDialog` 维护，本质是更新 schema groups 内的 attributeIds 顺序。System、Location、Project 都复用同一套排序组件。

排序对表单渲染和管理页展示都有影响。Location 排序会按当前 `versionTab` 处理，避免 V1/V2 相互影响。

### 3.5 Record / Children / Nodes 管理

部分 Attribute 类型是复合结构，例如：

- Contract
- WorkVisa
- IdentityRecords
- Manager
- Dependant

这类属性会带 children 或 nodes。管理页通过 `AttributesRecordDialog` 进入子属性管理。

特殊点：

- 普通 record 使用 `children`。
- `dependant` 同时可能有 `children` 和 `nodes`，页面提供两个入口。
- 子属性可用于复杂表单嵌套、签证/家属/合同等场景。

### 3.6 System 同步到 Location

EOR System Attributes 支持同步到 Location Attributes。相关前端组件：

- `SyncAttributesDialog.vue`
- `AttributeView.vue`
- `BatchUpdateDialog.vue`

主要接口：

- `PUT /attributes/eor/system/sync`
- `GET /attributes/eor/system/sync-fields?versionTab=`
- `POST /attributes/eor/system/children/batch-sync-child-to-location`

同步支持选择字段范围，后端通过 `SyncAttributeFields` 控制哪些字段可同步到 V1/V2。部分字段只适用于 V1，例如 quick create candidate。

### 3.7 V1/V2 版本互相添加

EOR System Attributes 支持把一个版本中可添加的属性加入到当前版本。相关能力：

- 查询可添加属性：`GET /attributes/eor/system/addable-attribute?versionTab=`
- 确认添加：`POST /attributes/eor/system/addable-attribute-confirm`
- 修改适用版本：`POST /attributes/eor/system/update-applicable-service-version`

后端版本映射定义在 `EORSystemAttributeVersion`：

| version | referenceId |
| --- | --- |
| V1 | `systemId` |
| V2 | `systemIdV2` |

### 3.8 批量更新

批量更新用于批量修改属性字段，如访问控制、脱敏、数据清理、适用性等。相关组件：

- `BatchUpdateDialog.vue`
- `BatchUpdateTable.vue`

主要接口：

- `GET /attributes/{businessTag}/setting-fields?versionTab=`
- `PUT /attributes/{businessTag}/batch-update`

批量更新字段由后端按业务线和版本返回，前端按返回配置动态生成表格。

### 3.9 语言导入和模板导出

属性支持通过 Excel 模板导出和导入 i18n 文案。入口包括 System、Location、Project 的 `language-import.vue`。

主要接口：

- `POST /attributes/import/template`
- `POST /attributes/import`
- `POST /attributes/import/{id}/confirm`

导入参数包含：

- `referenceId`
- `businessTag`
- `versionTab`

导入确认后，System Attributes 可能触发同步提醒，用于将名称、备注等字段同步到 location。

### 3.10 Linkage Attribute

Linkage Attribute 用于配置属性之间的联动关系。相关组件：

- `AttributesLinkDialog.vue`

主要接口：

- `GET /schemas/linkage-attributes`
- `POST /schemas/linkage-attributes/validation`

后端会校验联动关系是否成环，避免表单依赖出现循环。

### 3.11 Data Masking / Data Purge

属性可配置数据脱敏和数据清理能力。前端通过 `getDataMaskingRule()` 判断当前 attribute type 或 key 是否允许显示脱敏配置。

主要接口：

- `GET /attributes/data-masking-rule`

实际脱敏执行在 data masking 模块和业务数据读取链路中完成，属性管理负责定义字段级策略。

### 3.12 Quick Create Candidate

EOR 属性支持 quick create candidate 配置，常用于候选人快速创建场景。主要接口：

- `PUT /attributes/eor/location/update-quick-create-candidate-value`
- `PUT /attributes/eor/system/update-quick-create-candidate-value`

从当前同步字段定义看，quick create candidate 主要保留在 V1 范围。

### 3.13 表格列配置

属性管理页的表格列不是写死的，而是通过 table schema 动态获取：

- `domainType=Attribute`
- `filter.businessTag`
- `filter.versionTab`
- `filter.scope`

前端入口在：

- `common/components-v3/src/packages/SystemSettings/SystemAttributes/hooks/useCustomTable.ts`

这意味着 V1/V2、System/Location、不同业务线可拥有不同的管理表头配置。

## 4. 后端领域模型和存储规则

### 4.1 Schema 版本隔离

后端 `Schema` 持有 `applicableServiceVersion`。查询和创建时按 `referenceId + applicableServiceVersion` 定位 schema。

默认版本是 `V1`，用于兼容历史数据。

### 4.2 referenceId 解析

`Schema.getRealReferenceId()` 会处理不同层级：

- `systemId` 和 `systemIdV2` 直接映射到系统 schema。
- location 会向上查找父级中已创建 schema 的节点。
- POB project 如果没有项目 schema，会回退到 `pobSystemId`。

这解释了为什么 location/project 可能在没有本级 schema 时展示系统或父级继承内容。

### 4.3 删除规则

删除行为按层级不同而不同：

- System attribute 删除会从系统 schema 中移除，并影响对应系统属性。
- Location attribute 删除只删除当前 location/version 下的属性。
- Project attribute 只允许删除 project-level 自定义属性，系统级属性不能直接删。
- Group 通常要求为空后才能删除。

### 4.4 同步规则

System 到 Location 同步不是简单覆盖全量字段，而是按后端同步字段配置执行。`SyncAttributeFields` 定义字段、分组和适用版本，避免 V1/V2 或不同业务场景之间互相污染。

## 5. 业务消费场景

### 5.1 候选人、员工、合同相关表单

Candidate、Employee、Contractor 等页面通过 schema 动态渲染字段。前端常见入口：

- `custom-form-renderer/attributesToSchema`
- `schema-descriptions`
- candidate / employee / contractor form 页面

属性配置决定：

- 表单字段类型。
- 字段必填。
- 字段展示顺序和分组。
- 角色访问控制。
- 嵌套 record 字段结构。

### 5.2 Service Bundle 和 Project

Service Bundle 会携带 `applicableServiceVersion`，后续候选人、员工、schedule、order 等流程会按该版本读取对应 schema。

相关接口示例：

- `/service-bundles/bundle-control-attributes`
- `/service-bundles/advanced-settings/attribute-groups`

### 5.3 Calendar / Schedule

Schedule V2 和日历流程会按 project、service bundle、service flow 等上下文读取字段配置，用于任务表单、审批配置、批量导入导出等场景。

### 5.4 Payroll / Payslip

Payroll 和 Payslip 会读取属性数据作为计算、展示或修复依据。知识库中 payroll 文档已有说明：计算引擎通过 `/attribute/calculate` 提供属性计算能力。

相关前端 API：

- `common/api/src/formular.ts`
- `POST /attribute/calculate`

### 5.5 Payout

Payout 会使用属性映射生成第三方 payout schema，进行 Swift Code、银行字段、校验等能力。

相关入口：

- `common/api/src/projects.ts` 中 `/payout/schema`
- 后端 `payout.application` 下的 `PayoutAttributeMapping`、`ThirdPartyAttributeSchemaUseCase`

### 5.6 HRMS / Integration

属性中的 HRMS integration、HRMS code、API source 映射用于外部系统字段对接。

相关接口：

- `/api-source/{businessTag}/attribute-and-type`
- `/integration-source/{businessTag}/attribute-and-type`

### 5.7 Data Masking

属性级 data masking 配置会被 data masking 模块消费，用于敏感字段展示和解密流程。

## 6. API 总览

| 能力 | 主要接口 |
| --- | --- |
| Schema 查询/维护 | `/schemas` |
| Schema 复制 | `/schemas/duplicate` |
| Group 改名/删除 | `/schemas/{id}/update-group-name`, `/schemas/{id}/{groupId}` |
| EOR System Attribute | `/attributes/eor/system` |
| EOR Location Attribute | `/attributes/eor/location` |
| EOR System 同步 | `/attributes/eor/system/sync` |
| EOR V1/V2 添加 | `/attributes/eor/system/addable-attribute`, `/attributes/eor/system/addable-attribute-confirm` |
| POB System/Project Attribute | `/attributes/business/...` |
| GPO Attribute | `/attributes/gpo/system` |
| Global Visa Attribute | `/attributes/global-visa/system` |
| 批量更新 | `/attributes/{businessTag}/setting-fields`, `/attributes/{businessTag}/batch-update` |
| 语言导入/模板 | `/attributes/import`, `/attributes/import/template`, `/attributes/import/{id}/confirm` |
| Data Masking Rule | `/attributes/data-masking-rule` |
| Linkage Attribute | `/schemas/linkage-attributes`, `/schemas/linkage-attributes/validation` |
| 属性计算 | `/attribute/calculate` |

## 7. 关键规则和注意事项

1. EOR V1/V2 是 schema 和 attribute 管理的核心隔离维度，不能只看 referenceId。
2. System Attributes 的 V2 通过 `systemIdV2` 判断，Location Attributes 通过页面 `activeTab` 判断。
3. 所有影响 EOR schema 的操作都应带 `versionTab`，否则后端默认 V1。
4. Project Attributes 当前不走 EOR V1/V2 tab，主要按 project/businessId 管理。
5. Record 类型属性需要同时关注父属性和 children/nodes 子属性。
6. System 到 Location 的同步是可选择字段的同步，不是全量无条件覆盖。
7. 表格列配置也按 `businessTag/versionTab/scope` 区分，排查字段缺失时要同时看 table schema。
8. Attribute 配置会影响多个业务链路，修改前应评估表单渲染、导入导出、HRMS 集成、数据脱敏、service bundle 版本等下游影响。

## 8. 排查入口

| 问题 | 优先查看 |
| --- | --- |
| 管理页没有显示某个字段 | schema 查询结果、group.attributeIds、table schema 配置 |
| V1/V2 数据不一致 | `versionTab`、`systemId/systemIdV2`、schema.applicableServiceVersion |
| Location 没有字段 | location 是否创建 schema、是否继承父级、是否同步到当前版本 |
| Project 字段不可编辑 | 字段 level 是否为 system |
| 导入后文案未变化 | import confirm 是否执行、referenceId/businessTag/versionTab 是否正确 |
| 同步后字段没变化 | sync fields 是否包含该字段、当前版本是否适用 |
| 表单渲染异常 | attribute type、schemaData、children/nodes、访问控制配置 |

