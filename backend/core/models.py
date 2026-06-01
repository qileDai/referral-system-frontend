from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone


class Department(models.Model):
    """部门"""
    name = models.CharField('部门名称', max_length=100, unique=True)
    code = models.CharField('部门编码', max_length=20, unique=True)
    description = models.TextField('部门描述', blank=True)
    parent = models.ForeignKey('self', verbose_name='上级部门', null=True, blank=True, on_delete=models.SET_NULL)
    created_at = models.DateTimeField('创建时间', auto_now_add=True)
    updated_at = models.DateTimeField('更新时间', auto_now=True)

    class Meta:
        verbose_name = '部门'
        verbose_name_plural = '部门'
        ordering = ['code']

    def __str__(self):
        return self.name


class Position(models.Model):
    """岗位"""
    STATUS_CHOICES = [
        ('open', '开放'),
        ('paused', '暂停'),
        ('closed', '已关闭'),
        ('filled', '已招满'),
    ]

    EMPLOYMENT_TYPE_CHOICES = [
        ('full_time', '全职'),
        ('part_time', '兼职'),
        ('intern', '实习'),
        ('contract', '合同制'),
    ]

    title = models.CharField('岗位名称', max_length=200)
    code = models.CharField('岗位编码', max_length=50, unique=True)
    department = models.ForeignKey(Department, verbose_name='所属部门', on_delete=models.CASCADE)
    description = models.TextField('岗位描述')
    requirements = models.TextField('任职要求')
    responsibilities = models.TextField('工作职责')
    employment_type = models.CharField('工作类型', max_length=20, choices=EMPLOYMENT_TYPE_CHOICES, default='full_time')
    location = models.CharField('工作地点', max_length=100)
    min_salary = models.DecimalField('最低薪资', max_digits=12, decimal_places=2, null=True, blank=True)
    max_salary = models.DecimalField('最高薪资', max_digits=12, decimal_places=2, null=True, blank=True)
    headcount = models.PositiveIntegerField('招聘人数', default=1)
    status = models.CharField('状态', max_length=20, choices=STATUS_CHOICES, default='open')
    created_by = models.ForeignKey(User, verbose_name='创建人', on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField('创建时间', auto_now_add=True)
    updated_at = models.DateTimeField('更新时间', auto_now=True)
    published_at = models.DateTimeField('发布时间', null=True, blank=True)

    class Meta:
        verbose_name = '岗位'
        verbose_name_plural = '岗位'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} ({self.code})"

    def get_current_applications(self):
        return self.referrals.filter(status__in=['submitted', 'screening', 'interviewing']).count()


class Referrer(models.Model):
    """内推人"""
    user = models.OneToOneField(User, verbose_name='用户', on_delete=models.CASCADE, null=True, blank=True)
    employee_id = models.CharField('工号', max_length=20, unique=True)
    name = models.CharField('姓名', max_length=100)
    email = models.EmailField('邮箱', unique=True)
    phone = models.CharField('电话', max_length=20)
    department = models.ForeignKey(Department, verbose_name='所属部门', on_delete=models.SET_NULL, null=True)
    total_referrals = models.PositiveIntegerField('总推荐数', default=0)
    successful_referrals = models.PositiveIntegerField('成功推荐数', default=0)
    total_rewards = models.DecimalField('总奖励金额', max_digits=12, decimal_places=2, default=0)
    is_active = models.BooleanField('是否活跃', default=True)
    created_at = models.DateTimeField('创建时间', auto_now_add=True)
    updated_at = models.DateTimeField('更新时间', auto_now=True)

    class Meta:
        verbose_name = '内推人'
        verbose_name_plural = '内推人'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.employee_id})"

    def update_statistics(self):
        """更新统计信息"""
        self.total_referrals = self.referrals.count()
        self.successful_referrals = self.referrals.filter(status='hired').count()
        self.save()


