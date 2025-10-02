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





class SuperMissionTemplate {

    public readonly SetupEmptyCar: (car: Car) => void = (car: Car) => { };

    public PositionGxt: string = "RACES44";
    public StartWantedGxt: string = "";
    public LostWantedGxt: string = "RACEFA";
    public ClearWantedGxt: string = "";
    public PedDensityMultiplier: float = 0.0;
    public CarDensityMultiplier: float = 0.0;
    public NodesCount: int = 0;
    public IsWantedChallenge: boolean = false;
    public DisablePlayerCheckpointsCheck: boolean = false;
    public IsChallenge: boolean = false;
    public MinWantedLevel: int = 0;
    public SpawnCops: boolean = false;
    public WantedMultiplier: float = 0.0;
    public LapsCount: int = 1;
    public PlayerRacer: Racer = null;
    public PlayerRacerId: int = -1;
    public LastCheckpointId: int = -1;
    public LastCheckpointForPlayer: boolean = false;
    public BossPath: int = -1;
    public BossPathSpeed: float = 0.0;
    public Racers: Racer[] = new Array<Racer>();
    public Route: RouteNode[] = new Array<RouteNode>();
    public RacersInfo: RacerInfo[] = new Array<RacerInfo>();
    public RacersBlips: Blip[] = new Array<Blip>();
    public RacersCount = 0;
    public CheckpointTune = 1058;
    public PlayerRacerCar: Car = new Car(-1);
    public Blip: Blip = new Blip(-1);
    public Checkpoint: Checkpoint = new Checkpoint(-1);

    public Begin: () => void;
    public Update: () => void = null;
    public Draw: () => void = null;
    public onRacerRouteNodePassedEvent: (racer: Racer, lastNode: RouteNode) => void;
    public onRacerLapPassedEvent: (racer: Racer, lastLap: int) => void;

    public Load(): void {
        Text.LoadMissionText("RACETOR");
        FxtStore.insert("NAMEKNO", "~d~ ~a~ ~d~", true);
    }

    public Unload(): void {
        FxtStore.delete("NAMEKNO", true);
        this.Blip.remove();
        this.Checkpoint.delete();
        if (this.BossPath > -1)
            Streaming.RemoveCarRecording(this.BossPath);
    }

    public ChangeTraffic(): void {
        World.SetPedDensityMultiplier(this.PedDensityMultiplier);
        World.SetCarDensityMultiplier(this.CarDensityMultiplier);
    }

    public ChangeWanted(): void {
        Game.SetPoliceIgnorePlayer(Core.Player, !this.SpawnCops);
        Game.SetCreateRandomCops(this.SpawnCops);
        Game.EnableAmbientCrime(this.SpawnCops);
        Game.SwitchPoliceHelis(this.SpawnCops);
        Game.SwitchCopsOnBikes(this.SpawnCops);
        Game.SetWantedMultiplier(this.WantedMultiplier);
    }

    /** @returns The player position in race. */
    public CalculatePlayerPositionByDistance(): int {
        let position = 1;
        const currentPlayerCheckpointId = this.PlayerRacer.nextNodeId;
        for (let i = 0; i < this.RacersCount; ++i) {
            if (this.PlayerRacerId === i)
                continue;
            if (this.Racers[i].currentLap > this.PlayerRacer.currentLap) {
                position += 1;
            } else if (this.Racers[i].currentLap === this.PlayerRacer.currentLap) {
                let currentStreetRacerCheckpointId = this.Racers[i].nextNodeId;
                if (!this.Route[currentStreetRacerCheckpointId].isCheckpoint)
                    currentStreetRacerCheckpointId = this.FindNextCheckpointId(currentStreetRacerCheckpointId);
                if (currentStreetRacerCheckpointId > currentPlayerCheckpointId) {
                    position += 1;
                } else if (currentStreetRacerCheckpointId === currentPlayerCheckpointId) {
                    const playerCoord = this.PlayerRacerCar.getCoordinates();
                    const racerCoord = this.Racers[i].car.getCoordinates();
                    const nextNode = this.Route[currentPlayerCheckpointId];
                    const playerDistance = Math.GetDistanceBetweenCoords3D(playerCoord.x, playerCoord.y, playerCoord.z, nextNode.x, nextNode.y, nextNode.z);
                    const racerDistance = Math.GetDistanceBetweenCoords3D(racerCoord.x, racerCoord.y, racerCoord.z, nextNode.x, nextNode.y, nextNode.z);
                    if (playerDistance > racerDistance)
                        position += 1;
                }
            }
        }
        return position;
    }

