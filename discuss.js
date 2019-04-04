/**
Author: John Stockey
Course: CSc 346
Section: 1

Fetches and displays data from an SQL table. Sets up the homepage and discussion
page html.
**/
"use strict";

(function() {
    let url = "http://localhost:3000/";
    window.onload = function() {
        startPage();
        document.getElementById("home").onclick = startPage;
    };

    /**
    Clears the page and displays the starting page.
    **/
    function startPage() {
        let dynamic = document.getElementById("dynamic");
        // Empty out dynmaic.
        dynamic.innerHTML = "";
        // Set up starting page.
        createDiscussion();
        getDiscussions();
    }

    /**
    Helper function for startPage. Creates the Create new Discussion section.
    **/
    function createDiscussion() {
        let dynamic = document.getElementById("dynamic");

        // Creating new discussions.
        let newComment = document.createElement("h2");
        let name = document.createElement("fieldset");
        let namePara = document.createElement("p");
        let nameText = document.createElement("textarea");
        let topic = document.createElement("fieldset");
        let topicPara = document.createElement("p");
        let topicText = document.createElement("textarea");
        let post = document.createElement("fieldset");
        let postPara = document.createElement("p");
        let postText = document.createElement("textarea");
        let button = document.createElement("button");
        let postStatus = document.createElement("p");

        // Fill elements with default text.
        newComment.innerHTML = "Create a new Discussion:";
        namePara.innerHTML = "Name:";
        topicPara.innerHTML = "Topic:";
        postPara.innerHTML = "Post:";
        button.innerHTML = "Submit";

        // Setup textareas with size and ids.
        nameText.rows = "1";
        nameText.cols = "15";
        nameText.id = "namefield";
        topicText.rows = "1";
        topicText.cols = "50";
        topicText.id = "topicfield";
        postText.rows = "10";
        postText.cols = "66";
        postText.id = "postfield";
        button.id = "submit";
        button.onclick = sendPost;
        postStatus.id = "poststatus";

        // Append elements in a specific design.
        name.appendChild(namePara);
        name.appendChild(nameText);
        topic.appendChild(topicPara);
        topic.appendChild(topicText);
        post.appendChild(postPara);
        post.appendChild(postText);
        dynamic.appendChild(newComment);
        dynamic.appendChild(name);
        dynamic.appendChild(topic);
        dynamic.appendChild(post);
        dynamic.appendChild(button);
        dynamic.appendChild(postStatus);
    }

    /**
    Helper function for startPage. Acquires currently posted discussions.
    **/
    function getDiscussions() {
        let dynamic = document.getElementById("dynamic");

        // Information tag.
        let h2 = document.createElement("h2");
        let hr = document.createElement("hr");
        h2.innerHTML = "Current Discussions:";
        dynamic.appendChild(hr);
        dynamic.appendChild(h2);

        // Builds posts if any.
        fetch(url)
            .then(checkStatus)
            .then(function(responseText) {
                let json = JSON.parse(responseText);
                let messages = json["messages"];

                // Build and add discussion divs using messages content.
                for (let i = 0; i < messages.length; i++) {
                    let newDiscussion = document.createElement("div");
                    let name = document.createElement("p");
                    let topic = document.createElement("h3");

                    // Add in content, define stylings and events.
                    name.innerHTML = messages[i]["name"];
                    topic.innerHTML = messages[i]["topic"];
                    newDiscussion.className = "discussion";
                    newDiscussion.onclick = getDiscussionPage;

                    // Append elements.
                    newDiscussion.appendChild(name);
                    newDiscussion.appendChild(topic);
                    document.getElementById("dynamic").appendChild(newDiscussion);
                }
            });
    }

    /**
    Acquires information from post fields and submits valid posts.
    **/
    function sendPost() {
        let message = {};
        let postStatus = document.getElementById("poststatus");
        let name = document.getElementById("namefield").value;
        let topic = document.getElementById("topicfield").value;
        let post = document.getElementById("postfield").value;

        // Clear postStatus.
        postStatus.innerHTML = "";
        // Conditional for adding a comment.
        if (name !== "" && topic !== "" && post !== "") {
            message["name"] = name;
            message["topic"] = topic;
            message["post"] = post;
            // Build the fetchOptions to be used.
            let fetchOptions = {
                method : 'POST',
                headers : {
                    'Accept': 'application/json',
                    'Content-Type' : 'application/json'
                },
                body : JSON.stringify(message)
            };
            // Attempt to post the message.
            fetch(url, fetchOptions)
                .then(checkStatus)
                .then(function(responseText) {
                    postStatus.innerHTML = responseText;
    		})
    		.catch(function(error) {
    			postStatus.innerHTML = error;
    		});
        }

        // Clear name and comment fields.
        document.getElementById("namefield").value = "";
        document.getElementById("topicfield").value = "";
        document.getElementById("postfield").value = "";
    }

    /**
    Acquires a discussions information including comment list.
    **/
    function getDiscussionPage() {
        let name = this.getElementsByTagName("p")[0].innerHTML;
        let topic = this.getElementsByTagName("h3")[0].innerHTML;
        let modifier = "?name="+name+"&topic="+topic;

        // Retrieves post and comment info from name and topic.
        fetch(url+modifier)
            .then(checkStatus)
            .then(function(responseText) {
                let json = JSON.parse(responseText);
                let name = json["name"];
                let topic = json["topic"];
                let post = json["post"];
                let comments = json["comments"];

                // Reset and change the display of the page.
                let dynamic = document.getElementById("dynamic");
                dynamic.innerHTML = "";

                // Create post elements and add content with styling.
                let postDiv = document.createElement("div");
                let postName = document.createElement("p");
                let postTopic = document.createElement("h3");
                let postContent = document.createElement("p");

                postDiv.id = "postDiv";
                postName.innerHTML = "By: " + name;
                postTopic.innerHTML = topic;
                postContent.innerHTML = post;

                postDiv.appendChild(postTopic);
                postDiv.appendChild(postName);
                postDiv.appendChild(postContent);
                dynamic.appendChild(postDiv);

                // Create the comments submission fields and previous comments.
                let commentsDiv = document.createElement("div");
                let replyHeader = document.createElement("h2");
                let replyField = document.createElement("fieldset");
                let replyText = document.createElement("textarea");
                let sendReply = document.createElement("button");
                let postStatus = document.createElement("p");
                let hr = document.createElement("hr");
                let commentUl = document.createElement("ul");

                commentsDiv.id = "commentsDiv";
                replyHeader.innerHTML = "Leave a Reply:";
                replyText.rows = "3";
                replyText.cols = "66";
                replyText.id = "commentfield";
                postStatus.id = "poststatus";
                sendReply.innerHTML = "Send Reply";
                sendReply.id = "postID";
                sendReply.name = name + topic;
                sendReply.onclick = postReply;

                replyField.appendChild(replyHeader);
                replyField.appendChild(replyText);
                commentsDiv.appendChild(replyField);
                commentsDiv.appendChild(sendReply);
                commentsDiv.appendChild(postStatus);
                commentsDiv.appendChild(hr);

                // Add comments.
                for (let i = 0; i < comments.length; i++) {
                    let newComment = document.createElement("li");
                    newComment.innerHTML = comments[i];
                    commentUl.appendChild(newComment);
                }

                commentsDiv.appendChild(commentUl);
                dynamic.appendChild(commentsDiv);
            });
    }

    /**
    Acquires information from commentfield and sends it to be stored
    by the server.
    **/
    function postReply() {
        let message = {};
        let postStatus = document.getElementById("poststatus");
        let comment = document.getElementById("commentfield").value;
        let postID = document.getElementById("postID").name;

        // Clear postStatus.
        postStatus.innerHTML = "";
        // Conditional for adding a comment.
        if (comment !== "") {
            message["postID"] = postID;
            message["comment"] = comment;
            // Build the fetchOptions to be used.
            let fetchOptions = {
                method : 'POST',
                headers : {
                    'Accept': 'application/json',
                    'Content-Type' : 'application/json'
                },
                body : JSON.stringify(message)
            };
            // Attempt to post the message.
            fetch(url, fetchOptions)
                .then(checkStatus)
                .then(function(responseText) {
                    postStatus.innerHTML = responseText;
    		})
    		.catch(function(error) {
    			postStatus.innerHTML = error;
    		});
        }

        // Clear comment fields.
        document.getElementById("commentfield").value = "";
    }

    /**
    Returns the response text if the status is in the 200s,
    otherwise rejects the promise with a message including the status.
    **/
    function checkStatus(response) {
        if (response.status >= 200 && response.status < 300) {
            return response.text();
        } else {
            return Promise.reject(new Error(response.text()));
        }
    }
})();
