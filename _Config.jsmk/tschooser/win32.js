/* global jsmk */
// toolset/win32.js:
//      - common windows-specific toolsets
exports.GetToolsets = function()
{
    let arduino = jsmk.LoadConfig("toolset/arduino.js").Toolset;
    let teensy = jsmk.LoadConfig("toolset/teensy.js").Toolset;
    let esp8266 = jsmk.LoadConfig("toolset/esp8266.js").Toolset;
    //let vs17 = jsmk.LoadConfig("toolset/vs17.js").Toolset;
    let vs22 = jsmk.LoadConfig("toolset/vs22.js").Toolset;
    let clang = jsmk.LoadConfig("toolset/clang.js").Toolset;
    let mingw = jsmk.LoadConfig("toolset/mingw.js").Toolset;

    let result = [];
	let results = [];

    results.push([teensy, "teensyLC"]);
    results.push([teensy, "teensy40"]);
    results.push([teensy, "teensy40_oc"]);
    for(let r=0;r<results.length;r++)
    {
    try
    {
        result.push(new (results[r][0])(results[r][1]));
    }
    catch(err)
    {
        jsmk.DEBUG("tschooser: no teensy dev on windows " + err);
        results.splice(r, 1);
        r -= 1;
    }
    }
    if(results.length == 0)
    {
        jsmk.WARNING("tschooser: no teensy dev on windows");
    }
    results = [];

    results.push([esp8266, "robodyn"]);
    results.push([esp8266, "d1_mini"]);
    results.push([esp8266, "generic"]);
    results.push([arduino, "uno"]);
    for(let r=0;r<results.length;r++)
    {
    try
    {
        result.push(new (results[r][0])(results[r][1]));
    }
    catch(err)
    {
        jsmk.DEBUG("tschooser: no arduino dev on windows "+err);
        results.splice(r, 1);
        r -= 1;
    }
    }
    if(results.length == 0)
    {
        jsmk.WARNING("tschooser: no arduino dev on windows");
    }
    results = [];

    results.push([vs22, vs22.Arch.x86_64]);
    results.push([clang, undefined]);
    results.push([mingw, undefined]);
    for(let r=0;r<results.length;r++)
    {
    try
    {
        result.push(new (results[r][0])(results[r][1]));
    }
    catch(err)
    {
        jsmk.DEBUG("tschooser: no c++ dev on windows " + err);
        results.splice(r, 1);
        r -= 1;
    }
    }
    if(results.length == 0)
    {
        jsmk.WARNING("tschooser: no c++ dev on windows");
    }
    results = [];

    console.log(`win32 tschooser: ${result.length} toolsets.`);
    return result;
};
