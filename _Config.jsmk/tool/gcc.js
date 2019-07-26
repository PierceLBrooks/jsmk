/* global jsmk */
let ToolCli = jsmk.Require("tool_cli.js").Tool;

class GCC extends ToolCli
{
    constructor(ts, nm, arg0, plistOverride)
    {
        if(!nm)
            nm = "compiler/gcc";
        if(!arg0)
            arg0 = "gcc";
        let plistStr = " ${SRCFILE} -o ${DSTFILE} ${FLAGS} ${DEFINES} ${SEARCHPATHS}";
        if(plistOverride)
            plistStr = plistOverride;
        let config =
        {
            Role: ToolCli.Role.Compile,
            Semantics: ToolCli.Semantics.ManyToMany,
            DstExt: "o",
            ActionStage: "build",
            Invocation: [arg0, plistStr],
            Syntax:
            {
                Define: "-D${KEY}=${VAL}",
                DefineNoVal: "-D${KEY}",
                Searchpath: "-I${VAL}",
                Flag: "${VAL}"
            },
        };
        super(ts, nm, config);
        this.AddFlags(this.GetRole(), [
            "-MMD", // for mkdep
        ]);
    }

    ConfigureTaskSettings(task)
    {
        super.ConfigureTaskSettings(task);
        switch(task.BuildVars.Deployment)
        {
        case "debug":
            task.AddFlags(this.GetRole(), [
                "-g",
            ]);
            break;
        case "release":
            task.AddFlags(this.GetRole(), [
                "-Os", // optimize for size
            ]);
            break;
        }
    }

    outputIsDirty(output, inputs, cwd)
    {
        let dirty = super.outputIsDirty(output, inputs, cwd);
        if(!dirty)
        {
            // also look for MMD output to see if any dependencies have changed

            let depfileTxt = jsmk.file.read(jsmk.file.changeExtension(output, "d"));
            if(depfileTxt)
            {
                let pat = /(?:[^\s]+\\ [^\s]+|[^\s]+)+/g;
                // pat looks for filenames, potentially with embedded spaces.
                // This also selects for line-continuation "\\" so we need
                // to filter that.
                // First line is the dependent file, so we slice it off.
                let files = depfileTxt.match(pat).filter((value)=>{
                    if(value[value.length-1] == ":")
                        return false;
                    else
                        return (value.length > 1);
                }).map((value)=>{
                    // Program\ Files -> Program Files
                    return value.replace(/\\ /g, " ");
                });
                return super.outputIsDirty(output, files, cwd);
            }
        }
        return dirty;
    }
}

class GPP extends GCC
{
    constructor(toolset)
    {
        super(toolset, "g++", "g++");
    }
}

exports.GCC = GCC;
exports.GPP = GPP;
