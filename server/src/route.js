import { Router } from 'express'
import userController from '../controllers/userController.js'

const api = Router()

api.get('/hello', (req, res) => {
  res.status(200).json({
    message: 'Hello ✅'
  })
})

//user
api.post('/user/google-sign', userController.googleSign)

export default api