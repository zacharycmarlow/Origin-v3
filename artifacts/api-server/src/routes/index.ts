import { Router, type IRouter } from "express";
import healthRouter from "./health";
import readingsRouter from "./readings";
import userRouter from "./user";
import submissionsRouter from "./submissions";
import waitlistRouter from "./waitlist";
import mediaRouter from "./media";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/readings", readingsRouter);
router.use("/user", userRouter);
router.use("/submissions", submissionsRouter);
router.use("/waitlist", waitlistRouter);
router.use("/media", mediaRouter);

export default router;
