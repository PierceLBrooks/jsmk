/*global jsmk */
// NB: this is a work-in-progress. Tabled in favor of clang
//   backed by a vs22 install.  Currently (12/22) the Visual 
//   Studio IDE crashes on urchin. (!!)
var Foundation = require("./foundation.js").Foundation;

const sdkVers = "10.0.22000.0";
const vcVers = "14.34.31933";
const vsDir = "C:/Program Files/Microsoft Visual Studio/2022/Community/";
const sdkRoot = "C:/Program Files (x86)/Windows Kits";
const msvcDir = `${vsDir}/VC/Tools/MSVC/${vcVers}`;

const Config = {};
Config[Foundation.Arch.x86_64] = getConfig("x64");
Config[Foundation.Arch.x86_32] = getConfig("x32");
Config.x64 = getConfig("x64"); // toolset.Arch more precise than Host.Arch
Config.x32 = getConfig("x32");

function getConfig(arch)
{
    let c = {
        msvcLibDir : `${msvcDir}/Lib/${arch}`, // delayimp.lib
        msvcIncDir : `${msvcDir}/include`, // std library headers
        sdkBinDir : `${sdkRoot}/10/bin/${sdkVers}/${arch}`,
        sdkIncUmDir : `${sdkRoot}/10/Include/${sdkVers}/um`, // windows.h
        sdkIncSharedDir : `${sdkRoot}/10/Include/${sdkVers}/shared`, // winapifamily.h
        sdkIncCrtDir : `${sdkRoot}/10/Include/${sdkVers}/ucrt`,
        sdkLibUmDir : `${sdkRoot}/10/Lib/${sdkVers}/um/${arch}`, // dsound.lib
        sdkLibCrtDir : `${sdkRoot}/10/Lib/${sdkVers}/ucrt/${arch}`,
    }
    // toolsDir is where cl, link, lib, etc are (including llvm fwiw)
    // here x64 refers to build-host
    c.toolsDir = jsmk.path.join(msvcDir, "bin/Hostx64", arch);
    // ideDir is places where IDE runtimes (dll are found 
    // (offref, VsRegistryDetour) (usefulness ?)
    c.ideDir = jsmk.path.join(vsDir, "Common7/IDE", arch);
    c.INCLUDE = `${c.msvcIncDir};${c.sdkIncUmDir};${c.sdkIncSharedDir};${c.sdkIncCrtDir};`;
    c.LIB = `${c.msvcLibDir};${c.sdkLibUmDir};${c.sdkLibCrtDir}`;
    return c;
}

exports.Config = Config;

exports.Toolset = class vs22 extends Foundation
{
    constructor(arch)
    {
        super(__filename, "vs22", arch);

        // sdkToolsDir is location for, eg rc.exe and other tools
        var map = {};
        map.BuildVars =
        {
            VSRootDir: vsDir,
            VSSDKDir: sdkRoot, // unused ?
            VSToolsDir: Config[arch].toolsDir,
            VSIDEDir: Config[arch].ideDir,
            VSSDKToolsDir: Config[arch].sdkBinDir, // eg: rc.exe
        };
        map.EnvMap =
        {
            INCLUDE: Config[arch].INCLUDE,
            LIB: Config[arch].LIB,
            // XXX: add 32bit
        };

        this.MergeSettings(map);

        let vers = "22";
        let dir = "tool/windows/vs/";
        let ccmod = jsmk.LoadConfig(dir+"cc.js");
        let CC = new ccmod.CC(this, vers);
        let CPP = new ccmod.CPP(this, vers);
        let Link = jsmk.LoadConfig(dir+"link.js").Link;
        let dlltool = new Link(this, vers, true);
        this.MergeToolMap({
            "c->o":    CC,
            "cpp->o":  CPP,
            "o->a":    new (jsmk.LoadConfig(dir+"ar.js").AR)(this, vers),
            "o->so": dlltool,
            "o->dll": dlltool,
            "c.o->exe": new Link(this, vers),
            "cpp.o->exe": new Link(this, vers),
            "cpp.o->so": dlltool,
            "cpp.o->dll": dlltool,
            "rc->o": new (jsmk.LoadConfig(dir+"rc.js").RC)(this, vers),
        });

        jsmk.DEBUG(this.ToolsetHandle + " toolset loaded");
    }
};

