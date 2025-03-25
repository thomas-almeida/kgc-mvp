import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function getAllPlayers(req, res) {
  try {
    const players = await prisma.player.findMany({
      include: { team: true } // Inclui o time associado (opcional)
    });
    return res.json(players);
  } catch (error) {
    console.error('Erro ao buscar todos os jogadores:', error.message);
    return res.status(500).json({ error: 'Erro ao buscar jogadores' });
  }
}

async function getAllPresidents(req, res) {
  try {
    const presidents = await prisma.president.findMany({
      include: { team: true } // Inclui o time associado (opcional)
    });
    return res.json(presidents);
  } catch (error) {
    console.error('Erro ao buscar todos os presidentes:', error.message);
    return res.status(500).json({ error: 'Erro ao buscar presidentes' });
  }
}

export default {
  getAllPlayers,
  getAllPresidents
}