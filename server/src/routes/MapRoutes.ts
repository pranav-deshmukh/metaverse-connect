import express from 'express'
import * as MapController from './../controllers/MapController'

const router = express.Router()

router.post('/create', MapController.createMap)

export {router}