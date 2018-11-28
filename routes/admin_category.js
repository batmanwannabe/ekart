var express = require('express');
//var expressValidator = require('express-validator');

//Get category model
var Category=require('../models/category');


var router = express.Router();


//get pages index
router.get('/',function(req,res){
    
        Category.find(function(err, categories){
            if(err) return console.log('error');
            res.render('admin/categories',{
                categories: categories
            });
        });
});

//get add category
router.get('/add-category',function(req,res){
        var title ="";
        
        res.render('admin/add_category',{
            title: title
        });
});


//post add category
router.post('/add-category',function(req,res){        
        req.checkBody('title',' Title must have value').notEmpty();
        
        var title = req.body.title;        
        //if(category =="") category = title.replace(/\s+/g, "-").toLowerCase();
        //else 
        var key = req.body.title;
        
        var errors = req.validationErrors();
        
        if(errors){
            res.render('admin/add_category',{
                errors: errors,
                title: title
            });
        } else {
            Category.findOne({key: key}, function(err,category){
                if(category){
                    req.flash('danger','choose unique category');
                    res.render('admin/add_category', {
                        title: title
                    });                    
                }else{
                    var category = new Category({
                        title: title
                    });
                    category.save(function(err){
                        if(err){
                            return console.log(err);                     
                           
                        }
                        req.flash('success', 'category added');
                        res.redirect('/admin/categories');
                    });
                }
            });       
        }
        res.render('admin/add_category',{
            title: title
        });
});

//Exports
module.exports = router;