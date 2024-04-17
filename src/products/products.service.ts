import { Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaClient } from '@prisma/client';
import { PaginationDto } from 'src/common';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('ProductsService');

  async onModuleInit() {
    await this.$connect();
    this.logger.log("Database connected")
    
  }
  create(createProductDto: CreateProductDto) {
    return this.product.create({
      data:createProductDto
    })
    return 'This action adds a new product';
  }

  async findAll(pagination:PaginationDto) {
    const {page,limit} = pagination;
    const totalPages = await this.product.count({where:{active:true}});
    const lastPage = Math.ceil(totalPages/limit);
    const data = await this.product.findMany({
      skip: (page -1) * limit,
      take:limit,
      where:{active:true}
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
    const data = await this.product.findFirst({where:{id,active:true}})
    if(!data) throw new NotFoundException(`No found product by id #${id}`);
    return data;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const {id:_ , ...res}= updateProductDto;
    await this.findOne(id);
    return await this.product.update({
      where: {id},
      data:res
    })
    return `This action updates a #${id} product`;
  }

  async remove(id: number) {
    await this.findOne(id);
    return await this.product.update({
      where: {id},
      data:{active:false}
    })
    // return await this.product.delete({where:{id}});
  }
}
