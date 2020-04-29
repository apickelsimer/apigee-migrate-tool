var request = require('request');
var async = require('async');
var fs = require('fs');
"use strict";

/**
 * Portal class which wraps the API calls to the Apigee Portal API
 *
 * @param orgConfig
 * @constructor
 */
function Portal(orgConfig) {
    if (orgConfig.from.portalUrl !== 'https://mgmtui.apigee.net') {
        throw new Error("Portal APIs only work for Apigee Edge (Cloud)");
    }
    this.orgConfig = orgConfig;
    this.apigeeAccessToken = null;
}

/**
 * Generate the access token from the login.apigee.com
 *
 * @param cb
 */
Portal.prototype.generateAccessToken = function(cb){
    if (this.orgConfig.from.portalUrl !== 'https://mgmtui.apigee.net') {
        throw new Error("Access token can only be generated for Apigee Edge (Cloud)");
    }
    request({
        uri: "https://login.apigee.com/oauth/token",
        method: "POST",
        headers: {
            "Accept": "application/json"
        },
        auth: {
            user: "edgecli",
            pass: "edgeclisecret"
        },
        form: {
            "username": this.orgConfig.from.userid,
            "password": this.orgConfig.from.passwd,
            "grant_type": "password"
        },
        timeout: 5000,
    }, function (err, res, body) {
        var token = JSON.parse(body);
        if (token.error) {
            throw new Error(token.error);
        } else {
            //console.log(token.access_token);
            cb(token.access_token);
        }
    });
}

/**
 * Format the request for sending to the Portal API.
 *
 * This will also generate the access token if not already generated
 *
 * @param options
 * @param cb
 */
Portal.prototype.executePortalRequest = function (options, cb) {
    var currentObj = this;
    async.series({
        access_token : function(callback){
            /**
             * Check if the access token is available, if not generate one
             */
            if(currentObj.apigeeAccessToken != null) {
                callback(null, currentObj.apigeeAccessToken);
            } else {
                currentObj.generateAccessToken(function(token){
                    callback(null, token);
                });
            }
        }
    }, function(err, results){
        if(results.access_token) {
            currentObj.apigeeAccessToken = results.access_token;
            options['baseUrl'] = currentObj.orgConfig.from.portalUrl;
            if(!options['headers']) {
                options['headers'] = [];
            }
            if(!options['method']) {
                options['method'] = "GET";
            }
            options['headers']['Authorization'] = "Bearer " + currentObj.apigeeAccessToken;
            request(options, function(err,res,body){
                if(cb) {
                    cb(err, res, body);
                }
            });
        } else {
            throw new Error("Access token could not be generated");
        }
    })
}

/**
 * Get the all Portal sites
 *
 * @param cb
 */
Portal.prototype.getPortalSites = function (cb) {
    var currentobj = this;
    //console.log(currentobj);
    currentobj.executePortalRequest({
            uri: "/xapi/portals/api/sites",
            headers: {
                "Accept": "application/json, text/plain, */*",
                "X-Apigee-Org":currentobj.orgConfig.from.org
            },
        },
        function (err, res, body) {
            try {
                var body_json = JSON.parse(body);
            } catch (e) {
                console.log(res);
                throw e;
            }
            cb(body_json);
        });
}

/**
 * Get the all pages per site
 *
 * @param cb
 */
Portal.prototype.getPortalPages = function (cb, siteId) {
    var currentobj = this;

    currentobj.executePortalRequest({
            uri: `/xapi/portals/api/sites/${siteId}/pages`,
            headers: {
                "Accept": "application/json, text/plain, */*",
                "X-Apigee-Org":currentobj.orgConfig.from.org
            },
        },
        function (err, res, body) {
            try {
                var body_json = JSON.parse(body);
            } catch (e) {
                console.log(res);
                throw e;
            }
            cb(body_json);
        });
}

/**
 * Get customcss per site
 *
 * @param cb
 */
Portal.prototype.getPortalCustomCss = function (cb, siteId) {
    var currentobj = this;

    currentobj.executePortalRequest({
            uri: `/xapi/portals/api/sites/${siteId}/customcss`,
            headers: {
                "Accept": "application/json, text/plain, */*",
                "X-Apigee-Org":currentobj.orgConfig.from.org
            },
        },
        function (err, res, body) {
            try {
                var body_json = JSON.parse(body);
            } catch (e) {
                console.log(res);
                throw e;
            }
            cb(body_json);
        });
}

