import { Router } from "express";
import * as fxn from "../../controllers/admin/cms-management/booking.controller";
import auth from "../../middleware/auth.middleware";

const router = Router();

router.post("/getAllBookings", auth, fxn.getAllBookings);
router.post("/updateBookingStatus", auth, fxn.updateBookingStatus);
router.post("/deleteBooking", auth, fxn.deleteBooking);

export default router;
