import {  HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaClient } from '@prisma/client';
import { PaginationDto } from 'src/common';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('ProductsService');

  async onModuleInit() {
    await this.$connect();
    this.logger.log("Database connected")

  }
  create(createProductDto: CreateProductDto) {
    return this.product.create({
      data: createProductDto
    })
  }

  async findAll(pagination: PaginationDto) {
    const { page, limit } = pagination;
    const totalPages = await this.product.count({ where: { available: true } });
    const lastPage = Math.ceil(totalPages / limit);
    const data = await this.product.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where: { available: true }
    })


    return {
      data,
      meta: {
        page,
        totalPages,
        lastPage
      }
    }
  }

  async findOne(id: number) {
    const data = await this.product.findFirst({ where: { id, available: true } })
    // if (!data) throw new NotFoundException(`No found product by id #${id}`);
    if (!data) throw new RpcException({
      message:`No found product by id #${id}`,
      status: HttpStatus.NOT_FOUND
    });

    return data;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const { id: _, ...res } = updateProductDto;
    await this.findOne(id);
    return await this.product.update({
      where: { id },
      data: res
    })
    return `This action updates a #${id} product`;
  }

  async remove(id: number) {
    await this.findOne(id);
    return await this.product.update({
      where: { id },
      data: { available: false }
    })
    // return await this.product.delete({where:{id}});
  }


  async validateProducts( ids:number[] ){
    ids = Array.from(new Set(ids));
    const products = await this.product.findMany({
      where: {id:{in:ids}}
    })
    if(ids.length !== products.length){
      throw new RpcException({
        message: `Some products were not found`
      })
    }

    return products;
  }
}
