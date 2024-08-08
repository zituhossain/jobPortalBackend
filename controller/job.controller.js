import Job from "../models/job.model.js";
import {
  errorHandler,
  responseHandler,
} from "../middlewares/responseHandler.js";

export const postJob = async (req, res) => {
  try {
    const {
      title,
      description,
      requirements,
      salary,
      experienceLevel,
      location,
      position,
      jobType,
      company,
      created_by,
    } = req.body;
    const userId = req.id;

    if (
      !title ||
      !description ||
      !requirements ||
      !salary ||
      !experienceLevel ||
      !location ||
      !position ||
      !jobType ||
      !company
    ) {
      return responseHandler(res, 400, "All fields are required", false);
    }

    const job = await Job.create({
      title,
      description,
      requirements: requirements.split(","),
      salary: parseInt(salary),
      experienceLevel,
      location,
      position,
      jobType,
      company,
      created_by: userId,
    });

    return responseHandler(res, 201, "Job created successfully", true, { job });
  } catch (error) {
    return errorHandler(res, error);
  }
};

export const getAllJobs = async (req, res) => {
  try {
    const keyword = req.query.keyword || "";
    const query = {
      $or: [
        { title: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
      ],
    };
    const jobs = await Job.find(query)
      .populate({
        path: "company",
      })
      .sort({ createdAt: -1 });

    if (!jobs) {
      return responseHandler(res, 404, "Jobs not found", false);
    }
    return responseHandler(res, 200, "Jobs fetched successfully", true, {
      jobs,
    });
  } catch (error) {
    return errorHandler(res, error);
  }
};

export const getJobById = async (req, res) => {
  try {
    const jobId = req.params.id;
    const job = await Job.findById(jobId);
    if (!job) {
      return responseHandler(res, 404, "Job not found", false);
    }
    return responseHandler(res, 200, "Job fetched successfully", true, {
      job,
    });
  } catch (error) {
    return errorHandler(res, error);
  }
};

export const getAdminJobs = async (req, res) => {
  try {
    const adminId = req.id;
    const jobs = await Job.find({ created_by: adminId });
    if (!jobs) {
      return responseHandler(res, 404, "Jobs not found", false);
    }
    return responseHandler(res, 200, "Jobs fetched successfully", true, {
      jobs,
    });
  } catch (error) {
    return errorHandler(res, error);
  }
};
