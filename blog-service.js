const fs = require("fs");

var posts = [];
var categories = [];

module.exports.initialize = function(){
    return new Promise(function(resolve, reject){   /* This is where we can  place our code inside a "Promise" function */
        fs.readFile('./data/posts.json', 'utf8', (err, data) => {
            if (err) reject(err.message);
            posts = JSON.parse(data);  
            console.log(data);
            fs.readFile('./data/categories.json', 'utf8', (err, data) => {
                if (err) return reject(err.message);
                categories = JSON.parse(data);  
                console.log(data); 
                resolve();                 
           });
        });            
    });    
}

module.exports.addPost = function(postData)
{
    return new Promise(function(resolve, reject){
        if(postData.published===undefined)
        postData.published=false; 
        else
        postData.published=true;
    var currentDate = new Date(); 
    postData.postDate= currentDate.getFullYear()+"-"+(currentDate.getMonth()+1)+"-"+currentDate.getDate(); 
        postData.id=posts.length+1; 
        posts.push(postData); 
        resolve(postData); 
    })
}

module.exports.getAllPosts = function () {
    return new Promise(function (resolve, reject) {
        if (posts.length === 0) reject("no results returned");
        resolve(posts);
    }); 
}
     
module.exports.getPostsByCategory = function(req){
    const {category}= req.query; 
    return new Promise(function (resolve, reject) {
        var isSpecificCategory = posts.filter(function (post) {
            return post.category == category;
        });
        if (isSpecificCategory.length === 0) reject("no results returned");
        resolve(isSpecificCategory);
    });
}

module.exports.getPostsByMinDate = function(req){
    const {minDate} = req.query; 
    return new Promise(function (resolve, reject){
        const minimumDate = new Date(minDate); 
        var greaterThanDate = posts.filter(function (post){
            return (new Date(post.postDate)>=minimumDate); 
        }); 
        if(greaterThanDate.length === 0) reject("no results returned"); 
        resolve(greaterThanDate); 
    });
}

module.exports.getPostById = function(id){
    return new Promise(function (resolve, reject){
        var particularIdposts = posts.filter(function (post){
            return post.id == id; 
        }); 
        if(particularIdposts.length === 0) reject("no results returned"); 
        resolve(particularIdposts); 
    })
}

module.exports.getPublishedPosts = function () {
    return new Promise(function (resolve, reject) {
        var isPublished = posts.filter(function (post) {
            return post.published === true;
        });
        if (isPublished.length === 0) reject("no results returned");
        resolve(isPublished);
    });
}

module.exports.getPublishedPostsByCategory = function(category){
    return new Promise(function (resolve, reject) {
        var isCategoryPublished = posts.filter(function (post) {
            return post.category == category && post.published === true; 
        }); 
        if(isCategoryPublished === 0) reject("no results returned"); 
        resolve(isCategoryPublished);
    })
}

module.exports.getCategories = function () {
    return new Promise(function (resolve, reject) {

        if (categories.length === 0) reject("no results returned");
        resolve(categories);

    });
}




//end