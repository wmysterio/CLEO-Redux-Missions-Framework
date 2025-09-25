import { App } from "./App";
import { AudioPlayer } from "./AudioPlayer";
import { Core } from "./Core";
import { Dialogue } from "./Dialogue";
import { NativeCamera, NativePed, NativeVehicle } from "./Native";
import { Timer } from "./Timer";

/** Abstract base class for game scripts. */
export abstract class BaseScript {

    private _dialogue: Dialogue;
    private _timer: Timer;
    private _voiceAudio: AudioPlayer;

    /** Gets the player. */
    public get player(): Player {
        return Core.Player;
    }

    /** Gets the player character. */
    public get playerChar(): Char {
        return Core.PlayerChar;
    }

    /** Gets the timer instance for script timing. */
    public get timer(): Timer {
        return this._timer;
    }

    /** Gets the dynamic dialogue instance for managing conversations. */
    public get dialogue(): Dialogue {
        return this._dialogue;
    }

    /** Gets the audio player instance for managing character voice audio in the script. */
    public get voiceAudio(): AudioPlayer {
        return this._voiceAudio;
    }



    /**
     * Handles the script initialization event, called before the script starts.
     * @remarks `Used for internal framework operations. Do not call directly!`
     */
    public onInitEvent(): void {
        this._timer = new Timer();
        this._dialogue = new Dialogue();
        this._voiceAudio = new AudioPlayer(Core.ActiveMissionInfo.projectIndex, true);
    }

    /** Handles the script start event, called when the script begins. */
    public onStartEvent(): void { }

    /** Handles the script cleanup event, called to release resources before the script ends. */
    public onCleanupEvent(): void { }

    /** 
     * Handles the script stop event, called when the script ends.
     * @remarks `Used for internal framework operations. Do not call directly!`
     */
    public onEndEvent(): void {
        this._dialogue.unload();
        this._voiceAudio.unload();
    }



    /**
     * Retrieves the maximum health of a character.
     * @param char - The character to check.
     * @returns The maximum health of character.
     */
    public getCharMaxHealth(char: Char): float {
        return NativePed.GetMaxHealth(char);
    }

    /**
     * Retrieves the bomb status of the specified vehicle in GTA San Andreas.
     * @param car - The vehicle to check.
     * @returns The bomb status.
     */
    public getCarBombStatus(car: Car): int {
        return NativeVehicle.GetBombStatus(car);
    }

    /**
     * Fades the screen in to make it transparent with the specified color.
     * @param r - The red channel value for the fade color (0-255, default: 0).
     * @param g - The green channel value for the fade color (0-255, default: 0).
     * @param b - The blue channel value for the fade color (0-255, default: 0).
     * @returns The transition duration in milliseconds.
     */
    public fadeToTransparent(r: int = 0, g: int = 0, b: int = 0): int {
        Camera.SetFadingColor(r, g, b);
        Camera.DoFade(App.FADE_TRANSITION_DURATION, 1);
        return App.FADE_TRANSITION_DURATION;
    }

    /**
     * Fades the screen out to make it opaque with the specified color.
     * @param r - The red channel value for the fade color (0-255, default: 0).
     * @param g - The green channel value for the fade color (0-255, default: 0).
     * @param b - The blue channel value for the fade color (0-255, default: 0).
     * @returns The transition duration in milliseconds.
     */
    public fadeToOpaque(r: int = 0, g: int = 0, b: int = 0): int {
        Camera.SetFadingColor(r, g, b);
        Camera.DoFade(App.FADE_TRANSITION_DURATION, 0);
        return App.FADE_TRANSITION_DURATION;
    }

    /**
     * Checks if the screen fade is fully opaque.
     * @returns True if the screen is fully opaque, false otherwise.
     */
    public isFadeScreenOpaque(): boolean {
        return NativeCamera.GetFadingStatus() === 2;
    }

    /**
     * Checks if the screen fade is fully transparent.
     * @returns True if the screen is fully transparent, false otherwise.
     */
    public isFadeScreenTransparent(): boolean {
        return NativeCamera.GetFadingStatus() === 0;
    }

    /**
     * Creates a DecisionMakerChar with no event responses for character behavior.
     * @returns The newly created DecisionMakerChar instance.
     */
    public createClearedDecisionMakerChar(): DecisionMakerChar {
        const dm = DecisionMakerChar.Load(0);
        for (let i = 0; i < 95; ++i)
            dm.clearEventResponse(i);
        return dm;
    }

    /**
     * Displays a message at the bottom of the screen for the specified duration.
     * @param gxt - The GXT key of the message to display.
     * @param time - The duration of the message in milliseconds.
     */
    public printText(gxt: string, time: int): void {
        Text.PrintNow(gxt, time, 1);
    }

