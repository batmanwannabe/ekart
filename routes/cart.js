var express = require('express');

var router = express.Router();


// Get Product model
var Product = require('../models/products');

var Category = require('../models/category');

//get all products
router.get('/', function (req, res) {
    Product.find(function (err, products) {
        if (err)
            console.log(err);
        res.render('all_products', {
            title: 'All Products',
            products: products
        });
    });
});


//get all products by category
router.get('/:category', function (req, res) {
    var categoryKey = req.params.category;
    Category.findOne({key: categoryKey}, function (err, category) {


        Product.find({category: categoryKey}, function (err, products) {
            if (err)
                console.log(err);
            res.render('cat_products', {
                title: category.title,
                products: products
            });
        });
    });
});

//get all products by category
router.get('/:category/:product', function (req, res) {
    var galleryImages = null;
    
    Product.findOne({key:req.params.product}, function(err,product){
        if(err){
            console.log(err);
        }else {
            var galleryDir = 'public/product_images/'+product._id+'/gallery';
            fs.readdir(galleryDir, function(err,files){
                if(err){
                    console.log(err);
                }else{
                    galleryImages = files;
                    res.render('product',{
                        title:product.title,
                        p:product,
                        galleryImages: galleryImages
                    })
                }
            })
            
        }
    })
});



//exports
module.exports = router;