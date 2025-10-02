import { BaseMission } from "./BaseMission";
import { Core } from "./Core";
import { Screen } from "./Drawing";
import { Timer } from "./Timer";

/** Represents a node in a race route. */
class RouteNode {

    /** The X coordinate of the node. */
    public x: float;

    /** The Y coordinate of the node. */
    public y: float;

    /** The Z coordinate of the node. */
    public z: float;

    /** The heading angle of the node in degrees. */
    public heading: float;

    /** The speed for the node in game units. */
    public speed: float;

    /** Indicates whether the node is a checkpoint. */
    public isCheckpoint: boolean;

    /** The ID of the checkpoint, or -1 if not a checkpoint. */
    public checkpointId: int;

    /** The time limit for reaching the node in milliseconds. */
    public timeLimitMs: int;



    /**
     * Initializes a new route node.
     * @param x - The X coordinate of the node.
     * @param y - The Y coordinate of the node.
     * @param z - The Z coordinate of the node.
     * @param heading - The heading angle in degrees.
     * @param speed - The speed for the node in game units.
     * @param isCheckpoint - Whether the node is a checkpoint.
     * @param timeLimitMs - The time limit for reaching the node in milliseconds.
     */
    constructor(x: float, y: float, z: float, heading: float, speed: float, isCheckpoint: boolean, timeLimitMs: int) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.heading = heading;
        this.speed = speed;
        this.isCheckpoint = isCheckpoint;
        this.timeLimitMs = timeLimitMs;
        this.checkpointId = isCheckpoint ? 0 : -1;
    }

}

/** Represents a radar node with a blip and checkpoint in a radar race. */
class RadarNode {

    private _blip: Blip;
    private _checkpoint: Checkpoint;

    /** Indicates whether the radar has been passed by the player. */
    public isPassed: boolean;

    /** X coordinate of the radar. */
    public x: float;

    /** Y coordinate of the radar. */
    public y: float;

    /** Z coordinate of the radar. */
    public z: float;



    /**
     * Creates a radar node based on the provided route node.
     * @param routeNode - The route node containing coordinates for the radar.
     */
    public constructor(routeNode: RouteNode) {
        this._blip = new Blip(-1);
        this._checkpoint = new Checkpoint(-1);
        this.isPassed = false;
        this.x = routeNode.x;
        this.y = routeNode.y;
        this.z = routeNode.z;
    }



    /** Creates the radar blip and checkpoint at the specified coordinates. */
    public create(): void {
        this._blip = Blip.AddForCoord(this.x, this.y, this.z);
        this._checkpoint = Checkpoint.Create(2, this.x, this.y, this.z, this.x, this.y, this.z, 6.0);
    }

    /** Removes the radar blip and checkpoint. */
    public remove(): void {
        this._blip.remove();
        this._checkpoint.delete();
    }

}

/** Represents a racer in a street race. */
class Racer {

    /** The unique ID of the racer. */
    public id: int;

    /** The car used by the racer. */
    public car: Car;

    /** The character of the racer. */
    public char: Char;

    /** Indicates whether the racer is the player. */
    public isPlayer: boolean;

    /** The last route node visited by the racer. */
    public lastNode: RouteNode;

    /** The current lap number of the racer. */
    public currentLap: int;

    /** The ID of the next route node to reach. */
    public nextNodeId: int;

    /** The sum of speeds recorded at checkpoints. */
    public totalSpeed: float;

    /** The available time for the racer in milliseconds. */
    public availableTime: int;

    /** Indicates whether the racer is knocked out of the race. */
    public isKnockedOut: boolean;



    /**
     * Initializes a new street racer.
     * @param id - The unique ID of the racer.
     * @param char - The character of the racer.
     * @param car - The car used by the racer.
     * @param isPlayer - Whether the racer is the player.
     * @param startNode - The starting route node for the racer.
     */
    constructor(id: int, char: Char, car: Car, isPlayer: boolean, startNode: RouteNode) {
        this.id = id;
        this.car = car;
        this.char = char;
        this.isPlayer = isPlayer;
        this.lastNode = startNode;
        this.currentLap = 0;
        this.nextNodeId = 0;
        this.totalSpeed = 0.0;
        this.availableTime = 0;
        this.isKnockedOut = false;
    }

}

/** Contains information for initializing a street racer. */
class RacerInfo {

    /** The model ID of the racer's car. */
    public carModel: int;

    /** The X coordinate of the starting position. */
    public x: float;

    /** The Y coordinate of the starting position. */
    public y: float;

    /** The Z coordinate of the starting position. */
    public z: float;

    /** The heading angle of the starting position in degrees. */
    public heading: float;

    /** The model ID of the racer's character, or -1 for random. */
    public charModelId: int;

    /** The function to apply additional car settings, or undefined to skip. */
    public setupCar: (car: Car) => void;

    /** The starting route node for the racer. */
    public startNode: RouteNode;

    /** Indicates whether the racer is the player. */
    public isPlayer: boolean;


    /**
     * Initializes a new racer info.
     * @param carModel - The model ID of the racer's car.
     * @param x - The X coordinate of the starting position.
     * @param y - The Y coordinate of the starting position.
     * @param z - The Z coordinate of the starting position.
     * @param heading - The heading angle in degrees.
     * @param charModelId - The model ID of the racer's character, or -1 for random.
     * @param setupCar - The function to apply additional car settings, or undefined to skip.
     * @param speed - The speed for the starting node.
     * @param timeLimitMs - The time limit for the starting node in milliseconds.
     * @param isPlayer - Whether the racer is the player.
     */
    constructor(carModel: int, x: float, y: float, z: float, heading: float, charModelId: int, setupCar: (car: Car) => void, speed: float, timeLimitMs: int, isPlayer: boolean) {
        this.carModel = carModel;
        this.x = x;
        this.y = y;
        this.z = z;
        this.heading = heading;
        this.charModelId = charModelId;
        this.isPlayer = isPlayer;
        this.setupCar = setupCar;
        this.startNode = new RouteNode(x, y, z, heading, speed, false, timeLimitMs);
    }

}

/** Template for configuring street racer missions, including races and challenges. */
class StreetRacerMissionTemplate {

    /** Configures the default settings for a car in the mission. */
    public readonly defaultCarSettings: (car: Car) => void = (car: Car) => { };

    /** GXT key for displaying the player's position in the mission. */
    public positionGxt: string = "RACES51";

    /** GXT key for the message displayed when the wanted level starts. */
    public startWantedGxt: string = "RACES53";

    /** GXT key for the message displayed when the wanted level is lost. */
    public lostWantedGxt: string = "DNC_003"; // ~r~BAD

    /** GXT key for the message displayed when the wanted level is cleared. */
    public clearWantedGxt: string = "RACES54";

