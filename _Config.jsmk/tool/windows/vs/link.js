/* global jsmk */
let ToolCli = jsmk.Require("tool_cli.js").Tool;
let Arch = jsmk.Require("toolset.js").Arch;

exports.Link = class Link extends ToolCli
{
    // reminder:
    //  our settings are merged with each task during task creation
    //  this differs from the just-in-time configure opportunity
    //  that occurs prior to work generation.
    constructor(ts, vsvers, dll)
    {
        let exefile = "link";
        let arg0 = jsmk.path.resolveExeFile(exefile, ts.BuildVars.VSToolsDir);
        if(!arg0) throw new Error("Can't resolve link "+
                                    ts.BuildVars.VSToolsDir);
        super(ts, `vs${vsvers}/link`, {
            Role:  dll ? ToolCli.Role.ArchiveDynamic : ToolCli.Role.Link,
            ActionStage: "build",
            Semantics: ToolCli.Semantics.ManyToOne,
            DstExt: dll ? "dll" : "exe",
            Invocation: [arg0, "-out:${DSTFILE} ${SRCFILES} ${FLAGS} "+
                               "${SEARCHPATHS} ${LIBS}"],
            Syntax:
            {
                Flag: "${VAL}",
                Lib: "${VAL}",
                Searchpath: "/LIBPATH:${VAL}",
            },
        });

        let machine;
        switch(ts.TargetArch)
        {
        case Arch.x86_32:
            machine="/MACHINE:X86";
            break;
        case Arch.x86_64:
            machine="/MACHINE:X64";
            break;
        case Arch.arm_32:
            machine="/MACHINE:ARM";
            break;
        case Arch.arm_64:
            machine="/MACHINE:ARM64";
            break;
        default:
            throw new Error("Link: unknown arch " + ts.TargetArch);
        }

        this.AddFlags([
            "/NOLOGO",
            "/INCREMENTAL:NO",
            "/DYNAMICBASE",
            "/MANIFEST",
            "/NXCOMPAT",
            "/TLBID:1",
            "/DEBUG",
            "/OPT:ICF",
            "/ERRORREPORT:PROMPT",
            machine
        ]);

        if(dll)
        {
            this.AddFlags([
                "-dll", // XXX:  need to ensure console is dynamic
            ]);
        }

        // minimum set of libs required to successfully link...add'l
        // syslibs are provided by module/task (framework).
        this.AddLibs([
            // "/nodefaultlib",
            //"oldnames.lib",
            //"imm32.lib",
            //"iphlpapi.lib", 
            //"mswsock.lib",
            //"netapi32.lib", 
            //"mpr.lib", 
            "gdi32.lib",
            //"wsock32.lib",
            //"ws2_32.lib",
            //"winmm.lib",
            //"kernel32.lib",
            "user32.lib",
            //"winspool.lib",
            //"commode.obj",
            //"comctl32.lib", 
            "comdlg32.lib",
            //"advapi32.lib",
            //"shell32.lib",
            //"ole32.lib",
            //"oleaut32.lib",
            //"uuid.lib",
            //"odbc32.lib",
            //"odbccp32.lib"
        ]);

    }

    ConfigureTaskSettings(task)
    {
        // jsmk.INFO(`vslink ${this.m_name} configure task: ${task.GetName()}`);
        super.ConfigureTaskSettings(task)        ;
        switch(task.BuildVars.Deployment)
        {
        case "debug":
            task.AddFlags([
                "/debug",
            ]);
            break;
        case "release":
            task.AddFlags([

            ]);
            break;
        }
    }
};
    /* vs2017 link example:
        /OUT:"..\..\win64_vs2017\bin\examplesDebug.exe" 
        /MANIFEST 
        /NXCOMPAT 
        /PDB:"..\..\win64_vs2017\bin\examplesDebug.pdb" 
        /DYNAMICBASE 
        "DelayImp.lib" "gdi32.lib" "psapi.lib" 
        "kernel32.lib" "user32.lib" "winspool.lib" 
        "comdlg32.lib" "advapi32.lib" "shell32.lib" 
        "ole32.lib" "oleaut32.lib" "uuid.lib" "odbc32.lib" 
        "odbccp32.lib" 
        "E:\dana\src\dbadbapp\nih\bgfx\bgfx\.build\win64_vs2017\bin\example-commonDebug.lib" 
        "E:\dana\src\dbadbapp\nih\bgfx\bgfx\.build\win64_vs2017\bin\example-glueDebug.lib" 
        "E:\dana\src\dbadbapp\nih\bgfx\bgfx\.build\win64_vs2017\bin\bgfxDebug.lib" 
        "E:\dana\src\dbadbapp\nih\bgfx\bgfx\.build\win64_vs2017\bin\bimg_decodeDebug.lib" 
        "E:\dana\src\dbadbapp\nih\bgfx\bgfx\.build\win64_vs2017\bin\bimgDebug.lib" 
        "E:\dana\src\dbadbapp\nih\bgfx\bgfx\.build\win64_vs2017\bin\bxDebug.lib" 
        /DEBUG 
        /MACHINE:X64 
        /ENTRY:"mainCRTStartup" 
        /INCREMENTAL 
        /PGD:"..\..\win64_vs2017\bin\examplesDebug.pgd" 
        /SUBSYSTEM:WINDOWS 
        /MANIFESTUAC:"level='asInvoker' uiAccess='false'" 
        /ManifestFile:"e:\dana\src\bgfx\nih\bgfx\bgfx\.build\projects\vs2017\..\..\win64_vs2017\obj\x64\Debug\examples\examplesDebug.exe.intermediate.manifest" 
        /ERRORREPORT:PROMPT 
        /NOLOGO 
        /LIBPATH:"..\..\..\3rdparty\lib\win64_vs2017" 
        /TLBID:1 
    */

    /* https://docs.microsoft.com/en-us/cpp/build/reference/linker-options
    usage: LINK [options] [files] [@commandfile]
    options:

      /ALIGN:#
      /ALLOWBIND[:NO]
      /ALLOWISOLATION[:NO]
      /APPCONTAINER[:NO]
      /ASSEMBLYDEBUG[:DISABLE]
      /ASSEMBLYLINKRESOURCE:filename
      /ASSEMBLYMODULE:filename
      /ASSEMBLYRESOURCE:filename[,[name][,PRIVATE]]
      /BASE:{address[,size]|@filename,key}
      /CLRIMAGETYPE:{IJW|PURE|SAFE|SAFE32BITPREFERRED}
      /CLRLOADEROPTIMIZATION:{MD|MDH|NONE|SD}
      /CLRSUPPORTLASTERROR[:{NO|SYSTEMDLL}]
      /CLRTHREADATTRIBUTE:{MTA|NONE|STA}
      /CLRUNMANAGEDCODECHECK[:NO]
      /DEBUG[:{FASTLINK|FULL|NONE}]
      /DEF:filename
      /DEFAULTLIB:library
      /DELAY:{NOBIND|UNLOAD}
      /DELAYLOAD:dll
      /DELAYSIGN[:NO]
      /DLL
      /DRIVER[:{UPONLY|WDM}]
      /DYNAMICBASE[:NO]
      /ENTRY:symbol
      /ERRORREPORT:{NONE|PROMPT|QUEUE|SEND}
      /EXPORT:symbol
      /EXPORTPADMIN[:size]
      /FASTGENPROFILE[:{COUNTER32|COUNTER64|EXACT|MEMMAX=#|MEMMIN=#|NOEXACT|
                        NOPATH|NOTRACKEH|PATH|PGD=filename|TRACKEH}]
      /FIXED[:NO]
      /FORCE[:{MULTIPLE|UNRESOLVED}]
      /FUNCTIONPADMIN[:size]
      /GUARD:{CF|NO}
      /GENPROFILE[:{COUNTER32|COUNTER64|EXACT|MEMMAX=#|MEMMIN=#|NOEXACT|
                    NOPATH|NOTRACKEH|PATH|PGD=filename|TRACKEH}]
      /HEAP:reserve[,commit]
      /HIGHENTROPYVA[:NO]
      /IDLOUT:filename
      /IGNORE:#
      /IGNOREIDL
      /IMPLIB:filename
      /INCLUDE:symbol
      /INCREMENTAL[:NO]
      /INTEGRITYCHECK
      /KERNEL
      /KEYCONTAINER:name
      /KEYFILE:filename
      /LARGEADDRESSAWARE[:NO]
      /LIBPATH:dir
      /LTCG[:{INCREMENTAL|NOSTATUS|OFF|STATUS|}]
      /MACHINE:{ARM|ARM64|EBC|X64|X86}
      /MANIFEST[:{EMBED[,ID=#]|NO}]
      /MANIFESTDEPENDENCY:manifest dependency
      /MANIFESTFILE:filename
      /MANIFESTINPUT:filename
      /MANIFESTUAC[:{NO|UAC fragment}]
      /MAP[:filename]
      /MAPINFO:{EXPORTS}
      /MERGE:from=to
      /MIDL:@commandfile
      /NOASSEMBLY
      /NODEFAULTLIB[:library]
      /NOENTRY
      /NOIMPLIB
      /NOLOGO
      /NXCOMPAT[:NO]
      /OPT:{ICF[=iterations]|LBR|NOICF|NOLBR|NOREF|REF}
      /ORDER:@filename
      /OUT:filename
      /PDB:filename
      /PDBSTRIPPED:filename
      /PROFILE
      /RELEASE
      /SAFESEH[:NO]
      /SECTION:name,[[!]{DEKPRSW}][,ALIGN=#]
      /STACK:reserve[,commit]
      /STUB:filename
      /SUBSYSTEM:{BOOT_APPLICATION|CONSOLE|EFI_APPLICATION|
                  EFI_BOOT_SERVICE_DRIVER|EFI_ROM|EFI_RUNTIME_DRIVER|
                  NATIVE|POSIX|WINDOWS|WINDOWSCE}[,#[.##]]
      /SWAPRUN:{CD|NET}
      /TLBID:#
      /TLBOUT:filename
      /TIME
      /TSAWARE[:NO]
      /USEPROFILE[:{AGGRESSIVE|PGD=filename}]
      /VERBOSE[:{CLR|ICF|INCR|LIB|REF|SAFESEH|UNUSEDLIBS}]
      /VERSION:#[.#]
      /WINMD[:{NO|ONLY}]
      /WINMDDELAYSIGN[:NO]
      /WINMDFILE:filename
      /WINMDKEYCONTAINER:name
      /WINMDKEYFILE:filename
      /WHOLEARCHIVE[:library]
      /WX[:NO]
*/
