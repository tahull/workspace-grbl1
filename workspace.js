/* global cpdefine chilipeppr cprequire $ cprequire_test */
cprequire_test(["inline:com-chilipeppr-workspace-grbl"], function(ws) {

    console.log("initting workspace");

    /**
     * The Root workspace (when you see the ChiliPeppr Header) auto Loads the Flash 
     * Widget so we can show the 3 second flash messages. However, in test mode we
     * like to see them as well, so just load it from the cprequire_test() method
     * so we have similar functionality when testing this workspace.
     */
    var loadFlashMsg = function() {
        chilipeppr.load("#com-chilipeppr-widget-flash-instance",
            "http://fiddle.jshell.net/chilipeppr/90698kax/show/light/",
            function() {
                console.log("mycallback got called after loading flash msg module");
                cprequire(["inline:com-chilipeppr-elem-flashmsg"], function(fm) {
                    //console.log("inside require of " + fm.id);
                    fm.init();
                });
            }
        );
    };
    loadFlashMsg();

    // Init workspace
    ws.init();

    // Do some niceties for testing like margins on widget and title for browser
    $('title').html("grbl Workspace");
    $('body').css('padding', '10px');

} /*end_test*/ );

Function.prototype.clone = function() {
    var that = this;
    var temp = function temporary() {
        return that.apply(this, arguments);
    };
    for (var key in this) {
        if (this.hasOwnProperty(key)) {
            temp[key] = this[key];
        }
    }
    return temp;
};

