import { BaseScript } from "./BaseScript";

/** Represents a single action in a scripted scene sequence, such as a wait, condition, or executable action. */
class ScriptedSceneAction {

    public duration: int;
    public condition: () => boolean;
    public action: () => void;



    /**
     * Creates a scripted scene action.
     * @param duration - Duration to wait in milliseconds (default: -1).
     * @param condition - Condition to check for continuation (default: undefined).
     * @param action - Action to perform (default: undefined).
     */
    public constructor(duration: int = -1, condition: () => boolean = undefined, action: () => void = undefined) {
        this.duration = duration;
        this.condition = condition;
        this.action = action;
    }

}

/** Provides a chaining interface for adding actions to a scripted scene sequence. */
export interface ISequenceChaining {

    /**
     * Gets the array of actions in the scripted scene sequence.
     * @remarks Used for internal framework operations. Do not change directly!
     */
    get actionsSequence(): ScriptedSceneAction[];

    /**
     * Adds an executable action to the scripted scene's sequence.
     * @param action - The action to perform in the sequence.
     * @returns This chaining object for further configuration.
     */
    action(action: () => void): ISequenceChaining;

    /**
     * Adds a wait action to the scripted scene's sequence for the specified time.
     * @param duration - Duration to wait in milliseconds.
     * @returns This chaining object for further configuration.
     */
    wait(duration: int): ISequenceChaining;

    /**
     * Adds a conditional wait action to the scripted scene's sequence until the condition is met.
     * @param condition - The condition to check for continuation.
     * @returns This chaining object for further configuration.
     */
    waitUntil(condition: () => boolean): ISequenceChaining;

}

/** Base class for scripted scenes. */
export abstract class BaseScriptedScene extends BaseScript implements ISequenceChaining {

    private _sequenceActions: ScriptedSceneAction[];
    private _decisionMakerChar: DecisionMakerChar;
    private _chars: Char[];
    private _cars: Car[];
    private _scriptObjects: ScriptObject[];

    /** Determines whether to apply global game world settings to the scripted scene. */
    public useWorldSettings: boolean;

    /**
     * The array of actions in the scripted scene sequence.
     * @remarks Used for internal framework operations. Do not change directly!
     */
    public get actionsSequence(): ScriptedSceneAction[] {
        return this._sequenceActions;
    }



    /**
     * Handles the scripted scene initialization event, called before the scene starts.
     * @remarks Used for internal framework operations. Do not call directly!
     */
    public onInitEvent(): void {
        super.onInitEvent();
        this._sequenceActions = new Array<ScriptedSceneAction>();
        this._chars = new Array<Char>();
        this._cars = new Array<Car>();
        this._scriptObjects = new Array<ScriptObject>();
        this._decisionMakerChar = this.createClearedDecisionMakerChar();
        this.useWorldSettings = true;
    }

    /**
     * Handles the scripted scene run event by executing the sequence of scripted actions.
     * @remarks Do not use the `{@link Camera.DoFade}` method during a scripted scene. There may be bugs!
     * @remarks Do not use the `{@link wait}` method during a scripted scene. There may be bugs!
     */
    public onRunEvent(): void { }

    /**
     * Handles the scripted scene end event, called when the scene ends.
     * @remarks Used for internal framework operations. Do not call directly!
     */
    public onEndEvent(): void {
        super.onEndEvent();
        this._deleteEntities();
    }



    public action(action: () => void): ISequenceChaining {
        this._sequenceActions.push(new ScriptedSceneAction(-1, undefined, action));
        return this;
    }

    public wait(duration: int): ISequenceChaining {
        this._sequenceActions.push(new ScriptedSceneAction(0 > duration ? 0 : duration, undefined, undefined));
        return this;
    }

    public waitUntil(condition: () => boolean): ISequenceChaining {
        this._sequenceActions.push(new ScriptedSceneAction(-1, condition, undefined));
        return this;
    }



    /**
     * Creates a script object and adds it to the auto-delete list.
     * @param scriptObjectModelId - The model ID of the script object (must be loaded).
     * @param x - X coordinate of the script object.
     * @param y - Y coordinate of the script object.
     * @param z - Z coordinate of the script object.
     * @returns The created script object.
     */
    public addScriptObject(scriptObjectModelId: int, x: float, y: float, z: float): ScriptObject {
        return this._prepareScriptObject(ScriptObject.Create(scriptObjectModelId, x, y, z));
    }

