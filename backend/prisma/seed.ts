import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data
  await prisma.attendanceLog.deleteMany();
  await prisma.schedule.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.sensorLog.deleteMany();
  await prisma.airConditioner.deleteMany();
  await prisma.room.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const hashedPassword = await bcrypt.hash('password123', 10);

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@climatechange.com',
      password: hashedPassword,
      fullName: 'Admin User',
      role: 'ADMIN',
    },
  });

  const user1 = await prisma.user.create({
    data: {
      email: 'user1@climatechange.com',
      password: hashedPassword,
      fullName: 'John Doe',
      role: 'USER',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'user2@climatechange.com',
      password: hashedPassword,
      fullName: 'Jane Smith',
      role: 'USER',
    },
  });

  console.log('✅ Created users');

  // Create brands
  const daikinBrand = await prisma.brand.create({
    data: {
      name: 'Daikin',

    },
  });

  const lgBrand = await prisma.brand.create({
    data: {
      name: 'LG',

    },
  });

  const samsungBrand = await prisma.brand.create({
    data: {
      name: 'Samsung',

    },
  });

  console.log('✅ Created brands');

  // Create rooms
  const room1 = await prisma.room.create({
    data: {
      name: 'a201',
      location: 'Floor 1',
      currentPeople: 15,
      currentTemperature: 24.5,
      peoplePerAC: 10,
      defaultTemp: 25,
      autoMode: true,
      startTime: '08:00',
      endTime: '18:00',
      userId: user1.id,
    },
  });

  const room2 = await prisma.room.create({
    data: {
      name: 'b202',
      location: 'Floor 2',
      currentPeople: 8,
      currentTemperature: 25.2,
      peoplePerAC: 10,

      defaultTemp: 25,
      autoMode: true,
      startTime: '08:00',
      endTime: '18:00',
      userId: user1.id,
    },
  });

  const room3 = await prisma.room.create({
    data: {
      name: 'c203',
      location: 'Floor 3',
      currentPeople: 12,
      currentTemperature: 23.8,
      peoplePerAC: 10,
      defaultTemp: 25,
      autoMode: true,
      startTime: '08:00',
      endTime: '18:00',
      userId: user2.id,
    },
  });

  console.log('✅ Created rooms');

  // Create air conditioners
  const ac1 = await prisma.airConditioner.create({
    data: {
      name: 'AC Unit 1',
      brandId: daikinBrand.id,
      roomId: room1.id,
      status: 'ON',
      currentTemp: 24.5,
      mode: 'COOL',
    },
  });

  const ac2 = await prisma.airConditioner.create({
    data: {
      name: 'AC Unit 2',
      brandId: lgBrand.id,
      roomId: room1.id,
      status: 'ON',
      currentTemp: 24.5,
      mode: 'COOL',
    },
  });

  const ac3 = await prisma.airConditioner.create({
    data: {
      name: 'AC Unit 3',
      brandId: samsungBrand.id,
      roomId: room2.id,
      status: 'OFF',
      currentTemp: 25.2,
      mode: 'AUTO',
    },
  });

  const ac4 = await prisma.airConditioner.create({
    data: {
      name: 'AC Unit 4',
      brandId: daikinBrand.id,
      roomId: room3.id,
      status: 'ON',
      currentTemp: 23.8,
      mode: 'DRY',
    },
  });

  console.log('✅ Created air conditioners');

  // Create sensor logs
  const now = new Date();
  for (let i = 0; i < 10; i++) {
    await prisma.sensorLog.create({
      data: {
        roomId: room1.id,
        peopleCount: Math.floor(Math.random() * 20),
        temperature: 24 + Math.random() * 2,
        timestamp: new Date(now.getTime() - i * 60000),
      },
    });

    await prisma.sensorLog.create({
      data: {
        roomId: room2.id,
        peopleCount: Math.floor(Math.random() * 15),
        temperature: 25 + Math.random() * 2,
        timestamp: new Date(now.getTime() - i * 60000),
      },
    });
  }

  console.log('✅ Created sensor logs');

  // Create activity logs
  await prisma.activityLog.create({
    data: {
      roomId: room1.id,
      userId: user1.id,
      action: 'AC_TURNED_ON',
      details: {
        mode: 'COOL',
        temperature: 25,
      },
      timestamp: new Date(now.getTime() - 3600000),
    },
  });

  await prisma.activityLog.create({
    data: {
      roomId: room1.id,
      userId: user1.id,
      action: 'TEMPERATURE_ADJUSTED',
      details: {
        from: 24,
        to: 25,
      },
      timestamp: new Date(now.getTime() - 1800000),
    },
  });

  await prisma.activityLog.create({
    data: {
      roomId: room2.id,
      userId: user1.id,
      action: 'MODE_CHANGED',
      details: {
        from: 'COOL',
        to: 'AUTO',
      },
    },
  });

  console.log('✅ Created activity logs');

  // Create schedules
  const daysOfWeek = [
    'MONDAY',
    'TUESDAY',
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY',
    'SATURDAY',
    'SUNDAY',
  ];

  for (const day of daysOfWeek) {
    await prisma.schedule.create({
      data: {
        roomId: room1.id,
        dayOfWeek: day as any,
        startTime: '08:00',
        endTime: '18:00',
        isActive: day !== 'SATURDAY' && day !== 'SUNDAY',
      },
    });

    await prisma.schedule.create({
      data: {
        roomId: room2.id,
        dayOfWeek: day as any,
        startTime: '07:00',
        endTime: '19:00',
        isActive: day !== 'SUNDAY',
      },
    });
  }

  console.log('✅ Created schedules');

  // Create attendance logs
  for (let i = 0; i < 5; i++) {
    await prisma.attendanceLog.create({
      data: {
        roomId: room1.id,
        className: 'Class A',
        period: i + 1,
        count: Math.floor(Math.random() * 30) + 10,
        imageUrl: `https://example.com/attendance/room1/period${i + 1}.jpg`,
      },
    });

    await prisma.attendanceLog.create({
      data: {
        roomId: room2.id,
        className: 'Class B',
        period: i + 1,
        count: Math.floor(Math.random() * 25) + 5,
        imageUrl: `https://example.com/attendance/room2/period${i + 1}.jpg`,
      },
    });
  }

  console.log('✅ Created attendance logs');

  console.log('✨ Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
