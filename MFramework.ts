/// <reference path="./.config/sa.d.ts" />

let dir = __dirname + "\\MFramework\\";
if( !Fs.DoesDirectoryExist( dir ) )
    exit( "'MFramework' directory not found" )

Fs.SetCurrentDirectory( +dir );
let findFile = FindFile.First( dir + "*.ts" );
if( findFile === undefined )
    exit( "Starters not found" );

let findFileHandle = findFile.handle;
let fileName = findFile.fileName;
let fileCounter = 0;
do {
    ++fileCounter;
    if( fileCounter > 20 ) {
        fileCounter = 0;
        wait( 0 );
    }
    let fileNameLength = fileName.length;
    if( fileName.endsWith( "Starter" ) && fileNameLength > 7 && !fileName.match( "^[\d ]+" ) ) {
        let missionName = fileName.substring( 0, fileNameLength - 7 );
        let missionFilePath = dir + missionName + ".ts";
        let starterFilePath = dir + fileName + ".ts";
        if( Fs.DoesFileExist( missionFilePath ) ) 
            CLEO.runScript( starterFilePath, { _missionFilePathInternal : missionFilePath, _starterFilePathInternal: starterFilePath } );
    }
    fileName = findFileHandle.next();
} while( fileName !== undefined );

findFileHandle.close();