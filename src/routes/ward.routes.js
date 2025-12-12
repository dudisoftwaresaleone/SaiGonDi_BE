import { wardController } from '../controllers/ward.controller.js'
import { verifyToken } from '../middlewares/auth.middleware.js'
import express from 'express'

const Router = express.Router()

Router.get('/', wardController.getAll)
Router.get('/id/:id', wardController.getById)
Router.get('/name/:name', wardController.getByName)
Router.post('/:id/checkin', verifyToken, wardController.checkinWard)

export const wardRoute = Router
