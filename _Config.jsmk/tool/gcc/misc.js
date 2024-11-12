/* global jsmk */
let ToolCli = jsmk.Require("tool_cli.js").Tool;

// YACC converts .y to .c,.h files
class YACC extends ToolCli
{
    constructor(ts)
    {
        let exefile = "bison";
        let arg0 = jsmk.path.resolveExeFile(exefile, 
                                            ts.BuildVars.MINGW_TOOLCHAIN ? ts.BuildVars.MINGW_TOOLCHAIN : ts.BuildVars.LINUX_TOOLCHAIN);
        let name = ts.BuildVars.MINGW_TOOLCHAIN ? "mingw" : "linux";
        if(!arg0) throw new Error("Can't resolve "+name+" bison executable");
        super(ts, name+"/yacc", {
            Role:  ToolCli.Role.Compile,
            ActionStage: "build",
            Semantics: ToolCli.Semantics.ManyToMany,
            DstExt: "tab.c", // produce c and h file
            Invocation: [arg0, "-dv -b ${DSTFILENOEXT} ${SRCFILE}"],
            OutputNaming: "concise"
        });
    }
}

// LEX converts .lex to .yy.c files
class LEX extends ToolCli
{
    constructor(ts)
    {
        let exefile = "flex";
        let arg0 = jsmk.path.resolveExeFile(exefile, 
                                            ts.BuildVars.MINGW_TOOLCHAIN ? ts.BuildVars.MINGW_TOOLCHAIN : ts.BuildVars.LINUX_TOOLCHAIN);
        let name = ts.BuildVars.MINGW_TOOLCHAIN ? "mingw" : "linux";
        if(!arg0) throw new Error("Can't resolve "+name+" bison executable");
        super(ts, name+"/lex", {
            Role:  ToolCli.Role.Compile,
            ActionStage: "build",
            Semantics: ToolCli.Semantics.ManyToMany,
            DstExt: "yy.c",
            Invocation: [arg0, "-o${DSTFILE} ${SRCFILE}"],
            OutputNaming: "concise"
        });
    }
}

class AR extends ToolCli
{
    constructor(ts)
    {
        let exefile = "ar";
        let arg0 = jsmk.path.resolveExeFile(exefile, 
                                            ts.BuildVars.MINGW_TOOLCHAIN ? ts.BuildVars.MINGW_TOOLCHAIN : ts.BuildVars.LINUX_TOOLCHAIN);
        let name = ts.BuildVars.MINGW_TOOLCHAIN ? "mingw" : "linux";
        if(!arg0) throw new Error("Can't resolve "+name+" AR executable");
        super(ts, name+"/ar", {
            Role:  ToolCli.Role.Archive,
            ActionStage: "build",
            Semantics: ToolCli.Semantics.ManyToOne,
            DstExt: "a",
            Invocation: [arg0, "cr ${DSTFILE} ${SRCFILES}"]
        });
    }
}


exports.AR = AR;
exports.YACC = YACC;
exports.LEX = LEX;
