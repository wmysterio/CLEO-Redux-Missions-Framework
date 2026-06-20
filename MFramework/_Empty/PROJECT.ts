import { BaseProject } from "../BaseProject";
import { STORY00 } from "./STORY00";

export class PROJECT extends BaseProject {

    public constructor() {
        super();
        this.addStoryline(STORY00); // 0
    }

}