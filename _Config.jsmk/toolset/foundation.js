/* global jsmk */
// toolset/foundation.js:
//      - establishes cross-toolset behavior for a wide range of "rules"
//      - since we're not a concrete toolset, we don't export GetToolsets
//

let Toolset = jsmk.Require("toolset.js").Toolset;
let CopyFiles = jsmk.LoadConfig("tool/copyfiles.js").CopyFiles;
let Printenv = jsmk.LoadConfig("tool/printenv.js").Printenv;

class Foundation extends Toolset
{
    constructor(filename, tsname, arch, platform)
    {
        super(filename, tsname, arch, platform);

        // no settings in foundation?

        this.MergeToolMap( {
            copyfiles:  new CopyFiles(this, "<novers>", {
                            ActionStage: "build"
                        }),
            install:    new CopyFiles(this, "<novers>", {
                            ActionStage: "install"
                        }),
            printenv: new Printenv(this),

            // for javascript development -------------------
            ".js->.js.min": null, // aka uglify

            // for Android ----------------------------------

            // for iPhone -----------------------------------

            // for cpp dev (platform+toolset specific) ------
            "c->o":     undefined,
            "c->a":     undefined,
            "c.o->exe": undefined,
            "cpp->o":   undefined,
            "cpp->a":   undefined,
            "cpp.o->exe": undefined,
            "link":     undefined,

            // shader development ---------------------------
            "osl->oso": undefined, // "oslcompiler"
            "sl->slo": undefined   // "rslcompiler"
        } );
    }
};

exports.Foundation = Foundation;
