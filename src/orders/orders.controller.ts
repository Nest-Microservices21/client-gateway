import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { CreateOrderDto } from './dto/create-order.dto';
import { ParseIdPipe } from 'src/products/pipe/parseId.pipe';
import { catchError } from 'rxjs';
import { OrderPaginationDto } from './dto/order-pagination.dto';
import { PatchOrderDto } from './dto/update-order.dto';
import { NATS_SERVICE } from 'src/config/nats.config';
@Controller('orders')
export class OrdersController {
  constructor(
    @Inject(NATS_SERVICE) private readonly natsClient: ClientProxy,
  ) {}
  @Get()
  async findAll(@Query() paginationDTO: OrderPaginationDto) {
    return this.natsClient.send({ cmd: 'orders.find_all' }, paginationDTO);
  }
  @Get(':id')
  async findOne(@Param('id', ParseIdPipe) id: number) {
    return this.natsClient.send({ cmd: 'orders.find_one' }, { id }).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }
  @Post()
  async create(@Body() createOrderDto: CreateOrderDto) {
    return this.natsClient
      .send({ cmd: 'orders.create' }, createOrderDto)
      .pipe(
        catchError((error) => {
          throw new RpcException(error);
        }),
      );
  }
  @Patch(':id')
  changeOrderStatus(
    @Param('id', ParseIdPipe) id: number,
    @Body() createOrderDto: PatchOrderDto,
  ) {
    return this.natsClient
      .send({ cmd: 'orders.change_order_status' }, { id, ...createOrderDto })
      .pipe(
        catchError((error) => {
          throw new RpcException(error);
        }),
      );
  }
}
