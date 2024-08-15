import {
  errorHandler,
  responseHandler,
} from "../middlewares/responseHandler.js";
import Company from "../models/company.model.js";
import cloudinary from "../utils/cloudinary.js";
import getDataUri from "../utils/datauri.js";

export const registerCompany = async (req, res) => {
  try {
    const { companyName } = req.body;
    if (!companyName) {
      return responseHandler(res, 400, "Company name is required", false);
    }

    let company = await Company.findOne({ name: companyName });
    if (company) {
      return responseHandler(
        res,
        400,
        "You can't register same company",
        false
      );
    }

    company = await Company.create({
      name: companyName,
      userId: req.id,
    });

    return responseHandler(res, 201, "Company registered successfully", true, {
      company,
    });
  } catch (error) {
    return errorHandler(res, error);
  }
};

export const getCompany = async (req, res) => {
  try {
    const userId = req.id;
    const companies = await Company.find({ userId });
    if (!companies) {
      return responseHandler(res, 404, "Companies not found", false);
    }
    return responseHandler(res, 200, "Companies fetched successfully", true, {
      companies,
    });
  } catch (error) {
    return errorHandler(res, error);
  }
};

export const getCompanyById = async (req, res) => {
  try {
    const companyId = req.params.id;
    const company = await Company.findById(companyId);
    if (!company) {
      return responseHandler(res, 404, "Company not found", false);
    }
    return responseHandler(res, 200, "Company fetched successfully", true, {
      company,
    });
  } catch (error) {
    return errorHandler(res, error);
  }
};

export const updateCompany = async (req, res) => {
  try {
    const { name, description, website, location } = req.body;
    const companyId = req.params.id;
    const file = req.file;

    let cloudResponse;
    let logo;

    if (file) {
      const fileUri = getDataUri(file);
      cloudResponse = await cloudinary.uploader.upload(fileUri.content);

      logo = cloudResponse?.secure_url;
    }

    const updateData = { name, description, website, location };

    if (logo) {
      updateData.logo = logo;
    }

    const company = await Company.findByIdAndUpdate(companyId, updateData, {
      new: true,
    });
    if (!company) {
      return responseHandler(res, 404, "Company not found", false);
    }
    return responseHandler(res, 200, "Company updated successfully", true, {
      company,
    });
  } catch (error) {
    return errorHandler(res, error);
  }
};