class Candidate(models.Model):
    """候选人"""
    GENDER_CHOICES = [
        ('male', '男'),
        ('female', '女'),
        ('other', '其他'),
    ]

    EDUCATION_CHOICES = [
        ('high_school', '高中'),
        ('associate', '大专'),
        ('bachelor', '本科'),
        ('master', '硕士'),
        ('phd', '博士'),
        ('other', '其他'),
    ]

    name = models.CharField('姓名', max_length=100)
    email = models.EmailField('邮箱')
    phone = models.CharField('电话', max_length=20)
    gender = models.CharField('性别', max_length=10, choices=GENDER_CHOICES)
    age = models.PositiveIntegerField('年龄', null=True, blank=True)
    education = models.CharField('学历', max_length=20, choices=EDUCATION_CHOICES)
    school = models.CharField('毕业院校', max_length=200, blank=True)
    major = models.CharField('专业', max_length=100, blank=True)
    work_experience_years = models.PositiveIntegerField('工作年限', default=0)
    current_company = models.CharField('当前公司', max_length=200, blank=True)
    current_position = models.CharField('当前职位', max_length=200, blank=True)
    resume_url = models.URLField('简历链接', blank=True)
    notes = models.TextField('备注', blank=True)
    created_at = models.DateTimeField('创建时间', auto_now_add=True)
    updated_at = models.DateTimeField('更新时间', auto_now=True)

    class Meta:
        verbose_name = '候选人'
        verbose_name_plural = '候选人'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.email})"


class Referral(models.Model):
    """内推记录"""
    STATUS_CHOICES = [
        ('submitted', '已提交'),
        ('screening', '筛选中'),
        ('interviewing', '面试中'),
        ('offer_sent', '已发Offer'),
        ('offer_accepted', '已接受Offer'),
        ('hired', '已入职'),
        ('rejected', '已拒绝'),
        ('withdrawn', '已撤回'),
    ]

    SOURCE_CHOICES = [
        ('internal', '内部员工'),
        ('alumni', '校友推荐'),
        ('partner', '合作伙伴'),
        ('other', '其他'),
    ]

    referral_code = models.CharField('内推编号', max_length=50, unique=True)
    position = models.ForeignKey(Position, verbose_name='推荐岗位', on_delete=models.CASCADE, related_name='referrals')
    referrer = models.ForeignKey(Referrer, verbose_name='内推人', on_delete=models.CASCADE, related_name='referrals')
    candidate = models.ForeignKey(Candidate, verbose_name='候选人', on_delete=models.CASCADE, related_name='referrals')
    status = models.CharField('状态', max_length=20, choices=STATUS_CHOICES, default='submitted')
    source = models.CharField('推荐来源', max_length=20, choices=SOURCE_CHOICES, default='internal')
    relationship = models.CharField('与候选人关系', max_length=50, blank=True)
    referrer_notes = models.TextField('内推人备注', blank=True)
    hr_notes = models.TextField('HR备注', blank=True)
    submitted_at = models.DateTimeField('提交时间', auto_now_add=True)
    last_updated = models.DateTimeField('最后更新', auto_now=True)
    hired_at = models.DateTimeField('入职时间', null=True, blank=True)

    class Meta:
        verbose_name = '内推记录'
        verbose_name_plural = '内推记录'
        ordering = ['-submitted_at']

    def __str__(self):
        return f"{self.referral_code} - {self.candidate.name} -> {self.position.title}"

    def save(self, *args, **kwargs):
        if not self.referral_code:
            import random
            self.referral_code = f"REF{timezone.now().strftime('%Y%m%d%H%M%S')}{random.randint(1000, 9999)}"
        super().save(*args, **kwargs)


