import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Appointment } from './entities/appointment.entity';
import { Schedule } from '../providers/entities/schedule.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
  ) {}

  async createAppointment(dto: CreateAppointmentDto): Promise<Appointment> {
    const { providerId, userId, scheduleId, startTime, endTime } = dto;

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (start >= end) {
      throw new BadRequestException('El comienzo debe estar antes del final de la cita');
    }

    const schedule = await this.scheduleRepository.findOne({
      where: { id: scheduleId, provider: { id: providerId } },
    });

    if (!schedule) {
      throw new BadRequestException('Horario no encontrado para este proveedor');
    }

    // Verificar que la cita está dentro del horario de atención
    const scheduleStart = new Date(`1970-01-01T${schedule.startTime}:00Z`);
    const scheduleEnd = new Date(`1970-01-01T${schedule.endTime}:00Z`);

    if (
      start.getUTCHours() < scheduleStart.getUTCHours() ||
      end.getUTCHours() > scheduleEnd.getUTCHours()
    ) {
      throw new BadRequestException('Appointment is outside the schedule');
    }

    // Verificar que no haya superposición con otras citas
    const overlappingAppointments = await this.appointmentRepository.find({
      where: { provider: { id: providerId }, schedule: { id: scheduleId } },
    });

    const hasOverlap = overlappingAppointments.some((appointment) => {
      const existingStart = new Date(appointment.startTime);
      const existingEnd = new Date(appointment.endTime);

      return (
        (start >= existingStart && start < existingEnd) || // Nueva cita comienza dentro de una existente
        (end > existingStart && end <= existingEnd) || // Nueva cita termina dentro de una existente
        (start <= existingStart && end >= existingEnd) // Nueva cita abarca completamente una existente
      );
    });

  if (hasOverlap) {
    throw new BadRequestException('El horario no se encuentra disponible para realizar una cita');
  }

    const appointment = this.appointmentRepository.create({
      provider: { id: providerId },
      schedule: { id: scheduleId },
      user: { id: userId },
      startTime: start,
      endTime: end,
    });

    return this.appointmentRepository.save(appointment);
  }

  async findByProvider(providerId: string): Promise<Appointment[]> {
    return this.appointmentRepository.find({
      where: { provider: { id: providerId } },
    });
  }

  async getSchedulesById(providerId: string): Promise<Schedule[]> {
    const schedules = await this.scheduleRepository.find({
        where: { provider: { id: providerId } },
    });
  
    if (!schedules || schedules.length === 0) {
        throw new NotFoundException(`No se encontraron horarios para el proveedor con ID ${providerId}`);
    }
  
    return schedules;
  }

  // findAll() {
  //   return `This action returns all appointments`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} appointment`;
  // }

  // update(id: number, updateAppointmentDto: UpdateAppointmentDto) {
  //   return `This action updates a #${id} appointment`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} appointment`;
  // }
}