    /** GXT key for displaying the player's current speed in the mission. */
    public currentSpeedGxt: string = "RACES55";

    /** GXT key for displaying the player's accumulated speed in the mission. */
    public accumulatedSpeedGxt: string = "KICK1_9";

    /** Multiplier for pedestrian density in the mission area. */
    public pedDensityMultiplier: float = 0.0;

    /** Multiplier for car density in the mission area. */
    public carDensityMultiplier: float = 0.0;

    /** Number of nodes in the mission route. */
    public nodesCount: int = 0;

    /** Indicates whether the mission is a solo challenge rather than a competitive race. */
    public isChallenge: boolean = false;

    /** Indicates whether the mission is a wanted challenge. */
    public isWantedChallenge: boolean = false;

    /** Indicates whether checkpoint checking is enabled for the mission. */
    public isCheckpointsDisabled: boolean = false;

    /** Minimum wanted level required for the mission. */
    public minWantedLevel: int = 0;

    /** Whether to spawn cops during the mission. */
    public spawnCops: boolean = false;

    /** Multiplier for wanted level intensity. */
    public wantedMultiplier: float = 0.0;

    /** Number of laps in the mission. */
    public lapsCount: int = 1;

    /** The racer object representing the player. */
    public playerRacer: Racer = null;

    /** The ID of the player racer. */
    public playerRacerId: int = -1;

    /** The car used by the player racer. */
    public playerRacerCar: Car = new Car(-1);

    /** ID of the last checkpoint in the mission. */
    public lastCheckpointId: int = -1;

    /** Whether the last checkpoint is designated for the player. */
    public isLastCheckpointForPlayer: boolean = false;

    /** Path ID for the leading racer in the mission. */
    public bossPath: int = -1;

    /** Speed of the leading racer's path. */
    public bossPathSpeed: float = 0.0;

    /** Array of racers in the mission. */
    public racers: Racer[] = new Array<Racer>();

    /** Array of information for each racer. */
    public racersInfo: RacerInfo[] = new Array<RacerInfo>();

    /** Array of blips for racers on the map. */
    public racersBlips: Blip[] = new Array<Blip>();

    /** Number of racers in the mission. */
    public racersCount: int = 0;

    /** Array of route nodes defining the mission path. */
    public route: RouteNode[] = new Array<RouteNode>();

    /** Tune code for mission checkpoints. */
    public checkpointTune = 1058;

    /** Blip for the mission's current objective. */
    public blip: Blip = new Blip(-1);

    /** Current checkpoint in the mission. */
    public checkpoint: Checkpoint = new Checkpoint(-1);

    /** Starts the mission. */
    public begin: () => void;

    /** Updates the mission state. */
    public update: () => void;

    /** Renders mission information and visuals. */
    public draw: () => void;

    /** Handles the event when a racer passes a route node. */
    public onRacerRouteNodePassedEvent: (racer: Racer, lastNode: RouteNode) => void;

    /** Handles the event when a racer completes a lap. */
    public onRacerLapPassedEvent: (racer: Racer, lastLap: int) => void;

    /** Loads mission resources and initializes the mission. */
    public load(): void {
        Text.LoadMissionText("RACETOR");
        FxtStore.insert("RACES51", "Position ~1~/~1~", true);
        FxtStore.insert("RACES52", "~a~ is out of the race.", true);
        FxtStore.insert("RACES53", "Maintain the wanted level for the allotted time!", true);
        //You lowered the wanted level too early!
        FxtStore.insert("RACES54", "Escape the pursuit!", true);
        FxtStore.insert("RACES55", "Speed ~1~", true);
    }

    /** Unloads mission resources and cleans up. */
    public unload(): void {
        FxtStore.delete("RACES51", true);
        FxtStore.delete("RACES52", true);
        FxtStore.delete("RACES53", true);
        FxtStore.delete("RACES54", true);
        FxtStore.delete("RACES55", true);
        this.blip.remove();
        this.checkpoint.delete();
        if (this.bossPath > -1)
            Streaming.RemoveCarRecording(this.bossPath);
    }

    /** Adjusts traffic density based on mission settings. */
    public changeTraffic(): void {
        World.SetPedDensityMultiplier(this.pedDensityMultiplier);
        World.SetCarDensityMultiplier(this.carDensityMultiplier);
    }

    /** Adjusts wanted level based on mission settings. */
    public changeWanted(): void {
        Game.SetPoliceIgnorePlayer(Core.Player, !this.spawnCops);
        Game.SetCreateRandomCops(this.spawnCops);
        Game.EnableAmbientCrime(this.spawnCops);
        Game.SwitchPoliceHelis(this.spawnCops);
        Game.SwitchCopsOnBikes(this.spawnCops);
        Game.SetWantedMultiplier(this.wantedMultiplier);
    }

    /** @returns The player's position in the mission based on distance to checkpoints. */
    public getPlayerPositionByDistance(): int {
        let position = 1;
        const currentPlayerCheckpointId = this.playerRacer.nextNodeId;
        for (let i = 0; i < this.racersCount; ++i) {
            if (this.playerRacerId === i)
                continue;
            if (this.racers[i].currentLap > this.playerRacer.currentLap) {
                position += 1;
            } else if (this.racers[i].currentLap === this.playerRacer.currentLap) {
                let currentStreetRacerCheckpointId = this.racers[i].nextNodeId;
                if (!this.route[currentStreetRacerCheckpointId].isCheckpoint)
                    currentStreetRacerCheckpointId = this.findNextCheckpointId(currentStreetRacerCheckpointId);
                if (currentStreetRacerCheckpointId > currentPlayerCheckpointId) {
                    position += 1;
                } else if (currentStreetRacerCheckpointId === currentPlayerCheckpointId) {
                    const playerCoord = this.playerRacerCar.getCoordinates();
                    const racerCoord = this.racers[i].car.getCoordinates();
                    const nextNode = this.route[currentPlayerCheckpointId];
                    const playerDistance = Math.GetDistanceBetweenCoords3D(playerCoord.x, playerCoord.y, playerCoord.z, nextNode.x, nextNode.y, nextNode.z);
                    const racerDistance = Math.GetDistanceBetweenCoords3D(racerCoord.x, racerCoord.y, racerCoord.z, nextNode.x, nextNode.y, nextNode.z);
                    if (playerDistance > racerDistance)
                        position += 1;
                }
            }
        }
        return position;
    }

    /** @returns The player's position in the mission based on speed. */
    public getPlayerPositionBySpeed(): int {
        let position = 1;
        const playerSpeed = this.playerRacer.totalSpeed;
        for (let i = 0; i < this.racersCount; ++i) {
            if (this.playerRacerId === i)
                continue;
            let currentStreetRacer = this.racers[i];
            if (currentStreetRacer.totalSpeed > playerSpeed)
                position += 1;
        }
        return position;
    }

