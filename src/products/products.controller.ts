import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Inject,
  Query,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { PaginationDTO } from 'src/common/dto/pagination.dto';
import { ParseIdPipe } from './pipe/parseId.pipe';
import { catchError } from 'rxjs';
import { NATS_SERVICE } from 'src/config/nats.config';

@Controller('products')
export class ProductsController {
  constructor(
    @Inject(NATS_SERVICE) private readonly natsClient: ClientProxy,
  ) {}

  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.natsClient
      .send({ cmd: 'product.create' }, createProductDto)
      .pipe(
        catchError((error) => {
          throw new RpcException(error);
        }),
      );
  }

  @Get()
  findAll(@Query() paginationDTO: PaginationDTO) {
    return this.natsClient
      .send({ cmd: 'product.find_all' }, paginationDTO)
      .pipe(
        catchError((error) => {
          throw new RpcException(error);
        }),
      );
  }

  @Get(':id')
  findOne(@Param('id', ParseIdPipe) id: number) {
    return this.natsClient
      .send({ cmd: 'product.find_one' }, { id })
      .pipe(
        catchError((error) => {
          throw new RpcException(error);
        }),
      );
  }

  @Patch(':id')
  update(
    @Param('id', ParseIdPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.natsClient
      .send({ cmd: 'product.update' }, { ...updateProductDto, id })
      .pipe(
        catchError((error) => {
          throw new RpcException(error);
        }),
      );
  }

  @Delete(':id')
  remove(@Param('id', ParseIdPipe) id: number) {
    return this.natsClient
      .send({ cmd: 'product.delete' }, { id })
      .pipe(
        catchError((error) => {
          throw new RpcException(error);
        }),
      );
  }
}