class Interview(models.Model):
    """面试记录"""
    INTERVIEW_TYPE_CHOICES = [
        ('phone', '电话面试'),
        ('video', '视频面试'),
        ('onsite', '现场面试'),
        ('technical', '技术面试'),
        ('behavioral', '行为面试'),
        ('final', '终面'),
    ]

    RESULT_CHOICES = [
        ('pending', '待定'),
        ('passed', '通过'),
        ('failed', '未通过'),
        ('rescheduled', '改期'),
        ('cancelled', '取消'),
    ]

    referral = models.ForeignKey(Referral, verbose_name='内推记录', on_delete=models.CASCADE, related_name='interviews')
    interview_type = models.CharField('面试类型', max_length=20, choices=INTERVIEW_TYPE_CHOICES)
    round_number = models.PositiveIntegerField('轮次', default=1)
    scheduled_at = models.DateTimeField('预约时间')
    duration_minutes = models.PositiveIntegerField('预计时长(分钟)', default=60)
    interviewer = models.CharField('面试官', max_length=100)
    interviewer_email = models.EmailField('面试官邮箱', blank=True)
    location = models.CharField('面试地点/链接', max_length=300, blank=True)
    result = models.CharField('面试结果', max_length=20, choices=RESULT_CHOICES, default='pending')
    feedback = models.TextField('面试反馈', blank=True)
    score = models.DecimalField('评分', max_digits=3, decimal_places=1, null=True, blank=True,
                                validators=[MinValueValidator(0), MaxValueValidator(10)])
    created_at = models.DateTimeField('创建时间', auto_now_add=True)
    updated_at = models.DateTimeField('更新时间', auto_now=True)

    class Meta:
        verbose_name = '面试记录'
        verbose_name_plural = '面试记录'
        ordering = ['-scheduled_at']

    def __str__(self):
        return f"{self.referral.candidate.name} - 第{self.round_number}轮{self.get_interview_type_display()}"


class RewardRule(models.Model):
    """奖励规则"""
    REWARD_TYPE_CHOICES = [
        ('fixed', '固定金额'),
        ('percentage', '薪资百分比'),
        ('tiered', '阶梯奖励'),
    ]

    TRIGGER_EVENT_CHOICES = [
        ('onboard', '入职时'),
        ('probation_passed', '转正后'),
        ('stay_3m', '满3个月'),
        ('stay_6m', '满6个月'),
        ('stay_1y', '满1年'),
    ]

    name = models.CharField('规则名称', max_length=200)
    description = models.TextField('规则描述', blank=True)
    reward_type = models.CharField('奖励类型', max_length=20, choices=REWARD_TYPE_CHOICES, default='fixed')
    fixed_amount = models.DecimalField('固定金额', max_digits=12, decimal_places=2, null=True, blank=True)
    percentage = models.DecimalField('百分比(%)', max_digits=5, decimal_places=2, null=True, blank=True,
                                     validators=[MinValueValidator(0), MaxValueValidator(100)])
    min_reward = models.DecimalField('最低奖励', max_digits=12, decimal_places=2, null=True, blank=True)
    max_reward = models.DecimalField('最高奖励', max_digits=12, decimal_places=2, null=True, blank=True)
    trigger_event = models.CharField('触发条件', max_length=20, choices=TRIGGER_EVENT_CHOICES, default='onboard')
    delay_days = models.PositiveIntegerField('延迟天数', default=0, help_text='触发后延迟发放的天数')
    is_active = models.BooleanField('是否启用', default=True)
    applicable_positions = models.ManyToManyField(Position, verbose_name='适用岗位', blank=True)
    applicable_departments = models.ManyToManyField(Department, verbose_name='适用部门', blank=True)
    created_at = models.DateTimeField('创建时间', auto_now_add=True)
    updated_at = models.DateTimeField('更新时间', auto_now=True)

    class Meta:
        verbose_name = '奖励规则'
        verbose_name_plural = '奖励规则'
        ordering = ['-created_at']

    def __str__(self):
        return self.name


