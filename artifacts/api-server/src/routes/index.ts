import { Router, type IRouter } from "express";
import healthRouter from "./health";
import loanmattersRouter from "./loanmatters";

const router: IRouter = Router();

router.use(healthRouter);
router.use(loanmattersRouter);

export default router;
