import { Router, type IRouter } from "express";
import healthRouter from "./health";
import relayRouter from "./relay";
import vpsProxyRouter from "./vps-proxy";

const router: IRouter = Router();

router.use(healthRouter);
router.use(vpsProxyRouter);
router.use(relayRouter);

export default router;
