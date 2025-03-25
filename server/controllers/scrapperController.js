import axios from 'axios';
import * as cheerio from 'cheerio';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function scrapeTeams(req, res) {
  try {
    const url = 'https://kingsleague.pro/pt/brazil/times';
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    let teams = [];

    for (const element of $('.team-card-container').toArray()) {
      const teamName = $(element).find('.team-name').text().trim();
      const presidentName = $(element).find('.team-president').text().trim();
      const presidentImage = $(element).find('.container-president-img img').attr('src');
      const teamUrl = $(element).find('a').attr('href');
      const teamLogo = $(element).find('.container-logo-img img').attr('src');

      const fullTeamUrl = teamUrl ? `https://kingsleague.pro${teamUrl}` : null;
      const fullTeamLogo = teamLogo ? `https://kingsleague.pro${teamLogo}` : null;
      const fullPresidentImage = presidentImage ? `https://kingsleague.pro${presidentImage}` : null;

      // Verifica se o time já existe no banco
      let existingTeam = await prisma.team.findFirst({ where: { name: teamName } });

      if (!existingTeam) {
        existingTeam = await prisma.team.create({
          data: {
            name: teamName,
            picture: fullTeamLogo,
            teamUrl: fullTeamUrl,
            players: {} // Ainda não temos os jogadores, fica vazio
          }
        });
      }

      // Verifica se o presidente já existe no banco
      let existingPresident = await prisma.president.findFirst({ where: { name: presidentName } });

      if (!existingPresident) {
        existingPresident = await prisma.president.create({
          data: {
            name: presidentName,
            picture: fullPresidentImage,
            team: {
              connect: { id: existingTeam.id } // Associa o presidente ao time
            }
          }
        });

        // Atualiza o time com a referência ao presidente
        await prisma.team.update({
          where: { id: existingTeam.id },
          data: { presidentId: existingPresident.id }
        });
      }

      teams.push({
        teamName,
        presidentName,
        presidentImage: fullPresidentImage,
        teamUrl: fullTeamUrl,
        teamLogo: fullTeamLogo
      });
    }

    return res.json({ teams });
  } catch (error) {
    console.error('Erro ao fazer scraping:', error.message);
    return res.status(500).json({ error: 'Erro ao buscar os dados' });
  }
}

async function scrapePlayersByTeam(req, res) {
  try {
    const { teamId } = req.params;

    // Buscar o time no banco de dados
    const team = await prisma.team.findUnique({ where: { id: teamId } });

    if (!team) {
      return res.status(404).json({ error: 'Time não encontrado' });
    }

    const { teamUrl } = team;

    if (!teamUrl) {
      return res.status(400).json({ error: 'O link do time não está disponível' });
    }

    // Fazer scraping da página do time
    console.log(`scrapping: ${teamUrl}`)
    const { data } = await axios.get(`${teamUrl}`);
    const $ = cheerio.load(data);

    let players = [];

    $('.player-card-container').each((_, element) => {
      const playerName = $(element).find('.player-name').text().trim();
      const playerPosition = $(element).find('.player-role').text().trim();
      const playerMedia = $(element).find('.stat-description-total:contains("Média")')
        .siblings('.stat-value').text().trim();

      const games = $(element).find('.stat-description:contains("Jogos")')
        .siblings('.stat-value').text().trim();
      const goals = $(element).find('.stat-description:contains("Gols")')
        .siblings('.stat-value').text().trim();
      const assists = $(element).find('.stat-description:contains("Assist.")')
        .siblings('.stat-value').text().trim();
      const yellows = $(element).find('.stat-description:contains("Amarelos")')
        .siblings('.stat-value').text().trim();
      const reds = $(element).find('.stat-description:contains("Vermelhos")')
        .siblings('.stat-value').text().trim();

      const playerImage = $(element).find('.container-player-img img').attr('src');

      players.push({
        name: playerName,
        position: playerPosition,
        overall: parseInt(playerMedia, 10) || 0,
        games: parseInt(games, 10) || 0,
        goals: parseInt(goals, 10) || 0,
        assistants: parseInt(assists, 10) || 0,
        yellowCards: parseInt(yellows, 10) || 0,
        redCards: parseInt(reds, 10) || 0,
        picture: `https://kingsleague.pro${playerImage}`,
        teamId: team.id,
        physics: 0,
        duels: 0,
        shootsOnGoal: 0,
        defenses: 0,
        pass: 0,
        hability: 0
      });
    });

    // Salvar jogadores no banco de dados
    for (const player of players) {
      let existingPlayer = await prisma.player.findFirst({
        where: { name: player.name, teamId: player.teamId }
      });

      if (!existingPlayer) {
        await prisma.player.create({ data: player });
      } else {
        await prisma.player.update({
          where: { id: existingPlayer.id },
          data: player
        });
      }
    }

    return res.json({ players });
  } catch (error) {
    console.error('Erro ao fazer scraping dos jogadores:', error.message);
    return res.status(500).json({ error: 'Erro ao buscar os dados dos jogadores' });
  }
}


export default {
  scrapeTeams,
  scrapePlayersByTeam
};
