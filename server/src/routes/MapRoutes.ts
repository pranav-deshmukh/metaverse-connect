import express from 'express'
import * as MapController from './../controllers/MapController'

const router = express.Router()

router.post('/create', MapController.createMap)
router.post('/getmaps', MapController.getMaps)
router.post('/addPlayer', MapController.addPlayerToMap)

export {router}