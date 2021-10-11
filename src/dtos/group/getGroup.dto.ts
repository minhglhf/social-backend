import { ApiProperty } from "@nestjs/swagger";
import { Group } from "src/entities/group.entity";

export class GroupsList {
    yourGroup: Group[]
    joinedGroup: Group[]
}