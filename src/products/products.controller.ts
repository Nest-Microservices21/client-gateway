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
import { PRODUCTS_SERVICE } from 'src/config/products.config';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { PaginationDTO } from 'src/common/dto/pagination.dto';
import { ParseIdPipe } from './pipe/parseId.pipe';
import { catchError } from 'rxjs';

@Controller('products')
export class ProductsController {
  constructor(
    @Inject(PRODUCTS_SERVICE) private readonly productsClient: ClientProxy,
  ) {}

  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsClient.send({ cmd: 'product.create' }, createProductDto);
  }

  @Get()
  findAll(@Query() paginationDTO: PaginationDTO) {
    return this.productsClient.send({ cmd: 'product.find_all' }, paginationDTO);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIdPipe) id: number) {
    return this.productsClient.send({ cmd: 'product.find_one' }, { id }).pipe(
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
    return this.productsClient
      .send({ cmd: 'product.update' }, { ...updateProductDto, id })
      .pipe(
        catchError((error) => {
          throw new RpcException(error);
        }),
      );
  }

  @Delete(':id')
  remove(@Param('id', ParseIdPipe) id: number) {
    return this.productsClient.send({ cmd: 'product.delete' }, { id }).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }
}
