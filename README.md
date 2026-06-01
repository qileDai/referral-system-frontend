# 企业内推与推荐奖励系统

一个完整的企业内部推荐招聘管理系统，支持岗位管理、内推人管理、候选人管理、面试流程跟踪、奖励规则配置和奖励发放等功能。

## 技术栈

- **后端**: Django 4.2 + Django REST Framework + SQLite
- **前端**: React 18 + TypeScript + Ant Design 5
- **图表**: Ant Design Charts
- **认证**: Token Authentication

## 功能模块

### 1. 岗位管理
- 岗位发布、编辑、关闭
- 部门管理
- 薪资范围设置
- 招聘人数管理
- 岗位状态跟踪

### 2. 内推人管理
- 内推人注册与管理
- 推荐统计（总推荐数、成功数、转化率）
- 奖励金额统计
- 部门归属

### 3. 候选人管理
- 候选人信息录入
- 学历、工作经验管理
- 简历管理
- 候选人详情查看

### 4. 内推记录
- 内推流程跟踪
- 状态流转（已提交 → 筛选中 → 面试中 → 已发Offer → 已接受 → 已入职）
- 状态变更历史
- 面试安排

### 5. 面试管理
- 面试安排（电话、视频、现场、技术、行为、终面）
- 面试结果记录
- 面试官反馈
- 评分系统

### 6. 奖励规则
- 固定金额奖励
- 阶梯奖励
- 触发条件设置（入职时、转正后、满3/6个月等）
- 适用岗位/部门配置

### 7. 奖励发放
- 奖励计算
- 发放方式管理（工资、奖金、礼品卡、现金）
- 发放状态跟踪
- 代扣税额计算

### 8. 统计报表
- 内推转化率统计
- 月度推荐趋势
- 状态分布分析
- Top内推人排行
- 奖励金额统计

## 测试账号

- **管理员**: admin / admin123
- **HR用户**: hruser / hr123456

## 快速启动

### 方式一：使用 Docker（推荐）

```bash
# 构建并启动
docker-compose up --build

# 访问地址
# 前端页面: http://localhost:8000
# 管理后台: http://localhost:8000/admin
```

### 方式二：本地开发环境

**环境要求：**
- Python 3.8+
- Node.js 16+
- SQLite（内置，无需额外安装）

**启动步骤：**

```bash
# 1. 克隆项目后进入目录
cd referral-system

# 2. 后端设置
cd backend
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# 3. 数据库初始化
python3 manage.py migrate
python3 manage.py init_data  # 创建测试数据

# 4. 启动后端服务
python3 manage.py runserver 0.0.0.0:8000

# 5. 前端设置（新终端窗口）
cd frontend
npm install --legacy-peer-deps  # 注意：需要此参数解决依赖冲突

# 6. 启动前端服务
npm start
```

**访问地址：**
- 前端页面: http://localhost:3000
- 后端API: http://localhost:8000/api/
- 管理后台: http://localhost:8000/admin

**测试数据：**
系统已预置完整的测试数据：
- 8个部门（技术部、产品部、设计部等）
- 10个岗位（前端工程师、后端工程师、产品经理等）
- 8个内推人
- 30个候选人
- 18条内推记录（包含完整的状态流转）
- 4个奖励规则
- 多条面试记录和奖励记录

## 项目结构

```
.
├── backend/                    # Django 后端
│   ├── core/                   # 核心应用
│   │   ├── models.py           # 数据模型
│   │   ├── views.py            # API视图
│   │   ├── serializers.py      # 序列化器
│   │   ├── urls.py             # 路由配置
│   │   └── management/         # 管理命令
│   │       └── commands/
│   │           └── init_data.py # 初始化数据
│   ├── referral_system/        # 项目配置
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── manage.py
│   └── requirements.txt
├── frontend/                   # React 前端
│   ├── src/
│   │   ├── pages/              # 页面组件
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Positions.tsx
│   │   │   ├── Referrers.tsx
│   │   │   ├── Candidates.tsx
│   │   │   ├── Referrals.tsx
│   │   │   └── Rewards.tsx
│   │   ├── services/           # API服务
│   │   │   └── api.ts
│   │   ├── types/              # TypeScript类型
│   │   │   └── index.ts
│   │   ├── App.tsx
│   │   └── index.tsx
│   ├── package.json
│   └── tsconfig.json
├── Dockerfile
├── docker-compose.yml
├── start.sh                    # 完整启动脚本
├── start-backend.sh            # 仅后端启动脚本
└── README.md
```

