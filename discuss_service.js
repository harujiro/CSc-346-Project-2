/**
Author: John Stockey
Course: CSc 337
Section: 1

Web service that stores and retrieves information from an SQL database.
Fields include name, topic, post, and comments.
**/
"use strict";

(function() {
    // Express. npm install express
    const express = require("express");
    const app = express();
    // Body Parser. npm install body-parser
    const bodyParser = require("body-parser");
    const jsonParser = bodyParser.json();
    // File System. npm install mysql
    const mysql = require("mysql");
    // Connection object.
    const con = mysql.createConnection({
        host: "jstockeydb.c8quwdsrzlz9.us-east-1.rds.amazonaws.com",
        database: "jstockeydb",
        user: "jstockey",
        password: "potatoapplesouls",
        debug: "true"
    });
    // Attempt to connect.
    con.connect(function(err) {
        if (err) throw err;
        console.log("Connected!");

        // Create discussions and posts tables if they don't exist.
        let createDiscussions = "CREATE TABLE IF NOT EXISTS discussions(" +
            "name VARCHAR(255) NOT NULL, topic VARCHAR(255) NOT NULL);";
        let createPosts = "CREATE TABLE IF NOT EXISTS posts(postID VARCHAR(255) " +
        "NOT NULL, post VARCHAR(255) NOT NULL DEFAULT '', comments VARCHAR(255) " +
        "NOT NULL DEFAULT '');";

        con.query(createDiscussions, function(err, results, fields) {
            if (err) throw err;
        });
        con.query(createPosts, function(err, results, fields) {
            if (err) throw err;
        });
    });

    app.use(function(req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers",
                   "Origin, X-Requested-With, Content-Type, Accept");
    	next();
    });

    app.use(express.static('public'));

    app.get('/', function (req, res) {
        let params = req.query;
        let name = params.name;
        let topic = params.topic;

    	// Build JSON.
    	let json = {};

        if (name && topic) { // Discussions page mode.
            console.log("Acquiring post and comments");
            let postID = name + topic;
            let sql = "SELECT post, comments FROM " +
                "posts WHERE postID='" + postID + "'";
            console.log(sql);

            con.query(sql, function (err, result, fields) {
                if (err) throw err;

                // Fill JSON with the retrieved info.
                json["name"] = name;
                json["topic"] = topic;
                let comments = [];
                let post = "";

                // Loop through result to retrieve information.
                for (let i = 0; i < result.length; i++) {
                    if (result[i]["post"]) {
                        json["post"] = result[i]["post"];
                    }
                    if (result[i]["comments"]) {
                        comments.push(result[i]["comments"]);
                    }
                }

                json["comments"] = comments;
                // Return json strigified.
                res.send(JSON.stringify(json));
            });
        } else { // Default start page.
            let messages = [];

            // Select fields and process.
            console.log("Acquiring name and topic");
            con.query("SELECT name, topic FROM discussions",
                function (err, result, fields) {
                    if (err) throw err;
                    // Loop through the rows of the results.
                    for (let i = 0; i < result.length; i++) {
                        let discussionInfo = {};
                        discussionInfo["name"] = result[i]["name"];
                        discussionInfo["topic"] = result[i]["topic"];
                        messages.push(discussionInfo);
                    }

                    // Add messages to json.
                    json["messages"] = messages;
                    // Return json strigified.
                    res.send(JSON.stringify(json));
                });
        }
    });

    app.post('/', jsonParser, function (req, res) {

        // Might need to debug comments stuff, and define stylings
        // for the discussions page. Possible if else depending on
        // if req.body.name returns null if name is not in req.


    	let name = req.body.name;
        let topic = req.body.topic;
        let post = req.body.post;
        let comment = req.body.comment;
        let postID = req.body.postID;

    	// Attempt to add values into discussions table.
        if (name && topic && post) {
            let postID = name + topic;

            // Attempt to update discussions.
            console.log("Attempting to update table 'discussions'");
            let sql = "INSERT INTO discussions (name, topic) VALUES ('" +
                name + "', '" + topic + "')";
            console.log(sql);
            con.query(sql, function (err, result) {
                if (err) {
                    console.log(err);
                    res.status(400);
                    res.send("There was an error in adding your discussion");
                }
                console.log("Name and topic added!");
            });

            // Attempt to update posts.
            sql = "INSERT INTO posts (postID, post) VALUES ('" +
                postID + "', '" + post + "')";
            console.log(sql);
            con.query(sql, function (err, result) {
                if (err) {
                    console.log(err);
                    res.status(400);
                    res.send("There was an error in adding your discussion");
                }
                console.log("Post added!");
            });

            res.send("Your discussion was added!");
        } else if (comment && postID) { // Attempt to add comment to posts.
            // Attempt to update posts comments.
            console.log("Attempting to update table 'posts'");
            let sql = "INSERT INTO posts (postID, comments) VALUES ('" +
                postID + "', '" + comment + "')";
            console.log(sql);
            con.query(sql, function (err, result) {
                if (err) {
                    console.log(err);
                    res.status(400);
                    res.send("There was an error in adding your discussion");
                }
                console.log("Post added!");
            });

            res.send("Your discussion was added!");
        }
    });

    app.listen(3000);
})();