    /**
     * Finds the ID of the next checkpoint in the mission.
     * @param fromId - The current checkpoint ID.
     * @returns The ID of the next checkpoint, or throws an error if none exists.
     */
    public findNextCheckpointId(fromId: int): int {
        let nextId = fromId + 1;
        for (let i = nextId; i < this.nodesCount; ++i)
            if (this.route[i].isCheckpoint)
                return i;
        for (let i = 0; i < fromId; ++i)
            if (this.route[i].isCheckpoint)
                return i;
        throw new Error("There are no checkpoints on the route or their number is less than the minimum!");
    }

    /** @returns The ID of the last checkpoint in the mission. */
    public findLastCheckpointId(): int {
        for (let i = this.nodesCount - 1; i >= 0; --i)
            if (this.route[i].isCheckpoint)
                return i;
        throw new Error("There are no checkpoints on the route or their number is less than the minimum!");
    }

    /** @returns The total number of checkpoints in the mission. */
    public getCheckpointsCount(): int {
        let result = 0;
        for (let i = 0; i < this.nodesCount; ++i)
            if (this.route[i].isCheckpoint)
                result += 1;
        return result;
    }

}

/** Global template for street racer missions. */
let MissionTemplate: StreetRacerMissionTemplate = null;

/** Base class for race missions and challenges. */
abstract class BaseRaceMission extends BaseMission {

    private _disableSetup: boolean;
    private _onStartEvent: () => void;
    private _onUpdateEvent: () => void;

    /**
     * Sets the GXT key for the text displayed near the player's position in the race.
     * @param gxtKey - The GXT key for the position text.
     */
    public set positionGxt(gxtKey: string) {
        MissionTemplate.positionGxt = gxtKey;
    }



    public onInitEvent(): void {
        super.onInitEvent();
        MissionTemplate = new StreetRacerMissionTemplate();
        MissionTemplate.load();
        this._disableSetup = true;
        this.successBigMessage.gxt = "RACES18";

        this._onStartEvent = this.onStartEvent;
        this._onUpdateEvent = this.onUpdateEvent;

        MissionTemplate.begin = () => {
            MissionTemplate.racersCount = MissionTemplate.racersInfo.length;
            MissionTemplate.nodesCount = MissionTemplate.route.length;

            if (0 > MissionTemplate.racersCount || MissionTemplate.racersCount > 7)
                throw new Error("The number of participants must be from 1 to 7 inclusive.");

            let numPlayers = 0;
            const usedModels = new Array<int>();
            for (let i = 0; i < MissionTemplate.racersCount; ++i) {
                usedModels.push(MissionTemplate.racersInfo[i].carModel);
                const charModelId = MissionTemplate.racersInfo[i].charModelId;
                if (MissionTemplate.racersInfo[i].isPlayer) {
                    MissionTemplate.playerRacerId = i;
                    numPlayers += 1;
                }
                if (charModelId === 0 || charModelId === 7) // Force skipping of models #NULL and #MALE01.
                    continue;
                usedModels.push(charModelId);
            }

            if (numPlayers !== 1 || (MissionTemplate.isChallenge && MissionTemplate.racersCount > 1))
                throw new Error("Only one player is required!");

            this.loadModels(...usedModels);
            this.player.clearWantedLevel().setControl(false);
            this.refreshArea(MissionTemplate.racersInfo[0].x, MissionTemplate.racersInfo[0].y, MissionTemplate.racersInfo[0].z, 300.0);
            for (let i = 0; i < MissionTemplate.racersCount; ++i) {
                const racerInfo = MissionTemplate.racersInfo[i];
                const racerCar = this.addCar(racerInfo.carModel, racerInfo.x, racerInfo.y, racerInfo.z, racerInfo.heading).setHealth(2000);
                MissionTemplate.racersBlips.push(this.addBlipToCar(racerCar).setAsFriendly(true).changeScale(2).changeColor(0));
                if (racerInfo.setupCar !== undefined)
                    racerInfo.setupCar(racerCar);
                let racerChar: Char;
                if (racerInfo.isPlayer) {
                    racerChar = this.playerChar;
                    this.playerChar.warpIntoCar(racerCar);
                    MissionTemplate.playerRacerCar = racerCar;
                    MissionTemplate.racersBlips[i].changeDisplay(0);
                } else {
                    if (racerInfo.charModelId === -1) {
                        racerChar = this.addNeutralCharInsideCar(7, racerCar);
                    } else {
                        racerChar = this.addNeutralCharInsideCar(racerInfo.charModelId, racerCar);
                    }
                    racerCar.setUpsidedownNotDamaged(true).setCanBurstTires(false).setCanBeVisiblyDamaged(false)
                        .setProofs(false, false, false, true, false);
                    StuckCarCheck.Add(racerCar.setHealth(20000), 2.0, 3000);
                    racerChar.setCanBeKnockedOffBike(true).setCantBeDraggedOut(true).setGetOutUpsideDownCar(false)
                        .setMaxHealth(2000).setHealth(2000).setCanBeShotInVehicle(false);
                }
                const racer = new Racer(MissionTemplate.racers.length, racerChar, racerCar, racerInfo.isPlayer, racerInfo.startNode);
                MissionTemplate.racers.push(racer);
                if (racerInfo.isPlayer)
                    MissionTemplate.playerRacer = racer;
            }
            this.unloadModels(...usedModels);
            let bossCar = new Car(-1);
            if (MissionTemplate.bossPath > -1) {
                Streaming.RequestCarRecording(MissionTemplate.bossPath);
                while (!Streaming.HasCarRecordingBeenLoaded(MissionTemplate.bossPath))
                    wait(0);
                for (let i = 0; i < MissionTemplate.racersCount; ++i) {
                    if (MissionTemplate.playerRacerId === i)
                        continue;
                    bossCar = MissionTemplate.racers[i].car;
                    break;
                }
            }
            Audio.SetRadioChannel(12);
            Audio.SetRadioChannel(-1);
            this.resetCamera();
            wait(1000);
            wait(this.fadeToTransparent());
            Text.PrintBig("RACES_4", 1100, 4); // 3
            Audio.ReportMissionAudioEventAtPosition(0.0, 0.0, 0.0, 1056);
            wait(1100);
            Text.PrintBig("RACES_5", 1100, 4); // 2
            Audio.ReportMissionAudioEventAtPosition(0.0, 0.0, 0.0, 1056);
            wait(1100);
            Text.PrintBig("RACES_6", 1100, 4); // 1
            Audio.ReportMissionAudioEventAtPosition(0.0, 0.0, 0.0, 1056);
            wait(1100);
            Text.PrintBig("RACES_7", 1100, 4); // GO!
            Audio.ReportMissionAudioEventAtPosition(0.0, 0.0, 0.0, 1057);
            if (!MissionTemplate.isWantedChallenge) {
                MissionTemplate.lastCheckpointId = MissionTemplate.findLastCheckpointId();
                MissionTemplate.racers[MissionTemplate.playerRacerId].nextNodeId = -1;
                this.player.alterWantedLevelNoDrop(MissionTemplate.minWantedLevel);
            }
            for (let i = 0; i < MissionTemplate.racersCount; ++i)
                MissionTemplate.racers[i].car.freezePosition(false);
            this.player.setControl(true);
            if (Car.DoesExist(+bossCar) && MissionTemplate.bossPath > -1)
                bossCar.startPlayback(MissionTemplate.bossPath).setPlaybackSpeed(MissionTemplate.bossPathSpeed);
            MissionTemplate.changeTraffic();
            MissionTemplate.changeWanted();
        };

        this.onStartEvent = () => {
            wait(this.fadeToOpaque());
            this._onStartEvent();
            this._disableSetup = false;
            this.setTraffic(0.0, 0.0);
            this.setWanted(0, false, 0.0);
            MissionTemplate.changeTraffic();
            MissionTemplate.changeWanted();
            this.onRacerSetupEvent();
            this._disableSetup = true;
            MissionTemplate.begin();
        };

        MissionTemplate.update = () => {
            if (this.isCarDead(MissionTemplate.playerRacerCar)) {
                this.fail("RACES24", 6000);
                return;
            }
            if (!this.playerChar.isInAnyCar()) {
                this.fail("RACES20", 6000);
                return;
            }
            if (MissionTemplate.isWantedChallenge)
                return;
            for (let i = 0; i < MissionTemplate.racersCount; ++i) {
                const racer = MissionTemplate.racers[i];
                if (racer.isPlayer) {
                    this._updatePlayerRacer(racer);
                    continue;
                }
                if (this.isCharDead(racer.char) || this.isCarDead(racer.car) || racer.car.hasBeenDamagedByChar(this.playerChar)) {
                    this.fail("RACES25", 6000);
                    return;
                }
                if (!racer.char.isInCar(racer.car))
                    racer.char.warpIntoCar(racer.car);
                if (racer.isKnockedOut)
                    continue;
                let currentNode = MissionTemplate.route[racer.nextNodeId];
                if (StuckCarCheck.IsCarStuck(racer.car) && !(racer.car.isOnScreen() || racer.car.isPlaybackGoingOn()))
                    this._tryRestoreRacerCar(racer, currentNode);
                if (racer.car.locate3D(currentNode.x, currentNode.y, currentNode.z, 12.0, 12.0, 12.0, false)) {
                    if (currentNode.isCheckpoint) {
                        racer.totalSpeed += racer.car.getSpeed();
                        MissionTemplate.onRacerRouteNodePassedEvent(racer, currentNode);
                    }
                    let nextNodeId = racer.nextNodeId + 1;
                    if (nextNodeId === MissionTemplate.nodesCount) {
                        racer.currentLap += 1;
                        MissionTemplate.onRacerLapPassedEvent(racer, racer.currentLap);
                        nextNodeId = 0;
                    }
                    racer.lastNode = currentNode;
                    racer.nextNodeId = nextNodeId;
                    currentNode = MissionTemplate.route[nextNodeId];
                    racer.char.clearTasks();
                }
                if (racer.car.isPlaybackGoingOn())
                    continue;
                if (this.isScriptTaskFinished(racer.char, 0x05D1))
                    Task.CarDriveToCoord(racer.char, racer.car, currentNode.x, currentNode.y, currentNode.z, currentNode.speed, 0, 0, 2);
            }
        };

        this.onUpdateEvent = () => {
            MissionTemplate.update();
            MissionTemplate.draw();
            this._onUpdateEvent();
        };

    }

