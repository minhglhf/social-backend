import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class SendChat {
    @ApiProperty({ type: String, required: true })
    @IsString()
    received: string
    @ApiProperty({ type: String, required: true })
    @IsString()
    content: string
}