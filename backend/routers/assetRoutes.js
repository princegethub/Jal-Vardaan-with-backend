const express = require('express');
const router = express.Router();
const {
  addAssetPhed,
  addQuantityToAssetPhed,
  listAssetsPhed,
  editAssetPhedQuantity,
} = require('../controller/assetController');

// Route to add a new asset
router.post('/add-asset', addAssetPhed);

// Route to add quantity to an existing asset
router.put('/add-quantity', addQuantityToAssetPhed);

// Route to list all assets
router.get('/', listAssetsPhed);

// Route to edit the quantity of an existing asset
router.put('/edit-quantity', editAssetPhedQuantity);

module.exports = router;
