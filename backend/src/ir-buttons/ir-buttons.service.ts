import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateIRButtonDto,
  UpdateIRButtonDto,
} from './dto/create-ir-button.dto';
import { ButtonCode } from 'src/enums/btn-code.enum';

@Injectable()
export class IrButtonsService {
  constructor(private prisma: PrismaService) {}
  async getAllIRButtons() {
    return this.prisma.iRButton.findMany({
      include: { brand: true },
      orderBy: { buttonName: 'asc' },
    });
  }
  async createIRButton(dto: CreateIRButtonDto) {
    const button = await this.prisma.iRButton.create({
      data: {
        brandId: dto.brandId,
        buttonName: dto.buttonName,
        irCode: dto.irCode.trim(),
        irName: dto.irName.trim(),
        description: dto.description,
      },
      include: { brand: true },
    });

    return button;
  }

  async getIRButtonsByBrand(brandId: string) {
    return this.prisma.iRButton.findMany({
      where: { brandId },
      include: { brand: true },
      orderBy: { buttonName: 'asc' },
    });
  }

  async getIRButton(id: string) {
    const button = await this.prisma.iRButton.findUnique({
      where: { id },
      include: { brand: true },
    });

    if (!button) throw new NotFoundException('IR Button not found');
    return button;
  }

  async updateIRButton(id: string, dto: UpdateIRButtonDto) {
    return this.prisma.iRButton.update({
      where: { id },
      data: dto,
      include: { brand: true },
    });
  }

  async deleteIRButton(id: string) {
    await this.prisma.iRButton.delete({ where: { id } });
    return { message: 'IR Button deleted successfully' };
  }

  // ====================== HELPER ======================

}