/**
 * Get all files per site
 *
 * @param cb
 */
Portal.prototype.getPortalFileList = function (cb, siteId) {
    var currentobj = this;

    currentobj.executePortalRequest({
            uri: `/xapi/portals/api/sites/${siteId}/file/list`,
            headers: {
                "Accept": "application/json, text/plain, */*",
                "X-Apigee-Org":currentobj.orgConfig.from.org
            },
        },
        function (err, res, body) {
            try {
                var body_json = JSON.parse(body);
            } catch (e) {
                console.log(res);
                throw e;
            }
            cb(body_json);
        });
}


/**
 * Get all menu items per site
 *
 * @param cb
 */
Portal.prototype.getPortalMenuItems = function (cb, siteId) {
    var currentobj = this;

    currentobj.executePortalRequest({
            uri: `/xapi/portals/api/sites/${siteId}/menuitems`,
            headers: {
                "Accept": "application/json, text/plain, */*",
                "X-Apigee-Org":currentobj.orgConfig.from.org
            },
        },
        function (err, res, body) {
            try {
                var body_json = JSON.parse(body);
            } catch (e) {
                console.log(res);
                throw e;
            }
            cb(body_json);
        });
}

/**
 * Get all apidocs per site
 *
 * @param cb
 */
Portal.prototype.getPortalApiDocs = function (cb, siteId) {
    var currentobj = this;

    currentobj.executePortalRequest({
            uri: `/xapi/portals/api/sites/${siteId}/apidocs`,
            headers: {
                "Accept": "application/json, text/plain, */*",
                "X-Apigee-Org":currentobj.orgConfig.from.org
            },
        },
        function (err, res, body) {
            try {
                var body_json = JSON.parse(body);
            } catch (e) {
                console.log(res);
                throw e;
            }
            cb(body_json);
        });
}

/**
 * Get api permissions per site
 *
 * @param cb
 */
Portal.prototype.getPortalApiPermissions = function (cb, siteId, apiId) {
    var currentobj = this;

    currentobj.executePortalRequest({
            uri: `/xapi/portals/api/sites/${siteId}/resource-entitlements/apis/${apiId}`,
            headers: {
                "Accept": "application/json, text/plain, */*",
                "X-Apigee-Org":currentobj.orgConfig.from.org
            },
        },
        function (err, res, body) {
            try {
                var body_json = JSON.parse(body);
            } catch (e) {
                console.log(res);
                throw e;
            }
            cb(body_json);
        });
}

/**
 * Get api permissions per site
 *
 * @param cb
 */
Portal.prototype.getPortalApiPermissions = function (cb, siteId, apiId) {
    var currentobj = this;

    currentobj.executePortalRequest({
            uri: `/xapi/portals/api/sites/${siteId}/resource-entitlements/apis/${apiId}`,
            headers: {
                "Accept": "application/json, text/plain, */*",
                "X-Apigee-Org":currentobj.orgConfig.from.org
            },
        },
        function (err, res, body) {
            try {
                var body_json = JSON.parse(body);
            } catch (e) {
                console.log(res);
                throw e;
            }
            cb(body_json);
        });
}

/**
 * Get page permissions per site
 *
 * @param cb
 */
Portal.prototype.getPortalPagePermissions = function (cb, siteId, pageId) {
    var currentobj = this;

    currentobj.executePortalRequest({
            uri: `/xapi/portals/api/sites/${siteId}/resource-entitlements/pages/${pageId}`,
            headers: {
                "Accept": "application/json, text/plain, */*",
                "X-Apigee-Org":currentobj.orgConfig.from.org
            },
        },
        function (err, res, body) {
            try {
                var body_json = JSON.parse(body);
            } catch (e) {
                console.log(res);
                throw e;
            }
            cb(body_json);
        });
}

// reference from specs lib

// /**
//  * Get the SpecId for the homeFolder and pass it to the callback function.
//  *
//  * @param cb
//  */
// Portal.prototype.getHomeFolderURI = function (cb) {
//     var currentobj = this;
//     currentobj.executePortalRequest({
//             uri: "/organizations/" + currentobj.orgConfig.org + "/specs/folder/home",
//             headers: {
//                 "Accept": "application/json, text/plain, */*"
//             },
//         },
//         function (err, res, body) {
//             try {
//                 var body_json = JSON.parse(body);
//             } catch (e) {
//                 console.log(res);
//                 throw e;
//             }
//             cb(body_json);
//         });
// }