## 核心数据模型

### Department（部门）
- 部门名称、编码、描述
- 层级关系（上级部门）

### Position（岗位）
- 岗位名称、编码、描述
- 任职要求、工作职责
- 薪资范围、招聘人数
- 工作类型（全职/兼职/实习/合同）
- 状态（开放/暂停/关闭/已招满）

### Referrer（内推人）
- 员工信息（工号、姓名、邮箱、电话）
- 所属部门
- 统计数据（总推荐、成功推荐、转化率、总奖励）

### Candidate（候选人）
- 基本信息（姓名、性别、年龄）
- 联系方式（邮箱、电话）
- 教育背景（学历、学校、专业）
- 工作经验（年限、当前公司、职位）

### Referral（内推记录）
- 内推编号（自动生成）
- 关联岗位、内推人、候选人
- 状态流转跟踪
- 推荐来源、关系说明
- 状态变更历史

### Interview（面试）
- 面试类型、轮次
- 预约时间、时长
- 面试官信息
- 结果、评分、反馈

### RewardRule（奖励规则）
- 规则名称、描述
- 奖励类型（固定/百分比/阶梯）
- 触发条件
- 延迟天数
- 适用岗位/部门

### Reward（奖励发放）
- 奖励编号
- 关联内推记录
- 金额、状态
- 发放方式、日期
- 支付参考号

## API 接口

### 认证
- `POST /api/auth/login/` - 登录
- `GET /api/auth/user/` - 获取当前用户

### 部门管理
- `GET/POST /api/departments/` - 部门列表/创建
- `GET/PUT/DELETE /api/departments/{id}/` - 部门详情/更新/删除

### 岗位管理
- `GET/POST /api/positions/` - 岗位列表/创建
- `GET/PUT/DELETE /api/positions/{id}/` - 岗位详情/更新/删除
- `GET /api/positions/active/` - 活跃岗位

### 内推人管理
- `GET/POST /api/referrers/` - 内推人列表/创建
- `GET/PUT/DELETE /api/referrers/{id}/` - 详情/更新/删除
- `GET /api/referrers/top/` - Top内推人
- `GET /api/referrers/{id}/stats/` - 统计数据

### 候选人管理
- `GET/POST /api/candidates/` - 候选人列表/创建
- `GET/PUT/DELETE /api/candidates/{id}/` - 详情/更新/删除

### 内推记录
- `GET/POST /api/referrals/` - 内推列表/创建
- `GET/PUT/DELETE /api/referrals/{id}/` - 详情/更新/删除
- `POST /api/referrals/{id}/update_status/` - 更新状态
- `GET /api/referrals/{id}/history/` - 状态历史
- `POST /api/referrals/{id}/create_interview/` - 创建面试
- `POST /api/referrals/{id}/create_reward/` - 创建奖励

### 面试管理
- `GET/POST /api/interviews/` - 面试列表/创建
- `GET/PUT/DELETE /api/interviews/{id}/` - 详情/更新/删除
- `POST /api/interviews/{id}/update_result/` - 更新结果

### 奖励规则
- `GET/POST /api/reward-rules/` - 规则列表/创建
- `GET/PUT/DELETE /api/reward-rules/{id}/` - 详情/更新/删除
- `GET /api/reward-rules/active/` - 活跃规则

