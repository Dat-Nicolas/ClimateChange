import { PrismaClient, Role, ACMode, ACStatus, ButtonCode } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const FUNIKI_BUTTONS = [
  {
    buttonName: ButtonCode.POWER_OFF,
    irCode: '0xB27BE0',
    irName: 'COOLIX',
  },

  {
    buttonName: ButtonCode.TEMP_17,
    irCode: '0xB2BF00',
    irName: 'COOLIX',
  },
  {
    buttonName: ButtonCode.TEMP_18,
    irCode: '0xB2BF10',
    irName: 'COOLIX',
  },
  {
    buttonName: ButtonCode.TEMP_19,
    irCode: '0xB2BF30',
    irName: 'COOLIX',
  },
  {
    buttonName: ButtonCode.TEMP_20,
    irCode: '0xB2BF20',
    irName: 'COOLIX',
  },
  {
    buttonName: ButtonCode.TEMP_21,
    irCode: '0xB2BF60',
    irName: 'COOLIX',
  },
  {
    buttonName: ButtonCode.TEMP_22,
    irCode: '0xB2BF70',
    irName: 'COOLIX',
  },
  {
    buttonName: ButtonCode.TEMP_23,
    irCode: '0xB2BF50',
    irName: 'COOLIX',
  },
  {
    buttonName: ButtonCode.TEMP_24,
    irCode: '0xB2BF40',
    irName: 'COOLIX',
  },
  {
    buttonName: ButtonCode.TEMP_25,
    irCode: '0xB2BFC0',
    irName: 'COOLIX',
  },
  {
    buttonName: ButtonCode.TEMP_26,
    irCode: '0xB2BFD0',
    irName: 'COOLIX',
  },
  {
    buttonName: ButtonCode.TEMP_27,
    irCode: '0xB2BF90',
    irName: 'COOLIX',
  },
  {
    buttonName: ButtonCode.TEMP_28,
    irCode: '0xB2BF80',
    irName: 'COOLIX',
  },
  {
    buttonName: ButtonCode.TEMP_29,
    irCode: '0xB2BFA0',
    irName: 'COOLIX',
  },
  {
    buttonName: ButtonCode.TEMP_30,
    irCode: '0xB2BFB0',
    irName: 'COOLIX',
  },
];