    /**
     * Formats args according to the format string, then displays it similarly to {@link printText}
     * @param format - The formatted string.
     * @param time - The duration of the message in milliseconds. 
     * @param args - The string arguments.
     */
    public printFormattedText(format: string, time: int, ...args: number[]): void {
        Text.PrintFormattedNow(format, time, ...args);
    }

    /** Clears all text elements from the screen, including help, prints, and big messages. */
    public clearText(): void {
        Core.ClearText();
    }

    /** Resets the HUD to its default state in the game. */
    public resetHud(): void {
        Hud.DisplayZoneNames(true);
        Hud.DisplayCarNames(true);
        Hud.DisplayRadar(true);
        Hud.Display(true);
        Hud.SwitchWidescreen(false);
    }

    /** Resets the camera to its default behavior in the game. */
    public resetCamera(): void {
        Camera.ResetNewScriptables();
        Camera.RestoreJumpcut();
        Camera.SetBehindPlayer();
        Camera.SetZoom(1);
    }

    /**
     * Places the player at the specified coordinates with the given heading.
     * @param x - The x-coordinate in the game world.
     * @param y - The y-coordinate in the game world.
     * @param z - The z-coordinate in the game world.
     * @param heading - The player's heading angle in degrees.
     * @param dontWarpGang - If true, prevents warping the player's gang to the coordinates (default: false).
     * @returns The player character after setting.
     */
    public putPlayerAt(x: float, y: float, z: float, heading: float, dontWarpGang: boolean = false): Char {
        if (dontWarpGang) {
            Core.PlayerChar.setCoordinatesDontWarpGang(x, y, z);
        } else {
            Core.PlayerChar.setCoordinates(x, y, z);
        }
        return Core.PlayerChar.setHeading(heading);
    }

    /**
     * Clears the area, removing all vehicles and pedestrians that are not marked as needed by a mission
     * @param x - The x-coordinate in the game world.
     * @param y - The y-coordinate in the game world.
     * @param z - The z-coordinate in the game world.
     * @param radius - The radius of the area to clear (default: 1.25).
     */
    public clearArea(x: float, y: float, z: float, radius: float = 1.25): void {
        World.ClearArea(x, y, z, radius, true);
    }

    /**
     * Loads a scene and requests collision data at the specified point.
     * @param x - The x-coordinate in the game world.
     * @param y - The y-coordinate in the game world.
     * @param z - The z-coordinate in the game world.
     * @param clearRadius - The radius to clear the area if greater than 0.0 (default: 0.0).
     */
    public refreshArea(x: float, y: float, z: float, clearRadius: float = 0.0): void {
        Streaming.RequestCollision(x, y);
        Streaming.LoadScene(x, y, z);
        if (clearRadius > 0.0)
            this.clearArea(x, y, z, clearRadius);
    }

    /**
     * Checks if the specified character is dead.
     * @param char - The character to check.
     * @returns True if the character is dead, false otherwise.
     */
    public isCharDead(char: Char): boolean {
        return Char.IsDead(+char);
    }

    /**
     * Checks if the specified vehicle is destroyed.
     * @param car - The vehicle to check.
     * @returns True if the vehicle is destroyed, false otherwise.
     */
    public isCarDead(car: Car): boolean {
        return Car.IsDead(+car);
    }

    /**
     * Checks if the specified character has no active script task for the given task ID.
     * @param char - The character to check.
     * @param taskId - The ID of the script task to check.
     * @returns True if the character has no active task (completed or not assigned), false otherwise.
     */
    public isScriptTaskFinished(char: Char, taskId: int): boolean {
        return char.getScriptTaskStatus(taskId) === 7;
    }

    /**
     * Checks if the player has left the specified point.
     * @param x - The x-coordinate of the point.
     * @param y - The y-coordinate of the point.
     * @param z - The z-coordinate of the point.
     * @param xyRadius - The radius in the XY plane.
     * @param zRadius - The radius in the Z axis (default: 20.0).
     * @returns True if the player is outside the point, false otherwise.
     */
    public isPlayerLeavePoint(x: float, y: float, z: float, xyRadius: float, zRadius: float = 20.0): boolean {
        return this.isCharLeavePoint(this.playerChar, x, y, z, xyRadius, zRadius);
    }

    /**
     * Checks if the player has left the specified 2D rectangular area.
     * @param leftBottomX - The x-coordinate of the bottom-left corner.
     * @param leftBottomY - The y-coordinate of the bottom-left corner.
     * @param rightTopX - The x-coordinate of the top-right corner.
     * @param rightTopY - The y-coordinate of the top-right corner.
     * @returns True if the player is outside the area, false otherwise.
     */
    public isPlayerLeaveArea2D(leftBottomX: float, leftBottomY: float, rightTopX: float, rightTopY: float): boolean {
        return this.isCharLeaveArea2D(this.playerChar, leftBottomX, leftBottomY, rightTopX, rightTopY);
    }

