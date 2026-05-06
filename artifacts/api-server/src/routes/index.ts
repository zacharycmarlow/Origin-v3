import { Router, type IRouter } from "express";
import healthRouter from "./health";
import readingsRouter from "./readings";
import userRouter from "./user";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/readings", readingsRouter);
router.use("/user", userRouter);

export default router;
