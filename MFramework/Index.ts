/// Created by wmysterio, 26.03.2025
/// https://github.com/wmysterio/CLEO-Redux-Missions-Framework
/// <reference path=".././.config/sa.d.ts" />

/*
In "FindFile.First" the variable 'fileName' has a string value of 'undefined',
empty, or contains garbage (e.g. 'p{]\u{16}', ' ؎z\u{15}'...). WTF?
Workaround: Add an empty file named "!.ts" to the "Missions" directory.
*/

wait(500);
let missionsDir = __dirname + "\\Missions\\";
if (!Fs.DoesDirectoryExist(missionsDir))
    exit("Directory 'Missions' not found!")

let findFile = FindFile.First(missionsDir + "*.ts");
if (findFile === undefined)
    exit("Launchers not found");

let launcherEndFileName = "[fs]!.ts"; // max: "01234567[fs]!.ts"
let minFileNameLength = launcherEndFileName.length;
let fileCounter = 0;
let fileName = findFile.fileName;

do {
    //log(">>> " + fileName);
    if (fileName !== undefined) {
        let fileNameLength = fileName.length;
        if (fileNameLength > minFileNameLength && fileName.endsWith(launcherEndFileName)) {
            let missionMame = fileName.substring(0, fileNameLength - minFileNameLength);
            let launcherFilePath = missionsDir + missionMame + launcherEndFileName;
            CLEO.runScript(launcherFilePath, { __MissionMameInternal__: missionMame });
        }
    }
    fileCounter += 1;
    if (fileCounter > 20) {
        fileCounter = 0;
        wait(0);
    }
    fileName = findFile.handle.next();
} while (fileName !== undefined);
findFile.handle.close();