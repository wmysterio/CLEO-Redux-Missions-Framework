import { AudioPlayer } from "./AudioPlayer";
import { BaseScript } from "./BaseScript";
import { BaseScriptedScene } from "./BaseScriptedScene";
import { Core } from "./Core";
import { GxtTime } from "./GxtTime";


/** Abstract base class for game missions, extending script functionality with mission-specific logic. */
export abstract class BaseMission extends BaseScript {

    private _backgroundAudio: AudioPlayer;
    private _successBigMessage: GxtTime;
    private _failureBigMessage: GxtTime;
    private _failureSmallMessage: GxtTime;
    private _projectIndex: int;
    private _cashReward: int;
    private _respectReward: int;
    private _isSuccessSoundEnabled: boolean;
    private _hasSavedPlayerWeapons: boolean;
    private _savedPlayerWeaponsAmmo: int[];
    private _decisionMakersChar: DecisionMakerChar[];
    private _chars: Char[];
    private _cars: Car[];
    private _scriptObjects: ScriptObject[];
    private _blips: Blip[];
    private _pickups: Pickup[];

    public enableProgressSaving: boolean;
    public enableTitleMessage: boolean;
    public stage: int;

    /** Gets the player group in the game. */
    public get playerGroup(): Group {
        return Core.PlayerGroup;
    }

    /** Gets the audio player for background music. */
    public get backgroundAudio(): AudioPlayer {
        return this._backgroundAudio;
    }

    /** Gets the current game difficulty level for mission-specific logic. */
    public get gameDifficulty(): int {
        return Core.GameDifficulty;
    }

    /** Gets the big message displayed on mission failure. */
    public get failureBigMessage(): GxtTime {
        return this._failureBigMessage;
    }

    /** Gets the small message displayed on mission failure. */
    public get failureSmallMessage(): GxtTime {
        return this._failureSmallMessage;
    }

    /** Gets the big message displayed on mission success. */
    public get successBigMessage(): GxtTime {
        return this._successBigMessage;
    }

    /**
     * Sets the big text notification for mission failure.
     * @param gxt - The GXT key for the failure message.
     */
    public set failureBigMessage(gxt: string) {
        this._failureBigMessage.gxt = gxt;
    }

    /**
     * Sets the cash reward for mission success.
     * @param money - The amount of cash to reward.
     */
    public set cashReward(money: int) {
        this._cashReward = money;
    }

    /** Gets a cash reward on success. */
    public get cashReward(): int {
        return this._cashReward;
    }

    /**
     * Sets the respect reward for mission success.
     * @param respect - The amount of respect to reward.
     */
    public set respectReward(respect: int) {
        this._respectReward = respect;
    }

    /** Gets respect on success mission. */
    public get respectReward(): int {
        return this._respectReward;
    }

    /**
     * Sets whether to play a sound notification on successful mission completion.
     * @param state - True to enable the success sound, false otherwise.
     */
    public set successSound(state: boolean) {
        this._isSuccessSoundEnabled = state;
    }

    /** Gets whether the success sound notification is enabled for mission completion. */
    public get successSound(): boolean {
        return this._isSuccessSoundEnabled;
    }



    /** Initializes a new instance of the BaseMission and registers it with the Core. */
    public constructor() {
        super();
        Core.RegisterMission(this);
        this._projectIndex = Core.ActiveMissionInfo.projectIndex;
    }



    /**
     * Handles the mission initialization event, called before the mission starts.
     * @remarks `Used for internal framework operations. Do not call directly!`
     */
    public onInitEvent(): void {
        super.onInitEvent();
        this._backgroundAudio = new AudioPlayer(this._projectIndex);
        this._successBigMessage = new GxtTime("M_PASSD", 5000);
        this._failureSmallMessage = new GxtTime();
        this._failureBigMessage = new GxtTime("M_FAIL", 5000);
        this._hasSavedPlayerWeapons = false;
        this._savedPlayerWeaponsAmmo = new Array<int>();
        this._decisionMakersChar = new Array<DecisionMakerChar>();
        this._chars = new Array<Char>();
        this._cars = new Array<Car>();
        this._scriptObjects = new Array<ScriptObject>();
        this._blips = new Array<Blip>();
        this._pickups = new Array<Pickup>();
        this._setupDecisionMakers();
        this._cashReward = 0;
        this._respectReward = 0;
        this._isSuccessSoundEnabled = true;
        this.enableProgressSaving = true;
        this.enableTitleMessage = true;
        this.stage = 0;
    }