    public onEndEvent(): void {
        MissionTemplate.unload();
        MissionTemplate = null;
        super.onEndEvent();
    }



    /** Handles the script start event, called when the script begins. */
    public onRacerSetupEvent(): void { }



    /**
     * Adds a new street racer. Character and car models will be loaded and unloaded automatically.
     * @param carModel - The model ID of the racer's car.
     * @param x - The X coordinate of the starting position.
     * @param y - The Y coordinate of the starting position.
     * @param z - The Z coordinate of the starting position.
     * @param heading - The heading angle in degrees.
     * @param charModelId - The model ID of the racer's character, or -1 for random (default: -1).
     * @param setupCar - The function to apply additional car settings, or undefined to skip (default: undefined).
     */
    public addRacer(carModel: int, x: float, y: float, z: float, heading: float, charModelId: int = -1, setupCar: (car: Car) => void = undefined): void {
        if (this._disableSetup)
            return;
        if (setupCar === undefined)
            setupCar = MissionTemplate.defaultCarSettings;
        const addedRacerInfo = new RacerInfo(carModel, x, y, z, heading, 8 > charModelId ? -1 : charModelId, setupCar, 0.0, 0.0, false);
        MissionTemplate.racersInfo.push(addedRacerInfo);
    }

    /**
     * Adds the player as a street racer. Car model will be loaded and unloaded automatically.
     * @param carModel - The model ID of the racer's car.
     * @param x - The X coordinate of the starting position.
     * @param y - The Y coordinate of the starting position.
     * @param z - The Z coordinate of the starting position.
     * @param heading - The heading angle in degrees.
     * @param setupCar - The function to apply additional car settings (default: undefined).
     */
    public addPlayerRacer(carModel: int, x: float, y: float, z: float, heading: float, setupCar: (car: Car) => void = undefined): void {
        if (this._disableSetup)
            return;
        if (setupCar === undefined)
            setupCar = MissionTemplate.defaultCarSettings;
        MissionTemplate.racersInfo.push(new RacerInfo(carModel, x, y, z, heading, 0, setupCar, 0.0, 0.0, true));
    }

    /**
     * Adds a new checkpoint node mandatory for both player and NPC.
     * @param x - The X coordinate of the node.
     * @param y - The Y coordinate of the node.
     * @param z - The Z coordinate of the node.
     * @param heading - The heading angle in degrees.
     * @param speed - The speed for the node in game units (non-negative).
     * @param timeLimitMs - The time limit for reaching the node in milliseconds (default: 0).
     */
    public addRouteNode(x: float, y: float, z: float, heading: float, speed: float, timeLimitMs: int = 0): void {
        if (this._disableSetup)
            return;
        const node = new RouteNode(x, y, z, heading, speed, true, timeLimitMs);
        node.checkpointId = MissionTemplate.route.length;
        MissionTemplate.route.push(node);
    }

