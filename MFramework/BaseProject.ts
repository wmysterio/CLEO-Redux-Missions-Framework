import { BaseStoryline } from "./BaseStoryline";
import { Core } from "./Core";

/** Abstract base class for managing projects and their associated storylines. */
export abstract class BaseProject {

    public author: string = "";
    public version: string = "";



    /**
     * Registers a storyline in the core system.
     * @param storyline - The storyline to register.
     */
    public addStoryline<TBaseStoryline extends BaseStoryline>(baseStorylineType: new () => TBaseStoryline) {
        Core.RegisterStoryline(baseStorylineType);
    }

}