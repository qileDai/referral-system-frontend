"""
初始化数据命令
"""
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.utils import timezone
from django.db.models import Sum
from decimal import Decimal
import random
from datetime import timedelta

from core.models import (
    Department, Position, Referrer, Candidate, Referral,
    Interview, RewardRule, Reward, ReferralStatusHistory
)


class Command(BaseCommand):
    help = '初始化系统测试数据'

    def handle(self, *args, **kwargs):
        self.stdout.write('开始初始化数据...')
        
        # 创建超级用户
        self.create_superuser()
        
        # 创建部门
        self.create_departments()
        
        # 创建岗位
        self.create_positions()
        
        # 创建内推人
        self.create_referrers()
        
        # 创建候选人
        self.create_candidates()
        
        # 创建奖励规则
        self.create_reward_rules()
        
        # 创建内推记录
        self.create_referrals()
        
        self.stdout.write(self.style.SUCCESS('数据初始化完成！'))
        self.stdout.write('=' * 50)
        self.stdout.write('测试账号:')
        self.stdout.write('  管理员: admin / admin123')
        self.stdout.write('  HR用户: hruser / hr123456')
        self.stdout.write('=' * 50)

    def create_superuser(self):
        self.stdout.write('创建超级用户...')
        if not User.objects.filter(username='admin').exists():
            User.objects.create_superuser(
                username='admin',
                email='admin@company.com',
                password='admin123',
                first_name='系统',
                last_name='管理员'
            )
            self.stdout.write('  超级用户 admin 创建成功')
        
        if not User.objects.filter(username='hruser').exists():
            User.objects.create_user(
                username='hruser',
                email='hr@company.com',
                password='hr123456',
                first_name='HR',
                last_name='专员',
                is_staff=True
            )
            self.stdout.write('  HR用户 hruser 创建成功')

    def create_departments(self):
        self.stdout.write('创建部门...')
        departments_data = [
            {'name': '技术部', 'code': 'TECH', 'description': '负责产品研发和技术架构'},
            {'name': '产品部', 'code': 'PROD', 'description': '负责产品规划和设计'},
            {'name': '运营部', 'code': 'OPS', 'description': '负责产品运营和用户增长'},
            {'name': '市场部', 'code': 'MKT', 'description': '负责市场推广和品牌建设'},
            {'name': '销售部', 'code': 'SALES', 'description': '负责客户开发和销售'},
            {'name': '人力资源部', 'code': 'HR', 'description': '负责人才招聘和员工发展'},
            {'name': '财务部', 'code': 'FIN', 'description': '负责财务管理和预算控制'},
            {'name': '行政部', 'code': 'ADM', 'description': '负责行政后勤支持'},
        ]
        
        for dept_data in departments_data:
            Department.objects.get_or_create(code=dept_data['code'], defaults=dept_data)
        
        self.stdout.write(f'  创建了 {len(departments_data)} 个部门')

    def create_positions(self):
        self.stdout.write('创建岗位...')
        tech_dept = Department.objects.get(code='TECH')
        prod_dept = Department.objects.get(code='PROD')
        ops_dept = Department.objects.get(code='OPS')
        mkt_dept = Department.objects.get(code='MKT')
        sales_dept = Department.objects.get(code='SALES')
        hr_dept = Department.objects.get(code='HR')
        
        positions_data = [
            {
                'title': '高级Java工程师',
                'code': 'JAVA-SR-001',
                'department': tech_dept,
                'description': '负责核心业务系统开发和架构设计',
                'requirements': '5年以上Java开发经验，熟悉Spring Boot、微服务架构',
                'responsibilities': '系统架构设计、核心模块开发、技术难题攻关',
                'employment_type': 'full_time',
                'location': '北京',
                'min_salary': Decimal('25000'),
                'max_salary': Decimal('40000'),
                'headcount': 3,
                'status': 'open',
            },
            {
                'title': '前端开发工程师',
                'code': 'FE-001',
                'department': tech_dept,
                'description': '负责Web前端开发和用户体验优化',
                'requirements': '3年以上前端开发经验，熟悉React/Vue',
                'responsibilities': '前端页面开发、性能优化、组件库维护',
                'employment_type': 'full_time',
                'location': '北京',
                'min_salary': Decimal('20000'),
                'max_salary': Decimal('35000'),
                'headcount': 2,
                'status': 'open',
            },
            {
                'title': '产品经理',
                'code': 'PM-001',
                'department': prod_dept,
                'description': '负责产品规划和需求分析',
                'requirements': '3年以上产品经验，有B端产品经验优先',
                'responsibilities': '需求分析、产品设计、项目推进',
                'employment_type': 'full_time',
                'location': '北京',
                'min_salary': Decimal('22000'),
                'max_salary': Decimal('38000'),
                'headcount': 2,
                'status': 'open',
            },
            {
                'title': 'UI设计师',
                'code': 'UI-001',
                'department': prod_dept,
                'description': '负责产品界面设计和视觉规范',
                'requirements': '3年以上UI设计经验，精通Figma/Sketch',
                'responsibilities': '界面设计、设计规范制定、设计评审',
                'employment_type': 'full_time',
                'location': '北京',
                'min_salary': Decimal('18000'),
                'max_salary': Decimal('30000'),
                'headcount': 1,
                'status': 'open',
            },
            {
                'title': '运营专员',
                'code': 'OP-001',
                'department': ops_dept,
                'description': '负责用户运营和活动策划',
                'requirements': '2年以上运营经验，有互联网运营背景',
                'responsibilities': '用户运营、活动策划、数据分析',
                'employment_type': 'full_time',
                'location': '北京',
                'min_salary': Decimal('12000'),
                'max_salary': Decimal('20000'),
                'headcount': 2,
                'status': 'open',
            },
            {
                'title': '市场经理',
                'code': 'MKT-001',
                'department': mkt_dept,
                'description': '负责市场推广和品牌建设',
                'requirements': '5年以上市场经验，有B2B市场经验优先',
                'responsibilities': '市场策略制定、品牌推广、活动策划',
                'employment_type': 'full_time',
                'location': '北京',
                'min_salary': Decimal('20000'),
                'max_salary': Decimal('35000'),
                'headcount': 1,
                'status': 'open',
            },
            {
                'title': '销售代表',
                'code': 'SALE-001',
                'department': sales_dept,
                'description': '负责客户开发和销售目标达成',
                'requirements': '2年以上销售经验，有SaaS销售经验优先',
                'responsibilities': '客户开发、商务谈判、合同签订',
                'employment_type': 'full_time',
                'location': '北京',
                'min_salary': Decimal('10000'),
                'max_salary': Decimal('25000'),
                'headcount': 5,
                'status': 'open',
            },
            {
                'title': 'HRBP',
                'code': 'HR-001',
                'department': hr_dept,
                'description': '负责业务部门人力资源支持',
                'requirements': '3年以上HR经验，熟悉HR全模块',
                'responsibilities': '招聘支持、员工关系、绩效管理',
                'employment_type': 'full_time',
                'location': '北京',
                'min_salary': Decimal('15000'),
                'max_salary': Decimal('28000'),
                'headcount': 1,
                'status': 'open',
            },
            {
                'title': '算法工程师',
                'code': 'ALGO-001',
                'department': tech_dept,
                'description': '负责机器学习算法研发',
                'requirements': '硕士以上学历，3年以上算法经验',
                'responsibilities': '算法研发、模型优化、技术预研',
                'employment_type': 'full_time',
                'location': '北京',
                'min_salary': Decimal('30000'),
                'max_salary': Decimal('50000'),
                'headcount': 2,
                'status': 'open',
            },
            {
                'title': '测试工程师',
                'code': 'QA-001',
                'department': tech_dept,
                'description': '负责产品质量保证',
                'requirements': '3年以上测试经验，熟悉自动化测试',
                'responsibilities': '测试用例设计、自动化测试、质量评估',
                'employment_type': 'full_time',
                'location': '北京',
                'min_salary': Decimal('15000'),
                'max_salary': Decimal('28000'),
                'headcount': 2,
                'status': 'open',
            },
        ]
        
        admin_user = User.objects.get(username='admin')
        for pos_data in positions_data:
            Position.objects.get_or_create(code=pos_data['code'], defaults={**pos_data, 'created_by': admin_user})
        
        self.stdout.write(f'  创建了 {len(positions_data)} 个岗位')

    def create_referrers(self):
        self.stdout.write('创建内推人...')
        tech_dept = Department.objects.get(code='TECH')
        prod_dept = Department.objects.get(code='PROD')
        ops_dept = Department.objects.get(code='OPS')
        hr_dept = Department.objects.get(code='HR')
        
        referrers_data = [
            {'employee_id': 'E10001', 'name': '张三', 'email': 'zhangsan@company.com', 'phone': '13800138001', 'department': tech_dept},
            {'employee_id': 'E10002', 'name': '李四', 'email': 'lisi@company.com', 'phone': '13800138002', 'department': tech_dept},
            {'employee_id': 'E10003', 'name': '王五', 'email': 'wangwu@company.com', 'phone': '13800138003', 'department': prod_dept},
            {'employee_id': 'E10004', 'name': '赵六', 'email': 'zhaoliu@company.com', 'phone': '13800138004', 'department': ops_dept},
            {'employee_id': 'E10005', 'name': '钱七', 'email': 'qianqi@company.com', 'phone': '13800138005', 'department': tech_dept},
            {'employee_id': 'E10006', 'name': '孙八', 'email': 'sunba@company.com', 'phone': '13800138006', 'department': hr_dept},
            {'employee_id': 'E10007', 'name': '周九', 'email': 'zhoujiu@company.com', 'phone': '13800138007', 'department': tech_dept},
            {'employee_id': 'E10008', 'name': '吴十', 'email': 'wushi@company.com', 'phone': '13800138008', 'department': prod_dept},
        ]
        
        for ref_data in referrers_data:
            Referrer.objects.get_or_create(employee_id=ref_data['employee_id'], defaults=ref_data)
        
        self.stdout.write(f'  创建了 {len(referrers_data)} 个内推人')

    def create_candidates(self):
        self.stdout.write('创建候选人...')
        
        first_names = ['陈', '刘', '黄', '杨', '林', '何', '高', '罗', '郑', '梁', '谢', '宋', '唐', '许', '韩', '冯', '邓', '曹', '彭', '曾']
        last_names = ['伟', '芳', '娜', '秀英', '敏', '静', '丽', '强', '磊', '军', '洋', '勇', '艳', '杰', '娟', '涛', '明', '超', '秀兰', '霞']
        companies = ['阿里巴巴', '腾讯', '百度', '字节跳动', '美团', '京东', '滴滴', '小米', '网易', '华为']
        schools = ['清华大学', '北京大学', '浙江大学', '复旦大学', '上海交通大学', '南京大学', '中国科学技术大学', '华中科技大学', '武汉大学', '中山大学']
        
        candidates_data = []
        for i in range(30):
            name = random.choice(first_names) + random.choice(last_names)
            candidates_data.append({
                'name': name,
                'email': f'candidate{i+1}@email.com',
                'phone': f'139{str(i+1).zfill(4)}{str(i+1).zfill(4)}',
                'gender': random.choice(['male', 'female']),
                'age': random.randint(24, 40),
                'education': random.choice(['bachelor', 'master', 'phd']),
                'school': random.choice(schools),
                'major': random.choice(['计算机科学', '软件工程', '信息技术', '电子工程', '数学']),
                'work_experience_years': random.randint(1, 12),
                'current_company': random.choice(companies) if random.random() > 0.3 else '',
                'current_position': random.choice(['工程师', '产品经理', '设计师', '运营', '销售']),
            })
        
        for cand_data in candidates_data:
            Candidate.objects.get_or_create(email=cand_data['email'], defaults=cand_data)
        
        self.stdout.write(f'  创建了 {len(candidates_data)} 个候选人')

    def create_reward_rules(self):
        self.stdout.write('创建奖励规则...')
        
        rules_data = [
            {
                'name': '普通岗位入职奖励',
                'description': '普通岗位成功入职后发放固定奖励',
                'reward_type': 'fixed',
                'fixed_amount': Decimal('3000'),
                'trigger_event': 'onboard',
                'delay_days': 0,
                'is_active': True,
            },
            {
                'name': '技术岗位入职奖励',
                'description': '技术岗位成功入职后发放固定奖励',
                'reward_type': 'fixed',
                'fixed_amount': Decimal('5000'),
                'trigger_event': 'onboard',
                'delay_days': 0,
                'is_active': True,
            },
            {
                'name': '高级岗位入职奖励',
                'description': '高级岗位成功入职后发放更高奖励',
                'reward_type': 'fixed',
                'fixed_amount': Decimal('8000'),
                'trigger_event': 'onboard',
                'delay_days': 0,
                'is_active': True,
            },
            {
                'name': '转正后额外奖励',
                'description': '候选人转正后发放额外奖励',
                'reward_type': 'fixed',
                'fixed_amount': Decimal('2000'),
                'trigger_event': 'probation_passed',
                'delay_days': 0,
                'is_active': True,
            },
        ]
        
        for rule_data in rules_data:
            RewardRule.objects.get_or_create(name=rule_data['name'], defaults=rule_data)
        
        self.stdout.write(f'  创建了 {len(rules_data)} 个奖励规则')

    def create_referrals(self):
        self.stdout.write('创建内推记录...')
        
        referrers = list(Referrer.objects.all())
        candidates = list(Candidate.objects.all())
        positions = list(Position.objects.all())
        rules = list(RewardRule.objects.all())
        admin_user = User.objects.get(username='admin')
        
        statuses = ['submitted', 'screening', 'interviewing', 'offer_sent', 'offer_accepted', 'hired', 'rejected']
        status_weights = [0.15, 0.15, 0.2, 0.1, 0.1, 0.2, 0.1]
        
        created_count = 0
        # 创建20条内推记录
        for i in range(20):
            referrer = random.choice(referrers)
            candidate = candidates[i]
            position = random.choice(positions)
            status = random.choices(statuses, weights=status_weights)[0]
            
            # 检查是否已存在该候选人和岗位的内推记录
            if Referral.objects.filter(candidate=candidate, position=position).exists():
                continue
            
            referral = Referral.objects.create(
                candidate=candidate,
                position=position,
                referrer=referrer,
                status=status,
                source=random.choice(['internal', 'alumni', 'partner']),
                relationship=random.choice(['前同事', '同学', '朋友', '其他']),
                referrer_notes='候选人经验丰富，推荐面试',
            )
            created_count += 1
            
            # 创建状态历史
            ReferralStatusHistory.objects.create(
                referral=referral,
                to_status='submitted',
                changed_by=admin_user,
                notes='创建内推记录'
            )
            
            # 如果状态不是submitted，添加状态变更历史
            if status != 'submitted':
                ReferralStatusHistory.objects.create(
                    referral=referral,
                    from_status='submitted',
                    to_status=status,
                    changed_by=admin_user,
                    notes='状态更新'
                )
            
            # 如果状态是面试中或之后，创建面试记录
            if status in ['interviewing', 'offer_sent', 'offer_accepted', 'hired']:
                interview_types = ['phone', 'technical', 'onsite', 'final']
                for j, interview_type in enumerate(interview_types[:random.randint(1, 3)]):
                    Interview.objects.create(
                        referral=referral,
                        interview_type=interview_type,
                        round_number=j + 1,
                        scheduled_at=timezone.now() - timedelta(days=random.randint(1, 30)),
                        duration_minutes=60,
                        interviewer=f'面试官{j+1}',
                        result='passed' if status in ['offer_sent', 'offer_accepted', 'hired'] else 'pending',
                        score=random.randint(7, 10),
                        feedback='候选人表现优秀，技术能力强'
                    )
            
            # 如果已入职，创建奖励记录
            if status == 'hired':
                referral.hired_at = timezone.now() - timedelta(days=random.randint(1, 60))
                referral.save()
                
                rule = random.choice(rules)
                Reward.objects.create(
                    referral=referral,
                    rule=rule,
                    amount=rule.fixed_amount,
                    status=random.choice(['pending', 'paid']),
                    payment_method='salary',
                    payment_date=timezone.now().date() if random.random() > 0.5 else None,
                )
            
            # 更新内推人统计
            referrer.update_statistics()
        
        # 更新所有内推人的奖励总额
        for referrer in referrers:
            total = Reward.objects.filter(
                referral__referrer=referrer,
                status='paid'
            ).aggregate(total=Sum('amount'))['total'] or 0
            referrer.total_rewards = total
            referrer.save()
        
        self.stdout.write(f'  创建了 {created_count} 条内推记录')