async function main() {
  console.log('🌱 START SEEDING...');

  // =========================================
  // CLEAR DATABASE
  // =========================================

  await prisma.attendanceLog.deleteMany();
  await prisma.schedule.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.sensorLog.deleteMany();
  await prisma.airConditioner.deleteMany();
  await prisma.iRButton.deleteMany();
  await prisma.room.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.user.deleteMany();

  console.log('🗑 Database cleared');

  // =========================================
  // USER
  // =========================================

  const hashedPassword = await bcrypt.hash('123456', 10);

  const user = await prisma.user.create({
    data: {
      email: 'admin@mail.com',
      password: hashedPassword,
      fullName: 'Admin',
      role: Role.ADMIN,
    },
  });

  console.log('✅ User created');

  // =========================================
  // BRANDS
  // =========================================

  const funikiBrand = await prisma.brand.create({
    data: {
      name: 'Funiki',
      irProtocol: 'NEC',
    },
  });

  const sunhouseBrand = await prisma.brand.create({
    data: {
      name: 'Sunhouse',
      irProtocol: 'NEC',
    },
  });

  console.log('✅ Brands created');

  // =========================================
  // IR BUTTONS - FUNIKI
  // =========================================

  await prisma.iRButton.createMany({
    data: FUNIKI_BUTTONS.map((item) => ({
      brandId: funikiBrand.id,
      buttonName: item.buttonName,
      irCode: item.irCode,
      irName: item.irName,
      description: 'Funiki IR Button',
    })),
  });

  // =========================================
  // IR BUTTONS - SUNHOUSE
  // =========================================
  // Tạm clone code Funiki cho Sunhouse
  // Sau này thay mã thật

  await prisma.iRButton.createMany({
    data: FUNIKI_BUTTONS.map((item) => ({
      brandId: sunhouseBrand.id,
      buttonName: item.buttonName,
      irCode: item.irCode,
      irName: item.irName,
      description: 'Sunhouse IR Button',
    })),
  });

  console.log('✅ IR Buttons created');

  // =========================================
  // ROOM
  // =========================================

  const room = await prisma.room.create({
    data: {
      name: 'A401',
      location: 'Floor 1',
      currentPeople: 12,
      currentTemperature: 27,
      roomTemperature: 28,
      streamKey: 'hnaa401',

      minPeopleToTurnOn: 5,
      minTempToTurnOn: 28,

      peoplePerAC: 10,

      autoMode: true,
      acAutoControlEnabled: true,

      startTime: '08:00',
      endTime: '18:00',

      userId: user.id,
    },
  });

  console.log('✅ Room created');

  // =========================================
  // SENSOR LOGS
  // =========================================

  await prisma.sensorLog.createMany({
    data: [
      {
        roomId: room.id,
        peopleCount: 10,
        temperature: 26,
        timestamp: new Date(Date.now() - 4 * 60000),
      },
      {
        roomId: room.id,
        peopleCount: 12,
        temperature: 27,
        timestamp: new Date(Date.now() - 3 * 60000),
      },
      {
        roomId: room.id,
        peopleCount: 14,
        temperature: 28,
        timestamp: new Date(Date.now() - 2 * 60000),
      },
      {
        roomId: room.id,
        peopleCount: 15,
        temperature: 29,
        timestamp: new Date(Date.now() - 1 * 60000),
      },
      {
        roomId: room.id,
        peopleCount: 16,
        temperature: 30,
        timestamp: new Date(),
      },
    ],
  });

  console.log('✅ Sensor logs created');

  // =========================================
  // AIR CONDITIONERS
  // =========================================

  await prisma.airConditioner.create({
    data: {
      name: 'Funiki AC',
      brandId: funikiBrand.id,
      roomId: room.id,

      status: ACStatus.ON,
      currentTemp: 26,
      mode: ACMode.COOL,
    },
  });

  await prisma.airConditioner.create({
    data: {
      name: 'Sunhouse AC',
      brandId: sunhouseBrand.id,
      roomId: room.id,

      status: ACStatus.OFF,
      currentTemp: 28,
      mode: ACMode.AUTO,
    },
  });

  console.log('✅ Air conditioners created');

  // =========================================
  // ACTIVITY LOG
  // =========================================

  await prisma.activityLog.create({
    data: {
      roomId: room.id,
      userId: user.id,
      action: 'SYSTEM_INIT',
      details: {
        message: 'Initial seed data',
      },
    },
  });

  console.log('✅ Activity log created');

  // =========================================
  // SCHEDULE
  // =========================================

  // await prisma.schedule.create({
  //   data: {
  //     roomId: room.id,
  //     scheduleDate: '2026-05-17',
  //     daysOfWeek: [
  //       'MONDAY',
  //       'TUESDAY',
  //       'WEDNESDAY',
  //       'THURSDAY',
  //       'FRIDAY',
  //     ],

  //     startTime: '08:00',
  //     endTime: '18:00',

  //     isActive: true,
  //   },
  // });

  console.log('✅ Schedule created');

  // =========================================
  // ATTENDANCE LOG
  // =========================================

  await prisma.attendanceLog.create({
    data: {
      roomId: room.id,
      className: 'CNTT K17',
      period: 1,
      count: 35,
      imageUrl: 'https://picsum.photos/400/300',
    },
  });

  console.log('✅ Attendance log created');

  console.log('✨ SEED COMPLETED');
}

main()
  .catch((error) => {
    console.error('❌ SEED ERROR:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });