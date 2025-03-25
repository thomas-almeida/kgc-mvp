import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient()

async function getAllTeams(req, res) {
  try {
    const teams = await prisma.team.findMany({
      include: { president: true } // Inclui o presidente associado (opcional)
    });
    return res.json(teams);
  } catch (error) {
    console.error('Erro ao buscar todos os times:', error.message);
    return res.status(500).json({ error: 'Erro ao buscar times' });
  }
}

async function getPlayersByTeam(req, res) {
  try {
    const { teamId } = req.params;

    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        players: true, // Inclui os jogadores associados
      }
    });

    if (!team) {
      return res.status(404).json({ error: 'Time não encontrado' });
    }

    const result = {
      teamName: team.name,
      teamLogo: team.picture,
      players: team.players.map(player => ({
        name: player.name,
        position: player.position,
        overall: player.overall,
        games: player.games,
        goals: player.goals,
        assistants: player.assistants,
        yellowCards: player.yellowCards,
        redCards: player.redCards,
        picture: player.picture
      }))
    };

    return res.json(result);
  } catch (error) {
    console.error('Erro ao buscar jogadores por time:', error.message);
    return res.status(500).json({ error: 'Erro ao buscar jogadores do time' });
  }
}

export default {
  getAllTeams,
  getPlayersByTeam
}