/// Created by wmysterio, 26.03.2025
/// https://github.com/wmysterio/CLEO-Redux-Missions-Framework
/// <reference path=".././.config/sa.d.ts" />

/* Note: Add an empty file named "!.ts" to the "Launchers" directory */

wait(500);

let launchersDir = __dirname + "\\Launchers\\";
if (!Fs.DoesDirectoryExist(launchersDir))
    exit("Directory 'Launchers' not found!")
IniFile.WriteInt(0, __dirname + "\\Save.game", "<GAME_CONFIG>", "CallCellphone");

/*
If you want to manually specify the names of the files to be run, specify them in the array below the code.
The files must be located in the "Launchers" folder and end with the line "[fs]!.ts".
Automatic scanning and starting has some limitations, so perhaps specifying names in an array would be a better choice.
*/

launchFiles([
    // "Example",  // GTA\CLEO\*\Launchers\Example[fs]!.ts
    // "Example2", // GTA\CLEO\*\Launchers\Example2[fs]!.ts
    // "Example3", // GTA\CLEO\*\Launchers\Example3[fs]!.ts
    // "Example4"  // GTA\CLEO\*\Launchers\Example4[fs]!.ts
]);

let findFile = FindFile.First(launchersDir + "*.ts");
if (findFile === undefined)
    exit("Launchers not found");

let launcherEndFileName = "[fs]!.ts"; // max: "01234567[fs]!.ts"
let minFileNameLength = launcherEndFileName.length;
let fileCounter = 0;
let fileName = findFile.fileName;
let launchersNames = Array<string>();
do {
    //log(">>> " + fileName);
    if (fileName !== undefined) {
        let fileNameLength = fileName.length;
        if (fileNameLength > minFileNameLength && fileName.endsWith(launcherEndFileName))
            launchersNames.push(fileName.substring(0, fileNameLength - minFileNameLength));
    }
    fileCounter += 1;
    if (fileCounter > 20) {
        fileCounter = 0;
        wait(0);
    }
    fileName = findFile.handle.next();
} while (fileName !== undefined);
findFile.handle.close();
launchFiles(launchersNames);

function launchFiles(names: string[]): void {
    if (names === undefined || names.length === 0)
        return;
    names.forEach(launcherName => {
        let fileName = launchersDir + launcherName + launcherEndFileName;
        if (Fs.DoesFileExist(fileName)) {
            CLEO.runScript(launchersDir + launcherName + launcherEndFileName, {
                __LauncherNameInternal__: launcherName
            });
        }
    });
    exit();
}