    /** @returns The player position in race. */
    public CalculatePlayerPositionBySpeed(): int {
        let position = 1;
        const playerSpeed = this.PlayerRacer.totalSpeed;
        for (let i = 0; i < this.RacersCount; ++i) {
            if (this.PlayerRacerId === i)
                continue;
            let currentStreetRacer = this.Racers[i];
            if (currentStreetRacer.totalSpeed > playerSpeed)
                position += 1;
        }
        return position;
    }

    /**
     * Returns the ID of the next checkpoint.
     * @param currentId - The current checkpoint ID.
     * @returns The ID of the next checkpoint. Throws an error if no checkpoints exist.
     */
    public FindNextCheckpointId(currentId: int): int {
        let nextId = currentId + 1;
        for (let i = nextId; i < this.NodesCount; ++i)
            if (this.Route[i].isCheckpoint)
                return i;
        for (let i = 0; i < currentId; ++i)
            if (this.Route[i].isCheckpoint)
                return i;
        throw new Error("There are no checkpoints on the route or their number is less than the minimum!");
    }

    /**
     * @returns The ID of the last checkpoint. Throws an error if no checkpoints exist.
     */
    public FindLastCheckpointId(): int {
        for (let i = this.NodesCount - 1; i >= 0; --i)
            if (this.Route[i].isCheckpoint)
                return i;
        throw new Error("There are no checkpoints on the route or their number is less than the minimum!");
    }

    /**
     * 
     * @returns 
     */
    public CalculateCheckpointsCount(): int {
        let result = 0;
        for (let i = 0; i < this.NodesCount; ++i)
            if (this.Route[i].isCheckpoint)
                result += 1;
        return result;
    }

}


