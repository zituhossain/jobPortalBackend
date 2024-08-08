import express from "express";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";
import {
  applyJob,
  getApplicants,
  getAppliedJobs,
  updateStatus,
} from "../controller/application.controller.js";

const router = express.Router();

router.get("/apply/:id", isAuthenticated, applyJob);
router.get("/get", isAuthenticated, getAppliedJobs);
router.get("/applicants/:id", isAuthenticated, getApplicants);
router.post("/statusUpdate/:id", isAuthenticated, updateStatus);

export default router;
