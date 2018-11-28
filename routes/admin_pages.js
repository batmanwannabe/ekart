var express = require('express');
var expressValidator = require('express-validator');

//Get page model
var Page=require('../models/pages');


var router = express.Router();


//get pages index
router.get('/',function(req,res){
        Page.find({}).sort({sorting: 1}).exec(function(err,pages){
            res.render('admin/pages',{
                pages: pages
            });
        });
});

//get add page
router.get('/add-page',function(req,res){
        var title ="";
        var category = "";
        var content="";
        
        res.render('admin/add_page',{
            title: title,
            category: category,
            content: content
        });
});


//post add page
router.post('/add-page',function(req,res){        
        req.checkBody('title',' Title must have value').notEmpty();
        req.checkBody('content',' content must have value').notEmpty();
        
        var title = req.body.title;        
        //if(category =="") category = title.replace(/\s+/g, "-").toLowerCase();
        //else 
        var category = req.body.category;  //.replace(/\s+/g, "-").toLowerCase();
        var content = req.body.content;
        
        var errors = req.validationErrors();
        
        if(errors){
            res.render('admin/add_page',{
                errors: errors,
                title: title,
                category: category,
                content: content
            });
        } else {
            Page.findOne({category: category}, function(err,page){
                if(page){
                    req.flash('danger','choose unique key');
                    res.render('admin/add_page', {
                        title: title,
                        category: category,
                        content: content
                    });                    
                }else{
                    var page = new Page({
                        title: title,
                        category: category,
                        content:content,
                        sorting: 0
                    });
                    page.save(function(err){
                        if(err){
                            return console.log(err);                     
                           
                        }
                        req.flash('success', 'page added');
                        res.redirect('/admin/pages');
                    })
                }
            });       
        }
        res.render('admin/add_page',{
            title: title,
            category: category,
            content: content
        });
});

//Exports
module.exports = router;