### 奖励发放
- `GET/POST /api/rewards/` - 奖励列表/创建
- `GET/PUT/DELETE /api/rewards/{id}/` - 详情/更新/删除
- `GET /api/rewards/pending/` - 待发放奖励
- `POST /api/rewards/{id}/process_payment/` - 处理发放
- `GET /api/rewards/stats/` - 统计数据

### 仪表板
- `GET /api/dashboard/summary/` - 汇总数据
- `GET /api/dashboard/recent_activity/` - 最近活动

## 状态流转

```
已提交 (submitted)
    ↓
筛选中 (screening)
    ↓
面试中 (interviewing)
    ↓
已发Offer (offer_sent)
    ↓
已接受Offer (offer_accepted)
    ↓
已入职 (hired)
```

其他终止状态：
- 已拒绝 (rejected)
- 已撤回 (withdrawn)

## 已验证的核心功能

✅ **用户认证**
- 登录/登出功能正常
- Token认证机制工作正常
- 权限控制有效

✅ **仪表板**
- 统计数据正确显示（总推荐数、入职数、转化率等）
- 月度趋势图表正常渲染
- 状态分布图表正常显示
- Top内推人排行正确

✅ **岗位管理**
- 岗位列表、创建、编辑、删除功能正常
- 岗位状态管理有效
- 部门关联正确

✅ **内推人管理**
- 内推人信息管理功能完整
- 统计数据准确（推荐数、成功数、转化率）
- 奖励金额统计正确

✅ **候选人管理**
- 候选人信息录入和管理功能正常
- 表单验证有效
- 详情查看功能完整

✅ **内推记录**
- 内推流程跟踪功能完整
- 状态流转正常（已提交→筛选中→面试中→已发Offer→已接受→已入职）
- 状态变更历史记录正确
- 面试安排功能正常

✅ **奖励管理**
- 奖励规则配置功能完整
- 奖励发放管理正常
- 统计数据准确

✅ **前后端联调**
- 所有API接口正常响应
- 前端正确调用后端接口
- 数据格式一致
- 错误处理完善

## 开发说明

### 添加新的管理命令

在 `backend/core/management/commands/` 目录下创建新的 Python 文件，继承 `BaseCommand`：

```python
from django.core.management.base import BaseCommand

class Command(BaseCommand):
    help = '命令描述'

    def handle(self, *args, **kwargs):
        self.stdout.write('执行命令...')
```

执行命令：
```bash
cd backend
python manage.py 命令名
```

### 数据库迁移

```bash
cd backend
python manage.py makemigrations
python manage.py migrate
```

### 创建超级用户

```bash
cd backend
python manage.py createsuperuser
```

## 常见问题

### 1. 前端依赖安装失败
如果遇到依赖冲突错误，请使用：
```bash
npm install --legacy-peer-deps
```

### 2. 数据库迁移问题
如果遇到数据库错误，可以重新初始化：
```bash
cd backend
rm -f db.sqlite3
rm -rf core/migrations/0*.py
python3 manage.py migrate
python3 manage.py init_data
```

### 3. 端口被占用
如果8000或3000端口被占用：
```bash
# 查找并杀掉占用端口的进程
lsof -ti:8000 | xargs kill -9
lsof -ti:3000 | xargs kill -9
```

### 4. 图表不显示
确保已正确安装 @ant-design/charts：
```bash
npm install --legacy-peer-deps @ant-design/charts
```

## 部署说明

### 生产环境配置

1. 修改 `backend/referral_system/settings.py`：
   - 设置 `DEBUG = False`
   - 修改 `SECRET_KEY` 为随机字符串
   - 配置 `ALLOWED_HOSTS`

2. 使用生产级服务器（如 Gunicorn）：
   ```bash
   pip install gunicorn
   gunicorn referral_system.wsgi:application -b 0.0.0.0:8000
   ```

3. 配置 Nginx 反向代理

4. 使用 PostgreSQL 替代 SQLite（生产环境推荐）

## 许可证

MIT License

## 联系方式

如有问题或建议，欢迎提交 Issue 或 PR。
