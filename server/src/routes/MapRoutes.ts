import express from 'express'
import * as MapController from './../controllers/MapController'

const router = express.Router()

router.post('/create', MapController.createMap)
router.post('/getmaps', MapController.getMaps)

export {router}