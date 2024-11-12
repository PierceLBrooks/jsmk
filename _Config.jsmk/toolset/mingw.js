/* global jsmk */
var Foundation = require("./foundation.js").Foundation;

class Mingw extends Foundation
{
     constructor(opts)
     {
        if(!opts)
            opts = {};
        if(!opts.arch)
            opts.arch = jsmk.GetHost().Arch;
        if(!opts.vers)
            opts.vers = "";

        super(__filename, "mingw", opts.arch);

        let map = {};
		let mingw = jsmk.path.resolveExeFile("mingw32-make", this.GetEnv("PATH"))
        map.BuildVars = {
            MINGW_TOOLCHAIN: (mingw ? jsmk.path.dirname(mingw) : undefined)
        };
        this.MergeSettings(map);

        let cc = jsmk.LoadConfig("tool/gcc/cc.js");
        let link = jsmk.LoadConfig("tool/gcc/link.js");
        let misc = jsmk.LoadConfig("tool/gcc/misc.js");

        this.MergeToolMap(
            {
                "cpp->o": new cc.CPP(this),
                "c->o": new cc.CC(this),
                "cpp.o->so": new link.Link(this, true/*buildso*/),
                "cpp.o->exe": new link.Link(this),
                "o->a": new misc.AR(this),
            }
        );
        jsmk.DEBUG("mingw toolset loaded");
    } // end constructor
}

exports.Toolset = Mingw;