    /**
     * Creates a vehicle and adds it to the auto-delete list.
     * @param carModelId - The model ID of the vehicle (must be loaded).
     * @param x - X coordinate of the vehicle.
     * @param y - Y coordinate of the vehicle.
     * @param z - Z coordinate of the vehicle.
     * @param heading - Vehicle's heading in degrees (default: 0.0).
     * @param color1 - Primary color of the vehicle (default: -1 for random).
     * @param color2 - Secondary color of the vehicle (default: -1 for random).
     * @returns The created vehicle.
     */
    public addCar(carModelId: int, x: float, y: float, z: float, heading: float = 0.0, color1: int = -1, color2: int = -1): Car {
        const car = Car.Create(carModelId, x, y, z).setHeading(heading)
        if (color1 > -1 || color2 > -1)
            car.changeColor(color1, color2)
        return this._prepareCar(car);
    }

    /**
     * Creates a character and adds it to the auto-delete list.
     * @param charModelId - The model ID of the character (must be loaded).
     * @param x - X coordinate of the character.
     * @param y - Y coordinate of the character.
     * @param z - Z coordinate of the character.
     * @param heading - Character's heading in degrees (default: 0.0).
     * @returns The created character.
     */
    public addChar(charModelId: int, x: float, y: float, z: float, heading: float = 0.0): Char {
        return this._prepareChar(Char.Create(31, charModelId, x, y, z).setHeading(heading));
    }

    /**
     * Creates a character inside a vehicle and adds it to the auto-delete list.
     * @param charModelId - The model ID of the character (must be loaded).
     * @param car - The vehicle for the character to occupy (must exist).
     * @param seat - The seat index for the character, or -1 for driver (default: -1).
     * @returns The created character.
     */
    public addCharInsideCar(charModelId: int, car: Car, seat: int = -1): Char {
        if (seat === -1)
            return this._prepareChar(Char.CreateInsideCar(car, 31, charModelId));
        return this._prepareChar(Char.CreateAsPassenger(car, 31, charModelId, seat));
    }

    /**
     * Creates a character facing the specified character and adds it to the auto-delete list.
     * @param charModelId - The model ID of the character (must be loaded).
     * @param target - The target character to face (must exist).
     * @param relativeDistance - The distance between the characters (default: 1.0).
     * @returns The created character.
     */
    public addCharFacingChar(charModelId: int, target: Char, relativeDistance: float = 1.0): Char {
        const position = target.getOffsetInWorldCoords(0.0, relativeDistance, 0.0);
        return this.addChar(charModelId, position.x, position.y, position.z, target.getHeading() + 180.0);
    }

    /**
     * Makes the character perform an animation.
     * @param char - The character to animate (must exist).
     * @param animationName - The name of the animation.
     * @param animationFile - The IFP file containing the animation (must be loaded).
     * @param time - Duration of the animation in milliseconds.
     * @param facialTalk - If true, enables facial talking during the animation (default: true).
     */
    public playAnim(char: Char, animationName: string, animationFile: string, time: int, facialTalk: boolean = true): void {
        Task.PlayAnim(char, animationName, animationFile, 4.0, false, false, false, false, time);
        if (facialTalk)
            char.startFacialTalk(time);
    }

    /**
     * Makes a character perform an animation that affects only the upper half of their body.
     * @param char - The character to animate (must exist).
     * @param animationName - The name of the animation.
     * @param animationFile - The IFP file containing the animation (must be loaded).
     * @param time - Duration of the animation in milliseconds.
     * @param facialTalk - If true, enables facial talking during the animation (default: true).
     */
    public playAnimSecondary(char: Char, animationName: string, animationFile: string, time: int, facialTalk: boolean = true): void {
        Task.PlayAnimSecondary(char, animationName, animationFile, 4.0, false, false, false, false, time);
        if (facialTalk)
            char.startFacialTalk(time);
    }



    private _prepareChar(char: Char): Char {
        this._chars.push(char);
        const dm = +this._decisionMakerChar;
        return char.shutUp(true).setHealth(10000).addArmor(100).setRelationship(0, 0).setRelationship(0, 31)
            .setProofs(true, true, true, true, true).setMoney(0).setDropsWeaponsWhenDead(false)
            .setDrownsInWater(false).setDecisionMaker(dm);
    }

    private _prepareCar(car: Car): Car {
        this._cars.push(car);
        return car.setHealth(10000).setCanBurstTires(false).lockDoors(1).setProofs(true, true, true, true, true);
    }

    private _prepareScriptObject(scriptObject: ScriptObject): ScriptObject {
        this._scriptObjects.push(scriptObject);
        return scriptObject.setHealth(10000).setProofs(true, true, true, true, true);
    }

    private _deleteEntities(): void {
        this._scriptObjects.forEach(obj => { obj.markAsNoLongerNeeded().delete(); });
        this._chars.forEach(char => { char.markAsNoLongerNeeded().delete(); });
        this._cars.forEach(car => { car.markAsNoLongerNeeded().delete(); });
        this._decisionMakerChar.remove();
    }

}