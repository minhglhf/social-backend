import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";
import { GroupMemberRole } from "src/utils/enums";

export class AddMemberInput {
    @ApiProperty({ type: String, required: true })
    @IsString()
    groupId: string
    @ApiProperty({ type: String, required: true })
    @IsString()
    userId: string
}