    /**
     * Adds a new route node for NPC navigation.
     * @param x - The X coordinate of the node.
     * @param y - The Y coordinate of the node.
     * @param z - The Z coordinate of the node.
     * @param heading - The heading angle in degrees.
     * @param speed - The speed for the node in game units (non-negative).
     * @param timeLimitMs - The time limit for reaching the node in milliseconds (default: 0).
     */
    public addRouteNodeNoCheckpoint(x: float, y: float, z: float, heading: float, speed: float, timeLimitMs: int = 0): void {
        if (this._disableSetup)
            return;
        MissionTemplate.route.push(new RouteNode(x, y, z, heading, speed, false, timeLimitMs));
    }

    /**
     * Sets traffic parameters.
     * @param cars - The car density multiplier.
     * @param peds - The pedestrian density multiplier.
     */
    public setTraffic(cars: float, peds: float): void {
        if (this._disableSetup)
            return;
        MissionTemplate.carDensityMultiplier = cars;
        MissionTemplate.pedDensityMultiplier = peds;
    }

    /**
     * Sets wanted parameters.
     * @param cops - Whether to spawn cops (default: true).
     * @param wantedMultiplier - The multiplier for wanted level (default: 1.0).
     */
    public setWanted(minWantedLevel: int, spawnCops: boolean = true, wantedMultiplier: float = 1.0): void {
        if (this._disableSetup)
            return;
        MissionTemplate.minWantedLevel = minWantedLevel;
        MissionTemplate.spawnCops = spawnCops;
        MissionTemplate.wantedMultiplier = wantedMultiplier;
    }



    private _tryRestoreRacerCar(racer: Racer, currentNode: RouteNode): void {
        const lastNode = racer.lastNode;
        let anyRacerLocatedAtLastNode = false;
        for (let i = 0; i < MissionTemplate.racersCount; ++i) {
            if (MissionTemplate.racers[i].id === i)
                continue;
            const racer = MissionTemplate.racers[i];
            if (racer.char.locateAnyMeans3D(lastNode.x, lastNode.y, lastNode.z, 12.0, 12.0, 12.0, false)
                || racer.car.locate3D(lastNode.x, lastNode.y, lastNode.z, 12.0, 12.0, 12.0, false)) {
                anyRacerLocatedAtLastNode = true;
                break;
            }
        }
        if (anyRacerLocatedAtLastNode)
            return;
        World.ClearArea(racer.lastNode.x, racer.lastNode.y, racer.lastNode.z, 4.0, true);
        racer.car.setRotationVelocity(0.0, 0.0, lastNode.heading).setCoordinates(lastNode.x, lastNode.y, lastNode.z)
            .setCruiseSpeed(currentNode.speed).setForwardSpeed(currentNode.speed);
    }

    private _updatePlayerRacer(racer: Racer): void {
        if (MissionTemplate.isCheckpointsDisabled)
            return;
        if (racer.nextNodeId === -1)
            racer.nextNodeId = MissionTemplate.findNextCheckpointId(-1);
        let currentCheckpoint = MissionTemplate.route[racer.nextNodeId];
        if (MissionTemplate.playerRacerCar.locate3D(currentCheckpoint.x, currentCheckpoint.y, currentCheckpoint.z, 12.0, 12.0, 12.0, false)) {
            /*&& StreetRacer.car.isOnAllWheels()*/
            racer.totalSpeed += MissionTemplate.playerRacerCar.getSpeed();
            racer.availableTime += currentCheckpoint.timeLimitMs;
            MissionTemplate.blip.remove();
            MissionTemplate.checkpoint.delete();
            Audio.ReportMissionAudioEventAtPosition(0.0, 0.0, 0.0, MissionTemplate.checkpointTune);
            MissionTemplate.onRacerRouteNodePassedEvent(racer, currentCheckpoint);
            if (MissionTemplate.lastCheckpointId === racer.nextNodeId) {
                racer.currentLap += 1;
                MissionTemplate.onRacerLapPassedEvent(racer, racer.currentLap);
                racer.nextNodeId = -1;
            }
            racer.nextNodeId = MissionTemplate.findNextCheckpointId(racer.nextNodeId);
            currentCheckpoint = MissionTemplate.route[racer.nextNodeId];
        }
        if (Blip.DoesExist(+MissionTemplate.blip))
            return;
        const nextCheckpoint = MissionTemplate.route[MissionTemplate.findNextCheckpointId(racer.nextNodeId)];
        MissionTemplate.blip = Blip.AddForCoord(currentCheckpoint.x, currentCheckpoint.y, currentCheckpoint.z);
        MissionTemplate.checkpoint = Checkpoint.Create(
            MissionTemplate.isLastCheckpointForPlayer ? 1 : 0,
            currentCheckpoint.x, currentCheckpoint.y, currentCheckpoint.z,
            nextCheckpoint.x, nextCheckpoint.y, nextCheckpoint.z, 6.0
        );
    }

}

/** Base class implementing a sprint race, where the player competes against other racers to reach the final checkpoint first. */
export abstract class BaseSprintRace extends BaseRaceMission {

    private __disableSetup: boolean;
    private _onRacerSetupEvent: () => void;



    public onInitEvent(): void {
        super.onInitEvent();

        this._onRacerSetupEvent = this.onRacerSetupEvent;

        this.onRacerSetupEvent = () => {
            this.__disableSetup = false;
            this._onRacerSetupEvent();
            this.__disableSetup = true;
        };

        MissionTemplate.onRacerLapPassedEvent = (racer: Racer, lastLap: int) => {
            if (racer.isPlayer) {
                this.complete();
            } else {
                this.fail("RACEFA", 5000);
            }
        }

        MissionTemplate.onRacerRouteNodePassedEvent = (racer: Racer, lastNode: RouteNode) => {
            if (racer.isPlayer && MissionTemplate.lastCheckpointId === MissionTemplate.findNextCheckpointId(lastNode.checkpointId))
                MissionTemplate.isLastCheckpointForPlayer = true;
        };

        MissionTemplate.draw = () => {
            Screen.DisplayCounterWith2Numbers(MissionTemplate.getPlayerPositionByDistance(), MissionTemplate.racersCount, 1, MissionTemplate.positionGxt);
        };

    }



    /**
     * Specifies the path and speed for the boss's vehicle. The first non-player racer is considered the boss.
     * @param path - The ID of the car recording path.
     * @param speed - The playback speed for the path (default: 1.0).
     */
    public setBossPath(path: int, speed: float = 1.0): void {
        if (this.__disableSetup)
            return;
        MissionTemplate.bossPath = path;
        MissionTemplate.bossPathSpeed = speed;
    }

}

/** Base class implementing circuit racing. */
export abstract class BaseCircuitRace extends BaseRaceMission {

