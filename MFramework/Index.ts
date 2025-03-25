/// <reference path=".././.config/sa.d.ts" />

// FindFile.First 'fileName' is 'undefined', empty string, or have trash string (aka 'p{]\u{16}'). WTF?
// Temp solution: add empty '.ts' file in 'Missions' dir.

let missionsDir = __dirname + "\\Missions\\";
if( !Fs.DoesDirectoryExist( missionsDir ) )
    exit( "Missions not found" )

let findFile = FindFile.First(  missionsDir + "*.ts" );
if( findFile === undefined )
    exit( "Launchers not found" );

let launcherEndFileName = "[fs]!.ts"; // max: "01234567[fs]!.ts"
let missionEndFileName = "[fs].ts";
let minFileNameLength = launcherEndFileName.length;

let fileCounter = 0;  
while( true ) {
    fileCounter += 1;
    if( fileCounter > 20 ) {
        fileCounter = 0; 
        wait( 0 );
        continue;
    }
    let fileName = findFile.handle.next();
    if( fileName === undefined )
        break;
    let fileNameLength = fileName.length;
    if( fileNameLength > minFileNameLength && fileName.endsWith( launcherEndFileName ) ) {
        let missionMame = fileName.substring( 0, fileNameLength - minFileNameLength );
        let missionFilePath = missionsDir + missionMame + missionEndFileName;
        if( Fs.DoesFileExist( missionFilePath ) ) {
            let launcherFilePath = missionsDir + missionMame + launcherEndFileName;
            CLEO.runScript( launcherFilePath, {
                __MissionMameInternal__: missionMame,
                __MissionFilePathInternal__: missionFilePath,
                __LauncherFilePathInternal__: launcherFilePath
            } ); 
        }
    }
}

findFile.handle.close();