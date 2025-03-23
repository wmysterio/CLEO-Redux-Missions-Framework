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
    if( fileName.startsWith( "Starter", 0 ) )
        CLEO.runScript( dir + fileName + ".ts" );
    fileName = findFileHandle.next();
} while( fileName !== undefined );

findFileHandle.close();