// This is the main definition of your widget. Give it a unique name.
cpdefine("inline:com-chilipeppr-workspace-grbl", ["chilipeppr_ready"], function() {
    return {
        /**
         * The ID of the widget. You must define this and make it unique.
         */
        id: "com-chilipeppr-workspace-grbl", // Make the id the same as the cpdefine id
        name: "Workspace / grbl", // The descriptive name of your widget.
        desc: `A ChiliPeppr Workspace grbl.`,
        url: "(auto fill by runme.js)", // The final URL of the working widget as a single HTML file with CSS and Javascript inlined. You can let runme.js auto fill this if you are using Cloud9.
        fiddleurl: "(auto fill by runme.js)", // The edit URL. This can be auto-filled by runme.js in Cloud9 if you'd like, or just define it on your own to help people know where they can edit/fork your widget
        githuburl: "(auto fill by runme.js)", // The backing github repo
        testurl: "(auto fill by runme.js)", // The standalone working widget so can view it working by itself
        /**
         * Contains reference to the Console widget object. Hang onto the reference
         * so we can resize it when the window resizes because we want it to manually
         * resize to fill the height of the browser so it looks clean.
         */
        widgetConsole: null,
        /**
         * Contains reference to the Serial Port JSON Server object.
         */
        //widgetSpjs: null,
        /**
         * The workspace's init method. It loads the all the widgets contained in the workspace
         * and inits them.
         */
        init: function() {
            /*
            // Most workspaces will instantiate the Serial Port JSON Server widget
            this.loadSpjsWidget();
            // Most workspaces will instantiate the Serial Port Console widget
            this.loadConsoleWidget(function() {
                setTimeout(function() { $(window).trigger('resize'); }, 100);
            });
            */
            this.loadWidgets();

            //this.loadTemplateWidget();

            // Create our workspace upper right corner triangle menu
            this.loadWorkspaceMenu();
            // Add our billboard to the menu (has name, url, picture of workspace)
            this.addBillboardToWorkspaceMenu();

            //chilipeppr.publish('/com-chilipeppr-elem-flashmsg/flashmsg', "Recent Maintenance", "Hello!  We recently updated the GRBL workspace.  Please let us know if you have any issues.  If auto-level still does not work, please continue to use chilipeppr.com/imania. But we'd really like to hear if it does! ", 15 * 1000);

            // Setup an event to react to window resize. This helps since
            // some of our widgets have a manual resize to cleanly fill
            // the height of the browser window. You could turn this off and
            // just set widget min-height in CSS instead
            this.setupResize();
            setTimeout(function() {
                $(window).trigger('resize');
            }, 100);

        },
        /**
         * Returns the billboard HTML, CSS, and Javascript for this Workspace. The billboard
         * is used by the home page, the workspace picker, and the fork pulldown to show a
         * consistent name/image/description tag for the workspace throughout the ChiliPeppr ecosystem.
         */
        getBillboard: function() {
            var el = $('#' + this.id + '-billboard').clone();
            el.removeClass("hidden");
            el.find('.billboard-desc').text(this.desc);
            return el;
        },
        /**
         * Inject the billboard into the Workspace upper right corner pulldown which
         * follows the standard template for workspace pulldown menus.
         */
        addBillboardToWorkspaceMenu: function() {
            // get copy of billboard
            var billboardEl = this.getBillboard();
            $('#' + this.id + ' .com-chilipeppr-ws-billboard').append(billboardEl);
        },
        /**
         * Listen to window resize event.
         */
        setupResize: function() {
            $(window).on('resize', this.onResize.bind(this));
        },
        /**
         * When browser window resizes, forcibly resize the Console window
         */
        onResize: function() {
            if (this.widgetConsole) this.widgetConsole.resize();
        },
        /**
         * Load the Template widget via chilipeppr.load() so folks have a sample
         * widget they can fork as a starting point for their own.
         */
        loadTemplateWidget: function(callback) {

            chilipeppr.load(
                "#com-chilipeppr-widget-template-instance",
                "http://raw.githubusercontent.com/chilipeppr/widget-template/master/auto-generated-widget.html",
                function() {
                    // Callback after widget loaded into #myDivWidgetTemplate
                    // Now use require.js to get reference to instantiated widget
                    cprequire(
                        ["inline:com-chilipeppr-widget-template"], // the id you gave your widget
                        function(myObjWidgetTemplate) {
                            // Callback that is passed reference to the newly loaded widget
                            console.log("Widget / Template just got loaded.", myObjWidgetTemplate);
                            myObjWidgetTemplate.init();
                        }
                    );
                }
            );
        },
        /**
         * Load the Serial Port JSON Server widget via chilipeppr.load()
         */
        loadSpjsWidget: function(callback) {

            var that = this;

            chilipeppr.load(
                "#com-chilipeppr-widget-serialport-instance",
                "http://fiddle.jshell.net/chilipeppr/vetj5fvx/show/light/",
                function() {
                    console.log("mycallback got called after loading spjs module");
                    cprequire(["inline:com-chilipeppr-widget-serialport"], function(spjs) {
                        //console.log("inside require of " + fm.id);
                        spjs.setSingleSelectMode();
                        spjs.init({
                            isSingleSelectMode: true,
                            defaultBuffer: "default",
                            defaultBaud: 115200,
                            bufferEncouragementMsg: 'For your device please choose the "default" buffer in the pulldown and a 115200 baud rate before connecting.'
                        });
                        //spjs.showBody();
                        //spjs.consoleToggle();

                        that.widgetSpjs - spjs;

                        if (callback) callback(spjs);

                    });
                }
            );
        },
        /**
         * Load the Console widget via chilipeppr.load()
         */
        loadConsoleWidget: function(callback) {
            var that = this;
            chilipeppr.load(
                "#com-chilipeppr-widget-spconsole-instance",
                "http://fiddle.jshell.net/chilipeppr/rczajbx0/show/light/",
                function() {
                    // Callback after widget loaded into #com-chilipeppr-widget-spconsole-instance
                    cprequire(
                        ["inline:com-chilipeppr-widget-spconsole"], // the id you gave your widget
                        function(mywidget) {
                            // Callback that is passed reference to your newly loaded widget
                            console.log("My Console widget just got loaded.", mywidget);
                            that.widgetConsole = mywidget;

                            // init the serial port console
                            // 1st param tells the console to use "single port mode" which
                            // means it will only show data for the green selected serial port
                            // rather than for multiple serial ports
                            // 2nd param is a regexp filter where the console will filter out
                            // annoying messages you don't generally want to see back from your
                            // device, but that the user can toggle on/off with the funnel icon
                            that.widgetConsole.init(true, /myfilter/);
                            if (callback) callback(mywidget);
                        }
                    );
                }
            );
        },
        /**
         * Load the workspace menu and show the pubsubviewer and fork links using
         * our pubsubviewer widget that makes those links for us.
         */
        loadWorkspaceMenu: function(callback) {
            // Workspace Menu with Workspace Billboard
            var that = this;
            chilipeppr.load(
                "http://fiddle.jshell.net/chilipeppr/zMbL9/show/light/",
                function() {
                    require(['inline:com-chilipeppr-elem-pubsubviewer'], function(pubsubviewer) {

                        var el = $('#' + that.id + ' .com-chilipeppr-ws-menu .dropdown-menu-ws');
                        console.log("got callback for attachto menu for workspace. attaching to el:", el);

                        pubsubviewer.attachTo(
                            el,
                            that,
                            "Workspace"
                        );

                        if (callback) callback();
                    });
                }
            );
        },


        loadWidgets: function(callback) {

            console.log('WORKSPACE: loading widgets');
            // Load top bar elements

            // Zipwhip texting
            // com-chilipeppr-ws-zipwhip
            console.log('WORKSPACE: loading zipwhip');
            chilipeppr.load(
                "#com-chilipeppr-ws-zipwhip",
                "http://fiddle.jshell.net/chilipeppr/56X9G/show/light/",
                function() {
                    require(["inline:com-chilipeppr-elem-zipwhip"], function(zipwhip) {
                        zipwhip.init();
                        // setup toggle button
                        var zwBtn = $('#com-chilipeppr-ws-gcode-menu .zipwhip-button');
                        var zwDiv = $('#com-chilipeppr-ws-zipwhip');
                        zwBtn.click(function() {
                            if (zwDiv.hasClass("hidden")) {
                                // unhide
                                zwDiv.removeClass("hidden");
                                zwBtn.addClass("active");
                            }
                            else {
                                zwDiv.addClass("hidden");
                                zwBtn.removeClass("active");
                            }
                            $(window).trigger('resize');
                        });
                    });
                });


            // Frank Herrmann's Webcam Widget
            chilipeppr.load(
              "#com-chilipeppr-ws-webcam",
              "http://raw.githubusercontent.com/xpix/widget-cam/master/auto-generated-widget.html",
              function() {
                // Callback after widget loaded into #myDivWidgetCam
                // Now use require.js to get reference to instantiated widget
                cprequire(
                  ["inline:com-chilipeppr-widget-cam"], // the id you gave your widget
                  function(myObjWidgetCam) {
                    // Callback that is passed reference to the newly loaded widget
                    console.log("Widget / Cam just got loaded.", myObjWidgetCam);
                    myObjWidgetCam.init();

                    var btn = $('#com-chilipeppr-ws-gcode-menu .webcam-button');
                    var div = $('#com-chilipeppr-ws-webcam');
                    div.addClass("hidden");
                    btn.click(function() {
                        if (div.hasClass("hidden")) {
                            // show widget
                            div.removeClass("hidden");
                            btn.addClass("active");
                        } else {
                            // hide widget
                            div.addClass("hidden");
                            btn.removeClass("active");
                        }
                        setTimeout(function() {
                            $(window).trigger('resize');
                        }, 200);
                    });
                  }
                );
              }
            );

            console.log('WORKSPACE: loading autolevel');
            chilipeppr.load(
                "#com-chilipeppr-ws-autolevel",
                "http://raw.githubusercontent.com/jpadie/widget-grbl-autolevel/master/auto-generated-widget.html",
                function() {
                    require(["inline:com-chilipeppr-widget-autolevel"],

                        function(autolevel) {
                            autolevel.init();
                            // setup toggle button
                            var alBtn = $('#com-chilipeppr-ws-gcode-menu .autolevel-button');
                            var alDiv = $('#com-chilipeppr-ws-autolevel');
                            alBtn.click(function() {
                                if (alDiv.hasClass("hidden")) {
                                    // unhide
                                    alDiv.removeClass("hidden");
                                    alBtn.addClass("active");
                                    autolevel.onDisplay();
                                }
                                else {
                                    alDiv.addClass("hidden");
                                    alBtn.removeClass("active");
                                    autolevel.onUndisplay();
                                }
                                $(window).trigger('resize');
                            });
                        });
                });
            /*
            // Inject new div to contain widget or use an existing div with an ID
            $("body").append('<' + 'div id="myDivWidgetAutolevel"><' + '/div>');

            chilipeppr.load(
                "#myDivWidgetAutolevel",
                "http://raw.githubusercontent.com/raykholo/grbl-widget-autolevel/master/auto-generated-widget.html",
                function() {
                    // Callback after widget loaded into #myDivWidgetAutolevel
                    // Now use require.js to get reference to instantiated widget
                    cprequire(
                        ["inline:com-chilipeppr-widget-autolevel"], // the id you gave your widget
                        function(myObjWidgetAutolevel) {
                            // Callback that is passed reference to the newly loaded widget
                            console.log("Widget / Auto-Level just got loaded.", myObjWidgetAutolevel);
                            myObjWidgetAutolevel.init();
                        }
                    );
                }
            );*/


            // Macro
            // com-chilipeppr-ws-macro
            console.log('WORKSPACE: loading macro');
            chilipeppr.load(
                "#com-chilipeppr-ws-macro",
                "http://raw.githubusercontent.com/chilipeppr/widget-macro/master/auto-generated-widget.html",
                function() {
                    //"http://fiddle.jshell.net/chilipeppr/ZJ5vV/show/light/", function () {
                    cprequire(["inline:com-chilipeppr-widget-macro"], function(macro) {
                        macro.init();
                        // setup toggle button
                        var alBtn = $('#com-chilipeppr-ws-menu .macro-button');
                        var alDiv = $('#com-chilipeppr-ws-macro');
                        alBtn.click(function() {
                            if (alDiv.hasClass("hidden")) {
                                // unhide
                                alDiv.removeClass("hidden");
                                alBtn.addClass("active");
                                //autolevel.onDisplay();
                            }
                            else {
                                alDiv.addClass("hidden");
                                alBtn.removeClass("active");
                                //autolevel.onUndisplay();
                            }
                            $(window).trigger('resize');

                        });
                    });
                }); //End Macro


            /*
            // Macro (original)
            // com-chilipeppr-ws-autolevel
            chilipeppr.load(
                "#com-chilipeppr-ws-macro",
                "http://fiddle.jshell.net/chilipeppr/ZJ5vV/show/light/",
                function() {
                    require(["inline:com-chilipeppr-widget-macro"], function(macro) {
                        macro.init();
                        // setup toggle button
                        var alBtn = $('#com-chilipeppr-ws-gcode-menu .macro-button');
                        var alDiv = $('#com-chilipeppr-ws-macro');
                        alBtn.click(function() {
                            if (alDiv.hasClass("hidden")) {
                                // unhide
                                alDiv.removeClass("hidden");
                                alBtn.addClass("active");
                                //autolevel.onDisplay();
                            }
                            else {
                                alDiv.addClass("hidden");
                                alBtn.removeClass("active");
                                //autolevel.onUndisplay();
                            }
                            $(window).trigger('resize');

                        });
                    });
                });
                */

            /*
            // Macro (imania)
            // com-chilipeppr-ws-autolevel
            chilipeppr.load(
                "#com-chilipeppr-ws-macro",
                "http://jsfiddle.net/forstuvning/3gmfmnna/8/show/light/",
                function() {
                    require(["inline:com-chilipeppr-widget-macro"], function(macro) {
                        macro.init();
                        // setup toggle button
                        var alBtn = $('#com-chilipeppr-ws-gcode-menu .macro-button');
                        var alDiv = $('#com-chilipeppr-ws-macro');
                        alBtn.click(function() {
                            if (alDiv.hasClass("hidden")) {
                                // unhide
                                alDiv.removeClass("hidden");
                                alBtn.addClass("active");
                                //autolevel.onDisplay();
                            }
                            else {
                                alDiv.addClass("hidden");
                                alBtn.removeClass("active");
                                //autolevel.onUndisplay();
                            }
                            $(window).trigger('resize');

                        });
                    });
                });*/

            // JScut
            // com-chilipeppr-ws-jscut
            console.log('WORKSPACE: loading jscut');
            chilipeppr.load(
                "#com-chilipeppr-ws-jscut",
                "http://fiddle.jshell.net/chilipeppr/7ZzSV/show/light/",
                function() {
                    require(["inline:org-jscut-gcode-widget"], function(jscut) {
                        jscut.init();
                        // setup toggle button
                        var alBtn = $('#com-chilipeppr-ws-gcode-menu .jscut-button');
                        var alDiv = $('#com-chilipeppr-ws-jscut');
                        alBtn.click(function() {
                            if (alDiv.hasClass("hidden")) {
                                // unhide
                                alDiv.removeClass("hidden");
                                alBtn.addClass("active");
                            }
                            else {
                                alDiv.addClass("hidden");
                                alBtn.removeClass("active");
                            }
                            $(window).trigger('resize');

                        });
                    });
                });

            // Eagle BRD Import
            // com-chilipeppr-widget-eagle

            // Setup drag/drop for BRD files on our own because we don't
            // want to instantiate the Eagle BRD codebase (i.e. load its massive
            // javascript files) until the user try requests that we do
            var eagleObj = {
                eagleBtn: null,
                eagleDiv: null,
                eagleInstance: null,
                init: function() {
                    this.eagleBtn = $('#com-chilipeppr-ws-gcode-menu .eagle-button');
                    this.eagleDiv = $('#com-chilipeppr-ws-eagle');
                    this.setupDragDrop();
                    this.setupBtn();
                    console.log("done instantiating micro Eagle BRD plug-in");
                },
                setupBtn: function() {
                    this.eagleBtn.click(this.toggleEagle.bind(this));
                },
                toggleEagle: function() {
                    if (this.eagleDiv.hasClass("hidden")) {
                        // unhide
                        this.showEagle();
                    }
                    else {
                        this.hideEagle();
                    }
                },
                showEagle: function(callback) {
                    this.eagleDiv.removeClass("hidden");
                    this.eagleBtn.addClass("active");

                    // see if instantiated already
                    // if so, just activate
                    if (this.eagleInstance != null) {
                        this.eagleInstance.activateWidget();
                        if (callback) callback();
                    }
                    else {
                        // otherwise, dynamic load
                        var that = this;
                        chilipeppr.load(
                            "#com-chilipeppr-ws-eagle",
                            "http://raw.githubusercontent.com/chilipeppr/widget-eagle/master/auto-generated-widget.html",
                            function() {
                                require(["inline:com-chilipeppr-widget-eagle"], function(eagle) {
                                    that.eagleInstance = eagle;
                                    console.log("Eagle BRD instantiated. eagleInstance:", that.eagleInstance);
                                    that.eagleInstance.init();
                                    //eagleInstance.activateWidget();

                                    var newExportGcodeMillHoles = function() {
                                        var g = '';
                                        if (!$('#com-chilipeppr-widget-eagle .use-milling').is(':checked')) return g;
                                        var that = eagle;
                                        var dir = $('#DirectionCutting').val();
                                        //var diaOfEndmill = $('.dimension-mill-diameter').val();
                                        var diaOfEndmill = that.millDiameterMin;
                                        if ((!$('#com-chilipeppr-widget-eagle .use-drilling').is(':checked')) ||
                                            eagle.holesToMill.length == 0)
                                            return g;
                                        g += "(------ MILLING HOLES -------)\n";
                                        g += "M5 (spindle off)\n";
                                        g += "T" + ++eagle.toolCount + " M6 (Milling holes/board dimensions)\n";
                                        g += "(T" + eagle.toolCount + " D=" + diaOfEndmill + "mm - PCB End Mill)\n";
                                        g += "M3 S" + eagle.spindleRPM + " (spindle on)\n";
                                        g += "F" + eagle.feedRateDimensions + "\n";


                                        eagle.holesToMill.forEach(function(hole) {
                                            //g += that.generateGcodeHole(hole.D, hole.X, hole.Y)
                                            var radius = hole.D / 2;
                                            var gdiameter = radius - (eagle.millDiameter / 2); // inside milling 
                                            var stepDownPasses = Math.round(eagle.depthOfDimensions / eagle.stepDownDimensions + .5);
                                            g += '(generate hole at x:' + hole.X + ' y:' + hole.Y + ' with dia:' + hole.D + ' in ' + stepDownPasses + ' passes)' + "\n";
                                            g += "F" + eagle.feedRateDimensions + "\n";
                                            g += "G0 Z" + eagle.clearanceHeight + "\n";
                                            g += "G0 X" + eagle.round(hole.X - gdiameter) + " Y" + eagle.round(hole.Y) + "\n";
                                            for (var i = 0; i < stepDownPasses; i++) {
                                                var z = eagle.stepDownDimensions * (i + 1);
                                                if (z < eagle.depthOfDimensions) {
                                                    z = eagle.depthOfDimensions;
                                                }
                                                g += "G1 Z" + z.toFixed(4) + "\n"; //V5.2QUICKFIX
                                                g += (dir == 2) ? "G2" : "G3";
                                                g += " X" + eagle.round(hole.X - gdiameter) + " Y" + eagle.round(hole.Y);
                                                g += " I" + gdiameter.toFixed(4) + "\n";
                                            }
                                            g += "G0 Z" + eagleObj.clearanceHeight + "\n";
                                        });
                                        return g;
                                    };
                                    eagle.exportGcodeMillHoles = newExportGcodeMillHoles;
                                    if (callback) callback();
                                    var t = $('#com-chilipeppr-widget-eagle .fb-build').text();
                                    $('#com-chilipeppr-widget-eagle .fb-build').text(t + "jpa3");

                                });
                            }
                        );
                    }
                    $(window).trigger('resize');
                },
                hideEagle: function() {
                    this.eagleDiv.addClass("hidden");
                    this.eagleBtn.removeClass("active");
                    if (this.eagleInstance != null) {
                        this.eagleInstance.unactivateWidget();
                    }
                    $(window).trigger('resize');
                },
                setupDragDrop: function() {
                    // subscribe to events
                    chilipeppr.subscribe("/com-chilipeppr-elem-dragdrop/ondragover", this, this.onDragOver);
                    chilipeppr.subscribe("/com-chilipeppr-elem-dragdrop/ondragleave", this, this.onDragLeave);
                    // /com-chilipeppr-elem-dragdrop/ondropped
                    chilipeppr.subscribe("/com-chilipeppr-elem-dragdrop/ondropped", this, this.onDropped, 9); // default is 10, we do 9 to be higher priority
                },
                onDropped: function(data, info) {
                    console.log("onDropped. len of file:", data.length, "info:", info);
                    // we have the data
                    // double check it's a board file, cuz it could be gcode
                    if (data.match(/<!DOCTYPE eagle SYSTEM "eagle.dtd">/i)) {

                        // check that there's a board tag
                        if (data.match(/<board>/i)) {
                            console.log("we have an eagle board file!");
                            this.fileInfo = info;
                            var that = this;
                            this.showEagle(function() {
                                console.log("got callback after showing eagle. now opening file.");
                                that.eagleInstance.open(data, info);
                            });
                            console.log("opened brd file");

                            // do NOT store a lastDropped, rather we should
                            // get told from the workspace what the last file
                            // was and if it was a BRD file we should auto-open
                            /*
                            localStorage.setItem('com-chilipeppr-widget-eagle-lastDropped', data);
                            localStorage.setItem('com-chilipeppr-widget-eagle-lastDropped-info', JSON.stringify(info));
                            console.log("saved brd file to localstorage");
                            */
                        }
                        else {
                            console.log("looks like it is an eagle generated file, but not a board file. sad.");
                            chilipeppr.publish('/com-chilipeppr-elem-flashmsg/flashmsg', "Looks like you dragged in an Eagle CAD file, but it contains no board tag. You may have dragged in a schematic instead. Please retry with a valid board file.");
                        }

                        // now, we need to return false so no other widgets see this
                        // drag/drop event because they won't know how to handle
                        // an Eagle Brd file
                        return false;
                    }
                    else {
                        if (info && 'name' in info && info.name.match(/.brd$/i)) {
                            // this looks like an Eagle brd file, but it's binary
                            chilipeppr.publish('/com-chilipeppr-elem-flashmsg/flashmsg', "Error Loading Eagle BRD File", "Looks like you dragged in an Eagle BRD file, but it seems to be in binary. You can open this file in Eagle and then re-save it to a new file to create a text version of your Eagle BRD file.", 15 * 1000);
                            return false;
                        }
                        else {
                            console.log("we do not have an eagle board file. sad.");
                        }
                    }
                },
                onDragOver: function() {
                    console.log("onDragOver");
                    $('#com-chilipeppr-widget-eagle').addClass("panel-primary");
                    $('#com-chilipeppr-ws-gcode-menu .eagle-button').addClass("btn-primary");
                },
                onDragLeave: function() {
                    console.log("onDragLeave");
                    $('#com-chilipeppr-widget-eagle').removeClass("panel-primary");
                    $('#com-chilipeppr-ws-gcode-menu .eagle-button').removeClass("btn-primary");
                },
            };
            eagleObj.init();

            // GPIO
            // net-delarre-widget-gpio

            // Dynamically load the GPIO widget, i.e. wait til user clicks on the button
            // first time.
            console.log('WORKSPACE: loading GPIO Widget');
            var gpioObj = {
                gpioBtn: null,
                gpioDiv: null,
                gpioInstance: null,
                init: function() {
                    this.gpioBtn = $('#com-chilipeppr-ws-gcode-menu .gpio-button');
                    this.gpioDiv = $('#com-chilipeppr-ws-gpio');
                    this.setupBtn();
                    console.log("done instantiating GPIO add-on widget");
                },
                setupBtn: function() {
                    this.gpioBtn.click(this.toggleGpio.bind(this));
                },
                toggleGpio: function() {
                    if (this.gpioDiv.hasClass("hidden")) {
                        // unhide
                        this.showGpio();
                    }
                    else {
                        this.hideGpio();
                    }
                },
                showGpio: function(callback) {
                    this.gpioDiv.removeClass("hidden");
                    this.gpioBtn.addClass("active");

                    // see if instantiated already
                    // if so, just activate
                    if (this.gpioInstance != null) {
                        //this.gpioInstance.activateWidget();
                        if (callback) callback();
                    }
                    else {
                        // otherwise, dynamic load
                        var that = this;
                        chilipeppr.load(
                            "#com-chilipeppr-ws-gpio",
                            "http://fiddle.jshell.net/benjamind/L3c7csaw/show/light/",
                            function() {
                                require(["inline:net-delarre-widget-gpio"], function(gpio) {
                                    that.gpioInstance = gpio;
                                    console.log("GPIO instantiated. gpioInstance:", that.gpioInstance);
                                    that.gpioInstance.init();
                                    //eagleInstance.activateWidget();
                                    if (callback) callback();
                                });
                            }
                        );
                    }
                    $(window).trigger('resize');
                },
                hideGpio: function() {
                    this.gpioDiv.addClass("hidden");
                    this.gpioBtn.removeClass("active");
                    if (this.gpioInstance != null) {
                        //this.gpioInstance.unactivateWidget();
                    }
                    $(window).trigger('resize');
                },
            };
            gpioObj.init();

            console.log('WORKSPACE: loading shuttleExpress');

            // SuttleXpress
            // Dynamically load the ShuttleXpress Widget. i.e. wait til user clicks on 
            // the button first time.
            // uses generic object so can cut/paste easier for others (or create actual object)
            var shuttlexpressObj = {
                id: "shuttlexpress",
                url: "http://fiddle.jshell.net/lordmundi/btyfqk7w/show/light/",
                requireName: "inline:com-chilipeppr-widget-shuttlexpress",
                btn: null,
                div: null,
                instance: null,
                init: function() {
                    this.btn = $('#com-chilipeppr-ws-gcode-menu .' + this.id + '-button');
                    this.div = $('#com-chilipeppr-ws-' + this.id + '');
                    this.setupBtn();
                    console.log('done instantiating ' + this.id + ' add-on widget');
                },
                setupBtn: function() {
                    this.btn.click(this.toggle.bind(this));
                },
                toggle: function() {
                    if (this.div.hasClass("hidden")) {
                        // unhide
                        this.show();
                    }
                    else {
                        this.hide();
                    }
                },
                show: function(callback) {
                    this.div.removeClass("hidden");
                    this.btn.addClass("active");

                    // see if instantiated already
                    // if so, just activate
                    if (this.instance != null) {
                        this.instance.activateWidget();
                        if (callback) callback();
                    }
                    else {
                        // otherwise, dynamic load
                        var that = this;
                        chilipeppr.load(
                            '#com-chilipeppr-ws-' + this.id + '',
                            this.url,
                            function() {
                                require([that.requireName], function(myinstance) {
                                    that.instance = myinstance;
                                    console.log(that.id + " instantiated. instance:", that.instance);
                                    that.instance.init();
                                    if (callback) callback();
                                });
                            }
                        );
                    }
                    $(window).trigger('resize');
                },
                hide: function() {
                    this.div.addClass("hidden");
                    this.btn.removeClass("active");
                    if (this.instance != null) {
                        this.instance.unactivateWidget();
                    }
                    $(window).trigger('resize');
                },
            };
            shuttlexpressObj.init();


            console.log('WORKSPACE: loading touch plate widget');

            var touchPlateObj = {
                touchPlateBtn: null,
                touchPlateDiv: null,
                touchPlateInstance: null,
                init: function() {
                    this.touchPlateBtn = $('#com-chilipeppr-ws-gcode-menu .touchplate-button');
                    this.touchPlateDiv = $('#com-chilipeppr-ws-touchplate');
                    this.setupBtn();
                    console.log("done instantiating touchPlate add-on widget");
                },
                setupBtn: function() {
                    this.touchPlateBtn.click(this.toggletouchPlate.bind(this));
                },
                toggletouchPlate: function() {
                    if (this.touchPlateDiv.hasClass("hidden")) {
                        // unhide
                        this.showtouchPlate();
                    }
                    else {
                        this.hidetouchPlate();
                    }
                },
                showtouchPlate: function(callback) {
                    this.touchPlateDiv.removeClass("hidden");
                    this.touchPlateBtn.addClass("active");

                    // see if instantiated already
                    // if so, just activate
                    if (this.touchPlateInstance != null) {
                        //this.gpioInstance.activateWidget();
                        if (callback) callback();
                    }
                    else {
                        // otherwise, dynamic load
                        var that = this;
                        chilipeppr.load(
                            "#com-chilipeppr-ws-touchplate",
                            "http://fiddle.jshell.net/jarret/kvab65ot/show/light/",
                            function() {
                                require(["inline:com-chilipeppr-widget-touchplate"], function(touchPlate) {
                                    that.touchPlateInstance = touchPlate;
                                    console.log("touchPlate instantiated. touchPlateInstance:", that.touchPlateInstance);
                                    that.touchPlateInstance.init();
                                    //eagleInstance.activateWidget();
                                    if (callback) callback();
                                });
                            }
                        );
                    }
                    $(window).trigger('resize');
                },
                hidetouchPlate: function() {
                    this.touchPlateDiv.addClass("hidden");
                    this.touchPlateBtn.removeClass("active");
                    if (this.touchPlateInstance != null) {
                        //this.gpioInstance.unactivateWidget();
                    }
                    $(window).trigger('resize');
                },
            };
            touchPlateObj.init();

            // Element / Drag Drop
            // Load the dragdrop element into workspace toolbar
            // http://jsfiddle.net/chilipeppr/Z9F6G/
            console.log('WORKSPACE: loading drag drop widget');

            chilipeppr.load("#com-chilipeppr-ws-gcode-dragdrop",
                "http://raw.githubusercontent.com/chilipeppr/elem-dragdrop/master/auto-generated-widget.html",
                function() {
                    require(["inline:com-chilipeppr-elem-dragdrop"], function(dd) {
                        console.log("inside require of dragdrop");
                        $('.com-chilipeppr-elem-dragdrop').removeClass('well');
                        dd.init();
                        // The Chilipeppr drag drop element will publish
                        // on channel /com-chilipeppr-elem-dragdrop/ondropped
                        // when a file is dropped so subscribe to it
                        // It also adds a hover class to the bound DOM elem
                        // so you can add CSS to hilite on hover
                        dd.bind("#com-chilipeppr-ws-gcode-wrapper", null);
                        //$(".com-chilipeppr-elem-dragdrop").popover('show');
                        //dd.bind("#pnlWorkspace", null);
                        var ddoverlay = $('#com-chilipeppr-ws-gcode-dragdropoverlay');
                        chilipeppr.subscribe("/com-chilipeppr-elem-dragdrop/ondragover", function() {
                            //console.log("got dragdrop hover");
                            ddoverlay.removeClass("hidden");
                        });
                        chilipeppr.subscribe("/com-chilipeppr-elem-dragdrop/ondragleave", function() {
                            ddoverlay.addClass("hidden");
                            //console.log("got dragdrop leave");
                        });
                        console.log(dd);
                    });
                });

            // Workspace Menu with Workspace Billboard
            // http://jsfiddle.net/jlauer/yC8Hv/

            console.log('WORKSPACE: loading billboard');
            chilipeppr.load(
                "#com-chilipeppr-ws-gcode-menu-billboard",
                "http://raw.githubusercontent.com/chilipeppr/widget-pubsubviewer/master/auto-generated-widget.html");

            //Unsure what the purpose of this is; loading the wrong widgets. 
            // MODIFY
            // This is a fiddle that looks at the Grbl workspace being instantiated
            // here and attaches 3 menu items. 1) the pubsub viewer dialog so users
            // can see what pubsubs this workspace may publish or subscribe to 2) It
            // lets them fork the workspace for their own use
            /*
            chilipeppr.load(
                "http://fiddle.jshell.net/chilipeppr/zMbL9/show/light/",

                function() {
                    require(['inline:com-chilipeppr-elem-pubsubviewer'], function(pubsubviewer) {
                        // you are asking the pubsubviewer to show its menu
                        // inside the dom element in the 1st param, in the 2nd
                        // param you are giving it which object to analyze to gather
                        // its data, the 3rd param is just a name
                        pubsubviewer.attachTo(
                            $('#com-chilipeppr-ws-gcode-menu .dropdown-menu-ws'),
                            ws,
                            "Workspace");
                    });
                });
                */

            // 3D Viewer
            // http://jsfiddle.net/chilipeppr/y3HRF
            console.log('WORKSPACE: loading 3d viewer');
            chilipeppr.load("#com-chilipeppr-3dviewer",
                //"http://fiddle.jshell.net/chilipeppr/y3HRF/show/light/",
                "http://raw.githubusercontent.com/chilipeppr/widget-3dviewer/master/auto-generated-widget.html",

                function() {
                    console.log("got callback done loading 3d");

                    cprequire(
                        ['inline:com-chilipeppr-widget-3dviewer'],

                        function(threed) {



                            //override gotoXyz function to take into account the units parameter passed back in axes pubsub from GRBL.
                            threed.gotoXyz1 = function(data) {
                                // we are sent this command by the CNC controller generic interface
                                console.log("gotoXyz. data:", data);
                                console.log("gotoXyz. curUnits:", threed.isUnitsMm);
                                threed.animNoSleep();
                                threed.tweenIsPlaying = false;
                                threed.tweenPaused = true;

                                var coords = {
                                    x: null,
                                    y: null,
                                    z: null
                                }; //create separate variable to see if that helps

                                //first, we may need to convert units to match 3d viewer
                                if (data.unit == "mm" && threed.isUnitsMm === false) {
                                    coords.x = (data.x / 25.4).toFixed(3);
                                    coords.y = (data.y / 25.4).toFixed(3);
                                    coords.z = (data.z / 25.4).toFixed(3);
                                }
                                else if (data.unit == "inch" && threed.isUnitsMm === true) {
                                    coords.x = (data.x * 25.4).toFixed(3);
                                    coords.y = (data.y * 25.4).toFixed(3);
                                    coords.z = (data.z * 25.4).toFixed(3);
                                }
                                else {
                                    coords.x = data.x;
                                    coords.y = data.y;
                                    coords.z = data.z;
                                }

                                console.log("gotoXyz. coords:", coords);

                                if ('x' in coords && coords.x !== null) threed.toolhead.position.x = coords.x;
                                if ('y' in coords && coords.y !== null) threed.toolhead.position.y = coords.y;
                                if ('z' in coords && coords.z !== null) threed.toolhead.position.z = coords.z;
                                if (threed.showShadow) {
                                    threed.toolhead.children[0].target.position.set(threed.toolhead.position.x, threed.toolhead.position.y, threed.toolhead.position.z);
                                    threed.toolhead.children[1].target.position.set(threed.toolhead.position.x, threed.toolhead.position.y, threed.toolhead.position.z);
                                }
                                threed.lookAtToolHead();

                                // see if jogging, if so rework the jog tool
                                // double check that our jog 3d object is defined
                                // cuz on early load we can get here prior to the
                                // jog cylinder and other objects being defined
                                if (threed.isJogSelect && threed.jogArrowCyl) {
                                    if ('z' in coords && coords.z !== null) {
                                        console.log("adjusting jog tool:", threed.jogArrow);
                                        var cyl = threed.jogArrowCyl; //.children[0];
                                        var line = threed.jogArrowLine; //.children[2];
                                        var shadow = threed.jogArrowShadow; //.children[3];
                                        var posZ = coords.z * 3; // acct for scale
                                        cyl.position.setZ(posZ + 20);
                                        console.log("line:", line.geometry.vertices);
                                        line.geometry.vertices[1].z = posZ; // 2nd top vertex
                                        line.geometry.verticesNeedUpdate = true;
                                        shadow.position.setX(posZ * -1); // make x be z offset
                                    }
                                }

                                threed.animAllowSleep();
                            };

                            console.log("Running 3dviewer");
                            threed.init();
                            console.log("3d viewer initted");

                            // Ok, do someting whacky. Try to move the 3D Viewer 
                            // Control Panel to the center column
                            setTimeout(function() {
                                var element = $('#com-chilipeppr-3dviewer .panel-heading').detach();
                                $('#com-chilipeppr-3dviewer').addClass("noheight");
                                $('#com-chilipeppr-widget-3dviewer').addClass("nomargin");
                                $('#com-chilipeppr-3dviewer-controlpanel').append(element);
                            }, 10);

                            // listen to resize events so we can resize our 3d viewer
                            // this was done to solve the scrollbar residue we were seeing
                            // resize this console on a browser resize
                            var mytimeout = null;
                            $(window).on('resize', function(evt) {
                                //console.log("3d view force resize");
                                if (mytimeout !== undefined && mytimeout != null) {
                                    clearTimeout(mytimeout);
                                    //console.log("cancelling timeout resize");
                                }
                                mytimeout = setTimeout(function() {
                                    console.log("3d view force resize. 1 sec later");
                                    threed.resize();
                                }, 1000);

                            });

                            //disable the toolhead following by default
                            // turn off looking at toolhead
                            threed.isLookAtToolHeadMode = false;
                            $('.com-chilipeppr-widget-3d-menu-lookattoolhead').removeClass("active btn-primary");

                        });

                });


            // Gcode List
            // http://jsfiddle.net/chilipeppr/a4g5ds5n/
            console.log('WORKSPACE: loading gcode list');
            chilipeppr.load("#com-chilipeppr-gcode-list",
                "http://raw.githubusercontent.com/jpadie/widget-gcodelist-jpaFork/master/auto-generated-widget.html",
                //"http://fiddle.jshell.net/chilipeppr/a4g5ds5n/show/light/",
                //"http://jsfiddle.net/jarret/0a53jy0x/show/light",


                function() {
                    cprequire(
                        ["inline:com-chilipeppr-widget-gcode"],
                        function(gcodelist) {
                            gcodelist.init();
                        }
                    );
                }
            );

            //Axes Widget XYZA
            //This widget is locked at version 97 until upgrades can be tested with the override code.
            console.log('WORKSPACE: loading axis widget');
            chilipeppr.load(
                "com-chilipeppr-xyz-instance",
                //          "http://fiddle.jshell.net/chilipeppr/gh45j/97/show/light/",
                "http://raw.githubusercontent.com/chilipeppr-grbl/widget-grbl-xyz/master/auto-generated-widget.html",


                function() {
                    cprequire(
                        ["inline:com-chilipeppr-widget-xyz"],

                        function(xyz) {
                            //overwrite the G28 homing process with grbl's $H homing

                            var oldHomeAxis = xyz.homeAxis.bind(xyz);
                            var newHomeAxis = function(data) {
                                var cmd = "$H\n";
                                console.log(cmd);
                                chilipeppr.publish("/com-chilipeppr-widget-serialport/send", cmd);

                            };
                            var oldSendDone = xyz.sendDone.bind(xyz);
                            var newSendDone = function(data) {

                            };
                            var newJog = function(direction, isFast, is100xFast, is1000xFast, is10000xFast) {
                                var feedrate = xyz.jogFeedRate;
                                var val = parseFloat(xyz.accelBaseval).toFixed(3);

                                if (direction.length == 0) return true;
                                var cmd;
                                //chilipeppr.publish('/com-chilipeppr-widget-grbl-jogInterface/jog', direction);



                                if (xyz.isGrblV1()) {
                                    cmd = '$J=G91 G21 ' + direction + val + " F" + feedrate + "\n";
                                }
                                else {
                                    cmd = "G91 G0 " + direction.replace('+', '') + val + "\nG90\n";
                                }

                                console.warn(cmd);

                                if (!(xyz.isPausedByPlanner)) {
                                    chilipeppr.publish("/com-chilipeppr-widget-serialport/send", cmd);
                                    console.log('AXIS WIDGET: sent cmd ' + cmd);
                                    //chilipeppr.publish("/com-chilipeppr-widget-serialport/send", cmd);
                                }
                                else {
                                    console.log("planner buffer full, so not sending jog cmd");
                                }
                                //    }


                            };

                            xyz.jog = newJog;
                            xyz.homeAxis = newHomeAxis;
                            xyz.sendDone = newSendDone;
                            xyz.grblVersion = '';
                            xyz.setGrblVersion = function(version) {
                                this.grblVersion = version;
                            };
                            xyz.isGrblV1 = function() {
                                if (xyz.grblVersion.length == 0) return false;
                                return (xyz.grblVersion.substring(0, 1) == '1');
                            };
                            chilipeppr.subscribe("/com-chilipeppr-interface-cnccontroller/grblVersion", xyz, xyz.setGrblVersion);

                            xyz.setJogFeedRate = function(jogFeedRate) {
                                this.jogFeedRate = jogFeedRate;
                            };
                            chilipeppr.subscribe("/com-chilipeppr-interface-cnccontroller/jogFeedRate", xyz, xyz.setJogFeedRate);
                            xyz.jogFeedRate = 200;
                            xyz.updateAxesFromStatus = function(axes) {
                                console.log("updateAxesFromStatus:", axes);

                                var coords = {
                                    x: null,
                                    y: null,
                                    z: null
                                } //create local object to edit

                                //first, we may need to convert units to match 3d viewer
                                if (axes.unit == "mm" && xyz.currentUnits === "inch") {
                                    coords.x = (axes.x / 25.4).toFixed(3);
                                    coords.y = (axes.y / 25.4).toFixed(3);
                                    coords.z = (axes.z / 25.4).toFixed(3);
                                }
                                else if (axes.unit == "inch" && xyz.currentUnits === "mm") {
                                    coords.x = (axes.x * 25.4).toFixed(3);
                                    coords.y = (axes.y * 25.4).toFixed(3);
                                    coords.z = (axes.z * 25.4).toFixed(3);
                                }
                                else {
                                    coords.x = axes.x;
                                    coords.y = axes.y;
                                    coords.z = axes.z;
                                }

                                if ('x' in coords && coords.x != null) {
                                    xyz.updateAxis("x", coords.x);
                                }
                                if ('y' in coords && coords.y != null) {
                                    xyz.updateAxis("y", coords.y);
                                }
                                if ('z' in coords && coords.z != null) {
                                    xyz.updateAxis("z", coords.z);
                                }
                                if ('a' in coords && coords.a != null) {
                                    xyz.updateAxis("a", coords.a);
                                }
                            };

                            xyz.init();

                            chilipeppr.unsubscribe('/com-chilipeppr-widget-3dviewer/unitsChanged', xyz.updateUnitsFromStatus);

                            //remove wcs until it is fully baked
                            $('.btnToggleShowWcs').hide();
                            xyz.setupShowHideWcsBtn = function() {};

                            $('#com-chilipeppr-widget-xyz-ftr .joggotozero').attr("data-content", "G0 X0 Y0 Z0<br/>If you need to go to X0 Y0 first and then Z0, you can use the menus on the axes above.");

                            //bind the zero out button to G92 instead of G28
                            $('#com-chilipeppr-widget-xyz-ftr .jogzeroout').unbind("click");
                            $('#com-chilipeppr-widget-xyz-ftr .jogzeroout').click("xyz", xyz.zeroOutAxisG92.bind(xyz));
                            $('#com-chilipeppr-widget-xyz-ftr .jogzeroout').attr("data-content", "G92 X0 Y0 Z0 - Temporary offsets will be lost with grbl soft reset (ctrl+x) or when an M2 or M30 command is executed");

                            //update homing pop-up
                            $('#com-chilipeppr-widget-xyz-ftr .joghome').attr("data-content", "$H homing cycle - Must have limit switches and homing enabled in GRBL settings");

                            //clean up drop down lists (z)
                            $("#com-chilipeppr-widget-xyz-z .dropdown-menu li")[9].remove();
                            $("#com-chilipeppr-widget-xyz-z .dropdown-menu li")[8].remove();
                            $("#com-chilipeppr-widget-xyz-z .dropdown-menu li")[4].remove();
                            $("#com-chilipeppr-widget-xyz-z .dropdown-menu li")[3].remove();
                            $("#com-chilipeppr-widget-xyz-z .dropdown-menu li")[2].remove();
                            //clean up drop down lists (y)
                            $("#com-chilipeppr-widget-xyz-y .dropdown-menu li")[9].remove();
                            $("#com-chilipeppr-widget-xyz-y .dropdown-menu li")[8].remove();
                            $("#com-chilipeppr-widget-xyz-y .dropdown-menu li")[4].remove();
                            $("#com-chilipeppr-widget-xyz-y .dropdown-menu li")[3].remove();
                            $("#com-chilipeppr-widget-xyz-y .dropdown-menu li")[2].remove();
                            //clean up drop down lists (x)
                            $("#com-chilipeppr-widget-xyz-x .dropdown-menu li")[9].remove();
                            $("#com-chilipeppr-widget-xyz-x .dropdown-menu li")[8].remove();
                            $("#com-chilipeppr-widget-xyz-x .dropdown-menu li")[4].remove();
                            $("#com-chilipeppr-widget-xyz-x .dropdown-menu li")[3].remove();
                            $("#com-chilipeppr-widget-xyz-x .dropdown-menu li")[2].remove();

                            //remove A axis toggle option
                            $('#com-chilipeppr-widget-xyz .showhideaaxis').remove();

                            //Port the inches/mm code to grbl workspace - change to work with grbl

                            //$('#com-chilipeppr-widget-xyz .btnInMm').unbind("click");
                            //$('#com-chilipeppr-widget-xyz .btnInMm').click(xyz.toggleInMm.bind(xyz));

                            //remove existing keydown/keyup commands for jogging -- will replace these with our own keypress function
                            $('#com-chilipeppr-widget-xyz-ftr').unbind("keydown");
                            $('#com-chilipeppr-widget-xyz-ftr').unbind("keyup");

                            //create the keypress function
                            var that = xyz;
                            $('#com-chilipeppr-widget-xyz-ftr').keydown(function(evt) {
                                if (that.isInCustomMenu) {
                                    console.log("custom menu showing. not doing jog.");
                                    return true;
                                }

                                that.accelBaseValHilite(evt);

                                // if this keydown event does not contain a relevant keypress then just exit
                                if (!(evt.which > 30 && evt.which < 41)) {
                                    console.log("exiting cuz not arrow key. evt:", evt);
                                    return;
                                }
                                else {
                                    //console.log("evt:", evt);
                                }

                                var key = evt.which;
                                var direction = null;

                                if (key == 38) {
                                    // up arrow. Y+
                                    direction = "Y+";
                                    $('#com-chilipeppr-widget-xyz-ftr .jogy').addClass("hilite");
                                    setTimeout(function() {
                                        $('#com-chilipeppr-widget-xyz-ftr .jogy').removeClass('hilite');
                                    }, 100);
                                }
                                else if (key == 40) {
                                    // down arrow. Y-
                                    direction = "Y-";
                                    $('#com-chilipeppr-widget-xyz-ftr .jogyneg').addClass("hilite");
                                    setTimeout(function() {
                                        $('#com-chilipeppr-widget-xyz-ftr .jogyneg').removeClass('hilite');
                                    }, 100);
                                }
                                else if (key == 37) {
                                    direction = "X-";
                                    $('#com-chilipeppr-widget-xyz-ftr .jogxneg').addClass("hilite");
                                    setTimeout(function() {
                                        $('#com-chilipeppr-widget-xyz-ftr .jogxneg').removeClass('hilite');
                                    }, 100);
                                }
                                else if (key == 39) {
                                    direction = "X+";
                                    $('#com-chilipeppr-widget-xyz-ftr .jogx').addClass("hilite");
                                    setTimeout(function() {
                                        $('#com-chilipeppr-widget-xyz-ftr .jogx').removeClass('hilite');
                                    }, 100);
                                }
                                else if (key == 33) {
                                    // page up
                                    direction = "Z+";
                                    $('#com-chilipeppr-widget-xyz-ftr .jogz').addClass("hilite");
                                    setTimeout(function() {
                                        $('#com-chilipeppr-widget-xyz-ftr .jogz').removeClass('hilite');
                                    }, 100);
                                }
                                else if (key == 34) {
                                    // page down
                                    direction = "Z-";
                                    $('#com-chilipeppr-widget-xyz-ftr .jogzneg').addClass("hilite");
                                    setTimeout(function() {
                                        $('#com-chilipeppr-widget-xyz-ftr .jogzneg').removeClass('hilite');
                                    }, 100);
                                }

                                if (direction) {
                                    //that.jog(direction, isFast, is100xFast, is1000xFast, is10000xFast);
                                    that.jog(direction);
                                }
                            });
                            // when key is up, we're done jogging
                            $('#com-chilipeppr-widget-xyz-ftr').keyup(function(evt) {
                                that.accelBaseValUnhilite();
                            });
                        });
                });


            console.log('WORKSPACE: loading macros at line 1379');
            chilipeppr.load(
                "#com-chilipeppr-ws-macro",
                "http://raw.githubusercontent.com/chilipeppr/widget-macro/master/auto-generated-widget.html",
                function() {
                    require(["inline:com-chilipeppr-widget-macro"], function(macro) {
                        macro.init();
                        // setup toggle button
                        var alBtn = $('#com-chilipeppr-ws-gcode-menu .macro-button');
                        var alDiv = $('#com-chilipeppr-ws-macro');
                        alBtn.click(function() {
                            if (alDiv.hasClass("hidden")) {
                                // unhide
                                alDiv.removeClass("hidden");
                                alBtn.addClass("active");
                                //autolevel.onDisplay();
                            }
                            else {
                                alDiv.addClass("hidden");
                                alBtn.removeClass("active");
                                //autolevel.onUndisplay();
                            }
                            $(window).trigger('resize');

                        });
                    });
                });


            // Serial Port Log Window
            // http://jsfiddle.net/chilipeppr/rczajbx0/
            console.log('WORKSPACE: loading serial port log');
            chilipeppr.load("#com-chilipeppr-serialport-log",
                "http://raw.githubusercontent.com/chilipeppr/widget-console/master/auto-generated-widget.html",


                // "http://fiddle.jshell.net/chilipeppr/rczajbx0/show/light/",

                function() {
                    cprequire(
                        ["inline:com-chilipeppr-widget-spconsole"],

                        function(spc) {

                            //stop spconsole from showing status requests responses from jsps
                            var oldOnRecvLine = spc.onRecvLine.bind(spc);
                            var newOnRecvLine = function(data) {
                                //ignore incoming status update to keep console clear otherwise continue with original function
                                console.log("GRBL: AltOnRecvLine: " + data.dataline);
                                if (data.dataline.search(/^<|^\$G|^\?|^\[/) < 0 || $('#com-chilipeppr-widget-grbl .grbl-verbose').hasClass("enabled")) {
                                    data.dataline = data.dataline.replace("<", "&lt;").replace(">", "&gt;");
                                    oldOnRecvLine(data);
                                }
                            };
                            var oldJsonOnQueue = spc.jsonOnQueue.bind(spc);
                            var newJsonOnQueue = function(data) {
                                console.log("GRBL: AltJsonOnQueue: " + data);
                                if (data.D.search(/^<|^\$G|^\?|^\[/) < 0 || $('#com-chilipeppr-widget-grbl .grbl-verbose').hasClass("enabled")) {
                                    data.D = data.D.replace("<", "&lt;").replace(">", "&gt;");
                                    oldJsonOnQueue(data);
                                }
                            };

                            spc.onRecvLine = newOnRecvLine;
                            spc.jsonOnQueue = newJsonOnQueue;

                            spc.init(true, /^ok|^\n|^\[G|^</);

                            // resize this console on a browser resize
                            $(window).on('resize', function(evt) {
                                //console.log("serial-port-console. resize evt:", evt);
                                if ($.isWindow(evt.target)) {
                                    //console.log("resize was window. so resizing");
                                    spc.resize();
                                }
                                else {
                                    //console.log("resize was not window, so ignoring");
                                }
                            });
                            // resize this console if we get a publish
                            // from the gcode viewer widget
                            chilipeppr.subscribe("/com-chilipeppr-widget-gcode/resize", spc, spc.resize);
                        });
                });



            // GRBL
            // http://jsfiddle.net/jarret/b5L2rtgc/ //alternate test version of grbl controller
            // com-chilipeppr-grbl

            console.log('WORKSPACE: loading grbl widget');
            var queryString = document.location.search;
            if (queryString.indexOf('?') === 0) {
                queryString = queryString.substr(1);
            }
            var parts = queryString.split('&');
            var queryDictionary = {};
            for (var i = 0; i < parts.length; i++) {
                var p = parts[i];
                var keyValuePair = p.split('=');
                var key = keyValuePair[0];
                var value = keyValuePair[1];
                value = decodeURIComponent(value);
                value = value.replace(/\+/g, ' ');
                queryDictionary[key] = value;
            }
            var grblWidgetUrl = '';
            if (queryDictionary['jDebug'] != 'undefined' && queryDictionary['jDebug'] == 1) {
                grblWidgetUrl = "http://raw.githubusercontent.com/jpadie/grbl1-test-widget/master/auto-generated-widget.html"
            }
            else {
                grblWidgetUrl = "https://raw.githubusercontent.com/jpadie/grbl1-test-widget/62452538a02a3b9ac34c0ed842781f98760fef97/auto-generated-widget.html";
            }
            chilipeppr.load(
                "#com-chilipeppr-widget-grbl-instance",
                grblWidgetUrl,
                function() {
                    cprequire(
                        ["inline:com-chilipeppr-widget-grbl"], //"inline:com-chilipeppr-widget-spconsole"],
                        //, "inline:com-chilipeppr-serialport-spselector"],

                        function(grbl) { //,spconsole) {

                            grbl.init();

                        });
                });

            /*
            // WebRTC Client com-chilipeppr-webrtcclient
            chilipeppr.load(
                "com-chilipeppr-webrtcclient",
                "http://fiddle.jshell.net/chilipeppr/qWj4f/show/light/",

                function() {
                    cprequire(
                        ["inline:com-chilipeppr-widget-webrtc-client"],

                        function(webrtcclient) {
                            webrtcclient.init();
                        });
                });
                */

            // Serial Port Selector
            // http://jsfiddle.net/chilipeppr/vetj5fvx/
            console.log('WORKSPACE: loading serialport selector');
            chilipeppr.load("com-chilipeppr-serialport-spselector",
                //"http://fiddle.jshell.net/chilipeppr/vetj5fvx/show/light/",
                "http://raw.githubusercontent.com/chilipeppr/widget-spjs/master/auto-generated-widget.html",


                function() {
                    cprequire(
                        ["inline:com-chilipeppr-widget-serialport"],


                        function(sp) {
                            sp.setSingleSelectMode();
                            //sp.init("192.168.1.7");
                            var params = {
                                isSingleSelectMode: true,
                                defaultBuffer: "grbl",
                                defaultBaud: 115200,
                                bufferEncouragementMsg: 'For your device please choose the "grbl" buffer in the pulldown and a 115200 baud rate before connecting.'
                            };
                            sp.init(params);
                            //$('.com-chilipeppr-widget-serialport-console').removeClass("hidden");
                            //$('.com-chilipeppr-widget-serialport-status').removeClass("hidden");
                        });
                });



        },



    }
});