    /**
     * Checks if the specified character has left the specified point.
     * @param char - The character to check.
     * @param x - The x-coordinate of the point.
     * @param y - The y-coordinate of the point.
     * @param z - The z-coordinate of the point.
     * @param xyRadius - The radius in the XY plane.
     * @param zRadius - The radius in the Z axis (default: 20.0).
     * @returns True if the character is outside the point, false otherwise.
     */
    public isCharLeavePoint(char: Char, x: float, y: float, z: float, xyRadius: float, zRadius: float = 20.0): boolean {
        return !char.locateAnyMeans3D(x, y, z, xyRadius, xyRadius, zRadius, false);
    }

    /**
     * Checks if the specified character has left the specified 2D rectangular area.
     * @param char - The character to check.
     * @param leftBottomX - The x-coordinate of the bottom-left corner.
     * @param rightTopX - The x-coordinate of the top-right corner.
     * @param leftBottomY - The y-coordinate of the bottom-left corner.
     * @param rightTopY - The y-coordinate of the top-right corner.
     * @returns True if the character is outside the area, false otherwise.
     */
    public isCharLeaveArea2D(char: Char, leftBottomX: float, leftBottomY: float, rightTopX: float, rightTopY: float): boolean {
        return !char.isInArea2D(leftBottomX, leftBottomY, rightTopX, rightTopY, false);
    }

    /**
     * Checks if the specified vehicle has left the specified point.
     * @param car - The vehicle to check.
     * @param x - The x-coordinate of the point.
     * @param y - The y-coordinate of the point.
     * @param z - The z-coordinate of the point.
     * @param xyRadius - The radius in the XY plane.
     * @param zRadius - The radius in the Z axis (default: 20.0).
     * @returns True if the vehicle is outside the point, false otherwise.
     */
    public isCarLeavePoint(car: Car, x: float, y: float, z: float, xyRadius: float, zRadius: float = 20.0): boolean {
        return !car.locate3D(x, y, z, xyRadius, xyRadius, zRadius, false);
    }

    /**
     * Checks if the specified vehicle has left the specified 2D rectangular area.
     * @param car - The vehicle to check.
     * @param leftBottomX - The x-coordinate of the bottom-left corner.
     * @param leftBottomY - The y-coordinate of the bottom-left corner.
     * @param rightTopX - The x-coordinate of the top-right corner.
     * @param rightTopY - The y-coordinate of the top-right corner.
     * @returns True if the vehicle is outside the area, false otherwise.
     */
    public isCarLeaveArea2D(car: Car, leftBottomX: float, leftBottomY: float, rightTopX: float, rightTopY: float): boolean {
        return !car.isInArea2D(leftBottomX, leftBottomY, rightTopX, rightTopY, false);
    }

    /**
     * Sets the camera to a fixed position in the game world.
     * @param x - The x-coordinate of the camera position.
     * @param y - The y-coordinate of the camera position.
     * @param z - The z-coordinate of the camera position.
     */
    public setCameraPosition(x: float, y: float, z: float): void {
        Camera.SetFixedPosition(x, y, z, 0.0, 0.0, 0.0);
    }

    /**
     * Sets the camera to look at a specific point in the game world.
     * @param x - The x-coordinate of the target point.
     * @param y - The y-coordinate of the target point.
     * @param z - The z-coordinate of the target point.
     * @param switchStyle - The transition style for the camera movement (default: 2).
     */
    public lookCameraAt(x: float, y: float, z: float, switchStyle: int = 2): void {
        Camera.PointAtPoint(x, y, z, switchStyle);
    }

    /**
     * Checks if the camera is moving in position or angle.
     * @returns True if the camera is moving.
     */
    public isCameraMoving(): boolean {
        return Camera.IsVectorMoveRunning() || Camera.IsVectorTrackRunning();
    }

    /**
     * Synchronously loads weapon models by their type.
     * @param weaponTypes - Array of weapon type IDs to load.
     */
    public loadWeaponModelsNow(...weaponTypes: int[]): void {
        weaponTypes.forEach(weaponType => { Streaming.RequestModel(Weapon.GetModel(weaponType)); });
        Streaming.LoadAllModelsNow();
    }

    /**
     * Releases the specified weapon models, freeing game memory.
     * @param weaponTypes - Array of weapon type IDs to unload.
     */
    public unloadWeaponModels(...weaponTypes: int[]): void {
        weaponTypes.forEach(weaponType => { Streaming.MarkModelAsNoLongerNeeded(Weapon.GetModel(weaponType)); });
    }

