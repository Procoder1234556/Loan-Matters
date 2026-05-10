import { Router, type IRouter } from "express";
import healthRouter from "./health";
import loanmattersRouter from "./loanmatters";
import adminRouter from "./admin";
import agentsRouter from "./agents";

const router: IRouter = Router();

router.use(healthRouter);
router.use(loanmattersRouter);
router.use(agentsRouter);
router.use(adminRouter);

export default router;
