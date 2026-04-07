import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import usersRouter from "./users";
import printersRouter from "./printers";
import listingsRouter from "./listings";
import ordersRouter from "./orders";
import reviewsRouter from "./reviews";
import sellersRouter from "./sellers";
import paymentsRouter from "./payments";
import messagesRouter from "./messages";
import adminRouter from "./admin";
import contestsRouter from "./contests";
import equipmentRouter from "./equipment";
import filesRouter from "./files";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(usersRouter);
router.use(printersRouter);
router.use(listingsRouter);
router.use(ordersRouter);
router.use(paymentsRouter);
router.use(messagesRouter);
router.use(adminRouter);
router.use(reviewsRouter);
router.use(sellersRouter);
router.use("/contests", contestsRouter);
router.use("/equipment", equipmentRouter);
router.use("/files", filesRouter);

export default router;