    private __disableSetup: boolean;
    private _onRacerSetupEvent: () => void;

    /**
     * Sets the number of race laps, with a minimum of 2.
     * @param count - The number of laps for the race.
     */
    public set lapsCount(count: int) {
        if (this.__disableSetup)
            return;
        if (count > 2)
            MissionTemplate.lapsCount = count;
    }



    public onInitEvent(): void {
        super.onInitEvent();

        this._onRacerSetupEvent = this.onRacerSetupEvent;

        this.onRacerSetupEvent = () => {
            MissionTemplate.lapsCount = 2;
            this.__disableSetup = false;
            this._onRacerSetupEvent();
            this.__disableSetup = true;
        };

        MissionTemplate.onRacerLapPassedEvent = (racer: Racer, lastLap: int) => {
            if (MissionTemplate.lapsCount > lastLap)
                return;
            if (racer.isPlayer) {
                this.complete();
            } else {
                this.fail("RACEFA", 5000);
            }
        }

        MissionTemplate.onRacerRouteNodePassedEvent = (racer: Racer, lastNode: RouteNode) => {
            if (!racer.isPlayer || MissionTemplate.lapsCount > (racer.currentLap + 1))
                return;
            if (MissionTemplate.lastCheckpointId === MissionTemplate.findNextCheckpointId(lastNode.checkpointId))
                MissionTemplate.isLastCheckpointForPlayer = true;
        };

        MissionTemplate.draw = () => {
            Screen.DisplayCounterWith2Numbers(MissionTemplate.getPlayerPositionByDistance(), MissionTemplate.racersCount, 1, MissionTemplate.positionGxt);
            Screen.DisplayCounterWith2Numbers(MissionTemplate.playerRacer.currentLap + 1, MissionTemplate.lapsCount, 2, "RACES32");
        };

    }

}

/** Base class implementing a knockout race where the number of laps depends on the number of racers. */
export abstract class BaseLapKnockoutRace extends BaseRaceMission {

    private _safeZCoordForCars: float;
    private _randomNames: int[];
    private _onRacerSetupEvent: () => void;
    private _onBegin: () => void;



    public onInitEvent(): void {
        super.onInitEvent();

        MissionTemplate.onRacerLapPassedEvent = (racer: Racer, lastLap: int) => {
            let isKnocked = true;
            for (let i = 0; i < MissionTemplate.racersCount; ++i) {
                const racer = MissionTemplate.racers[i];
                if (racer.isKnockedOut)
                    continue;
                if (lastLap > racer.currentLap) {
                    isKnocked = false;
                    break;
                }
            }
            if (isKnocked) {
                if (racer.isPlayer) {
                    this.fail("RACEFA", 5000);
                    return;
                }
                MissionTemplate.racersBlips[racer.id].changeDisplay(0);
                racer.isKnockedOut = true;
                this._safeZCoordForCars -= 10.0;
                racer.char.setProofs(true, true, true, true, true).clearTasks();
                racer.car.setProofs(true, true, true, true, true).setRotationVelocity(0.0, 0.0, 0.0)
                    .setCoordinates(0.0, 0.0, this._safeZCoordForCars)
                    .freezePositionAndDontLoadCollision(true);
                if (this._randomNames.length > 0)
                    Text.PrintStringInStringNow("RACES52", `CRED61${this._randomNames.pop()}`, 4000, 1);
                return;
            }
            if (MissionTemplate.lapsCount > lastLap)
                return;
            if (racer.isPlayer) {
                this.complete();
            } else {
                this.fail("RACEFA", 5000);
            }
        }

        MissionTemplate.onRacerRouteNodePassedEvent = (racer: Racer, lastNode: RouteNode) => {
            if (!racer.isPlayer || MissionTemplate.lapsCount > (racer.currentLap + 1))
                return;
            if (MissionTemplate.lastCheckpointId === MissionTemplate.findNextCheckpointId(lastNode.checkpointId))
                MissionTemplate.isLastCheckpointForPlayer = true;;
        };

        MissionTemplate.draw = () => {
            Screen.DisplayCounterWith2Numbers(MissionTemplate.getPlayerPositionByDistance(), MissionTemplate.racersCount, 1, MissionTemplate.positionGxt);
            if (MissionTemplate.lapsCount > 1)
                Screen.DisplayCounterWith2Numbers(MissionTemplate.playerRacer.currentLap + 1, MissionTemplate.lapsCount, 2, "RACES32");
        };

        this._onRacerSetupEvent = this.onRacerSetupEvent;
        this._onBegin = MissionTemplate.begin;

        this.onRacerSetupEvent = () => {
            this._safeZCoordForCars = -1000.0;
            this._generateRandomStreetRacersNames();
            this._onRacerSetupEvent();
        };

        MissionTemplate.begin = () => {
            this._onBegin();
            MissionTemplate.lapsCount = MissionTemplate.racersCount - 1;
        };

    }



    private _generateRandomStreetRacersNames(): void {
        this._randomNames = new Array<int>();
        for (let i = 0; i < 10; ++i)
            this._randomNames.push(i);
        for (let i = this._randomNames.length - 1; i > 0; --i) {
            const j = Math.floor(Math.random() * (i + 1));
            [this._randomNames[i], this._randomNames[j]] = [this._randomNames[j], this._randomNames[i]];
        }
    }

}

/** Base class implementing a speedtrap race, where the winner is determined by total speed at checkpoints. */
export abstract class BaseSpeedtrapRace extends BaseRaceMission {

    private __disableSetup: boolean;
    private _onRacerSetupEvent: () => void;

    /**
     * Sets the number of race laps, with a minimum of 1.
     * @param count - The number of laps for the race.
     */
    public set lapsCount(count: int) {
        if (this.__disableSetup)
            return;
        if (count > 1)
            MissionTemplate.lapsCount = count;
    }

    /**
     * Sets the GXT key for displaying the player's accumulated speed.
     * @param gxtKey - The GXT key to set.
     */
    public set accumulatedSpeedGxt(gxtKey: string) {
        MissionTemplate.accumulatedSpeedGxt = gxtKey;
    }



