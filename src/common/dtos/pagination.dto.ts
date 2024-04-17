import { Type } from "class-transformer";
import { IsNumber, IsOptional, IsPositive, IsString, Min } from "class-validator";

export class PaginationDto {
    @IsPositive()
    @IsOptional()
    @Type(()=> Number)
    page?:number;

    @IsPositive()
    @IsOptional()
    @Type(()=> Number)
    limit:number;
}
