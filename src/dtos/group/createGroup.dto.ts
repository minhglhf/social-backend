import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";
import { Privacy } from 'src/utils/enums';

export class NewGroupInput {
    @ApiProperty({ type: String, description: 'group name' })
    @IsString()
    groupName: string;
    // @ApiProperty({
    //     type: 'string',
    //     format: 'binary',
    //     required: false,
    //     description: 'group image background, nhớ bỏ check send empty value',
    // })
    // coverImage: any;
    @ApiProperty({ type: String, enum: Privacy, description: 'Chọn quyền riêng tư của groups' })
    privacy: Privacy;
}