let MissionTemplate: SuperMissionTemplate = null;

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
        MissionTemplate.PositionGxt = gxtKey;
    }



    public onInitEvent(): void {
        super.onInitEvent();
        MissionTemplate = new SuperMissionTemplate();
        MissionTemplate.Load();
        this._disableSetup = true;
        this.successBigMessage.gxt = "RACES18";

        this._onStartEvent = this.onStartEvent;
        this._onUpdateEvent = this.onUpdateEvent;

        MissionTemplate.Begin = () => {
            MissionTemplate.RacersCount = MissionTemplate.RacersInfo.length;

            if (0 > MissionTemplate.RacersCount || MissionTemplate.RacersCount > 8)
                throw new Error("1");

            let numPlayers = 0;
            const usedModels = new Array<int>();
            for (let i = 0; i < MissionTemplate.RacersCount; ++i) {
                usedModels.push(MissionTemplate.RacersInfo[i].carModel);
                const charModelId = MissionTemplate.RacersInfo[i].charModelId;
                if (MissionTemplate.RacersInfo[i].isPlayer) {
                    MissionTemplate.PlayerRacerId = i;
                    numPlayers += 1;
                }
                if (charModelId > 0 && charModelId !== 7)
                    usedModels.push(charModelId);
            }

            if (numPlayers !== 1)
                throw new Error("2");

            if (MissionTemplate.IsChallenge && MissionTemplate.RacersCount > 1)
                throw new Error("3");

            MissionTemplate.NodesCount = MissionTemplate.Route.length;
            if (!MissionTemplate.IsWantedChallenge)
                MissionTemplate.LastCheckpointId = MissionTemplate.FindLastCheckpointId();

            this.loadModels(...usedModels);
            this.player.clearWantedLevel().setControl(false);
            this.refreshArea(MissionTemplate.RacersInfo[0].x, MissionTemplate.RacersInfo[0].y, MissionTemplate.RacersInfo[0].z, 300.0);
            for (let i = 0; i < MissionTemplate.RacersCount; ++i) {
                const racerInfo = MissionTemplate.RacersInfo[i];
                const racerCar = this.addCar(racerInfo.carModel, racerInfo.x, racerInfo.y, racerInfo.z, racerInfo.heading).setHealth(2000);
                MissionTemplate.RacersBlips.push(this.addBlipToCar(racerCar).setAsFriendly(true).changeScale(2).changeColor(0));
                if (racerInfo.setupCar !== undefined)
                    racerInfo.setupCar(racerCar);
                let racerChar: Char;
                if (racerInfo.isPlayer) {
                    racerChar = this.playerChar;
                    this.playerChar.warpIntoCar(racerCar);
                    MissionTemplate.PlayerRacerCar = racerCar;
                    MissionTemplate.RacersBlips[i].changeDisplay(0);
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
                const racer = new Racer(MissionTemplate.Racers.length, racerChar, racerCar, racerInfo.isPlayer, racerInfo.startNode);
                MissionTemplate.Racers.push(racer);
                if (racerInfo.isPlayer)
                    MissionTemplate.PlayerRacer = racer;
            }
            this.unloadModels(...usedModels);
            //if (!MissionTemplate.IsWantedChallenge) {
            MissionTemplate.Racers[MissionTemplate.PlayerRacerId].nextNodeId = -1;
            //}
            Audio.SetRadioChannel(12);
            Audio.SetRadioChannel(-1);
            this.resetCamera();
            let bossCar = new Car(-1);
            if (MissionTemplate.BossPath > -1) {
                Streaming.RequestCarRecording(MissionTemplate.BossPath);
                while (!Streaming.HasCarRecordingBeenLoaded(MissionTemplate.BossPath))
                    wait(0);
                for (let i = 0; i < MissionTemplate.RacersCount; ++i) {
                    if (MissionTemplate.PlayerRacerId === i)
                        continue;
                    bossCar = MissionTemplate.Racers[i].car;
                    break;
                }
            }
            if (2 > MissionTemplate.CalculateCheckpointsCount())
                MissionTemplate.LastCheckpointForPlayer = true;
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
            if (!MissionTemplate.IsWantedChallenge)
                this.player.alterWantedLevelNoDrop(MissionTemplate.MinWantedLevel);
            this.player.setControl(true);
            for (let i = 0; i < MissionTemplate.RacersCount; ++i)
                MissionTemplate.Racers[i].car.freezePosition(false);
            if (Car.DoesExist(+bossCar) && MissionTemplate.BossPath > -1)
                bossCar.startPlayback(MissionTemplate.BossPath).setPlaybackSpeed(MissionTemplate.BossPathSpeed);
            MissionTemplate.ChangeTraffic();
            MissionTemplate.ChangeWanted();
        };

        this.onStartEvent = () => {
            wait(this.fadeToOpaque());
            this._onStartEvent();
            this._disableSetup = false;
            this.setTraffic(0.0, 0.0);
            this.setWanted(0, false, 0.0);
            MissionTemplate.ChangeTraffic();
            MissionTemplate.ChangeWanted();
            this.onRacerSetupEvent();
            this._disableSetup = true;
            MissionTemplate.Begin();
        };

        MissionTemplate.Update = () => {
            if (this.isCarDead(MissionTemplate.PlayerRacerCar)) {
                this.fail("RACES24", 6000);
                return;
            }
            if (!this.playerChar.isInAnyCar()) {
                this.fail("RACES20", 6000);
                return;
            }
            if (MissionTemplate.IsWantedChallenge)
                return;
            for (let i = 0; i < MissionTemplate.RacersCount; ++i) {
                const racer = MissionTemplate.Racers[i];
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
                let currentNode = MissionTemplate.Route[racer.nextNodeId];
                if (StuckCarCheck.IsCarStuck(racer.car) && !(racer.car.isOnScreen() || racer.car.isPlaybackGoingOn()))
                    this._tryRestoreRacerCar(racer, currentNode);
                if (racer.car.locate3D(currentNode.x, currentNode.y, currentNode.z, 12.0, 12.0, 12.0, false)) {
                    if (currentNode.isCheckpoint) {
                        racer.totalSpeed += racer.car.getSpeed();
                        MissionTemplate.onRacerRouteNodePassedEvent(racer, currentNode);
                    }
                    let nextNodeId = racer.nextNodeId + 1;
                    if (nextNodeId === MissionTemplate.NodesCount) {
                        racer.currentLap += 1;
                        MissionTemplate.onRacerLapPassedEvent(racer, racer.currentLap);
                        nextNodeId = 0;
                    }
                    racer.lastNode = currentNode;
                    racer.nextNodeId = nextNodeId;
                    currentNode = MissionTemplate.Route[nextNodeId];
                    racer.char.clearTasks();
                }
                if (racer.car.isPlaybackGoingOn())
                    continue;
                if (this.isScriptTaskFinished(racer.char, 0x05D1))
                    Task.CarDriveToCoord(racer.char, racer.car, currentNode.x, currentNode.y, currentNode.z, currentNode.speed, 0, 0, 2);
            }
        };

        this.onUpdateEvent = () => {
            MissionTemplate.Update();
            MissionTemplate.Draw();
            this._onUpdateEvent();
        };

    }

    public onEndEvent(): void {
        MissionTemplate.Unload();
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
            setupCar = MissionTemplate.SetupEmptyCar;
        const addedRacerInfo = new RacerInfo(carModel, x, y, z, heading, 8 > charModelId ? -1 : charModelId, setupCar, 0.0, 0.0, false);
        MissionTemplate.RacersInfo.push(addedRacerInfo);
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
            setupCar = MissionTemplate.SetupEmptyCar;
        MissionTemplate.RacersInfo.push(new RacerInfo(carModel, x, y, z, heading, 0, setupCar, 0.0, 0.0, true));
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
        node.checkpointId = MissionTemplate.Route.length;
        MissionTemplate.Route.push(node);
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
        MissionTemplate.Route.push(new RouteNode(x, y, z, heading, speed, false, timeLimitMs));
    }

    /**
     * Sets traffic parameters.
     * @param cars - The car density multiplier.
     * @param peds - The pedestrian density multiplier.
     */
    public setTraffic(cars: float, peds: float): void {
        if (this._disableSetup)
            return;
        MissionTemplate.CarDensityMultiplier = cars;
        MissionTemplate.PedDensityMultiplier = peds;
    }

    /**
     * Sets wanted parameters.
     * @param cops - Whether to spawn cops (default: true).
     * @param wantedMultiplier - The multiplier for wanted level (default: 1.0).
     */
    public setWanted(minWantedLevel: int, spawnCops: boolean = true, wantedMultiplier: float = 1.0): void {
        if (this._disableSetup)
            return;
        MissionTemplate.MinWantedLevel = minWantedLevel;
        MissionTemplate.SpawnCops = spawnCops;
        MissionTemplate.WantedMultiplier = wantedMultiplier;
    }



    private _tryRestoreRacerCar(racer: Racer, currentNode: RouteNode): void {
        const lastNode = racer.lastNode;
        let anyRacerLocatedAtLastNode = false;
        for (let i = 0; i < MissionTemplate.RacersCount; ++i) {
            if (MissionTemplate.Racers[i].id === i)
                continue;
            const racer = MissionTemplate.Racers[i];
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
        if (MissionTemplate.DisablePlayerCheckpointsCheck)
            return;
        if (racer.nextNodeId === -1)
            racer.nextNodeId = MissionTemplate.FindNextCheckpointId(-1);
        let currentCheckpoint = MissionTemplate.Route[racer.nextNodeId];
        if (MissionTemplate.PlayerRacerCar.locate3D(currentCheckpoint.x, currentCheckpoint.y, currentCheckpoint.z, 12.0, 12.0, 12.0, false)) {
            /*&& StreetRacer.car.isOnAllWheels()*/
            racer.totalSpeed += MissionTemplate.PlayerRacerCar.getSpeed();
            racer.availableTime += currentCheckpoint.timeLimitMs;
            MissionTemplate.Blip.remove();
            MissionTemplate.Checkpoint.delete();
            Audio.ReportMissionAudioEventAtPosition(0.0, 0.0, 0.0, MissionTemplate.CheckpointTune);
            MissionTemplate.onRacerRouteNodePassedEvent(racer, currentCheckpoint);
            if (MissionTemplate.LastCheckpointId === racer.nextNodeId) {
                racer.currentLap += 1;
                MissionTemplate.onRacerLapPassedEvent(racer, racer.currentLap);
                racer.nextNodeId = -1;
            }
            racer.nextNodeId = MissionTemplate.FindNextCheckpointId(racer.nextNodeId);
            currentCheckpoint = MissionTemplate.Route[racer.nextNodeId];
        }
        if (Blip.DoesExist(+MissionTemplate.Blip))
            return;
        const nextCheckpoint = MissionTemplate.Route[MissionTemplate.FindNextCheckpointId(racer.nextNodeId)];
        MissionTemplate.Blip = Blip.AddForCoord(currentCheckpoint.x, currentCheckpoint.y, currentCheckpoint.z);
        MissionTemplate.Checkpoint = Checkpoint.Create(
            MissionTemplate.LastCheckpointForPlayer ? 1 : 0,
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
            if (racer.isPlayer && MissionTemplate.LastCheckpointId === MissionTemplate.FindNextCheckpointId(lastNode.checkpointId))
                MissionTemplate.LastCheckpointForPlayer = true;
        };

        MissionTemplate.Draw = () => {
            Screen.DisplayCounter(MissionTemplate.CalculatePlayerPositionByDistance(), 1, MissionTemplate.PositionGxt);
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
        MissionTemplate.BossPath = path;
        MissionTemplate.BossPathSpeed = speed;
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
            MissionTemplate.LapsCount = count;
    }



    public onInitEvent(): void {
        super.onInitEvent();

        this._onRacerSetupEvent = this.onRacerSetupEvent;

        this.onRacerSetupEvent = () => {
            MissionTemplate.LapsCount = 2;
            this.__disableSetup = false;
            this._onRacerSetupEvent();
            this.__disableSetup = true;
        };

        MissionTemplate.onRacerLapPassedEvent = (racer: Racer, lastLap: int) => {
            if (MissionTemplate.LapsCount > lastLap)
                return;
            if (racer.isPlayer) {
                this.complete();
            } else {
                this.fail("RACEFA", 5000);
            }
        }

        MissionTemplate.onRacerRouteNodePassedEvent = (racer: Racer, lastNode: RouteNode) => {
            if (!racer.isPlayer || MissionTemplate.LapsCount > (racer.currentLap + 1))
                return;
            if (MissionTemplate.LastCheckpointId === MissionTemplate.FindNextCheckpointId(lastNode.checkpointId))
                MissionTemplate.LastCheckpointForPlayer = true;
        };

        MissionTemplate.Draw = () => {
            Screen.DisplayCounterWith2Numbers(MissionTemplate.PlayerRacer.currentLap + 1, MissionTemplate.LapsCount, 2, "RACES32");
            Screen.DisplayCounter(MissionTemplate.CalculatePlayerPositionByDistance(), 1, MissionTemplate.PositionGxt);
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
            for (let i = 0; i < MissionTemplate.RacersCount; ++i) {
                const racer = MissionTemplate.Racers[i];
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
                MissionTemplate.RacersBlips[racer.id].changeDisplay(0);
                racer.isKnockedOut = true;
                this._safeZCoordForCars -= 10.0;
                racer.char.setProofs(true, true, true, true, true).clearTasks();
                racer.car.setProofs(true, true, true, true, true).setRotationVelocity(0.0, 0.0, 0.0)
                    .setCoordinates(0.0, 0.0, this._safeZCoordForCars)
                    .freezePositionAndDontLoadCollision(true);
                if (this._randomNames.length > 0)
                    Text.PrintStringInStringNow("NAMEKNO", ("CRED61" + this._randomNames.pop()), 4000, 1);
                return;
            }
            if (MissionTemplate.LapsCount > lastLap)
                return;
            if (racer.isPlayer) {
                this.complete();
            } else {
                this.fail("RACEFA", 5000);
            }
        }

        MissionTemplate.onRacerRouteNodePassedEvent = (racer: Racer, lastNode: RouteNode) => {
            if (!racer.isPlayer || MissionTemplate.LapsCount > (racer.currentLap + 1))
                return;
            if (MissionTemplate.LastCheckpointId === MissionTemplate.FindNextCheckpointId(lastNode.checkpointId))
                MissionTemplate.LastCheckpointForPlayer = true;;
        };

        MissionTemplate.Draw = () => {
            Screen.DisplayCounter(MissionTemplate.CalculatePlayerPositionByDistance(), 1, MissionTemplate.PositionGxt);
            if (MissionTemplate.LapsCount > 1)
                Screen.DisplayCounterWith2Numbers(MissionTemplate.PlayerRacer.currentLap + 1, MissionTemplate.LapsCount, 2, "RACES32");
        };

        this._onRacerSetupEvent = this.onRacerSetupEvent;
        this._onBegin = MissionTemplate.Begin;

        this.onRacerSetupEvent = () => {
            this._safeZCoordForCars = -1000.0;
            this._generateRandomStreetRacersNames();
            this._onRacerSetupEvent();
        };

        MissionTemplate.Begin = () => {
            this._onBegin();
            MissionTemplate.LapsCount = MissionTemplate.RacersCount - 1;
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
            MissionTemplate.LapsCount = count;
    }



    public onInitEvent(): void {
        super.onInitEvent();

        this._onRacerSetupEvent = this.onRacerSetupEvent;

        this.onRacerSetupEvent = () => {
            this.__disableSetup = false;
            this._onRacerSetupEvent();
            this.__disableSetup = true;
            MissionTemplate.CheckpointTune = 1132;
        };

        MissionTemplate.onRacerLapPassedEvent = (racer: Racer, lastLap: int) => {
            if (MissionTemplate.LapsCount > lastLap)
                return;
            this._recalculateSpeeds(racer.id);
        }

        MissionTemplate.onRacerRouteNodePassedEvent = (racer: Racer, lastNode: RouteNode) => {
            if (!racer.isPlayer || MissionTemplate.LapsCount > (racer.currentLap + 1))
                return;
            if (MissionTemplate.LastCheckpointId === MissionTemplate.FindNextCheckpointId(lastNode.checkpointId))
                MissionTemplate.LastCheckpointForPlayer = true;
        };

        MissionTemplate.Draw = () => {
            Screen.DisplayCounter(MissionTemplate.CalculatePlayerPositionBySpeed(), 1, MissionTemplate.PositionGxt);
            Screen.DisplayCounter(MissionTemplate.PlayerRacer.totalSpeed, 2, "KICK1_9");
            if (MissionTemplate.LapsCount > 1)
                Screen.DisplayCounterWith2Numbers(MissionTemplate.PlayerRacer.currentLap + 1, MissionTemplate.LapsCount, 3, "RACES32");
        };

    }



    private _recalculateSpeeds(finishedRacerId: int): void {
        const lastCheckpointId = MissionTemplate.LastCheckpointId;
        const racersCount = MissionTemplate.RacersCount;
        for (let i = 0; i < racersCount; ++i) {
            if (finishedRacerId === i || MissionTemplate.PlayerRacerId === i)
                continue;
            const currentStreetRacer = MissionTemplate.Racers[i];
            if (lastCheckpointId === currentStreetRacer.nextNodeId) {
                currentStreetRacer.totalSpeed += MissionTemplate.Route[lastCheckpointId].speed;
                continue;
            }
            while (lastCheckpointId > currentStreetRacer.nextNodeId) {
                currentStreetRacer.nextNodeId = MissionTemplate.FindNextCheckpointId(currentStreetRacer.nextNodeId);
                currentStreetRacer.totalSpeed += MissionTemplate.Route[currentStreetRacer.nextNodeId].speed;
            }
        }
        let maxSpeed = 0.0;
        let winnerId = 0;
        for (let i = 0; i < racersCount; ++i) {
            const currentStreetRacer = MissionTemplate.Racers[i];
            if (currentStreetRacer.totalSpeed > maxSpeed) {
                maxSpeed = currentStreetRacer.totalSpeed;
                winnerId = i;
            }
        }
        if (MissionTemplate.Racers[winnerId].isPlayer) {
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



    public onInitEvent(): void {
        super.onInitEvent();

        this._onRacerSetupEvent = this.onRacerSetupEvent;
        this._onBegin = MissionTemplate.Begin;

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
            MissionTemplate.IsChallenge = true;
            MissionTemplate.CheckpointTune = 1132;
            MissionTemplate.DisablePlayerCheckpointsCheck = true;
        };

        MissionTemplate.Begin = () => {
            this._onBegin();
            let checkpointId = MissionTemplate.LastCheckpointId;
            do {
                const routeNode = MissionTemplate.Route[checkpointId];
                this._neededSpeed += routeNode.speed;
                this._radarNodes.push(new RadarNode(routeNode));
                checkpointId = MissionTemplate.FindNextCheckpointId(checkpointId);
            } while (checkpointId !== MissionTemplate.LastCheckpointId);
            this._radarNodes.forEach(radarNode => radarNode.create());
            if (this._useTimer) {
                this._radarTimer = new Timer();
                this._radarTimer.reset(this._timeLimit);
            }
        };

        MissionTemplate.Draw = () => {
            if (this._useTimer) {
                if (0 >= this._radarTimer.millisecondsLeft) {
                    this._removeAll(true, "BB_17");
                    return;
                }
                Screen.DisplayTimeLeft(this._radarTimer);
            }
            for (let i = 0; i < MissionTemplate.NodesCount; ++i) {
                const radar = this._radarNodes[i];
                if (radar.isPassed)
                    continue;
                if (MissionTemplate.PlayerRacerCar.locate3D(radar.x, radar.y, radar.z, 12.0, 12.0, 12.0, false)) {
                    /*&& this._playerCar.isOnAllWheels()*/
                    Audio.ReportMissionAudioEventAtPosition(0.0, 0.0, 0.0, 1132);
                    radar.isPassed = true;
                    radar.remove();
                    this._passedRadarsCount += 1;
                    this._playerSpeed += MissionTemplate.PlayerRacerCar.getSpeed();
                    Text.PrintWith2NumbersNow("SN_ONE", this._passedRadarsCount, MissionTemplate.NodesCount, 5000, 1);
                }
            }
            Screen.DisplayCounter(this._playerSpeed, 1, "KICK1_9");
            Screen.DisplayCounter(this._neededSpeed, 2, "ST1_7");
            Screen.DisplayCounter(MissionTemplate.PlayerRacerCar.getSpeed(), 4);
            if (this._passedRadarsCount === MissionTemplate.NodesCount)
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
            MissionTemplate.LapsCount = count;
    }



    public onInitEvent(): void {
        super.onInitEvent();

        this._onRacerSetupEvent = this.onRacerSetupEvent;
        this._onBegin = MissionTemplate.Begin;

        this.onRacerSetupEvent = () => {
            MissionTemplate.LapsCount = 1;
            this._checkpointTimer = new Timer();
            this.__disableSetup = false;
            this._onRacerSetupEvent();
            this.__disableSetup = true;
            MissionTemplate.IsChallenge = true;
            MissionTemplate.CheckpointTune = 1132;
        };

        MissionTemplate.onRacerLapPassedEvent = (racer: Racer, lastLap: int) => {
            if (MissionTemplate.LapsCount > lastLap)
                return;
            if (racer.isPlayer)
                this.complete();
        }

        MissionTemplate.onRacerRouteNodePassedEvent = (racer: Racer, lastNode: RouteNode) => {
            if (racer.isPlayer && lastNode.isCheckpoint) {
                const nextCheckpointId = MissionTemplate.FindNextCheckpointId(lastNode.checkpointId);
                const nextRouteNode = MissionTemplate.Route[nextCheckpointId];
                this._checkpointTimer.addMilliseconds(nextRouteNode.timeLimitMs);
                Text.PrintWithNumberNow("A_TIME", Math.floor((nextRouteNode.timeLimitMs / 1000) % 60), 5000, 1); // +seconds
            }
            if (!racer.isPlayer || MissionTemplate.LapsCount > (racer.currentLap + 1))
                return;
            if (MissionTemplate.LastCheckpointId === MissionTemplate.FindNextCheckpointId(lastNode.checkpointId))
                MissionTemplate.LastCheckpointForPlayer = true;
        };


        MissionTemplate.Begin = () => {
            this._onBegin();
            const nextCheckpointId = MissionTemplate.FindNextCheckpointId(-1);
            const nextRouteNode = MissionTemplate.Route[nextCheckpointId];
            this._checkpointTimer.reset(nextRouteNode.timeLimitMs);
        };

        MissionTemplate.Draw = () => {
            if (MissionTemplate.LapsCount > 1)
                Screen.DisplayCounterWith2Numbers(MissionTemplate.PlayerRacer.currentLap + 1, MissionTemplate.LapsCount, 1, "RACES32");
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
        MissionTemplate.StartWantedGxt = gxtKey;
    }

    /** Sets the message displayed when the wanted level is lost. */
    public set lostWantedMessage(gxtKey: string) {
        MissionTemplate.LostWantedGxt = gxtKey;
    }

    /** Sets the message about the need to clear the wanted level. */
    public set clearWantedMessage(gxtKey: string) {
        MissionTemplate.ClearWantedGxt = gxtKey;
    }

    /** Sets the minimum time the police wanted level must be maintained. */
    public set timeMinimum(timeInMilliseconds: int) {
        this._timeMinimum = timeInMilliseconds;
    }

    /** Makes it mandatory to avoid the police to complete the mission. */
    public set setMandatoryToAvoidPolice(state: boolean) {
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
            MissionTemplate.IsChallenge = true;
            MissionTemplate.IsWantedChallenge = true;
            MissionTemplate.SpawnCops = true;
        };

        MissionTemplate.Draw = () => {
            switch (this._chaseStage) {
                case 0:
                    this._chaseTimer.reset(this._timeMinimum);
                    if (1 > MissionTemplate.MinWantedLevel)
                        MissionTemplate.MinWantedLevel = 1;
                    this.player.alterWantedLevel(MissionTemplate.MinWantedLevel);
                    if (MissionTemplate.StartWantedGxt.length > 0) {
                        this.printText(MissionTemplate.StartWantedGxt, 6000);
                    } else {
                        this.printText("GYM1_6" + MissionTemplate.MinWantedLevel.toString(), 5000);
                    }
                    this._chaseStage = 1;
                    break;
                case 1:
                    if (MissionTemplate.MinWantedLevel > this.player.storeWantedLevel())
                        this.fail(MissionTemplate.LostWantedGxt, 5000);
                    Screen.DisplayTimeLeft(this._chaseTimer);
                    if (this._chaseTimer.millisecondsLeft > 1)
                        break;
                    if (this._mandatoryToAvoidPolice) {
                        if (1 > MissionTemplate.ClearWantedGxt.length) {
                            Text.LoadMissionText("RYDER3");
                            MissionTemplate.ClearWantedGxt = "RYD3_I";
                        }
                        this.printText(MissionTemplate.ClearWantedGxt, 6000);
                        this._chaseStage = 2;
                    } else {
                        this._chaseStage = 3;
                    }
                    break;
                case 2:
                    if (this.player.storeWantedLevel() === 0) {
                        Text.LoadMissionText("RACETOR");
                        this._chaseStage = 3;
                    }
                    break;
                case 3:
                    this.player.clearWantedLevel();
                    this.complete();
                    break;
            }
        };

    }

}