// /**
//  * Get the contents of a folder given the folder Portal id
//  *
//  * @param folder_uri
//  * @param cb
//  */
// Portal.prototype.getFolderContents = function (folder_uri, cb) {
//     this.executePortalRequest({
//             uri: folder_uri,
//             headers: {
//                 "Accept": "application/json"
//             },
//             debug : true,
//         },
//         function (err, res, body) {
//             var contents = [];
//             if(err) {
//                 cb(contents);
//             } else {
//                 if(body != undefined) {
//                     var body_json = JSON.parse(body);
//                     for (var i = 0; i < body_json.contents.length; i++) {
//                         var e = body_json.contents[i];
//                         if (e.kind != 'Folder' && e.kind != 'Doc') {
//                             continue;
//                         }
//                         if (!contents[e.kind]) {
//                             contents[e.kind] = [];
//                         }
//                         contents[e.kind][e.name] = e.self;
//                     }
//                 }
//                 cb(contents);
//             }
//         });
// }

// /**
//  *
//  * Delete the entity for the given spec_uri
//  *
//  * @param uri
//  * @param cb
//  */
// Portal.prototype.deletePortalObject = function(uri, cb){
//     this.executePortalRequest({
//         method: "DELETE",
//         uri : uri
//     },cb);
// }

// /**
//  *  Delete the contents given the folder_uri
//  *
//  *  Callback function is called to return results
//  *
//  * @param folder_uri
//  * @param cb
//  */
// Portal.prototype.deleteFolderContents = function (folder_uri, cb){

//     var currentObj = this;

//     currentObj.getFolderContents(folder_uri, function(contents){

//         //folder is empty so return cb
//         if(Object.keys(contents).length == 0) {
//             if(cb){
//                 cb(folder_uri);
//             }
//         } else {
//             if(contents['Doc']) {
//                 async.forEach(Object.keys(contents['Doc']), function (name, callback) {
//                     var uri = contents['Doc'][name];
//                     currentObj.deletePortalObject(uri, function (err, res, body) {
//                         if (err) {
//                             callback(err);
//                         } else {
//                             callback();
//                         }
//                     });
//                 }, function (err) {
//                         if (err) {
//                             if (cb)
//                                 cb('error');
//                         } else {
//                             if(!contents['Folder']) {
//                                 if (cb)
//                                     cb(folder_uri);
//                             }
//                         }
//                     });
//             }
//             if (contents['Folder']) {
//                 async.forEach(Object.keys(contents['Folder']), function (name, callback) {
//                     var uri = contents['Folder'][name];
//                     currentObj.deleteFolderContents(uri, function (_folder_id) {
//                         if (_folder_id !== 'error') {
//                             currentObj.deletePortalObject(_folder_id, function (err, res, body) {
//                                 if (err) {
//                                     callback(err)
//                                 } else {
//                                     callback();
//                                 }
//                             });
//                         } else {
//                             callback('error');
//                         }
//                     });
//                 }, function (err) {
//                         if (err) {
//                             if (cb)
//                                 cb('error');
//                         } else {
//                             if (cb)
//                                 cb(folder_uri);
//                         }
//                     });
//             }
//         }
//     });

// }

// /**
//  * Purge all the contents in the spec store (including specs and folders)
//  *
//  * @param cb
//  */
// Portal.prototype.purgeEverything = function(cb){
//     var currentObj = this;
//     currentObj.getHomeFolderURI(function(json){
//         currentObj.deleteFolderContents(json.self, function () {
//             cb();
//         });
//     });
// }

// /**
//  * Create a folder in the given parent folder (referenced by the uri)
//  *
//  * @param parent_folder_uri
//  * @param folder_name
//  * @param cb
//  */
// Portal.prototype.createFolder = function (parent_folder_uri, folder_name, cb) {
//     var currentObj = this;
//     this.executePortalRequest({
//         method: "POST",
//         uri: '/organizations/' + currentObj.orgConfig.org + '/specs/folder',
//         json: {
//             name: folder_name,
//             folder: parent_folder_uri
//         },
//         headers: {
//             "Accept": "application/json"
//         }
//     }, function (err, res, body) {
//         var body_json = body;
//         cb(body_json);
//     });
// }