    /**
     * Handles the mission availability check event before launch.
     * @returns True if the mission can start, false otherwise.
     */
    public onCheckStartConditions(): boolean {
        return true;
    }

    /** Handles the mission update event, called each frame during the mission. */
    public onUpdateEvent(): void { }

    /** Handles the mission success event, called when the mission is completed successfully. */
    public onSuccessEvent(): void { }

    /** Handles the mission failure event, called when the mission fails. */
    public onFailureEvent(): void { }

    public onEndEvent(): void {
        super.onEndEvent();
        this._backgroundAudio.unload();
        this._restorePlayerWeapons();
        this.deleteAllAddedEntities();
        this._decisionMakersChar.forEach(dm => { dm.remove(); });
        this._decisionMakersChar = new Array<DecisionMakerChar>();
    }



    /**
     * Plays a scripted scene for the mission.
     * @param scriptedSceneType - The constructor for a BaseScriptedScene subclass.
     * @param debugMode - If true, enables manual control for debugging (default: false).
     */
    public playScriptedScene<TScriptedScene extends BaseScriptedScene>(scriptedSceneType: new () => TScriptedScene, debugMode: boolean = false): void {
        let scriptedScene = new scriptedSceneType();
        Core.RunScriptedScene(scriptedScene, debugMode);
        scriptedScene = null;
    }

    /**
     * Aborts the mission with a success notification, displaying the specified GXT message.
     * @param bigMessageGxt - The GXT key for the success message (default: "M_PASSD").
     */
    public complete(): void {
        Restart.CancelOverride();
        throw Core.MISSION_SUCCESS_ERROR;
    }

    /**
     * Aborts the mission with a failure notification, displaying the specified GXT message.
     * @param reasonSmallMessageGxt - The GXT key for the failure message (default: "DUMMY").
     * @param duration - Duration of the failure message in milliseconds (default: 5000).
     */
    public fail(reasonSmallMessageGxt: string = "DUMMY", duration: int = 5000): void {
        Restart.CancelOverride();
        this._failureSmallMessage.gxt = reasonSmallMessageGxt;
        this._failureSmallMessage.duration = duration;
        throw Core.MISSION_FAILURE_ERROR;
    }

    /**
     * Gets the storyline progress, clamped between 0 and the total number of missions.
     * @param storylineIndex - The index of the storyline.
     * @returns The last successfully completed mission index.
     */
    public getStorylineProgress(storylineIndex: int): int {
        return Core.GetStorylineInfoAt(this._projectIndex, storylineIndex).progress;
    }

    /** Saves the player's weapons and their ammo, then removes all weapons from the player. */
    public savePlayerWeapons(): void {
        if (this._hasSavedPlayerWeapons)
            return;
        this._hasSavedPlayerWeapons = true;
        for (let i = 0; i < 47; ++i)
            this._savedPlayerWeaponsAmmo.push(this.playerChar.hasGotWeapon(i) ? this.playerChar.getAmmoInWeapon(i) : 0);
        this.playerChar.removeAllWeapons();
    }

    /**
     * Writes an integer value to the save file for for the current project.
     * @param key - The key to write the value under.
     * @param value - The integer value to write.
     */
    public writeIntValueToSaveFile(key: string, value: int): void {
        Core.WriteIntValueToSaveFile(this._projectIndex, key, value);
    }

    /**
     * Reads an integer value from the save file for the current project.
     * @param key - The key to read the value from.
     * @param defaultValue - The default value to return if the key is not found (default: 0).
     * @returns The integer value from the save file, or the default value if not found.
     */
    public readIntValueFromSaveFile(key: string, defaultValue: int = 0): int {
        return Core.ReadIntValueFromSaveFile(this._projectIndex, key, defaultValue);
    }

    /**
     * Sets the restart position for the player in case of death or arrest.
     * @param x - X coordinate of the restart position.
     * @param y - Y coordinate of the restart position.
     * @param z - Z coordinate of the restart position.
     * @param heading - Player's heading in degrees (default: 0.0).
     */
    public setNextRestartPosition(x: float, y: float, z: float, heading: float = 0.0): void {
        Restart.OverrideNext(x, y, z, heading);
    }

