import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { Appointment } from './entities/appointment.entity';

@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  async createAppointment(@Body() createAppointmentDto: CreateAppointmentDto): Promise<Appointment> {
    return this.appointmentsService.createAppointment(createAppointmentDto);
  }

  @Get('find-by-provider')
  async findByProvider(@Query('providerId') providerId: string): Promise<Appointment[]> {
    return this.appointmentsService.findByProvider(providerId);
  }

  @Get('schedules/:id')
  async getSchedules(@Param('id') id: string) {
    return this.appointmentsService.getSchedulesById(id);
  }
  
  // @Delete(':id')
  // async removeAppointment(@Param('id') id: string) {
  //   return this.appointmentsService.remove(+id);
  // }

  // @Get()
  // findAll() {
  //   return this.appointmentsService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.appointmentsService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateAppointmentDto: UpdateAppointmentDto) {
  //   return this.appointmentsService.update(+id, updateAppointmentDto);
  // }
}
