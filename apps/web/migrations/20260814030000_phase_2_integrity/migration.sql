CREATE UNIQUE INDEX "Order_subscriptionId_deliveryDate_key"
ON "Order"("subscriptionId", "deliveryDate");

CREATE UNIQUE INDEX "Subscription_one_open_per_user_key"
ON "Subscription"("userId")
WHERE "status" <> 'cancelled';