    public onInitEvent(): void {
        super.onInitEvent();

        this._onRacerSetupEvent = this.onRacerSetupEvent;

        this.onRacerSetupEvent = () => {
            this.__disableSetup = false;
            this._onRacerSetupEvent();
            this.__disableSetup = true;
            MissionTemplate.checkpointTune = 1132;
        };

        MissionTemplate.onRacerLapPassedEvent = (racer: Racer, lastLap: int) => {
            if (MissionTemplate.lapsCount > lastLap)
                return;
            this._recalculateSpeeds(racer.id);
        }

        MissionTemplate.onRacerRouteNodePassedEvent = (racer: Racer, lastNode: RouteNode) => {
            if (!racer.isPlayer || MissionTemplate.lapsCount > (racer.currentLap + 1))
                return;
            if (MissionTemplate.lastCheckpointId === MissionTemplate.findNextCheckpointId(lastNode.checkpointId))
                MissionTemplate.isLastCheckpointForPlayer = true;
        };

        MissionTemplate.draw = () => {
            Screen.DisplayCounterWith2Numbers(MissionTemplate.getPlayerPositionBySpeed(), MissionTemplate.racersCount, 1, MissionTemplate.positionGxt);
            Screen.DisplayCounter(MissionTemplate.playerRacer.totalSpeed, 2, MissionTemplate.accumulatedSpeedGxt);
            if (MissionTemplate.lapsCount > 1)
                Screen.DisplayCounterWith2Numbers(MissionTemplate.playerRacer.currentLap + 1, MissionTemplate.lapsCount, 3, "RACES32");
        };

    }



    private _recalculateSpeeds(finishedRacerId: int): void {
        const lastCheckpointId = MissionTemplate.lastCheckpointId;
        const racersCount = MissionTemplate.racersCount;
        for (let i = 0; i < racersCount; ++i) {
            if (finishedRacerId === i || MissionTemplate.playerRacerId === i)
                continue;
            const currentStreetRacer = MissionTemplate.racers[i];
            if (lastCheckpointId === currentStreetRacer.nextNodeId) {
                currentStreetRacer.totalSpeed += MissionTemplate.route[lastCheckpointId].speed;
                continue;
            }
            while (lastCheckpointId > currentStreetRacer.nextNodeId) {
                currentStreetRacer.nextNodeId = MissionTemplate.findNextCheckpointId(currentStreetRacer.nextNodeId);
                currentStreetRacer.totalSpeed += MissionTemplate.route[currentStreetRacer.nextNodeId].speed;
            }
        }
        let maxSpeed = 0.0;
        let winnerId = 0;
        for (let i = 0; i < racersCount; ++i) {
            const currentStreetRacer = MissionTemplate.racers[i];
            if (currentStreetRacer.totalSpeed > maxSpeed) {
                maxSpeed = currentStreetRacer.totalSpeed;
                winnerId = i;
            }
        }
        if (MissionTemplate.racers[winnerId].isPlayer) {
            this.complete();
            return;
        }
        this.fail("RACEFA", 5000);
    }

}

/** Base class implementing a speed radar challenge, where the player must pass radars to achieve a required speed within an optional time limit. */
export abstract class BaseRadarChallenge extends BaseRaceMission {

    private __disableSetup: boolean;
    private _timeLimit: int;
    private _radarTimer: Timer;
    private _useTimer: boolean;
    private _playerSpeed: float;
    private _neededSpeed: float;
    private _radarNodes: RadarNode[];
    private _passedRadarsCount: int;
    private _onRacerSetupEvent: () => void;
    private _onBegin: () => void;

    /**
     * Sets the time limit for the player to pass all radars, enabling the timer.
     * @param timeInMilliseconds - Time limit in milliseconds.
     */
    public set timeLimit(time: int) {
        if (this.__disableSetup)
            return;
        this._timeLimit = time;
        this._useTimer = true;
    }

    /**
     * Sets the GXT key for displaying the player's current speed.
     * @param gxtKey - The GXT key to set.
     */
    public set currentSpeedGxt(gxtKey: string) {
        MissionTemplate.currentSpeedGxt = gxtKey;
    }

    /**
     * Sets the GXT key for displaying the player's accumulated speed.
     * @param gxtKey - The GXT key to set.
     */
    public set accumulatedSpeedGxt(gxtKey: string) {
        MissionTemplate.accumulatedSpeedGxt = gxtKey;
    }



    public onInitEvent(): void {
        super.onInitEvent();

        this._onRacerSetupEvent = this.onRacerSetupEvent;
        this._onBegin = MissionTemplate.begin;

        this.onRacerSetupEvent = () => {
            this._passedRadarsCount = 0;
            this._timeLimit = 10000;
            this._neededSpeed = 0.0;
            this._playerSpeed = 0.0;
            this._useTimer = false;
            this._radarNodes = new Array<RadarNode>();
            this.__disableSetup = false;
            this._onRacerSetupEvent();
            this.__disableSetup = true;
            MissionTemplate.isChallenge = true;
            MissionTemplate.checkpointTune = 1132;
            MissionTemplate.isCheckpointsDisabled = true;
        };

        MissionTemplate.begin = () => {
            this._onBegin();
            let checkpointId = MissionTemplate.lastCheckpointId;
            do {
                const routeNode = MissionTemplate.route[checkpointId];
                this._neededSpeed += routeNode.speed;
                this._radarNodes.push(new RadarNode(routeNode));
                checkpointId = MissionTemplate.findNextCheckpointId(checkpointId);
            } while (checkpointId !== MissionTemplate.lastCheckpointId);
            this._radarNodes.forEach(radarNode => radarNode.create());
            if (this._useTimer) {
                this._radarTimer = new Timer();
                this._radarTimer.reset(this._timeLimit);
            }
        };

        MissionTemplate.draw = () => {
            if (this._useTimer) {
                if (0 >= this._radarTimer.millisecondsLeft) {
                    this._removeAll(true, "BB_17");
                    return;
                }
                Screen.DisplayTimeLeft(this._radarTimer);
            }
            for (let i = 0; i < MissionTemplate.nodesCount; ++i) {
                const radar = this._radarNodes[i];
                if (radar.isPassed)
                    continue;
                if (MissionTemplate.playerRacerCar.locate3D(radar.x, radar.y, radar.z, 12.0, 12.0, 12.0, false)) {
                    /*&& this._playerCar.isOnAllWheels()*/
                    Audio.ReportMissionAudioEventAtPosition(0.0, 0.0, 0.0, 1132);
                    radar.isPassed = true;
                    radar.remove();
                    this._passedRadarsCount += 1;
                    this._playerSpeed += MissionTemplate.playerRacerCar.getSpeed();
                    Text.PrintWith2NumbersNow("SN_ONE", this._passedRadarsCount, MissionTemplate.nodesCount, 5000, 1);
                }
            }
            Screen.DisplayCounter(this._neededSpeed, 1, "ST1_7");
            Screen.DisplayCounter(this._playerSpeed, 2, MissionTemplate.accumulatedSpeedGxt);
            Screen.DisplayCounter(MissionTemplate.playerRacerCar.getSpeed(), 4, MissionTemplate.currentSpeedGxt);
            if (this._passedRadarsCount === MissionTemplate.nodesCount)
                this._removeAll(this._neededSpeed > this._playerSpeed, "DNC_003");
        };

    }



