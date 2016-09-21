"use strict";
var cache = {};

function getFileLines(file, callback) {
    /*if (cache[file]) {
        callback(null, cache[file]);
        return;
    }*/
    d3.text("/src/" + file, function(error, text) {
        if (error) {
            callback(error);
            return;
        }
        var lines = text.split(/\r?\n/); //.match(/[^\r\n]+/g);
        // cache[file] = lines;
        callback(null, lines);
    });
}

function showStateHistory(state, mallocs) {
    mallocs.sort((a,b) => a.i - b.i);

    showChart("#heap-chart", mallocs, 500, 500, margin, function(m) {
        renderStackFrame("#mallocs", m);
    });

    if (!state.stack) {
        renderStackFrame("#call-stack", state); // show the termination point
    } else {
        state.stack.forEach(sf => {
            renderStackFrame("#call-stack", sf);
        });
    }
    if (state.errors) {
        state.errors.forEach(sf => {
            renderStackFrame("#memory-errors", sf);
        });
    }
}

function renderStackFrame(selector, sf) {
    var remove = document.querySelectorAll(selector + " .remove");
    if (remove) {
        for (var i = 0; i < remove.length; i++)
            remove[i].parentNode.removeChild(remove[i]);
    }

    var file = sf.file.substring(sf.file.lastIndexOf('/') + 1);
    getFileLines(file, (error, lines) => {
        if (!lines || lines.length == 0) return;

        var ll = sf.line - 1; // line is 1 based
        lines[ll] = ">>> " + lines[ll] + " <<<";
        var min = Math.max(0, ll - 3);
        var max = Math.min(lines.length, ll + 3);
        var print = lines.slice(min, max);
        if (print.length == 0) return;

        var div = d3.select(selector)
            .append("div")
            .attr("class", "remove")
            .append("strong")
            .text(function() {
                var str = sf.func + " at " + sf.file + "#" + sf.line; 
                if (sf.name) str = sf.name + " " + str;
                return str;
            });

        var code = div.append("pre")
            .append('code')
            .attr("class", "cpp, remove")
            .text(function(d) {
                return print.join('\n');
            });

        //hljs.highlightBlock(code.node());
        //if (print) {render}

    });
}

var margin = {
        top: 10,
        right: 30,
        bottom: 30,
        left: 30
    },
    width = 1000 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

d3.json("run.astats", function(error, events) {
    if (error) throw error;

    var mallocs = events.filter(el => el.malloc != undefined);
    showHistogram(mallocs.map(e => e.malloc), width, height, margin);

    var states = d3.values(d3.nest()
        .key(d => d.id)
        .rollup(function(leaves) {
            var errors = leaves.filter(e => e.error).map(e => {
                return {
                    name: e.error,
                    func: e.func,
                    file: e.file.substring(e.file.lastIndexOf('/') + 1),
                    line: e.line
                }
            });

            var res = {
                id: leaves[0].id,
                parentId: leaves[0].id != 0 ? leaves[0].parentId : null,
                mallocs: leaves.filter(l => l.malloc != undefined),
                errors: errors
            }
            leaves.forEach(l => {
                if (l.terminated) {
                    res.memory = l.memory
                    res.simulatedNil = l.simulatedNil === true;
                    res.file = l.file;
                    res.line = l.line;
                    if (l.stack) res.stack = l.stack;
                }
            });
            return res;
        }).map(events)).slice(0, -12);

    var root = d3.stratify()(states);
    showTree(root, 2000, 2000, margin, showStateHistory);

    document.getElementById("searchinput").onkeyup = (e => {
        searchFuncs(e.target.value);
    });

    var stat_mallocs = 0; //Total Mallocs
    var stat_terminations_nilp = 0; //States Terminated after Null Pointer Access
    var stat_terminations_simnilp = 0; // States Terminated after Simulated Null Pointer Access
    var stat_simnilp = 0; // Simulated Null Pointers
    events.forEach(e => {
        if (e.malloc) stat_mallocs++;
        if (e.error && e.error === "nullptr") {
            stat_terminations_nilp++; // assuming a program terminates at this point
            if (e.simulatedNil)
                stat_terminations_simnilp++;
        }
        if (e.error && e.simulatedNil && e.error === "outofmemory")
            stat_simnilp++;
    });
    document.getElementById('stat-mallocs').innerHTML = stat_mallocs;
    document.getElementById('stat-terminations-nilp').innerHTML = stat_terminations_nilp;
    document.getElementById('stat-terminations-simnilp').innerHTML = stat_terminations_simnilp;
    document.getElementById('stat-simnilp').innerHTML = stat_simnilp;

    //var files = mallocs.map(m => {file:m.file, id:}).filter((f, pos, self) => self.indexOf(f) === pos);
    //var funcs = fileMallocs.map(m => m.func).filter((f, pos, self) => self.indexOf(f) === pos);



    /*
          function fileHirarchy(file) {
            var fileMallocs = mallocs.filter(m => m.file.lastIndexOf(file, 0) === 0);
            var funcs = fileMallocs.map(m => m.func).filter((f, pos, self) => self.indexOf(f) === pos);
            return funcs.map(f => ({
              name: f,
              children: fileMallocs.filter(m => m.func === f).map(m => ({
                name: m.file.substring(m.file.lastIndexOf('/')+1) + " " + m.malloc+"b",
                size: m.malloc
              }))
            }));
          }

          var files = mallocs.map(m => m.file.substring(0, m.file.lastIndexOf('#')))
                             .filter((f, pos, self) => self.indexOf(f) === pos) // O(n^2) method to get unique filenames
          root = {
            name: "Mallocs",
            children: files.map(file => ({ // functions
              name: file.substring(file.lastIndexOf('/') + 1, file.length),
              children: fileHirarchy(file)
            }))
          };
          showArc(d3.hierarchy(root), width, height * 2, margin);//;*/
});