    /**
     * Creates a blip above the pickup and adds it to the auto-delete list.
     * @param pickup - The pickup to add the blip for (must exist).
     * @param asFriendly - If true, the blip is marked as friendly (default: true).
     * @param blipDisplay - The display mode for the blip (default: 3).
     * @returns The created blip.
     */
    public addBlipToPickup(pickup: Pickup, asFriendly: boolean = true, blipDisplay: int = 3): Blip {
        return this._prepareBlip(Blip.AddForPickup(pickup), asFriendly, blipDisplay);
    }

    /**
     * Creates a blip above the character and adds it to the auto-delete list.
     * @param char - The character to add the blip for (must exist).
     * @param asFriendly - If true, the blip is marked as friendly (default: false).
     * @param blipDisplay - The display mode for the blip (default: 3).
     * @returns The created blip.
     */
    public addBlipToChar(char: Char, asFriendly: boolean = false, blipDisplay: int = 3): Blip {
        return this._prepareBlip(Blip.AddForChar(char), asFriendly, blipDisplay);
    }

    /**
     * Creates a blip above the vehicle and adds it to the auto-delete list.
     * @param car - The vehicle to add the blip for (must exist).
     * @param asFriendly - If true, the blip is marked as friendly (default: false).
     * @param blipDisplay - The display mode for the blip (default: 3).
     * @returns The created blip.
     */
    public addBlipToCar(car: Car, asFriendly: boolean = false, blipDisplay: int = 3): Blip {
        return this._prepareBlip(Blip.AddForCar(car), asFriendly, blipDisplay);
    }

    /**
     * Creates a blip above the script object and adds it to the auto-delete list.
     * @param scriptObject - The script object to add the blip for (must exist).
     * @param asFriendly - If true, the blip is marked as friendly (default: false).
     * @param blipDisplay - The display mode for the blip (default: 3).
     * @returns The created blip.
     */
    public addBlipToScriptObject(scriptObject: ScriptObject, asFriendly: boolean = false, blipDisplay: int = 3): Blip {
        return this._prepareBlip(Blip.AddForObject(scriptObject), asFriendly, blipDisplay);
    }

    /**
     * Creates a pickup and adds it to the auto-delete list.
     * @param modelId - The model ID of the pickup (must be loaded).
     * @param x - X coordinate of the pickup.
     * @param y - Y coordinate of the pickup.
     * @param z - Z coordinate of the pickup.
     * @returns The created pickup.
     */
    public addPickup(modelId: int, x: float, y: float, z: float): Pickup {
        const pickup = Pickup.Create(modelId, 3, x, y, z);
        this._pickups.push(pickup);
        return pickup;
    }

    /**
     * Creates a weapon pickup with ammo and adds it to the auto-delete list.
     * @param weaponType - The type ID of the weapon.
     * @param ammo - The amount of ammo for the pickup.
     * @param x - X coordinate of the pickup.
     * @param y - Y coordinate of the pickup.
     * @param z - Z coordinate of the pickup.
     * @param playerAmmoLimit - If true, limits the player's ammo and moves the pickup to an inaccessible location if the limit is exceeded (default: false).
     * @returns The created pickup.
     */
    public addPickupWithAmmo(weaponType: int, ammo: int, x: float, y: float, z: float, playerAmmoLimit: boolean = false): Pickup {
        if (playerAmmoLimit && this.playerChar.hasGotWeapon(weaponType)) {
            const weaponAmmo = this.playerChar.getAmmoInWeapon(weaponType);
            if (ammo > weaponAmmo) {
                ammo -= weaponAmmo;
            } else {
                z = -1000.0;
            }
        }
        const pickup = Pickup.CreateWithAmmo(Weapon.GetModel(weaponType), 3, ammo, x, y, z);
        this._pickups.push(pickup);
        return pickup;
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
        const car = Car.Create(carModelId, x, y, z).setHeading(heading).lockDoors(1);
        if (color1 > -1 || color2 > -1)
            car.changeColor(color1, color2)
        this._cars.push(car);
        return car;
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
        const object = ScriptObject.Create(scriptObjectModelId, x, y, z);
        this._scriptObjects.push(object);
        return object;
    }