class Reward(models.Model):
    """奖励发放记录"""
    STATUS_CHOICES = [
        ('pending', '待发放'),
        ('processing', '处理中'),
        ('paid', '已发放'),
        ('cancelled', '已取消'),
        ('failed', '发放失败'),
    ]

    PAYMENT_METHOD_CHOICES = [
        ('salary', '工资发放'),
        ('bonus', '奖金发放'),
        ('gift_card', '礼品卡'),
        ('cash', '现金'),
        ('other', '其他'),
    ]

    reward_code = models.CharField('奖励编号', max_length=50, unique=True)
    referral = models.OneToOneField(Referral, verbose_name='内推记录', on_delete=models.CASCADE, related_name='reward')
    rule = models.ForeignKey(RewardRule, verbose_name='奖励规则', on_delete=models.SET_NULL, null=True)
    amount = models.DecimalField('奖励金额', max_digits=12, decimal_places=2)
    status = models.CharField('状态', max_length=20, choices=STATUS_CHOICES, default='pending')
    payment_method = models.CharField('发放方式', max_length=20, choices=PAYMENT_METHOD_CHOICES, default='salary')
    payment_date = models.DateField('发放日期', null=True, blank=True)
    payment_reference = models.CharField('支付参考号', max_length=100, blank=True)
    tax_deducted = models.DecimalField('代扣税额', max_digits=12, decimal_places=2, default=0)
    net_amount = models.DecimalField('实发金额', max_digits=12, decimal_places=2, default=0)
    notes = models.TextField('备注', blank=True)
    created_at = models.DateTimeField('创建时间', auto_now_add=True)
    updated_at = models.DateTimeField('更新时间', auto_now=True)
    paid_at = models.DateTimeField('实际发放时间', null=True, blank=True)
    paid_by = models.ForeignKey(User, verbose_name='发放人', on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        verbose_name = '奖励发放'
        verbose_name_plural = '奖励发放'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.reward_code} - {self.amount}"

    def save(self, *args, **kwargs):
        if not self.reward_code:
            import random
            self.reward_code = f"RWD{timezone.now().strftime('%Y%m%d%H%M%S')}{random.randint(1000, 9999)}"
        if self.net_amount == 0 and self.amount > 0:
            self.net_amount = self.amount - self.tax_deducted
        super().save(*args, **kwargs)


class ReferralStatusHistory(models.Model):
    """内推状态变更历史"""
    referral = models.ForeignKey(Referral, verbose_name='内推记录', on_delete=models.CASCADE, related_name='status_history')
    from_status = models.CharField('原状态', max_length=20, choices=Referral.STATUS_CHOICES, blank=True)
    to_status = models.CharField('新状态', max_length=20, choices=Referral.STATUS_CHOICES)
    changed_by = models.ForeignKey(User, verbose_name='操作人', on_delete=models.SET_NULL, null=True)
    notes = models.TextField('备注', blank=True)
    created_at = models.DateTimeField('变更时间', auto_now_add=True)

    class Meta:
        verbose_name = '状态变更历史'
        verbose_name_plural = '状态变更历史'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.referral.referral_code}: {self.from_status} -> {self.to_status}"


class DashboardStats(models.Model):
    """仪表板统计数据"""
    date = models.DateField('日期', unique=True)
    total_referrals = models.PositiveIntegerField('总推荐数', default=0)
    new_referrals = models.PositiveIntegerField('新增推荐数', default=0)
    hired_count = models.PositiveIntegerField('入职人数', default=0)
    total_rewards = models.DecimalField('总奖励金额', max_digits=15, decimal_places=2, default=0)
    conversion_rate = models.DecimalField('转化率(%)', max_digits=5, decimal_places=2, default=0)
    avg_time_to_hire = models.PositiveIntegerField('平均招聘周期(天)', default=0)
    created_at = models.DateTimeField('创建时间', auto_now_add=True)
    updated_at = models.DateTimeField('更新时间', auto_now=True)

    class Meta:
        verbose_name = '统计指标'
        verbose_name_plural = '统计指标'
        ordering = ['-date']

    def __str__(self):
        return f"{self.date} 统计数据"