    private _removeAll(isFailed: boolean, reasonSmallMessageGxt: string): void {
        this._radarNodes.forEach(radarNode => radarNode.remove());
        if (isFailed) {
            this.fail(reasonSmallMessageGxt, 5000);
        } else {
            this.complete();
        }
    }

}

/** Base class implementing a timed checkpoint challenge, where the player must pass checkpoints within time limits. */
export abstract class BaseCheckpointChallenge extends BaseRaceMission {

    private _checkpointTimer: Timer;
    private __disableSetup: boolean;
    private _onRacerSetupEvent: () => void;
    private _onBegin: () => void;

    /**
     * Sets the number of challenge laps, with a minimum of 1.
     * @param count - The number of laps for the challenge.
     */
    public set lapsCount(count: int) {
        if (this.__disableSetup)
            return;
        if (count > 1)
            MissionTemplate.lapsCount = count;
    }



    public onInitEvent(): void {
        super.onInitEvent();

        this._onRacerSetupEvent = this.onRacerSetupEvent;
        this._onBegin = MissionTemplate.begin;

        this.onRacerSetupEvent = () => {
            MissionTemplate.lapsCount = 1;
            this._checkpointTimer = new Timer();
            this.__disableSetup = false;
            this._onRacerSetupEvent();
            this.__disableSetup = true;
            MissionTemplate.isChallenge = true;
            MissionTemplate.checkpointTune = 1132;
        };

        MissionTemplate.onRacerLapPassedEvent = (racer: Racer, lastLap: int) => {
            if (MissionTemplate.lapsCount > lastLap)
                return;
            if (racer.isPlayer)
                this.complete();
        }

        MissionTemplate.onRacerRouteNodePassedEvent = (racer: Racer, lastNode: RouteNode) => {
            if (racer.isPlayer && lastNode.isCheckpoint) {
                const nextCheckpointId = MissionTemplate.findNextCheckpointId(lastNode.checkpointId);
                const nextRouteNode = MissionTemplate.route[nextCheckpointId];
                this._checkpointTimer.addMilliseconds(nextRouteNode.timeLimitMs);
                Text.PrintWithNumberNow("A_TIME", Math.floor((nextRouteNode.timeLimitMs / 1000) % 60), 5000, 1); // +seconds
            }
            if (!racer.isPlayer || MissionTemplate.lapsCount > (racer.currentLap + 1))
                return;
            if (MissionTemplate.lastCheckpointId === MissionTemplate.findNextCheckpointId(lastNode.checkpointId))
                MissionTemplate.isLastCheckpointForPlayer = true;
        };


        MissionTemplate.begin = () => {
            this._onBegin();
            const nextCheckpointId = MissionTemplate.findNextCheckpointId(-1);
            const nextRouteNode = MissionTemplate.route[nextCheckpointId];
            this._checkpointTimer.reset(nextRouteNode.timeLimitMs);
        };

        MissionTemplate.draw = () => {
            if (MissionTemplate.lapsCount > 1)
                Screen.DisplayCounterWith2Numbers(MissionTemplate.playerRacer.currentLap + 1, MissionTemplate.lapsCount, 1, "RACES32");
            if (0 >= this._checkpointTimer.millisecondsLeft) {
                this.fail("BB_17", 5000);
                return;
            }
            Screen.DisplayTimeLeft(this._checkpointTimer);
        };

    }

}

/** Base class implementing a wanted challenge, where the player must maintain a specified wanted level for a set time while evading cops. */
export abstract class BaseWantedChallenge extends BaseRaceMission {

    private __disableSetup: boolean;
    private _chaseStage: int;
    private _chaseTimer: Timer;
    private _timeMinimum: int;
    private _mandatoryToAvoidPolice: boolean;
    private _onRacerSetupEvent: () => void;

    /** Sets the startup message. */
    public set startWantedMessage(gxtKey: string) {
        MissionTemplate.startWantedGxt = gxtKey;
    }

    /** Sets the message displayed when the wanted level is lost. */
    public set lostWantedMessage(gxtKey: string) {
        MissionTemplate.lostWantedGxt = gxtKey;
    }

    /** Sets the message about the need to clear the wanted level. */
    public set clearWantedMessage(gxtKey: string) {
        MissionTemplate.clearWantedGxt = gxtKey;
    }

    /** Sets the minimum time the police wanted level must be maintained (in milliseconds). */
    public set timeMinimum(time: int) {
        this._timeMinimum = time;
    }

    /** Makes it mandatory to avoid the police to complete the mission. */
    public set mandatoryToAvoidPolice(state: boolean) {
        if (this.__disableSetup)
            return;
        this._mandatoryToAvoidPolice = state;
    }



    public onInitEvent(): void {
        super.onInitEvent();

        this._onRacerSetupEvent = this.onRacerSetupEvent;

        this.onRacerSetupEvent = () => {
            this._chaseTimer = new Timer(10000);
            this._chaseStage = 0;
            this._mandatoryToAvoidPolice = false;
            this.__disableSetup = false;
            this.setTraffic(1.0, 1.0);
            this.setWanted(1, true, 1.0);
            this._onRacerSetupEvent();
            this.__disableSetup = true;
            this.savePlayerWeapons();
            this.loadWeaponModelsNow(29);
            this.playerChar.giveWeapon(29, 9999).setCurrentWeapon(29);
            this.unloadWeaponModels(29);
            MissionTemplate.isChallenge = true;
            MissionTemplate.isWantedChallenge = true;
            MissionTemplate.spawnCops = true;
        };

        MissionTemplate.draw = () => {
            switch (this._chaseStage) {
                case 0:
                    this._chaseTimer.reset(this._timeMinimum);
                    if (1 > MissionTemplate.minWantedLevel)
                        MissionTemplate.minWantedLevel = 1;
                    this.player.alterWantedLevel(MissionTemplate.minWantedLevel);
                    this.printText(MissionTemplate.startWantedGxt, 6000);
                    this._chaseStage = 1;
                    break;
                case 1:
                    if (MissionTemplate.minWantedLevel > this.player.storeWantedLevel())
                        this.fail(MissionTemplate.lostWantedGxt, 5000);
                    Screen.DisplayTimeLeft(this._chaseTimer);
                    if (this._chaseTimer.millisecondsLeft > 1)
                        break;
                    if (this._mandatoryToAvoidPolice) {
                        this.printText(MissionTemplate.clearWantedGxt, 6000);
                        this._chaseStage = 2;
                    } else {
                        this._chaseStage = 3;
                    }
                    break;
                case 2:
                    if (this.player.storeWantedLevel() === 0)
                        this._chaseStage = 3;
                    break;
                case 3:
                    this.player.clearWantedLevel();
                    this.complete();
                    break;
            }
        };

    }

}