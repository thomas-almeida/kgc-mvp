import { Router } from 'express'
import userController from '../controllers/userController.js'
import scrapperController from '../controllers/scrapperController.js'
import teamController from '../controllers/teamController.js'
import playersController from '../controllers/playersController.js'

const api = Router()

api.get('/hello', (req, res) => {
  res.status(200).json({
    message: 'Hello ✅'
  })
})

//user
api.post('/user/google-sign', userController.googleSign)

//scrapping
api.get('/scrapper/teams/get-president', scrapperController.scrapeTeams)
api.get('/scrapper/teams/:teamId/get-players', scrapperController.scrapePlayersByTeam)

//Teams
api.get('/teams/get-all-teams', teamController.getAllTeams)
api.get('/teams/:teamId/get-players-by-team', teamController.getPlayersByTeam)

//Players
api.get('/players/get-all-players', playersController.getAllPlayers)
api.get('/players/presidents', playersController.getAllPresidents)


export default api