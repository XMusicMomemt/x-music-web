import { PrismaClient } from '@prisma/client'
import path from 'node:path'

const databaseUrl = `file:${path.join(process.cwd(), 'db', 'custom.db')}`
const db = new PrismaClient({ datasourceUrl: databaseUrl })

function daysAgo(n: number): Date {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000)
}

const seedTeachers = [
  {
    name: '林晚晴', gender: '女', phone: '13800001001', city: '北京', instrument: '钢琴',
    education: '硕士', school: '中央音乐学院', years: 12, title: '副教授级钢琴导师',
    bio: '专注钢琴启蒙与考级进阶教学，独创「听感识谱」教学法，帮助零基础学员三个月内完成首场小型演奏会。多次担任省级钢琴赛事评委。',
    achievement: '第18届「金音符」青少年钢琴大赛优秀导师奖；学生累计通过英皇八级37人。',
    reviewedAt: daysAgo(120), status: 'APPROVED',
  },
  {
    name: '沈屹', gender: '男', phone: '13800001002', city: '上海', instrument: '声乐',
    education: '硕士', school: '上海音乐学院', years: 9, title: '美声方向声乐导师',
    bio: '师从著名男中音歌唱家，擅长美声与音乐剧唱法教学。注重气息与共鸣的科学训练，曾指导多支校园合唱团获得市级金奖。',
    achievement: '意大利奥尔维托国际声乐比赛银奖；指导合唱团获上海市学生艺术节金奖。',
    reviewedAt: daysAgo(95), status: 'APPROVED',
  },
  {
    name: '顾清弦', gender: '女', phone: '13800001003', city: '杭州', instrument: '古筝',
    education: '本科', school: '浙江音乐学院', years: 8, title: '青年古筝演奏家',
    bio: '浙江省音乐家协会会员，主张「以曲带功」的教学路径，将传统曲目与现代编创结合，课堂氛围轻松而不失严谨。',
    achievement: '长三角民族器乐邀请赛金奖；原创筝曲《湖上晨雾》获省级创作一等奖。',
    reviewedAt: daysAgo(88), status: 'APPROVED',
  },
  {
    name: '陆则鸣', gender: '男', phone: '13800001004', city: '深圳', instrument: '吉他',
    education: '本科', school: '星海音乐学院', years: 10, title: '流行吉他/指弹导师',
    bio: '十年一线教学经验，覆盖民谣、指弹与电吉他三大方向。为学员定制「舞台成长计划」，每季度组织学员音乐会。',
    achievement: 'WAGF指弹吉他大赛全国十强；培养学员组建乐队获湾区高校联赛冠军。',
    reviewedAt: daysAgo(70), status: 'APPROVED',
  },
  {
    name: '苏念慈', gender: '女', phone: '13800001005', city: '广州', instrument: '小提琴',
    education: '硕士', school: '星海音乐学院', years: 15, title: '弦乐教研室主任',
    bio: '曾任职于交响乐团第一小提琴声部，教学强调基本功与音乐表现力并重。擅长纠正持弓与音准问题，考级通过率常年保持高位。',
    achievement: '香港国际弦乐公开赛优秀指导教师；学生获广东省小提琴比赛少年组一等奖。',
    reviewedAt: daysAgo(60), status: 'APPROVED',
  },
  {
    name: '程一诺', gender: '男', phone: '13800001006', city: '成都', instrument: '架子鼓',
    education: '本科', school: '四川音乐学院', years: 7, title: '现代打击乐导师',
    bio: '系统学习爵士鼓与拉丁打击乐，课程融合节奏训练与合奏实践。热衷儿童节奏启蒙，开发了一套四格节奏卡教具。',
    achievement: '中国鼓手大赛职业组亚军；IPEA国际打击乐比赛优秀评委。',
    reviewedAt: daysAgo(45), status: 'APPROVED',
  },
  {
    name: '叶栖梧', gender: '女', phone: '13800001007', city: '南京', instrument: '琵琶',
    education: '硕士', school: '南京艺术学院', years: 11, title: '民乐系琵琶导师',
    bio: '自幼习琴，得多位流派名家指点。教学兼顾传统曲目的韵味处理与现代舞台表现，注重让学员「懂音乐，更爱音乐」。',
    achievement: 'CCTV民族器乐电视大赛优秀演奏奖；江苏省文艺大奖·民间文艺奖提名。',
    reviewedAt: daysAgo(38), status: 'APPROVED',
  },
  {
    name: '韩沐风', gender: '男', phone: '13800001008', city: '北京', instrument: '萨克斯',
    education: '本科', school: '中国音乐学院', years: 9, title: '爵士萨克斯导师',
    bio: '爵士乐队的资深萨克斯手，教学以即兴与听力训练见长。带领学员从经典曲目入手，逐步建立个人演奏风格。',
    achievement: '北京国际爵士音乐节登上主舞台；所带学员乐队获全国中学生展演金奖。',
    reviewedAt: daysAgo(30), status: 'APPROVED',
  },
  {
    name: '方雅歌', gender: '女', phone: '13800001009', city: '上海', instrument: '钢琴',
    education: '博士', school: '上海音乐学院', years: 14, title: '钢琴演奏方向博士',
    bio: '研究儿童钢琴教学法多年，主张「技术为音乐服务」。擅长为琴童规划长期学习路径，多次举办公益师资工作坊。',
    achievement: '上海之春国际音乐节室内乐组银奖；发表钢琴教学论文多篇。',
    reviewedAt: daysAgo(22), status: 'APPROVED',
  },
  {
    name: '覃朗', gender: '男', phone: '13800001010', city: '武汉', instrument: '长笛',
    education: '硕士', school: '武汉音乐学院', years: 8, title: '管弦系长笛导师',
    bio: '曾任乐团长笛副首席，教学细致耐心，善于用呼吸训练解决音色问题。针对考级与艺考学员分别设计了进阶方案。',
    achievement: '中国长笛联合会青年演奏家展演金奖；指导学生通过武汉音乐学院附中考试。',
    reviewedAt: daysAgo(15), status: 'APPROVED',
  },
  {
    name: '宋雨桐', gender: '女', phone: '13800001011', city: '西安', instrument: '声乐',
    education: '本科', school: '西安音乐学院', years: 6, title: '流行演唱导师',
    bio: '流行唱法与少儿声乐方向，课堂注重节奏感与舞台表现力训练，组织学员参与公益演出逾三十场。',
    achievement: '陕西青年歌手大赛流行组三等奖；学员获「快乐阳光」全国少儿歌曲大赛金奖。',
    reviewedAt: daysAgo(10), status: 'APPROVED',
  },
  {
    name: '祁墨白', gender: '男', phone: '13800001012', city: '重庆', instrument: '大提琴',
    education: '硕士', school: '四川音乐学院', years: 13, title: '大提琴重奏课导师',
    bio: '热衷室内乐推广，长期组织大提琴重奏沙龙。教学中融入体态调整与练琴方法指导，帮助学员高效进步。',
    achievement: '西南地区大提琴艺术节职业组金奖；组建「山城弦悦」重奏团并巡演。',
    reviewedAt: daysAgo(5), status: 'APPROVED',
  },
  // 待审核样例（供管理端演示）
  {
    name: '柳亦笙', gender: '男', phone: '13900002001', city: '杭州', instrument: '钢琴',
    education: '本科', school: '浙江音乐学院', years: 4, title: '钢琴教师',
    bio: '毕业于音乐教育专业，主修钢琴，毕业后一直在艺术培训机构从事一对一教学，学员年龄段覆盖5至40岁，亲和力强。',
    achievement: '校级钢琴比赛一等奖。',
    reviewedAt: null, status: 'PENDING',
  },
  {
    name: '赵灵儿', gender: '女', phone: '13900002002', city: '成都', instrument: '古筝',
    education: '本科', school: '四川师范大学', years: 3, title: '',
    bio: '音乐学专业毕业，自幼学习古筝，具有幼儿古筝启蒙教学经验，希望在平台获得更多教学机会。',
    achievement: null,
    reviewedAt: null, status: 'PENDING',
  },
  // 驳回样例
  {
    name: '钱小跳', gender: '男', phone: '13900002003', city: '武汉', instrument: '吉他',
    education: '高中', school: '武汉市第七中学', years: 1, title: '',
    bio: '自学吉他三年，平时在琴行兼职销售，偶尔帮学员调琴，希望申请吉他老师认证。',
    achievement: null,
    reviewNote: '缺少音乐学院或相关专业系统学习经历，教学年限与专业能力暂未达到认证标准，建议进修后再次申请。',
    reviewedAt: daysAgo(2), status: 'REJECTED',
  },
]

async function main() {
  const count = await db.teacherApplication.count()
  if (count > 0) {
    console.log(`数据库已有 ${count} 条申请记录，跳过种子数据写入`)
    return
  }
  for (const t of seedTeachers) {
    const { achievement, ...rest } = t
    await db.teacherApplication.create({
      data: {
        ...rest,
        applyNo: `MT-SEED-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
        achievement: achievement ?? null,
        title: (t as { title?: string }).title || null,
        email: null,
      },
    })
  }
  console.log(`种子数据写入完成：${seedTeachers.length} 条`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
