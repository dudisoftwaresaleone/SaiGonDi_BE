import express from 'express'
import { verifyToken } from '~/middlewares/auth.middleware.js'
import { reportController } from '~/controllers/report.controller.js'
import { reportValidation } from '~/validations/report.validation.js'
import { generalValidation } from '~/validations/general.validation.js'

const Router = express.Router()

Router.route('/')
  .post(verifyToken, reportValidation.createNew, reportController.createReport)
  .get(verifyToken, reportController.getReports)

Router.route('/:id')
  .get(verifyToken, generalValidation.paramIdValidate, reportController.getReportById)
  .put(verifyToken, generalValidation.paramIdValidate, reportValidation.updateReport, reportController.updateReport)
  .delete(verifyToken, generalValidation.paramIdValidate, reportController.deleteReport)

export const reportRoute = Router
