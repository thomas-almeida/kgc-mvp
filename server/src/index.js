import api from "./route.js"
import cors from 'cors'
import express from 'express'

const app = express()
const port = 3001

app.use(express.json())
app.use(cors())
app.use(api)

app.listen(port, () => {
  console.log(`KL ONLINE ✅`)
})