var express = require('express');
var expressValidator = require('express-validator');
var mkdirp = require('mkdirp');
var fs = require('fs-extra');
var resizeImg = require('resize-img');

//Get product model
var Product=require('../models/products');

//Get category model
var Category=require('../models/category');


var router = express.Router();


//get products index
router.get('/',function(req,res){
        var count;
        
        Product.count(function(err,c){
            count = c;
        });
        
        Product.find(function(err,products){
            res.render('admin/products',{
                products: products,
                count: count
            });
        });
});

//get add product
router.get('/add-product',function(req,res){
        var title ="";
        var desc = "";
        var price="";
        
        Category.find(function(err,cat){
            res.render('admin/add_product',{
            title: title,
            desc: desc,
            price: price,
            categories: cat
        });
        });
        
});


//post add prouct
router.post('/add-product', function(req, res) {

	var imageFile = typeof req.files.image !== "undefined" ? req.files.image.name : "";
	
	req.checkBody('title', 'Title must have a value.').notEmpty();
	req.checkBody('desc', 'Description must have a value.').notEmpty();
	req.checkBody('price', 'Price must have a value.').isDecimal();
	req.checkBody('image', 'You must upload an image.').isImage(imageFile);

	var title = req.body.title;
	var key = title.replace(/\s+/g, '-').toLowerCase();
	var desc = req.body.desc;
	var price = req.body.price;
	var category = req.body.category;

	var errors = req.validationErrors();

	if (errors) {

		Category.find(function (err, categories) {
		
			res.render('admin/add_product',{
				errors: errors,
				title: title,
				desc: desc,
				categories: categories,
				price: price
			})

		})

	} else {

		Product.findOne({key: key}, function(err, product){
			if (product) {
				req.flash('danger', 'Product title exists, choose another.');
				
				Category.find(function (err, categories) {
		
					res.render('admin/add_product',{
						title: title,
						desc: desc,
						categories: categories,
						price: price
					})

				})

			} else {

				var price2 = parseFloat(price).toFixed(2);
				var product = new Product ({
					title: title,
					key: key,
					desc: desc,
					price: price2,
					category: category,
					image: imageFile
				});

				product.save(function (err) {
					if (err)
						return console.log(err);

					mkdirp('public/product_images/'+ product._id, function (err) {
						return console.log(err);
					});

					mkdirp('public/product_images/'+ product._id +'/gallery', function (err) {
						return console.log(err);
					});

					mkdirp('public/product_images/'+ product._id +'/gallery/thumbs', function (err) {
						return console.log(err);
					});

					if (imageFile != "") {
						var productImage = req.files.image;
						var path = 'public/product_images/'+ product._id +'/'+imageFile;

						productImage.mv(path, function (err) {
							return console.log(err);
						})
					}

					req.flash('success', 'Product added');
					res.redirect('/admin/products');
					
				})
			}
		})
	}

});

//get edit product
router.get('/edit-product/:id', function(req, res) {

	var errors;

	if (req.session.errors) 
		errors = req.session.errors;
	req.session.errors = null;
	
	Category.find(function (err, categories) {
		
		Product.findById(req.params.id, function (err, p) {
			if (err) {
				return console.log(err);
				res.redirect('/admin/products');
			} else {
				var galleryDir = 'public/product_images/'+p._id+'/gallery';
				var galleryImages = null;

				fs.readdir(galleryDir, function (err, files) {
					if (err) {
						return console.log(err);
					} else {
						galleryImages = files;

						res.render('admin/edit_product',{
							title: p.title,
							errors: errors,
							desc: p.desc,
							categories: categories, 
							category: p.category.replace(/\s+/g, '-').toLowerCase(),
							price: parseFloat(p.price).toFixed(2),
							image: p.image,
							galleryImages: galleryImages,
							id: p._id
						})
					}
				})
			}
		})

		
	}) 

});


/*
 * POST edit product
 */
router.post('/edit-product/:id', function (req, res) {

    var imageFile = typeof req.files.image !== "undefined" ? req.files.image.name : "";

    req.checkBody('title', 'Title must have a value.').notEmpty();
    req.checkBody('desc', 'Description must have a value.').notEmpty();
    req.checkBody('price', 'Price must have a value.').isDecimal();
    req.checkBody('image', 'You must upload an image').isImage(imageFile);

    var title = req.body.title;
    var key = title.replace(/\s+/g, '-').toLowerCase();
    var desc = req.body.desc;
    var price = req.body.price;
    var category = req.body.category;
    var pimage = req.body.pimage;
    var id = req.params.id;

    var errors = req.validationErrors();

    if (errors) {
        req.session.errors = errors;
        res.redirect('/admin/products/edit-product/' + id);
    } else {
        Product.findOne({key: key, _id: {'$ne': id}}, function (err, p) {
            if (err)
                console.log(err);

            if (p) {
                req.flash('danger', 'Product title exists, choose another.');
                res.redirect('/admin/products/edit-product/' + id);
            } else {
                Product.findById(id, function (err, p) {
                    if (err)
                        console.log(err);

                    p.title = title;
                    p.key = key;
                    p.desc = desc;
                    p.price = parseFloat(price).toFixed(2);
                    p.category = category;
                    if (imageFile != "") {
                        p.image = imageFile;
                    }

                    p.save(function (err) {
                        if (err)
                            console.log(err);

                        if (imageFile != "") {
                            if (pimage != "") {
                                fs.remove('public/product_images/' + id + '/' + pimage, function (err) {
                                    if (err)
                                        console.log(err);
                                });
                            }

                            var productImage = req.files.image;
                            var path = 'public/product_images/' + id + '/' + imageFile;

                            productImage.mv(path, function (err) {
                                return console.log(err);
                            });

                        }

                        req.flash('success', 'Product edited!');
                        res.redirect('/admin/products/edit-product/' + id);
                    });

                });
            }
        });
    }

});


/*
 * POST product gallery
 */
router.post('/product-gallery/:id', function (req, res) {

    var productImage = req.files.file;
    var id = req.params.id;
    var path = 'public/product_images/' + id + '/gallery/' + req.files.file.name;
    var thumbsPath = 'public/product_images/' + id + '/gallery/thumbs/' + req.files.file.name;

    productImage.mv(path, function (err) {
        if (err)
            console.log(err);

        resizeImg(fs.readFileSync(path), {width: 100, height: 100}).then(function (buf) {
            fs.writeFileSync(thumbsPath, buf);
        });
    });

    res.sendStatus(200);

});
//Exports
module.exports = router;