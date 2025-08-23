import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: 'Development' },
      update: {},
      create: {
        name: 'Development',
        color: '#3b82f6',
      },
    }),
    prisma.category.upsert({
      where: { name: 'Leadership' },
      update: {},
      create: {
        name: 'Leadership',
        color: '#10b981',
      },
    }),
    prisma.category.upsert({
      where: { name: 'Innovation' },
      update: {},
      create: {
        name: 'Innovation',
        color: '#f59e0b',
      },
    }),
    prisma.category.upsert({
      where: { name: 'Problem Solving' },
      update: {},
      create: {
        name: 'Problem Solving',
        color: '#ef4444',
      },
    }),
  ]);

  console.log(`✅ Created ${categories.length} categories`);

  // Create tags
  const tags = await Promise.all([
    prisma.tag.upsert({
      where: { name: 'React' },
      update: {},
      create: { name: 'React' },
    }),
    prisma.tag.upsert({
      where: { name: 'TypeScript' },
      update: {},
      create: { name: 'TypeScript' },
    }),
    prisma.tag.upsert({
      where: { name: 'Leadership' },
      update: {},
      create: { name: 'Leadership' },
    }),
    prisma.tag.upsert({
      where: { name: 'Performance' },
      update: {},
      create: { name: 'Performance' },
    }),
    prisma.tag.upsert({
      where: { name: 'Security' },
      update: {},
      create: { name: 'Security' },
    }),
    prisma.tag.upsert({
      where: { name: 'Docker' },
      update: {},
      create: { name: 'Docker' },
    }),
    prisma.tag.upsert({
      where: { name: 'Database' },
      update: {},
      create: { name: 'Database' },
    }),
  ]);

  console.log(`✅ Created ${tags.length} tags`);

  // Create sample achievements
  const achievements = await Promise.all([
    prisma.achievement.create({
      data: {
        title: 'Implemented new authentication system',
        description: 'Designed and implemented a comprehensive authentication system with JWT tokens, password reset functionality, and role-based access control. Improved security and user experience across the platform.',
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-02-01'),
        durationHours: 40,
        categoryId: categories[0].id, // Development
        impact: 'Reduced security incidents by 90% and improved user login experience',
        skillsUsed: ['TypeScript', 'Node.js', 'JWT', 'Security'],
        teamSize: 3,
        priority: 'HIGH',
        tags: {
          create: [
            { tag: { connect: { name: 'TypeScript' } } },
            { tag: { connect: { name: 'Security' } } },
          ],
        },
      },
    }),
    prisma.achievement.create({
      data: {
        title: 'Led team presentation to stakeholders',
        description: 'Organized and delivered a comprehensive presentation to key stakeholders showcasing quarterly achievements, upcoming roadmap, and resource needs. Successfully secured additional budget and team expansion.',
        startDate: new Date('2024-02-10'),
        endDate: new Date('2024-02-15'),
        durationHours: 8,
        categoryId: categories[1].id, // Leadership
        impact: 'Secured 25% budget increase and approval for 2 new team members',
        skillsUsed: ['Communication', 'Project Management', 'Stakeholder Management'],
        teamSize: 1,
        priority: 'MEDIUM',
        tags: {
          create: [
            { tag: { connect: { name: 'Leadership' } } },
          ],
        },
      },
    }),
    prisma.achievement.create({
      data: {
        title: 'Optimized database performance',
        description: 'Identified and resolved critical database performance bottlenecks by implementing proper indexing, query optimization, and connection pooling. Reduced average query response time by 80%.',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-10'),
        durationHours: 24,
        categoryId: categories[3].id, // Problem Solving
        impact: 'Reduced page load times by 80% and improved user satisfaction scores',
        skillsUsed: ['PostgreSQL', 'Query Optimization', 'Performance Tuning'],
        teamSize: 2,
        priority: 'HIGH',
        tags: {
          create: [
            { tag: { connect: { name: 'Database' } } },
            { tag: { connect: { name: 'Performance' } } },
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