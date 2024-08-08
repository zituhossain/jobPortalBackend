import {
  errorHandler,
  responseHandler,
} from "../middlewares/responseHandler.js";
import Company from "../models/company.model.js";

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
