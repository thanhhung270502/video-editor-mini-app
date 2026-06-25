import { Router } from "express";
import { VideoEditorController } from "./video-editor.controller";

const router = Router();
const controller = new VideoEditorController();

router.post("/download", controller.download);
router.post("/export", controller.export);
router.get("/status/:taskId", controller.status);

export default router;
