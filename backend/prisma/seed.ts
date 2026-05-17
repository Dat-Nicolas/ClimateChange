import { PrismaClient, User, Room, Brand } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

function random(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function main() {
  console.log('🌱 Seeding database...');

  // ================= CLEAR =================
  await prisma.attendanceLog.deleteMany();
  await prisma.schedule.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.sensorLog.deleteMany();
  await prisma.airConditioner.deleteMany();
  await prisma.room.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.user.deleteMany();

  // ================= USERS =================
  const password = await bcrypt.hash('123456', 10);
  const users: User[] = [];

  for (let i = 1; i <= 10; i++) {
    const user = await prisma.user.create({
      data: {
        email: `user${i}@mail.com`,
        password,
        fullName: `User ${i}`,
        role: i === 1 ? 'ADMIN' : 'USER',
      },
    });
    users.push(user);
  }

  console.log('✅ Users created');

  // ================= BRANDS =================
  const brandNames = ['Daikin', 'LG', 'Samsung', 'Panasonic', 'Toshiba'];
  const brands: Brand[] = [];

  for (let i = 0; i < 10; i++) {
    const brand = await prisma.brand.create({
      data: {
        name: `${brandNames[i % brandNames.length]} ${i + 1}`,
        irProtocol: 'NEC',
      },
    });
    brands.push(brand);
  }

  console.log('✅ Brands created');

  // ================= ROOMS + SENSOR =================
  const rooms: Room[] = [];

  for (let floor = 1; floor <= 5; floor++) {
    for (let roomNum = 1; roomNum <= 5; roomNum++) {
      const roomName = `A${floor}0${roomNum}`;

      const room = await prisma.room.create({
        data: {
          name: roomName,
          location: `Floor ${floor}`,
          currentPeople: random(0, 40),
          currentTemperature: 25,
          peoplePerAC: 10,
          minPeopleToTurnOn: 5,
          autoMode: true,
          startTime: '08:00',
          endTime: '18:00',
          userId: users[random(0, users.length - 1)].id,
        },
      });

      rooms.push(room);

      let latestTemp = 25;

      const tempScenario = [24, 25, 26, 27, 28];


      await prisma.sensorLog.create({
        data: {
          roomId: room.id,
          peopleCount: random(0, 50),
          temperature: tempScenario[0],
          timestamp: new Date(Date.now() - 4 * 60000),
        },
      });

      await prisma.sensorLog.create({
        data: {
          roomId: room.id,
          peopleCount: random(0, 50),
          temperature: tempScenario[1],
          timestamp: new Date(Date.now() - 3 * 60000),
        },
      });

      await prisma.sensorLog.create({
        data: {
          roomId: room.id,
          peopleCount: random(0, 50),
          temperature: tempScenario[2],
          timestamp: new Date(Date.now() - 2 * 60000),
        },
      });

      await prisma.sensorLog.create({
        data: {
          roomId: room.id,
          peopleCount: random(0, 50),
          temperature: tempScenario[3],
          timestamp: new Date(Date.now() - 1 * 60000),
        },
      });

      await prisma.sensorLog.create({
        data: {
          roomId: room.id,
          peopleCount: random(0, 50),
          temperature: tempScenario[4],
          timestamp: new Date(),
        },
      });

      await prisma.room.update({
        where: { id: room.id },
        data: { currentTemperature: latestTemp },
      });
    }
  }

  console.log('✅ Rooms + SensorLogs synced');

  // ================= AIR CONDITIONERS =================
  for (let i = 0; i < rooms.length; i++) {
    await prisma.airConditioner.create({
      data: {
        name: `AC ${i + 1}`,
        brandId: brands[i % brands.length].id,
        roomId: rooms[i].id,
        status: Math.random() > 0.5 ? 'ON' : 'OFF',
        currentTemp: random(22, 28),
        mode: ['COOL', 'AUTO', 'DRY'][random(0, 2)] as any,
      },
    });
  }

  console.log('✅ AirConditioners created');

  // ================= ACTIVITY LOG =================
  const actions = ['AC_ON', 'AC_OFF', 'TEMP_CHANGE', 'MODE_CHANGE'];

  for (let i = 0; i < 20; i++) {
    await prisma.activityLog.create({
      data: {
        roomId: rooms[random(0, rooms.length - 1)].id,
        userId: users[random(0, users.length - 1)].id,
        action: actions[random(0, actions.length - 1)],
        details: { note: 'Auto generated' },
        timestamp: new Date(),
      },
    });
  }

  console.log('✅ Activity logs created');

  // ================= SCHEDULE =================
  const days = [
    'MONDAY',
    'TUESDAY',
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY',
    'SATURDAY',
    'SUNDAY',
  ];

  // for (let i = 0; i < 20; i++) {
  //   const day = days[random(0, 6)];

  //   await prisma.schedule.create({
  //     data: {
  //       roomId: rooms[random(0, rooms.length - 1)].id,
  //       startTime: '08:00',
  //       endTime: '18:00',
  //       isActive: Math.random() > 0.2,
  //     },
  //   });
  // }

  console.log('✅ Schedules created');

  // ================= ATTENDANCE =================
  for (let i = 0; i < 20; i++) {
    await prisma.attendanceLog.create({
      data: {
        roomId: rooms[random(0, rooms.length - 1)].id,
        className: `Class ${String.fromCharCode(65 + random(0, 5))}`,
        period: random(1, 10),
        count: random(10, 60),
        imageUrl: `https://picsum.photos/200?random=${i}`,
      },
    });
  }

  console.log('✅ Attendance logs created');

  console.log('✨ SEED COMPLETED SUCCESSFULLY');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
