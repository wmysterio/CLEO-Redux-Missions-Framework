import { Core } from "./Core";

/** Abstract base class for managing projects and their associated storylines. */
export abstract class BaseProject {

    /** Initializes a new project, creates an array of storylines, and registers it with the Core. */
    public constructor() {
        Core.RegisterProject(this);
    }

    /**
     * Returns the root directory of the project.
     * @returns The path to the project's root directory.
     * @remarks Derived classes must implement this method using `__dirname`.
     */
    public abstract getRootDirectory(): string;

}