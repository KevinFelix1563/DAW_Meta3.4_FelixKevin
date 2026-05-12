import db from '../../models/index.cjs';
import { Op } from 'sequelize';

const { Persona, Tarea, Tag } = db;

// Búsqueda: Tareas asociadas a una o varias Etiquetas
export const buscarTareasPorEtiquetas = async (req, res) => {
  try {
    const { tagsIds } = req.body; 

    const tareas = await Tarea.findAll({
      include: [
        {
          model: Tag,
          as: 'etiquetas',
          where: { id: { [Op.in]: tagsIds } }
        },
        { model: Persona, as: 'autor', attributes: ['nombre', 'email'] }
      ]
    });
    res.json({ success: true, data: tareas });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error en búsqueda avanzada de tareas' });
  }
};

// Usuarios asociados a una o varias etiquetas
export const buscarUsuariosPorEtiquetas = async (req, res) => {
  try {
    const { tagsIds } = req.body;

    const usuarios = await Persona.findAll({
      attributes: ['id', 'nombre', 'email', 'activo', 'rol'],
      include: [{
        model: Tarea,
        as: 'tareas',
        required: true, // Solo usuarios que sí tengan estas tareas
        include: [{
          model: Tag,
          as: 'etiquetas',
          where: { id: { [Op.in]: tagsIds } },
          required: true
        }]
      }]
    });
    res.json({ success: true, data: usuarios });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error en búsqueda avanzada de usuarios' });
  }
};

// Etiquetas asociadas a uno o varios Usuarios
export const buscarEtiquetasPorUsuarios = async (req, res) => {
  try {
    const { usuariosIds } = req.body;

    const etiquetas = await Tag.findAll({
      include: [{
        model: Tarea,
        as: 'tareas',
        required: true,
        where: { personaId: { [Op.in]: usuariosIds } },
        attributes: [] 
      }]
    });
    res.json({ success: true, data: etiquetas });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error en búsqueda avanzada de etiquetas' });
  }
};