import { reportService } from '../services/report.service.js';
import { StatusCodes } from 'http-status-codes';

const createReport = async (req, res, next) => {
  try {
    const reportData = {
      ...req.body,
      userId: req.user.id // Assuming user is authenticated
    };
    const report = await reportService.createReport(reportData);
    res.status(StatusCodes.CREATED).json({
      success: true,
      data: report
    });
  } catch (error) {
    next(error);
  }
};

const getReports = async (req, res, next) => {
  try {
    const reports = await reportService.getReports(req.query);
    res.status(StatusCodes.OK).json({
      success: true,
      data: reports
    });
  } catch (error) {
    next(error);
  }
};

const getReportById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const report = await reportService.getReportById(id);
    res.status(StatusCodes.OK).json({
      success: true,
      data: report
    });
  } catch (error) {
    next(error);
  }
};

const updateReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedReport = await reportService.updateReport(id, req.body);
    res.status(StatusCodes.OK).json({
      success: true,
      data: updatedReport
    });
  } catch (error) {
    next(error);
  }
};

const deleteReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    await reportService.deleteReport(id);
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Report deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const reportController = {
  createReport,
  getReports,
  getReportById,
  updateReport,
  deleteReport
};