// /**
//  * Upload a spec to the specified parent folder
//  *
//  * @param parent_folder_id
//  * @param specName
//  * @param srcFile
//  * @param cb
//  */
// Portal.prototype.uploadSpecFile = function (parent_folder_id, specName, srcFile, cb){
//     var currentObj = this;

//     //Create a new spec and upload the file
//     currentObj.executePortalRequest({
//         uri: '/organizations/' + currentObj.orgConfig.org + '/specs/doc',
//         method: 'POST',
//         headers: {
//             "Accept": "application/json, text/plain, */*"
//         },
//         json: {
//             name: specName,
//             kind: "Doc",
//             folder: parent_folder_id
//         }
//     }, function (err, res, body) {
//         var body_json = body;
//         currentObj.executePortalRequest({
//             uri: body_json.content,
//             method: "PUT",
//             headers: {
//                 "content-type": "text/plain",
//             },
//             body: fs.readFileSync(srcFile)
//         }, function (err2, res2, body2) {
//             if (err2) {
//                 if(cb) {
//                     cb("Unable to upload [" + srcFile + "] to Portal");
//                 }
//             }
//             if(cb) {
//                 cb();
//             }
//         })
//     });
// }

// /**
//  * Upload local folder to spec store.
//  *
//  * @param folder_id - The uri of the folder to upload contents to
//  * @param path - Corresponding folder on the filesystem
//  */
// Portal.prototype.uploadDirectoryContents = function(folder_id, path){
//     var currentObj = this;
//     console.log("Uploading ->  " + path);
//     fs.lstat(path, function(err, stats){
//         if(stats.isDirectory()) {
//             fs.readdir(path, function (err, files) {
//                 files.forEach(function(entry){
//                     fs.lstat(path  + "/" + entry, function(err2, stats2){
//                         if(stats2.isDirectory()) {
//                             currentObj.createFolder(folder_id, entry, function(json){
//                                 currentObj.uploadDirectoryContents(json.id, path  + "/" + entry);
//                             });
//                         } else {
//                             if (entry.slice(-5) == '.yaml' || entry.slice(-5) == '.json') { //Only upload yaml or json files
//                                 var spec_name = entry.slice(0, -5); // remove the .yaml extension
//                                 currentObj.uploadSpecFile(folder_id, spec_name, path + "/" + entry);
//                             }
//                         }
//                     });
//                 })
//             });
//         }
//     });
// }

// /**
//  * Upload all files from local folder to spec store
//  *
//  * @param path
//  */
// Portal.prototype.uploadToPortal = function(path){
//     var currentObj = this;
//     currentObj.getHomeFolderURI(function(json){
//         currentObj.uploadDirectoryContents(json.id, path);
//     });
// }

// /**
//  * Download the contents of the folder to local machine
//  *
//  * @param folder_uri - ID of the folder in Portal
//  * @param path - local path to download the folder contents to
//  */
// Portal.prototype.downloadFolderContents = function(folder_uri, path){
//     var currentObj = this;

//     if (!fs.existsSync(path)){
//         fs.mkdirSync(path);
//     }
//     currentObj.getFolderContents(folder_uri, function(contents){
//         if(contents['Doc']){
//             /*
//              * Spec is named on the local file system as a combination of spec_uri and the spec name
//              *
//              * As of the writing of this utility the Portal API allows for multiple specs with same name.
//              *
//              */
//             Object.keys(contents['Doc']).forEach(function(key){
//                 currentObj.executePortalRequest({
//                     uri : contents['Doc'][key] + "/content",
//                     headers: {
//                         "Accept": "text/plain",
//                     }
//                 }, function(err, res, body) {
//                     fs.writeFile(path + "/" + key + ".yaml", body, function(err2){
//                         if (err2) throw err2;
//                     });
//                 });
//             });
//         }
//         if(contents['Folder']) {
//             Object.keys(contents['Folder']).forEach(function (key) {
//                 currentObj.downloadFolderContents(contents['Folder'][key], path + "/" + key);
//             });
//         }
//     })
// }

module.exports = Portal;