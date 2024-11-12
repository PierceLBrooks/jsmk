/* global jsmk */
let ToolCli = jsmk.Require("tool_cli.js").Tool;

class Link extends ToolCli
{
    constructor(ts, buildso=false)
    {
        let exefile = "g++";
        let arg0 = jsmk.path.resolveExeFile(exefile, 
                                ts.BuildVars.MINGW_TOOLCHAIN ? ts.BuildVars.MINGW_TOOLCHAIN : ts.BuildVars.LINUX_TOOLCHAIN);
        let name = ts.BuildVars.MINGW_TOOLCHAIN ? "mingw" : "linux";
        super(ts, name+"/link",
            {
                Role: ToolCli.Role.Link,
                Semantics: ToolCli.Semantics.ManyToOne,
                DstExt: ts.BuildVars.MINGW_TOOLCHAIN ? (buildso ? "dll" : "exe") : (buildso ? "so" : ""),
                ActionStage: "build",
                Invocation: [arg0, 
                    "-o ${DSTFILE} ${SRCFILES} ${FLAGS}"+ (ts.BuildVars.MINGW_TOOLCHAIN ? " ${DEPS}" : "") + " ${LIBS}" + (buildso ? " -shared" : "")],
                Syntax:
                {
                    Flag: "${VAL}",
                    Lib: (ts.BuildVars.MINGW_TOOLCHAIN ? "-l" : "") + "${VAL}", // syslibs are treated like flags, so no -l here outside of MinGW.
                    Deps: (ts.BuildVars.MINGW_TOOLCHAIN ? "" : "${VAL}"), // syslibs are treated like flags, so no -l here outside of MinGW.
                },
            }
        );
    }

    ConfigureTaskSettings(task)
    {
        super.ConfigureTaskSettings(task);
    }
}  // end of link

exports.Link = Link;
