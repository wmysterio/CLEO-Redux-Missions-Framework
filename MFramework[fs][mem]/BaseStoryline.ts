import { Core } from "./Core";

/** Abstract base class for managing storylines and their associated missions. */
export abstract class BaseStoryline {

    /** Initializes a new storyline, registering it with the Core and associating registered missions. */
    public constructor() {
        Core.RegisterStoryline(this);
    }

}