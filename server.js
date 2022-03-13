/********************************************************************** 
*  WEB322 – Assignment 4
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.   
*  No part of this assignment has been copied manually or electronically from any other source 
*  (including web sites) or distributed to other students. 
*  
*  Name:   Tushar saini   Student ID:  100281203       Date: 9 march 2021
* 
*  Online (Heroku) URL: https://infinite-ocean-74019.herokuapp.com/

 
********************************************************************************/  
var express = require("express");
var app = express();
var path = require("path");
const jsonData = require('./blog-service');
const multer = require("multer")
const cloudinary = require('cloudinary').v2
const streamifier = require('streamifier')
const upload = multer();
const exphbs = require("express-handlebars")
const stripJs = require('strip-js');

app.use(function(req,res,next){
 let route = req.path.substring(1);
 app.locals.activeRoute = (route == "/") ? "/" : "/" + route.replace(/\/(.*)/, "");
 /* I founded above code to be more simple to use and understood that thing more so i replaced that with the one 
 that is given i.e :
  app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
  
  */
 app.locals.viewingCategory = req.query.category;
 next();
});


app.engine('.hbs', exphbs.engine({ 
    extname: '.hbs',
    helpers: { 
        navLink: function(url, options){
          return '<li' +
 ((url == app.locals.activeRoute) ? ' class="active" ' : '') +
 '><a href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        equal: function (lvalue, rvalue, options) {
 if (arguments.length < 3)
 throw new Error("Handlebars Helper equal needs 2 parameters");
 if (lvalue != rvalue) {
 return options.inverse(this);
 } else {
 return options.fn(this);
 }
},
safeHTML: function(context){
 return stripJs(context);
}
    }
}));


app.set('view engine', '.hbs');

var HTTP_PORT = process.env.PORT || 8080;

function onHttpStart() {
  console.log("Express http server listening on: " + HTTP_PORT);
}

app.use(express.static('public'));

app.get("/", function(req,res){
  res.redirect('/blog');
});

app.get('/blog', async (req, res) => {

    // This will obtain object to store for view's properties
    let viewData = {};

    try{

        // This will declare the empty array to hold the "post" objects
        let posts = [];

        //  if there's a "category" query, filter the returned posts by category
        if(req.query.category){


            // This will Obtain the published "posts" by category
            posts = await jsonData.getPublishedPostsByCategory(req.query.category);
        }else{



            // Thsi will Obtain the published "posts"
            posts = await jsonData.getPublishedPosts();
        }

        // This will sort the published posts by postDate
        posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));

        // This will get the latest post from the front of the list (element 0)
        let post = posts[0]; 

        // This will store the "posts" and "post" data in the viewData object 
        viewData.posts = posts;
        viewData.post = post;

    }catch(err){
        viewData.message = "no results";
    }

    try{
        // This will Obtain the full list of "categories"
        let categories = await jsonData.getCategories();

        // This will store the "categories" data in the viewData object (to be passed to the view)
        viewData.categories = categories;
    }catch(err){
        viewData.categoriesMessage = "no results"
    }

    // This will render the "blog" view with viewData in it.
    res.render("blog", {data: viewData})

});

app.get('/blog/:id', async (req, res) => {

    // This wiill Declare the object to storethe  properties for the view
    let viewData = {};

    try{

        // This will declare empty array to hold "post" objects
        let posts = [];

        // if there's a "category" query, filter the returned posts by category
        if(req.query.category){

            // This will Obtain the published "posts" categorically
            posts = await jsonData.getPublishedPostsByCategory(req.query.category);
        }else{
            // This will obtain the published "posts"
            posts = await jsonData.getPublishedPosts();
        }

        // This will sort from the postDate from published posts 
        posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));

        // store the "posts" and "post" data in the viewData object (to be passed to the view)
        viewData.posts = posts;

    }catch(err){
        viewData.message = "no results";
    }

    try{
        // This will Obtain the post by "id"
        viewData.post = await jsonData.getPostById(req.params.id);
    }catch(err){
        viewData.message = "no results"; 
    }

    try{
        // This will obtain the list of categories
        let categories = await jsonData.getCategories();

        // storing  the "categories" data
        viewData.categories = categories;
    }catch(err){
        viewData.categoriesMessage = "no results"
    }

    // this is to render the "blog" 
    res.render("blog", {data: viewData})
});

app.get("/about", function(req,res){
  res.render("about");
});




app.get("/posts", function (req, res) {
  var incomingRequest = req.query; 
  if(incomingRequest.category){
    jsonData.getPostsByCategory(req)
    .then((data) => {
      res.render("posts", {posts: data})
    }).catch((err) => {
      res.render("posts", {message: err});
    });
  }
  else if(incomingRequest.minDate){
    jsonData.getPostsByMinDate(req)
    .then((data) => {
      res.render("posts", {posts: data})
    }).catch((err) => {
      res.render("posts", {message: err});
    });
  }
  else{
    jsonData.getAllPosts()
    .then((data) => {
      res.render("posts", {posts: data})
    }).catch((err) => {
      res.render("posts", {message: err});
    });
  }
   
  });

app.get("/categories", function (req, res) {
   jsonData.getCategories()
     .then((data) => {
       res.render("categories", {categories: data});
     }).catch((err) => {
       res.render("categories", {message: err});
     });
 
  });
app.get("/posts/add", function(req,res){
  res.render("addPost");
});

app.post('/posts/add', upload.single("featureImage"), function (req, res, next) {
let streamUpload = (req) => {
    return new Promise((resolve, reject) => {
        let stream = cloudinary.uploader.upload_stream(
          (error, result) => {
            if (result) {
              resolve(result);
            } else {
              reject(error);
            }
          }
        );

       streamifier.createReadStream(req.file.buffer).pipe(stream);
    });
};

async function upload(req) {
    let result = await streamUpload(req);
    console.log(result);
    return result
};

upload(req).then((uploaded) =>{
  req.body.featureImage = uploaded.url; 
  jsonData.addPost(req.body); 
  res.redirect('/posts');
}); 
});

app.use((req, res) => {
    res.render("404");
});

app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500).send("Server Error");
  });

jsonData.initialize()
  .then(() => {
    app.listen(HTTP_PORT, onHttpStart);
  })
  .catch((err) => {
    console.log(`There was a problem invoking the initialize function ... ${err}`);
  });

cloudinary.config({
 cloud_name: 'tusharsaini',
 api_key: '412311519288715',
 api_secret: 'cbzMsEU4Hh6SQD0k1BGsbyh4RNE',
 secure: true
 });
