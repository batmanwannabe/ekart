var express = require('express');

var router = express.Router();


// Get Product model
var Product = require('../models/products');

var Category = require('../models/category');

/*
 * GET add product to cart
 */
router.get('/add/:product', function (req, res) {

    var key = req.params.product;

    Product.findOne({key: key}, function (err, p) {
        if (err)
            console.log(err);

        if (typeof req.session.cart == "undefined") {
            req.session.cart = [];
            req.session.cart.push({
                title: key,
                qty: 1,
                price: parseFloat(p.price).toFixed(2),
                image: '/product_images/' + p._id + '/' + p.image
            });
        } else {
            var cart = req.session.cart;
            var newItem = true;

            for (var i = 0; i < cart.length; i++) {
                if (cart[i].title == key) {
                    cart[i].qty++;
                    newItem = false;
                    break;
                }
            }

            if (newItem) {
                cart.push({
                    title: key,
                    qty: 1,
                    price: parseFloat(p.price).toFixed(2),
                    image: '/product_images/' + p._id + '/' + p.image
                });
            }
        }

        console.log(req.session.cart);
        req.flash('success', 'Product added!');
        res.redirect('back');
    });

});

/*
 * GET checkout page
 */
router.get('/checkout', function (req, res) {

    res.render('checkout', {
            title: 'Checkout',
            cart: req.session.cart
        });
    

});



//exports
module.exports = router;