    /**
     * Creates a character with friendly AI and adds it to the auto-delete list.
     * @param modelId - The model ID of the character (must be loaded).
     * @param x - X coordinate of the character.
     * @param y - Y coordinate of the character.
     * @param z - Z coordinate of the character.
     * @param heading - Character's heading in degrees.
     * @returns The created character.
     */
    public addFriendChar(modelId, x: float, y: float, z: float, heading: float): Char {
        return this._prepareChar(Char.Create(29, modelId, x, y, z).setHeading(heading), 29, 30);
    }

    /**
     * Creates a character with enemy AI and adds it to the auto-delete list.
     * @param modelId - The model ID of the character (must be loaded).
     * @param x - X coordinate of the character.
     * @param y - Y coordinate of the character.
     * @param z - Z coordinate of the character.
     * @param heading - Character's heading in degrees.
     * @returns The created character.
     */
    public addEnemyChar(modelId, x: float, y: float, z: float, heading: float): Char {
        return this._prepareChar(Char.Create(30, modelId, x, y, z).setHeading(heading), 30, 29);
    }

    /**
     * Creates a character with friendly AI inside a vehicle and adds it to the auto-delete list.
     * @param modelId - The model ID of the character (must be loaded).
     * @param car - The vehicle for the character to occupy (must exist).
     * @param seat - The seat index for the character, or -1 for driver (default: -1).
     * @returns The created character.
     */
    public addFriendCharInsideCar(modelId: int, car: Car, seat: int = -1): Char {
        if (seat === -1)
            return this._prepareChar(Char.CreateInsideCar(car, 29, modelId), 29, 30)
        return this._prepareChar(Char.CreateAsPassenger(car, 29, modelId, seat), 29, 30);
    }

    /**
     * Creates a character with enemy AI inside a vehicle and adds it to the auto-delete list.
     * @param modelId - The model ID of the character (must be loaded).
     * @param car - The vehicle for the character to occupy (must exist).
     * @param seat - The seat index for the character, or -1 for driver (default: -1).
     * @returns The created character.
     */
    public addEnemyCharInsideCar(modelId: int, car: Car, seat: int = -1): Char {
        if (seat === -1)
            return this._prepareChar(Char.CreateInsideCar(car, 30, modelId), 30, 29)
        return this._prepareChar(Char.CreateAsPassenger(car, 30, modelId, seat), 30, 29);
    }

    /**
     * Creates a character with neutral AI and adds it to the auto-delete list.
     * @param modelId - The model ID of the character (must be loaded).
     * @param x - X coordinate of the character.
     * @param y - Y coordinate of the character.
     * @param z - Z coordinate of the character.
     * @param heading - Character's heading in degrees.
     * @returns The created character.
     */
    public addNeutralChar(modelId, x: float, y: float, z: float, heading: float): Char {
        return this._prepareChar(Char.Create(31, modelId, x, y, z).setHeading(heading), 31, 0);
    }

    /**
     * Creates a character with neutral AI inside a vehicle and adds it to the auto-delete list.
     * @param modelId - The model ID of the character (must be loaded).
     * @param car - The vehicle for the character to occupy (must exist).
     * @param seat - The seat index for the character, or -1 for driver (default: -1).
     * @returns The created character.
     */
    public addNeutralCharInsideCar(modelId: int, car: Car, seat: int = -1): Char {
        if (seat === -1)
            return this._prepareChar(Char.CreateInsideCar(car, 31, modelId), 31, 0)
        return this._prepareChar(Char.CreateAsPassenger(car, 31, modelId, seat), 31, 0);
    }