    /**
     * Requests loading of new models and waits until all are available.
     * @param models - Array of model IDs to load.
     */
    public loadModels(...models: int[]): void {
        models.forEach(modelId => { Streaming.RequestModel(modelId); });
        Core.WaitUntilLoaded(models, modelId => Streaming.HasModelLoaded(modelId));
    }

    /**
     * Loads the train models for the specified train type.
     * @param trainType - The type of train (0 to 15).
     */
    public loadTrainModels(trainType: int) {
        const models = this._getTrainModels(trainType);
        this.loadModels(...models);
    }

    /**
     * Unloads the train models for the specified train type.
     * @param trainType - The type of train (0 to 15).
     */
    public unloadTrainModels(trainType: int) {
        const models = this._getTrainModels(trainType);
        this.unloadModels(...models);
    }

    /**
     * Synchronously loads models by their IDs.
     * @param models - Array of model IDs to load.
     */
    public loadModelsNow(...models: int[]): void {
        models.forEach(modelId => { Streaming.RequestModel(modelId); });
        Streaming.LoadAllModelsNow();
    }

    /**
     * Releases the specified models, freeing game memory.
     * @param models - Array of model IDs to unload.
     */
    public unloadModels(...models: int[]): void {
        models.forEach(modelId => { Streaming.MarkModelAsNoLongerNeeded(modelId); });
    }

    /**
     * Requests loading of vehicle mod models and waits until all are available.
     * @param models - Array of vehicle mod model IDs to load.
     */
    public loadVehicleMods(...models: int[]): void {
        models.forEach(modelId => { Streaming.RequestVehicleMod(modelId); });
        Core.WaitUntilLoaded(models, modelId => Streaming.HasVehicleModLoaded(modelId));
    }

    /**
     * Releases the specified vehicle mod models, freeing game memory.
     * @param models - Array of vehicle mod model IDs to unload.
     */
    public unloadVehicleMods(...models: int[]): void {
        models.forEach(modelId => { Streaming.MarkVehicleModAsNoLongerNeeded(modelId); });
    }

    /**
     * Requests loading of animations and waits until all are available.
     * @param ifpNames - Array of animation file names (IFP) to load.
     */
    public loadAnimations(...ifpNames: string[]): void {
        ifpNames.forEach(ifpName => { Streaming.RequestAnimation(ifpName); });
        Core.WaitUntilLoaded(ifpNames, ifpName => Streaming.HasAnimationLoaded(ifpName));
    }

    /**
     * Releases the specified animations, freeing game memory.
     * @param ifpNames - Array of animation file names (IFP) to unload.
     */
    public unloadAnimations(...ifpNames: string[]): void {
        ifpNames.forEach(ifpName => { Streaming.RemoveAnimation(ifpName); });
    }

    /**
     * Places a character facing another character at a specified distance.
     * @param char - The character to position (must exist).
     * @param target - The target character to face (must exist).
     * @param relativeDistance - The distance between the characters (default: 1.0).
     */
    public placeCharFacingAnotherChar(char: Char, target: Char, relativeDistance: float = 1.0): void {
        const position = target.getOffsetInWorldCoords(0.0, relativeDistance, 0.0);
        char.setCoordinates(position.x, position.y, position.z).setHeading(target.getHeading() + 180.0);
    }

    /**
     * Checks if the current in-game clock hour is within the specified range.
     * @param left - The start hour of the range.
     * @param right - The end hour of the range.
     * @returns True if the current hour is within the range.
     */
    public isClockHourInRange(left: int, right: int): boolean {
        const hour = Clock.GetTimeOfDay().hours;
        if (right > left)
            return hour >= left && right > hour;
        return hour >= left || right > hour;
    }

    /**
     * Sets the n-th bit of the number to 1 (alternative to opcode 2701 @see {@link Math.SetBit}).
     * @param number - The input number.
     * @param bitIndex - The index of the bit to set (0-31).
     * @returns The number with the specified bit set.
     */
    public setBit(number: int, bitIndex: int): int {
        return number | (1 << bitIndex);
    }

    /**
     * Clears the n-th bit of the number to 0 (alternative to opcode 2702 @see {@link Math.ClearBit}).
     * @param number - The input number.
     * @param bitIndex - The index of the bit to clear (0-31).
     * @returns The number with the specified bit cleared.
     */
    public clearBit(number: int, bitIndex: int): int {
        return number & ~(1 << bitIndex);
    }



    private _getTrainModels(trainType: int): int[] {
        if (0 > trainType || trainType > 15)
            throw Error(`Incorrect train type '${trainType}'!`);
        if (trainType === 15)
            return [538];
        if ([8, 9, 14].includes(trainType))
            return [449];
        if ([1, 2, 4, 5, 7, 11].includes(trainType))
            return [538, 570];
        return [537, 569];
    }

}