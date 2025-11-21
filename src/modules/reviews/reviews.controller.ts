import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiConsumes } from '@nestjs/swagger';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  // Reseñas hacia un proeveedor
  @Post('createReviewProvider')
  @UseInterceptors(FilesInterceptor('files', 5))
  @ApiConsumes('multipart/form-data')
  createReviewProvider(
    @Body() dto: CreateReviewDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.reviewsService.createReviewProvider(dto, files);
  }
  // Reseñas hacia un usuario
  @Post('createReviewClient')
  @UseInterceptors(FilesInterceptor('files', 5))
  @ApiConsumes('multipart/form-data')
  createReviewClient(
    @Body() dto: CreateReviewDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.reviewsService.createReviewClient(dto, files);
  }
  // Reseñas hacia un proveedor
  @Get('/provider/:id')
  findByProvider(@Param('id') id: string) {
    return this.reviewsService.findByProvider(id);
  }
  // Reseñas hacia un usuario
  @Get('/user/:id')
  findByUser(@Param('id') id: string) {
    return this.reviewsService.findByUser(id);
  }

  // Promedio de calificación de un proveedor
  @Get('/provider/:id/average')
  getAverageProvider(@Param('id') id: string) {
    return this.reviewsService.getAverageRatingForProvider(id);
  }

  // Promedio de calificación de un usuario
  @Get('/user/:id/average')
  getAverageUser(@Param('id') id: string) {
    return this.reviewsService.getAverageRatingForUser(id);
  }

  @Get('/order/:orderId/validate')
  validateReview(@Param('orderId') orderId: string) {
    return this.reviewsService.validateReviewStatus(orderId);
  }

  @Get('/provider/:providerId/service/:serviceId/reviews')
  getReviewsByProviderAndService(
    @Param('providerId') providerId: string,
    @Param('serviceId') serviceId: string,
  ) {
    return this.reviewsService.getReviewsByProviderAndService(
      providerId,
      serviceId,
    );
  }
}
