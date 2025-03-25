import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'

const prisma = new PrismaClient()

// Função para gerar ID aleatório
const generateCustomId = () => {
  return crypto.randomBytes(12).toString('hex'); // Gera 24 caracteres hex
};

async function googleSign(req, res) {
  const { sub, email, name, picture } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({
      where: { googleSub: sub }
    });

    if (existingUser) {
      return res.json({ user: existingUser });
    }

    // Gera o novo ID customizado
    const customId = await generateCustomId();

    const newUser = await prisma.user.create({
      data: {
        id: customId, // ID customizado
        username: `user_${sub}`,
        googleSub: sub,
        email,
        name,
        picture
      }
    });

    res.status(201).json({ user: newUser });

  } catch (error) {
    console.error('Erro na autenticação pelo Google:', error);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
};

export default { googleSign }