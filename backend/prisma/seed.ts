import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create default admin user
  const hashedPassword = await bcrypt.hash('admin123', 12);
  const defaultUser = await prisma.user.upsert({
    where: { email: 'admin@bragger.com' },
    update: {},
    create: {
      email: 'admin@bragger.com',
      name: 'Admin User',
      password: hashedPassword,
    },
  });

  console.log(`✅ Created default user: ${defaultUser.email}`);

  // Create AI-themed categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: 'AI/ML Development' },
      update: {},
      create: {
        name: 'AI/ML Development',
        color: '#8b5cf6',
      },
    }),
    prisma.category.upsert({
      where: { name: 'AI-Assisted Coding' },
      update: {},
      create: {
        name: 'AI-Assisted Coding',
        color: '#3b82f6',
      },
    }),
    prisma.category.upsert({
      where: { name: 'Data & Analytics' },
      update: {},
      create: {
        name: 'Data & Analytics',
        color: '#10b981',
      },
    }),
    prisma.category.upsert({
      where: { name: 'Automation & Tools' },
      update: {},
      create: {
        name: 'Automation & Tools',
        color: '#f59e0b',
      },
    }),
    prisma.category.upsert({
      where: { name: 'AI Integration' },
      update: {},
      create: {
        name: 'AI Integration',
        color: '#ef4444',
      },
    }),
  ]);

  console.log(`✅ Created ${categories.length} categories`);

  // Create AI-focused tags
  const tags = await Promise.all([
    prisma.tag.upsert({
      where: { name: 'ChatGPT' },
      update: {},
      create: { name: 'ChatGPT' },
    }),
    prisma.tag.upsert({
      where: { name: 'Claude' },
      update: {},
      create: { name: 'Claude' },
    }),
    prisma.tag.upsert({
      where: { name: 'Copilot' },
      update: {},
      create: { name: 'Copilot' },
    }),
    prisma.tag.upsert({
      where: { name: 'Machine Learning' },
      update: {},
      create: { name: 'Machine Learning' },
    }),
    prisma.tag.upsert({
      where: { name: 'Python' },
      update: {},
      create: { name: 'Python' },
    }),
    prisma.tag.upsert({
      where: { name: 'API Integration' },
      update: {},
      create: { name: 'API Integration' },
    }),
    prisma.tag.upsert({
      where: { name: 'Prompt Engineering' },
      update: {},
      create: { name: 'Prompt Engineering' },
    }),
    prisma.tag.upsert({
      where: { name: 'Automation' },
      update: {},
      create: { name: 'Automation' },
    }),
  ]);

  console.log(`✅ Created ${tags.length} tags`);

  // Create AI project sample achievements for the default user
  const achievements = await Promise.all([
    prisma.achievement.create({
      data: {
        userId: defaultUser.id,
        title: 'AI-Powered Code Review Tool',
        description: 'Built an intelligent code review assistant using Claude API to analyze code quality, suggest improvements, and identify potential bugs automatically. Integrated with GitHub workflow for seamless development process.',
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-02-15'),
        durationHours: 60,
        categoryId: categories[1].id, // AI-Assisted Coding
        impact: 'Reduced code review time by 40% and caught 25% more bugs before deployment',
        skillsUsed: ['Python', 'Claude API', 'GitHub Actions', 'FastAPI'],
        status: 'COMPLETE',
        githubUrl: 'https://github.com/example/ai-code-reviewer',
        tags: {
          create: [
            { tag: { connect: { name: 'Claude' } } },
            { tag: { connect: { name: 'API Integration' } } },
            { tag: { connect: { name: 'Automation' } } },
          ],
        },
      },
    }),
    prisma.achievement.create({
      data: {
        userId: defaultUser.id,
        title: 'ChatGPT-Enhanced Documentation Generator',
        description: 'Developed a tool that automatically generates comprehensive documentation from codebase using GPT-4. Analyzes code structure, generates API docs, README files, and inline comments.',
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-02-20'),
        durationHours: 35,
        categoryId: categories[1].id, // AI-Assisted Coding
        impact: 'Increased documentation coverage by 80% and reduced manual documentation time by 90%',
        skillsUsed: ['Node.js', 'OpenAI API', 'TypeScript', 'Markdown'],
        status: 'USABLE',
        githubUrl: 'https://github.com/example/auto-docs',
        tags: {
          create: [
            { tag: { connect: { name: 'ChatGPT' } } },
            { tag: { connect: { name: 'API Integration' } } },
            { tag: { connect: { name: 'Automation' } } },
          ],
        },
      },
    }),
    prisma.achievement.create({
      data: {
        userId: defaultUser.id,
        title: 'ML-Based User Behavior Analytics',
        description: 'Currently building a machine learning model to analyze user behavior patterns and predict feature usage. Will help prioritize development efforts and improve user experience.',
        startDate: new Date('2024-03-01'),
        durationHours: 25,
        categoryId: categories[2].id, // Data & Analytics
        impact: 'Expected to improve user retention by 20% and guide feature development priorities',
        skillsUsed: ['Python', 'TensorFlow', 'Pandas', 'PostgreSQL'],
        status: 'CONCEPT',
        githubUrl: 'https://github.com/example/user-analytics-ml',
        tags: {
          create: [
            { tag: { connect: { name: 'Machine Learning' } } },
            { tag: { connect: { name: 'Python' } } },
          ],
        },
      },
    }),
  ]);

  console.log(`✅ Created ${achievements.length} sample achievements`);

  console.log('🎉 Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });