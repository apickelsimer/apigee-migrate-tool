/*jslint node: true */
var apigee = require('../config.js');
var Portal = require('../util/portal.lib.js');
var async = require('async');

module.exports = function (grunt) {
    'use strict';

    /**
     * This will export out all the specifications with the folder structure from Apigee Edge spec store
     *
     */
    grunt.registerTask('exportPortals', 'Export portals and all content from org ' + apigee.from.org + " [" + apigee.from.version + "]", function () {

        if (apigee.from.portalUrl !== 'https://mgmtui.apigee.net') {
            throw new Error("This will only works with Apigee Edge (Cloud)");
        }

        var filepath = grunt.config.get("exportPortals.dest.data");
        var done = this.async();

        var portalObj = new Portal(apigee);
        var sites = [];

        //get sites
        portalObj.getPortalSites(function(portal_sites_json){
            grunt.verbose.writeln(portal_sites_json);
            var sites = portal_sites_json.data;
            
            if(sites) {
                async.forEach(Object.keys(sites), function (j, callback) {
                    var site = sites[j];
                    grunt.verbose.writeln(JSON.stringify(site));
                    var file_name = `${filepath}/sites/${site.id}/site.json`;
                    grunt.verbose.writeln(`writing file: ${file_name}`);
                    grunt.file.write(file_name, JSON.stringify(site));
                    grunt.verbose.writeln(`site ${site.id} written!`);
                    var siteId = site.id;

                    portalObj.getPortalPages(
                        function(portal_pages_json){
                            grunt.verbose.writeln(portal_pages_json);
                            var pages = portal_pages_json.data;
                            if (pages) {
                                async.forEach(Object.keys(pages), function (k, callback) {
                                    var page = pages[k];
                                    grunt.verbose.writeln(JSON.stringify(page));
                                    var file_name = `${filepath}/sites/${siteId}/pages/${page.friendlyId}.json`;
                                    portalObj.getPortalPagePermissions(function (portal_pagepermissions_json){
                                        var perm_file_name = `${filepath}/sites/${siteId}/permissions/pages/${page.friendlyId}.json`;
                                        grunt.verbose.writeln(`writing file: ${perm_file_name}`);
                                        var pagepermissions = JSON.stringify(portal_pagepermissions_json.data);
                                        grunt.file.write(perm_file_name, pagepermissions);
                                        grunt.verbose.writeln(`page_permission ${page.friendlyId} written!`);
                                    }, siteId, page.friendlyId)
                                    grunt.verbose.writeln(`writing file: ${file_name}`);
                                    grunt.file.write(file_name, JSON.stringify(page));
                                    grunt.verbose.writeln(`page ${page.friendlyId} written!`);
                                }), function (err) { 
                                    //something went wrong
                                    console.log(err);
                                }
                            };
                        },siteId);
  
                    portalObj.getPortalCustomCss(
                        function(portal_customcss_json){
                            grunt.verbose.writeln(portal_customcss_json);
                            var customcss = portal_customcss_json.data;
                            if (customcss) {
                                grunt.verbose.writeln(JSON.stringify(customcss));
                                var file_name = `${filepath}/sites/${siteId}/customcss/customcss.json`;
                                grunt.verbose.writeln(`writing file: ${file_name}`);
                                grunt.file.write(file_name, JSON.stringify(customcss));
                                grunt.verbose.writeln(`customcss written!`);
                            };
                        },siteId);

                    portalObj.getPortalFileList(
                        function(portal_filelist_json){
                            grunt.verbose.writeln(portal_filelist_json);
                            var filelist = portal_filelist_json.data;
                            if (filelist) {
                                grunt.verbose.writeln(JSON.stringify(filelist));
                                var file_name = `${filepath}/sites/${siteId}/files/files.json`;
                                grunt.verbose.writeln(`writing file: ${file_name}`);
                                grunt.file.write(file_name, JSON.stringify(filelist));
                                grunt.verbose.writeln(`filelist written!`);
                                for (var k = 0; k < filelist.length; k++) {
                                    var file = filelist[k];
                                    //grunt.verbose.writeln(JSON.stringify(page));
                                    var file_name = `${filepath}/sites/${siteId}/files/${file.filename}`;
                                    grunt.verbose.writeln(`writing file: ${file_name}`);
                                    // 
                                    //TODO: download the binary and save to disk
                                    // perform download inline, or switch loop to forEach and invoke a function
                                    // 
                                    //grunt.file.write(file_name, JSON.stringify(page));
                                    grunt.verbose.writeln(`file ${file_name} written!`);
                                }
                            };
                        },siteId);

                    portalObj.getPortalMenuItems(
                        function(portal_menuitems_json){
                            grunt.verbose.writeln(portal_menuitems_json);
                            var menuitems = portal_menuitems_json.data;
                            if (menuitems) {
                                for (var k = 0; k < menuitems.length; k++) {
                                    var menuitem = menuitems[k];
                                    grunt.verbose.writeln(JSON.stringify(menuitem));
                                    var file_name = `${filepath}/sites/${siteId}/menu/${menuitem.menuItemId}.json`;
                                    grunt.verbose.writeln(`writing file: ${file_name}`);
                                    grunt.file.write(file_name, JSON.stringify(menuitem));
                                    grunt.verbose.writeln(`menu ${menuitem.menuItemId} written!`);
                                }
                            };
                        },siteId);

                    portalObj.getPortalApiDocs(
                        function(portal_apidocs_json){
                            grunt.verbose.writeln(portal_apidocs_json);
                            var apidocs = portal_apidocs_json.data;
                            if (apidocs) {
                                async.forEach(Object.keys(apidocs), function (k, callback) {
                                    var apidoc = apidocs[k];
                                    grunt.verbose.writeln(JSON.stringify(apidoc));
                                    var file_name = `${filepath}/sites/${siteId}/apidocs/${apidoc.apiId}.json`;
                                    portalObj.getPortalApiPermissions(function (portal_apipermissions_json){
                                        var perm_file_name = `${filepath}/sites/${siteId}/permissions/apis/${apidoc.apiId}.json`;
                                        grunt.verbose.writeln(`writing file: ${perm_file_name}`);
                                        var apipermissions = JSON.stringify(portal_apipermissions_json.data);
                                        grunt.file.write(perm_file_name, apipermissions);
                                        grunt.verbose.writeln(`apidoc_permission ${apidoc.apiId} written!`);
                                    }, siteId, apidoc.id)
                                    grunt.verbose.writeln(`writing file: ${file_name}`);
                                    grunt.file.write(file_name, JSON.stringify(apidoc));
                                    grunt.verbose.writeln(`apidoc ${apidoc.apiId} written!`);
                                }), function (err) { 
                                    //something went wrong
                                    console.log(err);
                                }
                            };
                        },siteId);

                        //end before error func
                
                }, function (err) {
                        if (err) {
                            if (cb)
                                cb('error');
                        } else {
                            //do something here
                        }
                    });
                }
        });
    
    });


    /**
     * Import will create Portals in the destination org.
     * It will create duplicates if the portals with the same name already exist but will not overwrite.
     *
     */
    grunt.registerTask('importAllPortals', 'Import all Portals to ' + apigee.to.org + " [" + apigee.to.version + "]", function () {
        if (apigee.to.portalUrl !== 'https://mgmtui.apigee.net') {
            throw new Error("This will only works with Apigee Edge (Cloud)");
        }
        var filepath = grunt.config.get("importAllPortals.src.data");
        var done = this.async();

        var specstoreObj = new Portal(apigee.to);
        specstoreObj.uploadToPortal(filepath);

    });

    /**
     * This will delete all Portals in the destination org
     *
     */
    grunt.registerTask('deleteAllPortals', 'Delete all Portals from ' + apigee.to.org + " [" + apigee.to.version + "]", function () {
        if (apigee.to.portalUrl !== 'https://mgmtui.apigee.net') {
            throw new Error("This will only works with Apigee Edge (Cloud)");
        }
        var done = this.async();
        var portalObj = new Portal(apigee.to);
        portalObj.purgeEverything(function () {
            grunt.verbose.writeln("Deleted all Portals in '" + apigee.to.org + "' org !!");
            done();
        });

    });

}