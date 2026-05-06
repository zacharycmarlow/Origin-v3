import { Router, type IRouter } from "express";
import healthRouter from "./health";
import readingsRouter from "./readings";
import userRouter from "./user";
import submissionsRouter from "./submissions";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/readings", readingsRouter);
router.use("/user", userRouter);
router.use("/submissions", submissionsRouter);

export default router;
