const express = require("express");
const router = express.Router();

const paymentController = require("../controllers/payment");
const isAuth = require("../middleware/is-auth");

router.post("/", isAuth, paymentController.payment);

router.post("/subscribe", isAuth, paymentController.subscription);

router.post("/cancel", isAuth, paymentController.cancelSubscription);

router.post("/trial", isAuth, paymentController.freeTrial);

module.exports = router;