    /**
     * Removes all entities from the auto-delete list.
     * @param elegantly - If true, entities are removed gracefully with cleanup (default: true).
     * @param warpPlayerToSavePlace - If true, warps the player to a safe location (default: false).
     * @param xSavePlace - X coordinate of the safe location (default: 0.0).
     * @param ySavePlace - Y coordinate of the safe location (default: 0.0).
     * @param zSavePlace - Z coordinate of the safe location (default: 0.0).
     */
    public deleteAllAddedEntities(elegantly: boolean = true, warpPlayerToSavePlace: boolean = false, xSavePlace: float = 0.0, ySavePlace: float = 0.0, zSavePlace: float = 0.0): void {
        if (warpPlayerToSavePlace)
            this.playerChar.warpFromCarToCoord(xSavePlace, ySavePlace, zSavePlace);
        Camera.Restore();
        Camera.SetBehindPlayer();
        this._blips.forEach(blip => {
            if (Blip.DoesExist(+blip))
                blip.remove();
        });
        this._pickups.forEach(pickup => {
            if (Pickup.DoesExist(+pickup))
                pickup.remove();
        });
        this._scriptObjects.forEach(obj => {
            if (ScriptObject.DoesExist(+obj))
                obj.markAsNoLongerNeeded().delete();
        });
        if (elegantly) {
            this._chars.forEach(char => {
                if (Char.DoesExist(+char)) {
                    if (char.isHealthGreater(100))
                        char.setHealth(100);
                    char.setProofs(false, false, false, false, false).setCanBeKnockedOffBike(false)
                        .setCantBeDraggedOut(false).setGetOutUpsideDownCar(true).setSuffersCriticalHits(false)
                        .setCanBeShotInVehicle(true).markAsNoLongerNeeded().removeElegantly();
                }
            });
        } else {
            this._chars.forEach(char => {
                if (Char.DoesExist(+char))
                    char.markAsNoLongerNeeded().delete();
            });
        }
        if (warpPlayerToSavePlace) {
            this._cars.forEach(car => {
                car.markAsNoLongerNeeded().delete();
            });
        } else {
            this._cars.forEach(car => {
                this._deleteCarCarefully(car);
            });
        }
        this._chars = new Array<Char>();
        this._cars = new Array<Car>();
        this._scriptObjects = new Array<ScriptObject>();
        this._blips = new Array<Blip>();
        this._pickups = new Array<Pickup>();
    }



    private _restorePlayerWeapons(): void {
        if (this._hasSavedPlayerWeapons) {
            this.playerChar.removeAllWeapons();
            for (let i = 1; i < 47; ++i) {
                if (this._savedPlayerWeaponsAmmo[i] > 0) {
                    this.loadWeaponModelsNow(i);
                    this.playerChar.giveWeapon(i, this._savedPlayerWeaponsAmmo[i]);
                    this.unloadWeaponModels(i);
                }
            }
            this._savedPlayerWeaponsAmmo = new Array<int>();
        }
    }

    private _prepareChar(char: Char, respectType: int, hateType: int): Char {
        this._chars.push(char);
        char.setDrownsInWater(false).setDropsWeaponsWhenDead(false).setMoney(0).setNeverLeavesGroup(true);
        if (respectType === 31)
            return char.setRelationship(0, 0).setRelationship(0, 29).setRelationship(0, 30).setRelationship(0, 31).setDecisionMaker(+this._decisionMakersChar[2]);
        char.setRelationship(0, respectType).setRelationship(4, hateType).setRelationship(0, 31);
        if (respectType === 29) {
            return char.setNeverTargeted(true).setRelationship(0, 0).setDecisionMaker(+this._decisionMakersChar[1]);
        }
        return char.setRelationship(4, 0).setDecisionMaker(+this._decisionMakersChar[0]);
    }

    private _prepareBlip(blip: Blip, asFriendly: boolean, blipDisplay: int): Blip {
        this._blips.push(blip);
        return blip.setAsFriendly(asFriendly).changeDisplay(blipDisplay);
    }

    private _deleteCarCarefully(car: Car): void {
        if (!Car.DoesExist(+car))
            return;
        car.markAsNoLongerNeeded();
        if (this.playerChar.isInCar(car) || car.isOnScreen()) {
            car.changePlaybackToUseAi().setMission(0).setProofs(false, false, false, false, false).setCanBurstTires(true)
                .setUpsidedownNotDamaged(false).freezePosition(false).setCanBeVisiblyDamaged(true).setCollision(true)
                .removeUpsidedownCheck().setCanBeDamaged(true).setCanBeTargeted(true);
            if (car.isHealthGreater(1000))
                car.setHealth(1000);
            return;
        }
        car.delete();
    }

    private _setupDecisionMakers(): void {
        this._decisionMakersChar.push(this.createClearedDecisionMakerChar()); // enemy
        this._decisionMakersChar.push(this.createClearedDecisionMakerChar()); // friend
        this._decisionMakersChar.push(this.createClearedDecisionMakerChar()); // neutral
        for (let i = 0; i < 2; ++i) {
            this._decisionMakersChar[i].addEventResponse(36, 1000, 0.0, 100.0, 0.0, 0.0, false, true);
            this._decisionMakersChar[i].addEventResponse(36, 729, 0.0, 100.0, 0.0, 0.0, true, false);
            // ...
        }
    }

}